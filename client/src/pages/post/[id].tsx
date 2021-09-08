import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading } from '@chakra-ui/layout';
import { withApollo } from '../../utils/withApollo';


const Post = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const postQuery = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId
        }
    });
    if (postQuery.loading) {
        return (
            <Layout> 
                <div>loading...</div>
            </Layout>
        )
    }
    if (postQuery.error) {
        <Layout>
            <div>{postQuery.error.message}</div>
        </Layout>
    }
    if (!postQuery.data?.post) {
        return (
            <Layout>
                <div>Could not find post</div>
            </Layout>
        )
    }
    return (
        <Layout> 
            <Heading mb={4}>{postQuery.data?.post?.title}</Heading>
            {postQuery.data?.post?.text}
        </Layout>
    );
};

export default withApollo({ssr: true})(Post);