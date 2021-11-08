this.config = {    
  name: "jail",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "create image jail",
  longDescription: "create image jail",
  category: "image",
  envGlobal: {
    tokenFacebook: "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
  },
  guide: "{p}{n} [@tag|để trống]"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, message, event }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const pathSave = __dirname + `/jail${Date.now()}.png`;
    const { tokenFacebook } = globalGoat.configCommands.envGlobal;
    const { senderID, mentions } = event;
    const uid = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
    const avatar = `https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=${tokenFacebook}`;
    axios.get(`https://goatbot.tk/taoanhdep/jail`, {
      params: {
        image: avatar,
        apikey: "ntkhang"
      },
      responseType: "arraybuffer"
    })
    .then(data => {
      fs.writeFileSync(pathSave, Buffer.from(data.data));
      message.reply({
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave));
    })
    .catch(error => {
      const err = JSON.parse(error.response.data.toString());
      message.reply(`Đã xảy ra lỗi ${err.error}: ${err.message}`);
    });
  }
};