module.exports = (event, api) => {
	return {
		send: async (form, callback) => await api.sendMessage(form, event.threadID, callback),
		reply: async (form, callback) => await api.sendMessage(form, event.threadID, callback, event.messageID),
		unsend: async (messageID, callback) => await api.unsendMessage(messageID, callback),
		reaction: async (emoji, messageID, callback) => await api.setMessageReaction(emoji, messageID, callback, true)
	};
	// Có thể phát sinh những giá trị khác trong handleEvents.js
	// Can generate other values in handleEvents.js
};