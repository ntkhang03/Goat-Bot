const moment = require("moment-timezone");
this.config = {    
  name: "warn",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "cảnh cáo thành viên",
  longDescription: "cảnh cáo thành viên trong nhóm, đủ 3 lần ban khỏi box",
  category: "box chat",
  guide: "{p}{n} @tag <lý do>: dùng cảnh cáo thành viên"
       + "\n{p}{n} list: xem danh sách những thành viên đã bị cảnh cáo"
       + "\n{p}{n} listban: xem danh sách những thành viên đã bị cảnh cáo đủ 3 lần và bị ban khỏi box"
       + "\n{p}{n} check [@tag | <uid> | để trống]: xem thông tin cảnh cáo của người được tag hoặc uid hoặc bản thân"
       + "\n{p}{n} unban <uid>: gỡ ban thành viên bằng uid"
       + "\n⚠️ Cần set quản trị viên cho bot để bot tự kick thành viên bị ban"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, event, args, threadsData, usersData, client }) {
    if (!args[0]) return message.SyntaxError();
    const { threadID } = event;
    const { data } = await threadsData.getData(threadID);
    if (!data.warn) data.warn = {
      banned: [],
      warnList: []
    };
    const { warnList, banned } = data.warn;
    
    
    if (args[0] == "list") {
      let msg = "";
      for (const user of warnList) {
        msg += `\nName: ${user.name}`
             + `\nUid: ${user.uid}`
             + `\nSố lần bị cảnh cáo: ${user.data.length}`
             + '\n';
      }
        message.reply(msg ? "Danh sách những thành viên bị cảnh cáo:\n" + msg + `\nĐể xem chi tiết những lần cảnh cáo hãy dùng lệnh "${client.getPrefix(threadID) + "warn check  [@tag | <uid> | để trống]\": để xem thông tin cảnh cáo của người được tag hoặc uid hoặc bản thân"}` : "Nhóm bạn chưa có thành viên nào bị cảnh cáo");
    }
    
    
    else if (args[0] == "listban") {
      let msg = "";
      for (const uid of banned) {
        msg += `\nName: ${warnList.find(user => user.uid == uid).name}`
             + `\nUid: ${uid}`
             + '\n';
      }
      message.reply(msg ? "Danh sách những thành viên bị cảnh cáo đủ 3 lần và ban khỏi box:\n" + msg : "Nhóm bạn chưa có thành viên nào bị ban khỏi box");
    }
    
    
    else if (args[0] == "check" || args[0] == "info") {
      let uids, msg = "";
      if (Object.keys(event.mentions).length > 0) uids = Object.keys(event.mentions);
      else if (args.slice(1).length > 0) uids = args.slice(1);
      else uids = [event.senderID];
      if (!uids) return message.reply("Vui lòng nhập uid hợp lệ của người bạn muốn xem thông tin");
      for (const uid of uids) {
        const dataWarnOfUser = warnList.find(user => user.uid == uid);
        msg += `\nUid: ${uid}`;
        if (!dataWarnOfUser || dataWarnOfUser.data.length == 0) msg += `\nKhông có dữ liệu nào\n`;
        else {
          msg += `\nName: ${dataWarnOfUser.name}`
               + `\nWarn list:`;
          for (const dataW of dataWarnOfUser.data) {
            msg += `\n  Reason: ${dataW.reason}`
                 + `\n  Time: ${dataW.dateTime}\n`;
          }
        }
      }
			message.reply(msg);
    }
    
    
    else if (args[0] == "unban") {
      const uidUnban = args[1];
      if (!uidUnban || isNaN(uidUnban)) return message.reply("Vui lòng nhập uid hợp lệ của người muốn gỡ ban");
      if (!banned.includes(uidUnban)) return message.reply(`Người dùng mang id ${uidUnban} chưa bị ban khỏi box của bạn`);
      banned.splice(banned.findIndex(uid => uid == uidUnban), 1);
      warnList.splice(warnList.findIndex(user => user.uid == uidUnban), 1);
      const userName = warnList.find(user => user.uid == uidUnban).name;
      await threadsData.setData(threadID, {
        data
      });
      return message.reply(`Đã gỡ ban thành viên [${uidUnban} | ${userName}], hiện tại người này có thể tham gia box chat của bạn`);
    }
    
    
    else {
      let reason, uid;
      if (event.messageReply) {
        uid = event.messageReply.senderID;
        reason = args.join(" ").trim();
      }
      else if (Object.keys(event.mentions)[0]) {
        uid = Object.keys(event.mentions)[0];
        reason = args.join(" ").replace(event.mentions[uid], "").trim();
      }
      else {
        return message.reply("Bạn cần phải tag hoặc phản hồi tin nhắn của người muốn cảnh cáo");
      }
      if (!reason) reason = "Không có lý do";
      const dataWarnOfUser = warnList.find(item => item.uid == uid);
      const times = (dataWarnOfUser ? dataWarnOfUser.data.length : 0) + 1;
      const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY hh:mm:ss");
      if (times >= 3) banned.push(uid);
      const userName = (await usersData.getData(uid)).name;
      if (!dataWarnOfUser) {
        warnList.push({
          uid,
          name: userName,
          data: [{ reason, dateTime }]
        });
      }
      else {
        dataWarnOfUser.data.push({ reason, dateTime });
      }
      await threadsData.setData(threadID, {
        data
      });
      
      if (times >= 3) {
        message.reply(`⚠️ Đã cảnh cáo thành viên ${userName} lần ${times}`
                  + `\n- Uid: ${uid}`
                  + `\n- Lý do: ${reason}`
                  + `\n- Date Time: ${dateTime}`
                  + `\nThành viên này đã bị cảnh cáo đủ 3 lần và bị ban khỏi box, để gỡ ban vui lòng sử dụng lệnh "${client.getPrefix(threadID)}warn unban <uid>" (với uid là uid của người muốn gỡ ban)`,
        function() {
          api.removeUserFromGroup(uid, threadID, (err) => {
            if (err) return message.reply(`Bot cần quyền quản trị viên để kick thành viên bị ban`);
          });
        });
      }
      else return message.reply(`⚠️ Đã cảnh cáo thành viên ${userName} lần ${times}`
                  + `\n- Uid: ${uid}`
                  + `\n- Lý do: ${reason}`
                  + `\n- Date Time: ${dateTime}`
                  + `\nNếu vi phạm ${3 - (times)} lần nữa người này sẽ bị ban khỏi box`
      );
    }
  },
  
  whenReply: async function({ message, api, event, args, threadsData, usersData }) {
    const { data, adminIDs } = await threadsData.getData(threadID);
    if (!data.warn) return;
    const { banned } = data.warn;
    
    if (banned.includes(event.senderID)) {
      const userName = (await usersData.getData(event.senderID)).name;
      message.send({
        body: `Thành viên này đã bị cảnh cáo đủ 3 lần trước đó và bị ban khỏi box\nName: ${userName}\nUid: ${event.senderID}\n để gỡ ban vui lòng sử dụng lệnh "${client.getPrefix(threadID)}warn unban <uid>" (với uid là uid của người muốn gỡ ban)`,
        mentions: [{
          tag: userName,
          id: event.senderID
        }]
      }, function() {
        api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
          if (err) return message.send(`Bot cần quyền quản trị viên để kick thành viên bị ban`);
        });
      });
    }
  }
};