import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
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
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from '@chakra-ui/icons';
import UpdootSection from '../components/UpdootSection';
const Index = () => {

  const [variables, setVairables] = useState({
    limit: 15, 
    cursor: null as null | string | undefined
  });
  const [whoIs, me] = useMeQuery();
  const [result, post] = usePostsQuery({variables});
  const [deleteResult, deletePost] = useDeletePostMutation();

  if (!result.fetching && !result.data) {
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
        {result.fetching && !result.data ? (<div>loading</div>) : (
          result.data!.posts.posts.map(post => 
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
                    { whoIs.data?.me?.id === post.author.id && 
                        <IconButton ml={'autp'} icon={<DeleteIcon />} aria-label='Delete Post' onClick={() => 
                          deletePost({ id: post.id })
                        }>
                        </IconButton>
                      }
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          )
        ))}  
      </Stack>
      {result.data && result.data.posts.hasMore ? (
              <Flex justifyContent='center' mt={4} mb={10}>
              <Button onClick={() => {
                setVairables({
                  limit: variables.limit , 
                  cursor: result.data?.posts.posts[result.data?.posts.posts.length - 1].createdAt
                })
              }}isLoading={result.fetching}>
                  Load More
              </Button>
            </Flex>
      ) : null }
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
