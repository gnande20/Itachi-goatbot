const { config } = global.GoatBot;
const path = require("path");
const fs = require("fs-extra");
const { utils } = global;
const axios = require("axios");

module.exports = {
  config: {
    name: "prefix",
    version: "1.4",
    author: "Dan jersey",
    countDown: 5,
    role: 0,
    shortDescription: "Thay đổi prefix của bot",
    longDescription: "Thay đổi dấu lệnh của bot trong box chat của bạn hoặc cả hệ thống bot (chỉ admin bot)",
    category: "config",
    guide: {
      vi:
        "   {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn" +
        "\n   Ví dụ:" +
        "\n    {pn} #" +
        "\n\n   {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)" +
        "\n   Ví dụ:" +
        "\n    {pn} # -g" +
        "\n\n   {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
      en:
        "   {pn} <new prefix>: change new prefix in your box chat" +
        "\n   Example:" +
        "\n    {pn} #" +
        "\n\n   {pn} <new prefix> -g: change new prefix in system bot (only admin bot)" +
        "\n   Example:" +
        "\n    {pn} # -g" +
        "\n\n   {pn} reset: change prefix in your box chat to default"
    }
  },

  langs: {
    vi: {
      reset: "Đã reset prefix của bạn về mặc định: %1",
      onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
      confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
      confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
      successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
      successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
      myPrefix:
        "╭─━─━─━─━─━─━─━─━╮\n" +
        "│  🌐 Prefix système: %1\n" +
        "│  🛸 Prefix groupe: %2\n" +
        "│  Tape %2help pour voir mes commandes\n" +
        "╰─━─━─━─━─━─━─━─━╯"
    },
    en: {
      reset: "Your prefix has been reset to default: %1",
      onlyAdmin: "Only admin can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your group chat to: %1",
      myPrefix:
        "╭─━─━─━─━─━─━─━─━╮\n" +
        "│  🌐 System prefix: %1\n" +
        "│  🛸 Group prefix: %2\n" +
        "│  Tape %2help pour voir mes commandes\n" +
        "╰─━─━─━─━─━─━─━─━╯"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    // (Garde ton code onStart tel quel, rien à changer ici)
    // ...
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    // (Garde ton code onReaction tel quel, rien à changer ici)
    // ...
  },

  onChat: async function ({ event, message, getLang }) {
    // On ignore les messages vides
    if (!event.body) return;

    // Normalisation du message
    const text = event.body.trim().toLowerCase();

    // Liste des mots clefs pour répondre avec le prefix
    const triggerWords = ["prefix", "bot"];

    if (triggerWords.includes(text)) {
      // On récupère les prefix global et thread (local)
      const globalPrefix = global.GoatBot.config.prefix || "!";
      const threadPrefix = (await global.GoatBot.threadsData?.get(event.threadID, "data.prefix")) || globalPrefix;

      // Formatage du message avec encadrement (selon langue thread)
      const lang = global.GoatBot.langsData?.getLangName(event.threadID) || "en";
      const responseText = getLang("myPrefix", globalPrefix, threadPrefix);

      return message.reply(responseText);
    }
  }
};