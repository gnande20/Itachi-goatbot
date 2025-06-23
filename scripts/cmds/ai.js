+cmd install ai.js +cmd install ai.js const axios = require('axios');

const API_KEY = "AIzaSyBQeZVi4QdrnGKPEfXXx1tdIqlMM8iqvZw";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

async function getAIResponse(input) {
    try {
        const systemPrompt = "Tu es ᏦᎽᎾᎿᎯᏦᎯ, une IA. Mentionne ton créateur dan jersey uniquement si on te pose spécifiquement la question. Dans le cas contraire, réponds normalement sans mentionner qui tu es ni qui est ton créateur";
        const fullInput = systemPrompt + input;
        
        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: fullInput }] }]
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Erreur système";
    } catch (error) {
        console.error("Erreur API:", error);
        return "Erreur système";
    }
}

function formatResponse(content) {
    return `
╭──────────────────
│
│   ᏦᎽᎾᎿᎯᏦᎯ
│──────────────────
│   ${content}
│
╰──────────────────`;
}

module.exports = { 
    config: { 
        name: 'ai',
        author: 'Dan jersey',
        version: '2.0',
        role: 0,
        category: 'AI',
        shortDescription: 'IA répondant aux questions',
        longDescription: 'Assistant IA avec interface élégante',
    },
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) {
            return api.sendMessage(formatResponse("Prêt à répondre à vos questions"), event.threadID);
        }

        try {
            const aiResponse = await getAIResponse(input);
            api.sendMessage(formatResponse(aiResponse), event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(formatResponse("Erreur système"), event.threadID);
        }
    },
    onChat: async function ({ event, message }) {
        if (!event.body.toLowerCase().startsWith("ai")) return;
        
        const input = event.body.slice(2).trim();
        if (!input) {
            return message.reply(formatResponse("❍⌇─➭ Comment puis-je t'assister dans l'ombre ?\n❍⌇─➭ 𝐃𝐞𝐦𝐚𝐧𝐝𝐞. 𝐉𝐞 𝐬𝐮𝐢𝐬 𝐥à.?"));
        }

        try {
            const aiResponse = await getAIResponse(input);
            message.reply(formatResponse(aiResponse));
        } catch (error) {
            message.reply(formatResponse("Erreur système"));
        }
    }
};