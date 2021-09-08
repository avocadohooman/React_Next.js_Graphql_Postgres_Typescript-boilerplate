import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react'
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from '../components/Layout';
import { useIsAuth } from '../utils/useIsAuth';


const CreatePost: React.FC<{}> = ({}) => {
    const [createPost] = useCreatePostMutation();
    const router = useRouter();
    useIsAuth();

    return (
        <Layout variant='small'>
            <Formik 
            initialValues={{title: '', text: '', points: 0}}
            onSubmit={ async (values, {setErrors}) => {
                const {errors} = await createPost({variables: {input: values}} )
                if (!errors) {
                    router.push('/');
                }
            }}
            > 
            {({isSubmitting}) => (
                <Form>
                    <InputField textarea={false}name='title' placeholder='Title' label='Title'/>
                    <Box mt={4}>
                        <InputField textarea={true} name='text' placeholder='text...' label='Text'/>
                    </Box>
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Create Post</Button>
                </Form>

            )}   
            </Formik>
        </Layout>
    );
};

export default CreatePost;