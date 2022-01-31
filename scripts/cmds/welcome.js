this.config = {    
  name: "welcome",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "bật/tắt gửi  tin nhắn chào mừng",
  longDescription: "bật hoặc tắt gửi nhắn chào mừng khi có thành viên mới tham gia nhóm chat của bạn",
  category: "custom",
  guide: "{p}{n} on: bật"
       + "\n{p}{n} off: tắt"
};

module.exports = {
  config: this.config,
  start: async function({ args, threadsData, globalGoat, message, event, role }) {
    const { threadID } = event;
    const data = (await threadsData.getData(threadID)).data;
    
    if (args[0] == "on") data.sendWelcomeMessage = true;
    else if (args[0] == "off") data.sendWelcomeMessage = false;
    else message.reply("Vui lòng chọn on hoặc off");
    
    await threadsData.setData(threadID, {
      data
    }, (err, info) => {
      if (err) return message.reply(`Đã xảy ra lỗi, vui lòng thử lại sau: ${err.name}: ${err.message}`);
      message.reply(`Đã ${data.sendWelcomeMessage ? "bật" : "tắt"} gửi tin nhắn chào mừng khi có thành viên mới tham gia nhóm chat của bạn`);
    });
  }
};