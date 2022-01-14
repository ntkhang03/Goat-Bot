this.config = {    
  name: "backupmongo",
  version: "2.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "Convert mongodb to json",
  longDescription: "Sao lưu lại dữ liệu trên mongodb về json",
  category: "owner",
  guide: "{prefix}backupmongo"
};

module.exports = {
  config: this.config,
  start: async function({ args, message, event, globalGoat }) {
    const fs = require("fs-extra");
    if (globalGoat.config.database.type != "mongodb") return message.send("Bạn phải sử dụng cơ sở dữ liệu mongdb mới có thể dùng lệnh này");
    const { senderID, threadID, messageID } = event;
    const pathThreads = __dirname + "/cache/dataThreads.json";
    const pathUsers = __dirname + "/cache/dataUsers.json";
    const dataModels = require("../../database/dataProcessing/models/dataModels.js");
    
    const dataAllThreads = (await dataModels.find({ type: "thread"}))[0].data || {};
    const dataAllUsers = (await dataModels.find({ type: "user"}))[0].data || {};
    
    fs.writeFileSync(pathThreads, JSON.stringify(dataAllThreads, null, 2));
    fs.writeFileSync(pathUsers, JSON.stringify(dataAllUsers, null, 2));
    
    const sendFile = [];
    sendFile.push(fs.createReadStream(pathThreads));
    sendFile.push(fs.createReadStream(pathUsers));
    message.reply({
      attachment: sendFile
    }, () => {
      fs.unlinkSync(pathThreads);
      fs.unlinkSync(pathUsers);
    });
  }
    
};