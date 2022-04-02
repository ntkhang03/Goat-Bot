this.config = {    
  name: "rules",
  version: "1.0.5",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Quy tắc của nhóm",
  longDescription: "Tạo / xem / thêm / sửa / đổi vị trí / xóa nội quy nhóm của bạn",
  category: "Box chat",
  guide: "{p}{n} [add | -a] <nội quy muốn thêm>: thêm nội quy cho nhóm"
       + "\n{p}{n}: xem nội quy của nhóm"
       + "\n{p}{n} [edit | -e] <n> <nội dung sau khi sửa>: chỉnh sửa lại nội quy thứ n"
       + "\m{p}{n} [move | -m] <stt1> <stt2> hoán đổi vị trí của nội quy thứ <stt1> và <stt2> với nhau"
       + "\n{p}{n} [delete | -d] <n>: xóa nội quy theo số thứ tự thứ n"
       + "\n{p}{n} [remove | -r]: xóa tất cả nội quy của nhóm"
       + "\n"
       + "\n-Ví dụ:"
       + "\n + {p}{n} add không spam"
       + "\n + {p}{n} move 1 3"
       + "\n + {p}{n} -e 1 không spam tin nhắn trong nhóm"
       + "\n + {p}{n} -r"
};

module.exports = {
  config: this.config,
  start: async function({ api, role, globalGoat, args, message, event, threadsData }) {
    const { senderID, threadID, messageID } = event;
    
    const type = args[0];
    const threadData = await threadsData.getData(threadID);
    const dataOfThread = threadData.data;
    
    if (!dataOfThread.rules) dataOfThread.rules = [];
    const rulesOfThread = dataOfThread.rules;
    const totalRules = rulesOfThread.length;
    
    if (!type) {
      let i = 1;
      const msg = rulesOfThread.reduce((text, rules) => text += `${i++}. ${rules}\n`, "");
      message.reply(msg || "Hiện tại nhóm bạn chưa có bất kỳ nội quy nào, để thêm nội quy cho nhóm hãy sử dụng `rules add`");
    }
    else if (["add", "-a"].includes(type)) {
      if (role < 1) return message.reply("Chỉ quản trị viên mới có thể thêm nội quy cho nhóm");
      if (!args[1]) return message.reply("Vui lòng nhập nội dụng cho nội quy bạn muốn thêm");
      rulesOfThread.push(args.slice(1).join(" "));
      threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã thêm nội quy mới cho nhóm`);
      });
    }
    else if (["edit", "-e"].includes(type)) {
      if (role < 1) return message.reply("Chỉ quản trị viên mới có thể chỉnh sửa nội quy nhóm");
      const stt = parseInt(args[1]);
      if (isNaN(stt)) return message.reply(`Vui lòng nhập số thứ tự của quy định bạn muốn chỉnh sửa`);
      if (!rulesOfThread[stt-1]) return message.reply(`Không tồn tại nội quy thứ ${stt}, hiện tại nhóm bạn ${totalRules == 0 ? `chưa có nội quy nào được đặt ra` : `chỉ có ${totalRules} nội quy`}`);
      if (!args[2]) return message.reply(`Vui lòng nhập nội dung bạn muốn thay đổi cho nội quy thứ ${stt}`);
      const newContent = args.slice(2).join(" ");
      rulesOfThread[stt-1] = newContent;
      threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã chỉnh sửa nội quy thứ ${stt} của nhóm thành: ${newContent}`);
      });
    }
    else if (["move", "-m"].includes(type)) {
      if (role < 1) return message.reply("Chỉ quản trị viên mới có thể đổi vị trí nội quy của nhóm");
      const stt1 = parseInt(args[1]);
      const stt2 = parseInt(args[2]);
      if (isNaN(stt1) || isNaN(stt2)) return message.reply(`Vui lòng nhập số thứ tự của 2 nội quy nhóm bạn muốn chuyển đổi vị trí với nhau`);
      if (!rulesOfThread[stt1-1] || !rulesOfThread[stt2-1]) return message.reply(`Không tồn tại nội quy thứ ${!rulesOfThread[stt1-1] ? (stt1 + (!rulesOfThread[stt2-1] ? ` và ${stt2}` : '')) : stt2}, hiện tại nhóm bạn ${totalRules == 0 ? `chưa có nội quy nào được đặt ra` : `chỉ có ${totalRules} nội quy`}`);
      [rulesOfThread[stt1-1], rulesOfThread[stt2-1]] = [rulesOfThread[stt2-1], rulesOfThread[stt1-1]];
      threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã chuyển đổi vị trí của 2 nội quy thứ ${stt1} và ${stt2}`);
      });
    }
    else if (["delete", "del", "-d"].includes(type)) {
      if (role < 1) return message.reply("Chỉ quản trị viên mới có thể xóa nội quy của nhóm");
      if (!args[1] || isNaN(args[1])) return message.reply("Vui lòng nhập số thứ tự của nội quy bạn muốn xóa");
      const rulesDel = rulesOfThread[parseInt(args[1])-1];
      if (!rulesDel) return message.reply(`Không tồn tại nội quy thứ ${args[1]}, hiện tại nhóm bạn có ${totalRules} nội quy`);
      rulesOfThread.splice(parseInt(args[1]) - 1, 1);
      threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã xóa nội quy thứ ${args[1]} của nhóm, nội dung: ${rulesDel}`);
      });
    }
    else if (type == "remove" || type == "-r") {
      if (role < 1) return message.reply("Chỉ có quản trị viên nhóm mới có thể xoá bỏ tất cả nội quy của nhóm");
      dataOfThread.rules = [];
      threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã xóa toàn bộ nội quy của nhóm`);
      });
    }
    else if (!isNaN(type)) {
      let msg = "";
      for (const stt of args) {
        const rules = rulesOfThread[parseInt(stt) - 1];
        if (rules) msg += `${stt}. ${rules}\n`;
      }
      message.reply(msg || `Không tồn tại nội quy thứ ${type}, hiện tại nhóm bạn ${totalRules == 0 ? `chưa có nội quy nào được đặt ra` : `chỉ có ${totalRules} nội quy`}`);
    }
  }
};
