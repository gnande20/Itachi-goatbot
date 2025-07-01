module.exports = {
  config: {
    name: "rps",
    aliases: ["pfc", "jeu"],
    role: 0,
    description: "Joue à Pierre Feuille Ciseaux avec le bot",
  },

  onStart: async function({ api, event, args }) {
    const choices = ["pierre", "feuille", "ciseaux"];
    const userChoice = args[0]?.toLowerCase();

    if (!choices.includes(userChoice)) {
      return api.sendMessage(
        `╭─────────────\n│\n│  🩸 ᏦᎽᎾᎿᎯᏦᎯ - Jeu RPS\n│────────────────\n│ Utilise : +rps pierre | feuille | ciseaux\n│\n╰─────────────`,
        event.threadID
      );
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    // Détermine le gagnant
    let result = "";
    if (userChoice === botChoice) result = "Égalité ! ⚔️";
    else if (
      (userChoice === "pierre" && botChoice === "ciseaux") ||
      (userChoice === "feuille" && botChoice === "pierre") ||
      (userChoice === "ciseaux" && botChoice === "feuille")
    ) result = "Tu gagnes ! 🎉";
    else result = "Je gagne ! 🎯";

    const response = `
╭─────────────
│
│  🩸 ᏦᎽᎾᎿᎯᏦᎯ - Jeu RPS
│────────────────
│ Ton choix : ${userChoice}
│ Mon choix : ${botChoice}
│
│ Résultat : ${result}
│
╰─────────────`;

    api.sendMessage(response, event.threadID);
  }
};
