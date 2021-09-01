import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { SessionData } from 'express-session'
import Redis from 'ioredis';

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request & {session: SessionData},
    res: Response,
    redis: Redis.Redis
}

declare module 'express-session' {
 interface SessionData {
    [key: string]: any;
  }
}
