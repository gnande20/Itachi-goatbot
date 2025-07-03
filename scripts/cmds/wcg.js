const games = new Map();
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

module.exports = {
  config: {
    name: "wcg",
    version: "1.1",
    author: "Dan Jersey",
    countDown: 5,
    role: 0,
    shortDescription: "Jeu de mot par lettre",
    longDescription: "Jeu WCG (Word Challenge Game) en solo ou groupe",
    category: "game"
  },

  onStart: async function ({ message, event, args }) {
    const mode = args[0]?.toLowerCase();
    const threadID = event.threadID;
    const senderID = event.senderID;

    if (!["solo", "multi"].includes(mode)) {
      return message.reply(
        `╭─🎮 𝙒𝘾𝙂 - 𝙒𝙤𝙧𝙙 𝘾𝙝𝙖𝙡𝙡𝙚𝙣𝙜𝙚\n│\n│ Choisis un mode de jeu :\n│\n│ 👉 wcg solo\n│ 👉 wcg multi\n╰──────────────`
      );
    }

    const letter = getLetter();
    games.set(threadID, {
      mode,
      letter,
      players: {},
      active: true
    });

    return message.reply(
      `╭─🔤 𝙈𝘼𝙉𝘾𝙃𝙀 𝘿𝙀́𝘽𝙐𝙏𝙀́𝙀\n│\n│ Donne un mot commençant par : "${letter.toUpperCase()}"\n│\n│ Tape "stop" pour terminer le jeu\n╰──────────────`
    );
  },

  onChat: async function ({ event, message, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = event.body?.trim().toLowerCase();

    if (!games.has(threadID)) return;
    const game = games.get(threadID);
    if (!game.active) return;

    if (body === "stop") {
      const scoreboard = Object.entries(game.players)
        .sort((a, b) => b[1] - a[1])
        .map(([id, score], i) => `#${i + 1}. ${id} : ${score} pts`)
        .join("\n") || "Aucun score.";

      games.delete(threadID);
      return message.reply(
        `╭─🏁 𝙁𝙄𝙉 𝘿𝙐 𝙅𝙀𝙐\n│\n│ 🏆 Classement :\n${scoreboard}\n╰──────────────`
      );
    }

    if (!body || body.includes(" ")) return; // un seul mot

    const firstLetter = body[0];
    if (firstLetter !== game.letter) return;

    // Ajout du score
    game.players[senderID] = (game.players[senderID] || 0) + 200;

    const name = await usersData.getName(senderID);
    const congrat = `✔️ Félicitations ${name} ! Tu as gagné 200 pts avec le mot "${body}"`;

    // Nouvelle lettre
    const newLetter = getLetter();
    game.letter = newLetter;

    // Réponse + suite
    return message.reply(
      `╭─🎉 𝘽𝙄𝙀𝙉 𝙅𝙊𝙐𝙀́\n│\n│ ${congrat}\n╰──────────────`
      + `\n\n╭─🔤 𝙉𝙊𝙐𝙑𝙀𝙇𝙇𝙀 𝙇𝙀𝙏𝙏𝙍𝙀\n│\n│ Trouve un mot commençant par : "${newLetter.toUpperCase()}"\n╰──────────────`
    );
  }
};

// ✅ Fonction manquante ajoutée ici
function getLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)];
}
