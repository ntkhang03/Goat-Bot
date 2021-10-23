this.config = {    
  name: "setwelcome",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "chỉnh sửa nội dung tin nhắn chào mừng",
  longDescription: "chỉnh sửa nội dung tin nhắn chào mừng thành viên mới tham gia vào nhóm chat của bạn",
  category: "box chat",
  guide: "{p}{n} text [<nội dung>|reset]: chỉnh sửa nội dung văn bản hoặc reset về mặc định, những shortcut có sẵn:"
       + "\n+ {userName}: tên của thành viên mới"
       + "\n+ {boxName}:  tên của nhóm chat"
       + "\n+ {multiple}: bạn || các bạn"
       + "\n+ {session}:  buổi trong ngày"
       + "\n* Ví dụ: {p}{n} text Hello {userName}, welcome to {boxName}, chúc {multiple} một ngày mới vui vẻ"
       + "\n"
       + "\nReply (phản hồi) một tin nhắn có file với nội dung {p}{n} file: để gửi file đó khi có thành viên mới (ảnh, video, audio)"
       + "\n{p}{n} file reset: xóa gửi file"
};

module.exports = {
  config: this.config,
  start: async function({ args, threadsData, globalGoat, message, event, download }) {
    const fs = require("fs-extra");
    const { threadID } = event;
    const data = (await threadsData.getData(threadID)).data;
    
    if (args[0] == "text") {
      if (!args[1]) return message.reply("Vui lùng nhập nội dung tin nhắn");
      else if (args[1] == "reset") data.welcomeMessage = null;
      else data.welcomeMessage = args.slice(1).join(" ");
    }
    else if (args[0] == "file") {
      if (args[1] == "reset") {
        try {
          fs.unlinkSync(__dirname+"/../events/src/mediaWelcome/" + data.welcomeAttachment);
        }
        catch(e){}
        data.welcomeAttachment = null;
      }
      else if (!event.messageReply || event.messageReply.attachments.length == 0) return message.reply("Vui lòng reply (phản hồi) một tin nhắn có chứa file ảnh/video/audio");
      else {
        const attachments = event.messageReply.attachments;
        const typeFile = attachments[0].type;
        const ext = typeFile == "audio" ? ".mp3" :
        typeFile == "video" ? ".mp4" :
        typeFile == "photo" ? ".png" : 
        typeFile == "animated_image" ? ".gif" : "";
        const fileName = "welcome" + threadID + ext;
        await download(attachments[0].url, __dirname+"/../events/src/mediaWelcome/"+fileName);
        data.welcomeAttachment = fileName;
      }
    }
    else return message.SyntaxError();
    
    await threadsData.setData(threadID, {
      data
    }, (err, info) => {
      if (err) return message.reply(`Đã xảy ra lỗi, vui lòng thử lại sau: ${err.name}: ${err.message}`);
      message.reply(`Đã lưu thay đổi của bạn`);
    });
    
  }
};