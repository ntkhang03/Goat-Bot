module.exports = (event, api) => {
  return {
    send: (form, callback) =>  api.sendMessage(form, event.threadID, callback),
    reply: (form, callback) => api.sendMessage(form, event.threadID, event.messageID),
    unsend: (messageID, callback) => api.unsendMessage(messageID),
    reaction: (emoji, messageID) => api.setMessageReaction(emoji, messageID, () => {}, true)
  };
  // Có thể phát sinh những giá trị khác trong handleEvents.js
  // Can generate other values in handleEvents.js
};