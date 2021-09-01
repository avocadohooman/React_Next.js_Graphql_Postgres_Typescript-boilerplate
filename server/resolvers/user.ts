import { User } from "../entities/User";
import { MyContext } from "server/Types/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFLIX } from "../constants";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() {em, redis} : MyContext
    ) {
        const user = await em.findOne(User, {email})
        if (!user) {
            return true;
        }
        const token = v4();
        await redis.set(FORGET_PASSWORD_PREFLIX + token, user.id, 'ex', 1000 * 60 * 60 * 24); // one day
    
        const resetPage = `<a href="http://localhost:3000/changePassword/${token}">click here</a>`
        await sendEmail(email, resetPage)
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('password') password: string,
        @Arg('token') token: string,
        @Ctx() {em, redis} : MyContext
    ): Promise<UserResponse> {
        if (password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password length must be greater than 2'
                }]
            }
        }
        const userId = await redis.get(FORGET_PASSWORD_PREFLIX + token);
        if (!userId) {
            return {
                errors: [{
                    field: 'token',
                    message: 'token expired'
                }]
            }
        }

        const user = await em.findOne(User, {id: parseInt(userId)});
        if (!user) {
            return {
                errors: [{
                    field: 'token',
                    message: 'user no longer exists'
                }]
            }
        }
        const hashedPassword = await argon2.hash(password);
        user.password = hashedPassword;
        await em.persistAndFlush(user);
        await redis.del(FORGET_PASSWORD_PREFLIX + token);
        return {user};
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('username') username: string,
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ) : Promise<UserResponse> {
        const validationError = validateRegister(username, email, password);
        if (validationError) {
            return validationError;
        }
        const hashedPassword = await argon2.hash(password);
        let user;
        try {
            const result = await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: username, 
                    email: email,
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ).returning("*");
            user = result[0];
        } catch (error) {
            // duplicate user rrro
            if (error.code === '23505' || error.detail.includes('already exists')) {
                return {
                    errors: [{
                        field: 'username',
                        message: 'user already exists'
                    }]
                };
            }
            return error.message;
        }
        req.session.userId = user.id;
        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ) : Promise<UserResponse> {
        const user = await em.findOne(User, usernameOrEmail.includes('@') 
                                            ? {email: usernameOrEmail.toLocaleLowerCase()}
                                            : {username: usernameOrEmail.toLocaleLowerCase()});
        if (!user) {
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: `username or password incorrect`,
                }]
            };
        }
        const valid = await argon2.verify(user.password, password);
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: 'username or password incorrect',
                }]
            };
        }

        //sets session cookie with userid
        req.session.userId = user.id;
        return {
            user,
    }
    };

    @Mutation(() => Boolean)
        logout(
            @Ctx() {req, res} : MyContext
        ) {
            //req session destroys redis session/cookie
            return new Promise(resolve => req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return ;
                } else {
                    // destroys client side cookie
                    resolve(true);
                }
            }))
        };

    @Query(() => User, {nullable: true})
        me(@Ctx() {em, req }: MyContext) {
            if (!req.session.userId) {
                return null;
            }
            return em.findOne(User, {id: req.session.userId});
    };
}
