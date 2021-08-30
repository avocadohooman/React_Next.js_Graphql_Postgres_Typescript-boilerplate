import { Options } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from 'path';
import { User } from "./entities/User";

const mikroConfig: Options =  {
    migrations: {
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
    },
    entities: [ Post, User ],
    dbName: 'lireddit',
    debug: !__prod__,
    type: 'postgresql'
};

export default mikroConfig;