import React from 'react'
import { Formik, Form } from 'formik';
import {
    Box,
    Button,
} from "@chakra-ui/react";
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface loginProps {

}

const initialValues = {
    username: '',
    password: '',
};


const login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [result, login] = useLoginMutation();

    return (
        <Wrapper variant='small'>
            <Formik 
            initialValues={{username: '', password: ''}}
            onSubmit={ async (values, {setErrors}) => {
                const response = await login(values);
                if (response.data?.login.errors) {
                    setErrors(toErrorMap(response.data.login.errors));
                } else if (response.data?.login.user) {
                    router.push('/');
                }   
            }}
            > 
            {({isSubmitting}) => (
                <Form>
                    <InputField name='username' placeholder='Username' label='Username'/>
                    <Box mt={4}>
                        <InputField name='password' placeholder='Password' label='Password' type='password'/>
                    </Box>
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Login</Button>
                </Form>

            )}   
            </Formik>
        </Wrapper>
    );
};

export default login;