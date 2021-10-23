this.config = {
  name: "uid",
  version: "1.0.0",
  author: {name: "NTKhang", contacts: ""},
  cooldowns: 5,
  role: 0,
  shortDescription: "Xem id",
  longDescription: "Xem id facebook của người dùng",
  category: "info",
  guide: "{prefix}uid: dùng để xem id facebook của bạn\n{prefix}uid @tag: xem id facebook của những người được tag"
};

module.exports = {
  config: this.config,
  start: function({ message, event }) {
    const { mentions } = event;
    if (Object.keys(mentions) != 0) {
      let msg = "";
      for (let id in mentions) msg += `${mentions[id].replace("@", "")}: ${id}\n`;
      message.reply(msg);
    }
    else message.reply(event.senderID);
  }
};