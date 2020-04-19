// TODO: error handling
const checkInChatAlready = (db, user1_id, user2_id) => (
  db.query(
    {
      text: `
        SELECT
          t1.id AS chatroom_id 
        FROM
          (
            SELECT c.id AS id 
            FROM participants p
            JOIN chatrooms c
              ON p.chatroom_id = c.id
            WHERE p.user_id = $1 and c.chatroom_type='single'
          ) AS t1
        JOIN
          (
            SELECT c.id AS id 
            FROM participants p
            JOIN chatrooms c
              ON p.chatroom_id = c.id
            WHERE p.user_id = $2 and c.chatroom_type='single'
          ) AS t2 ON t1.id = t2.id;
      `,
      values: [user1_id, user2_id],
      name: 'check_in_chat_already',
    },
  ).then((r) => r.rows[0])
)

const createChatroom = (db, chatroom_type, name, user_id, users_arr, avatar) => {
  const newAvatar = avatar ? 'http://www.newdesignfile.com/postpic/2012/08/group-people-icon-team_357813.png' : avatar
  return db.query(
    {
      text: `
        WITH new_chat_id
          AS (INSERT INTO chatrooms(chatroom_type, name, avatar) VALUES ($1, $2, $3) RETURNING id)
        INSERT INTO participants(user_id, chatroom_id, is_admin) 
          (SELECT user_id, id, user_id = $4
            FROM new_chat_id
            CROSS JOIN unnest($5::integer[]) AS user_id)
        RETURNING *;
      `,
      values: [chatroom_type, name, newAvatar, user_id, users_arr],
      name: 'create_chatroom',
    },
  ).then((r) => r.rows)
}

const addMultiChatroomParticipants = (db, users_arr, chatroom_id) => {
  let queryStr = ''
  queryStr += 'INSERT INTO participants(chatroom_id, user_id) VALUES '
  users_arr.forEach((user, i) => {
    queryStr += `(${chatroom_id}, ${user})`
    queryStr += i === users_arr.length - 1 ? ' ' : ', '
  })
  queryStr += 'RETURNING *;'

  return db.query({
    text: queryStr,
    name: 'add_multiple_chatroom_participants',
  })
}

const addChatroomParticipant = (db, user_id, chatroom_id) => (
  db.query(
    {
      text: 'INSERT INTO participants(user_id, chatroom_id) VALUES ($1, $2) RETURNING *;',
      values: [user_id, chatroom_id],
      name: 'add_chatroom_participant',
    },
  ).then((r) => r.rows[0])
)

const getActiveChatrooms = (db, user_id) => (
  db.query(
    {
      text: 'SELECT * FROM participants WHERE user_id = $1;',
      values: [user_id],
      name: 'get_active_chatrooms',
    },
  ).then((r) => r.rows)
)

const updateChatroom = (db, chatroom_id, name = null, avatar = null) => {
  let queryStr = ''
  let queryVals = []

  if (!avatar && !name) {
    queryStr = 'UPDATE chatrooms SET name = $2, avatar = $3 WHERE id = $1 RETURNING *;'
    queryVals = [chatroom_id, name, avatar]
  } else if (!name) {
    queryStr = 'UPDATE chatrooms SET name = $2 WHERE id = $1 RETURNING *;'
    queryVals = [chatroom_id, name]
  } else {
    queryStr = 'UPDATE chatrooms SET avatar = $2 WHERE id = $1 RETURNING *;'
    queryVals = [chatroom_id, avatar]
  }

  return db.query({
    text: queryStr,
    values: queryVals,
    name: 'update_chatroom',
  }).then((r) => r.rows[0])
}

const updateChatroomParticipant = (db, user_id, chatroom_id) => (
  db.query(
    {
      text: `
        UPDATE participants
        SET is_admin = NOT is_admin
        WHERE user_id = $1 AND chatroom_id = $2
        RETURNING *;
      `,
      values: [user_id, chatroom_id],
      name: 'update_chatroom_participant',
    },
  )
)

const deleteChatroomParticipant = (db, user_id, chatroom_id) => (
  db.query(
    {
      text: 'DELETE FROM participants WHERE user_id = $1 AND chatroom_id = $2 RETURNING *;',
      values: [user_id, chatroom_id],
      name: 'update_chatroom_participant',
    },
  )
)

const deleteViewableMsgs = (db, user_id, chatroom_id) => (
  db.query(
    {
      text: `
        DELETE FROM user_message_views
        WHERE user_id = $1 AND message_id
        IN (SELECT id FROM messages where chatroom_id = $2)
        RETURNING *;
      `,
      values: [user_id, chatroom_id],
      name: 'leave_chatroom_remove_messages',
    },
  ).then((r) => r.rows)
)

const participantsInChatroom = (db, chatroom_id) => (
  db.query(
    {
      text: `
        SELECT
          u.id AS user_id,
          u.email AS email,
          u.username AS username,
          u.avatar AS avatar,
          p.is_admin AS admin
        FROM users u
        JOIN participants p
          ON u.id = p.user_id
        WHERE p.chatroom_id = $1
      `,
      values: [chatroom_id],
      name: 'participants_in_chatroom',
    },
  ).then((r) => r.rows)
)

const updateChatroomName = (db, chatroom_id, chatroom_name) => (
  db.query(
    {
      text: 'UPDATE chatrooms SET name = $2 WHERE id = $1 RETURNING *;',
      values: [chatroom_id, chatroom_name],
      name: 'update_chatroom_name',
    },
  ).then((r) => r.rows[0])
)

const updateChatRoomAvatar = (db, chatroom_id, chatroom_avatar) => (
  db.query(
    {
      text: 'UPDATE chatrooms SET avatar = $2 WHERE id = $1 RETURNING *;',
      values: [chatroom_id, chatroom_avatar],
      name: 'update_chatroom_avatart',
    },
  ).then((r) => r.rows[0])
)

module.exports = {
  checkInChatAlready,
  createChatroom,
  addMultiChatroomParticipants,
  addChatroomParticipant,
  getActiveChatrooms,
  updateChatroom,
  updateChatroomParticipant,
  deleteChatroomParticipant,
  deleteViewableMsgs,
  participantsInChatroom,
  updateChatroomName,
  updateChatRoomAvatar,
}
