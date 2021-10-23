this.config = {    
  name: "help",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Xem cách dùng lệnh",
  longDescription: "Xem cách sử dụng của các lệnh",
  category: "info",
  guide: "{p}{n} [để trống|số trang|<tên lệnh>]",
  priority: 1,
  packages: "moment-timezone"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, message, args, event, threadsData }) {
    const moment = require("moment-timezone");
    const { statSync, existsSync, createReadStream } = require("fs-extra");
    const axios = require("axios");
    const { threadID } = event;
    const dataThread = await threadsData.getData(threadID);
    const prefix = dataThread.prefix || globalGoat.config.prefix;
    let sortHelp = dataThread.sortHelp || "name";
    if (!["category", "name"].includes(sortHelp)) sortHelp = "name";
    const command = globalGoat.commands.get((args[0] || "").toLowerCase());
    
// ———————————————— LIST ALL COMMAND ——————————————— //
    if (!command && !args[0] || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";
      if (sortHelp == "name") {
        const page = parseInt(args[0]) || 1;
        const numberOfOnePage = 20;
        let i = 0;
        for (var [name, value] of (globalGoat.commands)) {
          value.config.shortDescription && value.config.shortDescription.length < 40 ? name += ` → ${value.config.shortDescription.charAt(0).toUpperCase() + value.config.shortDescription.slice(1)}` : "";
          arrayInfo.push({ data: name, priority: value.priority || 0 });
        }
        arrayInfo.sort((a, b) => a.data - b.data);
        arrayInfo.sort((a, b) => (a.priority > b.priority ?  -1 : 1));
        const startSlice = numberOfOnePage*page - numberOfOnePage;
        i = startSlice;
        const returnArray = arrayInfo.slice(startSlice, startSlice + numberOfOnePage);
        const characters = "──────────────────";
        
        for (let item of returnArray) {
          msg += `【${++i}】 ${item.data}\n`;
        }
        const doNotDelete = "[ 🐐 | Project Goat Bot ]";
        message.reply(`⊱ ⋅ ${characters}\n${msg}${characters} ⋅ ⊰\nTrang [ ${page}/${Math.ceil(arrayInfo.length/numberOfOnePage)} ]\nHiện tại bot có ${globalGoat.commands.size} lệnh có thể sử dụng\n» Gõ ${prefix}help <số trang> để xem danh sách lệnh\n» Gõ ${prefix}help <tên lệnh> để xem chi tiết cách sử dụng lệnh đó\n${characters} ⋅ ⊰\n${doNotDelete}`);
      }
      else if (sortHelp == "category") {
        for (let [name, value] of globalGoat.commands) arrayInfo.some(item => item.category == value.config.category.toLowerCase()) ? arrayInfo[arrayInfo.findIndex(item => item.category == value.config.category.toLowerCase())].names.push(value.config.name) : arrayInfo.push({ category: value.config.category.toLowerCase(), names: [value.config.name]});
        arrayInfo.sort((a, b) => (a.category < b.category ?  -1 : 1));
        for (let data of arrayInfo) {
          let categoryUpcase = "______ " + data.category.toUpperCase() + " ______";
          data.names.sort();
          msg += `${categoryUpcase}\n${data.names.join(", ")}\n`;
        }
        const characters = "───────────────";
        const doNotDelete = "[ 🐐 | Project Goat Bot ]";
        message.reply(`${msg}\n⊱ ⋅ ${characters} ⋅ ⊰\n» Hiện tại bot có ${globalGoat.commands.size} lệnh có thể sử dụng, gõ ${prefix}help <tên lệnh> để xem chi tiết cách sử dụng lệnh đó\n${characters} ⋅ ⊰\n${doNotDelete}`);
      }
    }
// ———————————— COMMAND DOES NOT EXIST ———————————— //
    else if (!command && args[0]) {
      return message.reply(`Lệnh "${args[0]}" không tồn tại`);
    }
// ————————————————— HELP COMMAND ————————————————— //
    else {
      const configCommand = command.config;
      let author = "", contacts = "";
      if (configCommand.author) {
        author = configCommand.author.name || "";
        contacts = configCommand.author.contacts || "";
      }
      
      const nameUpperCase = configCommand.name.toUpperCase();
      const characters = Array.from('─'.repeat(nameUpperCase.length)).join("");
      const title = `╭${characters}╮\n   ${nameUpperCase}\n╰${characters}╯`;
      
      let msg = `${title}\n📜Mô tả: ${configCommand.longDescription || "Không có"}` +
      `\n\n» 👥Role: ${((configCommand.role == 0) ? "Tất cả người dùng" : (configCommand.role == 1) ? "Quản trị viên nhóm" : "Admin bot" )}` +
      `\n» ⏱Thời gian mỗi lần dùng lệnh: ${configCommand.cooldowns || 1}s` +
      `\n» ✳️Phân loại: ${configCommand.category || "Không có phân loại"}` +
      `\n\n» 👨‍🎓Author: ${author}` +
      `\n» 📱Contacts: ${contacts}`;
      if (configCommand.guide) msg += `\n\n» 📄Hướng dẫn cách dùng:\n${configCommand.guide.replace(/\{prefix\}|\{p\}/g, prefix).replace(/\{name\}|\{n\}/g, configCommand.name)}\n✎﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏\n` +
      `📝Chú thích:\n• Nội dung bên trong <XXXXX> là có thể thay đổi\n• Nội dung bên trong [a|b|c] là a hoặc b hoặc c`;
      const formSendMessage = {
        body: msg
      };
      
      const { sendFile } = configCommand;
      if (sendFile &&
          typeof(sendFile) == 'object' &&
          !Array.isArray(sendFile)
      ) {
        formSendMessage.attachment = [];
        for (let pathFile in sendFile) {
          if (!existsSync(pathFile)) await download(sendFile[pathFile], pathFile);
          formSendMessage.attachment.push(createReadStream(pathFile));
        }
      }
      return message.reply(formSendMessage);
    }
  }
};