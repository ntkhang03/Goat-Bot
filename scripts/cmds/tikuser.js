this.config = {    
  name: "tikuser",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "info user tiktok",
  longDescription: "xem thông tin người dùng tiktok",
  category: "other",
  guide: "{p}{n} username"
};

module.exports = {
  config: this.config,
  start: async function({ args, message, event }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    if (!args[0]) return message.SyntaxError();
    let data;
    try {
      data = ((await axios.get("https://www.tiktok.com/node/share/user/@" + args[0], {
        headers: {
          "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like) Version/12.0 eWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1"
        }
      }))).data;
    }
    catch(e) {
      return message.reply("Đã xảy ra lỗi vui lòng thử lại sau");
    }
    if (data.statusCode == 10202 || Object.keys(data.userInfo).length == 0) return message.reply(`Người dùng tiktok mang id ${args[0]} không tồn tại`);
    const { nickname, verified, uniqueId, avatarLarger, signature, privateAccount, bioLink } = data.userInfo.user;
    const { followerCount, followingCount, heart, diggCount, videoCount } = data.userInfo.stats;
    const pathSaveAvatar = __dirname + `/cache/avatarTikTok${nickname}.png`;
    
    const getAvt = (await axios.get(avatarLarger, {
      responseType: "arraybuffer"
    })).data;
    fs.writeFileSync(pathSaveAvatar, Buffer.from(getAvt));
    
    message.reply({
      body: `===「USER TIKTOK」===`
        + `\n🤓 Tên: ${nickname}`
        + `\n🔖 ID: ${uniqueId}`
        + `\n🐥 Link: https://tiktok.com/@${uniqueId}`
        + `\n${privateAccount ? "🔒 Tài khoản riêng tư: có" : "🔓 Tài khoản riêng tư: không"}`
        + `\n👀 Người theo dõi: ${followerCount}`
        + `\n♻️ Đang theo dõi: ${followingCount}`
        + `\n💗 Lượt tim: ${heart}`
        + `\n💞 Đã thả tim: ${diggCount} video`
        + `\n📤 Video đã đăng: ${videoCount}`
        + `\n📝 Tiểu sử: ${signature}`
        + `\n📎 Bio link: ${bioLink ? bioLink.link : "Không có"}`
        + `\n✅ Tích xanh: ${verified ? "có" : "không"}`,
      attachment: fs.createReadStream(pathSaveAvatar)
    }, (e, info) => fs.unlinkSync(pathSaveAvatar));
  }
};