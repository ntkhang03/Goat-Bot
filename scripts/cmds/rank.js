this.config = {    
  name: "rank",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Xem level của người dùng",
  longDescription: "Xem level của bạn hoặc người được tag. Có thể tag nhiều người",
  category: "rank",
  guide: "{p}{n} [để trống | @tag]",
  envGlobal: {
    tokenFacebook: "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662"
  },
};

module.exports = {
  config: this.config,
  start: async function({ message, client, event, usersData, threadsData, globalGoat }) {
    const axios = require("axios");
    const qs = require("querystring");
    const { writeFileSync, unlinkSync, createReadStream } = require("fs-extra");
    
    const TOKEN = globalGoat.configCommands.envGlobal.tokenFacebook;
    
    let targetUsers;
    const arrayMentions = Object.keys(event.mentions);
    
    if (arrayMentions.length == 0) targetUsers = [event.senderID];
    else targetUsers = arrayMentions;
    
    function expToLevel(exp) {
      const deltaNext = 5;
      return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
    }
    
    function levelToExp(level) {
      const deltaNext = 5;
      return Math.floor(((Math.pow(level, 2) - level) * deltaNext) / 2);
    }
    
    for (let userID of targetUsers) {
      const totalExpUser = (await usersData.getData(userID)).exp;
      
      const levelUser = expToLevel(totalExpUser);
      
      const expNextLevel = levelToExp(levelUser+1) - levelToExp(levelUser);
      const currentExp = expNextLevel - (levelToExp(levelUser+1) - totalExpUser);
      
      const expAllUser = await usersData.getAll(["exp", "name"]);
      expAllUser.sort((a, b) => b.exp - a.exp);
      const rank = expAllUser.findIndex(user => user.id == userID) + 1;
      
      const defaultDesignCard = {
        widthCard: 2000,
        heightCard: 500,
        main_color: "#474747",
        sub_color: "rgba(255, 255, 255, 0.5)",
        alpha_subcard: 0.9,
        exp_color: "#e1e1e1",
        expNextLevel_color: "#3f3f3f",
        text_color: "#000000"
      };
      
      const threadInfo = await threadsData.getData(event.threadID);
      let { customRankCard } = threadInfo.data;
      if (!customRankCard) customRankCard = {};
      const dataLevel = {
        exp: currentExp,
        expNextLevel,
        name: expAllUser[rank-1].name,
        rank: `#${rank}/${expAllUser.length}`,
        level: levelUser,
        avatar: `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=${TOKEN}`
      };
      
      const stringBody = qs.stringify({
        ...defaultDesignCard, 
        ...customRankCard, 
        ...dataLevel
      });
      
      axios.get("https://goatbot.tk/taoanhdep/makerankcard?"+stringBody, {
        responseType: "arraybuffer"
      })
      .then(data => {
        writeFileSync("./rank.png", Buffer.from(data.data));
        message.reply({
          attachment: createReadStream("./rank.png")
        }, (e, i) => unlinkSync("./rank.png"));
      })
      .catch(err => {
        console.log(err.response.data.toString());
      });
    }
    
  },
  
  whenChat: async function({ usersData, client, event }) {
    if (!client.allUserData[event.senderID]) await usersData.createData(event.senderID);
    let exp = (await usersData.getData(event.senderID)).exp;
    if (isNaN(exp)) exp = 0;
    try {
      await usersData.setData(event.senderID, {
        exp: exp + 1
      });
    }
    catch(e) {}
  }
};