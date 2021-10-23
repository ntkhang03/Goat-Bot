module.exports = (event, api) => {
  return {
    send: function(text, callback) {
      if (callback && typeof callback == "function") return api.sendMessage(text, callback);
      else return api.sendMessage(text, event.threadID);
    },
    reply: function(text, callback) {
      if (callback && typeof callback == "function") return api.sendMessage(text, event.threadID, callback, event.messageID);
      else return api.sendMessage(text, event.threadID, event.messageID);
    },
    unsend: function(messageID, callback) {
      if (callback && typeof callback == "function") return api.unsendMessage(messageID, callback);
      else return api.unsendMessage(messageID);
    },
    reaction: function(emoji, messageID) {
      return api.setMessageReaction(emoji, function() {}, true);
    }
  };
  // Có thể phát sinh những giá trị khác trong handleEvents.js
  // Can generate other values in handleEvents.js
};