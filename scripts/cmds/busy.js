this.config = {    
  name: "busy",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "bật chế độ không làm phiền",
  longDescription: "bật chế độ không làm phiền, khi bạn được tag bot sẽ thông báo",
  category: "box chat",
  guide: "{prefix}{name} [để trống|lý do]"
};

module.exports = {
  config: this.config,
  start: async function({ args, client, message, event }) {
    const { senderID } = event;
    if (!client.busyList) client.busyList = {};
    
    const reason = args.join(" ") || null;
    client.busyList[senderID] = reason;
    
    return message.reply(`Đã bật chế độ không làm phiền${reason ? ` với lý do: ${reason}` : ""}`);
  },
  
  
  whenChat: async ({ event, client, message }) => {
    if (!client.busyList) return;
    const { senderID, mentions } = event;
    const { busyList } = client;
    
    if (busyList[senderID]) {
      delete busyList[senderID];
      const text = "Chào mừng bạn đã quay trở lại =)";
      message.reply({
        body: text,
        mentions: [{
          id: senderID,
          tag: text
        }]
      });
    }
    
    if (!mentions || Object.keys(mentions).length == 0) return;
    const arrayMentions = Object.keys(mentions);
    
    for (const userID of arrayMentions) {
      if (Object.keys(client.busyList).includes(userID)) 
      return message.reply(`Hiện tại người dùng ${mentions[userID].replace("@", "")} đang bận${busyList[userID] ? ` với lý do: ${busyList[userID]}` : ""}`);
    }
    
  }
  
};