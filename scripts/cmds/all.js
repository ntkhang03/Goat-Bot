this.config = {    
  name: "all",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 1,
  shortDescription: "tag all",
  longDescription: "tag tất cả thành viên trong nhóm",
  category: "box chat",
  guide: "{prefix}{name} [để trống|nội dung]"
};

module.exports = {
  config: this.config,
  start: async function({ globalGoat, args, threadsData, message, event }) {
    const alluser = Object.keys((await threadsData.getData(event.threadID)).members);
    const lengthAllUser = alluser.length;
    const mentions = [];
    let body = args.join(" ") || "@all";
    let lengthbody = body.length;
    let i = 0;
    for (let uid of alluser) {
      let fromIndex = 0;
      if (lengthbody < lengthAllUser) {
        body += body[lengthbody-1];
        lengthbody++;
      }
      if (body.slice(0, i).lastIndexOf(body[i]) != -1) fromIndex = i;
      mentions.push({ tag: body[i], id: uid, fromIndex });
      i++;
    }
    message.reply({ body, mentions });
  }
};