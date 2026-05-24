const urlUsuario = document.getElementById('urlUsuario');
const imgPreview = document.getElementById('imgPreview');

// Actualización dinámica de la previsualización al detectar cambios en el input
urlUsuario.addEventListener('input', () => {
    // Si el input está vacío, carga una imagen de ejemplo por defecto
    imgPreview.src = urlUsuario.value.trim() || 'https://image.slidesharecdn.com/eleditorial-220301120619/95/El-editorial-3-638.jpg';
});

document.getElementById('btnEnviar').addEventListener('click', async () => {
    const contenedor = document.getElementById('resultado');
    const imageURL = document.getElementById('urlUsuario').value;

    // Validación: El campo de URL no debe estar vacío
    if (!imageURL.trim()) {
        contenedor.textContent = "Por favor, introduce una URL válida.";
        return;
    }

    try {
        contenedor.textContent = "Enviando imagen a Azure...";

        // Obtener configuración del servidor (endpoint y claves de API)
        const configRes = await fetch('/api/config');
        if (!configRes.ok) throw new Error("No se pudo obtener la configuración del servidor.");
        const config = await configRes.json();

        const endpoint = config.visionEndpoint;
        const suscriptionKey = config.visionKey;
        
        // Paso 1: Iniciar la operación de lectura (asíncrona)
        const url = `${endpoint}/vision/v3.2/read/analyze`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Ocp-Apim-Subscription-Key": suscriptionKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: imageURL })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error en: ${errorData.error.message}`);
        }

        // Recuperar la URL de la operación para consultar el estado del proceso
        const operationLocation = response.headers.get("operation-location");
        contenedor.textContent = "Procesando... esperando resultados de lectura.";

        // Paso 2: Polling (consultar repetidamente hasta que el análisis termine)
        let result = null;
        while (true) {
            const checkResponse = await fetch(operationLocation, {
                headers: { "Ocp-Apim-Subscription-Key": suscriptionKey }
            });

            result = await checkResponse.json();

            // Si el estado es exitoso o fallido, salimos del bucle
            if (result.status === "succeeded") break;
            if (result.status === "failed") throw new Error('Error analizando datos...');

            // Pausa de 1 segundo antes de volver a intentar
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Paso 3: Extraer y formatear los resultados obtenidos
        const readResults = result.analyzeResult.readResults;
        if (!readResults || readResults.length === 0) {
            contenedor.innerHTML = "<p>No se encontró texto en el documento.</p>";
            return;
        }

        let resultadoHTML = "<h3>Texto Extraído:</h3><div style='background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; text-align: left; line-height: 1.6;'>";

        // Iterar sobre las páginas y líneas detectadas por el motor de OCR
        readResults.forEach(page => {
            page.lines.forEach(line => {
                resultadoHTML += `<p style='margin: 0 0 8px 0;'>${line.text}</p>`;
            });
        });

        resultadoHTML += "</div>";
        contenedor.innerHTML = resultadoHTML;

    } catch (error) {
        contenedor.textContent = `Error: ${error.message}`;
    }
});