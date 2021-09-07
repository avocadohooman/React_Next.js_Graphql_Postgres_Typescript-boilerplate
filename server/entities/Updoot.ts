import { Column, Entity,  ManyToOne, PrimaryColumn } from "typeorm";
import { BaseEntity } from "typeorm";
import { User } from './User';
import { Post } from "./Post";
import { Field } from "type-graphql";


// many to many relationship 

@Entity()
export class Updoot extends BaseEntity {

    @Field()
    @Column({type: "int"})
    value: number;

    @PrimaryColumn()
    userId: number;

    @ManyToOne(() => User, (user) => user.updoots)
    user: User;

    @PrimaryColumn()
    postId: number;

    @ManyToOne(() => Post, (post) => post.updoots, {
        // CASCADE allows us to delete also the Updoot entries automatically when a post gets deleted
        onDelete: 'CASCADE'
    })
    post: Post;
}
