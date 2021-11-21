this.config = {    
  name: "cmd",
  version: "1.0.3",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 1,
  shortDescription: "Quản lý command",
  longDescription: "Quản lý các tệp lệnh của bạn",
  category: "owner",
  guide: "{prefix}cmd load <tên file lệnh>",
  packages: "path"
};

module.exports = {
  config: this.config,
  start: ({ envGlobal, globalGoat, args, download, message, event, client }) => {
    const { execSync } = require('child_process');
    const { loading } = globalGoat;
    const { join } = require("path");
    const chalk = require("chalk");
    const fs = require("fs-extra");
    const allWhenChat = globalGoat.whenChat;

    const loadCommand = function (filename) {
      try {
        const pathCommand = __dirname + `/${filename}.js`;
        
        if (!fs.existsSync(pathCommand)) throw new Error(`Không tìm thấy file ${filename}.js`);
        
        const oldCommand = require(join(__dirname, filename + ".js"));
        const oldNameCommand = oldCommand.config.name;
        const oldEnvConfig = oldCommand.config.envConfig || {};
        const oldEnvGlobal = oldCommand.config.envGlobal || {};
        
        if (oldCommand.config.shortName) {
          let oldShortName = oldCommand.config.shortName;
          if (typeof oldShortName == "string") oldShortName = [oldShortName];
          for (let aliases of oldShortName) globalGoat.shortName.delete(aliases);
        }
        
        // delete old command
        delete require.cache[require.resolve(pathCommand)];
        
        const command = require(join(__dirname, filename + ".js"));
        const configCommand = command.config;
        if (!configCommand) throw new Error("Config of command undefined");
        
        const nameScript = configCommand.name;
        // Check whenChat function
        const indexWhenChat = allWhenChat.findIndex(item => item == oldNameCommand);
        if (indexWhenChat != -1) allWhenChat[indexWhenChat] = null;
        if (command.whenChat) allWhenChat.push(nameScript);
        // -------------
        if (configCommand.shortName) {
          let { shortName } = configCommand;
          if (typeof shortName == "string") shortName = [shortName];
          for (const aliases of shortName) {
            if (globalGoat.shortName.has(aliases)) throw new Error(`Short Name ${aliases} bị trùng lặp với short name của command ${chalk.hex("#ff5208")(globalGoat.shortName.get(aliases))}`);
            else globalGoat.shortName.set(aliases, configCommand.name);
          }
        }
        var { packages, envGlobal, envConfig } = configCommand;
        const { configCommands } = globalGoat;
        if (!command.start) throw new Error(`Command không được thiếu function start!`);
        if (!configCommand.name) throw new Error(`Tên Command không được để trống!`);
        if (packages) {
          packages = (typeof packages == "string") ? packages.trim().replace(/\s+/g, '').split(',') : packages;
          if (!Array.isArray(packages)) throw new Error("Value packages needs to be array");
  				for (let i of packages) {
  				  try { require(i) }
  				  catch (err) {
      				try {
                loading(`Install package ${chalk.hex("#ff5208")(i)}`, "PACKAGE");
      				  execSync("npm install " + i +" -s");
      				  loading(`Đã cài đặt package ${chalk.hex("#ff5208")(i)} cho Script ${chalk.hex("#FFFF00")(nameScript)} thành công\n`, "PACKAGE");
      				}
      				catch(e) {
      				  loading.err(`Không thể cài đặt package ${chalk.hex("#ff0000")(i)} cho Script ${chalk.hex("#ff0000")(nameScript)} với lỗi: ${e.stack}\n`, "PACKAGE");
      				}
      			}
  				}
        }
        // env Global
        if (envGlobal && typeof envGlobal == "object") {
    		  if (!configCommands.envGlobal) configCommands.envGlobal = {};
    		  for (let i in envGlobal) if (configCommands.envGlobal[i] != envGlobal[i]) configCommands.envGlobal[i] = envGlobal[i];
        }
        // env Config
        if (envConfig && typeof envConfig == "object") {
          for (const [key, value] of Object.entries(envConfig)) {
    		    if (!configCommands.envCommands) configCommands.envCommands = {};
    		    if (!configCommands.envCommands[nameScript]) configCommands.envCommands[nameScript] = {};
    		    if (JSON.stringify(configCommands.envCommands[nameScript]) != JSON.stringify(oldEnvConfig)) configCommands.envCommands[nameScript] = envConfig;
    		  }
        }
        globalGoat.commands.delete(oldNameCommand);
        globalGoat.commands.set(nameScript, command);
        fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
        globalGoat.print.master("Đã load tệp lệnh "+filename+".js", "LOADED");
        return {
          status: "succes",
          name: filename
        };
      }
      catch(err) {
        return {
          status: "failed",
          name: filename,
          error: err
        };
      }
    };
    
    if (args[0] == "load") {
      if (!args[1]) return message.reply("Vui lòng nhập vào tên lệnh bạn muốn reload");
      const infoLoad = loadCommand(args[1]);
      if (infoLoad.status == "succes") message.reply(`Đã load command ${infoLoad.name} thành công`);
      else message.reply(`Load command ${infoLoad.name} thất bại với lỗi\n${infoLoad.error.stack.split("\n").filter(i => i.length > 0).slice(0, 5).join("\n")}`);
      globalGoat.whenChat = allWhenChat.filter(item => item != null);
    }
    else if (args[0].toLowerCase() == "loadall") {
      const allFile = fs.readdirSync(__dirname)
      .filter(item => item.endsWith(".js"))
      .map(item => item = item.split(".")[0]);
      const arraySucces = [];
      const arrayFail = [];
      for (let name of allFile) {
        const infoLoad = loadCommand(name);
        infoLoad.status == "succes" ? arraySucces.push(name) :
        arrayFail.push(`${name}: ${infoLoad.error.name}: ${infoLoad.error.message}`);
      }
      globalGoat.whenChat = allWhenChat.filter(item => item != null);
      message.reply(`Đã load thành công ${arraySucces.length} command`
        + `\n${arrayFail.length > 0 ? `\nLoad thất bại ${arrayFail.length} command\n${arrayFail.join("\n")})` : ""}`);
    }
    else message.SyntaxError();
  }
};