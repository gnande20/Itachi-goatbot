const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "1.6",
    author: "Dan jersey",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "gửi tin nhắn về admin bot",
      en: "send message to admin bot"
    },
    longDescription: {
      vi: "gửi báo cáo, góp ý, báo lỗi,... của bạn về admin bot",
      en: "send report, feedback, bug,... to admin bot"
    },
    category: "contacts admin",
    guide: {
      vi: "   {pn} <tin nhắn>",
      en: "   {pn} <message>"
    }
  },

  langs: {
    vi: {
      missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",
      sendByGroup: "\n- Được gửi từ nhóm: %1\n- Thread ID: %2",
      sendByUser: "\n- Được gửi từ người dùng",
      content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
      success: "Đã gửi tin nhắn của bạn về %1 admin thành công!\n%2",
      failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về %1 admin\n%2\nKiểm tra console để biết thêm chi tiết",
      reply: "📍 Phản hồi từ admin %1:\n─────────────────\n%2\n─────────────────\nPhản hồi tin nhắn này để tiếp tục gửi tin nhắn về admin",
      replySuccess: "Đã gửi phản hồi của bạn về admin thành công!",
      feedback: "📝 Phản hồi từ người dùng %1:\n- User ID: %2%3\n\nNội dung:\n─────────────────\n%4\n─────────────────\nPhản hồi tin nhắn này để gửi tin nhắn về người dùng",
      replyUserSuccess: "Đã gửi phản hồi của bạn về người dùng thành công!",
      noAdmin: "Hiện tại bot chưa có admin nào"
    },
    en: {
      missingMessage: "Put the content, turdy!\n\n@callad [your report]",
      sendByGroup: "\n- Sent from group: %1\n- Thread ID: %2",
      sendByUser: "\n- Sent from user",
      content: "\n\nContent:\n─────────────────\n%1\n─────────────────\nReply this message to send message to user",
      success: "[📧] Sent your message to %1 admin(s) successfully!\n%2",
      failed: "An error occurred while sending your message to %1 admin(s)\n%2\nCheck console for more details",
      reply: "♡   ∩_∩\n（„• ֊ •„)♡\n┏━∪∪━━ღ❦ღ┓\n☪ [%2] ♡\n♡   ᏦᎽᎾᎿᎯᏦᎯ-[📩]\n┗ღ❦ღ━━━━━┛[✦]",
      replySuccess: "📩 Sent your reply to admin successfully!",
      feedback: "📝 Feedback from user %1:\n- User ID: %2%3\n\nContent:\n─────────────────\n%4\n─────────────────\nReply this message to send message to user",
      replyUserSuccess: "Sent your reply to user successfully!",
      noAdmin: "Bot has no admin at the moment"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;
    if (!args[0])
      return message.reply(getLang("missingMessage"));

    const { senderID, threadID, isGroup } = event;
    if (config.adminBot.length === 0)
      return message.reply(getLang("noAdmin"));

    const senderName = await usersData.getName(senderID) || "Unknown";
    const threadData = await threadsData.get(threadID);
    const threadName = threadData?.threadName || "Unknown";

    const msg = "==📨️ CALL ADMIN 📨️=="
      + `\n- User Name: ${senderName}`
      + `\n- User ID: ${senderID}`
      + (isGroup ? getLang("sendByGroup", threadName, threadID) : getLang("sendByUser"));

    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{
        id: senderID,
        tag: senderName
      }],
      attachment: await getStreamsFromAttachment(
        [...event.attachments, ...(event.messageReply?.attachments || [])]
          .filter(item => mediaTypes.includes(item.type))
      )
    };

    const successIDs = [];
    const failedIDs = [];
    const adminNames = await Promise.all(config.adminBot.map(async item => ({
      id: item,
      name: await usersData.getName(item) || "Unknown"
    })));

    for (const uid of config.adminBot) {
      try {
        const messageSend = await api.sendMessage(formMessage, uid);
        successIDs.push(uid);
        global.GoatBot.onReply.set(messageSend.messageID, {
          commandName,
          messageID: messageSend.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      }
      catch (err) {
        failedIDs.push({
          adminID: uid,
          error: err
        });
      }
    }

    let msg2 = "";
    if (successIDs.length > 0)
      msg2 += getLang("success", successIDs.length,
        adminNames.filter(item => successIDs.includes(item.id)).map(item => ` <@${item.id}> (${item.name})`).join("\n")
      );
    if (failedIDs.length > 0) {
      msg2 += getLang("failed", failedIDs.length,
        failedIDs.map(item => ` <@${item.adminID}> (${adminNames.find(item2 => item2.id == item.adminID)?.name || item.adminID})`).join("\n")
      );
      log.err("CALL ADMIN", failedIDs);
    }
    return message.reply({
      body: msg2,
      mentions: adminNames.map(item => ({
        id: item.id,
        tag: item.name
      }))
    });
  },

  onReply: async function ({ args, event, api, message, Reply, usersData, commandName, getLang }) {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID) || "Unknown";
    const { isGroup } = event;

    switch (type) {
      case "userCallAdmin": {
        const formMessage = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{
            id: event.senderID,
            tag: senderName
          }],
          attachment: await getStreamsFromAttachment(
            [...event.attachments, ...(event.messageReply?.attachments || [])]
              .filter(item => mediaTypes.includes(item.type))
          )
        };
        try {
          await api.sendMessage(formMessage, threadID, messageIDSender);
          message.reply(getLang("replySuccess"));
        } catch (err) {
          log.err(err);
          message.reply(getLang("failed", 1, err.message));
        }
        break;
      }
    }
  }
};