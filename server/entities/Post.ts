import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity } from "typeorm";
import { User } from './User';

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

    @ManyToOne(() => User, user => user.posts)
    author: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt = Date();

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt = Date();

}
