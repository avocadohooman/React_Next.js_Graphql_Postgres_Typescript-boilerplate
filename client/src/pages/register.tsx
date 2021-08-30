import React from 'react'
import { Formik, Form } from 'formik';

interface registerProps {

}

export const Register: React.FC<registerProps> = ({}) => {
        return (
        <Formik> 
            {() => (
                <Form>
                    <div>hello</div>
                </Form>
            )}   
        </Formik>
        );
};

export default Register;