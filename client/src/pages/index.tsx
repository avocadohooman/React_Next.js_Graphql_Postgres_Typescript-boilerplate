import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { PostQuery, PostsQuery, useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {
  Link,
  Button, Stack, Box,
  Heading,
  Text,
  Flex,
  IconButton
} from "@chakra-ui/react";
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import UpdootSection from '../components/UpdootSection';
import { withApollo } from '../utils/withApollo';
const Index = () => {


  const meQuery = useMeQuery();
  const postQuery = usePostsQuery({variables: {
    limit: 15, 
    cursor: null
  }});

  const [deletePost] = useDeletePostMutation();

  if (!postQuery.loading && !postQuery.data) {
    return <div> No posts available.</div>
  }
  return (
    <Layout>
      <Flex justifyContent='space-between' mb={4}>
        <NextLink href='createPost'>
          <Link>
            <Button>
              Create Post
            </Button>
          </Link>
        </NextLink>
      </Flex>
      <Stack spacing={8}>
        {postQuery.loading && !postQuery.data ? (<div>loading</div>) : (
          postQuery.data!.posts.posts.map(post => 
            // this null check is important as we invalidate the cache, which sets delete items in the cache to null
            // hence, we need to return null otherwise we an error
            !post ? null : (
            <Flex p={5} key={post.id} shadow="md" borderWidth="1px" alignItems="center">
              <UpdootSection post={post}/>
              <Box flex={1}>
                <Flex flexDirection="column">
                  <Flex flexDirection="column">
                    <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                      <Link href="/post">
                          <Heading fontSize="xl">{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text>posted by {post.author.username}</Text>
                  </Flex>
                  <Flex>
                    <Text flex={1} mt={4}>{post.textSnippet}</Text>
                    { meQuery.data?.me?.id === post.author.id 
                      && 
                      <Box>
                        <NextLink href="/post/edit/[id]" as={`/post/edit/${post.id}`}>
                          <Link href="/post/edit">
                            <IconButton mr={2} ml={'autp'} icon={<EditIcon />} aria-label='Edit Post'></IconButton>
                          </Link>
                        </NextLink>
                        <IconButton ml={'autp'} icon={<DeleteIcon />} aria-label='Delete Post' onClick={() => 
                          deletePost( { 
                            variables:{ id: post.id }, 
                            update: (cache) => {
                            console.log('cache', cache);
                            cache.evict({id: 'Post:' + post.id});
                          }})
                        }>
                        </IconButton>
                      </Box>
                      }
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          )
        ))}  
      </Stack>
      {postQuery.data && postQuery.data.posts.hasMore ? (
              <Flex justifyContent='center' mt={4} mb={10}>
              <Button onClick={() => {
                postQuery.fetchMore({
                  variables: {
                    limit: postQuery.variables?.limit , 
                    cursor: postQuery.data?.posts.posts[postQuery.data?.posts.posts.length - 1].createdAt
                  },
                });
              }}isLoading={postQuery.loading}>
                  Load More
              </Button>
            </Flex>
      ) : null }
    </Layout>
  )
}

export default withApollo({ssr: true})(Index);
