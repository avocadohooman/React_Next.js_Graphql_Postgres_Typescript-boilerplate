import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {
  Link,
  Button, Stack, Box,
  Heading,
  Text,
  Flex
} from "@chakra-ui/react";
import React, { useState } from 'react';
const Index = () => {

  const [variables, setVairables] = useState({limit: 10, cursor: null as null | string | undefined})
  const [result, post] = usePostsQuery({variables});

  if (!result.fetching && !result.data) {
    return <div> No posts available.</div>
  }

  return (
    <Layout>
      <Flex justifyContent='space-between' mb={4}>
        <Heading>LiReddit</Heading>
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
            <Box p={5} key={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          )
        )} 
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
