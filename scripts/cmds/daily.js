this.config = {
  name: "daily",
  version: "1.0.0",
  author: { 
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "báo danh hằng ngày",
  longDescription: "nhận quà báo danh hằng ngày",
  category: "gift",
  guide: "{p}{n} [để trống | info]",
  envConfig: {
    rewardDay1: {
      coin: 100,
      exp: 10
    }
  }
};
  
  
module.exports = {
  config: this.config,
  start: async function({ usersData, message, event, globalGoat, args }) {
    const moment = require("moment-timezone");
    
    const reward = globalGoat.configCommands.envCommands[this.config.name].rewardDay1;
    if (args[0] == "info") {
      const rewardAll = globalGoat.configCommands.envCommands[this.config.name];
      let msg = "";
      let i = 1;
      for (let i = 1; i < 8; i++) {
        const getCoin = Math.floor(reward.coin*(1+20/100)**((i == 0 ? 7 : i) - 1));
        const getExp  = Math.floor(reward.exp*(1+20/100)**((i == 0 ? 7 : i) - 1));
        msg += `${i == 7 ? "Chủ Nhật" : "Thứ " + (i+1)}: ${getCoin} coin và ${getExp} exp\n`;
      }
      return message.reply(msg);
    }
    
    const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
    const date = new Date();
    let current_day = date.getDay(); // Lấy số thứ tự của ngày hiện tại
    const { senderID } = event;
    
    const userData = await usersData.getData(senderID);
    if (userData.lastTimeGetReward === dateTime) return message.reply("Bạn đã nhận phần quà báo danh của ngày hôm nay rồi, vui lòng quay lại vào ngày mai");
    
    const getCoin = Math.floor(reward.coin*(1+20/100)**((current_day == 0 ? 7 : current_day) - 1));
    const getExp  = Math.floor(reward.exp*(1+20/100)**((current_day == 0 ? 7 : current_day) - 1));
    
    await usersData.setData(senderID, {
      money: userData.money + getCoin,
      exp: userData.exp + getExp,
      lastTimeGetReward: dateTime
    }, (err, data) => {
      if (err) return message.reply(`Đã xảy ra lỗi: ${err.name}: ${err.message}`);
      message.reply(`Bạn đã nhận được ${getCoin} coin và ${getExp} exp`);
    });
    
  }
};