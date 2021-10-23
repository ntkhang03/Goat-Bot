this.config = {    
  name: "sdtfb",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Tra cứu sđt facebook",
  longDescription: "Tra cứu số điện thoại facebook",
  category: "info",
  guide: "{p}{n} [link profile|uid|@tag]",
  packages: "fb-tools"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, client, event, args }) {
    const axios = require("axios");
    let profileUrl;
    const checkUrlRegex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
    
    if (!isNaN(args[0])) profileUrl = "https://www.facebook.com/"+args[0];
    else if (args[0].match(checkUrlRegex)) profileUrl = args[0];
    else if (Object.keys(event.mentions).length != 0) profileUrl = Object.keys(event.mentions)[0];
    else return message.reply("Vui lòng nhập link profile facebook hoặc uid");
    if (profileUrl.includes("ntkhang.9831") || profileUrl.includes("100010382497517")) return message.reply("Tìm sđt t làm gì??");
    const response = await axios.get("https://marketingtool.top/wp-admin/admin-ajax.php?action=ajax_convert_to_phone&link=" + encodeURIComponent(profileUrl) + "&security=d27499e528", {
      headers: {
        Cookie: "_ga=GA1.2.913189362.1634811226; _gid=GA1.2.1757138908.1634811226ID=b43cf1c6fc36fb94-223129c2c5cc004d:T=1634811227:RT=1634811227:S=AL; _gads=NI_MbwCD9QI6gBTexRODDONEullbrZ_A; wordpress_logged_in_badabb602034b799afaf6c1cfcd126bb=g_duythanh%7C1636042695%7CeoxA6maUrSmVRkoknwdTgUuCvGlzHRHdjzbgW7crKHb%7Ce97e150f976f65aa94a0f84f6d803a5ee58d8063240c55efcfd698d1568763f1"
      }
    });
    
    const result = response.data.replace(/<[^>]*>/g, "");
    message.reply(result);
    
  }
};