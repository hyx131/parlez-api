// TODO: error handling
const getUserInfo = (db, user_id) => (
  db.query(
    {
      text: 'SELECT email, username, avatar, status FROM users WHERE id = $1;',
      values: [user_id],
      name: 'get_user_info',
    },
  ).then((r) => r.rows[0])
)

const getNewFriendInfo = (db, email, user_id) => (
  db.query(
    {
      text: 'SELECT username, email, avatar, status, id FROM users WHERE email=$1 AND id != $2 AND is_active = true;',
      values: [email, user_id],
      name: 'get_new_friend_info',
    },
  ).then((r) => r.rows[0])
)

const getFriendInfo = (db, user_id) => (
  db.query(
    {
      text: `
        SELECT
          f.invitation_accepted_at,
          f.friend_id AS id,
          u.email AS email,
          u.username AS username,
          u.avatar AS avatar,
          u.status AS status
        FROM friendlists fl
        JOIN friends f
          ON fl.id = f.friendlist_id
        JOIN users u
          ON u.id = f.friend_id
        WHERE fl.user_id = $1 AND u.is_active = true;
      `,
      values: [user_id],
      name: 'get_friend_list',
    },
  ).then((r) => r.rows)
)

const deleteFriend = (db, user_id, friend_id) => (
  db.query(
    {
      text: `
        DELETE FROM friends
        WHERE id
        IN (
          SELECT f.id
          FROM users u
          JOIN friendlists fl
            ON u.id = fl.user_id
          JOIN friends f
            ON f.friendlist_id = fl.id
          WHERE (u.id = $1 AND f.friend_id = $2) OR (u.id = $2 AND f.friend_id = $1)
        )
        RETURNING *;
      `,
      values: [user_id, friend_id],
      name: 'delete_friend',
    },
  ).then(() => getFriendInfo(user_id))
)

const addFriend = (db, user_id, friend_id) => (
  db.query(
    {
      text: `
        INSERT INTO friends(friend_id, friendlist_id)
          SELECT $2, id FROM friendlists WHERE user_id = $1 RETURNING *;
      `,
      values: [user_id, friend_id],
      name: 'add_friend',
    },
  ).then(() => getFriendInfo(user_id))
)

const updateUsername = (db, user_id, username) => (
  db.query(
    {
      text: 'UPDATE users SET username = $2 WHERE id = $1 RETURNING *;',
      values: [user_id, username],
      name: 'update_username',
    },
  ).then((r) => r.rows[0])
)

const udpateAvatar = (db, user_id, avatar) => (
  db.query(
    {
      text: 'UPDATE users SET avatar = $2 WHERE id = $1 RETURNING *;',
      values: [user_id, avatar],
      name: 'update_avatar',
    },
  ).then((r) => r.rows[0])
)

const updateStatus = (db, user_id, status) => (
  db.query(
    {
      text: 'UPDATE users SET status = $2 WHERE id = $1 RETURNING *;',
      values: [user_id, status],
      name: 'update_status',
    },
  ).then((r) => r.rows[0])
)

module.exports = {
  getUserInfo,
  getNewFriendInfo,
  getFriendInfo,
  deleteFriend,
  addFriend,
  updateUsername,
  udpateAvatar,
  updateStatus,
}
