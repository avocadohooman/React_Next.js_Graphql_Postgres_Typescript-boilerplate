import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "../Types/types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts() : Promise<Post[]> {
        return Post.find({});
    }
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id') id: number,
        
        ) : Promise<Post | undefined> {
        return Post.findOne(id)
    }
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        ) : Promise<Post> {
        return Post.create({title}).save();
    }
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        //when wanting to make an argument optional, set it as nullable: true
        @Arg('title', () => String, {nullable: true}) title: string,
        
        ) : Promise<Post | undefined> {
        const post = await Post.findOne(id);
        if (!post) {
            return undefined;
        }
        if (typeof title !== undefined) {
            post.title = title;
            await Post.update({id}, {title});
        }
        return post;
    }
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id') id: number,
        
        ) : Promise<boolean> {
        try {
            Post.delete(id);
        } catch (error) {
            return false
        }
        return true;
    }
}