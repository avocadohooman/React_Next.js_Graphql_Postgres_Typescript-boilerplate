import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react'
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { usePostQuery, useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';


const EditPost = ({}) => {
    const router = useRouter();
    const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
    const [result, getPost] = usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId
        }
    });
    const [updateResult, updatePost] = useUpdatePostMutation();

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
    <Layout variant='small'>
        <Formik 
        initialValues={{title: result.data?.post?.title, text: result.data?.post?.text, points: 0}}
        onSubmit={ async (values, {setErrors}) => {
            const {error} = await updatePost({id: intId, text: values.text, title: values.title})
            if (error?.message.includes('not')) {
                router.replace('/login'); // resets route, instead of adding a new instance to router history
            }
            if (!error) {
                router.back();
            }
        }}
        > 
        {({isSubmitting}) => (
            <Form>
                <InputField textarea={false} name='title' placeholder={`${result.data?.post?.title}`} label='Title'/>
                <Box mt={4}>
                    <InputField textarea={true} name='text' placeholder={`${result.data?.post?.text}`} label='Text'/>
                </Box>
                <Button type='submit' isLoading={isSubmitting} mt={4}>Edit Post</Button>
            </Form>

        )}   
        </Formik>
    </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);