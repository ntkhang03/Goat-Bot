this.config = {    
  name: "batslap",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "batman slap",
  longDescription: "batman slap mention or you",
  category: "image",
  envGlobal: {
    tokenFacebook: "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
  }
};

module.exports = {
  config: this.config,
  start: async function({ api, globalGoat, args, message, event, download }) {
    const fs = require("fs-extra");
    const { senderID, mentions } = event;
    const pathBatSlap = __dirname + `/cache/batslap${Date.now()}.jpg`;
    const { tokenFacebook } = globalGoat.configCommands.envGlobal;
    
    function linkAvatar(uid) {
      return encodeURIComponent(`https://graph.facebook.com/${uid}/picture?type=large&width=500&height=500&access_token=${tokenFacebook}`);
    }
    
    const targetId = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : senderID;
    await download(`https://goatbot.tk/taoanhdep/batslap?author=${linkAvatar(senderID)}&target=${linkAvatar(targetId)}`, pathBatSlap);
    message.reply({ attachment: fs.createReadStream(pathBatSlap)}, () => fs.unlinkSync(pathBatSlap));
  }
};