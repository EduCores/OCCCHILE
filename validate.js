/**
 * OCC Chile · Validador preventivo de integridad
 * Ejecutar con: node validate.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
let hasErrors = false;

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
  const suspicious = [/Ã¡|Ã©|Ã­|Ã³|Ãº|Ã±|Ã‘|â€|â€“|â€”|Â/g];
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

// 5. Validador de Cache Busting
function validateCacheBusting() {
  const es = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

  const esCss = (es.match(/styles\.css\?v=(\d+)/) || [])[1];
  const esJs = (es.match(/app\.js\?v=(\d+)/) || [])[1];

  if (!esCss) {
    error("styles.css en index.html no tiene versión de cache busting (?v=N)");
  } else {
    success(`Cache busting styles.css activo: v=${esCss}`);
  }

  if (!esJs) {
    error("app.js en index.html no tiene versión de cache busting (?v=N)");
  } else {
    success(`Cache busting app.js activo: v=${esJs}`);
  }
}

console.log("=== OCC CHILE · TEST DE INTEGRIDAD Y PREVENCIÓN ===");
validateHtmlTree('index.html');
validateEncoding(['index.html', 'styles.css', 'app.js']);
validateJsSyntax('app.js');
validateCss('styles.css');
validateCacheBusting();

if (hasErrors) {
  console.log("\n❌ VERIFICACIÓN FALLIDA. Corregir los errores anteriores.");
  process.exit(1);
} else {
  console.log("\n🎉 TODOS LOS CHEQUEOS PASARON EXITOSAMENTE.");
  process.exit(0);
}

