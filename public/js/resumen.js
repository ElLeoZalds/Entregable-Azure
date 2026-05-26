document.getElementById("btnEnviar").addEventListener("click", async () => {
  const contenedor = document.getElementById("resultado");
  const textoDelUsuario = document.getElementById("textoDelUsuario").value;

  // Validación: Comprobar que el campo de texto no esté vacío
  if (!textoDelUsuario.trim()) {
    contenedor.textContent =
      "Por favor, introduce un texto válido para resumir.";
    return;
  }

  try {
    contenedor.textContent = "Procesando y generando resumen...";

    // Obtener credenciales de la API interna para Language Service
    const configRes = await fetch("/api/config");
    if (!configRes.ok)
      throw new Error("No se pudo obtener la configuración del servidor.");
    const config = await configRes.json();

    const endpoint = config.languageEndpoint;
    const suscriptionKey = config.languageKey;

    // Configurar el endpoint para trabajos de análisis de texto (asíncrono)
    const url = `${endpoint}/language/analyze-text/jobs?api-version=2023-04-01`;

    // Paso 1 - Definir el cuerpo de la petición con la tarea de resumen extractivo
    const cuerpoPeticion = {
      displayName: "Resumen de texto de usuario",
      analysisInput: {
        documents: [
          {
            id: "1",
            language: "es",
            text: textoDelUsuario,
          },
        ],
      },
      tasks: [
        {
          kind: "ExtractiveSummarization", // Indica que queremos extraer frases clave
          taskName: "Resumen_Texto",
          parameters: { sentenceCount: 2 }, // Número de frases que queremos obtener
        },
      ],
    };

    // Paso 2 - Enviar el documento para iniciar el análisis
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": suscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cuerpoPeticion),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message);
    }

    // Obtener la URL de seguimiento para monitorear el estado del trabajo
    const urlSeguimiento = response.headers.get("operation-location");
    let resultadoFinal = null;

    // Paso 3 - Bucle de espera (Polling) hasta que Azure complete la tarea
    while (true) {
      const respuestaSeguimiento = await fetch(urlSeguimiento, {
        headers: { "Ocp-Apim-Subscription-Key": suscriptionKey },
      });

      resultadoFinal = await respuestaSeguimiento.json();

      if (resultadoFinal.status === "succeeded") break;
      if (resultadoFinal.status === "failed")
        throw new Error("El servidor no pudo procesar el resumen.");

      // Esperar 2 segundos antes de volver a consultar
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Paso 4 - Extraer los resultados finales del documento procesado
    const tareaFinalizada = resultadoFinal.tasks.items[0];
    const frasesResumen = tareaFinalizada.results.documents[0].sentences;

    if (!frasesResumen || frasesResumen.length === 0) {
      contenedor.innerHTML =
        "<p>No se pudo generar un resumen para el texto provisto.</p>";
      return;
    }

    // Estructurar la lista de resultados para mostrar en el DOM
    let resultadoHTML = "<h3>Resumen Generado:</h3><ul style='padding-left: 20px;'>";

    frasesResumen.forEach((frase) => {
      // Extraemos el score si existe, ideal para mostrar la relevancia de la frase
      const relevancia = frase.score ? ` — <small style="color: #666;">Relevancia: ${(frase.score * 100).toFixed(2)}%</small>` : "";

      resultadoHTML += `
                <li style="margin-bottom: 8px; line-height: 1.4;">
                    <span>${frase.text}</span>${relevancia}
                </li>`;
    });

    resultadoHTML += "</ul>";

    // Mostrar los datos extraídos en el contenedor de resultados
    contenedor.innerHTML = resultadoHTML;
  } catch (error) {
    contenedor.textContent = `Error: ${error.message}`;
  }
});
