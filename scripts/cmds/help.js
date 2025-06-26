const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "╭─❍ ᏦᎽᎾᎿᎯᏦᎯ ❍─╮";

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
      let msg = "";

      msg += `\n\n╭─〔 🎯 ᴅᴀɴ ᴊᴇʀꜱᴇʏ 🎯 〕─╮\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = { commands: [] };
        categories[category].commands.push(name);
      }

      Object.keys(categories).forEach((category) => {
        msg += `\n╭━✷${category.toUpperCase()}✷\n`;
        const names = categories[category].commands.sort();
        for (let i = 0; i < names.length; i += 3) {
          const cmds = names.slice(i, i + 3).map((item) => `★${item}`);
          msg += `│ ${cmds.join('   ')}\n`;
        }
        msg += `╰────────────✷\n`;
      });

      const totalCommands = commands.size;
      msg += `\nᏦᎽᎾᎿᎯᏦᎯ 𝐁𝐨𝐭 𝐡𝐚𝐬 ${totalCommands} 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ✔\n`;
      msg += `${prefix}𝐡𝐞𝐥𝐩 𝐭𝐨 𝐥𝐨𝐨𝐤 𝐜𝐦𝐝𝐬\n`;
      msg += `𝐀𝐧𝐲 𝐩𝐫𝐨𝐛𝐥𝐞𝐦 𝐫𝐞𝐥𝐚𝐭𝐞𝐝 𝐭𝐨 𝐛𝐨𝐭 𝐭𝐡𝐞𝐧 𝐮𝐬𝐞 ${prefix}𝐜𝐚𝐥𝐥𝐚𝐝\n`;
      msg += `Admin : ᎠᎯᏁ ᏠᎬᏒᏕᎬᎽ\n\n`;

      await message.reply({
        body: msg
      });

    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const category = configCommand.category || "Uncategorized";
        const longDescription = configCommand.longDescription ? configCommand.longDescription.en || "No description" : "No description";
        const guideBody = String(configCommand.guide?.en || "No guide available.");
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭─❍ ᏦᎽᎾᎿᎯᏦᎯ ❍─╮      

❐𝙉𝙖𝙢𝙚 ➢ ${configCommand.name}
❐𝙊𝙩𝙝𝙚𝙧𝙉𝙖𝙢𝙚 ➢ ${configCommand.aliases ? configCommand.aliases.join(", ") : "Do not have"}
❐𝘾𝙖𝙩𝙚𝙜𝙤𝙧𝙮 ➢ ${category}

❑𝘾𝙢𝙙_𝙈𝙖𝙠𝙚𝙧 ➢ ${author}

❒𝙍𝙤𝙡𝙚 ➢ ${roleText}
❒𝙏𝙞𝙢𝙚 𝙥𝙚𝙧 𝙘𝙢𝙙 ➢ ${configCommand.countDown || 1}s
❒𝘿𝙚𝙨𝙘𝙧𝙞𝙥𝙩𝙞𝙤𝙉 ➢ ${longDescription}
❒𝙐𝙨𝙖𝙜𝙚 ➢ ${usage}
╰─────────────────────╯`;

        await message.reply(response);
      }
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
}
