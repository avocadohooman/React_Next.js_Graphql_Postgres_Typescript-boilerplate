import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroConfig from './mikro-orm.config';

const main = async () => {
    const orm = await MikroORM.init(mikroConfig);
    await orm.getMigrator().up();
    
    //creates instance of a new Post object
    const post = orm.em.create(Post, {title: 'my first post'});

    //inserts new Post instance into database
    await orm.em.persistAndFlush(post);
};

main().catch((e) => {
    console.error(e);
});

