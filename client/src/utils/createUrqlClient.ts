import { dedupExchange, fetchExchange, stringifyVariables} from 'urql';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation } from '../generated/graphql';
import { stringify } from 'querystring';

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      resolvers: {
        Query: {
          posts: cursorPagination(),
        }
      },
      updates: {
        Mutation: {
          login: (result: LoginMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument}, (data: MeQuery | null) => {
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
            cache.updateQuery({ query: MeDocument}, (data: MeQuery | null) => {
              return {me: null};
            });
          },
          register: (result: RegisterMutation, args, cache, info) => {
            cache.updateQuery({ query: MeDocument}, (data: MeQuery | null) => {
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

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    // inspects the current cache of a query (entityKey)
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    console.log('all Field', allFields);
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolveFieldByKey(entityKey, fieldKey);
    console.log('fieldKey', fieldKey);
    info.partial = !isItInTheCache;
    console.log('isItInTheCache', isItInTheCache);
    let result: string[] = [];
    fieldInfos.forEach((fi) => {
      const data = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string[];
      result.push(...data);
    })
    return result;

  //   const visited = new Set();
  //   let result: NullArray<string> = [];
  //   let prevOffset: number | null = null;

  //   for (let i = 0; i < size; i++) {
  //     const { fieldKey, arguments: args } = fieldInfos[i];
  //     if (args === null || !compareArgs(fieldArgs, args)) {
  //       continue;
  //     }

  //     const links = cache.resolve(entityKey, fieldKey) as string[];
  //     const currentOffset = args[offsetArgument];

  //     if (
  //       links === null ||
  //       links.length === 0 ||
  //       typeof currentOffset !== 'number'
  //     ) {
  //       continue;
  //     }

  //     const tempResult: NullArray<string> = [];

  //     for (let j = 0; j < links.length; j++) {
  //       const link = links[j];
  //       if (visited.has(link)) continue;
  //       tempResult.push(link);
  //       visited.add(link);
  //     }

  //     if (
  //       (!prevOffset || currentOffset > prevOffset) ===
  //       (mergeMode === 'after')
  //     ) {
  //       result = [...result, ...tempResult];
  //     } else {
  //       result = [...tempResult, ...result];
  //     }

  //     prevOffset = currentOffset;
  //   }

  //   const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
  //   if (hasCurrentPage) {
  //     return result;
  //   } else if (!(info as any).store.schema) {
  //     return undefined;
  //   } else {
  //     info.partial = true;
  //     return result;
  //   }
  // };
}}