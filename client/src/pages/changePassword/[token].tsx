import { NextPage } from 'next';
import { Formik, Form } from 'formik';
import router, { useRouter } from 'next/router';
import React, { useState } from 'react';
import Wrapper from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';
import InputField from '../../components/InputField';
import {
    Box,
    Button,
    Flex,
    Link,
} from "@chakra-ui/react";
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from "next/link";
import { withApollo } from '../../utils/withApollo';

export const ChangePassword: NextPage = () => {
        const router = useRouter();
        const [ changePassword] = useChangePasswordMutation();
        const [tokenError, setTokenError] = useState("");

        return (
            <Wrapper variant='small'>
            <Formik 
            initialValues={{password: '',}}
            onSubmit={ async (values, {setErrors}) => {
                const response = await changePassword({variables: {password: values.password, 
                    token: typeof router.query.token === 'string' ? router.query.token : ''}});
                if (response.data?.changePassword.errors) {
                    const errorMap = toErrorMap(response.data?.changePassword.errors);
                    if ('token' in errorMap) {
                        setTokenError(errorMap.token);
                    }
                    setErrors(errorMap);
                } else if (response.data?.changePassword.user) {
                    router.push('/login');
                }   
            }}
            > 
            {({isSubmitting}) => (
                <Form> 
                    <InputField textarea={false} type='password' name='password' placeholder='New Password' label='Enter a new password'/>
                    {tokenError ? (
                        <Flex>
                            <Box mr={2} style={{ color: "red" }}>
                            {tokenError}
                            </Box>
                            <NextLink href="/forgotPassword">
                            <Link>click here to get a new one</Link>
                            </NextLink>
                        </Flex>
                        ) : null}
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Change Password</Button>
                </Form>

            )}   
            </Formik>
        </Wrapper>
        );
};


export default withApollo({ssr: false})(ChangePassword);