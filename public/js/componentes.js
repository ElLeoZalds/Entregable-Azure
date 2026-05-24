document.addEventListener("DOMContentLoaded", () => {
    const ruta = window.location.pathname;
    const paginaActual = ruta.split("/").pop();

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
            </ul>
        </div>
    `;

    document.body.insertAdjacentHTML("afterbegin", sidebarHTML);

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
    }
}); 