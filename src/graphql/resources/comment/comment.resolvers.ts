import { GraphQLResolveInfo } from "graphql";
import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handlerError } from "../../../utils/utils";

export const commentResolvers = {

    Comment: {
        user: (comment, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.User.findById(comment.get('user'))
            .catch(handlerError);
        },
        post: (comment, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.Post.findById(comment.get('post'))
            .catch(handlerError);
        },
    },

    Query: {
        commentsByPost: (parent, { postId, first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);
            return db.Comment.findAll({
                where: { post: postId },
                limit: offset,
                offset: offset
            }).catch(handlerError);
        }
    },
    Mutation: {
        createComment: (parent, { input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(handlerError);
        },
        updateComment: (parent, { id, input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id).then((comment: CommentInstance) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        return comment.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        },
        deleteComment: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id).then((comment: CommentInstance) => {
                        if (!comment) throw new Error(`Comment with id ${id} not found`);
                        return comment.destroy({ transaction: t })
                            .then(comment => !! true).catch(error => !!false);
                    })

            }).catch(handlerError);
        }
    }
}