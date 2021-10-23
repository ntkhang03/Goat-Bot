this.config = {
  name: "avatar",
  version: "1.0.0",
  author: {
    name: "NTKhang",
    contacts: ""
  },
  cooldowns: 5,
  role: 0, 
  shortDescription: "tạo avatar anime",
  longDescription: "tạo avatar anime với chữ ký",
  category: "image",
  sendFile: {
    [__dirname+"/cache/hexcolor.png"]: "https://www.htlvietnam.com/images/bai-viet/code-mau/bang-ma-mau-02.jpg"
  },
  guide: "{p}{n} <mã số nhân vật hoặc tên nhân vật> | <chữ nền> | <chữ ký> | <tên màu tiếng anh hoặc mã màu nền (hex color)>\n{p}{n} help: xem cách dùng lệnh"
};

module.exports = {
  config: this.config,
  start: async function({ args, message, download }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    if (!args[0] || args[0] == "help") message.guideCmd();
    else {
  		try {
  		  message.reply(`Đang khởi tạo hình ảnh, vui lòng chờ đợi...`);
  		  const content = args.join(" ").trim().replace(/\s+/g, " ").replace(/(\s+\|)/g, "|").replace(/\|\s+/g,  "|").split("|");
  		  let idNhanVat, tenNhanvat;
  		  const chu_nen = content[1];
        const chu_ky  = content[2];
        const mau_nen = content[3];
  		  const dataChracter = (await axios.get("https://taoanhdep.kaysil.dev/v1/wibu/list")).data.data;
  		  
        if (!isNaN(content[0])) {
          idNhanVat = parseInt(content[0]);
          tenNhanvat = dataChracter[idNhanVat].characterName;
        }
        else {
          findChracter = dataChracter.find(item => item.characterName.toLowerCase() == content[0].toLowerCase());
          if (findChracter) {
            idNhanVat = findChracter.characterId;
            tenNhanvat = content[0];
          }
          else return message.reply("Không tìm thấy nhân vật mang tên " + content[0] + " trong danh sách nhân vật");
        }
        
        const path = __dirname + "/cache/avatarAnime.jpg";
        let linkapi = encodeURI(`https://taoanhdep.kaysil.dev/v1/wibu/create?id_nhanvat=${idNhanVat}&chu_nen=${chu_nen}&chu_ky=${chu_ky}`);
        mau_nen ? linkapi += `&mau_nen=${encodeURIComponent(mau_nen)}` : "";
        await download(linkapi, path);
        message.reply({
          body: `Avatar của bạn\nNhân vật: ${tenNhanvat}\nMã số: ${idNhanVat}\nChữ nền: ${chu_nen}\nChữ ký: ${chu_ky}\nMàu: ${mau_nen || "mặc định"}`, 
          attachment: fs.createReadStream(path)
        }, () => fs.unlinkSync(path));
  		}
  		catch(err) {
        return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
		  }
	  }
  }
};