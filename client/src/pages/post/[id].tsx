import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';
import { Heading } from '@chakra-ui/layout';


const Post = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const [result, getPost] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    if (result.fetching) {
        return (
            <Layout> 
                <div>loading...</div>
            </Layout>
        )
    }
    if (result.error) {
        <Layout>
            <div>{result.error.message}</div>
        </Layout>
    }
    if (!result.data?.post) {
        return (
            <Layout>
                <div>Could not find post</div>
            </Layout>
        )
    }
    return (
        <Layout> 
            <Heading mb={4}>{result.data?.post?.title}</Heading>
            {result.data?.post?.text}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);