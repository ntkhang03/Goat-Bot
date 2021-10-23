const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "welcome",
    version: "1.0.0",
    type: ["log:subscribe"],
    author: { 
      name: "NTKhang", 
      contacts: ""
    },
  },
  start: async ({ threadsData, message, event, globalGoat, api, client }) => {
    const hours = moment.tz("Asia/Ho_Chi_Minh").format("HH");
    const { threadID } = event;
    const { prefix } = globalGoat.config;
    // Nếu là bot;
    if (event.logMessageData.addedParticipants.some(item => item.userFbId == globalGoat.botID)) {
      return message.send(`Thank you for inviting me!\nPrefix bot: ${globalGoat.config.prefix}\nĐể xem danh sách lệnh hãy nhập: ${globalGoat.config.prefix}help`);
    }
    
    // Nếu là thành viên mới:
    const threadData = client.allThreadData[threadID].data;
    if (!threadData.sendWelcomeMessage) return;
    const boxName = client.allThreadData[threadID].name;
    const userName = [], mentions = [];
    let multiple = false;
    const dataAddedParticipants = event.logMessageData.addedParticipants;
    if (dataAddedParticipants.length > 1) multiple = true;
    for (let user of dataAddedParticipants) {
      userName.push(user.fullName);
      mentions.push({ 
        tag: user.fullName, 
        id: user.userFbId
      });
    }
    // {userName}: tên của thành viên mới
    // {boxName}:  tên của nhóm chat
    // {multiple}: bạn || các bạn
    // {session}:  buổi trong ngày
    const messageWelcomeDefault = `Xin chào {userName}.\nChào mừng {multiple} đã đến với nhóm chat: {boxName}\nChúc {multiple} có một buổi {session} vui vẻ =)`;
    let messageWelcome = threadData.welcomeMessage || messageWelcomeDefault;
    messageWelcome = messageWelcome
    .replace(/\{userName}/g, userName.join(", "))
    .replace(/\{boxName}/g, boxName)
    .replace(/\{multiple}/g, multiple ? "các bạn" : "bạn")
    .replace(/\{session}/g, hours <= 10 ? "sáng" : 
    hours > 10 && hours <= 12 ? "trưa" :
    hours > 12 && hours <= 18 ? "chiều" : "tối");
      
    const form = {
      body: messageWelcome,
      mentions
    };
    threadData.welcomeAttachment ? form.attachment = fs.createReadStream(__dirname + "/src/mediaWelcome/"+threadData.welcomeAttachment) : "";
    
    message.send(form);
  }
};