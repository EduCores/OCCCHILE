# Matriz de animaciones · OCC Chile

Catálogo de todas las animaciones del sitio y plantilla para reutilizarlas.
Fuente de verdad: `styles.css` (los keyframes viven ahí; `app.js` solo alterna clases).
Los números de línea son aproximados y pueden moverse al editar.
Algunas reglas siguen en el CSS aunque su bloque HTML ya no esté en la página
(por ejemplo `.video-frame`); se conservan como estilo reutilizable.

**Convenciones del proyecto**

- Easing base: `--ease: cubic-bezier(.2, .8, .2, 1)`.
- Solo se anima `transform`, `opacity` o variables registradas con `@property` (corren en el compositor).
- Nunca animar `left`, `top`, `width` ni `box-shadow` en bucles largos (recalculan layout/paint).
- Todo bucle debe quedar desactivado en `@media (prefers-reduced-motion: reduce)` (bloques en las líneas ~848, ~959 y ~1200).
- Cada cambio en `styles.css` obliga a subir `styles.css?v=N` en `index.html`.

---

## 1. Animaciones ambientales (bucles suaves)

| Keyframe | Dónde se usa | Ritmo | Para qué |
|---|---|---|---|
| `heroFade` | `.hero__bg-img--2` | `16s ease-in-out infinite` | Crossfade del slider del hero |
| `drift` | `.aurora` | `18s ease-in-out infinite alternate` | Deriva del fondo aurora |
| `ping` | `.dot` | `2s infinite` | Pulso del indicador verde |
| `underline` | `.hero h1 em::after` | `1.2s .8s var(--ease) both` | Subrayado de entrada del título |
| `float` | `.hero__logo` | `4.5s ease-in-out infinite` | Logo flotando |
| `bob` | `.gift`, `.float-card`, `.cta__boxes span` | `4.5s / 6s / 5s ease-in-out infinite` | Flotación suave de tarjetas |
| `glow` | `.gift__glow` | `3s ease-in-out infinite` | Halo del regalo |
| `burst` | `.gift.is-open .gift__stars i` | `1.2s var(--ease) forwards` | Estrellas al abrir el regalo |
| `hint` | `.scroll-hint` | `2s infinite` | Flecha “baja” del hero |
| `marquee` | `.marquee__track` | `38s linear infinite` | Banda infinita de imágenes |
| `shimmer` | `.ai-badge` | `4s linear infinite` | Brillo del badge IA |
| `nudge` | `.compare__arrow [data-lucide]` | `1.6s infinite` | Flecha comparativa |
| `pulseDot` | `.chart-pulse-dot` | `2s infinite` | Punto “Sincronizado” de los gráficos |

## 2. Entradas y cambios de estado

| Keyframe | Dónde se usa | Ritmo | Para qué |
|---|---|---|---|
| `swap` | `.flows__panel.swap`, `.demo.is-active`, `.fp__list li`, `.fstep.is-active`, `.ac.is-open`, `.reply`, `.matches li`, `.ocr-table tr`, `.flag`, `.alerts li` | `.25s – .5s var(--ease)` | Aparición de contenido al cambiar de pestaña/paso |
| `pop` | `.boxes i` | `.3s var(--ease) both` | Cajas que aparecen en el OCR |
| `msg` | `.msg` | `.35s var(--ease) both` | Burbuja de chat |
| `typing` | `.typing i` | `1s infinite` | Puntos “escribiendo” |
| `flash` | `.cls dd.flash` | `.6s` | Resalta el valor clasificado |
| `shake` | `.field input.err` | `.35s` | Error de validación |
| `scan` | `.ocr-stage.is-scanning .scanline` | `1.8s ease-in-out 2` | Línea de escaneo OCR |
| `blink` | `.live i`, `.summary .caret` | `1s / .8s infinite` | Indicador “en vivo” y cursor |
| `belt` | `.belt` | `1s linear infinite` | Cinta transportadora |
| `travel` | `.cbox` | `5s linear forwards` | Caja que recorre la cinta |
| `draw` | `.forecast .draw` | `2s var(--ease) forwards` | Trazo SVG del pronóstico |

## 3. Aros “liquid glass” (variables `@property`)

Estos aros giran con un `conic-gradient` enmascarado. La animación solo mueve la variable de ángulo; el degradado se pinta en GPU.

| Keyframe | Dónde se usa | Ritmo | Variable |
|---|---|---|---|
| `pillRing` | `#viaje .pill::after` | `6s linear infinite` | `--pill-a` |
| `fabRing` | `.fab::before` | `6s linear infinite` | `--fab-a` |
| `htlRing` | `.htl__dot::after` | `6s linear infinite` | `--htl-a` |
| `tierraRing` | `.tierra-panel button::after` | `6s linear infinite` | `--tierra-a` |
| `lcRingDados` | `.chart-glass::after` | `8s linear infinite` | `--lc-a` |
| `lcRingVideo` | `.video-frame::after`, `.stat-card::after` | `6s linear infinite` | `--lc-a` |
| `fabPing` | `.fab--agent` | `2.4s infinite` | Anillo exterior (box-shadow) |

> `lcRingVideo` y `tierraRing` se anulan con `animation: none` en móvil / `prefers-reduced-motion`.

## 4. Recorridos y aviones

| Keyframe | Dónde se usa | Ritmo | Para qué |
|---|---|---|---|
| `htlCross` | `.htl__flight` | `32s linear infinite` | Cruce del avión del timeline con `translateX` |
| `htlFloat` | `.htl__flight img` | `6.5s ease-in-out infinite` | Flote del avión |
| `avionFlote` | `.tierra-avion` | `18s ease-in-out infinite` | Fases: planeo recto → viraje derecha → recto → viraje izquierda → cierre |
| `liveBump` | `[data-live="scan"].is-bump` | `.68s cubic-bezier(.2,.8,.3,1)` | “Bump” del contador en vivo |
| `bumpRise` | `.live-bump`, `.region-col__badge`, `.stat-badge` | `1.35s cubic-bezier(.22,.8,.28,1) forwards` | Sube y se desvanece |

---

## 5. Plantilla para una animación nueva

```css
/* 1) Keyframes: solo transform / opacity (o una variable @property). */
@keyframes miAnimacion {
  0%   { transform: translateY(0); }
  50%  { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

/* 2) Aplicación: duración + easing + iteración explícitos. */
.mi-elemento {
  animation: miAnimacion 3s var(--ease) infinite;
  will-change: transform; /* solo si el bucle es continuo */
}

/* 3) Accesibilidad: apagar el bucle. */
@media (prefers-reduced-motion: reduce) {
  .mi-elemento { animation: none; }
}
```

### Aro giratorio reutilizable

```css
@property --mi-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

.mi-aro { position: relative; }
.mi-aro::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;                       /* grosor del aro */
  background: conic-gradient(from var(--mi-a), #d61f3c, #f2b33d, #0aa63a, #d61f3c);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: miAro 6s linear infinite;
  pointer-events: none;
}
@keyframes miAro { to { --mi-a: 360deg; } }
```

### Checklist antes de publicar

1. ¿Anima solo `transform`, `opacity` o una variable `@property`?
2. ¿Tiene `animation: none` en `prefers-reduced-motion`?
3. ¿Se ve bien en tema claro y oscuro?
4. ¿Se subió `styles.css?v=N` en `index.html`?
5. ¿Se verificó en navegador real con Ctrl+F5?
