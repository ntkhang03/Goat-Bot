this.config = {    
  name: "money",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "xem số tiền của bạn",
  longDescription: "xem số tiền hiện có của bạn",
  category: "economy",
  guide: "{p}{n}"
};

module.exports = {
  config: this.config,
  start: async function({ message, usersData, event }) {
    const userData = await usersData.getData(event.senderID);
    message.reply(`Bạn đang có ${userData.money} coin`);
  }
  
};