this.config = {    
  name: "adduser",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
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
  start: function({ message, api, client, event, args }) {
    let uid;
    const fbtools = require("fb-tools");
    if (isNaN(args[0])) {
      fbtools.findUid(args[0])
      .then(id => uid = id)
      .catch(err => {
        return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
      });
    }
    else uid = args[0];
    const threadInfo = client.allThreadData[event.threadID];
    
    api.addUserToGroup(uid, event.threadID, (err) => {
      if (err) message.reply(err.errorDescription);
      else if (threadInfo.approvalMode && !threadInfo.adminIDs.includes(globalGoat.botID)) message.reply("Đã thêm người này vào danh sách phê duyệt");
      else message.reply("Thêm thành viên mới thành công! ");
    });
  }
};