this.config = {    
  name: "banner",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tạo banner dịch vụ online",
  longDescription: "Tạo ảnh bìa hỗ trợ dịch vụ online",
  category: "image",
  guide: "{prefix}banner <facebook> | <zalo> | <phone> | <momo> | <title> | <subtitle> | <titlefacebook> | <info> | [<link ảnh> | hoặc reply hình ảnh]"
};

module.exports = {
  config: this.config,
  start: async function({ api, message, event, args, help }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    
    const content = args.join(" ").trim().replace(/\s+/g, " ").replace(/(\s+\|)/g, "|").replace(/\|\s+/g,  "|").split("|");
    const apikey = "ntkhang090503";
    const facebook      = content[0],
    zalo                = content[1],
    phone               = content[2],
    momo                = content[3],
    title               = content[4],
    subtitle            = content[5],
    titlefacebook       = content[6],
    info                = content[7];
    
    const avatarurl     = event.messageReply ? ((event.messageReply.attachments.length > 0) ? event.messageReply.attachments[0].url : content[8]) : content[8];
    if (!avatarurl) return message.reply(`Vui lòng nhập link hình ảnh hợp lệ, sử dụng help ${require(this.config.name)} để xem chi tiết cách sử dụng lệnh`);
    const params = { facebook, zalo, phone, momo, title, subtitle, titlefacebook, info, avatarurl, apikey };
    for (let i in params) if (!params[i]) return message.SyntaxError();
    message.reply(`Đang khởi tạo hình ảnh, vui lòng chờ đợi...`);
    const pathsave = __dirname + `/cache/banner${Date.now()}.jpg`;
    let imageBuffer;
    try {
      const response = await axios.get("https://goatbot.tk/taoanhdep/banner1", {
        params,
        responseType: "arraybuffer"
      });
      imageBuffer = response.data;
    }
    catch(error) {
      console.log(error);
      const err = JSON.parse(error.response.data.toString());
      return message.reply(`Đã xảy ra lỗi ${err.error} ${err.message}`);
    }
    fs.writeFileSync(pathsave, Buffer.from(imageBuffer));
    message.reply({ attachment: fs.createReadStream(pathsave) }, () => fs.unlinkSync(pathsave));
  }
};