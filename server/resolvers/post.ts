import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "server/Types/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
    @Field()
    points?: number;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 100)
    }

    @Query(() => PaginatedPosts)
    async posts(
        // number will be converted to Float otherwise
        @Arg('limit', () => Int) limit: number,
        // make it nullable as first time we use it there won't be a cursor. when you set something nullable, you have to set a type
        @Arg('cursor', () => String, {nullable: true}) cursor: string | null
    ) : Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const qb =  getConnection()
                    .getRepository(Post)
                    .createQueryBuilder("p")
                    .orderBy('"createdAt"', 'DESC')
                    .take(realLimitPlusOne);
        if (cursor) {
            qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
        }
        const posts = await qb.getMany()
        return {posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne};
    }
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id') id: number,
        
        ) : Promise<Post | undefined> {
        return Post.findOne(id)
    }
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }:MyContext
        ) : Promise<Post> {

        return Post.create({
            ...input,
            creatorId: req.session.userId 
        }).save();
    }
    @Mutation(() => Post, {nullable: true})
    @UseMiddleware(isAuth)
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