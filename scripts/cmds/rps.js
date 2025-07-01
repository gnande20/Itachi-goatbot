module.exports = {
  config: {
    name: "rps",
    aliases: ["pfc", "jeu"],
    version: "1.0",
    author: "Dan Jersey",
    countDown: 3,
    role: 0,
    description: "Joue à Pierre Feuille Ciseaux avec le bot",
    category: "game"
  },

  onStart: async function({ api, event, args }) {
    const choices = ["pierre", "feuille", "ciseaux"];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return api.sendMessage(
        `╭─────────────
│  ᏦᎽᎾᎿᎯᏦᎯ - Jeu RPS
│────────────────
│ Utilisation : +rps pierre | feuille | ciseaux
╰─────────────`,
        event.threadID
      );
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = "";

    if (userChoice === botChoice) {
      result = "⚔️ Égalité";
    } else if (
      (userChoice === "pierre" && botChoice === "ciseaux") ||
      (userChoice === "feuille" && botChoice === "pierre") ||
      (userChoice === "ciseaux" && botChoice === "feuille")
    ) {
      result = "🎉 Tu gagnes";
    } else {
      result = "Je gagne";
    }

    const response = `
╭─────────────
│  ᏦᎽᎾᎿᎯᏦᎯ - Jeu RPS
│────────────────
│ Ton choix : ${userChoice}
│ Mon choix : ${botChoice}
│
│ Résultat : ${result}
╰─────────────`;

    api.sendMessage(response, event.threadID, event.messageID);
  }
};
