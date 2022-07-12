(async () => {

	process.on('unhandledRejection', error => console.error(error));
	process.on('uncaughtException', error => console.error(error));

	const chalk = require("chalk");
	const login = require("fb-chat-api");
	const { writeFileSync } = require("fs-extra");

	const print = require("./logger/print.js");
	const loading = require("./logger/loading.js");

	const globalGoat = {
		print,
		loading,
		commands: new Map(),
		shortNameCommands: new Map(),
		events: new Map(),
		whenChat: [],
		whenReply: {},
		whenReaction: {},
		config: require("./config.json"),
		configCommands: require("./configCommands.json")
	};
	// ————————————————— LOAD CONFIG ————————————————— //
	print("Đã cài đặt thiết lặp cho bot", "CONFIG");
	const { configCommands, config } = globalGoat;

	const client = {
		dirConfig: __dirname + "/config.json",
		dirConfigCommands: __dirname + "/configCommands.json",
		allThreadData: {},
		allUserData: {},
		cooldowns: {},
		cache: {},
		database: {
			threadBusy: false,
			userBusy: false
		},
		allThread: [],
		allUser: [],
		commandBanned: configCommands.commandBanned,
		getPrefix: function (threadID) {
			let prefix = globalGoat.config.prefix;
			client.allThreadData[threadID] ? prefix = client.allThreadData[threadID].prefix || prefix : "";
			return prefix;
		}
	};

	// ———————————— LOAD TẤT CẢ TỆP LỆNH ———————————— //
	print("Tiến hành tải các tệp lệnh, vui lòng chờ", "LOAD COMMANDS");
	await require("./bot/loadAllScript.js")(globalGoat);
	// ———————— // ———————— // ———————— // ———————— //
	console.log(chalk.blue(`===========================================`));
	print(`Đã load thành công: ${globalGoat.commands.size} Script commands`, "LOADED");
	print(`Đã load thành công: ${globalGoat.events.size} Script events`, "LOADED");
	console.log(chalk.blue(`===========================================`));
	// —————————————————— LOGIN ————————————————— //
	require("./bot/login.js")(login, print, loading, config, client, globalGoat, configCommands, writeFileSync);
})();

/*
 *
 *Mã nguồn được viết bởi NTKhang, vui lòng không thay đổi tên tác giả ở bất kỳ tệp nào. Cảm ơn bạn đã sử dụng
 *The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using 
 *
 */