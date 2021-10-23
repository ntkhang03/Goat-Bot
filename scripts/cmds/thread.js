this.config = {    
  name: "thread",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "Quản lý các nhóm chat",
  longDescription: "Quản lý các nhóm chat trong hệ thống bot",
  category: "owner",
  guide: "{prefix}thread [find | -f | search | -s] <tên cần tìm>: tìm kiếm nhóm chat trong dữ liệu bot bằng tên"
       + "\n"
       + "\n{prefix}thread [ban | -b] [<id> | để trống] <reason>: dùng để cấm nhóm mang id <id> hoặc nhóm hiện tại sử dụng bot"
       + "\nVí dụ:"
       + "\n{prefix}thread ban 3950898668362484 spam bot"
       + "\n{prefix}thread ban spam quá nhiều"
       + "\n"
       + "\n{prefix}thread unban [<id> | để trống] để bỏ cấm nhóm mang id <id>"
       + "\nhoặc nhóm hiện tại"
};

module.exports = {
  config: this.config,
  start: async function({ api, args, threadsData, message, client, event }) {
    const moment = require("moment-timezone");
    const type = args[0];
    if (["find", "search", "-f", "-s"].includes(type)) {
      var allThread = await threadsData.getAll(["name"]);
      var arrayreturn = [];
      var msg = "";
      var length = 0;
      const keyword = args.slice(1).join(" ");
      for (let i in allThread) {
        if (allThread[i].name.toLowerCase().includes(keyword.toLowerCase())) {
          length++;
          msg += `\n╭Name: ${allThread[i].name}\n╰ID: ${i}`;
        }
      };
      message.reply(length == 0 ? `❌Không có kết quả tìm kiếm nào phù hợp với từ khóa ${keyword}` : `🔎Có ${length} kết quả phù hợp cho từ khóa "${keyword}":\n${msg}`);
    }
    else if (["ban", "-b"].includes(type)) {
      var id, reason;
      if (client.allThread.includes(args[1])) {
        id = args[1];
        reason = args.slice(2).join(" ");
      }
      else {
        id = event.threadID;
        reason = args.slice(1).join(" ");
      };
      if (!id || !reason) return message.SyntaxError();
      reason = reason.replace(/\s+/g, ' ');
      if (!client.allThread.includes(id)) return message.reply(`Nhóm mang id ${id} không tồn tại trong dữ liệu bot`);
      const threadData = (await threadsData.getData(id));
      const name = threadData.name;
      
      const { banned } = threadData;
      banned.usebot = {
        status: true,
    	  reason,
    	  date: moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss")
      };
      await threadsData.setData(id, { banned }, (err) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else return message.reply(`Đã cấm nhóm mang id ${id} | ${name} sử dụng bot với lý do: ${reason}`);
      });
    }
    else if (["unban", "-u"].includes(type)) {
      var id;
      if (client.allThread.includes(args[1])) {
        id = args[1];
      }
      else {
        id = event.threadID;
      };
      if (!id) return message.SyntaxError(require(module.filename).name);
      if (!client.allThread.includes(id)) return message.reply(`Nhóm mang id ${id} không tồn tại trong dữ liệu bot`);
      const threadData = await threadsData.getData(id);
      const name = threadData.name;
      const { banned } = threadData;
      banned.usebot = {
        status: false,
    	  reason: null
      };
      await threadsData.setData(id, { banned }, (err, data) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else message.reply(`Đã bỏ cấm nhóm mang id ${id} | ${name}, hiện tại nhóm này có thể sử dụng bot`);
      });
    }
    else return message.SyntaxError();
  }
};