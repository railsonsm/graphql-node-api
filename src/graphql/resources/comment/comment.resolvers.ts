import { GraphQLResolveInfo } from "graphql";
import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { Transaction } from "sequelize";
import { CommentInstance } from "../../../models/CommentModel";
import { handlerError, throwErrror } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

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
        createComment: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DBConnection, authUser:AuthUser }, info: GraphQLResolveInfo) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t });
            }).catch(handlerError);
        }),
        updateComment: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DBConnection, authUser:AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id).then((comment: CommentInstance) => {
                        throwErrror(!comment,`Comment with id ${id} not found`);
                        throwErrror(comment.get("user")!= authUser.id, `Unauthorized! You can only edit comments by youself!`)
                        input.user = authUser.id;
                        return comment.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        }),
        deleteComment: compose(...authResolvers)((parent, { id }, { db, authUser }: { db: DBConnection, authUser:AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id).then((comment: CommentInstance) => {
                        throwErrror(!comment,`Comment with id ${id} not found`);
                        throwErrror(comment.get("user")!= authUser.id, `Unauthorized! You can only edit delete by youself!`)
                        return comment.destroy({ transaction: t })
                            .then(comment => !! true).catch(error => !!false);
                    })

            }).catch(handlerError);
        })
    }
}