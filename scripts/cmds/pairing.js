this.config = {
	name: "pairing",
	version: "1.0.0",
	author: {
		name: "NTKhang",
		contacts: ""
	},
	cooldowns: 5,
	role: 0,
	shortDescription: "Ghép đôi random với một người",
	longDescription: "Ghép đôi random với một người trong box chat",
	category: "image",
	guide: "{p}{n}",
	packages: ["jimp"],
	envGlobal: {
		tokenFacebook: "2712477385668128%7Cb429aeb53369951d411e1cae8e810640"
	},
};

module.exports = {
	config: this.config,
	start: async function ({ api, args, threadsData, message, client, event, globalGoat, download }) {
		const axios = require("axios");
		const fs = require("fs-extra");
		const Canvas = require("canvas");
		const jimp = require("jimp");

		async function circleImage(buffer) {
			const imageBuffer = await jimp.read(buffer);
			imageBuffer.circle();
			return await imageBuffer.getBufferAsync("image/png");
		}

		const { tokenFacebook } = globalGoat.configCommands.envGlobal;
		const { threadID, senderID, messageID } = event;
		const threadData = await threadsData.getData(threadID);
		const { members } = threadData;
		const listUid = Object.keys(members);
		const random = listUid[Math.floor(Math.random() * listUid.length)];

		const frame = await Canvas.loadImage("https://i.pinimg.com/736x/15/fa/9d/15fa9d71cdd07486bb6f728dae2fb264.jpg");
		const avatarAuthor = await Canvas.loadImage(await circleImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=${tokenFacebook}`));
		const avatarRandom = await Canvas.loadImage(await circleImage(`https://graph.facebook.com/${random}/picture?width=512&height=512&access_token=${tokenFacebook}`));

		const canvas = Canvas.createCanvas(frame.width, frame.height);
		const ctx = canvas.getContext("2d");

		const infoFrame = [
			{
				gender: "MALE",
				x: 355,
				y: 120,
				size: 80
			},
			{
				gender: "FEMALE",
				x: 250,
				y: 155,
				size: 75
			}
		];
		const drawAuthor = infoFrame.find(item => item.gender == members[senderID].gender);
		const drawRandom = infoFrame.find(item => item.gender != members[senderID].gender);

		ctx.drawImage(frame, 0, 0, frame.width, frame.height);
		ctx.drawImage(avatarAuthor, drawAuthor.x, drawAuthor.y, drawAuthor.size, drawAuthor.size);
		ctx.drawImage(avatarRandom, drawRandom.x, drawRandom.y, drawRandom.size, drawRandom.size);

		const pathSave = __dirname + "/cache/pairing.png";
		fs.writeFileSync(pathSave, canvas.toBuffer());

		return message.reply({
			body: `Chúc mừng bạn đã được ghép đôi với ${members[random].name}`,
			attachment: fs.createReadStream(pathSave)
		}, () => {
			fs.unlinkSync(pathSave);
		});

	}
};