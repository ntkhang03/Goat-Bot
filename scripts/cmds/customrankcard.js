this.config = {    
  name: "customrankcard",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Thiết kế thẻ rank",
  longDescription: "Thiết kế thẻ rank theo ý bạn",
  category: "rank",
  guide: "{p}{n} [maincolor | subcolor | expcolor | expnextlevelcolor | alphasubcolor | textcolor | reset] <value>\nTrong đó: "
       + "\n+ Maincolor: background chính của thẻ rank (hex color or rgba or url image)"
       + "\n+ Subcolor: background phụ (hex color or rgba or url image)"
       + "\n+ Expcolor: màu của thanh exp hiện tại"
       + "\n+ Expnextlevelcolor: màu của thanh exp full"
       + "\n+ Alphasubcolor: độ mờ của background phụ (từ 0 -> 1)"
       + "\n Textcolor: màu của chữ (hex color or rgba)"
       + "\n Reset: reset về mặc định"
       + "\n\nVí dụ:"
        + "\n  {p}{n} maincolor #fff000"
        + "\n  {p}{n} subcolor rgba(255,136,86,0.4)"
        + "\n  {p}{n} reset",
  sendFile: {
    [__dirname + "/src/image/helpcustomrankcard.jpg"]: "https://github.com/ntkhang03/resources-goat-bot/raw/master/image/helpcustomrankcard.jpg"
  }
};

module.exports = {
  config: this.config,
  start: async function({ message, threadsData, event, args }) {
    const axios = require("axios");
    
    const threadInfo = await threadsData.getData(event.threadID);
     
    const dataThread = threadInfo.data;
    if (!dataThread.customRankCard) dataThread.customRankCard = {};
    let oldDesign = dataThread.customRankCard;
    if (!args[0]) return message.SyntaxError();
    const key = args[0].toLowerCase();
    const value = args.slice(1).join(" ");
    
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
    const checkUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    const hexColorRegex = /^#([0-9a-f]{6})$/i;
    
    if (["subcolor", "maincolor", "expcolor", "expnextlevelcolor"].includes(key)) {
      // if image url
      if (value.match(checkUrlRegex)) {
        const response = await axios.get("https://goatbot.tk/taoanhdep/checkurlimage?url="+encodeURIComponent(value));
        if (response.data == false) return message.reply("Url hình ảnh không hợp lệ, vui lòng chọn 1 url với trang đích là hình ảnh");
        key == "maincolor" ? oldDesign.main_color = value
        : key == "subcolor" ? oldDesign.sub_color = value
        : key == "expcolor" ? oldDesign.exp_color = value
        : key == "textcolor" ? oldDesign.text_color = value
        : oldDesign.expNextLevel_color = value;
      }
      else {
        // if color
        if (!value.match(rgbRegex) && !value.match(hexColorRegex)) return message.reply("Mã màu không hợp lệ, vui lòng nhập mã hex color (6 chữ số) hoặc mã màu rgba");
        key == "maincolor" ? oldDesign.main_color = value
        : key == "subcolor" ? oldDesign.sub_color = value
        : key == "expcolor" ? oldDesign.exp_color = value
        : key == "textcolor" ? oldDesign.text_color = value
        : oldDesign.expNextLevel_color = value;
      }
      await threadsData.setData(event.threadID, {
        data: dataThread
      }, (e, i) => {
        if (e) return message.reply("Đã xảy ra lỗi vui lòng thử lại sau\n" + e.name + ": " + e.message);
        message.reply("Đã lưu thay đổi của bạn");
      });
    }
    else if (key == "alphasubcolor" || key == "alphasubcard") {
      if (parseFloat(value) < 0 && parseFloat(value) > 1) return message.reply("Vui lòng chọn chỉ số trong khoảng từ 0 -> 1");
      oldDesign.alpha_subcard = parseFloat(value);
      await threadsData.setData(event.threadID, {
        data: dataThread
      }, (e, i) => {
        if (e) return message.reply("Đã xảy ra lỗi vui lòng thử lại sau\n" + e.name + ": " + e.message);
        message.reply("Đã lưu thay đổi của bạn");
      });
    }
    else if (key == "reset") {
      dataThread.customRankCard = {};
      await threadsData.setData(event.threadID, {
        data: dataThread
      }, (e, i) => {
        if (e) return message.reply("Đã xảy ra lỗi vui lòng thử lại sau\n" + e.name + ": " + e.message);
        message.reply("Đã lưu thay đổi của bạn (reset)");
      });
    }
    else message.SyntaxError();
    
  }
};