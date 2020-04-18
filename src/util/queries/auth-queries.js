const getUserByEmailDB = (db, email, next) => (
  db.query(
    {
      text: 'SELECT * FROM users WHERE email = $1;',
      values: [email],
      name: 'get_user_by_email',
    },
  ).then((r) => r.rows[0]).catch(next) // TODO: next || custom error
)

const getUserByUserIdDB = (db, userId, next) => (
  db.query(
    {
      test: 'SELECT * FROM users WHERE id = $1;',
      values: [userId],
      name: 'get_user_by_id',
    },
  ).then((r) => r.rows[0]).catch(next)
)

const createFriendListDB = (db, id, next) => (
  db.query(
    {
      text: 'INSERT INTO friendlists(user_id) VALUES ($1) RETURNING *;',
      values: [id],
      name: 'create_friend_list',
    },
  ).then((r) => r.rows[0]).then(next)
)

const addUserDB = (db, username, email, pw, next) => (
  db.query(
    {
      text: `INSERT INTO users(username, email, password)
      VALUES ($1, $2, $3) RETURNING *;`,
      values: [username, email, pw],
      name: 'add_user_db',
    },
  ).then((r) => r.rows[0]).catch(next)
)

module.exports = {
  getUserByEmailDB,
  getUserByUserIdDB,
  createFriendListDB,
  addUserDB,
}
