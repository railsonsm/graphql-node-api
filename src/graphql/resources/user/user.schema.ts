import { postTypes } from "../post/post.schema";

const userTypes = `
    type User{
        id: ID!
        name: String!
        photo: String!
        email: String!
        createdAt: String!
        updatesAt: String!
        posts(first: Int, offset: Int): [Post!]!
    }

    input UserCreateInput{
        name: String!
        email: String!
        password: String!
    }

    input UserUpdateInput{
        name: String!
        email: String!
        photo: String!
    }

    input UserUpdatePasswordInput{
        password: String!
    }
`

const userQueries = `
    users(first: Int, offset: Int): [ User! ]!
    user(id: ID!): User
`

const userMusations = `
    createUser(input: UserCreateInput!): User
    updateUser(id: ID!, input: UserUpdateInput!): User
    updateUserPassword(id: ID!, input: UserUpdatePasswordInput!): Boolean
    deleteUser(id: ID!): Boolean

`

export{
    userTypes,
    userQueries,
    userMusations
}
