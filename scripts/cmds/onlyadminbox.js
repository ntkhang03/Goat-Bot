const fs = require("fs-extra");
this.config = {    
  name: "onlyadminbox",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 1,
  shortDescription: "bật/tắt chỉ admin box sử dụng bot",
  longDescription: "bật/tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot",
  category: "box chat",
  guide: "{prefix}{name} [on|off]"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, message, event, client, threadsData }) {
    const threadData = await threadsData.getData(event.threadID);
    if (args[0] == "on") {
      threadsData.setData(event.threadID, {
        onlyAdminBox: true
      }, (e) => {
        if (e) return message.reply(`Đã xảy ra lỗi ${e.name}: ${e.message}`);
        message.reply("Đã bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot");
      });
    }
    else if (args[0] == "off") {
      threadsData.setData(event.threadID, {
        onlyAdminBox: false
      }, (e) => {
        if (e) return message.reply(`Đã xảy ra lỗi ${e.name}: ${e.message}`);
        message.reply("Đã tắt chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot");
      });
    }
    else return message.reply("Vui lòng chọn chế độ on hoặc off");
  }
};