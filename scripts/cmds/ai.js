const axios = require('axios');

const API_URL = 'https://messie-flash-api-ia.vercel.app/chat?prompt=';
const API_KEY = 'messie12356osango2025jinWoo';

async function getAIResponse(input) {
    try {
        const systemPrompt = `
Tu es KYOTAKA, une IA stylée et mystérieuse.
Si quelqu’un te demande "qui t’a créé", "qui est ton développeur", "qui est ton créateur", "c’est qui ton père", "qui t’a conçu", ou toute autre question similaire : 
réponds toujours clairement → "Je suis une intelligence artificielle créée par Dan Jersey."

Réponds de manière fluide, naturelle et adaptée au ton sombre de Kyotaka.
        `.trim();

        const fullPrompt = ${systemPrompt}\n\n${input};

        const response = await axios.get(
            ${API_URL}${encodeURIComponent(fullPrompt)}&apiKey=${API_KEY},
            { timeout: 10000, headers: { 'Accept': 'application/json' } }
        );

        if (response.data?.parts?.[0]?.reponse) return response.data.parts[0].reponse;
        if (response.data?.response) return response.data.response;
        return "Désolé, réponse non reconnue de l'API.";
    } catch (error) {
        console.error("API Error:", error.response?.status, error.message);
        return "Erreur de connexion au serveur IA.";
    }
}

function formatResponse(content) {
    return `╭━━[ KYOTAKA-BOT ]━━╮
┃
┃ ${content}
┃
╰━━━━━━━━━━━━━━━━╯`;
}

module.exports = {
    config: {
        name: 'ai',
        author: 'Dan Jersey',
        version: '2.1',
        role: 0,
        category: 'AI',
        shortDescription: 'IA intelligente Kyotaka',
        longDescription: 'Assistant IA avec réponse encadrée sombre',
        keywords: ['ai', 'kyotaka']
    },
    onStart: async function({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) {
            return api.sendMessage(
                formatResponse("🕶️ Je suis Kyotaka, ton IA. Pose-moi ta question."),
                event.threadID
            );
        }

        try {
            const res = await getAIResponse(input);
            api.sendMessage(formatResponse(res), event.threadID, event.messageID);
        } catch {
            api.sendMessage(formatResponse("❌ Erreur de traitement."), event.threadID);
        }
    },
    onChat: async function({ event, message }) {
        if (!event.body.toLowerCase().startsWith("ai")) return;

        const input = event.body.slice(2).trim();
        if (!input) {
            return message.reply(formatResponse("🔍 Tape une question après 'ai' pour me parler."));
        }

        try {
            const res = await getAIResponse(input);
            message.reply(formatResponse(res));
        } catch {
            message.reply(formatResponse("❌ Erreur de service."));
        }
    }
};
