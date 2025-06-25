const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "╭─⌾𝙱𝙾𝚃 𝙿𝙰𝙶𝙴  ⋅⌾──╮\n│\n│ https://www.facebook.com/profile.php?id=61577867905683 \n│\n╰─────────────⌾";

function applyFont(text) {
  const fontMap = {
    'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵',
    'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻',
    'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁',
    'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇',
    'Y': '𝚈', 'Z': '𝚉',
    'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏',
    'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕',
    'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛',
    's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡',
    'y': '𝚢', 'z': '𝚣'
  };
  return text.split('').map(char => fontMap[char] || char).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "1.2",
    author: "Dan jersey",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list"
    },
    longDescription: {
      en: "View detailed command usage and list all available commands"
    },
    category: "info",
    guide: {
      en: "{pn} [command_name]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = await getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = ╭─⌾${applyFont("COMMAND LIST")}⋅⌾──╮\n│\n│  ${applyFont("KYOTAKA BOT")}\n│\n╰─────────────⌾\n;

      for (const [name, value] of commands) {
        if (value.config.role > role) continue;
        const category = value.config.category || "NO CATEGORY";
        if (!categories[category]) {
          categories[category] = { commands: [] };
        }
        categories[category].commands.push(name);
      }

      Object.keys(categories).sort().forEach(category => {
        const formattedCategory = applyFont(category.toUpperCase());
        msg += ╭─⌾${formattedCategory}⋅⌾──╮\n│\n;

        categories[category].commands.sort().forEach(name => {
          msg += │ ✦ ${applyFont(name)}\n;
        });

        msg += │\n╰─────────────⌾\n;
      });

      const totalCommands = commands.size;
      msg += ╭─⌾${applyFont("INFORMATION")}⋅⌾──╮\n│\n;
      msg += │ ${applyFont("TOTAL COMMANDS")}: ${totalCommands}\n;
      msg += │ ${applyFont("PREFIX")}: ${prefix}\n;
      msg += │\n│ ${applyFont("Type")} ${prefix}help cmd_name\n;
      msg += │ ${applyFont("to view command details")}\n│\n;
      msg += ╰─────────────⌾\n;
      msg += doNotDelete;

      await message.reply({ body: msg });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(╭─⌾${applyFont("ERROR")}⋅⌾──╮\n│\n│ ${applyFont("Command not found")}\n│\n╰─────────────⌾);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";

        const longDescription = configCommand.longDescription?.en || "No description";
        const guideBody = configCommand.guide?.en || "No guide available.";
        const usage = guideBody.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `╭─⌾${applyFont("COMMAND INFO")}⋅⌾──╮
│
│ ${applyFont("NAME")}: ${configCommand.name}
│ ${applyFont("VERSION")}: ${configCommand.version || "1.0"}
│ ${applyFont("AUTHOR")}: ${applyFont(author)}
│
│ ${applyFont("DESCRIPTION")}:
│ ${longDescription}
│
│ ${applyFont("USAGE")}:
│ ${usage}
│
│ ${applyFont("ALIASES")}: ${configCommand.aliases ? configCommand.aliases.map(a => applyFont(a)).join(", ") : "None"}
│ ${applyFont("ROLE")}: ${roleText}
│ ${applyFont("COOLDOWN")}: ${configCommand.countDown || 2}s
│
╰─────────────⌾`;

        await message.reply(response);
      }
    }
  }
};

function roleTextToString(roleText) {
  switch (roleText) {
    case 0: return applyFont("All users");
    case 1: return applyFont("Group admins");
    case 2: return applyFont("Bot admins");
    default: return applyFont("Unknown");
  }
}
