this.config = {    
  name: "refresh",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "Cập nhật dữ liệu của bot",
  longDescription: "Cập nhật dữ liệu của tất cả người dùng hoặc thread",
  category: "owner",
  guide: "{p}{n} [user | thread | all]"
};

module.exports = {
  config: this.config,
  start: async function({ args, usersData, threadsData, message, api }) {
    
    async function refreshUsers() {
      const allUser = await usersData.getAll();
      for (const user of allUser) await usersData.refreshInfo(user.id);
      return message.reply(`Đã cập nhật dữ liệu của ${allUser.length} người dùng`);
    }
    async function refreshThreads() {
      const allThread = (await api.getThreadList(999, null, ["INBOX"])).filter(item => item.isGroup);
      for (const thread of allThread) await threadsData.refreshInfo(thread.threadID);
      return message.reply(`Đã cập nhật dữ liệu của ${allThread.length} nhóm`);
    }
    
    if (args[0] == "user") await refreshUsers();
    else if (args[0] == "thread") await refreshThreads();
    else if (args[0] == "all") {
      await refreshUsers();
      await refreshThreads();
    }
    else return message.SyntaxError();
  }
};