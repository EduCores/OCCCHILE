/**
 * OCC Chile · Plataforma IA — Panel de Administración (admin.js)
 * Manejo interactivo de vistas, simulaciones IA, gestión de contenido y automatizaciones.
 */

(() => {
  "use strict";

  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  function toast(msg, icon = "sparkles") {
    let t = $("#adminToast");
    if (!t) {
      t = document.createElement("div");
      t.id = "adminToast";
      t.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        background: #141d1a;
        color: #fff;
        border: 1px solid rgba(52, 196, 100, 0.4);
        padding: 12px 18px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        font-size: 0.88rem;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(10px);
      `;
      document.body.appendChild(t);
    }
    t.innerHTML = `<i data-lucide="${icon}" style="color:var(--admin-gold); width:18px; height:18px;"></i> <span>${msg}</span>`;
    if (window.lucide) lucide.createIcons();
    t.style.opacity = "1";
    t.style.transform = "translateY(0)";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.transform = "translateY(10px)";
    }, 3200);
  }

  /* ================= 1. NAVEGACIÓN POR VISTAS ================= */
  function initNav() {
    $$(".admin-nav-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const viewId = btn.dataset.view;
        if (!viewId) return;

        $$(".admin-nav-item").forEach((b) => b.classList.toggle("is-active", b === btn));
        $$(".admin-view").forEach((v) => {
          v.classList.toggle("is-active", v.id === `view-${viewId}`);
        });

        if (window.lucide) lucide.createIcons();
        if (viewId === "logistica") initConveyor();
      });
    });
  }

  /* ================= 2. OCR DE EVIDENCIA ================= */
  function initOCR() {
    const stage = $("#ocrStage");
    const boxes = $("#ocrBoxes");
    const tbl = $("#ocrTable tbody");
    const flags = $("#ocrFlags");
    const runBtn = $("#runOcr");
    if (!stage || !runBtn) return;

    let busy = false;
    const FIELDS = [
      ["Iglesia", "Comunidad Cristiana Esperanza", 97],
      ["Ciudad", "Calama → Antofagasta", 99],
      ["Fecha", "14-12-2026", 95],
      ["Niños asistentes", "184", 93],
      ["Cajas entregadas", "197", 91],
      ["Inscritos La Gran Aventura", "63", 88],
      ["Firma ERL", "Detectada (M. Rojas)", 84]
    ];

    async function run() {
      if (busy) return;
      busy = true;
      runBtn.disabled = true;
      boxes.innerHTML = "";
      if (flags) flags.innerHTML = "";
      tbl.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:18px; color:var(--admin-text-muted);">Analizando comprobante con visión artificial…</td></tr>`;
      stage.classList.add("is-scanning");

      await new Promise((r) => setTimeout(r, 1400));

      const rects = [
        { t: 36, l: 62, w: 220, h: 22 },
        { t: 62, l: 62, w: 140, h: 22 },
        { t: 88, l: 62, w: 110, h: 22 },
        { t: 114, l: 125, w: 50, h: 22 },
        { t: 140, l: 130, w: 50, h: 22 },
        { t: 166, l: 180, w: 45, h: 22 },
        { t: 194, l: 135, w: 90, h: 26 }
      ];

      boxes.innerHTML = rects.map((r, i) =>
        `<div class="box" style="position:absolute; top:${r.t}px; left:${r.l}px; width:${r.w}px; height:${r.h}px; border:2px solid var(--admin-gold); background:rgba(242,179,61,0.15); border-radius:3px;">
           <span style="position:absolute; top:-16px; left:0; font-size:10px; background:var(--admin-gold); color:#000; font-weight:800; padding:1px 4px; border-radius:2px;">${FIELDS[i][2]}%</span>
         </div>`
      ).join("");

      tbl.innerHTML = FIELDS.map(([k, v, c]) => `
        <tr>
          <td><b>${k}</b></td>
          <td>${v}</td>
          <td><span class="badge-tag badge-tag--ok"><i data-lucide="check"></i> ${c}%</span></td>
        </tr>
      `).join("");

      if (flags) {
        flags.innerHTML = `
          <div style="background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.35); padding:10px 14px; border-radius:10px; font-size:0.82rem; color:#6ee7b7; display:flex; align-items:center; gap:8px;">
            <i data-lucide="shield-check"></i> Acta auditada: 0 discrepancias de asistencia. Lista para validación regional.
          </div>
        `;
      }

      stage.classList.remove("is-scanning");
      busy = false;
      runBtn.disabled = false;
      if (window.lucide) lucide.createIcons();
      toast("Acta procesada y validada con OCR exitosamente", "check-check");
      logEvent("OCR Evidencia", "Procesada acta de Comunidad Cristiana Esperanza (Calama) · 100% conforme");
    }

    runBtn.addEventListener("click", run);
  }

  /* ================= 3. LOGÍSTICA & CINTA ================= */
  let conveyorStarted = false;
  function initConveyor() {
    if (conveyorStarted) return;
    conveyorStarted = true;

    const conv = $("#conveyor");
    const countEl = $("#cvCount");
    const tagEl = $("#cvTag");
    const confEl = $("#cvConf");
    if (!conv) return;

    let count = 24120;
    setInterval(() => {
      const view = $("#view-logistica");
      if (!view || !view.classList.contains("is-active")) return;

      count++;
      if (countEl) countEl.textContent = count.toLocaleString("es-CL");
      const tag = "CL-" + Math.floor(10000 + Math.random() * 90000);
      if (tagEl) tagEl.textContent = tag;
      const conf = (96.5 + Math.random() * 3.3).toFixed(1);
      if (confEl) confEl.textContent = conf + "%";
    }, 2800);
  }

  /* ================= 4. AUTOMATIZACIONES ================= */
  function logEvent(action, detail) {
    const feed = $("#adminLogFeed");
    if (!feed) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    const entry = document.createElement("div");
    entry.className = "admin-log-entry";
    entry.innerHTML = `
      <span class="admin-log-time">[${timeStr}]</span>
      <span class="admin-log-action">${action}:</span>
      <span class="admin-log-detail">${detail}</span>
    `;
    feed.prepend(entry);
  }

  function initAutomations() {
    $$(".admin-switch input").forEach((sw) => {
      sw.addEventListener("change", (e) => {
        const name = e.target.dataset.auto || "Automatización";
        const state = e.target.checked ? "ACTIVADA" : "PAUSADA";
        toast(`${name}: ${state}`, e.target.checked ? "check" : "pause");
        logEvent("Configuración IA", `${name} cambiada a ${state}`);
      });
    });
  }

  /* ================= 5. GESTIÓN DE IGLESIAS ================= */
  function initChurches() {
    const search = $("#churchSearch");
    const filter = $("#churchFilter");
    const rows = $$("#churchesTable tbody tr");

    function applyFilter() {
      const q = (search ? search.value : "").toLowerCase().trim();
      const st = filter ? filter.value : "all";

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const rowStatus = row.dataset.status || "all";
        const matchesQuery = !q || text.includes(q);
        const matchesStatus = st === "all" || rowStatus === st;
        row.style.display = matchesQuery && matchesStatus ? "" : "none";
      });
    }

    if (search) search.addEventListener("input", applyFilter);
    if (filter) filter.addEventListener("change", applyFilter);

    $$(".btn-approve-church").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest("tr");
        const name = row.querySelector("strong")?.textContent || "Iglesia";
        btn.textContent = "✓ Aprobada";
        btn.disabled = true;
        btn.className = "badge-tag badge-tag--ok";
        const badge = row.querySelector(".badge-tag");
        if (badge) {
          badge.className = "badge-tag badge-tag--ok";
          badge.textContent = "Aprobada";
        }
        row.dataset.status = "aprobada";
        toast(`Postulación de ${name} aprobada con cupo sugerido`, "church");
        logEvent("Iglesias & Cupos", `${name} aprobada para 250 cajitas · Notificación enviada`);
      });
    });
  }

  /* ================= 6. VOLUNTARIOS ================= */
  function initVolunteers() {
    $$(".btn-wa-remind").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.name || "Voluntario";
        btn.innerHTML = `<i data-lucide="check"></i> Enviado`;
        btn.disabled = true;
        btn.style.opacity = "0.7";
        if (window.lucide) lucide.createIcons();
        toast(`Recordatorio de inducción enviado a ${name} por WhatsApp`, "send");
        logEvent("WhatsApp Bot", `Recordatorio de rol enviado a ${name} · Estado: Entregado`);
      });
    });
  }

  /* ================= 7. CONSOLA ASISTENTE IA ================= */
  function initAssistant() {
    const input = $("#adminChatInput");
    const sendBtn = $("#adminChatSend");
    const box = $("#adminChatMessages");
    if (!input || !sendBtn || !box) return;

    function appendMsg(text, isUser = false) {
      const div = document.createElement("div");
      div.className = `admin-chat-bubble admin-chat-bubble--${isUser ? "user" : "ai"}`;
      div.innerHTML = text;
      box.appendChild(div);
      box.scrollTop = box.scrollHeight;
    }

    async function handleSend(q) {
      const query = (q || input.value || "").trim();
      if (!query) return;
      input.value = "";
      appendMsg(query, true);

      // Respuesta simulada
      setTimeout(() => {
        let resp = "Entendido. He consultado el registro nacional de Samaritan's Purse para Chile.";
        const ql = query.toLowerCase();
        if (ql.includes("stock") || ql.includes("cajita") || ql.includes("cuántas")) {
          resp = "<b>Stock Nacional Actual:</b><br>• En bodegas: <strong>32.840 cajitas</strong><br>• En tránsito carretera: <strong>14.200 cajitas</strong><br>• Entregadas y auditadas: <strong>180.984 cajitas</strong><br><em>Meta nacional al 95% de cumplimiento.</em>";
        } else if (ql.includes("región") || ql.includes("avance") || ql.includes("menor")) {
          resp = "<b>Avance Regional:</b><br>La región con menor porcentaje relativo es <strong>Antofagasta (76,2%)</strong> debido a demoras en el paso aduanero. Valparaíso y Metropolitana lideran con sobre 94%.";
        } else if (ql.includes("acta") || ql.includes("ocr") || ql.includes("auditor")) {
          resp = "<b>Auditoría de Actas:</b><br>Hay <strong>14 actas pendientes</strong> de confirmación en la Región del Maule. El bot de WhatsApp envió recordatorios automáticos hoy a las 09:00 hrs.";
        } else {
          resp = `He procesado tu consulta: <em>"${query}"</em>. Todos los módulos operativos se encuentran en estado óptimo (16 regiones sincronizadas sin incidencias críticas).`;
        }
        appendMsg(resp, false);
      }, 700);
    }

    sendBtn.addEventListener("click", () => handleSend());
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSend();
    });

    $$(".admin-quick-prompt").forEach((chip) => {
      chip.addEventListener("click", () => {
        handleSend(chip.dataset.prompt);
      });
    });
  }


  /* ================= 7. DESCARGA Y ENVÍO DE INFORMES (TRANSPARENCIA) ================= */
  function initReportes() {
    const tableBody = $("#repTableBody");
    const countBadge = $("#repCounterBadge");
    const btnDescargar = $("#btnDescargarAhora");
    const btnEnviar = $("#btnEnviarAhora");
    const btnConsolidado = $("#btnGenerarConsolidado");
    const searchInput = $("#repSearchInput");
    const hashPreview = $("#repHashPreview");
    const tipoSelect = $("#repTipoDescarga");
    const regionSelect = $("#repRegionDescarga");
    const formatoSelect = $("#repFormatoDescarga");

    if (!tableBody) return;

    // Semilla inicial de informes oficiales
    const initialReports = [
      {
        id: "REP-2026-0842",
        tipo: "Consolidado Nacional de Distribución 2026",
        fecha: "11/11/2026 18:30",
        destinatario: "Samaritan's Purse Intl (Boone, NC)",
        canales: "Email PGP + API",
        formato: "PDF Certificado",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        estado: "Entregado y Verificado",
        estadoCls: "rep-status-badge--ok"
      },
      {
        id: "REP-2026-0841",
        tipo: "Auditoría Forense de Actas OCR",
        fecha: "11/11/2026 17:15",
        destinatario: "Directiva ENL Chile",
        canales: "Bóveda Cloud SFTP",
        formato: "CSV Abierto",
        hash: "4a7d1ed414474e4033aa29cc83b02c7f60015509e95a8f4c2810842e4ec32b98",
        estado: "Conforme (100% actas)",
        estadoCls: "rep-status-badge--ok"
      },
      {
        id: "REP-2026-0840",
        tipo: "Control Logístico Aduana San Antonio",
        fecha: "11/11/2026 15:00",
        destinatario: "Equipo Regional Metronorte",
        canales: "Webhook API",
        formato: "XLSX Auditado",
        hash: "9f83c07e71600f77626b6209fe87aa029a8c7c5e4692459c0497ec95297e63d4",
        estado: "Validado en Aduana",
        estadoCls: "rep-status-badge--ok"
      },
      {
        id: "REP-2026-0839",
        tipo: "Padrón 842 Iglesias Compañeras",
        fecha: "11/11/2026 12:45",
        destinatario: "Comisión de Transparencia",
        canales: "Email PGP",
        formato: "PDF Certificado",
        hash: "7b52009b64fd0a2a49e6d8a939753077792e066424b94689255755502c11867e",
        estado: "Entregado",
        estadoCls: "rep-status-badge--sent"
      },
      {
        id: "REP-2026-0838",
        tipo: "Certificado Internacional Merma Cero",
        fecha: "10/11/2026 20:00",
        destinatario: "Samaritan's Purse HQ",
        canales: "Bóveda SFTP + API",
        formato: "PDF con Sello",
        hash: "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
        estado: "Aprobado SP-Intl",
        estadoCls: "rep-status-badge--ok"
      },
      {
        id: "REP-2026-0837",
        tipo: "Asignación Regional V Región Valparaíso",
        fecha: "10/11/2026 16:30",
        destinatario: "ERLE V Región",
        canales: "Email + WhatsApp",
        formato: "CSV Abierto",
        hash: "3b8d5225d304918e6e58f0dc44cf0c090333d0ad4b789069d2f3428d052cb7ec",
        estado: "Entregado y Verificado",
        estadoCls: "rep-status-badge--ok"
      }
    ];

    let currentReports = [...initialReports];

    function renderTable(list) {
      tableBody.innerHTML = list.map((r) => `
        <tr data-rep-id="${r.id}">
          <td><strong style="color:var(--admin-pine);">${r.id}</strong></td>
          <td>
            <strong>${r.tipo}</strong>
          </td>
          <td><small style="color:#64748b;">${r.fecha}</small></td>
          <td>
            <div style="font-size:0.82rem; font-weight:700; color:var(--admin-pine);">${r.destinatario}</div>
            <small style="color:#64748b; font-size:0.72rem;">Canal: ${r.canales}</small>
          </td>
          <td><span class="mx-breakdown__tag mx-breakdown__tag--ok" style="font-size:0.7rem;">${r.formato}</span></td>
          <td>
            <div class="rep-hash-box" title="${r.hash}">
              <span>${r.hash.substring(0, 16)}...</span>
              <button type="button" class="btn-copy-hash" data-hash="${r.hash}" style="background:none; border:none; cursor:pointer; color:var(--admin-pine); padding:0;" title="Copiar hash">
                <i data-lucide="copy" style="width:13px; height:13px;"></i>
              </button>
            </div>
          </td>
          <td><span class="rep-status-badge ${r.estadoCls}"><i data-lucide="check-circle-2" style="width:12px; height:12px;"></i> ${r.estado}</span></td>
          <td>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn btn--ghost btn--sm btn--lc btn-table-dl" data-id="${r.id}" data-tipo="${r.tipo}" title="Descargar copia del informe">
                <i data-lucide="download"></i>
              </button>
              <button type="button" class="btn btn--primary btn--sm btn--lc btn-table-resend" data-id="${r.id}" data-dest="${r.destinatario}" title="Reenviar informe">
                <i data-lucide="send"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join("");

      if (countBadge) {
        countBadge.textContent = `Mostrando ${list.length} registros oficiales`;
      }
      if (window.lucide) lucide.createIcons();
      attachTableEvents();
    }

    function generateCsvContent(tipo, region) {
      const now = new Date().toLocaleString("es-CL");
      const hash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      return `# =========================================================================\n` +
        `# OPERACION NINO DE LA NAVIDAD CHILE · PLATAFORMA IA OFICIAL\n` +
        `# REPORTE DE TRANSPARENCIA Y AUDITORIA - TEMPORADA 2026\n` +
        `# Tipo de Informe: ${tipo}\n` +
        `# Alcance Regional: ${region}\n` +
        `# Fecha y Hora de Sellado: ${now}\n` +
        `# Sello Criptografico SHA-256: ${hash}\n` +
        `# Certificado por: Coordinacion Nacional ENL Chile & Samaritan's Purse Intl\n` +
        `# =========================================================================\n` +
        `Region,Iglesias_Participantes,Cajitas_Asignadas,Cajitas_Entregadas,Tasa_Cumplimiento,Actas_OCR_Conformes,Estado_Auditoria\n` +
        `Metronorte,184,48200,43621,90.5%,184/184,CONFORME_SIN_OBSERVACIONES\n` +
        `Metrosur,162,42100,38100,90.5%,162/162,CONFORME_SIN_OBSERVACIONES\n` +
        `V_Region,125,31500,28507,90.5%,125/125,CONFORME_SIN_OBSERVACIONES\n` +
        `Concepcion,148,39800,36019,90.5%,148/148,CONFORME_SIN_OBSERVACIONES\n` +
        `Los_Lagos,112,34200,30951,90.5%,112/112,CONFORME_SIN_OBSERVACIONES\n` +
        `Coquimbo,111,32224,29162,90.5%,111/111,CONFORME_SIN_OBSERVACIONES\n` +
        `TOTAL_NACIONAL,842,228024,206360,90.5%,842/842,VALIDADO_100%_TRANSPARENCIA\n`;
    }

    function triggerDownload(filename, content) {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function updateHashPreview() {
      if (!hashPreview) return;
      const t = tipoSelect ? tipoSelect.value : "";
      const r = regionSelect ? regionSelect.value : "";
      const f = formatoSelect ? formatoSelect.value : "";
      const seed = t + r + f + Date.now();
      let pseudoHash = "";
      for (let i = 0; i < 64; i++) {
        pseudoHash += ((i * 7 + seed.length * 13 + (seed.charCodeAt(i % seed.length) || 0)) % 16).toString(16);
      }
      hashPreview.textContent = pseudoHash;
    }

    if (tipoSelect) tipoSelect.addEventListener("change", updateHashPreview);
    if (regionSelect) regionSelect.addEventListener("change", updateHashPreview);
    if (formatoSelect) formatoSelect.addEventListener("change", updateHashPreview);

    // 1. Descarga personalizada
    if (btnDescargar) {
      btnDescargar.addEventListener("click", () => {
        const tipoName = tipoSelect ? tipoSelect.options[tipoSelect.selectedIndex].text : "Consolidado";
        const regionName = regionSelect ? regionSelect.options[regionSelect.selectedIndex].text : "Nacional";
        const formato = formatoSelect ? formatoSelect.value : "csv";
        const filename = `OCC_Chile_${tipoSelect.value}_${Date.now()}.${formato === "pdf" ? "pdf" : "csv"}`;

        const csvData = generateCsvContent(tipoName, regionName);
        triggerDownload(filename, csvData);

        const newId = `REP-2026-0${843 + currentReports.length}`;
        const newRecord = {
          id: newId,
          tipo: tipoName.substring(3),
          fecha: new Date().toLocaleString("es-CL"),
          destinatario: "Descarga de Transparencia Pública",
          canales: "Exportación Directa (" + formato.toUpperCase() + ")",
          formato: formato.toUpperCase() + " Certificado",
          hash: hashPreview ? hashPreview.textContent : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          estado: "Generado y Descargado",
          estadoCls: "rep-status-badge--ok"
        };
        currentReports.unshift(newRecord);
        renderTable(currentReports);
        toast(`Informe generado con éxito (${filename}) · Sello SHA-256 verificado`, "download");
      });
    }

    // 2. Descargas rápidas de lista
    $$(".btn-quick-dl").forEach((btn) => {
      btn.addEventListener("click", () => {
        const file = btn.dataset.file || "Informe_OCC_Chile.csv";
        const csv = generateCsvContent(file.replace(".csv", ""), "Nacional");
        triggerDownload(file, csv);
        toast(`Descargando documento oficial: ${file}`, "file-check");
      });
    });

    // 3. Envío multicanal
    if (btnEnviar) {
      btnEnviar.addEventListener("click", () => {
        const destSelect = $("#repDestinatario");
        const infSelect = $("#repInformeAdjunto");
        const destText = destSelect ? destSelect.options[destSelect.selectedIndex].text : "Autoridades";
        const infText = infSelect ? infSelect.options[infSelect.selectedIndex].text : "Informe Oficial";

        const channels = [];
        if ($("#chkCanalEmail") && $("#chkCanalEmail").checked) channels.push("Email PGP");
        if ($("#chkCanalApi") && $("#chkCanalApi").checked) channels.push("API REST");
        if ($("#chkCanalWa") && $("#chkCanalWa").checked) channels.push("WhatsApp");
        if ($("#chkCanalSftp") && $("#chkCanalSftp").checked) channels.push("SFTP");
        const channelStr = channels.join(" + ") || "Canal Seguro";

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `<i data-lucide="loader" class="spin"></i> Cifrando y despachando...`;
        if (window.lucide) lucide.createIcons();

        setTimeout(() => {
          btnEnviar.disabled = false;
          btnEnviar.innerHTML = `<i data-lucide="send"></i> Despachar Informe con Certificación Digital`;
          if (window.lucide) lucide.createIcons();

          const newId = `REP-2026-0${843 + currentReports.length}`;
          let mockHash = "";
          for (let i = 0; i < 64; i++) {
            mockHash += Math.floor(Math.random() * 16).toString(16);
          }

          const newRecord = {
            id: newId,
            tipo: infText,
            fecha: new Date().toLocaleString("es-CL"),
            destinatario: destText,
            canales: channelStr,
            formato: "PDF Certificado + API",
            hash: mockHash,
            estado: "Entregado y Verificado",
            estadoCls: "rep-status-badge--ok"
          };

          currentReports.unshift(newRecord);
          renderTable(currentReports);
          toast(`Informe despachado a ${destText} (${channelStr}) con firma digital`, "send");
        }, 650);
      });
    }

    // 4. Botón Consolidado Nacional
    if (btnConsolidado) {
      btnConsolidado.addEventListener("click", () => {
        const csv = generateCsvContent("Consolidado Ejecutivo Nacional 2026", "Todas las 16 Regiones de Chile");
        triggerDownload("Consolidado_Nacional_OCC_Chile_2026_Auditado.csv", csv);
        toast("Consolidado Nacional 2026 compilado y descargado con éxito", "check-circle");
      });
    }

    // 5. Búsqueda y filtrado
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) {
          renderTable(currentReports);
          return;
        }
        const filtered = currentReports.filter(r =>
          r.id.toLowerCase().includes(q) ||
          r.tipo.toLowerCase().includes(q) ||
          r.destinatario.toLowerCase().includes(q) ||
          r.hash.toLowerCase().includes(q)
        );
        renderTable(filtered);
      });
    }

    function attachTableEvents() {
      $$(".btn-copy-hash").forEach((b) => {
        b.addEventListener("click", () => {
          const h = b.dataset.hash;
          if (navigator.clipboard) {
            navigator.clipboard.writeText(h);
            toast(`Hash copiado: ${h.substring(0, 16)}...`, "clipboard");
          } else {
            prompt("Sello Criptográfico SHA-256:", h);
          }
        });
      });

      $$(".btn-table-dl").forEach((b) => {
        b.addEventListener("click", () => {
          const id = b.dataset.id;
          const tipo = b.dataset.tipo;
          const csv = generateCsvContent(tipo, "Auditoría Histórica");
          triggerDownload(`${id}_${tipo.replace(/\s+/g, "_")}.csv`, csv);
          toast(`Descargando copia de ${id}`, "download");
        });
      });

      $$(".btn-table-resend").forEach((b) => {
        b.addEventListener("click", () => {
          const id = b.dataset.id;
          const dest = b.dataset.dest;
          toast(`Informe ${id} reenviado con éxito a ${dest}`, "send");
        });
      });
    }

    // Render inicial
    renderTable(currentReports);
    updateHashPreview();
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initOCR();
    initAutomations();
    initChurches();
    initVolunteers();
    initAssistant();
    initReportes();
    if (window.lucide) lucide.createIcons();
  });
})();

