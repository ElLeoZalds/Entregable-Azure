// Variable GLOBAL en memoria para retener la conversación mientras no se recargue la página
let historialConversacion = [];

document.getElementById('btnEnviar').addEventListener('click', async () => {
    const contenedor = document.getElementById('resultado');
    const selectHistorial = document.getElementById('historial');
    const textoDelUsuario = document.getElementById('textoUsuario').value;

    // 1. Validación básica
    if (!textoDelUsuario.trim()) {
        contenedor.innerHTML = `<p class="mensaje-estado">Por favor, escriba una pregunta para la IA.</p>`;
        return;
    }

    try {
        contenedor.innerHTML = `<p class="mensaje-estado">Pensando... Conectando con Azure OpenAI...</p>`;

        // 2. Obtener credenciales de tu API interna (Ajustado a tus variables reales)
        const configRes = await fetch('/api/config');
        if (!configRes.ok) throw new Error("No se pudo obtener la configuración del servidor.");
        const config = await configRes.json();

        // Extraemos las variables correctas desde tu objeto de configuración
        const endpoint = config.openAiEndpoint;
        const apiKey = config.openAiKey;
        const deployment = config.openAiDeployment || "gpt-4o"; 
        const apiVersion = config.openAiVersion || "2024-02-15-preview";

        // URL construida dinámicamente con la configuración del backend
        const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        // 3. Construcción del BODY incluyendo el historial acumulado en memoria
        const body = {
            messages: [
                { role: "system", content: "Eres un asistente útil de Azure AI." },
                ...historialConversacion, // Injectamos todo lo que se ha hablado antes
                { role: "user", content: textoDelUsuario }
            ],
            max_completion_tokens: 800,
            temperature: 0.7
        };

        // 4. Petición HTTP a Azure
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

        // 5. Renderizar el resultado en el contenedor principal
        contenedor.innerHTML = `
            <p style="color: var(--accent-color); font-weight: bold; margin-bottom: 5px;">Respuesta de Azure:</p>
            <div style="line-height: 1.5; color: var(--text-dark);">${mensajeIA.content}</div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <p class="mensaje-estado" style="font-size: 0.85rem;">Tokens usados en esta interacción: ${data.usage.total_tokens}</p>
        `;

        // 6. ALIMENTAR EL HISTORIAL: Agregamos la interacción al array global
        historialConversacion.push({ role: 'user', content: textoDelUsuario });
        historialConversacion.push(mensajeIA);

        // 7. ACTUALIZAR LA VISTA (El componente <select> a la derecha)
        const nuevaOpcion = document.createElement('option');
        // Cortamos el texto si es demasiado largo para que quepa bien en la columna derecha
        nuevaOpcion.text = textoDelUsuario.length > 30 ? textoDelUsuario.substring(0, 30) + '...' : textoDelUsuario;
        nuevaOpcion.value = textoDelUsuario;
        selectHistorial.appendChild(nuevaOpcion);

        // Limpiamos el textarea para la siguiente pregunta
        document.getElementById('textoUsuario').value = "";

    } catch (error) {
        contenedor.innerHTML = `<p class="mensaje-estado" style="color: #ef4444;">❌ Error: ${error.message}</p>`;
    }
});