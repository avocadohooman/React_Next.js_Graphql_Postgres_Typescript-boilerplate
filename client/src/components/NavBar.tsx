import { Box, Flex, Link } from '@chakra-ui/layout';
import React from 'react'
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
 
interface NavBarProps {

}

const NavBar: React.FC<NavBarProps> = ({}) => {
    const [result, me] = useMeQuery({
        pause: isServer()
    });
    const [, logout] = useLogoutMutation();
    let body = null;

    //data is loading
    if (result.fetching) {

        //user not logged in
    } else if (!result.data?.me) {
        body = (
            <>
                <NextLink href='/login'>
                    <Link mr={4}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link>Register</Link>
                </NextLink>
            </>
        )
        //user is logged in
    } else {
        body = (
            <>
                <Flex>
                    <Box>
                        {result.data.me.username}
                    </Box>
                    <Button onClick={() => {
                        logout();
                    }} 
                    ml={4} 
                    variant='link'>
                        logout
                    </Button>
                </Flex>
            </>
        )
    }

    return (
        <Flex position='sticky' zIndex={1} top={0}bg='tan' p={4}>
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    );
};

export default NavBar;