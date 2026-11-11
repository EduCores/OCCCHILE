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

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initOCR();
    initAutomations();
    initChurches();
    initVolunteers();
    initAssistant();
    if (window.lucide) lucide.createIcons();
  });
})();

