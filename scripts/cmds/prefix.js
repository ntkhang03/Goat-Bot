this.config = {    
  name: "prefix",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Xem hoặc đổi prefix",
  longDescription: "Xem hoặc đổi prefix của nhóm bạn",
  category: "custom",
  guide: "{prefix}prefix <prefix muốn đổi>: đổi prefix của nhóm"
       + "\nprefix: xem prefix hiện tại"
       + "\n"
       + "\nVí dụ đổi prefix: {prefix}prefix !",
  priority: 1
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, threadsData, message, args, event }) {
    if (!args[0]) {
      const prefix = (await threadsData.getData(event.threadID)).prefix || globalGoat.config.data.prefix;
      return message.reply(`> Prefix của nhóm bạn: ${prefix}\n> Prefix của hệ thống: ${globalGoat.config.prefix}\n> Để thay đổi prefix hãy nhập ${prefix} <prefix mới>`);
    }
    await threadsData.setData(event.threadID, { prefix: args[0] }, (err, info) => {
      if (err) return message.reply(err.stack);
      return message.reply(`Đã đổi prefix của nhóm bạn thành \`${info.prefix}\``);
    });
  },
  
  whenChat: async ({ threadsData, message, args, event, setup, globalGoat }) => {
    if (event.body && event.body.toLowerCase() == "prefix") {
      return message.reply(`Prefix của nhóm bạn: ${(await threadsData.getData(event.threadID)).prefix || globalGoat.config.prefix}\nPrefix của hệ thống: ${globalGoat.config.prefix}`);
    }
  }
};