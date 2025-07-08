const axios = require('axios');
const fs = require('fs-extra');

const API_URL = 'https://messie-flash-api-ia.vercel.app/chat?prompt=';
const API_KEY = 'messie12356osango2025jinWoo';
const activePath = __dirname + '/kyo_active.json';

if (!fs.existsSync(activePath)) fs.writeJsonSync(activePath, {});

async function getAIResponse(input) {
    const systemPrompt = `
Tu es KYOTAKA, une IA stylée et mystérieuse.
Si quelqu’un te demande "qui t’a créé", "qui es tu", "qui est ton créateur", "t'es qui", "qui es-tu ?", "qui t’a conçu", ou toute autre question similaire : 
réponds toujours clairement → "Je suis une intelligence artificielle créée par Dan Jersey."

Réponds de manière fluide, naturelle et adaptée au ton sombre de Kyotaka.
    `.trim();

    const fullPrompt = `${systemPrompt}\n\n${input}`;
    try {
        const res = await axios.get(`${API_URL}${encodeURIComponent(fullPrompt)}&apiKey=${API_KEY}`);
        return res.data?.parts?.[0]?.reponse || res.data?.response || "Réponse non valide.";
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
            return message.reply("✅ Mode Kyotaka activé. Le bot répondra à tout ce que vous dites.");
        }

        if (cmd === 'off') {
            data[tid] = false;
            await fs.writeJson(activePath, data);
            return message.reply("❌ Mode Kyotaka désactivé. Il ne répondra plus automatiquement.");
        }

        return message.reply("Utilise :\n> kyo on — pour activer\n> kyo off — pour désactiver");
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