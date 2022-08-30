const userModel = require("./model");
const messageModel = require("../messages/model");
const bcrypt = require("bcryptjs");
const {
  UserInputError,
  AuthenticationError,
} = require("apollo-server-express");
const { sign } = require("../../utils/jwt");

module.exports = {
  Query: {
    users: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unathenticated");

        let users = await (
          await userModel.getUsers()
        ).filter((e) => e.user_name !== user.username);

        const allUserMessages = await (
          await messageModel.allMessages()
        ).filter(
          (message) =>
            message.message_from === user.username ||
            message.message_to === user.username
        );

        console.log(allUserMessages);

        console.log(users);

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) =>
              m.message_from === otherUser.user_name ||
              m.message_to === otherUser.user_name
          );
          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw new Error(err.message);
      }
    },

    login: async (_, { username, password }) => {
      let errors = {};

      try {
        if (username.trim() === "")
          errors.username = "username kiritilishi shart";
        if (password === "") errors.password = "password kiritilishi shart";

        const user = (await userModel.getUsers()).find(
          (e) => e.user_name == username
        );

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("Bunaqa foydalanuvchi topilmadi", {
            errors,
          });
        }

        if (!user) {
          errors.username = "Bunday foydalanuvchi mavjud emas";
          throw new UserInputError("Bunday foydalanuvchi mavjud emas", {
            errors,
          });
        }

        const correctedPassword = await bcrypt.compare(
          password,
          user.user_password
        );

        if (!correctedPassword) {
          errors.password = "password noto`g`ri";
          throw new UserInputError("password noto`g`ri", { errors });
        }

        const acces_token = sign({ username });

        user.acces_token = acces_token;

        return {
          ...user,
          acces_token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    sendMessage: async (_, { to, content }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        const users = await userModel.getUsers();

        const recipient = users.find((e) => e.user_name === to);

        if (!recipient) throw new UserInputError("Foydalanuvchi topilmadi");

        if (content.trim() === "") {
          throw new UserInputError("Habarni bo`sh jo`nata olmaysiz !");
        }

        const message = await userModel.sendMessage(content, user.username, to);

        return message;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  User: {
    id: (g) => g.user_id,
    username: (g) => g.user_name,
    email: (g) => g.user_email,
    password: (g) => g.user_password,
  },
  Mutation: {
    register: async (_, { username, email, password, confrimPassword }) => {
      try {
        let errors = {};

        //Validate input data
        if (email.trim() === "") errors.email = "email kiritishingiz shart";
        if (username.trim() === "")
          errors.username = "username kiritishingiz shart";
        if (password.trim() === "")
          errors.password = "password kiritishingiz shart";
        if (confrimPassword.trim() === "")
          errors.confrimPassword = "passwordni takroran kiritishingiz shart";

        if (password !== confrimPassword)
          errors.confrimPassword = "passwordlar mos kelmayapti";

        //Check username / email exists
        const users = await userModel.getUsers();
        const userByUsername = users.find((e) => e.user_name == username);
        const userByEmail = users.find((e) => e.user_email == email);

        if (userByUsername) errors.username = "Bu username band";
        if (userByEmail)
          errors.email = "Bu email allaqachon ro`yhatdan o`tqazilgan";

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        //Hash password
        password = await bcrypt.hash(password, 6);

        const registeredUser = await userModel.register(
          username,
          email,
          password
        );
        return registeredUser;
      } catch (err) {
        console.log(err);
        throw new UserInputError("Input noto'g'ri kiritilgan", { errors: err });
      }
    },
  },
  Subscription: {
    subusers: {
      resolve: async (_, __, { user, pubsub }) => {
        try {
          if (!user) throw new AuthenticationError("Unathenticated");

          let users = await (
            await userModel.getUsers()
          ).filter((e) => e.user_name !== user.username);

          const allUserMessages = await (
            await messageModel.allMessages()
          ).filter(
            (message) =>
              message.message_from === user.username ||
              message.message_to === user.username
          );

          users = users.map((otherUser) => {
            const latestMessage = allUserMessages.find(
              (m) =>
                m.message_from === otherUser.user_name ||
                m.message_to === otherUser.user_name
            );
            otherUser.latestMessage = latestMessage;

            return otherUser;
          });

          return users;
        } catch (err) {
          console.log(err);
          throw new Error(err.message);
        }
      },
      subscribe: async (_, __, { pubsub }) => {
        return pubsub.asyncIterator(["NEW_MESSAGE"]);
      },
    },
  },
};
