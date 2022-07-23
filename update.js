(async function () {
	const fs = require("fs-extra");
	const axios = require("axios");
	const print = require("./logger/print.js");
	const chalk = require("chalk");
	const allVersion = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/versions.json")).data;
	const localVersion = require("./package.json").version;
	if (allVersion[allVersion.length - 1].version == localVersion) return print("Bạn đang sử dụng phiên bản mới nhất rồi", "LATEST VERSION");

	fs.writeFileSync(__dirname + "/versions.json", JSON.stringify(allVersion, null, 2));

	const indexCurrentVersion = allVersion.findIndex(item => item.version == localVersion);
	const versionsUpdate = allVersion.slice(indexCurrentVersion + 1);

	for (const data of versionsUpdate) {
		if (data.del) {
			for (const path of data.del)
				try {
					fs.unlinkSync(path);
				}
				catch (e) {
				}
		}
		const { info, version } = data;
		print.green(version, "VERSION");

		for (const location in info) {
			let response = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/" + location, {
				responseType: "arraybuffer"
			})).data.toString();
			let description = data.info[location];
			if (location == "config.json" && description.keysNeddUpdate) {
				const getNewConfig = JSON.parse(response);
				const oldConfig = require("./config.json");
				description = description.description;
				const keysNeddUpdate = description.keysNeddUpdate;
				for (const key of keysNeddUpdate) oldConfig[key] = getNewConfig[key];
				response = JSON.stringify(oldConfig, null, 2);
			}
			fs.writeFileSync(__dirname + "/" + location, response);
			print.green(`Update file ${chalk.hex("#ff5208")(location)} success, description: ${chalk.hex("#d6d6d6")(description || "No description")}`, "UPDATE");
		}
	}

	const packageJson = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/package.json")).data;
	fs.writeFileSync(__dirname + "/package.json", JSON.stringify(packageJson, null, 2));
})();