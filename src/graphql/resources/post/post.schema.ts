const postTypes = `
    type Post {
        id: ID!
        title: String!
        content: String!
        photo: String!
        createdAt: String!
        updatedAy: String!
        author: User!
        comments(first: Int, offset: Int): [ Comment! ]
    }

    input postInput {
        title: String!
        content: String!
        photo: String!
        author: Int!
    }
`

const postQueries = `
    posts(first: Int, offset: Int): [Post!]!
    post(id: ID!): Post

`

const postMutations = `
    createPost(input: postInput!): Post
    updatePost(id: ID!, input: postInput!): Post
    deletePost (id: ID!): Boolean
`

export{
    postTypes,postQueries,postMutations
}