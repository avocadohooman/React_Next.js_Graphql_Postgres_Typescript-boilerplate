import { ApolloCache } from '@apollo/client';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex } from '@chakra-ui/layout';
import gql from 'graphql-tag';
import React, { useState } from 'react'
import { Post, PostSnippetFragment, PostsQuery, usePostsQuery, useVoteMutation, VoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
    const data = cache.readFragment<{
        id: number;
        points: number;
        voteStatus: number | null;
    }>({
        id: 'Post:' + postId,
        fragment: gql`
          fragment _ on Post {
            id
            points
            voteStatus
        }`
    }); // Data or null
    if (data) { 
        if (data.voteStatus === value) {
          return ;
        }
          const newPointValue = data.points + (!data.voteStatus ? 1 : 2) * value;
          cache.writeFragment({
            id: 'Post:'+postId,
            fragment: gql`
                fragment _ on Post {
                  points
                  voteStatus
                }
              `,
            data: { id: postId, points: newPointValue, voteStatus: value }
            }
          );
     }
}

const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    const [loadingState, setLoadingState] = useState<'updoot-isloading' | 'downdoot-isloading' | 'not-loading'>('not-loading');
    const [vote] = useVoteMutation();

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
                await vote({ 
                    variables: {
                        value: 1, 
                        postId: post.id},
                    update: (cache) => updateAfterVote(1, post.id, cache),
                });
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
                await vote({
                    variables: {value: -1, postId: post.id},
                    update: (cache) => updateAfterVote(-1, post.id, cache),
                });
                setLoadingState('not-loading');
            }} w={8} h={8}/>
        </Flex>
    );
};

export default UpdootSection;