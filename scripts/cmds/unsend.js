this.config = {    
  name: "unsend",
  version: "1.0.2",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Gỡ tin nhắn của bot",
  longDescription: "Gỡ tin nhắn của bot",
  category: "info",
  guide: "Reply tin nhắn của bot với nội dung {p}{n}"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, event, args, globalGoat }) {
		if (event.type != "message_reply") return message.reply('Vui lòng reply tin nhắn của bot cần gỡ');
    if (event.messageReply.senderID != globalGoat.botID) return message.reply('Không thể gỡ tin nhắn của người khác!!');
	  return api.unsendMessage(event.messageReply.messageID);
  }
};