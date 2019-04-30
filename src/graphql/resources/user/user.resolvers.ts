import { GraphQLResolveInfo } from "graphql";
import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handlerError, throwErrror } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolver, authResolvers } from "../../composable/auth.resolver";
import { verify } from "jsonwebtoken";
import { verifyTokenResolver } from "../../composable/verify-token.resolver";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";
import { AuthUser } from "../../../interfaces/AuthUserInterface";

export const userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: { author: user.get('id') },
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },
    },

    Query: {
        users: (parent, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findAll({
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },

        user: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.User.findById(id).then((user: UserInstance) => {
                throwErrror(!user, `User with id ${id} not found`);
                return user;
            }).catch(handlerError);
        },
        currentUser: compose(...authResolvers)((parent, args, { db, authUser }: { db: DBConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(authUser.id)
                .then((user: UserInstance) => {
                    throwErrror(!user, `User with id ${authUser.id} not found`);
                    return user;
                }).catch(handlerError);
        }),
    },

    Mutation: {
        createUser: (parent, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(args.input, { transaction: t });
            }).catch(handlerError);
        },//spred
        updateUser: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DBConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwErrror(!user, `User with id ${authUser.id} not found`);
                        return user.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        }),
        updateUserPassword: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DBConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwErrror(!user, `User with id ${authUser.id} not found`);
                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => !!user);
                    })
            }).catch(handlerError);
        }),
        deleteUser: compose(...authResolvers)((parent, args, { db, authUser }: { db: DBConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwErrror(!user, `User with id ${authUser.id} not found`);
                        return user.destroy({ transaction: t })
                            .then(user => !! true).catch(error => !!false);
                    });
            }).catch(handlerError);
        })
    }
}