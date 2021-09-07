import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import { usePostQuery } from '../../generated/graphql';
import Layout from '../../components/Layout';


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
                <div>loading ...</div>
            </Layout>
        )
    }
    return (
        <Layout> 
            {result.data?.post?.text}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);