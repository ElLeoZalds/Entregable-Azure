document.addEventListener("DOMContentLoaded", () => {
  const ruta = window.location.pathname;
  const paginaActual = ruta.split("/").pop();

  // 1. Inyectar el Sidebar al principio del body
  const sidebarHTML = `
        <div class="sidebar">
            <div class="brand">localhost:3000</div>
            <div class="sub-brand">Azure AI Services Workspace</div>
            <hr style="width:100%; border:0; border-top:1px solid #334155; margin-bottom:25px;">
            <ul>
                <li><a href="index.html" id="nav-inicio">Presentación General</a></li>
                <li style="margin-top: 15px; font-size: 0.8rem; color: #64748b; padding-left: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Servicios</li>
                <li><a href="extraccion.html" id="nav-extraccion">Extracción de Entidades</a></li>
                <li><a href="sentimientos.html" id="nav-sentimientos">Análisis de Sentimientos</a></li>
                <li><a href="imagen.html" id="nav-imagen">Análisis de Imagen</a></li>
                <li><a href="chatgpt.html" id="nav-chatgpt">Chatgpt</a></li>
                <li><a href="deteccion.html" id="nav-deteccion">Detección de Imagen</a></li>
                <li><a href="resumen.html" id="nav-resumen">Resumen de Texto</a></li>
                <li><a href="ocr.html" id="nav-ocr">Lectura de Texto (OCR)</a></li>
            </ul>
        </div>
    `;
  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);

  // 2. Inyectar el Chat Flotante al final del body
  const chatHTML = `
        <button id="chat-flotante-btn" id="btn-toggle-chat">💬</button>
        <div id="ventana-chat" class="chat-oculto">
          <div class="chat-header">
            <span>Asistente Azure Fine-Tune</span>
            <button id="btn-cerrar-chat">X</button>
          </div>
          <div id="chat-mensajes" class="chat-mensajes">
            <p class="mensaje-sistema">Hola!, soy tu modelo entrenado en Azure AI. ¿En qué te puedo ayudar hoy?</p>
          </div>
          <div class="chat-input-area">
            <input type="text" id="chat-input-texto" placeholder="Escribe un mensaje...">
            <button id="btn-enviar-chat">Enviar</button>
          </div>
        </div>
    `;
  document.body.insertAdjacentHTML("beforeend", chatHTML);

  // 3. Manejar estados activos del Sidebar
  if (paginaActual === "index.html" || paginaActual === "" || ruta === "/") {
    document.getElementById("nav-inicio")?.classList.add("active");
  } else if (paginaActual === "extraccion.html") {
    document.getElementById("nav-extraccion")?.classList.add("active");
  } else if (paginaActual === "sentimientos.html") {
    document.getElementById("nav-sentimientos")?.classList.add("active");
  } else if (paginaActual === "imagen.html") {
    document.getElementById("nav-imagen")?.classList.add("active");
  } else if (paginaActual === "chatgpt.html") {
    document.getElementById("nav-chatgpt")?.classList.add("active");
  } else if (paginaActual === "deteccion.html") {
    document.getElementById("nav-deteccion")?.classList.add("active");
  } else if (paginaActual === "resumen.html") {
    document.getElementById("nav-resumen")?.classList.add("active");
  } else if (paginaActual === "ocr.html") {
    document.getElementById("nav-ocr")?.classList.add("active");
  }

  // 4. Listeners para controlar la interfaz del Chat
  document
    .getElementById("chat-flotante-btn")
    .addEventListener("click", toggleChat);
  document
    .getElementById("btn-cerrar-chat")
    .addEventListener("click", toggleChat);
  document
    .getElementById("btn-enviar-chat")
    .addEventListener("click", enviarMensajeChat);
  document
    .getElementById("chat-input-texto")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") enviarMensajeChat();
    });
});

let historialFlotante = [];

function toggleChat() {
  const chat = document.getElementById("ventana-chat");
  chat.classList.toggle("chat-oculto");
}

async function enviarMensajeChat() {
  const input = document.getElementById("chat-input-texto");
  const texto = input.value.trim();

  if (!texto) return;

  const contenedorMensajes = document.getElementById("chat-mensajes");

  // Añadir mensaje del usuario
  const pUsuario = document.createElement("p");
  pUsuario.className = "mensaje-usuario";
  pUsuario.textContent = texto;
  contenedorMensajes.appendChild(pUsuario);

  input.value = "";
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;

  // Mensaje temporal de carga
  const pIA = document.createElement("p");
  pIA.className = "mensaje-ia";
  pIA.textContent = "Pensando...";
  contenedorMensajes.appendChild(pIA);
  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;

  try {
    const configRes = await fetch("/api/config");
    if (!configRes.ok) throw new Error("Error al consultar la configuracion.");
    const config = await configRes.json();

    const endpoint = config.openFineTuneEndpoint;
    const apiKey = config.openFineTuneKey;
    const deployment = config.openFineTuneDeployment || "tu-modelo-fine-tuned";
    const apiVersion = config.openFineTuneVersion || "2024-02-15-preview";

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const body = {
      messages: [
        {
          role: "system",
          content:
            "Eres un modelo de Azure AI entrenado mediante Fine-Tuning para asistir a Leo.",
        },
        ...historialFlotante,
        { role: "user", content: texto },
      ],
      max_completion_tokens: 500,
      temperature: 0.5,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error("Sin respuesta del servicio Fine-Tuned.");

    const data = await response.json();
    const mensajeIA = data.choices[0].message;

    pIA.textContent = mensajeIA.content;

    historialFlotante.push({ role: "user", content: texto });
    historialFlotante.push(mensajeIA);
  } catch (error) {
    pIA.textContent = "Error: No se pudo conectar con tu modelo personalizado.";
    console.error(error);
  }

  contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}
