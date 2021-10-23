this.config = {    
  name: "cmt",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 2,
  shortDescription: "x",
  longDescription: "x",
  category: "owner"
};

module.exports = {
  config: this.config,
  start: async ({ message, args }) => {
    var t = "——————————————————————————————————————————————————";
    var a = t.length;
    var b = args.join(" ").trim();
    var c = a - (b.length) - 3;
    var result = t.slice(0, c/2)+" "+b.toUpperCase()+" "+t.slice(0, c/2);
    message.send("// " + result + " //");
  }
}