this.config = {    
  name: "ytb",
  version: "1.0.0",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "YouTube",
  longDescription: "Tải video, audio hoặc xem thông tin video trên YouTube",
  category: "media",
  guide: "{p}{n} [video|-v] [tên video|link video]: dùng để tải video từ youtube."
       + "\nVí dụ: {p}{n} -v em gái mưa"
       + "\n"
       + "\n{p}{n} [audio|-a] [tên video|link video]: dùng để tải audio từ youtube"
       + "\nVí dụ: {p}{n} -a em gái mưa"
       + "\n"
       + "\n{p}{n} [info|-i] [tên video|link video]: dùng để xem thông tin video từ youtube"
       + "\nVí dụ: {p}{n} info em gái mưa",
  packages: "ytdl-core",
  envGlobal: {
    youtube: "AIzaSyCohP2dK0zFYjZ2OloWFEvWa4z6JGBifC"
  }
};

module.exports = {
  config: this.config,
  start: async function({ api, globalGoat, args, download, message, client, event, threadsData }) {
    const axios = require("axios");
    const ytdl = require("ytdl-core");
    const { createReadStream, unlinkSync } = require("fs-extra");
    const API_KEY = globalGoat.configCommands.envGlobal.youtube;
    let type;
    if (["video", "-v"].includes(args[0])) type = "video";
    else if (["audio", "-a", "sing", "-s"].includes(args[0])) type = "audio";
    else if (["info", "-i"].includes(args[0])) type = "info";
    else return message.SyntaxError();
    
    const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const urlYtb = checkurl.test(args[1]);
    
    if (urlYtb) {
      const infoVideo = await ytdl.getInfo(args[1]);
      const idvideo = infoVideo.videoDetails.videoId;
      await handle({ type, infoVideo, idvideo, message, api, event, download });
      return;
    }
    
    const search = args.slice(1).join(" ");
    const maxResults = 6;
    const url = encodeURI(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&part=snippet&q=${search}&maxResults=${maxResults}&type=video`);
    let result = (await axios.get(url)).data;
    if (result.error) {
      return message.reply(result.error.message);
    }
    result = result.items;
    if (result.length == 0) return message.reply("Không có kết quả tìm kiếm nào phù hợp với từ khóa "+search);
    let msg = "";
    let i = 1;
    const thumbnails = [];
    const arrayID = [];
    
    for (let info of result) {
      const idvideo = info.id.videoId;
      const getInfoVideo = await ytdl.getInfo(idvideo);
      const listthumbnails = getInfoVideo.videoDetails.thumbnails;
      const timeM = Math.floor(getInfoVideo.videoDetails.lengthSeconds/60);
      const timeS = Math.floor(getInfoVideo.videoDetails.lengthSeconds%60);
      msg += `${i++}. ${info.snippet.title}\nTime: ${timeM}p${timeS}s\n\n`;
      const linkthumbnails = listthumbnails[listthumbnails.length-1].url;
      arrayID.push(idvideo);
      const pathThumnail = __dirname + `/cache/${idvideo}.png`;
      await download(linkthumbnails, pathThumnail);
      const ReadStreamImage = createReadStream(pathThumnail);
      thumbnails.push(ReadStreamImage);
    }
    
    message.reply({
      body: msg + "Reply tin nhắn với số để chọn or any press to cancel", 
      attachment: thumbnails
    }, (err, info) => {
      globalGoat.whenReply[info.messageID] = {
        messageID: info.messageID,
        author: event.senderID,
        nameCmd: require(__filename).config.name,
        arrayID,
        result,
        type
      };
    });
    
    setTimeout(function() {
      for (let idfile of arrayID) unlinkSync(__dirname + `/cache/${idfile}.png`);
    }, 2000);
    
  },
  
  whenReply: async ({ event, api, Reply, download, globalGoat, message }) => {
    const axios = require("axios");
    const ytdl = require("ytdl-core");
    const { createReadStream, createWriteStream, unlinkSync, statSync } = require("fs-extra");
    const { author, arrayID, result, type } = Reply;
    const choice = event.body;
    if (!isNaN(choice) && choice <= 6) {
      const infochoice = result[choice-1];
      const idvideo = infochoice.id.videoId;
      const infoVideo = await ytdl.getInfo(idvideo);
      api.unsendMessage(Reply.messageID);
      await handle({ type, infoVideo, idvideo, message, api, event, download });
    }
    else api.unsendMessage(Reply.messageID);
  }
};

 async function handle({ type, infoVideo, idvideo, api, event, download, message }) {
   const { createReadStream, createWriteStream, unlinkSync, statSync } = require("fs-extra");
   const ytdl = require("ytdl-core");
   if (type == "video") {
     const idvideo = infoVideo.videoDetails.videoId;
     const path_video = __dirname + `/cache/${idvideo}.mp4`;
     if (infoVideo.formats[0].contentLength > 26214400) return api.sendMessage('Không thể gửi video này vì dung lượng lớn hơn 25MB.', event.threadID, event.messageID);
     message.reply("Đang tải xuống "+infoVideo.videoDetails.title);
     ytdl(idvideo)
      .pipe(createWriteStream(path_video))
      .on("close", () => {
        return message.reply({ 
          body: infoVideo.videoDetails.title, 
          attachment: createReadStream(path_video)
        }, () => unlinkSync(path_video));
      })
      .on("error", (error) => message.reply(`Đã xảy ra lỗi khi tải video\n${error.stack}`));
   }
   else if (type == "audio") {
     const audio = infoVideo.formats.find(item => item.mimeType.indexOf("audio/webm") != -1);
     if (audio.contentLength > 26214400) return api.sendMessage('Không thể gửi audio này vì dung lượng lớn hơn 25MB.', event.threadID, event.messageID);
     const linkaudio = audio.url;
     const path_audio = `${__dirname}/cache/${idvideo}.mp3`;
     await download(linkaudio, path_audio);
     return api.sendMessage({ body: infoVideo.videoDetails.title, attachment: createReadStream(path_audio)}, event.threadID, () => unlinkSync(path_audio), event.messageID);
   }
   else if (type == "info") {
     const info = infoVideo.videoDetails;
     const { title, lengthSeconds, viewCount, videoId, uploadDate, likes, dislikes } = infoVideo.videoDetails;
     
     let msg = "";
     const hours   = Math.floor(lengthSeconds/3600);
     const minutes = Math.floor(lengthSeconds%3600/60);
     const seconds = Math.floor(lengthSeconds%3600%60);
     msg += "💠Tiêu đề: "+title+"\n";
     msg += "🏪Channel: "+info.author.name+"\n";
     if (info.author.subscriber_count) msg += "👨‍👩‍👧‍👦Subscriber: "+info.author.subscriber_count+"\n";
     msg += `⏱Thời gian video: ${hours}:${minutes}:${seconds}\n`;
     msg += "👀Lượt xem: "+viewCount+"\n";
     msg += "👍Lượt thích: "+likes+"\n";
     msg += "👎Không thích: "+dislikes+"\n";
     msg += "🆙Ngày tải lên: "+uploadDate+"\n";
     msg += "#️⃣ID: "+videoId+"\n";
     const paththumnailsChanel = __dirname+"/cache/thumbnailsChanel.jpg";
     const paththumnailsVideo = __dirname+"/"+info.videoId+".jpg";
     await download(info.author.thumbnails[info.author.thumbnails.length-1].url, paththumnailsChanel);
     await download(info.thumbnails[info.thumbnails.length-1].url, paththumnailsVideo);
     const arrayThumnails = [];
     arrayThumnails.push(createReadStream(paththumnailsChanel));
     arrayThumnails.push(createReadStream(paththumnailsVideo));
     message.reply({
       body: msg,
       attachment: arrayThumnails
     }, () => {
       unlinkSync(paththumnailsChanel);
       unlinkSync(paththumnailsVideo);
     });
   }
}