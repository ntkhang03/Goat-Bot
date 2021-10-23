module.exports = ({ api, handlerEvents, handlerCreateDB }) => {
  return async ( event ) => {
    const message = require("./createFuncMessage.js")(event, api);
	  const handlerChat = await handlerEvents({ event, message });
	  await handlerCreateDB({ event });
		switch (event.type) {
			case "message":
			case "message_reply":
			case "message_unsend":
				await handlerChat.whenChat();
				await handlerChat.whenStart();
				await handlerChat.whenReply();
				break;
		  case "event":
				await handlerChat.handlerEvent();
				break;
		  case "message_reaction":
				await handlerChat.whenReaction();
				break;
			case "typ":
			  await handlerChat.typ();
			  break;
			case "presence":
			  await handlerChat.presence();
			  break;
			case "read_receipt":
			  await handlerChat.read_receipt();
			  break;
			default:
				break;
		}
	};
};