import { Box, Button } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { Formik, Form } from 'formik';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
        const [result, forgotPassword] = useForgotPasswordMutation();
        const [complete, setComplete] = useState(false);
        const router = useRouter();

        return (
            <Wrapper variant='small'>
            <Formik 
            initialValues={{email: ''}}
            onSubmit={ async (values) => {
                await forgotPassword(values);  
                setComplete(true);
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            }}
            > 
            {({isSubmitting}) => complete ? (
                <Box>
                if an account with that email exists, we sent you can email
                </Box>
                ) :(
                <Form>
                    <InputField name='email' placeholder='Email' label='Enter your Email'/>
                    <Button type='submit' isLoading={isSubmitting} mt={4}>Forgot Password</Button>
                </Form>

            )}   
            </Formik>
            </Wrapper>
        );
};

export default ForgotPassword;