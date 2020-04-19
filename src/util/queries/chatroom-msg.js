const { formatChatroomMessages, formatSingleMessage } = require('../helpers/format-data')


// TODO: error handling
const getInitialChatroomMsg = (db, chatroom_id) => (
  db.query(
    {
      text: 'SELECT * FROM chatrooms c LEFT OUTER JOIN messages m ON c.id = m.chatroom_id WHERE c.id = $1;',
      values: [chatroom_id],
      name: 'get_initial_chatroom_messages',
    },
  ).then((r) => formatChatroomMessages(r.rows[0]))
)

const getAllChatroomMsgs = (db, user_id) => (
  db.query(
    {
      text: `
        SELECT 
          m.chatroom_id AS chatroom_id,
          m.id AS message_id,
          m.owner_user_id AS user_id,
          m.content AS content,
          m.created_at AS created_at,
          m.is_deleted AS deleted,
          c.chatroom_type AS type,
          c.name AS name,
          c.avatar AS avatar,
          u.username AS username
        FROM messages m 
        JOIN user_message_views umv 
          ON umv.message_id = m.id
        JOIN users u 
          ON u.id = m.owner_user_id
        JOIN chatrooms c 
          ON c.id = m.chatroom_id
        WHERE umv.user_id = $1;
      `,
      values: [user_id],
      name: 'get_all_chatroom_messages',
    },
  ).then((r) => formatChatroomMessages(r.rows))
)

const getSingleChatroomMsg = (db, msg_id) => (
  db.query(
    {
      text: `
        SELECT
          m.chatroom_id AS chatroom_id,
          m.id AS message_id,
          m.owner_user_id AS user_id,
          m.content AS content,
          m.created_at AS created_at,
          m.is_deleted AS deleted,
          u.username AS username
        FROM messages m 
        JOIN chatrooms c 
          ON c.id = m.chatroom_id
        JOIN users u 
          ON u.id = m.owner_user_id
        WHERE m.id = $1;
      `,
      values: [msg_id],
      name: 'get_all_chatroom_messages',
    },
  ).then((r) => formatSingleMessage(r.rows[0]))
)

const getRecentChatroomMsgs = (db, user_id) => (
  db.query(
    {
      text: `
        SELECT 
          m.chatroom_id AS chatroom_id,
          m.id AS message_id,
          m.owner_user_id AS user_id,
          m.content AS content,
          m.created_at AS created_at,
          m.is_deleted AS deleted,
          c.chatroom_type AS type,
          c.name AS name,
          c.avatar AS avatar,
          u.username AS username
        FROM messages m 
        JOIN user_message_views umv 
          ON umv.message_id = m.id
        JOIN chatrooms c 
          ON c.id = m.chatroom_id
        JOIN users u 
          ON u.id = m.owner_user_id
        WHERE umv.user_id = $1;
      `,
      values: [user_id],
      name: 'get_recent_chatroom_messages',
    },
  ).then((r) => formatChatroomMessages(r.rows))
)

const getChatroomMsgs = (db, user_id, chatroom_id) => (
  db.query(
    {
      text: `
        SELECT *
        FROM messages m 
        JOIN user_message_views umv
          ON umv.message_id = m.id
        JOIN chatrooms c
          ON c.id = m.chatroom_id
        WHERE umv.user_id = $1 and m.chatroom_id = $2
        LIMIT 10;
      `,
      values: [user_id, chatroom_id],
      name: 'get_chatroom_messages',
    },
  ).then((r) => formatChatroomMessages(r.rows))
)

const deleteChatroomMsg = (db, user_id, message_id) => (
  db.query(
    {
      text: `
        UPDATE messages
        SET content = 'COMMENT DELETED', updated_at = NOW(), is_deleted = true
        WHERE owner_user_id = $1 and id = $2;
      `,
      values: [user_id, message_id],
      name: 'delete_chatroom_message',
    },
  ).then((r) => r.rows[0])
)

const deleteChatroomMsgViews = (db, user_id, message_id) => (
  db.query(
    {
      text: 'DELETE FROM user_message_views WHERE user_id = $1 and message_id = $2;',
      values: [user_id, message_id],
      name: 'delete_chatroom_message_views',
    },
  ).then((r) => r.rows[0])
)

const getNewSpecificChatroomMsg = (db, message_id) => (
  db.query(
    {
      text: `
        SELECT
          c.id AS chatroom_id,
          c.chatroom_type AS type,
          c.name AS name,
          c.avatar AS avatar,
          m.id AS message_id,
          m.owner_user_id AS user_id,
          m.content AS content,
          m.created_at AS created_at,
          m.is_deleted AS deleted,
          u.username AS username
        FROM messages m 
        JOIN chatrooms c
          ON c.id = m.chatroom_id
        JOIN users u
          ON m.owner_user_id = u.id
        WHERE m.id = $1;
      `,
      values: [message_id],
      name: 'get_new_specific_chatroom_message',
    },
  ).then((r) => formatChatroomMessages(r.rows))
)

const createChatroomMsg = (db, user_id, chatroom_id, content) => (
  db.query(
    {
      text: `
        WITH
          new_message_id
            AS (INSERT INTO messages (owner_user_id, chatroom_id, content) VALUES ($1, $2, $3) returning id),
          user_array
            AS (SELECT user_id FROM participants where chatroom_id = $2)
        INSERT INTO user_message_views (message_id, user_id)
          (SELECT * from new_message_id CROSS JOIN user_array)
        RETURNING message_id
      `,
      values: [user_id, chatroom_id, content],
      name: 'create_chatroom_message',
    },
  ).then((r) => getNewSpecificChatroomMsg(r.rows[0].message_id))
)

module.exports = {
  getInitialChatroomMsg,
  getAllChatroomMsgs,
  getSingleChatroomMsg,
  getRecentChatroomMsgs,
  getChatroomMsgs,
  deleteChatroomMsg,
  deleteChatroomMsgViews,
  getNewSpecificChatroomMsg,
  createChatroomMsg,
}
