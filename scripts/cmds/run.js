this.config = {    
  name: "run",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "Test code nhanh",
  longDescription: "Test code nhanh",
  category: "owner",
  guide: "{prefix}run <đoạn code cần test>"
};

module.exports = {
  config: this.config,
  start: async function({ api, globalGoat, args, download, message, client, event, threadsData, usersData, usersModel, threadsModel, configCommands }) {
  	try {
  		eval("(async () => {"+args.join(" ")+"})();");
  	}
  	catch (e) {
  		message.send(`Đã có lỗi xảy ra: ${e.message}`);
  	}
  }
};