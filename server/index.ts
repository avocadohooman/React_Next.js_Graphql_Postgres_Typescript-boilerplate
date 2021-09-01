import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT, COOKIE_NAME } from "./constants";
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import dotenv from 'dotenv';
import cors from 'cors';
import { sendEmail } from "./utils/sendEmail";
import { User } from "./entities/User";

const corsOption = { origin: "http://localhost:3000", credentials: true, }

const main = async () => {
    
    const orm = await MikroORM.init(mikroConfig);
    // runs migrator after table has been initialised
    await orm.getMigrator().up();

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    dotenv.config();

    // app.use(cors(corsOption));

    // setting up express-session config from official documentation
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ 
                client: redis,
                disableTouch: true,
            
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365* 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', // csrf token
                secure: __prod__ // set to prod when ready
            },
            saveUninitialized: false,
            secret: 'dklajd;aj2ljlmd.asmkdal',
            resave: false,
        })
    );


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({ em: orm.em, req, res, redis })
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: {origin: 'https://studio.apollographql.com', credentials: true }});
    // apolloServer.applyMiddleware({ app, cors: false});

    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });

    //creates instance of a new Post object
    // const post = orm.em.create(Post, {title: 'my first post'});

    //inserts new Post instance into database
    // await orm.em.persistAndFlush(post);
};

main().catch((e) => {
    console.error(e);
});

