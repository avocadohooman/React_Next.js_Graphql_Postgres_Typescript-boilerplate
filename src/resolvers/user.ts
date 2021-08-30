import { User } from "../entities/User";
import { MyContext } from "src/Types/types";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2';

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
        const user = em.create(User, {
            username: username, 
            password: hashedPassword
        });
        try {
            await em.persistAndFlush(user);
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
    };
}
}
