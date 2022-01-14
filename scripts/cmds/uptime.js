this.config = {    
  name: "uptime",
  version: "1.0.1",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "xem thời gian bot đã online",
  longDescription: "xem thời gian bot đã online",
  category: "info",
  guide: "{p}{n}"
};

module.exports = {
  config: this.config,
  start: async function({ message }) {
    const timeRun = process.uptime();
		const hours   = Math.floor(timeRun / 3600);
		const minutes = Math.floor((timeRun % 3600) / 60);
		const seconds = Math.floor(timeRun % 60);
    message.reply(`Bot đã hoạt động được ${hours ? hours + "h" : ""}${minutes ? minutes + "p" : ""}${seconds}s\n[ 🐐 | Project Goat Bot ]`);
  }
};