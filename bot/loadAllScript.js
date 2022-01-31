module.exports = async (globalGoat) => {
  const axios = require("axios");
  const chalk = require("chalk");
  const { print, loading, configCommands } = globalGoat;
  const { execSync } = require('child_process');
  const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");
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
  				  try {
  				    require(i);
  				  }
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
  		    for (const i in envGlobal) {
  		      if (!configCommands.envGlobal[i]) configCommands.envGlobal[i] = envGlobal[i];
  		      else {
  		        let readCommand = readFileSync(pathCommand).toString();
  		        readCommand = readCommand.replace(envGlobal[i], configCommands.envGlobal[i]);
  		        writeFileSync(pathCommand, readCommand);
  		      }
  		    }
    		}
// ———————————————— CHECK CONFIG CMD ——————————————— //
        if (configCommand.envConfig && typeof configCommand.envConfig == "object") {
          if (!configCommands[typeEnvCommand]) configCommands[typeEnvCommand] = {};
          if (!configCommands[typeEnvCommand][commandName]) configCommands[typeEnvCommand][commandName] = {};
        
    		  for (const [key, value] of Object.entries(configCommand.envConfig)) {
    		    if (!configCommands[typeEnvCommand][commandName][key]) configCommands[typeEnvCommand][commandName][key] = value;
    		    else {
    		      let readCommand = readFileSync(pathCommand).toString();
  		        readCommand = readCommand.replace(value, configCommands[typeEnvCommand][commandName][key]);
  		        writeFileSync(pathCommand, readCommand);
    		    }
    		  }
    		}
// ——————————————— CHECK RUN ANYTIME ——————————————— //
    		if (command.whenChat) globalGoat.whenChat.push(commandName);
// ————————————— IMPORT TO GLOBALGOAT ————————————— //
    		globalGoat[setMap].set(commandName.toLowerCase(), command);
    		const color = text == "command" ? "#ff7100" : "#00ff2f";
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