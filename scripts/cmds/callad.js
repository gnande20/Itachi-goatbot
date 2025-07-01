const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

// 🆔 Groupe où tu reçois les messages
const ADMIN_GROUP_TID = "30760229970228810";

module.exports = {
    config: {
        name: "callad",
        version: "2.0",
        author: "Dan Jersey",
        countDown: 5,
        role: 0,
        description: {
            vi: "Gửi báo cáo về admin",
            en: "Send report to admin"
        },
        category: "utility",
        guide: {
            en: "{pn} <message>"
        }
    },

    onStart: async function ({ args, message, event, usersData, threadsData, api }) {
        if (!args[0]) return message.reply("❌ Veuillez écrire un message à envoyer.");

        const { senderID, threadID, isGroup } = event;
        const senderName = await usersData.getName(senderID);
        const threadName = isGroup ? (await threadsData.get(threadID)).threadName : "Inbox";

        const msg = `
╭━「 NOUVELLE DEMANDE 」━╮
┃ 👤 De : ${senderName} (${senderID})
┃ 📍 Depuis : ${threadName} (${threadID})
┃─────────────────
┃ 💬 Message :
┃ ${args.join(" ")}
╰━━━━━━━━━━━━━━━━━╯
✉️ Réponds à ce message pour répondre à l'utilisateur.
        `.trim();

        const formMessage = {
            body: msg,
            attachment: await getStreamsFromAttachment(
                [...(event.attachments || []), ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        const sent = await api.sendMessage(formMessage, ADMIN_GROUP_TID);

        global.GoatBot.onReply.set(sent.messageID, {
            commandName: "callad",
            messageID: sent.messageID,
            threadID: threadID, // thread d'origine
            userID: senderID,
            type: "adminReply"
        });

        message.reply("✅ Ton message a été envoyé à l'équipe d'administration.");
    },

    onReply: async function ({ args, event, api, Reply, message, usersData, threadsData }) {
        const { type, threadID, userID } = Reply;
        const senderName = await usersData.getName(event.senderID);
        const threadInfo = await api.getThreadInfo(threadID).catch(() => null);
        const threadName = threadInfo ? threadInfo.threadName : "Utilisateur";

        const replyMessage = `
╭━「 🔔 RÉPONSE ADMIN 」━╮
┃ 🛡️ Admin : ${senderName}
┃─────────────────
┃ 💬 Message :
┃ ${args.join(" ")}
╰━━━━━━━━━━━━━━━━━╯
        `.trim();

        const formMessage = {
            body: replyMessage,
            attachment: await getStreamsFromAttachment(
                [...(event.attachments || []), ...(event.messageReply?.attachments || [])]
                    .filter(item => mediaTypes.includes(item.type))
            )
        };

        try {
            const sent = await api.sendMessage(formMessage, threadID);

            global.GoatBot.onReply.set(sent.messageID, {
                commandName: "callad",
                messageID: sent.messageID,
                threadID: ADMIN_GROUP_TID,
                userID: event.senderID,
                type: "userReply"
            });

            message.reply("✅ Réponse envoyée avec succès.");
        } catch (err) {
            message.reply("❌ Erreur lors de l'envoi.");
            log.err("CALLAD-REPLY", err);
        }
    }
};