const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "logsbot",
    type: ["log:subscribe", "log:unsubscribe"],
    condition: `(event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(item => item.userFbId == globalGoat.botID)) || (event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == globalGoat.botID)`,
    isBot: true,
    version: "1.0.2",
    author: { 
      name: "NTKhang", 
      contacts: ""
    },
    cooldowns: 5,
    envConfig: {
      logsbot: true
    }
  },
  start: async ({ globalGoat, args, allUserData, message, event, api, client }) => {
    
    if (!globalGoat.configCommands.envEvents.logsbot.logsbot) return;
    let msg = "====== Nhật ký bot ======";
    const { author, threadID } = event;
    if (author == globalGoat.botID) return;
    let threadName;
    
    if (event.logMessageType == "log:subscribe") {
      if (!event.logMessageData.addedParticipants.some(item => item.userFbId == globalGoat.botID)) return;
      if (globalGoat.config.nickNameBot) api.changeNickname(globalGoat.config.nickNameBot, event.threadID, globalGoat.botID);
      threadName = (await api.getThreadInfo(threadID)).threadName;
      const authorName = client.allUserData[author] ? client.allUserData[author].name : await api.getUserInfo(author)[author].name;
      msg += `\n✅\nHoạt động: bot được thêm vào nhóm mới` +
             `\nNgười thêm: ${authorName}`;
    }
    else if (event.logMessageType == "log:unsubscribe") {
      if (event.logMessageData.leftParticipantFbId != globalGoat.botID) return;
      const authorName = client.allUserData[author] ? client.allUserData[author].name : await api.getUserInfo(author)[author].name;
      threadName = client.allThreadData[threadID].name;
      msg += `\n❎\nHoạt động: bot bị kick` +
             `\nNgười kick: ${authorName}`;
    }
    const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
    msg += `\nUser ID: ${author}` +
           `\nThread Name: ${threadName}` +
           `\nThread ID: ${threadID}` +
           `\nThời gian: ${time}`;
    
    api.sendMessage(msg, globalGoat.config.adminBot[0]);
  }
};