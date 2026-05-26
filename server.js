require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/config", (req, res) => {
  res.json({
    languageKey: process.env.AZURE_LANGUAGE_KEY,
    languageEndpoint: process.env.AZURE_LANGUAGE_ENDPOINT,
    openAiKey: process.env.AZURE_OPENAI_KEY,
    openAiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
    openAiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    openAiVersion: process.env.AZURE_OPENAI_API_VERSION,
    openFineTuneKey: process.env.AZURE_FINETUNE_KEY,
    openFineTuneEndpoint: process.env.AZURE_FINETUNE_ENDPOINT,
    openFineTuneDeployment: process.env.AZURE_FINETUNE_DEPLOYMENT_NAME,
    openFineTuneVersion: process.env.AZURE_FINETUNE_API_VERSION,
  });
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
