this.config = {    
  name: "adduser",
  version: "1.0.4",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Thêm thành viên vào box chat",
  longDescription: "Thêm thành viên vào box chat của bạn",
  category: "box chat",
  guide: "{p}{n} [link profile|uid]",
  packages: "fb-tools"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, client, event, args, globalGoat }) {
    let uid;
    const fbtools = require("fb-tools");
    if (isNaN(args[0])) {
      try {
        uid = await fbtools.findUid(args[0]);
      }
      catch(err) {
        return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
      }
    }
    else uid = args[0];
    
    const threadInfo = await api.getThreadInfo(event.threadID);
    
    if (threadInfo.participantIDs.includes(uid)) return message.reply("Người này đã có trong nhóm của bạn");
    
    api.addUserToGroup(uid, event.threadID, (err) => {
      if (err) message.reply(err.errorDescription);
      else if (threadInfo.approvalMode && !threadInfo.adminIDs.some(item => item.id == globalGoat.botID)) message.reply("Đã thêm người này vào danh sách phê duyệt");
      else message.reply("Thêm thành viên mới thành công!");
    });
  }
};