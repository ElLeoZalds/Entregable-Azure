document.getElementById("btnEnviar").addEventListener("click", async () => {
  const contenedor = document.getElementById("resultado");
  const textoDelUsuario = document.getElementById("textoDelUsuario").value;

  // Validación: Verificar que el usuario haya ingresado contenido para analizar
  if (!textoDelUsuario.trim()) {
    contenedor.textContent = "Por favor, escribe una frase para analizar.";
    return;
  }

  try {
    contenedor.textContent = "Enviando documento a Azure...";

    // Obtener credenciales del servicio de lenguaje desde la configuración interna
    const configRes = await fetch("/api/config");
    if (!configRes.ok)
      throw new Error("No se pudo obtener la configuración del servidor.");
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
            text: textoDelUsuario,
          },
        ],
      },
    };

    // Enviar la petición POST con la clave de suscripción en los encabezados
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": suscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentoAnalizar),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }

    // Procesar la respuesta de Azure
    const data = await response.json();

    // Estructurar la lista de resultados para mostrar en el DOM
    let resultadoHTML = "<h3>Análisis de Sentimiento:</h3>";

    data.results.documents.forEach((document) => {
      // Extraer y formatear las puntuaciones (scores) a porcentajes
      const scores = document.confidenceScores;
      const pos = (scores.positive * 100).toFixed(2);
      const neg = (scores.negative * 100).toFixed(2);
      const neu = (scores.neutral * 100).toFixed(2);

      resultadoHTML += `
          <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
              <strong>Documento # ${document.id}</strong><br>
              <small style="color: #666; display: block; margin-bottom: 5px;">
                  Texto analizado: "${textoDelUsuario}"
              </small>
              
              <ul style="margin-top: 5px; padding-left: 20px;">
                  <li><strong>Positivo:</strong> ${pos}%</li>
                  <li><strong>Negativo:</strong> ${neg}%</li>
                  <li><strong>Neutral:</strong> ${neu}%</li>
              </ul>
          </div>`;
    });

    // Renderizar el resultado final en el contenedor de la interfaz
    contenedor.innerHTML = resultadoHTML;
  } catch (error) {
    contenedor.textContent = `Error: ${error.message}`;
  }
});
