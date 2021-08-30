import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { SessionData } from 'express-session'

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request & {session: SessionData},
    res: Response,
}

declare module 'express-session' {
 interface SessionData {
    [key: string]: any;
  }
}
