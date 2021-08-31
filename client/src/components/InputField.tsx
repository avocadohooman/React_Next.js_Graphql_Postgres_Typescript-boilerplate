import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

// & {object} makes the prop required
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    placeholder: string,
    name: string
};

const InputField: React.FC<InputFieldProps> = (props) => {
    const [field, meta, helpers] = useField(props);
    
        return (
        <FormControl isInvalid={!!meta.error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            <Input 
                {...field} 
                id={field.name} 
                placeholder={props.placeholder} 
                type={field.name === 'password' ? 'password' : 'text'}
            />
            {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
        );
};

export default InputField;