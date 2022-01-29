this.config = {    
  name: "sleep",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "tính giờ thức dậy 😪",
  longDescription: "tính giờ thức dậy từ giờ đi ngủ để bạn có một giấc ngủ ngon 😪😪",
  category: "healthy",
  guide: "{p}{n} [để trống|<giờ đi ngủ (hh:mm theo định dạng 24h)>]\nVí dụ:\n  {p}{n}\n  {p}{n} 08:30\n  {p}{n} 22:02",
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
    let timeSleep;
    
    if (!args[0]) timeSleep = moment().tz("Asia/Ho_Chi_Minh").format();
    else {
      if (args[0].split(":").length != 2 ) return message.reply("Vui lòng nhập giờ đi ngủ hợp lệ theo định dạng 24h hh:mm, ví dụ\n 08:30\n 22:02");
      let hoursSleep   = formatTwoNumber(args[0].split(":")[0]);
      let minutesSleep = formatTwoNumber(args[0].split(":")[1]);
      if (isNaN(hoursSleep) || isNaN(minutesSleep) ||
          hoursSleep > 23 || minutesSleep > 59 ||
          hoursSleep < 0 || minutesSleep < 0) return message.reply("Vui lòng nhập giờ đi ngủ hợp lệ theo định dạng 24h hh:mm, ví dụ\n 08:30\n 22:02");
      const getTime = moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD") + "T";
      timeSleep = getTime + hoursSleep + ":" + minutesSleep + ":00+07:00";
    }
    
    for (let i = 1; i < 6; i++) msg += moment(timeSleep).tz("Asia/Ho_Chi_Minh").add(sleepCycle * i, "minutes").format("HH:mm") + "  thời gian ngủ " + formatTwoNumber(Math.floor(sleepCycle*i/60)) + ":" + formatTwoNumber(Math.floor(sleepCycle*i%60)) + "\n";
		
    message.reply(`Nếu bạn ngủ vào lúc ${moment (timeSleep).tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")}, đánh thức lúc:\n\n${msg}\nChu kỳ ngủ ${sleepCycle}p (${Math.floor(sleepCycle/60)}h${Math.floor(sleepCycle%60)}p)`);
  }
};