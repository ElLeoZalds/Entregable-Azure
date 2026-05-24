const urlUsuario = document.getElementById('urlUsuario');
const imgPreview = document.getElementById('imgPreview');

// Actualizar la previsualización de la imagen en tiempo real mientras el usuario escribe
urlUsuario.addEventListener('input', () => {
    // Si el input se limpia, vuelve a la imagen por defecto
    imgPreview.src = urlUsuario.value.trim() || 'https://static.vecteezy.com/system/resources/thumbnails/079/131/527/small/thinking-woman-and-relax-with-coffee-at-house-for-peace-daydreaming-and-calm-morning-smile-female-person-and-caffeine-beverage-with-reflection-nostalgia-memory-and-perspective-for-weekend-break-photo.jpg';
});

document.getElementById('btnEnviar').addEventListener('click', async () => {
    const contenedor = document.getElementById('resultado');
    const imageURL = document.getElementById('urlUsuario').value;

    // Validación básica: evitar envíos sin una URL de imagen
    if (!imageURL.trim()) {
        contenedor.textContent = "Por favor, introduce una URL de imagen válida.";
        return;
    }

    try {
        contenedor.textContent = "Analizando imagen...";

        // Recuperar parámetros de conexión desde la API de configuración interna
        const configRes = await fetch('/api/config');
        if (!configRes.ok) throw new Error("No se pudo obtener la configuración del servidor.");
        const config = await configRes.json();

        const endpoint = config.visionEndpoint;
        const suscriptionKey = config.visionKey;
        
        // Definir los rasgos visuales que queremos extraer (Categorías, Descripción y Colores)
        const url = `${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Color`;

        // Petición a Azure Computer Vision pasando la URL de la imagen en formato JSON
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

        // Procesamiento de la respuesta exitosa
        const data = await response.json();
        
        // Calcular porcentaje de confianza basado en la primera descripción (caption) devuelta
        const confianza = (data.description.captions[0].confidence * 100).toFixed(2);

        // Estructurar el texto de salida con la información principal
        let resultadoHTML = "";
        resultadoHTML += `Descripción: ${data.description.captions[0].text}\n`;
        resultadoHTML += `Etiquetas: ${data.description.tags.join(", ")}\n`;
        resultadoHTML += `Confianza: ${confianza} %`;

        // Mostrar los datos extraídos en el contenedor de resultados
        contenedor.textContent = resultadoHTML;

    } catch (error) {
        contenedor.textContent = `Error: ${error.message}`;
    }
});