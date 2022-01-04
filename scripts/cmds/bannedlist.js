this.config = {    
  name: "bannedlist",
  version: "1.0.1",
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
    let target, type;
    if (["thread", "-t"].includes(args[0])) {
      target = await threadsData.getAll();
      type = "nhóm";
    }
    else if (["user", "-u"].includes(args[0])) {
      target = await usersData.getAll();
      type = "người dùng";
    }
    else return message.SyntaxError();
    
    const bannedList = target.filter(item => item.banned.status);
    const msg = bannedList.reduce((i, item) => i += `Name: ${item.name}`
      + `\nID: ${item.id}`
      + `\nReason: ${item.banned.reason}`
      + `\nTime: ${item.banned.date}\n\n`, "");
      
    message.reply(msg ? `Hiện tại có ${bannedList.length} ${type} đã bị cấm sử dụng bot:\n\n${msg}` : `Hiện tại chưa có ${type} nào bị cấm sử dụng bot`);
  }
};