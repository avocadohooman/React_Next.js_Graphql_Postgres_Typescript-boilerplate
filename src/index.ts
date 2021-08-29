import { MikroORM } from "@mikro-orm/core";
import { __prod__, PORT } from "./constants";
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);

    // runs migrator after table has been initialised
    await orm.getMigrator().up();

    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false,
        })
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({app});

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

