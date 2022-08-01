const qs = require('querystring');
const axios = require('axios');

this.config = {
	name: "adduser",
	version: "1.0.9",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "Thêm thành viên vào box chat",
	longDescription: "Thêm thành viên vào box chat của bạn",
	category: "box chat",
	guide: "{p}{n} [link profile|uid]",
	packages: "querystring"
};

async function findUid(link) {
	const response = await axios.post("https://id.traodoisub.com/api.php", qs.stringify({ link }));
	const uid = response.data.id;
	if (!uid) {
		const err = new Error(response.data.error);
		for (const key in response.data)
			err[key] = response.data[key];
		throw err;
	}
	return uid;
}

module.exports = {
	config: this.config,
	start: async function ({ message, api, event, args }) {
		const threadInfo = await api.getThreadInfo(event.threadID);
		const success = [{
			type: "success",
			uids: []
		},
		{
			type: "waitApproval",
			uids: []
		}];
		const failed = [];

		function checkAndPushError(messageError, item) {
			const findType = failed.find(error => error.type == messageError);
			if (findType) findType.uids.push(item);
			else failed.push({
				type: messageError,
				uids: [item]
			});
		}

		for (const item of args) {
			let uid;
			if (isNaN(item)) {
				try {
					uid = await findUid(item);
				}
				catch (err) {
					checkAndPushError(err.message, item);
					continue;
				}
			}
			else uid = item;

			if (threadInfo.participantIDs.includes(uid)) {
				checkAndPushError("Đã có trong nhóm", item);
			}
			else {
				try {
					await api.addUserToGroup(uid, event.threadID);
					const botID = api.getCurrentUserID();
					if (threadInfo.approvalMode && !threadInfo.adminIDs.some(admin => admin.id == botID)) success[1].uids.push(uid);
					else success[0].uids.push(uid);
				}
				catch (err) {
					checkAndPushError(err.errorDescription, item);
				}
			}
		}
		const lengthUserSuccess = success[0].uids.length;
		const lengthUserWaitApproval = success[1].uids.length;
		const lengthUserError = failed.length;

		let msg = "";
		if (lengthUserSuccess) msg += `- Đã thêm thành công ${lengthUserSuccess} thành viên vào nhóm`;
		if (lengthUserWaitApproval) msg += `\n- Đã thêm ${lengthUserWaitApproval} thành viên vào danh sách phê duyệt`;
		if (lengthUserError) msg += `\n- Đã xảy ra lỗi khi thêm ${lengthUserError} thành viên vào nhóm:${failed.reduce((a, b) => a += `\n    + ${b.uids.join('; ')}: ${b.type}`, "")}`;
		message.reply(msg);
	}
};