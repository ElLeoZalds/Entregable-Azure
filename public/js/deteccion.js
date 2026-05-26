const urlUsuario = document.getElementById("urlUsuario");
const imgPreview = document.getElementById("imgPreview");

// Escuchar cambios en el input para actualizar la previsualización de la imagen
urlUsuario.addEventListener("input", () => {
  // Si el input está vacío, se muestra una imagen por defecto
  imgPreview.src =
    urlUsuario.value.trim() ||
    "https://static.vecteezy.com/system/resources/previews/035/846/121/non_2x/man-job-entrepreneur-sitting-work-manager-office-modern-person-adult-smart-computer-desk-portrait-photo.jpg";
});

document.getElementById("btnEnviar").addEventListener("click", async () => {
  const contenedor = document.getElementById("resultado");
  const imageURL = document.getElementById("urlUsuario").value;

  // Validación: comprobar que el usuario haya ingresado una URL
  if (!imageURL.trim()) {
    contenedor.textContent = "Por favor, introduce una URL de imagen válida.";
    return;
  }

  try {
    contenedor.textContent = "Detectando objetos...";

    // Obtener credenciales de Azure Computer Vision desde el servidor
    const configRes = await fetch("/api/config");
    if (!configRes.ok)
      throw new Error("No se pudo obtener la configuración del servidor.");
    const config = await configRes.json();

    const endpoint = config.languageEndpoint;
    const suscriptionKey = config.languageKey;

    // Construir URL del servicio especificando la funcionalidad de detección de objetos
    const url = `${endpoint}/vision/v3.2/analyze?visualFeatures=Objects`;

    // Realizar la petición POST enviando la URL de la imagen en el cuerpo
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": suscriptionKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: imageURL }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en: ${errorData.error.message}`);
    }

    const data = await response.json();

    // Validar si Azure encontró objetos en la imagen procesada
    if (!data.objects || data.objects.length === 0) {
      contenedor.innerHTML = "<p>No se detectaron objetos en esta imagen.</p>";
      return;
    }

    // Estructurar la lista de resultados para mostrar en el DOM
    let resultadoHTML = "<h3>Objetos Detectados:</h3><ul>";

    data.objects.forEach((obj) => {
      const confidence = (obj.confidence * 100).toFixed(2);
      const rect = obj.rectangle; // Coordenadas y dimensiones del objeto

      resultadoHTML += `
                <li>
                    <strong>${obj.object}</strong> — Confianza: ${confidence}%<br>
                    <small style="color: #666;">
                        Ubicación: Inicio (${rect.x}px, ${rect.y}px) | Dimensiones: ${rect.w}x ancho por ${rect.h}y alto
                    </small>
                </li>`;
    });

    resultadoHTML += "</ul>";
    contenedor.innerHTML = resultadoHTML;
  } catch (error) {
    contenedor.textContent = `Error: ${error.message}`;
  }
});
