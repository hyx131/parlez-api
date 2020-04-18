const formatSingleMessage = (msg) => (
  {
    chatroom: msg.chatroom_id,
    message: {
      id: msg.message_id,
      user_id: msg.user_id,
      content: msg.content,
      deleted: msg.deleted,
      username: msg.username,
      created_at: msg.created_at,
    },
  }
)

const formatChatroomMessages = (messages) => {
  const chatroomArr = []
  let distinctChatrooms = new Set()

  messages.forEach((msg) => distinctChatrooms.add(msg.chatroom_id))

  // TODO: compare with Array.from(set) -> convert to array
  distinctChatrooms = [...distinctChatrooms]

  distinctChatrooms.forEach((chatroom) => {
    if (!chatroomArr.find((rm) => chatroomArr.id === rm)) {
      const { name, avatar, type, chatroom_id: id } = messages.find((msg) => msg.chatroom_id === chatroom)
      const newChatroom = { id, type, name, avatar, messages: [] }
      chatroomArr.push(newChatroom)
    }
  })

  chatroomArr.forEach((room, i) => {
    messages.forEach((msg) => {
      if (msg.chatroom_id === room.id) {
        const { message_id: id, user_id, content, deleted, username, created_at } = msg
        const newMsg = { id, user_id, content, deleted, username, created_at }
        chatroomArr[i].messages.push(newMsg)
      }
    })
  })

  return chatroomArr
}

module.exports = { formatSingleMessage, formatChatroomMessages }
