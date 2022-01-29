this.config = {
  name: "wakeup",
  shortName: "wake",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "tính giờ thức dậy 😪",
  longDescription: "tính giờ đi ngủ từ giờ thức dậy để bạn có một giấc ngủ ngon 😪😪",
  category: "healthy",
  guide: "{p}{n} <giờ thức dậy (hh:mm theo định dạng 24h)>\nVí dụ: {p}{n} 08:30",
  envGlobal: {
    sleepCycle: 110
  }
};

module.exports = {
  config: this.config,
  start: async function({ message, event, args, globalGoat }) {
    const Canvas = require("canvas");
    const moment = require("moment-timezone");
    const sleepCycle = globalGoat.configCommands.envGlobal.sleepCycle;
    function formatTwoNumber(t) {
      return t < 10 ? "0" + Number(t) : t;
    }
    
    let msg = "";
    
    if ((args[0] || "").split(":").length != 2) return message.reply("Vui lòng nhập giờ bạn muốn thức dậy hợp lệ theo định dạng 24h hh:mm, ví dụ\n 08:30\n 22:02");
    let hoursWakeup   = formatTwoNumber(args[0].split(":")[0]);
    let minutesWakeup = formatTwoNumber(args[0].split(":")[1]);
    if (isNaN(hoursWakeup) || isNaN(minutesWakeup) ||
        hoursWakeup > 23 || minutesWakeup > 59 ||
        hoursWakeup < 0 || minutesWakeup < 0) return message.reply("Vui lòng nhập giờ bạn muốn thức dậy hợp lệ theo định dạng 24h hh:mm, ví dụ\n 08:30\n 22:02");
    const getTime = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD") + "T";
    const timeWakeup = getTime + hoursWakeup + ":" + minutesWakeup + ":00+07:00";
		message.reply(timeWakeup);
		
    for (let i = 6; i > 0; i--) msg += moment(timeWakeup).tz("Asia/Ho_Chi_Minh").subtract(sleepCycle * i, "minutes").format("HH:mm") + "  thời gian ngủ " + formatTwoNumber(Math.floor(sleepCycle*i/60)) + ":" + formatTwoNumber(Math.floor(sleepCycle*i%60)) + "\n";
		
    message.reply(`Nếu bạn muốn thức dậy vào lúc ${moment(timeWakeup).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")}, hãy ngủ vào những khoảng thời gian này:\n\n${msg}\nChu kỳ ngủ ${sleepCycle}p (${Math.floor(sleepCycle/60)}h${Math.floor(sleepCycle%60)}p)`);
  }
};