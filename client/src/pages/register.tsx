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

interface registerProps {

}

const initialValues = {
    username: '',
    password: '',
};

const Register: React.FC<registerProps> = ({}) => {

        return (
            <Wrapper variant='small'>
                <Formik 
                initialValues={{username: '', password: ''}}
                onSubmit={(values) => {
                    console.log(values);
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