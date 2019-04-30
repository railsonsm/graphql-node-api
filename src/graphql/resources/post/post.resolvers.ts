import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { PostIsntance } from "../../../models/PostModel";
import { Mutation } from "../../mutation";
import { Transaction } from "sequelize";
import { handlerError, throwErrror } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const postResolvers = {
    Post: {
        author: (post, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(post.get('author')).catch(handlerError);
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
                    throwErrror(!post,`Post with id ${id} not found`);
                    return post;
                }).catch(handlerError);
        }
    },

    Mutation: {
        createPost: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DBConnection ,authUser: AuthUser }, info: GraphQLResolveInfo) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            }).catch(handlerError);
        }),
        updatePost: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DBConnection ,authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id).then((post: PostIsntance) => {
                        throwErrror(!post,`Post with id ${id} not found`);
                        throwErrror(post.get("author") != authUser.id, `Unauthorized! You can only edit post by youself!`)
                        input.author = authUser.id;                        
                        return post.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        }),
        deletePost: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DBConnection ,authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostIsntance) => {
                        throwErrror(!post,`Post with id ${id} not found`);
                        throwErrror(post.get("author")!= authUser.id, `Unauthorized! You can only delete post by youself!`)
                        return post.destroy({ transaction: t })
                            .then(post => !! true).catch(error => !!false);
                    })
            }).catch(handlerError);
        })
    }
}