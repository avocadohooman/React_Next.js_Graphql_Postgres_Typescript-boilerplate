import NavBar from "../components/NavBar";
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {

  const [result, post] = usePostsQuery();

  return (
    <>
      <NavBar/>
      <div>Hello world</div>
      {!result.data ? null : result.data.posts.map(post => <div key={post.id}>{post.title}</div>)} 
    </>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
