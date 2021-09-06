import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/layout';
import React, { useState } from 'react'
import { PostSnippetFragment, PostsQuery, usePostsQuery, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<'updoot-isloading' | 'downdoot-isloading' | 'not-loading'>('not-loading');
    const [result, vote] = useVoteMutation();

    return (
        <Flex flexDirection="column" mr={4} alignItems="center">  
            <ChevronUpIcon 
            cursor="pointer" 
            color={post.voteStatus === 1 ? 'green' : undefined}
            onClick={async () =>  {
                if (post.voteStatus === 1) {
                    return;
                  }
                setLoadingState('updoot-isloading');
                await vote({value: 1, postId: post.id});
                setLoadingState('not-loading');
            }} w={8} h={8}/>
                {post.points}
            <ChevronDownIcon 
            color={post.voteStatus === -1 ? 'red' : undefined}
            cursor="pointer" 
            onClick={async () => {
                if (post.voteStatus === -1) {
                    return;
                  }
                setLoadingState('downdoot-isloading');
                await vote({value: -1, postId: post.id});
                setLoadingState('not-loading');
            }} w={8} h={8}/>
        </Flex>
    );
};

export default UpdootSection;