import { Box, Flex, Heading, Link } from '@chakra-ui/layout';
import React from 'react'
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';
import {useRouter} from 'next/router';
import { useApolloClient } from '@apollo/client';

interface NavBarProps {

}

const NavBar: React.FC<NavBarProps> = ({}) => {
    const meQuery = useMeQuery({
        skip: isServer()
    });
    const [logout, {loading: logoutFetching}] = useLogoutMutation();
    let body = null;
    const router = useRouter();
    const apollo = useApolloClient();

    //data is loading
    if (meQuery.loading) {

        //user not logged in
    } else if (!meQuery.data?.me) {
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
                        {meQuery.data.me.username}
                    </Box>
                    <Button onClick={async () => {
                        await logout();
                        await apollo.resetStore();
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
        <Flex position='sticky' zIndex={1} top={0}bg='tan' p={4} align="center">
            <Link href="/">
                <Heading fontSize={18}> 
                    LiReddit
                </Heading>
            </Link>
            <Box ml={'auto'}>
                {body}
            </Box>
        </Flex>
    );
};

export default NavBar;