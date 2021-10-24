this.config = {    
  name: "sorthelp",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tạo ảnh bìa",
  longDescription: "Tạo ảnh bìa đẹp",
  category: "image",
  guide: "{prefix}{n} [name|category]\nVí dụ: {p}{n} name"
};

module.exports = {
  config: this.config,
  start: async function({ message, event, args, threadsData }) {
    if (args[0] == "name") {
      threadsData.setData(event.threadID, { sortHelp: "name" }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi vui lòng thử lại sau" + err.stack);
        else message.reply("Đã lưu cài đặt sắp xếp danh sách help theo thứ tự chữ cái");
      });
    }
    else if (args[0] == "category") {
      threadsData.setData(event.threadID, { sortHelp: "category" }, (err) => {
        if (err) return message.reply("Đã xảy ra lỗi vui lòng thử lại sau" + err.stack);
        else message.reply("Đã lưu cài đặt sắp xếp danh sách help theo thứ tự nhóm");
      });
    }
    else message.SyntaxError();
  }
};