import React from 'react'
import { Formik, Form } from 'formik';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
    Box,
    Button,
} from "@chakra-ui/react";
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { useMutation } from 'urql';

interface registerProps {

}

const initialValues = {
    username: '',
    password: '',
};

const REGISTER_MUT = `
    mutation Register($username: String!, $password: String!) {
        register(password: $password, username: $username) {
        errors {
            field
            message
        }
        user {
            id
            username
        }
        }
    }
`

const Register: React.FC<registerProps> = ({}) => {

        const [result, register] = useMutation(REGISTER_MUT);

        return (
            <Wrapper variant='small'>
                <Formik 
                initialValues={{username: '', password: ''}}
                onSubmit={ async (values) => {
                    console.log(values);
                    const response = await register(values);
                    return response;
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