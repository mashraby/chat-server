const { fetch, fetchAll } = require("../../utils/postgres");

const ALL_MESSAGES = `
    SELECT * FROM messages
`;

const CREATE_MESSAGE = ` 
    INSERT INTO messages(message_from, message_to, message_content) VALUES($1, $2, $3) RETURNING *
`;

const allMessages = () => fetchAll(ALL_MESSAGES);
const createMessage = (from, to, content) =>
  fetch(CREATE_MESSAGE, from, to, content);

module.exports = {
  allMessages,
  createMessage,
};
