(async () => {
  
  process.on('unhandledRejection', error => console.error(error));
  process.on('uncaughtException', error => console.error(error));
  
  const axios = require("axios");
  const chalk = require("chalk");
  const print = require("./logger/print.js");
  const loading = require("./logger/loading.js");
  const login = require("fb-chat-api");
  const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, unlinkSync } = require("fs-extra");
  
  const globalGoat = {
    print,
    loading,
  	commands: new Map(),
  	shortName: new Map(),
  	events: new Map(),
  	whenChat: [],
  	whenReply: {},
  	whenReaction: {},
  	config: {},
  	configCommands: {}
  };
  
  // ————————————————— LOAD CONFIG ————————————————— //
  const configCommands = require("./configCommands.json");
  var config = require("./config.json");
	globalGoat.config = config;
	print("Đã cài đặt thiết lặp cho bot", "CONFIG");
  
  const client = {
    dirConfig: __dirname + "/config.json",
    dirConfigCommands: __dirname + "/configCommands.json",
  	allThreadData: {},
  	allUserData: {},
  	cooldowns: {},
  	cache: {},
  	database: {
  	  autoCreate: globalGoat.config.autoCreateDB,
  	  threadBusy: false,
  	  userBusy: false
  	},
  	allThread: [],
  	allUser: [],
  	commandBanned: configCommands.commandBanned
  };
  
  // ———————————— LOAD TẤT CẢ TỆP LỆNH ———————————— //
  print("Tiến hành tải các tệp lệnh, vui lòng chờ", "LOAD COMMANDS");
  await require("./bot/loadAllScript.js")(globalGoat, configCommands);
  // ———————— // ———————— // ———————— // ———————— //
  console.log(chalk.blue(`================================================`));
  print(`Đã load thành công: ${globalGoat.commands.size} Script commands`, "LOADED");
  print(`Đã load thành công: ${globalGoat.events.size} Script events`, "LOADED");
  console.log(chalk.blue(`================================================`));
  // ——————————————————— LOGIN ————————————————— //
  print.blue("Đang tiến hành đăng nhập", "LOGIN");
  let appState;
  try {
  	appState = require("./fbstate.json");
  }
  catch (e) {
  	return print.err("Đã xảy ra lỗi khi lấy fbstate đăng nhập, lỗi: " + e.stack, "GET FBSTATE");
  }
  require("./bot/login.js")(login, appState, print, loading, config, client, globalGoat, configCommands, writeFileSync);
})();
	
	/*
	 *
	 *Mã nguồn được viết bởi NTKhang, vui lòng không thay đổi tên tác giả ở bất kỳ tệp nào. Cảm ơn bạn đã sử dụng
	 *The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using 
	 *
	 */