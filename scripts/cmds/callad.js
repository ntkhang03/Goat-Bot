this.config = {
  name: "callad",
  version: "1.0.1",
  author: { 
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "gửi báo cáo về admin bot",
  longDescription: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
  category: "contacts admin",
  guide: "{prefix}{name} <tin nhắn>"
};
  
module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, message, api, event, usersData, threadsData }) {
    if (!args[0]) return message.reply("Vui lòng nhập tin nhắn bạn muốn gửi về admin");
    const { senderID, threadID, isGroup } = event;
    
    const userData = await usersData.getData(senderID);
    const nameSender = userData.name;
    let msg = "==📨️ Báo cáo 📨️=="
    +`\n${userData.gender == 2 ? "🚹" : "🚺"} Name: ${nameSender}`
    +`\n🆔 User ID: ${senderID}`;
    
    msg += `\n👨‍👩‍👧‍👦 Từ ` + isGroup ? `nhóm: ${(await threadsData.getData(threadID)).name}`
      +`\n🆔 Thread ID: ${threadID}` : "cá nhân";
      
    api.sendMessage({
      body: msg + `\n🆎 Nội dung: ${args.join(" ")}\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng`,
      mentions: [{
        id: senderID,
        tag: nameSender
      }]
    }, globalGoat.config.adminBot[0], (err, info) => {
      if (err) return message.reply(`Đã xảy ra lỗi: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
      message.reply("Đã gửi báo cáo của bạn về admin thành công");
      globalGoat.whenReply[info.messageID] = {
        nameCmd: this.config.name,
        messageID: info.messageID,
        messageIDSender: event.messageID,
        threadIDSender: threadID,
        type: "userCallAdmin"
      };
    });
  },
  
  whenReply: async ({ globalGoat, args, event, api, message, Reply, usersData }) => {
    const { messageIDSender, threadIDSender, type } = Reply;
    const nameSender = (await usersData.getData(event.senderID)).name;
    
    switch (type) {
      case "userCallAdmin":
        api.sendMessage({
          body: `📍 Phản hồi từ admin ${nameSender}\n${args.join(" ")}`
          + `\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin`,
          mentions: [{
            id: event.senderID,
            tag: nameSender
          }]
        }, threadIDSender, (err, info) => {
          if (err) return message.reply(`Đã xảy ra lỗi: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
          globalGoat.whenReply[info.messageID] = {
            nameCmd: this.config.name,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadIDSender: event.threadID, 
            type: "adminReply"
          };
        }, messageIDSender);
        break;
      case "adminReply":
        api.sendMessage({
          body: `📝 Phản hồi từ người dùng ${nameSender}:`
              + `\n🆔: ${event.senderID}`
              + `\n🗣️: ${nameSender}`
              + `\nNội dung:\n${args.join(" ")}`
              + `\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng`,
          mentions: [{
            id: event.senderID,
            tag: nameSender
          }]
        }, threadIDSender, (err, info) => {
          if (err) return message.reply(`Đã xảy ra lỗi: ${err.name ? err.name + " " + err.message : err.errorSummary + "\n" + err.errorDescription}`);
          globalGoat.whenReply[info.messageID] = {
            nameCmd: this.config.name,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadIDSender: event.threadID, 
            type: "userCallAdmin"
          };
        }, messageIDSender);
        break;
      default:
        break;
    }
    
  }
};