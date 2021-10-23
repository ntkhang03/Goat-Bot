module.exports = function({ globalGoat, usersData, threadsData, client, api, message, dataModels }) {
	const print = globalGoat.print;
	const CREATEDATA = async function({ event }) {
		try {
		  const { threadID, isGroup } = event;
		  const senderID = event.senderID || event.author || event.userID;
// —————————————— CREATE THREAD DATA —————————————— //
			if (!Object.keys(client.allThreadData).includes(threadID) && isGroup && !isNaN(threadID)) {
				try {
					await threadsData.createData(threadID);
					print(`New Thread: ${threadID} | ${client.allThreadData[threadID].name} | ${globalGoat.config.database.type}`, "DATABASE");
				}
				catch(e) {
					print.err("Không thể ghi nhóm có id " + threadID + " vào database! "+e.stack, "DATABASE");
				}
			}
// ——————————————— CREATE USER DATA ——————————————— //
			if (!Object.keys(client.allUserData).includes(senderID) && !isNaN(senderID)) {
				try {
					await usersData.createData(senderID);
					print(`New User: ${senderID} | ${client.allUserData[senderID].name} | ${globalGoat.config.database.type}`, "DATABASE");
				}
				catch(err) {
					print.err("Không thể ghi người dùng có id " + senderID + " vào database! "+err.stack, "DATABASE");
				}
			}
		}
		catch(e) {
			print.err(e.stack, "HANDLE CREATE DATABASE");
		}
	};
	return CREATEDATA;
};