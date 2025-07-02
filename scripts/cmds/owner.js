module.exports = {
  config: {
    name: "owner",
    aliases: ["creator", "danjersey", "boss"],
    version: "2.0",
    author: "Dan Jersey",
    countDown: 5,
    role: 0,
    description: {
      en: "Show the bot owner's info"
    },
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    const info = `
┏━━━━━━━━━━━━━━━┓
┃ 👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 👑
┣━━━━━━━━━━━━━━━┫
┃ 🔥 𝗡𝗼𝗺 : Dan Jersey
┃ 🌐 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : 
┃ fb.com/Danjersey09
┃ 💻 𝗥𝗼̂𝗹𝗲 : Fondateur
┃ 🤖 𝗕𝗼𝘁 : KYOTAKA
┃ 🛠️ 𝗦𝘁𝗮𝘁𝘂𝘁 : Actif
┃ 💌 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 :
┃  - Inbox Facebook
┃  - Projet/Dev 🔥
┗━━━━━━━━━━━━━━━┛
`;

    message.reply(info);
  }
};