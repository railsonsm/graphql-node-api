import { GraphQLFieldResolver } from "graphql";
import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../utils/utils";
import { Promise } from "bluebird";
import { IResolvers } from "graphql-tools/dist/Interfaces";

export const verifyTokenResolver: ComposableResolver<any, ResolverContext> =
(resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {
    return (parent, args, context: ResolverContext, info) => {
        console.log(context.authorization);
        
        const token: string = context.authorization ? context.authorization.split(' ')[1] : undefined;
        
       return jwt.verify(token, JWT_SECRET, (error, decoded: any) => {
            if (!error) { return resolver(parent, args, context, info); }
            throw new Error(`${error.name}: ${error.message}`)
        });
    }
    
}




