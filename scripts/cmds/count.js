this.config = {    
  name: "count",
  version: "1.0.2",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Đếm tin nhắn nhóm",
  longDescription: "Xem số lượng tin nhắn của tất cả thành viên hoặc bản thân (tính từ lúc bot vào nhóm)",
  category: "box chat",
  guide: "{prefix}count: dùng để xem số lượng tin nhắn của bạn"
       + "\n{prefix}count @tag: dùng để xem số lượng tin nhắn của những người được tag"
       + "\n{prefix}count all: dùng để xem số lượng tin nhắn của tất cả thành viên"
};

module.exports = {
  config: this.config,
  start: async function({ args, threadsData, message, event, globalGoat }) {
    const { threadID, senderID, messageID } = event;
    const threadData = await threadsData.getData(threadID);
    const { members } = threadData;
    const arraySort = [];
    
    for (let id in members) {
      const count = members[id].count;
      const name = members[id].name;
      arraySort.push({ name, count, uid: id });
    }
    arraySort.sort((a, b) => b.count - a.count);
    let stt = 1;
    arraySort.map(item => item.stt = stt++);
    
    if (args[0]) {
      if (args[0].toLowerCase() == "all") {
				let msg = "Số tin nhắn của các thành viên:\n";
        for (const item of arraySort) {
          if (item.count > 0) msg += `\n${item.stt}/ ${item.name}: ${item.count}`;
        }
        message.reply(msg + "\n\nNhững người không có tên trong danh sách là chưa gửi tin nhắn nào");
      }
      else if (event.mentions) {
        let msg = "";
        for (const id in event.mentions) {
          const findUser = arraySort.find(item => item.uid == id);
          msg += `${findUser.name} hạng ${findUser.stt} với ${findUser.count} tin nhắn\n`;
        }
        message.reply(msg);
      }
    }
    else {
      return message.reply(`Bạn đứng hạng ${arraySort.find(item => item.uid == senderID).stt} và đã gửi ${members[senderID].count} tin nhắn trong nhóm này`);
    }
  },
  
  whenChat: async ({ args, threadsData, message, client, event, api }) => {
    try {
      let { senderID, threadID, messageID, isGroup } = event;
      if (!client.allThreadData[threadID]) await threadsData.createData(threadID);
      const members = (await threadsData.getData(threadID)).members;
      
      if (!members[senderID]) {
        members[senderID] = {
          id: senderID,
          name: (await api.getUserInfo(senderID))[senderID].name,
          nickname: null,
          inGroup: true,
          count: 0
        };
        await threadsData.setData(threadID, { members });
      }
      
      members[senderID].count += 1;
      await threadsData.setData(threadID, { members });
    }
    catch (err) {}
  }
    
};