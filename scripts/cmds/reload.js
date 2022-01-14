this.config = {    
  name: "reload",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "reload file config",
  longDescription: "load lại file config.json hoặc configComands.json vào biến globalGoat",
  guide: "{p}{n} [config|cmds]",
  category: "owner"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, threadsData, message, event }) {
    try {
      const content = args[0].toLowerCase();
      if (["config"].includes(content)) {
        delete require.cache[require.resolve(client.dirConfig)];
        globalGoat.config = require(client.dirConfig);
        return message.reply("Đã tải lại dữ liệu trong file config.json vào biến globalGoat");
      }
      else if (["cmds", "cmd", "command", "commands"].includes(content)) {
        delete require.cache[require.resolve(client.dirConfigCommands)];
        globalGoat.configComands = require(client.dirConfig);
        return message.reply("Đã tải lại dữ liệu trong file configComands.json vào biến globalGoat");
      }
      else return message.SyntaxError();
    }
    catch (err) {
      message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
    }
  }
};