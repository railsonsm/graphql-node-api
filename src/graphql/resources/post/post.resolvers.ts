import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { PostIsntance } from "../../../models/PostModel";
import { Mutation } from "../../mutation";
import { Transaction } from "sequelize";
import { handlerError } from "../../../utils/utils";

export const postResolvers = {
    Post: {
        author: (post, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(post.get('autor')).catch(handlerError);
        },

        comments: (post, { first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.Comment
                .findAll({
                    where: { post: post.get('id') },
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },
    },

    Query: {
        posts: (parent, { first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },
        post: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.Post.findById(id)
                .then((post: PostIsntance) => {
                    if (!post) throw new Error(`Post with id ${id} not found`);
                    return post;
                }).catch(handlerError);
        }
    },

    Mutation: {
        createPost: (parent, { input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            }).catch(handlerError);
        },
        updatePost: (parent, { id, input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id).then((post: PostIsntance) => {
                        if (!post) throw new Error(`Post with id ${id} not found`);
                        post.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        },
        deleteUser: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((user: PostIsntance) => {
                        if (!user) throw new Error(`Post with id ${id} not found`);
                        return user.destroy({ transaction: t })
                            .then(post => !! true).catch(error => !!false);
                    })
            }).catch(handlerError);
        }
    }
}