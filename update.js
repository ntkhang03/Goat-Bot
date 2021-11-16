const fs = require("fs-extra");
const axios = require("axios");
const print = require("./logger/print.js");
const loading = require("./logger/loading.js");
const chalk = require("chalk");

(async function() {
  const allVersion = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/versions.json")).data;
  const localVersion = require("./package.json").version;
  if (allVersion[allVersion.length - 1].version == localVersion) return print("Bạn đang sử dụng phiên bản mới nhất", "LATEST VERSION");
  
  fs.writeFileSync(__dirname + "/versions.json", JSON.stringify(allVersion, null, 2));
  
  const indexCurrentVersion = allVersion.findIndex(item => item.version == localVersion);
  const versionsUpdate = allVersion.slice(indexCurrentVersion + 1);
  
  for (let data of versionsUpdate) {
    if (data.del) {
      for (let path of data.del) {
        fs.unlinkSync(path);
      }
    }
    
    for (let location in data.info) {
      loading.green(`[v${data.version}] file ${chalk.hex("#ff5208")(location)}`, "UPDATING");
      const response = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/" + location, {
        responseType: "arraybuffer"
      })).data.toString();
      fs.writeFileSync(__dirname + "/" + location, response);
      loading.green(`Đã cập nhật xong file ${chalk.hex("#ff5208")(location)}, tính năng: ${chalk.hex("#d6d6d6")(data.info[location])}\n`, "UPDATE");
    }
  }
  
  const packageJson = (await axios.get("https://github.com/ntkhang03/Goat-Bot/raw/main/package.json")).data;
  fs.writeFileSync(__dirname + "/package.json", JSON.stringify(packageJson, null, 2));
})();