this.config = {    
  name: "bannedlist",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "xem danh sách nhóm/người dùng bị cấm",
  longDescription: "xem danh sách nhóm/người dùng bị cấm",
  category: "owner",
  guide: "{p}{n} [thread|user]",
};

module.exports = {
  config: this.config,
  start: async function({ message, args, usersData, threadsData }) {
    if (["thread", "-t"].includes(args[0])) {
      const allThread = await threadsData.getAll();
      let msg = [];
      for (const thread of allThread) {
        const dataBanned = thread.banned;
        if (dataBanned.status) {
          msg.push(`Name: ${thread.name}`
               + `\nID: ${thread.id}`
               + `\nReason: ${dataBanned.reason}`
               + `\nTime: ${dataBanned.date}`);
        }
      }
      message.reply(msg.length > 0 ? `Hiện tại có ${msg.length} nhóm đã bị cấm sử dụng bot:\n\n${msg.join("\n\n")}` : "Hiện tại chưa có nhóm nào bị cấm sử dụng bot");
    }
    else if (["user", "-u"].includes(args[0])) {
      const allUser = await usersData.getAll();
      let msg = [];
      for (const thread of allUser) {
        const dataBanned = thread.banned;
        if (dataBanned.status) {
          msg.push(`Name: ${thread.name}`
               + `\nID ${thread.id}`
               + `\nReason: ${dataBanned.reason}`
               + `\nTime: ${dataBanned.date}`);
        }
      }
      message.reply(msg.length > 0 ? `Hiện tại có ${msg.length} người dùng đã bị cấm sử dụng bot:\n\n${msg.join("\n\n")}` : "Hiện tại chưa có người dùng nào bị cấm sử dụng bot");
    }
    else message.SyntaxError();
  }
};