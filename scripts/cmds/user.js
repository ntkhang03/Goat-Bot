this.config = {    
  name: "user",
  version: "1.0.2",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "Quản lý người dùng",
  longDescription: "Quản lý người dùng trong hệ thống bot",
  category: "owner",
  guide: "{prefix}user [find | -f | search | -s] <tên cần tìm>: tìm kiếm người dùng trong dữ liệu bot bằng tên"
       + "\n"
       + "\n{prefix}user [ban | -b] [<id> | @tag | reply tin nhắn] <reason>: để cấm người dùng mang id <id> hoặc người được tag hoặc người gửi của tin nhắn được reply sử dụng bot"
       + "\n"
       + "\n{prefix}user unban [<id> | @tag | reply tin nhắn]: để bỏ cấm người dùng sử dụng bot"
};

module.exports = {
  config: this.config,
  start: async function({ api, args, usersData, message, client, event, setup }) {
    const moment = require("moment-timezone");
    const type = args[0];
    if (["find", "search", "-f", "-s"].includes(type)) {
      var allUser = await usersData.getAll(["name"]);
      var arrayreturn = [];
      var msg = "";
      var length = 0;
      const keyword = args[1];
      for (let user of allUser) {
        if (user.name.toLowerCase().includes(keyword.toLowerCase())) {
          length++;
          msg += `\n╭Name: ${user.name}\n╰ID: ${user.id}`;
        }
      }
      message.reply(length == 0 ? `❌ Không tìm thấy người dùng nào có tên khớp với từ khóa: ${keyword}` : `🔎Có ${length} kết quả phù hợp cho từ khóa "${keyword}":\n${msg}`);
    }
    else if (["ban", "-b"].includes(type)) {
      let id, reason;
      if (event.type == "message_reply") {
        id = event.messageReply.senderID;
        reason = args.slice(1).join(" ");
      } 
      else if (event.mentions) {
        let { mentions } = event;
        id = Object.keys(mentions)[0];
        reason = args.slice(1).join(" ").slice(mentions[id].length + 1);
      }
      else if (args[1]) {
        id = args[1];
        reason = args.slice(2).join(" ");
      }
      else return message.SyntaxError();
      
      if (!id) return message.reply("Id của người cần ban không được để trống, vui lòng nhập id hoặc tag hoặc teply tin nhắn của 1 người theo cú pháp user ban <id> <lý do>");
			if (!reason) return message.reply("Lý do cấm người dùng không được để trống, vui lòng soạn tin nhắn theo cú pháp user ban <id> <lý do>");
      if (!client.allUserData[id]) return message.reply(`Người dùng mang id ${id} không tồn tại trong dữ liệu bot`);
      reason = reason.replace(/\s+/g, ' ');
      const name = (await usersData.getData(id)).name;
      await usersData.setData(id, {
        banned: {
          status: true,
          reason,
          date: moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss")
        }
      }, (err) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else return message.reply(`Đã cấm người dùng mang id ${id} | ${name} sử dụng bot với lý do: ${reason}`);
      });
    }
    else if (["unban", "-u"].includes(type)) {
      let id;
      if (event.type == "message_reply") {
        id = event.messageReply.senderID;
      } 
      else if (event.mentions) {
        const { mentions } = event;
        id = Object.keys(mentions)[0];
      }
      else if (args[1]) {
        id = args[1];
      }
      else return message.SyntaxError();
      if (!id) return message.reply("Id của người cần ban không được để trống, vui lòng nhập id hoặc tag hoặc teply tin nhắn của 1 người theo cú pháp user ban <id> <lý do>");
      if (!client.allUserData[id]) return message.reply(`Người dùng mang id ${id} không tồn tại trong dữ liệu bot`);
      const name = (await usersData.getData(id)).name;
      await usersData.setData(id, { 
        banned: { 
          status: false,
          reason: null 
        }
      }, (err) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else message.reply(`Đã bỏ cấm người dùng mang id ${id} | ${name}, hiện tại người này có thể sử dụng bot`);
      });
    }
    else return message.SyntaxError();
  }
};