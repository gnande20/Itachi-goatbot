module.exports = {
  config: {
    name: "promote",
    version: "1.1",
    author: "Dan Jersey",
    description: "Accorde la couronne d'administration à un élu.",
    usage: "[promote @mention ou uid]",
    cooldown: 30,
    permissions: [2]
  },

  onStart: async function({ api, event, args, message, threadsData }) {
    const { threadID, messageID, senderID, mentions } = event;
    const botAdmins = global.GoatBot.config.adminBot || [];

    if (!botAdmins.includes(senderID)) {
      return api.sendMessage(
        `╭── 𝐀𝐂𝐂𝐄̀𝐒 𝐑𝐄𝐅𝐔𝐒𝐄́ ──╮\n│ 🔒 Tu n'as pas les droits nécessaires.\n╰──────────────────────╯`,
        threadID,
        messageID
      );
    }

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id == api.getCurrentUserID());

      if (!isBotAdmin) {
        return api.sendMessage(
          `╭── 𝐄𝐑𝐑𝐄𝐔𝐑 ──╮\n│ ⚠️ Le bot doit être admin pour effectuer cette action.\n╰────────────────╯`,
          threadID,
          messageID
        );
      }

      const userInfo = await api.getUserInfo(targetID);
      const targetName = userInfo[targetID]?.name || "Utilisateur inconnu";

      await api.changeAdminStatus(threadID, targetID, true);

      api.sendMessage(
        `╭── 𝐏𝐑𝐎𝐌𝐎𝐓𝐈𝐎𝐍 ──╮\n│ 👑 ${targetName} (${targetID})\n│ a reçu le titre d'administrateur.\n│ 📝 Accordé par : 𝐊𝐲𝐨𝐭𝐚𝐤𝐚\n╰────────────────────╯`,
        threadID,
        messageID
      );

      const logThreadID = global.GoatBot.config.logGroupID;
      if (logThreadID) {
        api.sendMessage(
          `📜 Décret Royal :\n👑 ${targetName} a été promu admin par ${senderID} dans "${threadInfo.name || threadID}"`,
          logThreadID
        );
      }

    } catch (error) {
      console.error("Erreur promotion admin:", error);
      api.sendMessage(
        `╭── 𝐄𝐑𝐑𝐄𝐔𝐑 ──╮\n│ ❌ La cérémonie a échoué.\n╰────────────────╯`,
        threadID,
        messageID
      );
    }
  }
};
