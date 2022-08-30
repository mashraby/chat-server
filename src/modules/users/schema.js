const { gql } = require("apollo-server-express");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    acces_token: String
    latestMessage: Message
  }
  extend type Query {
    users: [User!]
    login(username: String!, password: String!): User!
  }
  extend type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confrimPassword: String!
    ): User!
  }
`;
