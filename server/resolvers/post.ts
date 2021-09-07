import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { MyContext } from "server/Types/types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Updoot } from "..//entities/Updoot";

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

// If using FieldResolvers you need to pass in the the type, e.g. Post
@Resolver(Post)
export class PostResolver {
    // For sclice body of text in the backend instead of client-side
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 100)
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({ where: {postId, userId}});

        // the user has voted on the post alreadt and wants to change the vote
        if (updoot && updoot.value !== realValue) {
            await getConnection().transaction(async tm => {
                await tm.query(`
                    UPDATE updoot
                    SET value = $1
                    WHERE "postId" = $2 AND "userId" = $3
                `, [realValue, postId, userId]);

                await tm.query(`
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2;
                `, [2 * realValue, postId]);
            })
        } else if (!updoot) {
            // has never voted before

            // using transaction, allows a joint sequel. This ensures that if one of those fail, all fail
            // .transcation deals with opening and closing a transaction (not need to define START TRANSACTION and COMMIT)
            await getConnection().transaction(async tm => {
                await tm.query(`
                    INSERT INTO updoot ("userId", "postId", value)
                    values ($1, $2, $3);
                `, [userId, postId, realValue]);

                await tm.query(`
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2;
                `, [realValue, postId]);
            });
        }


        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        // number will be converted to Float otherwise
        @Arg('limit', () => Int) limit: number,
        // make it nullable as first time we use it there won't be a cursor. when you set something nullable, you have to set a type
        @Arg('cursor', () => String, {nullable: true}) cursor: string | null,
        @Ctx() { req }: MyContext
    ) : Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;

        const replacements: any[] = [realLimitPlusOne];
        console.log("REG", req.session);
        if (req.session.userId) {
            replacements.push(req.session.userId);
        }
        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }
        const posts = await getConnection().query(`
            SELECT p.*, 
            json_build_object(
                'username', u.username,
                'id', u.id,
                'email', u.email
                ) author,
            ${
                req.session.userId 
                ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus" '
                : 'null as "voteStatus"'
            }
            FROM post p
            INNER JOIN public.user u on u.id = p."creatorId"
            ${cursor ? `WHERE p."createdAt" < $3` : ""}
            ORDER BY p."createdAt" DESC
            limit $1
        `, replacements);

        return {
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne
        };
    }
    @Query(() => Post, {nullable: true})
    post(
        @Arg('id', () => Int) id: number,
        
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