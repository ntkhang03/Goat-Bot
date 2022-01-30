this.config = {
  name: "logsbot",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "bật/tắt ghi nhật ký bot",
  longDescription: "bật hoặc tắt gửi tin nhắn khi bot được thêm vào nhóm mới hoặc bị kick về admin",
  category: "box chat",
  guide: "{p}{n} on: bật"
       + "\n{p}{n} off: tắt"
};

module.exports = {
  config: this.config,
  start: async function({ args, client, globalGoat, message }) {
    const fs = require("fs-extra");
    if (args[0] == "on") globalGoat.configCommands.envEvents.logsbot.logsbot = true;
    else if (args[0] == "off") globalGoat.configCommands.envEvents.logsbot.logsbot = false;
    else message.reply('Vui lòng chọn on hoặc off');
    fs.writeFileSync(client.dirConfigCommands, JSON.stringify(globalGoat.configCommands, null, 2));
    message.reply(`Đã ${globalGoat.configCommands.envEvents.logsbot.logsbot ? "bật" : "tắt"} gửi tin nhắn khi bot được thêm vào nhóm mới hoặc bị kick về admin`);
  }
};