this.config = {    
  name: "wordlink",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "game nối chữ",
  longDescription: "chơi game nối chữ cùng bot",
  category: "game",
  guide: "{prefix}wordlink: dùng để bật game nối chữ"
       + "\n{prefix}wordlink rank: xem bảng xếp hạng"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, message, event, usersData }) {
    const { writeFileSync, existsSync } = require("fs-extra");
    const { threadID, messageID, senderID } = event;
    
    const database = require(__dirname + "/database/custom.json");
    if (!database.wordlink) database.wordlink = {
      point: [],
    };
    writeFileSync(__dirname + "/database/custom.json", JSON.stringify(database, null, 2));
    
    if (args[0] && args[0].toLowerCase() == "rank") {
      var top = database.wordlink.hightPoint.sort((a, b) => b.point - a.point );
      var msg = "", i = 1;
      for (let item of top) {
        msg += `\nTop ${i}: ${(await usersData.getData(item.id)).name} với ${item.point} điểm`;
        i++;
      };
      return message.reply(msg);
    }
    message.reply(`Đã bật game nối chữ\nHãy reply tin nhắn này với 2 từ để bắt đầu trò chơi`, (err, info) => {
      globalGoat.whenReply[info.messageID] = {
        nameCmd: require(__filename).config.name,
        messageID: info.messageID,
        senderID
      }
    });
  },
  
  whenReply: async ({ Reply, globalGoat, client, message, event }) => {
    const { threadID, messageID, senderID, body } = event;
    if (!body || senderID != Reply.senderID) return;
    const axios = require("axios");
    const fs = require("fs-extra");
    const args = body.split(" ");
    
    const database = require(__dirname + "/database/custom.json");
    const Data = database.wordlink;
    if (!Data || args.length != 2) return;
    if (!Data.hightPoint.some(item => item.id == senderID)) Data.hightPoint.push({ id: senderID, point: 0 });
    const { cache } = client;
    if (!cache.wordlink) cache.wordlink = [];
    const cacheWordlink = cache.wordlink;
    if (!cacheWordlink.some(item => item.id == senderID)) {
      cacheWordlink.push({
        id: senderID,
        wordConnect: null,
        currentPoint: 0 
      });
    };
    const dataWLuser = cacheWordlink.find(item => item.id == senderID);
    if (dataWLuser.wordConnect != args[0].toLowerCase() && dataWLuser.wordConnect != null ) return;
    
    const word = (await axios.get("http://goatbot.tk/api/wordlink?text=" + encodeURI(args.join(" ")))).data.data;
    
    var currentPoint = dataWLuser.currentPoint;
    var hightPoint = Data.hightPoint.find(item => item.id == senderID).point || 0;
    
    if (currentPoint > hightPoint) {
      hightPoint = currentPoint;
      Data.hightPoint.find(item => item.id == senderID).point = hightPoint;
      fs.writeFileSync(__dirname + "/database/custom.json", JSON.stringify(database, null, 2));
    };
    
    var top = Data.hightPoint.sort((a, b) => b.point - a.point );
    if (word == "You Lose!!") {
      message.reply(`Bạn đã thua\n• Điểm lần này là: ${currentPoint}\n• Điểm cao nhất là: ${hightPoint}\n• Top #${top.findIndex(item => item.id == senderID) + 1} trong bảng xếp hạng`);
      dataWLuser.currentPoint = 0;
      return dataWLuser.wordConnect = null;
    };
    const wordConnect = word.split(" ")[1];
    message.reply(`${word}\nTừ liên kết là "${wordConnect}", reply tin nhắn này với từ tiếp theo để tiếp tục chơi`, (err, info) => {
      globalGoat.whenReply[info.messageID] = {
        nameCmd: require(__filename).config.name,
        messageID: info.messageID,
        senderID
      }
    });
    dataWLuser.currentPoint = currentPoint + 1;
    dataWLuser.wordConnect = wordConnect;
  }
};