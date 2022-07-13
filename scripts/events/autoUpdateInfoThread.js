const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "autoUpdateInfoThread",
		version: "1.0.3",
		type: ["log:subscribe", "log:unsubscribe", "change_thread_admins", "log:thread-name", "change_thread_image", "log:thread-icon"],
		author: {
			name: "NTKhang",
			contacts: ""
		},
	},

	start: async ({ threadsData, message, event, globalGoat, api, client }) => {
		const { threadID, logMessageData, logMessageType } = event;
		const threadInfo = await threadsData.getData(event.threadID);
		const { members, adminIDs } = threadInfo;
		if (logMessageType == "log:subscribe") {
			const dataAddedParticipants = event.logMessageData.addedParticipants;
			for (const user of dataAddedParticipants) {
				const oldData = members[user.userFbId] || {};
				const getThreadInfo_Fca = await api.getThreadInfo(threadID);
				const { userInfo, nicknames } = getThreadInfo_Fca;
				members[user.userFbId] = {
					id: user.userFbId,
					name: user.fullName,
					gender: userInfo.find(u => u.id == user.userFbId).gender,
					nickname: nicknames[user.userFbId] || null,
					inGroup: true,
					count: oldData.count || 0
				};
			}
			await threadsData.setData(threadID, { members });
		}
		else if (logMessageType == 'log:unsubscribe') {
			if (members[logMessageData.leftParticipantFbId]) {
				members[logMessageData.leftParticipantFbId].inGroup = false;
				await threadsData.setData(threadID, { members });
			}
		}
		else if (logMessageType == 'change_thread_admins') {
			if (logMessageData.ADMIN_EVENT == "add_admin") adminIDs.push(logMessageData.TARGET_ID);
			else adminIDs.splice(adminIDs.findIndex(uid => uid == logMessageData.TARGET_ID), 1);
			await threadsData.setData(threadID, { adminIDs });
		}
		else if (logMessageType == 'log:thread-name') {
			const threadName = logMessageData.name;
			await threadsData.setData(threadID, { name: threadName });
		}
		else if (logMessageType == 'change_thread_image') {
			await threadsData.setData(threadID, { avatarbox: event.image.url });
		}
		else if (logMessageType == 'log:thread-icon') {
			await threadsData.setData(threadID, { emoji: logMessageData.thread_icon });
		}
	}
};