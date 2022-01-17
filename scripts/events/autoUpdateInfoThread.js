const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "autoUpdateInfoThread",
    version: "1.0.2",
    type: ["log:subscribe", "log:unsubscribe", "change_thread_admins", "log:thread-name", "change_thread_image", "log:thread-icon"],
    author: { 
      name: "NTKhang", 
      contacts: ""
    },
  },
  
  start: async ({ threadsData, message, event, globalGoat, api, client }) => {
    const { threadID, logMessageData, logMessageType } = event;
    const threadInfo = await threadsData.getData(event.threadID);
    if (logMessageType == "log:subscribe") {
      const dataAddedParticipants = event.logMessageData.addedParticipants;
      const { members } = threadInfo;
      for (const user of dataAddedParticipants) {
        const oldData = members[user.userFbId] || {};
        members[user.userFbId] = {
          ...oldData,
          ...{
            id: user.userFbId,
            name: user.fullName,
            nickname: null,
            inGroup: true,
            count: 0
          }
        };
      }
      await threadsData.setData(threadID, { members });
    }
    else if (logMessageType == 'log:unsubscribe') {
      const { members } = threadInfo;
      if (members[logMessageData.leftParticipantFbId]) {
        members[logMessageData.leftParticipantFbId].inGroup = false;
        await threadsData.setData(threadID, { members });
      }
    }
    else if (logMessageType == 'change_thread_admins') {
      const { adminIDs } = threadInfo;
      if (logMessageData.ADMIN_EVENT == "add_admin") adminIDs.push(logMessageData.TARGET_ID);
      else adminIDs.splice(adminIDs.findIndex(item => item == logMessageData.TARGET_ID), 1);
      await threadsData.setData(threadID, {adminIDs});
    }
    else if (logMessageType == 'log:thread-name') {
      const newName = logMessageData.name;
      await threadsData.setData(threadID, { name: newName });
    }
    else if (logMessageType == 'change_thread_image') {
      await threadsData.setData(threadID, { avatarbox: event.image.url });
    }
    else if (logMessageType == 'log:thread-icon') {
      await threadsData.setData(threadID, { emoji: logMessageData.thread_icon });
    }
  }
};