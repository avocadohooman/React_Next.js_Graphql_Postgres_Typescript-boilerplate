import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {
  Link,
  Button, Stack, Box,
  Heading,
  Text
} from "@chakra-ui/react";
const Index = () => {

  const [result, post] = usePostsQuery({
    variables: {
      limit: 10
    }
    
  });

  return (
    <Layout>
      <NextLink href='createPost'>
        <Link>
          <Button>
            Create Post
          </Button>
        </Link>
      </NextLink>
      <Stack spacing={8}>
        {!result.data ? null : result.data.posts.map(post => 
            <Box p={5} key={post.id} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={4}>{post.text}</Text>
            </Box>
        )} 

      </Stack>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
