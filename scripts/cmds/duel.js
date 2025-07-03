module.exports = {
  config: {
    name: "duel",
    version: "1.0",
    author: "Dan Jersey",
    shortDescription: {
      en: "Parie entre Kyotaka et Ayanokoji"
    },
    longDescription: {
      en: "Choisis Kyotaka ou Ayanokoji et mise ton argent pour tenter de doubler ton pari."
    },
    category: "Jeux",
    guide: {
      en: "{pn} <kyotaka|ayanokoji> <montant>"
    }
  },

  langs: {
    en: {
      missing_choice: "❌ Choisis entre « kyotaka » ou « ayanokoji ».",
      invalid_amount: "❌ Entrez un montant valide et positif.",
      not_enough_money: "❌ Tu n'as pas assez d'argent pour miser ça.",
      win: "🎉 Tu as choisi %1 et le bot aussi ! Tu gagnes 💸 %2 !",
      lose: "😢 Tu as choisi %1 mais le bot a choisi %2. Tu perds 💸 %3.",
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const userID = event.senderID;
    const userData = await usersData.get(userID);

    const choice = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    if (!["kyotaka", "ayanokoji"].includes(choice))
      return message.reply(getLang("missing_choice"));

    if (isNaN(amount) || amount <= 0)
      return message.reply(getLang("invalid_amount"));

    if (amount > userData.money)
      return message.reply(getLang("not_enough_money"));

    const options = ["kyotaka", "ayanokoji"];
    const botChoice = options[Math.floor(Math.random() * 2)];

    let resultMessage = "";
    let gain = 0;

    if (choice === botChoice) {
      gain = amount;
      resultMessage = getLang("win", choice, amount * 2);
    } else {
      gain = -amount;
      resultMessage = getLang("lose", choice, botChoice, amount);
    }

    await usersData.set(userID, {
      money: userData.money + gain,
      data: userData.data
    });

    return message.reply(resultMessage);
  }
};