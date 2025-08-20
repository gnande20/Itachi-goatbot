const axios = require('axios');
const fs = require('fs-extra');

const API_URL = 'https://kyotaka-api.vercel.app/?text=';
const activePath = __dirname + '/kyo_active.json';

if (!fs.existsSync(activePath)) fs.writeJsonSync(activePath, {});

async function getAIResponse(input) {
    try {
        const res = await axios.get(`${API_URL}${encodeURIComponent(input)}`);
        return res.data?.message || res.data?.parts?.[0]?.reponse || res.data?.response || "Réponse non valide.";
    } catch {
        return "❌ Erreur de connexion à Kyotaka.";
    }
}

function formatReply(content) {
    return `╭━━[ KYOTAKA-BOT ]━━╮\n┃\n┃ ${content}\n┃\n╰━━━━━━━━━━━━━━━━╯`;
}

module.exports = {
    config: {
        name: 'kyo',
        version: '1.0',
        author: 'Dan Jersey',
        role: 0,
        shortDescription: 'Active/Désactive la conversation IA',
        longDescription: 'Active un mode où le bot répond automatiquement sans taper ai',
        category: 'AI'
    },

    onStart: async function ({ message, event, args }) {
        const data = await fs.readJson(activePath);
        const tid = event.threadID;
        const cmd = args[0]?.toLowerCase();

        if (cmd === 'on') {
            data[tid] = true;
            await fs.writeJson(activePath, data);
            return message.reply(`╭━━[ KYOTAKA ACTIVÉ ]━━╮\n┃\n┃ ✅ Mode sombre activé.\n┃ Je répondrai à tout ce que vous direz.\n┃\n╰━━━━━━━━━━━━━━━╯`);
        }

        if (cmd === 'off') {
            data[tid] = false;
            await fs.writeJson(activePath, data);
            return message.reply(`╭━━[ KYOTAKA DÉSACTIVÉ ]━━╮\n┃\n┃ ❌ Mode désactivé.\n┃ Je ne répondrai plus automatiquement.\n┃\n╰━━━━━━━━━━━━━━━━╯`);
        }

        return message.reply(`╭━━[ KYOTAKA ]━━╮\n┃\n┃ Utilisation :\n┃ > kyo on  → Activer\n┃ > kyo off → Désactiver\n┃\n╰━━━━━━━━━━━━━━━╯`);
    },

    onChat: async function ({ event, message }) {
        const data = await fs.readJson(activePath);
        const tid = event.threadID;
        const uid = event.senderID;
        const text = event.body?.trim();

        if (!text || !data[tid]) return;
        const res = await getAIResponse(text);
        return message.reply(formatReply(res));
    }
};
