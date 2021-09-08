import { dedupExchange, fetchExchange, stringifyVariables } from 'urql';
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import { CreatePostMutation, DeletePostMutationVariables, LoginMutation, LogoutMutation, MeDocument, MeQuery, PostsDocument, PostsQuery, RegisterMutation, VoteMutation, VoteMutationVariables } from '../generated/graphql';
import { stringify } from 'querystring';
import { gql } from '@urql/core';
import { isServer } from './isServer';


const invalidateAllPosts = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === "posts");
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {});
  });
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';

  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }

  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? {
        cookie
      } : undefined
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
            // pluse we invalidated also the paginated items, so all items are fetched freshly from the network
            invalidateAllPosts(cache);
          },
          deletePost: (_result, args, cache, info) => {
            cache.invalidate({__typename: 'Post', id: (args as DeletePostMutationVariables).id});
          },
          vote: (result: VoteMutation, args, cache, info) => {
            const { postId, value } = args as VoteMutationVariables;
            const data = cache.readFragment(
              gql`
                fragment _ on Post {
                  id
                  points
                  voteStatus
                }
              `,
              { id: postId }
            ); // Data or null
            if (data) { 
              if (data.voteStatus === value) {
                return ;
              }
                const newPointValue = data.points + (!data.voteStatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPointValue, voteStatus: value }
                );
            }
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
}};

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