import { dedupExchange, fetchExchange, stringifyVariables} from 'urql';
import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { CreatePostMutation, LoginMutation, LogoutMutation, MeDocument, MeQuery, PostsDocument, PostsQuery, RegisterMutation } from '../generated/graphql';
import { stringify } from 'querystring';

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [dedupExchange, cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination(),
        }
      },
      updates: {
        Mutation: {
          createPost: (_result, args, cache, info) => {
            //here we invalidate the cache after creating a post, and fetch all posts again + populate the cache
            cache.invalidate('Query', 'posts', {
                  limit: 15
              });
          },
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
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
    const isItInTheCache = cache.resolve(cache.resolveFieldByKey(entityKey, fieldKey) as string, 'posts');
    info.partial = !isItInTheCache;
    
    let result: string[] = [];
    let hasMore: boolean = true;

    fieldInfos.forEach((fi) => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const posts = cache.resolve(key, 'posts') as string[];
      const _hasMore = cache.resolve(key, 'hasMore');
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      result.push(...posts);
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: result
    };
}}