import { Box } from '@chakra-ui/layout';
import React from 'react'

export type WrapperVariant = 'small' | 'regular'

interface WrapperProps {
    variant?: WrapperVariant
}

const Wrapper: React.FC<WrapperProps> = ({children, variant="regular"}) => {
        return (
            <Box maxW={variant === 'regular' ? "800px" : "400px"} w="100%" mt={8} mx="auto">
                {children}
            </Box>
        );
};

export default Wrapper;