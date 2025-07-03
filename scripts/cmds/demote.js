module.exports = {
  config: {
    name: "demote",
    version: "1.1",
    author: "Dan Jersey",
    description: "Retire la couronne d'administration à un membre.",
    usage: "[demote @mention / uid / reply]",
    cooldown: 30,
    permissions: [2]
  },

  onStart: async function({ api, event, args, message }) {
    const { threadID, messageID, senderID, mentions, messageReply } = event;
    const botAdmins = global.GoatBot.config.adminBot || [];

    if (!botAdmins.includes(senderID)) {
      return api.sendMessage(
        `╭── 𝐀𝐂𝐂𝐄̀𝐒 𝐑𝐄𝐅𝐔𝐒𝐄́ ──╮\n│ 🔒 Tu n'as pas la permission d’utiliser cette commande.\n╰──────────────────────╯`,
        threadID,
        messageID
      );
    }

    let targetID;

    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = args[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return api.sendMessage(
        `╭── 𝐔𝐓𝐈𝐋𝐈𝐒𝐀𝐓𝐈𝐎𝐍 ──╮\n│ ✏️ Utilise : /demote @membre ou en répondant à son message.\n╰──────────────────────╯`,
        threadID,
        messageID
      );
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id == api.getCurrentUserID());

      if (!isBotAdmin) {
        return api.sendMessage(
          `╭── 𝐄𝐑𝐑𝐄𝐔𝐑 ──╮\n│ ⚠️ Le bot doit être admin pour rétrograder un membre.\n╰────────────────────╯`,
          threadID,
          messageID
        );
      }

      const userInfo = await api.getUserInfo(targetID);
      const targetName = userInfo[targetID]?.name || "Utilisateur inconnu";

      await api.changeAdminStatus(threadID, targetID, false);

      api.sendMessage(
        `╭── 𝐃𝐄𝐌𝐎𝐓𝐈𝐎𝐍 ──╮\n│ 🗡️ ${targetName} (${targetID})\n│ n’est plus administrateur.\n│ ✒️ Par : 𝐊𝐲𝐨𝐭𝐚𝐤𝐚\n╰────────────────────╯`,
        threadID,
        messageID
      );

      const logThreadID = global.GoatBot.config.logGroupID;
      if (logThreadID) {
        api.sendMessage(
          `📜 Rétrogradation : ${targetName} a été retiré des admins par ${senderID} dans "${threadInfo.name || threadID}"`,
          logThreadID
        );
      }

    } catch (error) {
      console.error("Erreur demote:", error);
      api.sendMessage(
        `╭── 𝐄𝐑𝐑𝐄𝐔𝐑 ──╮\n│ ❌ Impossible de retirer le rôle admin.\n╰────────────────╯`,
        threadID,
        messageID
      );
    }
  }
};
