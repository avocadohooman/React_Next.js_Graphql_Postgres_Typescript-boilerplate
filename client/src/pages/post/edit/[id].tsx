import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { withApollo } from '../../../utils/withApollo';


const EditPost = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const postQuery = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId
        }
    });
    const [updatePost] = useUpdatePostMutation();

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
    <Layout variant='small'>
        <Formik 
        initialValues={{title: postQuery.data?.post?.title, text: postQuery.data?.post?.text, points: 0}}
        onSubmit={ async (values, {setErrors}) => {
            const {errors} = await updatePost({variables: {id: intId, text: values.text, title: values.title}})
            if (!errors) {
                router.back();
            }
        }}
        > 
        {({isSubmitting}) => (
            <Form>
                <InputField textarea={false} name='title' placeholder={`${postQuery.data?.post?.title}`} label='Title'/>
                <Box mt={4}>
                    <InputField textarea={true} name='text' placeholder={`${postQuery.data?.post?.text}`} label='Text'/>
                </Box>
                <Button type='submit' isLoading={isSubmitting} mt={4}>Edit Post</Button>
            </Form>

        )}   
        </Formik>
    </Layout>
    );
};

export default withApollo({ssr: false})(EditPost);