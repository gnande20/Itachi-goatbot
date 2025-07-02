const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

// 🆔 Groupe admin où tu reçois les messages
const ADMIN_GROUP_TID = "30760229970228810";

module.exports = {
    config: {
        name: "callad",
        version: "3.1",
        author: "Dan Jersey",
        countDown: 5,
        role: 0,
        description: {
            en: "Send message to admin and chat",
            vi: "Gửi báo cáo và trò chuyện với admin"
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
        const threadName = isGroup ? (await threadsData.get(threadID))?.threadName || "Groupe" : "Inbox";

        const msg = `
╔═╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌═╗
║ 📥 NOUVELLE DEMANDE
╟──────────────
║ 👤 ${senderName} (${senderID})
║ 📍 ${threadName} (${threadID})
╟──────────────
║ 💬 ${args.join(" ")}
╚═╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌═╝
✉ Réponds à ce message pour répondre à l'utilisateur.
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
            userID: senderID,
            threadID: threadID,
            type: "adminReply"
        });

        message.reply("✅ Ton message a bien été transmis à l'administration.");
    },

    onReply: async function ({ args, event, api, Reply, message, usersData, threadsData }) {
        const { type, userID, threadID } = Reply;
        const senderName = await usersData.getName(event.senderID);

        const attachments = await getStreamsFromAttachment(
            [...(event.attachments || []), ...(event.messageReply?.attachments || [])]
                .filter(item => mediaTypes.includes(item.type))
        );

        if (type === "adminReply") {
            // L'admin répond à l'utilisateur
            const replyMessage = `
╔═╌╌╌╌╌╌╌╌╌╌═╗
║ 🛡️ RÉPONSE ADMIN
╟──────────
║ 👤 ${senderName}
╟──────────
║ 💬 ${args.join(" ")}
╚═╌╌╌╌╌╌╌╌╌╌═╝
            `.trim();

            const sent = await api.sendMessage({
                body: replyMessage,
                attachment: attachments
            }, threadID);

            global.GoatBot.onReply.set(sent.messageID, {
                commandName: "callad",
                messageID: sent.messageID,
                userID: event.senderID,
                threadID: ADMIN_GROUP_TID,
                type: "userReply"
            });

            message.reply("✅ Réponse envoyée à l'utilisateur.");
        }

        if (type === "userReply") {
            // L'utilisateur répond, ça revient à l'admin
            const userName = await usersData.getName(userID);
            const threadInfo = await threadsData.get(threadID);
            const threadName = threadInfo?.threadName || "Groupe";

            const replyMessage = `
╔═╌╌╌╌╌╌╌╌╌╌═╗
║ 📩 RÉPONSE USER
╟──────────
║ 👤 ${userName} (${userID})
║ 📍 ${threadName} (${threadID})
╟──────────
║ 💬 ${args.join(" ")}
╚═╌╌╌╌╌╌╌╌╌╌═╝
✉ Réponds pour continuer.
            `.trim();

            const sent = await api.sendMessage({
                body: replyMessage,
                attachment: attachments
            }, ADMIN_GROUP_TID);

            global.GoatBot.onReply.set(sent.messageID, {
                commandName: "callad",
                messageID: sent.messageID,
                userID: userID,
                threadID: threadID,
                type: "adminReply"
            });

            message.reply("✅ Réponse envoyée à l'admin.");
        }
    }
};