this.config = {    
  name: "test",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "test",
  longDescription: "test",
  category: "test",
  guide: "{p}{n}"
};

module.exports = {
  config: this.config,
  start: async ({ message, event, api }) => {
    const moment = require("moment-timezone");
    
    var allM = (await api.getThreadHistory(event.threadID, 99999999999999990, undefined)).filter(i => i.type != "event");
    console.log(allM[0]);
    
    const m = {};
    
    for (let item of allM) {
      if (m[item.senderID] == undefined) m[item.senderID] = 0;
      else m[item.senderID] = 1 + m[item.senderID];
    }
    
    console.log(m);
    return message.reply(JSON.stringify(m, null, 2)+`\nTin nhắn được thống kê từ ngày ${moment(parseInt(allM[0].timestamp)).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY hh:mm:ss")}`);
  }
};