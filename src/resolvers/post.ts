import { Post } from "../entities/Post";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { MyContext } from "src/Types/types";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() ctx: MyContext) : Promise<Post[]> {
        return ctx.em.find(Post, {})
    }
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id') id: number,
        @Ctx() ctx: MyContext
        ) : Promise<Post | null> {
        return ctx.em.findOne(Post, { id })
    }
    @Mutation(() => Post)
    async createPost(
        @Arg('title') title: string,
        @Ctx() ctx: MyContext
        ) : Promise<Post> {
        const newPost = ctx.em.create(Post, {title: title});
        await ctx.em.persistAndFlush(newPost);
        return newPost;
    }
    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg('id') id: number,
        //when wanting to make an argument optional, set it as nullable: true
        @Arg('title', () => String, {nullable: true}) title: string,
        @Ctx() ctx: MyContext
        ) : Promise<Post | null> {
        const post = await ctx.em.findOne(Post, {id});
        if (!post) {
            return null;
        }
        if (typeof title !== undefined) {
            post.title = title;
            await ctx.em.persistAndFlush(post);
        }
        return post;
    }
    @Mutation(() => Post, {nullable: true})
    async deletePost(
        @Arg('id') id: number,
        @Ctx() ctx: MyContext
        ) : Promise<boolean> {
        try {
            ctx.em.nativeDelete(Post, {id});
        } catch (error) {
            return false
        }
        return true;
    }
}