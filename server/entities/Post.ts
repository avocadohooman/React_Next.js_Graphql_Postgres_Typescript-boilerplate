import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity } from "typeorm";
import { User } from './User';
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({type: 'int', default: 0})
    points!: number;

    @Field()
    @Column()
    creatorId: number;

    @Field()
    @ManyToOne(() => User, user => user.posts)
    author: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[]

    @Field(() => Int, {nullable: true})
    voteStatus: number | null;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date();

}
