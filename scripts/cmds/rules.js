this.config = {    
  name: "rules",
  version: "1.0.3",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Quy tắc của nhóm",
  longDescription: "Tạo / xem / thêm / sửa / xóa nội quy nhóm của bạn",
  category: "Box chat",
  guide: "{p}{n} [add | -a] <nội quy muốn thêm>: thêm nội quy cho nhóm"
       + "\n{p}{n}: xem nội quy của nhóm"
       + "\n{prefix}{n} [edit | -e] <n> <nội dung sau khi sửa>: chỉnh sửa lại nội quy thứ n"
       + "\n{prefix}{n} [delete | -d] <n>: xóa nội quy theo số thứ tự thứ n"
       + "\n{p}{n} [remove | -r]: xóa tất cả nội quy của nhóm"
       + "\n"
       + "\n-Ví dụ:"
       + "\n +{p}{n} add không spam"
       + "\n +{p}{n} -e 1 không spam tin nhắn trong nhóm"
       + "\n +{p}{n} -r"
};

module.exports = {
  config: this.config,
  start: async function({ api, globalGoat, args, download, message, event, threadsData }) {
    const { senderID, threadID, messageID } = event;
    
    const type = args[0];
    const threadData = await threadsData.getData(threadID);
    const dataOfThread = threadData.data;
    const adminIDs = threadData.adminIDs;
    
    if (!dataOfThread.rules) dataOfThread.rules = [];
    const rulesOfThread = dataOfThread.rules;
    
    if (!type) {
      let msg = "";
      let i = 1;
      for (const rules of rulesOfThread) msg += `${i++}. ${rules}\n`;
      message.reply(msg || "Hiện tại nhóm bạn chưa có bất kỳ nội quy nào, để thêm nội quy cho nhóm hãy sử dụng `rules add`");
    }
    else if (type == "add" || type == "-a") {
      if (!adminIDs.includes(senderID)) return message.reply("Chỉ có quản trị viên nhóm mới có thể thêm nội quy");
      if (!args[1]) return message.reply("Vui lòng nhập nội dụng cho nội quy bạn muốn thêm");
      rulesOfThread.push(args.slice(1).join(" "));
      return await threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã thêm nội quy mới cho nhóm`);
      });
    }
    else if (type == "delete" || type == "-d" || type == "del") {
      if (!adminIDs.includes(senderID)) return message.reply("Chỉ có quản trị viên nhóm mới có thể xóa nội quy");
      if (!args[1] || isNaN(args[1])) return message.reply("Vui lòng nhập số thứ tự của nội quy bạn muốn xóa");
      const rulesDel = rulesOfThread[parseInt(args[1])-1];
      if (!rulesDel) return message.reply(`Không tồn tại nội quy thứ ${args[1]}, hiện tại nhóm bạn có ${rulesOfThread.length} nội quy`);
      rulesOfThread.splice(parseInt(args[1]) - 1, 1);
      return await threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã xóa nội quy thứ ${args[1]} của nhóm, nội dung: ${rulesDel}`);
      });
    }
    else if (type == "remove" || type == "-r") {
      if (!adminIDs.includes(senderID)) return message.reply("Chỉ có quản trị viên nhóm mới có thể xoá bỏ tất cả nội quy của nhóm");
      dataOfThread.rules = [];
      return await threadsData.setData(threadID, {
        data: dataOfThread
      }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi: " + err.name + "\n" + err.message);
        message.reply(`Đã xóa toàn bộ nội quy của nhóm`);
      });
    }
    else if (!isNaN(type)) {
      const stt = parseInt(type);
      const getRules = rulesOfThread[stt - 1];
      if (!getRules) {
        message.reply(`Không tồn tại nội quy thứ ${stt}, hiện tại nhóm bạn ${rulesOfThread.length == 0 ? `chưa có nội quy nào` : `có ${rulesOfThread.length} nội quy`}`);
      }
      else {
        message.reply(`Nội quy thứ ${stt} của nhóm:\n${getRules}`);
      }
    }
  }
};
