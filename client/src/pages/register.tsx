import React from 'react'
import { Formik, Form } from 'formik';
import {
    Box,
    Button,
} from "@chakra-ui/react";
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface registerProps {

}

const initialValues = {
    username: '',
    password: '',
};

const Register: React.FC<registerProps> = ({}) => {
        const router = useRouter();
        const [result, register] = useRegisterMutation();

        return (
            <Wrapper variant='small'>
                <Formik 
                initialValues={{username: '', password: ''}}
                onSubmit={ async (values, {setErrors}) => {
                    const response = await register(values);
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors));
                    } else if (response.data?.register.user) {
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
                        <Button type='submit' isLoading={isSubmitting} mt={4}>Register</Button>
                    </Form>

                )}   
                </Formik>
            </Wrapper>
        );
};

export default Register;