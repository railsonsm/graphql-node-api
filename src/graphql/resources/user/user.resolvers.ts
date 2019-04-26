import { GraphQLResolveInfo } from "graphql";
import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { Transaction } from "sequelize";
import { handlerError } from "../../../utils/utils";

export const userResolvers = {
    User: {
        posts : (user, { first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findAll({
                    where: {author: user.get('id')},
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },
    },

    Query: {
        users: (parent, { first = 10, offset = 0 }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findAll({
                    limit: first,
                    offset: offset
                }).catch(handlerError);
        },

        user: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.User.findById(id).then((user: UserInstance) => {
                if (!user) throw new Error(`User with id ${id} not found`);
                return user;
            }).catch(handlerError);
        }
    },

    Mutation: {
        createUser: (parent, args, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(args.input, { transaction: t });
            }).catch(handlerError);
        },
        updateUser: (parent, { id, input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                id = parseInt(id);
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found`);
                        return user.update(input, { transaction: t });
                    })
            }).catch(handlerError);
        },
        updateUserPassword: (parent, { id, input }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found`);
                        return user.update(input, { transaction: t })
                        .then((user: UserInstance)=> !!user);
                    })
            }).catch(handlerError);
        },
        deleteUser: (parent, { id }, { db }: { db: DBConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found`);
                        return user.destroy({ transaction: t })
                        .then(user => !! true).catch(error=>!!false);
                    })
            }).catch(handlerError);
        }
    }
}