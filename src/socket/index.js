const h = require('./helpers')


module.exports = (db, io) => () => {
  const participantSockets = {}

  io.on('connect', (socket) => {
    socket.on('initialize', (data) => {
      socket.userid = data
      const currentSocket = participantSockets[socket.userid]
      if (currentSocket && io.sockets.sockets[currentSocket]) {
        io.to(currentSocket).emit('to be disconnected...')
        io.sockets.sockets[currentSocket].disconnect()
      }
      participantSockets[socket.userid] = socket.id

      h.initialLoad(socket.userid)
      socket.on('create new chatroom', (d) => {
        const { type, name, usersArr, avatar } = d
        h.createNewChatroom(db, io, participantSockets, type, name, socket.userid, usersArr, avatar)
      })
      socket.on('send message', (msg) => {
        const { userId, chatroomId, content } = msg
        h.createNewMsg(db, io, userId, chatroomId, content)
      })
      socket.on('delete msg', (d) => h.deleteMsg(db, socket, socket.userid, d.msg_id, d.creatorId))
      socket.on('delete chatroom button', (rm_id) => h.deleteViewableMsgs(db, socket, socket.userid, rm_id))
      socket.on('search friend', (d) => h.searchNewFriend(db, socket, d.email, socket.userid))
      socket.on('add new friend', (f) => h.addFriend(db, socket, socket.userid, f.id))
      socket.on('delete friend', (f) => h.deleteFriend(db, socket, socket.userid, f))
      socket.on('create single chat', (d) => {
        const { type, name, creatorUserId, usersArr, avatar } = d
        h.createNewChatroom(db, io, participantSockets, type, name, creatorUserId, usersArr, avatar)
      })
      socket.on('create group chat', (d) => {
        const { type, name, creatorUserId, usersArr, avatar } = d
        h.createNewChatroom(db, io, participantSockets, type, name, creatorUserId, usersArr, avatar)
      })
      socket.on('change name', (d) => h.updateUsername(db, socket, d.creatorUserId, d.username))
      socket.on('change status', (d) => h.updateStatus(db, socket, d.creatorUserId, d.status))
      socket.on('leave chatroom', (d) => h.leaveChatroom(db, io, participantSockets, d.user_id, d.chatroom_id))
      socket.on('change url', (d) => h.updateAvatar(db, socket, d.creatorUserId, d.avatar))
      socket.on('change chat name', (d) => h.updateChatroomName(db, io, d.chatroomId, d.name))
      socket.on('change chat avatar', (d) => h.updateChatroomAvatar(db, io, d.chatroomId, d.avatar))
      socket.on('fetch chatroom participants', (d) => h.fetchChatroomParticipants(db, socket, d))
      socket.on('add chatroom participants', (d) => (
        h.addParticipantsToChatroom(db, io, participantSockets, d.id, d.usersArr)
      ))
      socket.on('fetch friend list', () => h.refreshFriendList(db, socket, socket.userid))
    })
  })
}
