this.config = {    
  name: "setbox",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Chỉnh sửa nhóm của bạn",
  longDescription: "Chỉnh sửa nhóm của bạn",
  category: "box chat",
  guide: "{p}{n} [name|emoji|avatar] <nội dung chỉnh sửa>"
       + "\nChi tiết:"
       + "\n {p}{n} name <tên mới>: đổi tên nhóm chat"
       + "\n {p}{n} emoji <emoji mới>: đổi emoji nhóm"
       + "\n {p}{n} avatar <link ảnh hoặc reply một ảnh hoặc gửi kèm 1 ảnh>: đổi avatar nhóm chat"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, event, args, threadsData, download }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    
    if (args[0] == "name") {
      const newName = args.slice(1).join(" ");
      api.setTitle(newName, event.threadID, async function (err) {
        if (err) return message.reply("Rất tiếc, đã xảy ra lỗi");
        message.reply("Đã đổi tên nhóm thành: " + newName);
        await threadsData.setData(event.threadID, {
          name: newName
        });
      });
    }
    else if (args[0] == "emoji") {
      const newEmoji = args[1];
      api.changeThreadEmoji(newEmoji, event.threadID, async function (err) {
        if (err) return message.reply("Rất tiếc, đã xảy ra lỗi");
        message.reply("Đã đổi emoji nhóm thành: " + newEmoji);
        await threadsData.setData(event.threadID, {
          emoji: newEmoji
        });
      }); 
    }
    else if (["avatar", "avt", "img"].includes(args[0])) {
      const urlImage = (event.messageReply && event.messageReply.attachments[0] && event.messageReply.attachments[0].type != "share") ? event.messageReply.attachments[0].url : (event.attachments[0] && event.attachments[0].type != "share") ? event.attachments[0].url : args[1];
      
      if (!urlImage) return message.reply("Vui lòng gửi kèm hoặc reply một hình ảnh hoặc nhập vào link");
      const pathSave = __dirname + `/avatar${event.threadID}.png`;
      await download(urlImage, pathSave);
      api.changeGroupImage(fs.createReadStream(pathSave), event.threadID, async function (err) {
        if (err) return message.reply("Rất tiếc, đã xảy ra lỗi");
        message.reply("Đã thay đổi ảnh nhóm");
        fs.unlinkSync(pathSave);
        await threadsData.setData(event.threadID, {
          avatarbox: urlImage
        });
      });
    }
    else message.SyntaxError();
  }
};