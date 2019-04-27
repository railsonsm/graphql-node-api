import { userMusations } from './resources/user/user.schema'
import { postMutations } from './resources/post/post.schema';
import { commentMutations } from './resources/comment/comment.schema';
import { tokenMutations } from './resources/token/token.schema';

const Mutation = `
    type Mutation{
        ${userMusations}
        ${postMutations}
        ${commentMutations}
        ${tokenMutations}
    }
`;

export {
    Mutation
}