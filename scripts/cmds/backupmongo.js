this.config = {    
  name: "backupmongo",
  version: "1.0.0",
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
  start: async function({ args, message, event, globalGoat, usersModel, threadsModel }) {
    const fs = require("fs-extra");
    if (globalGoat.config.database.type != "mongodb") return message.send("Bạn phải sử dụng cơ sở dữ liệu mongdb mới có thề dùng lệnh này");
    let { senderID, threadID, messageID } = event;
    const pathThreads = __dirname + "/cache/dataThreads.json";
    const pathUsers = __dirname + "/cache/dataUsers.json";
    const Users = {};
    const findAllUser = await usersModel.find();
    for (let oneUser of findAllUser) Users[oneUser.id] = oneUser;
    const Threads = {};
    const findAllThread = await threadsModel.find();
  	for (let oneThread of findAllThread) Threads[oneThread.id] = oneThread;
  	  
    fs.writeFileSync(pathThreads, JSON.stringify(Threads, null, 2));
    fs.writeFileSync(pathUsers, JSON.stringify(Users, null, 2));
    var sendFile = [];
    sendFile.push(fs.createReadStream(pathThreads));
    sendFile.push(fs.createReadStream(pathUsers));
    message.reply({ attachment: sendFile }, () => {
      fs.unlinkSync(pathThreads);
      fs.unlinkSync(pathUsers);
    });
  }
    
};