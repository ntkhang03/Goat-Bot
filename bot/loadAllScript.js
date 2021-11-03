module.exports = async (globalGoat, configCommands) => {
  const axios = require("axios");
  const chalk = require("chalk");
  const { print, loading } = globalGoat;
  const { execSync } = require('child_process');
  const { readdirSync } = require("fs-extra");
  const requireFromString = require("require-from-string");
  const fs = require("fs-extra");
  var spiner = "\\|/-";
  var ij = 0;
  
  const folder = ["cmds", "events"];
  
  for (let folderModules of folder) {
    console.log(chalk.blue(`============ LOADING COMMANDS${(folderModules == "cmds" ? "" : " " + folderModules).toUpperCase()} ============`));
    const commandError = [];
    let text = "", typeConfigCommand = "", setMap = "";
    if (folderModules == "cmds") {
      text = "command";
      typeEnvCommand = "envCommands";
      setMap = "commands";
    } else {
      text = "command event";
      typeEnvCommand = "envEvents";
      setMap = "events";
    }
    const Files = readdirSync(__dirname+"/../scripts/" + folderModules).filter((item) => item.endsWith(".js"));
    
    for (const file of Files) {
      try {
        const pathCommand = __dirname + `/../scripts/${folderModules}/${file}`;
        var command = require(pathCommand);
        const configCommand = command.config;
// ——————————————— CHECK SYNTAXERROR ——————————————— //
    		if (!configCommand) throw new Error("Config of command undefined");
    		if (!command.start) throw new Error(`Command không được thiếu function start!`);
        if (!configCommand.name) throw new Error(`Tên Command không được để trống!`);
    		const commandName = configCommand.name;
    		if (globalGoat[setMap].has(commandName)) throw new Error("Tên Command bị trùng lặp với một Command khác");
// ——————————————— CHECK SHORT NAME ———————————————— //
        if (configCommand.shortName) {
          let { shortName } = configCommand;
          if (typeof shortName == "string") shortName = [shortName];
          for (const aliases of shortName) {
            if (globalGoat.shortName.has(aliases)) throw new Error(`Short Name ${aliases} bị trùng lặp với short name của command ${chalk.hex("#ff5208")(globalGoat.shortName.get(aliases))}`);
            else globalGoat.shortName.set(aliases, configCommand.name);
          }
        }
// ————————————————— CHECK PACKAGE ————————————————— //
    		if (configCommand.packages) {
    		  const packages = (typeof configCommand.packages == "string") ? configCommand.packages.trim().replace(/\s/g, '').split(',') : configCommand.packages;
    		  if (!Array.isArray(packages)) throw new Error("Value packages needs to be array");
  				for (let i of packages) {
  				  try { require(i) }
  				  catch (err) {
      				try {
                loading(`install package ${chalk.hex("#ff5208")(i)}, wating...`, "INSTALL PACKAGE");
      				  execSync("npm install " + i +" -s");
      				  loading(`Đã cài đặt package ${chalk.hex("#ff5208")(i)} cho ${text} ${chalk.hex("#FFFF00")(commandName)} thành công\n`, "PACKAGE");
      				}
      				catch(e) {
      				  loading.err(`Không thể cài đặt package ${chalk.hex("#ff0000")(i)} cho ${text} ${chalk.hex("#ff0000")(commandName)}\n`, "INSTALL PACKAGE FAILED");
      				}
      			}
  				}
    		}
// ——————————————— CHECK ENV GLOBAL ——————————————— //
    		if (configCommand.envGlobal) {
    		  const { envGlobal } = configCommand;
    		  if (typeof envGlobal != "object" && Array.isArray(envGlobal)) throw new Error("envGlobal need to be a object");
    		  if (!configCommands.envGlobal) configCommands.envGlobal = {};
    		  for (let i in envGlobal) {
    		    if (!configCommands.envGlobal[i]) configCommands.envGlobal[i] = envGlobal[i];
    		    else {
    		      const oldCommand = fs.readFileSync(pathCommand).toString();
    		      const newCommand = oldCommand.replace(envGlobal[i], configCommands.envGlobal[i]);
    		      fs.writeFileSync(pathCommand, newCommand);
    		    }
    		  }
    		}
// ———————————————— CHECK CONFIG CMD ——————————————— //
        if (configCommand.envConfig && typeof configCommand.envConfig == "object") {
    		  for (const [key, value] of Object.entries(configCommand.envConfig)) {
    		    if (!configCommands[typeEnvCommand]) configCommands[typeEnvCommand] = {};
    		    if (!configCommands[typeEnvCommand][commandName]) configCommands[typeEnvCommand][commandName] = {};
    		    if (!configCommands[typeEnvCommand][commandName][key]) configCommands[typeEnvCommand][commandName][key] = value;
    		  }
    		}
// ——————————— CHECK UPDATE FROM GITHUB ——————————— //
  	    if (globalGoat.config.autoUpdateCommand == true) {
    	    try {
        		const result = await axios.get(`https://raw.githubusercontent.com/ntkhang03/Goat-Bot/master/${folderModules}/${file}`, {
        		  responseType: "arraybuffer"
        		});
      		  const data = result.data.toString();
      		  const version = requireFromString(data).version;
      		  const local = configCommand.version;
      		  if (local != version) {
      		    loading(`Đã có phiên bản mới cho ${text} ${chalk.hex("#FFFF00")(commandName)}: ${version}, đang tiến hành cập nhật`, "UPDATE COMMAND");
      		    fs.writeFileSync(__dirname+"/../scripts/"+folderModules+"/"+file, Buffer.from(data));
  	          loading(`Đã cập nhật ${text} ${chalk.hex("#FFFF00")(commandName)} lên phiên bản ${version}\n`, "UPDATE COMMAND");
      		  }
    	    }
      		catch(e) {}
  	    }
// ——————————————— CHECK RUN ANYTIME ——————————————— //
    		if (command.whenChat) globalGoat.whenChat.push(commandName);
// ————————————— IMPORT TO GLOBALGOAT ————————————— //
    		globalGoat[setMap].set(commandName.toLowerCase(), command);
    		let color = "#00ff2f";
    		if (text == "command") color = "#ff7100";
    		loading(`${chalk.hex(color)(`[ ${text.toUpperCase()} ]`)} ${chalk.hex("#FFFF00")(commandName)} succes\n`, "LOADED");
    	}
    	catch (error) {
    		commandError.push({ name: file, error });
    	}
    }
    if (commandError.length > 0) {
      print.err(`Những file ${chalk.yellow(text)} xảy ra lỗi trong quá trình load:`, "LOADED");
      for (let item of commandError) print.err(`${chalk.hex("#ff4112")(item.name)}: ${item.error.stack}`, text.toUpperCase());
    }
  }
};