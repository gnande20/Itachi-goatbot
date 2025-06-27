const axios = require('axios');

// 👉 Ta clé API ici
const API_KEY = "AIzaSyBN4UIH-n3ZKDqXggccAatrcpi_fBf6XiA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// 👉 Fonction pour interagir avec l'API Gemini
async function getAIResponse(input) {
    try {
        const systemPrompt = "Tu es ᏦᎽᎾᎿᎯᏦᎯ, une IA. Mentionne ton créateur Dan Jersey uniquement si on te le demande explicitement. Sinon, réponds normalement sans dire qui tu es ni qui t’a créé.";
        const fullInput = systemPrompt + "\n" + input;

        const response = await axios.post(API_URL, {
            contents: [{ parts: [{ text: fullInput }] }]
        }, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Erreur : aucune réponse générée.";
    } catch (error) {
        console.error("Erreur API:", error);
        return "❌ Erreur système : " + error.message;
    }
}

// 👉 Fonction pour mettre la réponse sous un joli format
function formatResponse(content) {
    return `
╭──────────────────
│
│   ᏦᎽᎾᎿᎯᏦᎯ - IA Sombre
│──────────────────
│   ${content}
│
╰──────────────────`;
}

// 👉 Configuration et gestion de la commande
module.exports = {
    config: {
        name: 'ai',
        author: 'Dan Jersey',
        version: '2.0',
        role: 0,
        category: 'AI',
        shortDescription: 'IA qui répond aux questions',
        longDescription: 'Assistant IA intelligent avec une belle interface stylée',
    },

    // Commande directe : ai [question]
    onStart: async function ({ api, event, args }) {
        const input = args.join(' ').trim();
        if (!input) {
            return api.sendMessage(formatResponse("⨳ Que souhaites-tu me demander ?"), event.threadID);
        }

        try {
            const aiResponse = await getAIResponse(input);
            api.sendMessage(formatResponse(aiResponse), event.threadID, event.messageID);
        } catch (error) {
            api.sendMessage(formatResponse("❌ Erreur système."), event.threadID);
        }
    },

    // Message automatique quand quelqu’un écrit : ai [question] dans le chat
    onChat: async function ({ event, message }) {
        if (!event.body.toLowerCase().startsWith("ai")) return;

        const input = event.body.slice(2).trim();
        if (!input) {
            return message.reply(formatResponse("✧ Que puis-je faire pour toi dans l'ombre ?"));
        }

        try {
            const aiResponse = await getAIResponse(input);
            message.reply(formatResponse(aiResponse));
        } catch (error) {
            message.reply(formatResponse("❌ Erreur système."));
        }
    }
};