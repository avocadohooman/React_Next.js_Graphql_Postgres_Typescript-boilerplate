import { MyContext } from "server/Types/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    if (!context.req.session.userId) {
        throw new Error('user not authenticated'); 
    }

    return next();
}