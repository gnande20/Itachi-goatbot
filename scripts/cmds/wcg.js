const games = new Map();
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const axios = require('axios');

module.exports = {
  config: {
    name: "wcg",
    version: "1.3",
    author: "Dan Jersey",
    countDown: 5,
    role: 0,
    shortDescription: "Jeu de mot par lettre",
    longDescription: "WCG (Word Challenge Game) en solo ou multi",
    category: "game"
  },

  onStart: async function ({ message, event, args }) {
    const mode = args[0]?.toLowerCase();
    const t = event.threadID;
    if (!["solo", "multi"].includes(mode)) {
      return message.reply(
`╭⭓ WCG - Word Challenge Game
┃ Choisis un mode :
┃  • wcg solo
┃  • wcg multi
╰⭓─────────────`
      );
    }

    const letter = getLetter();
    games.set(t, { mode, letter, players: {}, active: true });

    return message.reply(
`╭⭓ MANCHE LANCÉE
┃ Mot commençant par : "${letter.toUpperCase()}"
┃ Tape "stop" pour terminer.
╰⭓──────────────`
    );
  },

  onChat: async function ({ event, message, usersData }) {
    const t = event.threadID;
    const uid = event.senderID;
    const word = event.body?.trim().toLowerCase();

    if (!games.has(t)) return;
    const g = games.get(t);
    if (!g.active) return;

    if (word === "stop") {
      const board = await getScoreboard(g.players, usersData);
      games.delete(t);
      return message.reply(
`╭⭓ FIN DE LA PARTIE
┃ 🏆 Classement :
${board}
╰⭓───────────────`
      );
    }
    if (!word || word.includes(" ")) return;
    if (word[0] !== g.letter) return;
    if (!(await isWordValid(word))) {
      return message.reply(`✘ Le mot "${word}" n'existe pas en français`);
    }

    g.players[uid] = (g.players[uid] || 0) + 200;
    const name = await usersData.getName(uid);
    const nl = getLetter(); g.letter = nl;

    return message.reply(
`╭⭓ BIEN JOUÉ !
┃ ✔ ${name}, +200 pts avec "${word}"
╰⭓──────────────

╭⭓ PROCHAIN MOT
┃ Mot débutant par : "${nl.toUpperCase()}"
╰⭓──────────────`
    );
  }
};

// 🧠 Utilitaires :
function getLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}

async function isWordValid(word) {
  try {
    const res = await axios.get(
      `https://en.wiktionary.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(word)}`
    );
    const pages = res.data.query.pages;
    return !Object.keys(pages).includes("-1");
  } catch {
    return false;
  }
}

async function getScoreboard(players, usersData) {
  const arr = await Promise.all(
    Object.entries(players).map(async ([uid, pts]) => {
      const name = await usersData.getName(uid);
      return { name, pts };
    })
  );
  arr.sort((a, b) => b.pts - a.pts);
  return arr.map((p, i) => `#${i + 1}. ${p.name} : ${p.pts} pts`).join("\n");
}
