import { NextPage } from 'next';
import { Formik, Form } from 'formik';
import router, { useRouter } from 'next/router';
import React from 'react';
import Wrapper from '../../components/Wrapper';
import { toErrorMap } from '../../utils/toErrorMap';
import login from '../login';
import InputField from '../../components/InputField';
import {
    Box,
    Button,
} from "@chakra-ui/react";
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

export const ChangePassword: NextPage<{token: string}> = ({token}) => {
        const router = useRouter();
        const [result, changePassword] = useChangePasswordMutation();

        return (
            <Wrapper variant='small'>
            <Formik 
            initialValues={{password: '',}}
            onSubmit={ async (values, {setErrors}) => {
                const response = await changePassword({password: values.password, token: token});
                if (response.data?.changePassword.errors) {
                    setErrors(toErrorMap(response.data?.changePassword.errors));
                } else if (response.data?.changePassword.user) {
                    router.push('/login');
                }   
            }}
            > 
            {({isSubmitting}) => (
                <Form> 
                    <InputField type='password' name='password' placeholder='New Password' label='Enter a new password'/>
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Change Password</Button>
                </Form>

            )}   
            </Formik>
        </Wrapper>
        );
};

ChangePassword.getInitialProps = ({query}) => {
    return {
        token: query.token as string
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword);