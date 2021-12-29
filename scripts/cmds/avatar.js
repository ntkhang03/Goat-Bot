this.config = {
  name: "avatar",
  version: "1.0.3",
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
  		  const content = args.join(" ").trim().split("|").map(item => item = item.trim());
  		  let idNhanVat, tenNhanvat;
  		  const chu_Nen = content[1];
        const chu_Ky  = content[2];
        const colorBg = content[3];
  		  const dataChracter = (await axios.get("https://goatbot.tk/taoanhdep/listavataranime?apikey=ntkhang")).data.data;
  		  
        if (!isNaN(content[0])) {
          idNhanVat = parseInt(content[0]);
          const totalCharacter = dataChracter.length - 1;
          if (idNhanVat > totalCharacter) return message.reply(`Hiện tại chỉ có ${totalCharacter} nhân vật trên hệ thống, vui lòng nhập id nhân vật nhỏ hơn`);
          tenNhanvat = dataChracter[idNhanVat].name;
        }
        else {
          findChracter = dataChracter.find(item => item.name.toLowerCase() == content[0].toLowerCase());
          if (findChracter) {
            idNhanVat = findChracter.stt;
            tenNhanvat = content[0];
          }
          else return message.reply("Không tìm thấy nhân vật mang tên " + content[0] + " trong danh sách nhân vật");
        }
        
        const pathSave = __dirname + "/cache/avatarAnime.jpg";
        
        let endpoint = `https://goatbot.tk/taoanhdep/avataranime`;
        const params = {
          id: idNhanVat,
          chu_Nen,
          chu_Ky,
          apikey: "ntkhangUabavCaipNlapavdh"
        };
        if (colorBg) params.colorBg = colorBg;
        
        const response = await axios.get(endpoint, {
         params,
         responseType: "arraybuffer"
        });
        fs.writeFileSync(pathSave, Buffer.from(response.data));
        message.reply({
          body: `✅ Avatar của bạn\nNhân vật: ${tenNhanvat}\nMã số: ${idNhanVat}\nChữ nền: ${chu_Nen}\nChữ ký: ${chu_Ky}\nMàu: ${colorBg || "mặc định"}`, 
          attachment: fs.createReadStream(pathSave)
        }, () => fs.unlinkSync(pathSave));
  		}
  		catch(error) {
  		  const err = error.response ? JSON.parse(error.response.data.toString()) : error;
        return message.reply(`Đã xảy ra lỗi ${err.name}: ${err.message}`);
		  }
	  }
  }
};