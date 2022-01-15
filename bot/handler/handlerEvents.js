module.exports = function({ api, globalGoat, client, usersData, threadsData, download, usersModel, threadsModel }) {
	const print = globalGoat.print;
	const axios = require("axios");
	const chalk = require("chalk");
	const { readdirSync, writeFileSync, existsSync, mkdirSync, createReadStream } = require("fs-extra");
	const moment = require("moment-timezone");
	
  return async function ({ event, message }) {
    const { body, messageID, threadID, isGroup } = event;
    const senderID = event.senderID || event.author || event.userID;
    
    let prefix = globalGoat.config.prefix;
    client.allThreadData[threadID] ? prefix = client.allThreadData[threadID].prefix || prefix : "";
    
    const contentSyntaxError = `Lệnh bạn đang sử dụng sai cú pháp, vui lòng gõ ${prefix}help {nameCmd} để xem chi tiết cách sử dụng lệnh này`;
    
    const parameters = { api, globalGoat, client, usersData, threadsData, message, event, download, usersModel, threadsModel };
    
    if (!isNaN(senderID) && !client.allUserData[senderID]) await usersData.createData(senderID);
    if (!isNaN(threadID) && !client.allThreadData[threadID]) await threadsData.createData(threadID);
    
    //===============================================//
    //                   WHEN CHAT                   //
    //===============================================//
    async function whenChat() {
      const { isGroup } = event;
      const allWhenChat = globalGoat.whenChat || [];
      const args = body ? body.split(" ") : [];
      for (const key of allWhenChat) {
        const command = globalGoat.commands.get(key);
        try {
          message.SyntaxError = function() {
    		    return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
    		  };
          command.whenChat({ ...parameters, ...{args} });
        }
        catch (err) {
          print.err("Đã xảy ra lỗi khi thực hiện commamd whenChat ở lệnh " + command.config.name + ", lỗi: "+err.stack, "WHEN CHAT");
          return message.reply(`❎\nĐã có lỗi xảy ra tại command whenChat ${command.config.name}\n${err.stack}`);
        }
      }
    }
    
    //===============================================//
    //              WHEN CALL COMMAND                //
    //===============================================//
  	async function whenStart() {
  		const dateNow = Date.now();
  		const { isGroup } = event;
  		const { adminBot } = globalGoat.config;
      // —————————————— CHECK USE BOT —————————————— //
  		if (body && !body.startsWith(prefix) || !body) return;
  		const args = body.slice(prefix.length).trim().split(/ +/);
  		// —————————  CHECK HAS IN DATABASE  ————————— //
  		if (!client.allThreadData[threadID]) await threadsData.createData(threadID);
  		if (!client.allUserData[senderID]) await usersData.createData(senderID);
  		// ————————————  CHECK HAS COMMAND ——————————— //
  		const commandName = args.shift().toLowerCase();
  		const command = globalGoat.commands.get(commandName) || globalGoat.commands.get(globalGoat.shortName.get(commandName));
  		
  		// ————————————— GET THREAD INFO ————————————— //
  		const threadInfo = client.allThreadData[threadID] || {};
  		if (threadInfo.onlyAdminBox === true && !threadInfo.adminIDs.includes(senderID)) return message.reply("Hiện tại nhóm này đã được bật chế độ chỉ quản trị viên nhóm mới có thể sử dụng bot");
  		// —————————————— CHECK BANNED —————————————— //
  		// +++++++++++     Check User     +++++++++++ //
    	const infoBannedUser = client.allUserData[senderID].banned;
  		if (infoBannedUser.status == true) return message.reply(`Bạn đã bị Admin cấm sử dụng bot\n> Lý do: ${infoBannedUser.reason}\n> Thời gian: ${infoBannedUser.date}\n> User ID: ${senderID}`);
  		// +++++++++++    Check Thread    +++++++++++ //
  		if (isGroup == true) {
    		const infoBannedThread = threadInfo.banned;
    		if (infoBannedThread.status == true) return message.reply(`Nhóm của bạn đã bị Admin bot cấm dùng bot\n> Lý do: ${infoBannedThread.reason}\n> Thời gian: ${infoBannedThread.date}\n> Thread ID: ${threadID}`);
  		}
  		if (!command) return message.reply("Lệnh bạn sử dụng không tồn tại");
  		//============================================//
  		
      // ————————————— COMMAND BANNED ————————————— //
  		if (client.commandBanned[commandName]) return message.reply(`Lệnh này đã bị Admin cấm sử dụng trong hệ thống bot với lý do: ${client.commandBanned[commandName]}`);
      // ————————————— CHECK PERMISSION ———————————— //
  		let role = 0;
  		let needRole = command.config.role || 0;
  		const adminBox = threadInfo.adminIDs || [];
  		
  		if (adminBot.includes(senderID)) role = 2;
  		else if (adminBox.includes(senderID)) role = 1;
  		
  		if (needRole > role && needRole == 1) return message.reply(`Chỉ quản trị viên của nhóm chat mới có thể dùng lệnh ${commandName}`);
  		if (needRole > role && needRole == 2) return message.reply(`Chỉ admin bot mới có thể dùng lệnh ${commandName}`);
      // ———————————————— COOLDOWNS ———————————————— //
  		if (!client.cooldowns[commandName]) client.cooldowns[commandName] = {};
  		const timestamps = client.cooldowns[commandName];
  		const cooldownCommand = (command.config.cooldowns || 1) * 1000;
  		if (timestamps[senderID]) {
  			const expirationTime = timestamps[senderID] + cooldownCommand;
  			if (dateNow < expirationTime) return message.reply(`⏱ Bạn đang trong thời gian chờ sử dụng lệnh này, vui lòng quay lại sau ${((expirationTime - dateNow)/1000).toString().slice(0, 3)}s`);
  		}
      // ——————————————— RUN COMMAND ——————————————— //
  		try {
  		  message.SyntaxError = function() {
  		    return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
  		  };
  		  message.guideCmd = async function() {
  		    const formSendMessage = {
  		      body: command.config.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, commandName)
  		    };
  		    const { sendFile } = command.config;
  		    if (sendFile &&
             typeof(sendFile) == 'object' &&
             !Array.isArray(sendFile)
          ) {
            formSendMessage.attachment = [];
            for (let pathFile in sendFile) {
              if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
              formSendMessage.attachment.push(createReadStream(pathFile));
            }
          }
          return api.sendMessage(formSendMessage, threadID, messageID);
  		  };
  	    const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
  		  print(`${chalk.hex("#ffb300")(time)} | ${commandName} | ${senderID} | ${threadID} | ${args.join(" ")}`, "CALL CMD");
  		  parameters.role = role;
  			command.start({ ...parameters, ...{args} });
  			timestamps[senderID] = dateNow;
  		}
  		catch (err) {
  			print.err(`Đã xảy ra lỗi khi chạy lệnh ${commandName}, lỗi: ${err.stack}`, "CALL COMMAND");
  			return message.reply(`❎\nĐã có lỗi xảy ra khi thực thi lệnh ${commandName}\n${err.stack}`);
  		}
  	}
    
    //===============================================//
    //                   WHEN REPLY                  //
    //===============================================//
    async function whenReply() {
  		if (!event.messageReply) return;
  		const { whenReply } = globalGoat;
  		const Reply = whenReply[event.messageReply.messageID];
  		if (!Reply) return;
  		const command = globalGoat.commands.get(Reply.nameCmd);
  		if (!command) throw new Error("Không tìm thấy tên lệnh để thực hiện phản hồi này");
  		const args = body ? body.split(" ") : [];
  		try {
  		  message.SyntaxError = function() {
  		    return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
  		  };
  		  message.guideCmd = async function() {
  		    const formSendMessage = {
  		      body: command.config.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, commandName)
  		    };
  		    const { sendFile } = command.config;
  		    if (sendFile &&
             typeof(sendFile) == 'object' &&
             !Array.isArray(sendFile)
          ) {
            formSendMessage.attachment = [];
            for (let pathFile in sendFile) {
              if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
              formSendMessage.attachment.push(createReadStream(pathFile));
            }
          }
          return api.sendMessage(formSendMessage, threadID, messageID);
  		  };
  			return command.whenReply({ ...parameters, ...{ Reply, args } });
  		}
  		catch(err) {
  		  print.err(`Đã xảy ra lỗi khi thực thi lệnh reply ở lệnh ${Reply.nameCmd} ${err.stack}`, "WHEN REPLY");
  		  message.reply(`❎\nĐã xảy ra lỗi tại command  ${Reply.nameCmd}\n${err.stack}`);
  		}
  	}
  	
    //===============================================//
    //                 WHEN REACTION                 //
    //===============================================//
    async function whenReaction() {
  		const { whenReaction } = globalGoat;
  		const Reaction = whenReaction[messageID];
  		if (!Reaction) return;
  		const command = globalGoat.commands.get(Reaction.nameCmd);
  		if (!command) throw new Error("Không tìm thấy tên lệnh để thực hiện phản hồi này");
  		const args = body ? body.split(" ") : [];
  		try {
  		  message.SyntaxError = function() {
  		    return message.reply(contentSyntaxError.replace("{nameCmd}", command.config.name));
  		  };
  		  message.guideCmd = async function() {
  		    const formSendMessage = {
  		      body: command.config.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, commandName)
  		    };
  		    const { sendFile } = command.config;
  		    if (sendFile &&
             typeof(sendFile) == 'object' &&
             !Array.isArray(sendFile)
          ) {
            formSendMessage.attachment = [];
            for (let pathFile in sendFile) {
              if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
              formSendMessage.attachment.push(createReadStream(pathFile));
            }
          }
          return api.sendMessage(formSendMessage, threadID, messageID);
  		  };
  			command.whenReaction({ ...parameters, ...{Reaction, args} });
  			return;
  		}
  		catch(e) {
  		  print.err(`Đã xảy ra lỗi khi thực thi command Reaction tại lệnh ${Reaction.nameCmd}: ${e.stack}`, "HANDLE REACTION");
  		  message.reply(`❎\nĐã xảy ra lỗi tại command Reaction ${Reaction.nameCmd}\n${err.stack}`);
  		}
  	}
  	
  	//===============================================//
    //                     EVENT                     //
    //===============================================//
  	async function handlerEvent() {
  	  const { logMessageType, author } = event;
  		for (const [key, value] of globalGoat.events.entries()) {
  			const getEvent = globalGoat.events.get(key);
  			if (!getEvent.config.type.includes(logMessageType)) continue;
  			if (getEvent.config.condition && !eval(getEvent.config.condition)) continue;
  			try {
  			  const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
  				print(`${chalk.hex("#ffb300")(time)} | Event: ${getEvent.config.name} | ${author} | ${threadID}`, "EVENT CMD");
  				getEvent.start({ event, api, globalGoat, usersData, threadsData, client, download, message, usersModel, threadsModel });
  			}
  			catch(err) {
  				print.err(`Đã xảy ra lỗi tại command event ${chalk.hex("#ff0000")(getEvent.config.name)}, ${err.stack}`, "EVENT COMMAND");
  				message.reply(`❎\nĐã xảy ra lỗi tại command event ${getEvent.config.name}\n${err.stack}`)
  			}
  		}
  	}
  	
  	//===============================================//
    //                    PRESENCE                   //
    //===============================================//
  	async function presence() {
  	  // Your code here
  	}
  	
  	//===============================================//
    //                   READ RECEIPT                //
    //===============================================//
  	async function read_receipt() {
  	  // Your code here
  	}
  	
    //===============================================//
    //                      TYP                      //
    //===============================================//
  	async function typ() {
  	  // Your code here
  	}
  	
  	
  	
  	return {
  	  whenChat,
  	  whenStart,
  	  whenReaction,
  	  whenReply,
  	  handlerEvent,
  	  presence,
  	  read_receipt,
  	  typ
  	}
  };
};