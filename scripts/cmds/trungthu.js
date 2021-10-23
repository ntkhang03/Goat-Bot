this.config = {    
  name: "trungthu",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tạo ảnh bìa",
  longDescription: "Tạo ảnh bìa background trung thu đẹp",
  category: "image",
  guide: "{p}{n} <name> | <description> | [<link ảnh> | hoặc reply hình ảnh]"
};

module.exports = {
  config: this.config,
  start: async function({ api, message, event, args, help }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const pathsave = __dirname + `/cache/trungthu${Date.now()}.png`;
    
    const content = args.join(" ").trim().replace(/\s+/g, " ").replace(/(\s+\|)/g, "|").replace(/\|\s+/g,  "|").split("|");
    const name      = content[0],
    description     = content[1],
    avatarurl       = event.messageReply ? ((event.messageReply.attachments.length > 0) ? event.messageReply.attachments[0].url : content[2]) : content[2];
    const params = { name, description, avatarurl, apikey: "ntkhang090503" };
    for (let i in params) if (!params[i]) return message.SyntaxError();
    message.reply(`Đang khởi tạo hình ảnh, vui lòng chờ đợi...`);
    
    axios.get("https://goatbot.tk/taoanhdep/trungthu", {
      params,
      responseType: "arraybuffer"
    })
    .then(data => {
      const imageBuffer = data.data;
      fs.writeFileSync(pathsave, Buffer.from(imageBuffer));
      message.reply({ attachment: fs.createReadStream(pathsave) }, () => fs.unlinkSync(pathsave));
    })
    .catch(error => {
      const err = error.response ? JSON.parse(error.response.data.toString()) : error;
      return message.reply(`Đã xảy ra lỗi ${err.error} ${err.message}`);
    });
  }
};