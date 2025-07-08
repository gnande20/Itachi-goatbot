const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.17",
    author: "Dan jersey",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly"
    },
    longDescription: {
      en: "View command usage and list all commands directly"
    },
    category: "cmd-list",
    guide: {
      en: "{pn} / help cmdName"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "\n\n╭━━⫷ KYOTAKA ┃ CMDS ⫸━━╮\n";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category?.toUpperCase() || "UNCATEGORIZED";
        if (!categories[category]) categories[category] = { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach((category) => {
        msg += `\n╭─────⟪ ${category} ⟫─────╮\n`;
        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i++) {
          msg += `┃ ✦ ${names[i]}\n`;
        }
        msg += `╰─────────────────╯\n`;
      });

      const totalCommands = commands.size;
      msg += `\n⫸ ${totalCommands} commandes disponibles\n`;
      msg += `⫸ +help [nom] pour plus d'info\n`;
      msg += `⫸ Problème ? Contactez l’admin via +callad\n`;
      msg += `⫷ Développé par Dan Jersey ⫸`;

      await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Commande \"${commandName}\" introuvable.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Inconnu";
        const category = configCommand.category || "Uncategorized";
        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "Pas de description" : "Pas de description";
        const guideBody = String(configCommand.guide?.en || "Aucune utilisation disponible.");
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭─⟪ INFO COMMANDE ⟫─╮\n\n❐ Nom         ➢ ${configCommand.name}\n❐ Alias       ➢ ${configCommand.aliases ? configCommand.aliases.join(", ") : "Aucun"}\n❐ Catégorie   ➢ ${category}\n❐ Auteur      ➢ ${author}\n❐ Rôle        ➢ ${roleText}\n❐ Cooldown    ➢ ${configCommand.countDown || 1}s\n❐ Description ➢ ${longDescription}\n❐ Usage       ➢ ${usage}\n\n╰────────────────╯`;

        await message.reply(response);
      }
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (Tous les utilisateurs)";
    case 1:
      return "1 (Admins du groupe)";
    case 2:
      return "2 (Admin du bot)";
    default:
      return "Rôle inconnu";
  }
}
