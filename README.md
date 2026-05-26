# Entregable - Azure AI

Este proyecto es una aplicacion web para probar varias funciones de Inteligencia Artificial usando los servicios de Azure AI y Azure OpenAI Foundry.

---

## Que hace esta app

El proyecto esta dividido en dos grandes bloques:

### Azure AI Services (Varios servicios en una sola cuenta)

- Deteccion (deteccion.html): Averigua en que idioma esta un texto.
- Extraccion (extraccion.html): Saca palabras clave, nombres y datos importantes.
- Sentimientos (sentimientos.html): Analiza si el texto es positivo, negativo o neutro.
- Resumen (resumen.html): Achica textos largos para que se lean rapido.
- OCR (ocr.html): Lee el texto que haya dentro de una imagen.
- Imagen (imagen.html): Genera imagenes desde cero con un texto (Prompt).

### Azure OpenAI Foundry

- ChatGPT (chatgpt.html): Un chat inteligente para conversar con los modelos de OpenAI.

---

## Archivos del proyecto

```text
.
├── public/                  # Todo el Frontend
│   ├── css/
│   │   └── estilos.css      # El diseño de la app
│   ├── js/                  # La logica de cada modulo
│   │   ├── chatgpt.js
│   │   ├── componentes.js
│   │   ├── deteccion.js
│   │   ├── extraccion.js
│   │   ├── imagen.js
│   │   ├── ocr.js
│   │   ├── resumen.js
│   │   └── sentimientos.js
│   ├── index.html           # El menu principal
│   └── [los-modulos].html   # Las pantallas de cada servicio
├── server.js                # Servidor Backend (Node + Express)
├── .env                     # Tus claves secretas
├── .env.example             # Plantilla para saber que claves poner
├── package.json             # Dependencias del proyecto
└── README.md                # Esta guia
```

## Como ponerlo en marcha

Clonar el repositorio:

```Bash
   git clone [https://github.com/ElLeoZalds/Entregable-Azure](https://github.com/ElLeoZalds/Entregable-Azure)
   cd Entregable-Azure
```

## Instalar dependencias:

```Bash
npm install
```

## Configurar las credenciales:
Copia el archivo de ejemplo para crear tu archivo de configuracion:

```Bash
cp .env.example .env
```

Abre el archivo .env y pega tus llaves y endpoints. Estas keys se obtienen desde el portal de Azure (portal.azure.com), buscando tus recursos de Azure AI y Azure OpenAI.

Fragmento de código
```
AZURE_LANGUAGE_KEY=tu_clave_multi_servicio
AZURE_LANGUAGE_ENDPOINT=https://vision-1548372.cognitiveservices.azure.com/

AZURE_OPENAI_KEY=tu_clave_de_openai_en_foundry
AZURE_OPENAI_ENDPOINT=https://tu-recurso-openai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=nombre_del_modelo_desplegado_ej_gpt4
AZURE_OPENAI_API_VERSION=2024-12-01-preview
```

## Iniciar el servidor:

```Bash
node server.js
```

## Probar la app:
Abre en tu navegador la direccion: http://localhost:3000