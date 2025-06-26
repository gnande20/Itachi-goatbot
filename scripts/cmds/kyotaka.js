const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "kyotaka",
    aliases: ["kyo"],
    version: "1.0",
    author: "Dan jersey",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "",
      en: "ajouter un utilisateur dans mon gc"
    },
    longDescription: {
      vi: "",
      en: "ajouter un utilisateur dans le groupe du bot"
    },
    category: "GroupMsg",
    guide: {
      en: "{pn}kyotaka"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = "24057267273909804";
    try {
      
      const threadInfo = await api.getThreadInfo(threadID);
      const participants = threadInfo.participantIDs;

      if (participants.includes(event.senderID)) {
        api.sendMessage("tu cherche quoi t'as déjà été ajouter dans mon groupe", event.threadID);

      
        api.setMessageReaction("⚠", event.messageID, "💌", api);
      } else {
      
        await api.addUserToGroup(event.senderID, threadID);
        api.sendMessage("🎯 | ajout réussi tu es maintenant dans mon groupe", event.threadID);

    
        api.setMessageReaction("🍀", event.messageID, "💌", api);
      }
    } catch (error) {
      api.sendMessage("❌ | déso bro je n'ai pas pu t'ajouter dans le group.\ne:", event.threadID);

      
      api.setMessageReaction("💀", event.messageID, "👍", api);
    }
  }
    }
