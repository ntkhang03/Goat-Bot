this.config = {    
  name: "qrcode",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tạo mã qr code",
  longDescription: "Tạo mã qr code với nội dung bạn nhập vào",
  category: "image",
  guide: "{p}{n} <nội dung>"
};

module.exports = {
  config: this.config,
  start: function({ message, event, args }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    
    if (!args[0]) return message.reply("Vui lòng nhập vào nội dung bạn muốn tạp qr code");
    axios.get("https://api.qrcode-monkey.com//qr/custom?" , {
      params: {
        "data": args.join(" "),
        "config": {
          "body": "square",
          "eye": "frame3",
          "eyeBall": "ball0",
          "erf1": ["fv"],
          "erf2": ["fv","fh"]
        },
        "size": 1000,
        "file": "png"
      },
      responseType: "arraybuffer"
    })
    .then(result => {
      const pathSave = __dirname + "/cache/qrcode.png";
      fs.writeFileSync(pathSave, Buffer.from(result.data));
      message.reply({
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    })
    .catch((e) => {
      return message.reply("Rất tiếc. Đã xảy ra lỗi vui lòng thử lại sau");
    });
    
  }
};