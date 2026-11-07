# OCC Chile · Plataforma IA — Guía del proyecto

Sitio estático de una sola página (prototipo conceptual). Sin build, sin frameworks: HTML + CSS + JS planos.

## Archivos

| Archivo | Rol |
|---|---|
| `index.html` | Todo el markup. Una sola página con secciones por ancla (`#inicio`, `#procesos`, `#flujos`, `#demos`, `#arquitectura`, `#viaje`, `#stats`, `#roadmap`, `#contacto`). |
| `styles.css` | Todos los estilos, incluidos temas claro/oscuro y responsive. |
| `app.js` | Interacciones: hero, contadores, odómetro, tema, reveal, demos. |
| `img/` | Imágenes y mascotas del sitio. |

## Reglas de trabajo

1. **Idioma:** todo el contenido y los textos de interfaz van en **español**.
2. **Cache busting obligatorio:** cada cambio en `styles.css` o `app.js` debe subir el `?v=N` correspondiente en `index.html` (`styles.css?v=N`, `app.js?v=N`). Si no se sube, el navegador sirve la versión vieja.
3. **Verificar en navegador real**, no solo leyendo el archivo. El usuario se ha quejado varias veces de "los cambios no se aplican".
4. **No pisar ediciones del usuario:** leer el archivo antes de editar y usar reemplazos quirúrgicos.
5. **Tema:** el switch claro/oscuro está activo (`auto` + `localStorage` + toggle). Cualquier color nuevo debe considerar ambos temas o justificar por qué es fijo.
6. **Botones flotantes** (WhatsApp y Asistente OCC) son **mock**: no tienen funcionalidad real, solo tooltip "Próximamente".

---

# Sistema de botones principales · "Liquid Glass"

**Decisión vigente:** todos los **botones principales** del sitio usan este acabado. No inventar estilos de botón nuevos ni usar botones planos para acciones principales.

Fuente de verdad en `styles.css`: bloque `/* ===== Botones "liquid glass" ... ===== */` (clase `.btn--lc`).

## Anatomía

1. **Degradado 135°** de dos tonos como fondo.
2. **Brillo de vidrio** superior (`::before`): `radial-gradient` blanca al 55 % arriba-izquierda + velo blanco al 22 % que se desvanece al 48 %.
3. **Sombras internas 3D:**
   - `inset 0 3px 3px rgba(0,0,0,.16)` (sombra superior)
   - `inset 0 -4px 5px var(--*-hi)` (luz inferior)
   - `inset 0 0 2px 4px var(--*-hi-soft)` (relleno interior)
4. **Glow exterior** en el color del botón (`0 10px 18px -8px var(--*-glow)`).
5. **Aro giratorio** (`::after`): `conic-gradient` de 2 px con los colores del propio botón, enmascarado con `mask-composite: exclude`, animado con `@property` de ángulo a 6 s lineales.
6. **Icono** por encima (`z-index: 3`) con `drop-shadow`; texto con `text-shadow` sutil.

## Paletas

| Variante | Uso | g1 | g2 | hi | hi-soft | glow |
|---|---|---|---|---|---|---|
| **primary** (rojo) | acción principal | `#d61f3c` | `#b3122e` | `rgba(226,74,96,.62)` | `rgba(226,74,96,.34)` | `rgba(179,18,46,.75)` |
| **ghost** (verde) | acción secundaria | `#0aa63a` / `#25d366` | `#047526` / `#0e8f43` | `rgba(52,196,100,.55)` | `rgba(52,196,100,.30)` | `rgba(4,117,38,.70)` |
| **light** (crema) | sobre fondo oscuro | `#ffffff` | `#f1e7d6` | `rgba(255,255,255,.9)` | `rgba(255,255,255,.55)` | `rgba(60,20,10,.35)` |
| **outline-light** (cristal) | secundaria sobre fondo oscuro | `rgba(255,255,255,.34)` | `rgba(255,255,255,.12)` | `rgba(255,255,255,.45)` | `rgba(255,255,255,.18)` | `rgba(0,0,0,.45)` |

- El verde "ghost" de botones usa `#0aa63a → #047526`.
- El WhatsApp flotante usa su propio verde `#25d366 → #0e8f43` sobre el mismo sistema.

## Componentes que ya lo usan

| Elemento | Clase / selector | Paleta |
|---|---|---|
| Todos los `.btn` del sitio (13) | `.btn--lc` | según variante |
| "Quiero Participar", "Ser parte", "Siguiente", "Procesar con OCR", enviar chat | `.btn.btn--primary.btn--lc` | primary |
| "Explorar Rutas", "Atrás", "Autollenar demo", "Subir mi foto", "Nuevos puntos", "Generar" | `.btn.btn--ghost.btn--lc` | ghost |
| "Recorrer demos" (CTA final) | `.btn.btn--light.btn--lc` | light |
| "Ver fases" (CTA final) | `.btn.btn--outline-light.btn--lc` | outline-light |
| Puntos del timeline | `.htl__dot` (impar/par) | primary / ghost |
| Asistente OCC flotante | `.fab--agent` | primary |
| WhatsApp flotante | `.fab--wa` | verde WhatsApp |

## Medidas de referencia

- Botones: radio `10px` (`--lc-r`), anillo `clamp(1px,.09em,3px)`.
- Puntos del timeline: 58 × 58 px, radio 999 px, icono 26 px, aro de 2 px.
- Flotantes: 66 × 66 px, icono 30 px (móvil ≤600 px: 58 px / icono 26 px).

## Accesibilidad

- `@media (prefers-reduced-motion: reduce)` desactiva animaciones globalmente; la banda del avión (`.htl__sky`) se oculta.
- Mantener contraste del icono/texto sobre el vidrio: crema `#ece6d9` o blanco.

## Cómo aplicar a un botón nuevo

```html
<a href="#destino" class="btn btn--primary btn--lc"><i data-lucide="icono"></i> Texto</a>
```

Para variantes no cubiertas, reutilizar las variables del componente (`--lc-g1`, `--lc-g2`, `--lc-hi`, `--lc-hi-soft`, `--lc-glow`) en vez de duplicar gradientes y sombras a mano.

---

# Otros acuerdos visuales

- **`#viaje`**: fondo fijo `#b9ceb9` (verde salvia), incluso en tema oscuro.
- **Footer**: 3 columnas de links en verde del sitio (`var(--ok-ink)` → `#1a6b52` claro / `#7ee2b4` oscuro) + barra inferior roja (`linear-gradient(135deg, var(--red-2), var(--red))`). Padding derecho de 110 px en la barra para no chocar con los flotantes.
- **Marquee**: la banda inclinada (`rotate(-1.2deg)`) va con `position: relative; z-index: 2` y la sección `#viaje` se sube por debajo con un margen negativo proporcional al ancho (`--viaje-solape: 14px + 1.05vw`), compensado con `padding-top` para no mover el contenido. Así el fondo salvia tapa el hueco que deja la rotación y no se ve el fondo del body.
- **Timeline**: todos los puntos en una fila (`top: 29px`), tarjetas debajo (`padding-top: 84px`), línea alineada al centro de los puntos. Punto y tarjeta de cada paso comparten la paleta liquid glass (impar rojo, par verde). El encabezado de la sección (“Paso a paso” + título) va centrado (`#viaje .section__head`).
- **Stats (`#stats`)**: van **después del footer**, al final de la página, con `padding-bottom` amplio (200 px desktop / 160 px móvil) para que los botones flotantes no tapen las tarjetas al llegar al final.
- **Avión decorativo**: `img/mascota_avion_4.png` (PNG con fondo 100 % transparente) cruza **toda la ventana** de izquierda a derecha en bucle continuo: arranca fuera del layout por la izquierda, sale por la derecha y vuelve a entrar al instante por la izquierda. La banda `.htl__sky` mide `100vw` y `#viaje` la recorta con `overflow-x: clip`; el ancho del avión es `--plane-w: clamp(104px, 13vw, 156px)`. Flota con `htlFloat` (6,5 s).
- **Badges del hero**: rampa rojo → naranja → ámbar → oliva → verde; emergen centrados sobre el icono de la caja; colores por `[data-step]` en CSS para soportar tema oscuro.
- **Títulos de sección**: la clase `section-title--pine` en el `h2` fija `#0f4d3a` en ambos temas; su `<em>` conserva el rojo del sitio (`var(--red)`). Uso actual: “El viaje de una cajita”. No se aplica a los títulos del hero/slider.
- **Texto con efecto glass**: `span.title-glass-text` aplica el degradado verde del sistema recortado en las letras (`background-clip: text` + `drop-shadow`), sin pastilla. Usado en “El viaje de una”. Tiene fallback para `forced-colors`.
