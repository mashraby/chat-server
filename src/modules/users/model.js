const { fetch, fetchAll } = require("../../utils/postgres")

const ALL_USERS = `
    SELECT * FROM users
`

const REGISTER = `
    INSERT INTO users(user_name, user_email, user_password) VALUES($1, $2, $3) RETURNING *
`

const SEND_MESSAGE = `
    INSERT INTO messages(message_content, message_from, message_to) VALUES($1, $2, $3) RETURNING *
`

const getUsers = () => fetchAll(ALL_USERS)
const register = (username, email, password) => fetch(REGISTER, username, email, password)
const sendMessage = (content, from, to) => fetch(SEND_MESSAGE, content, from, to)

module.exports = {
    getUsers, 
    register, 
    sendMessage
}