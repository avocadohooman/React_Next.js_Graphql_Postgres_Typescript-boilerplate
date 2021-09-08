import React from 'react'
import { Formik, Form } from 'formik';
import {
    Box,
    Button,
    Link,
} from "@chakra-ui/react";
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

interface loginProps {

}

const initialValues = {
    username: '',
    password: '',
};


const login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [login] = useLoginMutation();

    return (
        <Wrapper variant='small'>
            <Formik 
            initialValues={{usernameOrEmail: '', password: ''}}
            onSubmit={ async (values, {setErrors}) => {
                const response = await login({variables: values});
                if (response.data?.login.errors) {
                    setErrors(toErrorMap(response.data.login.errors));
                } else if (response.data?.login.user) {
                    if (typeof router.query.next === 'string') {
                        router.push(router.query.next);

                    } else {
                        router.push("/");
                    }
                }   
            }}
            > 
            {({isSubmitting}) => (
                <Form>
                    <InputField textarea={false} name='usernameOrEmail' placeholder='Username or Email' label='Username or Email'/>
                    <Box mt={4}>
                        <InputField textarea={false} name='password' placeholder='Password' label='Password' type='password'/>
                    </Box>
                    <Box>
                        <NextLink href="/forgotPassword">
                                <Link pt={4}>Forgot Password?</Link>
                        </NextLink>
                    </Box>
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Login</Button>
                </Form>

            )}   
            </Formik>
        </Wrapper>
    );
};

export default login;