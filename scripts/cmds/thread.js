this.config = {    
  name: "thread",
  version: "1.0.5",
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
    // find thread
    if (["find", "search", "-f", "-s"].includes(type)) {
      const allThread = await threadsData.getAll(["name"]);
      const keyword = args.slice(1).join(" ");
			const result = allThread.filter(item => item.name.toLowerCase().includes(keyword.toLowerCase()));
			const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.id}`, "");
      message.reply(result.length == 0 ? `❌ Không tìm thấy nhóm nào có tên khớp với từ khoá: ${keyword}` : `🔎Có ${result.length} kết quả phù hợp cho từ khóa "${keyword}":\n${msg}`);
    }
    // ban thread
    else if (["ban", "-b"].includes(type)) {
      let id, reason;
      if (!isNaN(args[1])) {
        id = args[1];
        reason = args.slice(2).join(" ");
      }
      else {
        id = event.threadID;
        reason = args.slice(1).join(" ");
      }
      if (!id || !reason) return message.SyntaxError();
      reason = reason.replace(/\s+/g, ' ');
      if (!client.allThreadData[id]) return message.reply(`Nhóm mang id ${id} không tồn tại trong dữ liệu bot`);
      const threadData = await threadsData.getData(id);
      const name = threadData.name;
      const status = threadData.banned.status;
      
      if (status) return message.reply(`Nhóm mang id [${id} | ${name}] đã bị cấm từ trước:\n> Lý do: ${threadData.banned.reason}\n> Thời gian: ${threadData.banned.date}`);
      const time = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss");
      
      await threadsData.setData(id, {
        banned: {
          status: true,
      	  reason,
      	  date: time
        }
      }, (err) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else return message.reply(`Đã cấm nhóm mang id [${id} | ${name}] sử dụng bot.\n> Lý do: ${reason}\n> Thời gian: ${time}`);
      });
    }
    // unban thread
    else if (["unban", "-u"].includes(type)) {
      let id;
      if (!isNaN(args[1])) id = args[1];
      else id = event.threadID;
      if (!id) return message.SyntaxError();
      if (!client.allThreadData[id]) return message.reply(`Nhóm mang id ${id} không tồn tại trong dữ liệu bot`);
      
      const threadData = await threadsData.getData(id);
      const name = threadData.name;
      const status = threadData.banned.status;
      
      if (!status) return message.reply(`Hiện tại nhóm mang id [${id} | ${name}] không bị cấm sử dụng bot`);
      await threadsData.setData(id, {
        banned: {
          status: false,
      	  reason: null
        }
      }, (err, data) => {
        if (err) return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
        else message.reply(`Đã bỏ cấm nhóm mang id [${id} | ${name}], hiện tại nhóm này có thể sử dụng bot`);
      });
    }
    // info thread
    else if(["info", "-i"].includes(type)) {
      let id;
      if (!isNaN(args[1])) id = args[1];
      else id = event.threadID;
      if (!id) return message.SyntaxError();
      if (!client.allThreadData[id]) return message.reply(`Nhóm mang id ${id} không tồn tại trong dữ liệu bot`);
      const threadData = await threadsData.getData(id);
      const valuesMember = Object.values(threadData.members).filter(item => item.inGroup);
      const msg = `> Thread ID: ${threadData.id}`
      + `\n> Name: ${threadData.name}`
      + `\n> Create Date: ${moment(threadData.data.createDate).tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss")}`
      + `\n> Tổng thành viên: ${valuesMember.length}`
      + `\n> Nam: ${valuesMember.filter(item => item.gender == "MALE").length} thành viên`
      + `\n> Nữ: ${valuesMember.filter(item => item.gender == "FEMALE").length} thành viên`
      + `\n> Tổng tin nhắn: ${valuesMember.reduce((i, item) => i += item.count, 0)}`
      + `\n- Banned: ${threadData.banned.status}`
      + `\n- Reason: ${threadData.banned.reason}`
      + `\n- Time: ${threadData.banned.date}`;
      return message.reply(msg);
    }
    else return message.SyntaxError();
  }
};