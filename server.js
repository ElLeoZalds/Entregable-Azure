require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/config', (req, res) => {
    res.json({
        languageKey: process.env.AZURE_LANGUAGE_KEY,
        languageEndpoint: process.env.AZURE_LANGUAGE_ENDPOINT,
        visionKey: process.env.AZURE_VISION_KEY,
        visionEndpoint: process.env.AZURE_VISION_ENDPOINT,
        openAiKey: process.env.AZURE_OPENAI_KEY,
        openAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
        openAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});