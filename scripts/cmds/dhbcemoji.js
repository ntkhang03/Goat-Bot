this.config = {    
  name: "dhbcemoji",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "game đuổi hình bắt chữ emoji (demo)",
  longDescription: "chơi game đuổi hình bắt chữ phiên bản emoji (demo)",
  category: "game",
  guide: "{p}{n}"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, message, event, download }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const datagame = (await axios.get("https://goatbot.tk/api/duoihinhbatchuemoji")).data;
    const random = datagame.data;
    message.reply(`Hãy reply tin nhắn này với câu trả lời\n${random.emoji1}${random.emoji2}\n${random.wordcomplete.replace(/\S/g, "█ ")}`, 
    (err, info) => globalGoat.whenReply[info.messageID] = {
      messageID: info.messageID,
      nameCmd: this.config.name,
      author: event.senderID,
      wordcomplete: random.wordcomplete
    });
  },
  
  whenReply: ({ message, Reply, event, globalGoat }) => {
    let { author, wordcomplete, messageID } = Reply;
    if (event.senderID != author) return message.reply("Bạn không phải là người chơi của câu hỏi này");
    function formatText (text) {
      return text.normalize("NFD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
    }
    
    (formatText(event.body) == formatText(wordcomplete)) ? message.reply("Chúc mừng bạn đã trả lời đúng") : message.reply(`Opps, Sai rồi`);
      //message.reply(`Sai rồi, đáp án đúng là: ${wordcomplete}`);
    delete globalGoat.whenReply[messageID];
  }
};