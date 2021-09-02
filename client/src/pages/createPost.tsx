import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useRouter } from 'next/router';
import React from 'react'
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useCreatePostMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import Layout from '../components/Layout';


const CreatePost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [result, createPost] = useCreatePostMutation();

    return (
        <Layout variant='small'>
            <Formik 
            initialValues={{title: '', text: '', points: 0}}
            onSubmit={ async (values, {setErrors}) => {
                // const response = await login(values);
                // if (response.data?.login.errors) {
                //     setErrors(toErrorMap(response.data.login.errors));
                // } else if (response.data?.login.user) {
                //     router.push('/');
                // }   
                console.log(values);
                await createPost({input: values})
                router.push('/');
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

export default withUrqlClient(createUrqlClient)(CreatePost);