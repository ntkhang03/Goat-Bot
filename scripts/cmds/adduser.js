this.config = {    
  name: "adduser",
  version: "1.0.2",
  author: {
    name: "HungCho", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Thêm thành viên vào box chat",
  longDescription: "Thêm thành viên vào box chat của bạn",
  category: "info",
  guide: "{p}{n} [link profile|uid]",
  packages: "fb-tools"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, client, event, args, globalGoat }) {
    let id;
    const fbtools = require("fb-tools");
    if(event.body.length == 0) return message.reply("Vui lòng nhập một link hoặc id.");
    if (isNaN(args[0])) {
      try {
        id = await fbtools.findUid(args[0]);
      }
      catch(err) {
        return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
      };
    }
    else id = args[0];
    const threadInfo = await api.getThreadInfo(event.threadID);
    if(threadInfo.participantIDs.includes(id)) return message.reply("Người dùng đã ở trong nhóm.");
    if (threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) return api.addUserToGroup(id, event.threadID, err => {
      if(err) return message.reply("Không thể thêm người dùng vào nhóm.")
    });
  
    if (!threadInfo.adminIDs.some(item => item.id == api.getCurrentUserID())) {
     if (threadInfo.approvalMode == true) {
      api.addUserToGroup(id, event.threadID, err => {
        if(err) return message.reply("Không thể thêm người dùng vào nhóm.");
        message.reply(`Đã thêm người dùng có ${id} vào danh sách phê duyệt.`);
      });
     } 
     else {
      api.addUserToGroup(id, event.threadID, err => {
        if(err) return message.reply("Không thể thêm người dùng vào nhóm.");
      });
     }
   }
 }
   






};
