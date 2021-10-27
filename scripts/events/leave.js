const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "leave",
    version: "1.0.1",
    type: ["log:unsubscribe"],
    author: { 
      name: "NTKhang", 
      contacts: ""
    },
  },
  start: async ({ threadsData, message, event, globalGoat, api, client, usersData }) => {
    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == globalGoat.botID) return;
    const hours = moment.tz("Asia/Ho_Chi_Minh").format("HH");
    const { threadID } = event;
    const threadData = client.allThreadData[threadID];
    if (threadData.data.sendLeaveMessage == false) return;
    
    const messageLeaveDefault = "{userName} đã {type} khỏi nhóm";
    let messageLeave = threadData ? threadData.data.leaveMessage || messageLeaveDefault : messageLeaveDefault;
    const boxName = messageLeave.includes("{boxName}") ? (await api.getThreadInfo(threadID)).threadName : ""; // hạn chế block acc
    const userName = (await usersData.getData(leftParticipantFbId)).name;
    // {userName}: tên của thành viên bị kick / tự out
    // {type}: tự rời/bị qtv kick
    // {boxName}:  tên của nhóm chat
    // {session}: buổi tring ngày
    messageLeave = messageLeave
    .replace(/\{userName}/g, userName)
    .replace(/\{type}/g, leftParticipantFbId == event.author ? "tự rời" : "bị quản trị viên xóa")
    .replace(/\{boxName}/g, boxName)
    .replace(/\{session}/g, hours <= 10 ? "sáng" : 
    hours > 10 && hours <= 12 ? "trưa" :
    hours > 12 && hours <= 18 ? "chiều" : "tối");
    
    const form = {
      body: messageLeave,
      mentions: [{
        id: leftParticipantFbId,
        tag: userName
      }]
    };
    threadData.data.leaveAttachment ? form.attachment = fs.createReadStream(__dirname + "/src/mediaLeave/" + threadData.data.leaveAttachment) : "";
    
    message.send(form);
  }
};