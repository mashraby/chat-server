const { gql } = require("apollo-server-express");

module.exports = gql`
  type Message {
    id: ID!
    content: String!
    from: String!
    to: String!
  }

  extend type Query {
    messages(from: String!): [Message!]
  }

  extend type Mutation {
    sendMessage(to: String!, content: String!): Message!
  }

  extend type Subscription {
    messages(from: String!): [Message!]
  }
`;
