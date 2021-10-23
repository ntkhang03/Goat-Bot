this.config = {    
  name: "banner2",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tạo ảnh bìa",
  longDescription: "Tạo ảnh bìa đẹp",
  category: "image",
  guide: "{prefix}{n} <name> | <description> | <facebook> | <instagram> | <phone> | <location> | <info> | [<link ảnh> | hoặc reply hình ảnh]"
};

module.exports = {
  config: this.config,
  start: async function({ api, message, event, args, help }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    
    const content = args.join(" ").trim().replace(/\s+/g, " ").replace(/(\s+\|)/g, "|").replace(/\|\s+/g,  "|").split("|");
    
    const apikey = "ntkhang090503";
    const name  = content[0],
    description = content[1],
    facebook    = content[2],
    instagram   = content[3],
    phone       = content[4],
    location    = content[5],
    avatarurl     = event.messageReply ? ((event.messageReply.attachments.length > 0) ? event.messageReply.attachments[0].url : content[6]) : content[6];
    if (!avatarurl) return message.reply(`Vui lòng nhập link hình ảnh hợp lệ, sử dụng help ${require(__filename.config.name)} để xem chi tiết cách sử dụng lệnh`);
    const params = { apikey, name, description, facebook, instagram, phone, location, avatarurl };
    for (let i in params) if (!params[i]) return message.SyntaxError();
    message.reply(`Đang khởi tạo hình ảnh, vui lòng chờ đợi...`);
    const pathsave = __dirname + `/cache/banner2${Date.now()}.png`;
    let imageBuffer;
    axios.get("https://goatbot.tk/taoanhdep/banner2", {
      params,
      responseType: "arraybuffer"
    })
    .then(data => {
      const imageBuffer = data.data;
      fs.writeFileSync(pathsave, Buffer.from(imageBuffer));
      message.reply({ attachment: fs.createReadStream(pathsave) }, () => fs.unlinkSync(pathsave));
    })
    .catch(error => {
      const err = JSON.parse(error.response.data.toString());
      return message.reply(`Đã xảy ra lỗi ${err.error} ${err.message}`);
    });
  }
};