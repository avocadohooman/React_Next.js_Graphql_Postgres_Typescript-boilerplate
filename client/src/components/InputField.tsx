import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { Input } from '@chakra-ui/input';
import { Textarea } from '@chakra-ui/textarea';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

// & {object} makes the prop required
type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string,
    placeholder: string,
    name: string,
    textarea: boolean
};

const InputField: React.FC<InputFieldProps> = (props) => {
    const [field, meta, helpers] = useField(props);
        let InputOrTextArea: any = Input;
        if (props.textarea) {
            InputOrTextArea = Textarea; 
        }
        return (
        <FormControl isInvalid={!!meta.error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            <InputOrTextArea 
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