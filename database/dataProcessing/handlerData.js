const fs = require("fs-extra");
const axios = require("axios");
const mongoose = require("mongoose");

module.exports = async function({ globalGoat, client, api }) {
  const { print, config, loading } = globalGoat;
  const databaseType = config.database.type;
  const dataModels = require("./models/dataModels.js");
  
  if (databaseType == "mongodb" && config.database.uriMongodb) {
    const P = "\\|/-";
    let ij = 0;
    
    const loadmongo = setInterval(() => {
      loading(P[ij++] + " Đang kết nối CSDL mongodb", "MONGODB");
      ij %= P.length; 
    }, 120);
    
    const uriConnect = config.database.uriMongodb;
    await mongoose.connect(uriConnect, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(result => {
      loading.master("Kết nối cơ sở dữ liệu Mongodb thành công\n", "MONGODB");
      clearInterval(loadmongo);
      })
    .catch(err => {
      loading.err("Kết nối cơ sở dữ liệu Mongodb thất bại với lỗi: "+err.stack+"\n", "MONGODB");
      clearInterval(loadmongo);
    });
    
    if ((await dataModels.find({ type: "thread" })).length == 0) await dataModels.create({ 
      type: "thread",
      data: {}
    });
    
    if ((await dataModels.find({ type: "user" })).length == 0) await dataModels.create({ 
      type: "user", 
      data: {}
    });
  }
  /*
        ▀▀█▀▀ █░░█ █▀▀█ █▀▀ █▀▀█ █▀▀▄ █▀▀
        ░░█░░ █▀▀█ █▄▄▀ █▀▀ █▄▄█ █░░█ ▀▀█
        ░░▀░░ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀
  */
  async function threadsData () {
    let Threads = {};
    if (databaseType == "mongodb") {
      Threads = (await dataModels.find({ type: "thread"}))[0].data || {};
    }
    else {
      if (!fs.existsSync(__dirname + "/../threadsData.json")) fs.writeFileSync(__dirname + "/../threadsData.json", "{}");
      Threads = require("../threadsData.json");
    }
	  
    client.allThreadData = Threads;
    
  	async function saveData(Tid) {
  	  Tid != "delete" ? Threads[Tid].lastUpdate = Date.now() : "";
  	  client.allThreadData = Threads;
  	  if (databaseType == "local") {
	      fs.writeFileSync(__dirname + "/../threadsData.json", JSON.stringify(Threads, null, 2));
  	  }
  	  else if (databaseType == "mongodb") {
	      await dataModels.updateOne({
	        type: "thread"
	      }, {
	        data: Threads
	      })
	      .catch(err => print.err("Đã xảy ra lỗi khi cập nhật dữ liệu của nhóm mang id " + Tid  + "\n" + err, "MONGODB"));
  	  }
  	  else throw new Error("Database Type không hợp lệ");
  	}

  	async function createData(threadID, callback) {
  	  try {
  	    if (Threads[threadID]) throw new Error(`Nhóm mang id ${threadID} đã tồn tại trong database`);
    	  const threadInfo = await api.getThreadInfo(threadID);
    	  const name = threadInfo.threadName;
    	  const { userInfo } = threadInfo;
  			const newadminsIDs = [];
  			const newMembers = {};
  			threadInfo.adminIDs.forEach(item => newadminsIDs.push(item.id));
  			
  			for (let user of userInfo) {
  			  const userID = user.id;
  			  const dataUser = {
  			    id: userID,
  			    name: user.name,
  			    gender: user.gender,
  			    nickname: threadInfo.nicknames[userID] || null,
  			    inGroup: true,
  			    count: 0
  			  };
  			  newMembers[userID] = dataUser;
  			}
  
    	  const data = {
    	    id: threadID,
    	    name: name,
    	    emoji: threadInfo.emoji,
    	    prefix: null,
    	    adminIDs: newadminsIDs,
    	    avatarbox: threadInfo.imageSrc,
    	    approvalMode: threadInfo.approvalMode,
    	    banned: {
  	        status: false,
  	        reason: null
    	    },
    	    data: {
    	      createDate: Date.now()
    	    },
    	    members: newMembers
    	  };
    	  Threads[threadID] = data;
    	  await saveData(threadID);
    	  if (callback && typeof callback == "function") callback(null, Threads[threadID]);
    	  return Threads[threadID];
  	  }
  	  catch(err) {
  	    print.err(err.stack, "CREATE THREAD DATA");
  	    if (callback && typeof callback == "function") callback(err, null);
  	    return err;
  	  }
  	}
  	
  	async function refreshInfo(threadID, callback) {
  	  try {
    	  if (!Threads[threadID]) throw new Error(`Nhóm mang id ${threadID} không tồn tại trong database`);
    	  const ThreadInfo = await getData(threadID);
    	  const newThreadInfo = await api.getThreadInfo(threadID);
    	  
    	  const {
    	    userInfo,
    	    adminIDs
        } = newThreadInfo;
        
    	  const oldMembers = ThreadInfo.members;
    		const newMembers = {};
    		for (const user of userInfo) {
    		  const userID = user.id;
    		  const oldDataUser = oldMembers[userID];
    		  const data = {
    		    name: user.name,
    		    gender: user.gender,
    			  nickname: newThreadInfo.nicknames[userID],
      		  count: oldMembers[userID] ? oldMembers[userID].count : 0
    		  };
    		  newMembers[userID] = { 
    		    ...oldDataUser,
    		    ...data
          };
    		}
    		
    		const newadminsIDs = adminIDs.map(item => item.id);
  			const ThreadInfoNew = {
  			  name: newThreadInfo.name,
    			emoji: newThreadInfo.emoji,
    			adminIDs: newadminsIDs,
      		avatarbox: newThreadInfo.imageSrc,
      		members: {
      		  ...oldMembers,
      		  ...newMembers
      		}
  			};
  			
    		Threads[threadID] = {
    		  ...ThreadInfo,
    		  ...ThreadInfoNew
        };
    		
    		await saveData(threadID);
    		if (callback && typeof callback == "function") callback(null, Threads[threadID]);
    	  return Threads[threadID];
  	  }
  	  catch (err) {
  	    if (callback && typeof callback == "function") callback(err, null);
    	  return err;
  	  }
  	}
  	
  	async function getAll(keys, callback) {
  	  try {
    	  if (!keys) return Object.values(Threads);
    	  if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
    	  const data = [];
      	for (const threadID in Threads) {
      	  const db = {
      	    id: threadID
          };
      	  const dataT = Threads[threadID];
      	  for (const key of keys) db[key] = dataT[key];
      	  data.push(db);
      	}
      	if (callback && typeof callback == "function") callback(null, data);
      	return data;
  	  } catch (err) {
  	    print.err(err.stack, "GETALL DATA THREAD");
  	    if (callback && typeof callback == "function") callback(err, null);
  	    return err;
  	  }
  	 };
  	
  	async function getData(threadID, callback) {
  		try {
  			const data = Threads[threadID];
  			if (callback && typeof callback == "function") callback(null, data);
  			return data;
  		}
  		catch(err) {
  			print.err(err.stack, "GET THREAD DATA");
  			if (callback && typeof callback == "function") callback(err, null);
  			return err;
  		}
  	};
  	
  	async function setData(threadID, options, callback) {
  	  try {
  	    if (!threadID) throw new Error("threadID không được để trống");
  	    if (isNaN(threadID)) throw new Error("threadID không hợp lệ");
    		if (typeof options != 'object') throw new Error("Tham số options truyền vào phải là 1 object");
    		Threads[threadID] = {
    		  ...Threads[threadID],
    		  ...options
        };
    		await saveData(threadID);
    		if (callback && typeof callback == "function") callback(null, Threads[threadID]);
  			return Threads[threadID];
  	  }
  	  catch(err) {
  	    print.err(err.stack, "SET THREAD DATA");
  	    if (callback && typeof callback == "function") callback(err, null);
  			return err;
  	  };
  	};
  	
  	async function delData(threadID, callback) {
  		try {
  			delete Threads[threadID];
  			await saveData("delete");
  			if (callback && typeof callback == "function") callback(null, "DELDATA THREAD "+threadID+" SUCCES");
  			return true;
  		} catch(err) {
  		  print.err(err.stack, "DEL THREAD DATA");
  		  if (callback && typeof callback == "function") callback(err, null);
  			return err;
  		}
  	};
    	
  	return {
  		createData,
  		refreshInfo,
  		getAll,
  		getData,
  		setData,
  		delData
  	};
  };
  
  
  /*
   *█░░█ █▀▀ █▀▀ █▀▀█ █▀▀ █▀▀▄ █▀▀█ ▀▀█▀▀ █▀▀█
    █░░█ ▀▀█ █▀▀ █▄▄▀ ▀▀█ █░░█ █▄▄█ ░░█░░ █▄▄█
    ░▀▀▀ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀ ▀▀▀░ ▀░░▀ ░░▀░░ ▀░░▀
   *
   */

  async function usersData() {
    let Users = {}; 
    
  	if (databaseType == 'mongodb') {
  	  Users = (await dataModels.find({ type: 'user' }))[0].data || {};
  	}
  	else {
  	  if (!fs.existsSync(__dirname + "/../usersData.json")) fs.writeFileSync(__dirname + "/../usersData.json", "{}");
  	  Users = require("../usersData.json");
  	}
    client.allUserData = Users;
  	
    async function saveData(Uid) {
      Uid != "delete" ? Users[Uid].lastUpdate = Date.now() : "";
      client.allUserData = Users;
  	  if (databaseType == 'local') {
  	    fs.writeFileSync(__dirname + "/../usersData.json", JSON.stringify(Users, null, 2));
  	  }
    	else if (databaseType == 'mongodb') {
    	  await dataModels.updateOne({ type: "user" }, {
    	    data: Users
    	  })
    	  .catch(err => print.err("Đã xảy ra lỗi khi cập nhật dữ liệu của người dùng mang id " + Uid  + "\n" + err, "MONGODB"));
    	}
    	else throw new Error("Database Type không hợp lệ");
    }
    	
  	async function createData(userID, callback) {
  		try {
  		  if (Users[userID]) throw new Error(`Người dùng mang id ${userID} đã tồn tại trong database`);
  		  const infoUser = (await api.getUserInfo(userID))[userID];
  		  const data = {
  		    id: userID,
  		    name: infoUser.name,
  		    vanity: infoUser.vanity,
  		    gender: infoUser.gender,
  		    isFriend: infoUser.isFriend,
  		    money: 0,
  		    exp: 0,
  		    banned: {
            status: false,
            reason: null
  		    },
  		    data: {
  		      createDate: Date.now()
  		    }
  		  };
  		  
  		  Users[userID] = data;
  		  
  			await saveData(userID);
  			if (callback && typeof callback == "function") callback(null, data);
  			return data;
  		}
  		catch (err) {
  		  if (callback && typeof callback == "function") callback(err, null);
  		  print.err(err.stack, "CREATEDATA USER");
  		  return err;
  		}
  	};
  	
  	async function refreshInfo(userID, callback) {
  		try {
  		  if (!Users[userID]) throw new Error(`Người dùng mang id ${userID} không tồn tại trong database`);
  		  const InfoUser = await getData(userID);
  		  const updateInfoUser = (await api.getUserInfo(userID))[userID];
  		  const newData = {
  		    name: updateInfoUser.name,
  		    vanity: updateInfoUser.vanity,
  	      gender: updateInfoUser.gender,
  	      isFriend: updateInfoUser.isFriend
  		  }
  	    
  		  Users[userID] = {
  		    ...InfoUser,
  		    ...newData
        };
  		  
  			await saveData(userID);
  			if (callback && typeof callback == "function") callback(null, InfoUser);
  			return InfoUser;
  		}
  		catch (err) {
  		  if (callback && typeof callback == "function") callback(err, null);
  		  print.err(err.stack, "CREATEDATA USER");
  		  return err;
  		}
  	};
  	
  	async function getAll(keys, callback) {
  	  try {
    	  if (!keys) return Object.values(Users);
    	  if (!Array.isArray(keys)) throw new Error("Tham số truyền vào phải là 1 array");
    	  const data = [];
        for (let userID in Users) {
          const db = {id: userID};
          const dataU = Users[userID];
          for (let key of keys) db[key] = dataU[key];
          data.push(db);
      	};
        if (callback && typeof callback == "function") callback(null, data);
        return data;
  	  } catch (err) {
  	    if (callback && typeof callback == "function") callback(err, null);
  	    print.err(err, "GETALL USER");
  	    return err;
  	  }
  	};
  	
  	async function getData(userID, callback) {
  		try {
  			if (!Users[userID]) await createData(userID);
  			const data = Users[userID];
  			if (callback && typeof callback == "function") callback(null, data);
  			return data;
  		}
  		catch(err) {
  			print.err(err.stack, "GETDATA USER");
  			if (callback && typeof callback == "function") callback(err, null);
  			return err;
  		}
  	};
  	
  	async function setData(userID, options, callback) {
  		try {
  		  if (isNaN(userID)) throw new Error("userID không được để trống");
  		  if (isNaN(userID)) throw new Error("userID không hợp lệ");
    		if (typeof options != 'object') throw new Error("Options truyền vào phải là 1 object");
    		var keys = Object.keys(options);
  		  if (!Users[userID]) throw new Error(`Người dùng mang id ${userID} không tồn tại trong database`);
    		for (let key of keys) Users[userID][key] = options[key];
    		await saveData(userID);
    		if (callback && typeof callback == "function") callback(null, userID[userID]);
    		return userID[userID];
  		}
  		catch(err) {
  		  print.err(err.stack, "SETDATA USER");
  		  if (callback && typeof callback == "function") callback(err, null);
  		  return err;
  		}
  	};
  	
  	async function delData(userID, callback) {
  		try {
  			delete Users[userID];
  			const data = await saveData('delete');
  			if (callback && typeof callback == "function") callback(null, data);
  		} catch (err) {
  			print.err(err.stack, "DELDATA USER");
  			if (callback && typeof callback == "function") callback(err, null);
  			return err;
  		}
  	};
  	
  	return {
  		createData,
  		refreshInfo,
  		getAll,
  		getData,
  		setData,
  		delData
  	};
  };
  
  return {
    threadsData,
    usersData
  }
}