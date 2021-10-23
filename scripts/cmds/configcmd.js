this.config = {    
  name: "configcmd",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "edit config bot",
  longDescription: "chỉnh sửa file configComands.json",
  category: "owner",
  guide: "{p}{n} api <key> <value>"
       + "\n{p}{n} [cmd | command] <name> <key> <value>"
       + "\n{p}{n} event <name> <key> <value>"
};

module.exports = {
  config: this.config,
  start: async ({ globalGoat, args, message, client, event }) => {
    const fs = require("fs-extra");
    try {
      const configCommands = globalGoat.configCommands;
      const content = args[0].toLowerCase();
      if (content == "api") {
        const key   = args[1];
        const value = args[2];
        configCommands.API[key] = value;
      }
      else if (["cmd", "command", "commands"].includes(content)) {
        const name  = args[1];
        const key   = args[2];
        const value = args[3];
        !configCommands.configCmds[name] ? globalGoat.configCmd[name] = {} : "";
        configCommands.configCmds[name][key] = value;
      }
      else if (["event", "evt"].includes(content)) {
        const name  = args[1];
        const key   = args[2];
        const value = args[3];
        !configCommands.configEvent[name] ? configCommands.configCommands[name] = {} : "";
        configCommands.configEvent[name][key] = value;
      }
      else return message.SyntaxError();
      
      fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
      message.reply(`Đã cấu hình lại file configCommands`);
    }
    catch (err) {
      message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
    }
  }
};