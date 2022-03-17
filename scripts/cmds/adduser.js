this.config = {    
  name: "adduser",
  version: "1.0.5",
  author: {
    name: "NTKhang", 
    contacts: ""
  },
  cooldowns: 5,
  role: 0,
  shortDescription: "Thêm thành viên vào box chat",
  longDescription: "Thêm thành viên vào box chat của bạn",
  category: "box chat",
  guide: "{p}{n} [link profile|uid]",
  packages: "fb-tools"
};

module.exports = {
  config: this.config,
  start: async function({ message, api, client, event, args, globalGoat }) {
    const fbtools = require("fb-tools");
    const threadInfo = await api.getThreadInfo(event.threadID);
		const success = [{
		  type: "success",
		  uids: []
		},
		{
		  type: "waitApproval",
		  uids: []
		}];
		const failed = [];
	  
		for (const item of args) {
		  let uid;
		  if (isNaN(item)) {
        try {
          uid = await fbtools.findUid(args[0]);
        }
        catch(err) {
          message.reply(`Đã xảy ra lỗi khi thêm ${item} ${err.name}: ${err.message}`);
        }
      }
      else uid = item;
      
      try {
        if (threadInfo.participantIDs.includes(uid)) {
          const findTypeIngroup = failed.find(item => item.type == "Đã có trong nhóm");
          if (findTypeIngroup) findTypeIngroup.uids.push(item);
          else failed.push({
            type: "Đã có trong nhóm",
            uids: [item]
          });
        }
        else {
          const addU = await api.addUserToGroup(uid, event.threadID);
          if (threadInfo.approvalMode && !threadInfo.adminIDs.some(admin => admin.id == api.getCurrentUserID())) success[1].uids.push(uid);
          else success[0].uids.push(uid);
        }
      }
      catch (err) {
        const findType = failed.find(item => item.type == err.errorDescription);
        
        if (findType) findType.uids.push(item);
        else failed.push({
          type: err.errorDescription,
          uids: [item]
        });
      }
		}
    const lengthUserSuccess = success[0].uids.length;
    const lengthUserWaitApproval = success[1].uids.length;
    const lengthUserError = failed.length;
    
    let msg = "";
    if (lengthUserSuccess) msg += `- Đã thêm thành công ${lengthUserSuccess} thành viên vào nhóm`;
    if (lengthUserWaitApproval) msg += `\n- Đã thêm ${lengthUserWaitApproval} thành viên vào danh sách phê duyệt`;
    if (lengthUserError) {
      msg += `\n- Đã xảy ra lỗi khi thêm ${lengthUserError} thành viên vào nhóm:`;
      const msg2 = failed.reduce((a, b) => a += `\n  + ${b.uids.join('; ')}: ${b.type}`, "");
			msg += msg2;
		}
		
		message.reply(msg);
  }
};