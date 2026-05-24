// Variable global para mantener la memoria de la charla
let historialConversacion = [];

document.getElementById('btnEnviar').addEventListener('click', async () => {
    const contenedor = document.getElementById('resultado');
    const selectHistorial = document.getElementById('historial');
    const textoDelUsuario = document.getElementById('textoUsuario').value;

    // Validación de entrada vacía
    if (!textoDelUsuario.trim()) {
        contenedor.innerHTML = `<p class="mensaje-estado">Por favor, escriba una pregunta para la IA.</p>`;
        return;
    }

    try {
        contenedor.innerHTML = `<p class="mensaje-estado">Pensando... Conectando con Azure OpenAI...</p>`;

        // Obtener credenciales y configuración desde la API interna
        const configRes = await fetch('/api/config');
        if (!configRes.ok) throw new Error("No se pudo obtener la configuración del servidor.");
        const config = await configRes.json();

        const endpoint = config.openAiEndpoint;
        const apiKey = config.openAiKey;
        const deployment = config.openAiDeployment || "gpt-4o"; 
        const apiVersion = config.openAiVersion || "2024-02-15-preview";

        // Construcción de la URL para el despliegue específico en Azure
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        // Definición del cuerpo de la petición incluyendo el historial (contexto)
        const body = {
            messages: [
                { role: "system", content: "Eres un asistente útil de Azure AI." },
                ...historialConversacion, // Inyectamos la memoria previa de la conversación
                { role: "user", content: textoDelUsuario }
            ],
            max_completion_tokens: 800,
            temperature: 0.7
        };

        // Realizar la llamada al servicio de OpenAI
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
                'api-key': apiKey
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error('No se pudo obtener respuesta del servicio de Azure');
        
        const data = await response.json();
        const mensajeIA = data.choices[0].message;

        // Renderizar la respuesta y los metadatos (tokens) en el contenedor
        contenedor.innerHTML = `
            <p style="color: var(--accent-color); font-weight: bold; margin-bottom: 5px;">Respuesta de Azure:</p>
            <div style="line-height: 1.5; color: var(--text-dark);">${mensajeIA.content}</div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <p class="mensaje-estado" style="font-size: 0.85rem;">Tokens usados en esta interacción: ${data.usage.total_tokens}</p>
        `;

        // Actualizar el historial local para futuras preguntas
        historialConversacion.push({ role: 'user', content: textoDelUsuario });
        historialConversacion.push(mensajeIA);

        // Agregar la consulta actual al elemento visual de historial (select)
        const nuevaOpcion = document.createElement('option');
        nuevaOpcion.text = textoDelUsuario.length > 30 ? textoDelUsuario.substring(0, 30) + '...' : textoDelUsuario;
        nuevaOpcion.value = textoDelUsuario;
        selectHistorial.appendChild(nuevaOpcion);

        // Limpiar el área de texto para la siguiente consulta
        document.getElementById('textoUsuario').value = "";

    } catch (error) {
        contenedor.textContent = `Error: ${error.message}`;
    }
});