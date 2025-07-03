const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.8",
    author: "Dan Jersey",
    countDown: 5,
    role: 2,
    description: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all box"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage: "❌ Please enter the message you want to send to all groups",
      notification: "🕳 Vous avez une notification de mon Admin. Utilisez la commande callad pour le contacter.",
      sendingNotification: "⏳ Sending notification to %1 groups...",
      sentNotification: "✅ Notification sent to %1 groups successfully",
      errorSendingNotification: "❌ Error sending to %1 groups:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang }) {
    const { delayPerGroup } = envCommands[commandName];
    if (!args[0])
      return message.reply(getLang("missingMessage"));

    const userMessage = args.join(" ");

    const formSend = {
      body: `
╭━━━━━━━━━━━━━━━━━━
┃ ⚠️ 𝐊𝐘𝐎𝐓𝐀𝐊𝐀 - 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍
┃━━━━━━━━━━━━━━━━━━
┃ ${getLang("notification")}
┃──────────────────
┃ ${userMessage}
╰━━━━━━━━━━━━━━━━━━
      `.trim(),
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);
    message.reply(getLang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;
      try {
        waitingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (e) {
        sendError.push(tid);
      }
    }

    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      } catch (e) {
        const { errorDescription } = e;
        const existingError = sendError.find(item => item.errorDescription == errorDescription);
        if (existingError) {
          existingError.threadIDs.push(sended.threadID);
        } else {
          sendError.push({
            threadIDs: [sended.threadID],
            errorDescription
          });
        }
      }
    }

    let msg = "";
    if (sendSuccess > 0)
      msg += getLang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0)
      msg += getLang(
        "errorSendingNotification",
        sendError.reduce((a, b) => a + b.threadIDs.length, 0),
        sendError.map(b => `\n - ${b.errorDescription}\n   + ${b.threadIDs.join("\n   + ")}`).join("")
      );

    message.reply(msg);
  }
};