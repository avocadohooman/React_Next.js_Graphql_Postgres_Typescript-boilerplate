import { User } from "../entities/User";
import { MyContext } from "server/Types/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";

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
    @Mutation(() => UserResponse)
    async register(
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ) : Promise<UserResponse> {
        if (username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: 'username length must be greater than 2'
                }]
            }
        }
        if (password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: 'password length must be greater than 2'
                }]
            }
        }
        const hashedPassword = await argon2.hash(password);
        let user;
        try {
            const result= await (em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(
                {
                    username: username, 
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
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() {em, req}: MyContext
    ) : Promise<UserResponse> {
        const user = await em.findOne(User, {username: username.toLocaleLowerCase()});
        if (!user) {
            return {
                errors: [{
                    field: 'username',
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
