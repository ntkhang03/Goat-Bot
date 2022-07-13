module.exports = {
	config: {
		name: "checkwarn",
		version: "1.0.0",
		type: ["log:subscribe"],
		author: {
			name: "NTKhang",
			contacts: ""
		},
	},
	start: async ({ threadsData, message, event, globalGoat, api, client }) => {
		const { threadID } = event;
		const { data, adminIDs } = await threadsData.getData(event.threadID);
		if (!data.warn) return;
		const { banned } = data.warn;
		const { addedParticipants } = event.logMessageData;
		for (const user of addedParticipants) {
			if (banned.includes(user.userFbId)) {
				message.send({
					body: `Thành viên này đã bị cảnh cáo đủ 3 lần trước đó và bị ban khỏi box\nName: ${user.fullName}\nUid: ${user.userFbId}\nĐể gỡ ban vui lòng sử dụng lệnh "${client.getPrefix(threadID)}warn unban <uid>" (với uid là uid của người muốn gỡ ban)`,
					mentions: [{
						tag: user.fullName,
						id: user.userFbId
					}]
				}, function () {
					api.removeUserFromGroup(user.userFbId, threadID, (err) => {
						if (err) return message.send(`Bot cần quyền quản trị viên để kick thành viên bị ban`);
					});
				});
			}
		}
	}
};