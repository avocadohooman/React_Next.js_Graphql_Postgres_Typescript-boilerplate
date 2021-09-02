import NavBar from "../components/NavBar";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import Layout from "../components/Layout";
import NextLink from "next/link";
import {
  Link,
  Button
} from "@chakra-ui/react";
const Index = () => {

  const [result, post] = usePostsQuery();

  return (
    <Layout>
      <NextLink href='createPost'>
        <Link>
          <Button>
            Create Post
          </Button>
        </Link>
      </NextLink>
      <div>Hello world</div>
      {!result.data ? null : result.data.posts.map(post => <div key={post.id}>{post.title}</div>)} 
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
