const messageModel = require("./model");
const userModel = require("../users/model");
const {
  AuthenticationError,
  UserInputError,
} = require("apollo-server-express");

const { pubsub } = require("../../pubsub");

module.exports = {
  Query: {
    messages: async (_, { from }, { user }) => {
      try {
        console.log(from, user);
        if (!user) throw new AuthenticationError("Unathenticated");
        const otherUser = await (
          await userModel.getUsers()
        ).find((e) => (e.user_name = from));

        if (!otherUser) throw new UserInputError("User not found");

        const filteredMessages = await (
          await messageModel.allMessages()
        ).filter(
          (e) =>
            (e.message_from === user.username &&
              e.message_to === otherUser.user_name) ||
            (e.message_from === otherUser.user_name &&
              e.message_to === user.username)
        );

        return filteredMessages;
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },
  },
  Message: {
    id: (g) => g.message_id,
    from: (g) => g.message_from,
    to: (g) => g.message_to,
    content: (g) => g.message_content,
  },
  Mutation: {
    sendMessage: async (_, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unathenticated");

        console.log(pubsub);

        const recipient = await (
          await userModel.getUsers()
        ).find((e) => e.user_name === to);

        if (!recipient) {
          throw new UserInputError("User not found");
        } else if (recipient.user_name === user.username) {
          throw new UserInputError("You cant message yourself");
        }

        if (content.trim() === "") throw new UserInputError("Message is empty");

        const createdMessage = await messageModel.createMessage(
          user.username,
          to,
          content
        );

        pubsub.publish("NEW_MESSAGE");

        return createdMessage;
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },
  },
  Subscription: {
    messages: {
      resolve: async (_, { from }, { user }) => {
        try {
          console.log(from, user);
          if (!user) throw new AuthenticationError("Unathenticated");

          const otherUser = await (
            await userModel.getUsers()
          ).find((e) => (e.user_name = from));

          if (!otherUser) throw new UserInputError("User not found");

          const filteredMessages = await (
            await messageModel.allMessages()
          ).filter(
            (e) =>
              (e.message_from === user.username &&
                e.message_to === otherUser.user_name) ||
              (e.message_from === otherUser.user_name &&
                e.message_to === user.username)
          );

          return filteredMessages;
        } catch (err) {
          console.log(err);
          throw new Error(err.message);
        }
      },
      subscribe: async (_, __, {}) => {
        console.log(pubsub);
        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      },
    },
  },
};
