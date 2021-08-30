import React from 'react'
import { Formik, Form } from 'formik';
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
    Input,
} from "@chakra-ui/react";

interface registerProps {

}

const initialValues = {
    username: '',
    password: '',
};

const Register: React.FC<registerProps> = ({}) => {

        return (
            <div>
                <Formik 
                initialValues={{username: '', password: ''}}
                onSubmit={(values) => {
                    console.log(values);
                }}
                > 
                {({values, handleChange}) => (
                    <Form>
                        <FormControl>
                            <FormLabel htmlFor="name">Username</FormLabel>
                            <Input values={values.username} onChange={handleChange} id="username" placeholder="Username" />
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <Input values={values.username} onChange={handleChange} id="password" placeholder="Password" />
                            {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
                        </FormControl>
                    </Form>

                )}   
                </Formik>
            </div>
        );
};

export default Register;