this.config = {    
  name: "batslap",
  version: "1.0.2",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "batman slap",
  longDescription: "batman slap user mention or you",
  category: "image",
  envGlobal: {
    tokenFacebook: "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
  }
};

module.exports = {
  config: this.config,
  start: async function({ api, globalGoat, args, message, event, download }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    const { senderID, mentions } = event;
    const pathBatSlap = __dirname + `/cache/batslap${Date.now()}.jpg`;
    const { tokenFacebook } = globalGoat.configCommands.envGlobal;
    
    function linkAvatar(uid) {
      return encodeURIComponent(`https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=${tokenFacebook}`);
    }
    
    const targetId = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
    let imgBuffer;
    try {
      imgBuffer = (await axios.get(`https://goatbot.tk/taoanhdep/batslap?apikey=ntkhang&author=${linkAvatar(senderID)}&target=${linkAvatar(targetId)}`, {
        responseType: "arraybuffer"
      })).data;
    }
    catch(error) {
      let err;
      if (error.response) err = JSON.parse(error.response.data.toString());
      else err = error;
      return message.reply(`Đã xảy ra lỗi ${err.error} ${err.message}`);
    }
    fs.writeFileSync(pathBatSlap, Buffer.from(imgBuffer));
    message.reply({ attachment: fs.createReadStream(pathBatSlap)}, () => fs.unlinkSync(pathBatSlap));
  }
};