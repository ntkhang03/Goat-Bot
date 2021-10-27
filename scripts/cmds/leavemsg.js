this.config = {    
  name: "leavemsg",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "bật/tắt gửi tin nhắn tạm biệt",
  longDescription: "bật hoặc tắt gửi nhắn tạm biệt khi có thành viên out hoặc bị kick khỏi nhóm bạn",
  category: "box chat",
  guide: "{p}{n} on: bật"
       + "\n{p}{n} off: tắt"
};

module.exports = {
  config: this.config,
  start: async function({ args, threadsData, globalGoat, message, event }) {
    const { threadID } = event;
    const data = (await threadsData.getData(threadID)).data;
    
    if (args[0] == "on") data.sendLeaveMessage = true;
    else if (args[0] == "off") data.sendLeaveMessage = false;
    else message.SyntaxError();
    
    await threadsData.setData(threadID, {
      data
    }, (err, info) => {
      if (err) return message.reply(`Đã xảy ra lỗi, vui lòng thử lại sau: ${err.name}: ${err.message}`);
      message.reply(`Đã ${data.sendWelcomeMessage ? "bật" : "tắt"} gửi tin nhắn tạm biệt khi có thành viên out hoặc bị kick khỏi nhóm bạn`);
    });
  }
};