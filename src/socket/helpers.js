const q = require('../util/queries')


// TODO: error handling
const botMsgCreateContent = (type_of_action, user) => {
  let msg = ''
  switch (type_of_action) {
    case 'user joined chatroom':
      msg += `${user} has joined the chatroom.`
      return msg
    case 'user left chatroom':
      msg += `${user} has left the chatroom.`
      return msg
    case 'user created chatroom':
      msg += `${user} has created the chatroom.`
      return msg
    case 'user admin status updated':
      msg += `${user} admin status been changed.`
      return msg
    case 'reopen chatroom':
      msg += `${user} has requested to restart chatroom.`
      return msg
    default:
      return null
  }
}

const botMsgEmit = async (db, io, chatroom_id, type_of_action, user_id) => {
  try {
    const userName = await q.getUserInfo(db, user_id)
    const msgContent = botMsgCreateContent(type_of_action, userName.username)
    const botMsg = await q.createChatroomMsg(db, 0, chatroom_id, msgContent)

    io.to(chatroom_id).emit('new chatroom message', botMsg[0])
  } catch (err) {
    console.error(err)
  }
}

const initialLoad = async (db, socket, user_id) => {
  try {
    const activeChatrooms = await q.getActiveChatrooms(db, user_id)
    const recentChatroomMsgs = await q.getRecentChatroomMsgs(db, user_id)
    const friendList = await q.getFriendInfo(db, user_id)
    const userInfo = await q.getUserInfo(db, user_id)

    activeChatrooms.forEach((rm) => socket.join(rm.chatroom_id))
    socket.emit('initial message data', recentChatroomMsgs)
    socket.emit('friendlist data', friendList)
    socket.emit('initial user information', userInfo)
  } catch (err) {
    console.error(err)
  }
}

const refreshFriendList = async (db, socket, user_id) => {
  try {
    const friendList = await q.getFriendInfo(db, user_id)
    socket.emit('friendlist data', friendList)
  } catch (err) {
    console.error(err)
  }
}

const createNewChatroom = async (db, io, participantSockets, type, name, creatorUserId, usersArr, avatar = '') => {
  try {
    if (type === 'single') {
      const existingChatroom = await q.checkInChatAlready(db, usersArr[0], usersArr[1])
      if (existingChatroom) {
        await botMsgEmit(db, io, existingChatroom.chatroom_id, 'reopen chatroom', creatorUserId)
        return
      }
    }

    const newParticipants = await q.createChatroom(db, type, name, creatorUserId, usersArr, avatar)
    const newChatroomId = newParticipants[0].chatroom_id

    usersArr.forEach((u) => {
      if (io.sockets.sockets[participantSockets[u]]) {
        io.sockets.sockets[participantSockets[u]].join(newChatroomId)
      }
    })

    botMsgEmit(db, io, newChatroomId, 'user created chatroom', creatorUserId)

    usersArr.forEach((u) => {
      botMsgEmit(db, io, newChatroomId, 'user joined chatroom', u)
    })
  } catch (err) {
    console.error(err)
  }
}

const createNewMsg = async (db, io, user_id, chatroom_id, content) => {
  try {
    const newChatroomMsg = await q.createChatroomMsg(db, user_id, chatroom_id, content)
    io.to(chatroom_id).emit('new chatroom message', newChatroomMsg[0])
  } catch (err) {
    console.error(err)
  }
}

const deleteMsg = async (db, socket, user_id, message_id, creator_id) => {
  try {
    await q.deleteChatroomMsg(db, user_id, message_id)
    await q.deleteChatroomMsgViews(db, user_id, message_id)
    const deletedMsg = await q.getSingleChatroomMsg(message_id)

    socket.emit('delete my message', deletedMsg)

    if (user_id === creator_id) {
      socket.to(deletedMsg.chatroom).emit('delete owner message', deletedMsg)
    }
  } catch (err) {
    console.error(err)
  }
}

const deleteViewableMsgs = async (db, socket, user_id, chatroom_id) => {
  try {
    await q.deleteViewableMsgs(db, user_id, chatroom_id)
    socket.emit('delete viewable messages', chatroom_id)
  } catch (err) {
    console.error(err)
  }
}

const leaveChatroom = async (db, io, participantSockets, user_id, chatroom_id) => {
  try {
    if (io.sockets.sockets[participantSockets[user_id]]) {
      io.sockets.sockets[participantSockets[user_id]].leave(chatroom_id)
    }

    await q.deleteViewableMsgs(db, user_id, chatroom_id)
    await q.deleteChatroomParticipant(db, user_id, chatroom_id)

    botMsgEmit(db, io, chatroom_id, 'user left chatroom', user_id)
  } catch (err) {
    console.error(err)
  }
}

const addParticipantsToChatroom = async (db, io, participantSockets, chatroom_id, usersArr) => {
  try {
    await q.addMultiChatroomParticipants(db, usersArr, chatroom_id)
    usersArr.forEach((u) => {
      if (io.sockets.sockets[participantSockets[u]]) {
        io.sockets.sockets[participantSockets[u]].join(chatroom_id)
      }
    })
    usersArr.forEach((u) => {
      botMsgEmit(db, io, chatroom_id, 'user joined chatroom', u)
    })
  } catch (err) {
    console.error(err)
  }
}

const addFriend = async (db, socket, user_id, friend_id) => {
  try {
    const fl = await q.addFriend(db, user_id, friend_id)
    await q.addFriend(db, friend_id, user_id)

    socket.emit('friendlist data', fl)
  } catch (err) {
    console.error(err)
  }
}

const deleteFriend = async (db, socket, user_id, friend_id) => {
  try {
    const fl = await q.deleteFriend(db, user_id, friend_id)
    socket.emit('friendlist data', fl)
  } catch (err) {
    console.error(err)
  }
}

const searchNewFriend = async (db, socket, email, user_id) => {
  try {
    const f = await q.getNewFriendInfo(db, email, user_id)
    if (!f) throw new Error()

    socket.emit('found friend', f)
  } catch (err) {
    console.error(err)
  }
}

const updateUsername = async (db, socket, user_id, username) => {
  try {
    const newUserProfile = await q.updateUsername(db, user_id, username)
    socket.emit('updated username data', newUserProfile)
  } catch (err) {
    console.error(err)
  }
}

const updateAvatar = async (db, socket, user_id, avatar) => {
  try {
    const newUserAvatar = await q.updateAvatar(db, user_id, avatar)
    socket.emit('updated avatar data', newUserAvatar)
  } catch (err) {
    console.error(err)
  }
}

const updateStatus = async (db, socket, user_id, status) => {
  try {
    const newStatus = await q.updateStatus(db, user_id, status)
    socket.emit('updated status data', newStatus)
  } catch (err) {
    console.error(err)
  }
}

const updateChatroomName = async (db, io, chatroom_id, name) => {
  try {
    const updatedChatroomInfo = await q.updateChatroomName(db, chatroom_id, name)
    io.to(chatroom_id).emit('updated chat data', updatedChatroomInfo)
  } catch (err) {
    console.error(err)
  }
}

const updateChatroomAvatar = async (db, io, chatroom_id, avatar) => {
  try {
    const updated = await q.updateChatRoomAvatar(db, chatroom_id, avatar)
    io.to(chatroom_id).emit('updated chat data', updated)
  } catch (err) {
    console.error(err)
  }
}

const fetchChatroomParticipants = async (db, socket, chatroom_id) => {
  try {
    const p = await q.participantsInChatroom(db, chatroom_id)
    socket.emit('get chatroom participants', p)
  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  initialLoad,
  refreshFriendList,
  createNewChatroom,
  createNewMsg,
  deleteMsg,
  deleteViewableMsgs,
  leaveChatroom,
  addParticipantsToChatroom,
  addFriend,
  deleteFriend,
  searchNewFriend,
  updateUsername,
  updateAvatar,
  updateStatus,
  updateChatroomName,
  updateChatroomAvatar,
  fetchChatroomParticipants,
}
