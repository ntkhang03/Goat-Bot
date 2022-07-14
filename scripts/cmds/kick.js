module.exports = {
	config: {
		name: "kick",
		version: "1.0",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		shortDescription: "Kick thành viên",
		longDescription: "Kick thành viên khỏi box chat",
		category: "box chat",
		guide: "{p}{n} @tags: dùng để kick những người được tag"
	},

	start: async function ({ message, event, args, threadsData, api }) {
		const { adminIDs } = await threadsData.getData(event.threadID);
		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply("Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này");
		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
			}
			catch (e) {
				message.reply("Đã có lỗi xảy ra, hãy thêm bot làm quản trị viên và thử lại sau");
				return "ERROR";
			}
		}
		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();
			await kickAndCheckError(event.messageReply.senderID);
		}
		else {
			const uids = Object.keys(event.mentions);
			if (uids.length === 0)
				return message.SyntaxError();
			if (await kickAndCheckError(uids.shift()) === "ERROR")
				return;
			for (const uid of uids)
				api.removeUserFromGroup(uid, event.threadID);
		}
	}
};