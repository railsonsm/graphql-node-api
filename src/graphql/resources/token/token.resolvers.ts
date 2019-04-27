import { DBConnection } from "../../../interfaces/BDConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../../utils/utils";

export const tokenResolvers = {

    Mutation: {
        createToken: (patent, { email, password }, { db }: { db: DBConnection }) => {
            return db.User.findOne({
                where: { email: email },
                attributes: ['id', 'password']
            }).then((user: UserInstance) => {
                let errorMessage: string = `Unauthorized, wrong email or password!`
                if (!user || (!user.isPassword(user.get('password'), password))) { throw new Error(errorMessage) }

                const paylod = {
                    sub: user.get('id')
                }

                return {
                    token: jwt.sign(paylod, JWT_SECRET)
                }
            });
        }
    }
}