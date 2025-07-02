module.exports = {
  config: {
    name: "slot",
    version: "1.1",
    author: "Dan Jersey",
    shortDescription: {
      fr: "Jeu de machine à sous Kyotaka",
    },
    longDescription: {
      en: "Joue à la machine à sous et tente ta chance pour doubler ton argent !",
    },
    category: "Jeux",
  },

  langs: {
    en: {
      invalid_amount: "❌ Entre un montant valide et positif pour jouer.",
      not_enough_money: "💸 Tu n'as pas assez d'argent pour miser ce montant.",
      win_message: "🎉 Tu as gagné %1$ !",
      lose_message: "😢 Tu as perdu %1$.",
      jackpot_message: "💥 JACKPOT KYOTAKA ! Tu remportes %1$ avec trois %2 !",
      spin_result: "🎰 Résultat : %1 | %2 | %3",
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const montant = parseInt(args[0]);

    if (isNaN(montant) || montant <= 0)
      return message.reply(getLang("invalid_amount"));

    if (montant > userData.money)
      return message.reply(getLang("not_enough_money"));

    const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
    const [slot1, slot2, slot3] = [
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)],
      slots[Math.floor(Math.random() * slots.length)]
    ];

    const gain = calculGain(slot1, slot2, slot3, montant);

    await usersData.set(senderID, {
      money: userData.money + gain,
      data: userData.data
    });

    const res = getLang("spin_result", slot1, slot2, slot3);
    const finalMsg =
      gain > 0
        ? (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒"
            ? getLang("jackpot_message", gain, "🍒")
            : getLang("win_message", gain))
        : getLang("lose_message", -gain);

    return message.reply(`${res}\n${finalMsg}`);
  }
};

function calculGain(s1, s2, s3, mise) {
  if (s1 === "🍒" && s2 === "🍒" && s3 === "🍒") return mise * 10;
  if (s1 === "🍇" && s2 === "🍇" && s3 === "🍇") return mise * 5;
  if (s1 === s2 && s2 === s3) return mise * 3;
  if (s1 === s2 || s1 === s3 || s2 === s3) return mise * 2;
  return -mise;
}
