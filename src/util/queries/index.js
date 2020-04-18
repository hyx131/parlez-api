const chatRmMsg = require('./chatroom-msg')
const chatRm = require('./chatroom')
const users = require('./users')
const auth = require('./auth-queries')


module.exports = {
  getInitialChatroomMsg: chatRmMsg.getInitialChatroomMsg,
  getAllChatroomMsgs: chatRmMsg.getAllChatroomMsgs,
  getSingleChatroomMsg: chatRmMsg.getSingleChatroomMsg,
  getRecentChatroomMsgs: chatRmMsg.getRecentChatroomMsgs,
  getChatroomMsgs: chatRmMsg.getChatroomMsgs,
  deleteChatroomMsg: chatRmMsg.deleteChatroomMsg,
  deleteChatroomMsgViews: chatRmMsg.deleteChatroomMsgViews,
  getNewSpecificChatroomMsg: chatRmMsg.getNewSpecificChatroomMsg,
  createChatroomMsg: chatRmMsg.createChatroomMsg,
  checkInChatAlready: chatRm.checkInChatAlready,
  createChatroom: chatRm.createChatroom,
  addMultiChatroomParticipants: chatRm.addMultiChatroomParticipants,
  addChatroomParticipant: chatRm.addChatroomParticipant,
  getActiveChatrooms: chatRm.getActiveChatrooms,
  updateChatroom: chatRm.updateChatroom,
  updateChatroomParticipant: chatRm.updateChatroomParticipant,
  deleteChatroomParticipant: chatRm.deleteChatroomParticipant,
  deleteViewableMsgs: chatRm.deleteViewableMsgs,
  participantsInChatroom: chatRm.participantsInChatroom,
  updateChatroomName: chatRm.updateChatroomName,
  updateChatRoomAvatar: chatRm.updateChatRoomAvatar,
  getUserInfo: users.getUserInfo,
  getNewFriendInfo: users.getNewFriendInfo,
  getFriendInfo: users.getFriendInfo,
  deleteFriend: users.deleteFriend,
  addFriend: users.addFriend,
  updateUsername: users.updateUsername,
  udpateAvatar: users.udpateAvatar,
  updateStatus: users.updateStatus,
  getUserByEmailDB: auth.getUserByEmailDB,
  getUserByUserIdDB: auth.getUserByUserIdDB,
  createFriendListDB: auth.createFriendListDB,
  addUserDB: auth.addUserDB,
}
