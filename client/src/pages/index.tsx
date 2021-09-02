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
import React from 'react';
const Index = () => {

  const [result, post] = usePostsQuery({
    variables: {
      limit: 10
    }
    
  });

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
          result.data?.posts.map(post => 
            <Box p={5} key={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          )
        )} 
      </Stack>
      <Flex justifyContent='center' mt={4} mb={10}>
        <Button>
            Load More
        </Button>
      </Flex>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
