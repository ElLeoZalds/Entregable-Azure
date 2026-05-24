document.getElementById('btnEnviar').addEventListener('click', async () => {
    const contenedor = document.getElementById('resultado');
    const textoDelUsuario = document.getElementById('textoUsuario').value;

    // Validación: Verificar que el usuario haya ingresado contenido para analizar
    if (!textoDelUsuario.trim()) {
        contenedor.textContent = "Por favor, escribe una frase para analizar.";
        return;
    }

    try {
        contenedor.textContent = "Enviando documento a Azure...";

        // Obtener credenciales del servicio de lenguaje desde la configuración interna
        const configRes = await fetch('/api/config');
        if (!configRes.ok) throw new Error("No se pudo obtener la configuración del servidor.");
        const config = await configRes.json();

        const endpoint = config.languageEndpoint;
        const suscriptionKey = config.languageKey;
        
        // Construir URL del punto final para el análisis de texto sincronizado
        const URL = `${endpoint}/language/:analyze-text?api-version=2023-04-01`;

        // Estructurar el objeto de análisis especificando el tipo de tarea: SentimentAnalysis
        const documentoAnalizar = {
            kind: "SentimentAnalysis",
            analysisInput: {
                documents: [
                    {
                        id: "1",
                        language: "es",
                        text: textoDelUsuario
                    }
                ]
            }
        };

        // Enviar la petición POST con la clave de suscripción en los encabezados
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                "Ocp-Apim-Subscription-Key": suscriptionKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(documentoAnalizar)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message);
        }

        // Procesar la respuesta de Azure
        const data = await response.json();

        // Generar el formato de salida para mostrar los resultados de confianza
        let resultadoHTML = "";
        data.results.documents.forEach(document => {
            resultadoHTML += `Documento # ${document.id}\n`;
            resultadoHTML += `Texto analizado: "${textoDelUsuario}"\n\n`;

            // Extraer las puntuaciones (scores) de sentimiento devueltas por la IA
            const scores = document.confidenceScores;
            resultadoHTML += `Puntuaciones de confianza:\n`;
            resultadoHTML += `- positivo: ${scores.positive}\n`;
            resultadoHTML += `- negativo: ${scores.negative}\n`;
            resultadoHTML += `- neutral: ${scores.neutral}\n`;
        });

        // Renderizar el resultado final en el contenedor de la interfaz
        contenedor.textContent = resultadoHTML;

    } catch (error) {
        contenedor.textContent = `Error: ${error.message}`;
    }
});