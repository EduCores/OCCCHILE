/**
 * OCC Chile · Validador preventivo de integridad
 * Ejecutar con: node validate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
let hasErrors = false;

const HTML_FILES = [
  'index.html',
  'quienes-somos.html',
  'mision-e-historia.html',
  'videos.html',
  'admin.html',
];
const PUBLIC_HTML_FILES = HTML_FILES.filter(f => f !== 'admin.html');
const CSS_FILES = ['styles.css', 'admin.css'];
const JS_FILES = ['app.js', 'admin.js'];

function error(msg) {
  console.error("❌ ERROR:", msg);
  hasErrors = true;
}

function success(msg) {
  console.log("✅ OK:", msg);
}

// 1. Validador de jerarquía y balance de etiquetas HTML
function validateHtmlTree(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) {
    error(`Archivo no encontrado: ${filename}`);
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
  let match;
  const stack = [];
  const selfClosing = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img',
    'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  let line = 1, lastIndex = 0;
  const tagErrors = [];

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');
    const isSelf = fullTag.endsWith('/>') || selfClosing.has(tagName);

    const prefix = html.substring(lastIndex, match.index);
    line += (prefix.match(/\n/g) || []).length;
    lastIndex = match.index;

    if (isSelf) continue;

    if (!isClosing) {
      stack.push({ tag: tagName, line });
    } else {
      if (stack.length === 0) {
        tagErrors.push(`Línea ${line}: Cierre inesperado </${tagName}> sin apertura.`);
      } else {
        const top = stack.pop();
        if (top.tag !== tagName) {
          tagErrors.push(`Línea ${line}: Etiqueta <${top.tag}> (abierta en L${top.line}) cerrada incorrectamente con </${tagName}>.`);
        }
      }
    }
  }

  while (stack.length > 0) {
    const unclosed = stack.pop();
    tagErrors.push(`Línea ${unclosed.line}: Etiqueta <${unclosed.tag}> nunca se cerró.`);
  }

  if (tagErrors.length > 0) {
    tagErrors.forEach(e => error(`${filename} -> ${e}`));
  } else {
    success(`${filename} -> Árbol DOM balanceado (0 errores de etiquetas).`);
  }
}

// 2. Validador de codificación UTF-8 / Mojibake
function validateEncoding(files) {
  const suspicious = [/Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã‘|â€|â€“|â€”|Â|àš/g];
  for (const f of files) {
    const filePath = path.join(root, f);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    let count = 0;
    for (const regex of suspicious) {
      const m = content.match(regex);
      if (m) count += m.length;
    }
    if (count > 0) {
      error(`${f} -> ${count} secuencias de mojibake / UTF-8 corrupto detectadas.`);
    } else {
      success(`${f} -> Codificación UTF-8 limpia (0 mojibake).`);
    }
  }
}

// 3. Validador de sintaxis JavaScript
function validateJsSyntax(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    success(`${filename} -> Sintaxis JS válida.`);
  } catch (err) {
    error(`${filename} -> Error de sintaxis JS:\n${err.stderr.toString()}`);
  }
}

// 4. Validador de sintaxis CSS (balance de llaves)
function validateCss(filename) {
  const filePath = path.join(root, filename);
  if (!fs.existsSync(filePath)) return;
  const css = fs.readFileSync(filePath, 'utf8');

  let open = 0, close = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') open++;
    if (css[i] === '}') close++;
  }
  if (open !== close) {
    error(`${filename} -> Desbalance de llaves: ${open} aperturas vs ${close} cierres.`);
  } else {
    success(`${filename} -> Balance de llaves CSS correcto (${open} bloques).`);
  }
}

// 5. Validador de enlaces internos, imágenes existentes y cache-busting sincronizado
function validateLinksAssetsAndVersions() {
  const idsByFile = {};
  const htmlByFile = {};

  for (const f of HTML_FILES) {
    const html = fs.readFileSync(path.join(root, f), 'utf8');
    htmlByFile[f] = html;
    idsByFile[f] = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  }

  // Enlaces internos + imágenes
  for (const f of HTML_FILES) {
    const html = htmlByFile[f];
    const brokenLinks = [];
    const missingImgs = [];

    for (const m of html.matchAll(/\bhref="([^"]+)"/g)) {
      const h = m[1];
      if (/^(https?:|mailto:|tel:|javascript:)/.test(h)) continue;
      if (h === '#') {
        brokenLinks.push('#');
        continue;
      }
      if (h.startsWith('#')) {
        if (!idsByFile[f].has(h.slice(1))) brokenLinks.push(h);
      } else if (/\.html(#|$)/.test(h)) {
        const [fp, hash] = h.split('#');
        if (!fs.existsSync(path.join(root, fp))) brokenLinks.push(`${h} (archivo ausente)`);
        else if (hash && idsByFile[fp] && !idsByFile[fp].has(hash)) brokenLinks.push(`${h} (ancla ausente)`);
      }
    }

    for (const m of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
      const src = m[1].split('?')[0];
      if (/^(https?:|data:)/.test(src)) continue;
      if (!fs.existsSync(path.join(root, src))) missingImgs.push(src);
    }

    if (brokenLinks.length) error(`${f} -> Enlaces internos rotos: ${[...new Set(brokenLinks)].join(', ')}`);
    else success(`${f} -> 0 enlaces internos rotos.`);

    if (missingImgs.length) error(`${f} -> Imágenes faltantes: ${[...new Set(missingImgs)].join(', ')}`);
    else success(`${f} -> Todas las imágenes locales existen.`);
  }

  // Sincronía de cache busting
  const cssVersions = new Map();
  const jsVersions = new Map();

  for (const f of HTML_FILES) {
    const html = htmlByFile[f];
    const cssV = (html.match(/styles\.css\?v=(\d+)/) || [])[1];
    if (!cssV) error(`${f} -> styles.css sin versión ?v=N`);
    else cssVersions.set(f, cssV);

    if (PUBLIC_HTML_FILES.includes(f)) {
      const jsV = (html.match(/app\.js\?v=(\d+)/) || [])[1];
      if (!jsV) error(`${f} -> app.js sin versión ?v=N`);
      else jsVersions.set(f, jsV);
    }
  }

  const uniqueCss = [...new Set(cssVersions.values())];
  if (uniqueCss.length !== 1) {
    error(`Desincronía de styles.css?v=N: ${JSON.stringify(Object.fromEntries(cssVersions))}`);
  } else {
    success(`Cache busting styles.css sincronizado en 5 páginas: v=${uniqueCss[0]}`);
  }

  const uniqueJs = [...new Set(jsVersions.values())];
  if (uniqueJs.length !== 1) {
    error(`Desincronía de app.js?v=N: ${JSON.stringify(Object.fromEntries(jsVersions))}`);
  } else {
    success(`Cache busting app.js sincronizado en 4 páginas: v=${uniqueJs[0]}`);
  }
}

console.log("=== OCC CHILE · TEST DE INTEGRIDAD Y PREVENCIÓN ===");
HTML_FILES.forEach(validateHtmlTree);
validateEncoding([...HTML_FILES, ...CSS_FILES, ...JS_FILES]);
JS_FILES.forEach(validateJsSyntax);
CSS_FILES.forEach(validateCss);
validateLinksAssetsAndVersions();

if (hasErrors) {
  console.log("\n❌ VERIFICACIÓN FALLIDA. Corregir los errores anteriores.");
  process.exit(1);
} else {
  console.log("\n🎉 TODOS LOS CHEQUEOS PASARON EXITOSAMENTE.");
  process.exit(0);
}
