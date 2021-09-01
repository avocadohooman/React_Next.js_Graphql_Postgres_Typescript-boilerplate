import { dedupExchange, fetchExchange} from 'urql';
import { cacheExchange } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      updates: {
        Mutation: {
          login: (result: LoginMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument}, (data: MeQuery) => {
              if (result.login.errors) {
                return data;
              } else {
                return {
                  me: result.login.user,
                }
              }
            });
          },
          logout: (result: LogoutMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument}, (data: MeQuery) => {
              return {me: null};
            });
          },
          register: (result: RegisterMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument}, (data: MeQuery) => {
              if (result.register.errors) {
                return data;
              } else {
                return {
                  me: result.register.user,
                }
              }
            });
          }
        }
      }
    }), ssrExchange, fetchExchange], 
});

