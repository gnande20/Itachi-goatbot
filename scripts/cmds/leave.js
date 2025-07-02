module.exports = {
  config: {
    name: "leave",
    aliases: ["out", "exit", "quit"],
    version: "1.0",
    author: "Dan Jersey",
    countDown: 5,
    role: 0,
    description: {
      en: "Bot leaves the group with a dark message."
    },
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;

    const message = `
╭───────────────✦
│ ⚠️ 𝐃𝐀𝐑𝐊 𝐄𝐗𝐈𝐓
│───────────────
│ Le néant m'appelle...
│ Je quitte ce groupe.
│ 𝐊𝐘𝐎𝐓𝐀𝐊𝐀 disparaît... ☠️
╰───────────────✦
    `.trim();

    // Envoie le message avant de quitter
    api.sendMessage(message, threadID, () => {
      api.removeUserFromGroup(api.getCurrentUserID(), threadID);
    });
  }
}
