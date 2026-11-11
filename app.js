/* =========================================================
   OCC Chile · Plataforma IA — app.js (vanilla, sin build)
   Estructura modular pensada para migrar a React/Next.js:
   cada bloque init*() ≈ un componente futuro.
   ========================================================= */
(() => {
  "use strict";

  let LANG = "es";
  const IS_EN = LANG === "en";
  const IS_PT = LANG === "pt";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const icons = () => window.lucide && window.lucide.createIcons();
  const fmt = (n, d = 0) => Number(n).toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d });
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ\s]/g, " ").replace(/\s+/g, " ").trim();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin storage */ } },
  };
  let toastT;
  const toast = (msg, icon = "check-circle-2") => {
    const t = $("#toast");
    t.innerHTML = `<i data-lucide="${icon}"></i> ${msg}`;
    icons();
    t.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-on"), 3200);
  };

  /* ---------------- DATA ---------------- */
  const REGIONS = [
    { n: "Arica y Parinacota", s: "Arica", d: 92.1, b: 6120 },
    { n: "Tarapacá", s: "Tarapacá", d: 88.4, b: 7480 },
    { n: "Antofagasta", s: "Antofagasta", d: 76.2, b: 11950 },
    { n: "Atacama", s: "Atacama", d: 84.9, b: 5830 },
    { n: "Coquimbo", s: "Coquimbo", d: 93.5, b: 12400 },
    { n: "Valparaíso", s: "Valparaíso", d: 94.2, b: 24610 },
    { n: "Metropolitana", s: "Metropolitana", d: 95.8, b: 77120 },
    { n: "O'Higgins", s: "O'Higgins", d: 91.0, b: 10340 },
    { n: "Maule", s: "Maule", d: 89.7, b: 12880 },
    { n: "Ñuble", s: "Ñuble", d: 87.3, b: 5920 },
    { n: "Biobío", s: "Biobío", d: 92.6, b: 18450 },
    { n: "La Araucanía", s: "Araucanía", d: 86.1, b: 12940 },
    { n: "Los Ríos", s: "Los Ríos", d: 90.3, b: 5480 },
    { n: "Los Lagos", s: "Los Lagos", d: 85.5, b: 10260 },
    { n: "Aysén", s: "Aysén", d: 78.4, b: 1874 },
    { n: "Magallanes", s: "Magallanes", d: 81.0, b: 4370 },
  ];
  REGIONS.forEach((r, i) => (r.i = i));

  const PROCESSES_ES = [
    { t: "Captación de iglesias", pain: "Email manual con 7 campos", sol: "Formulario inteligente + clasificación automática", imp: "alto", ic: "church", m: "A", e: 24, v: 94,
      b: ["Autocompletado de direcciones", "Clasificación por región/tamaño", "Deduplicación fuzzy"] },
    { t: "Onboarding de voluntarios", pain: "Manual, sin seguimiento", sol: "Chatbot + flujo automatizado + recordatorios", imp: "alto", ic: "user-plus", m: "B", e: 40, v: 76,
      b: ["Checklist por rol", "Matching por habilidades", "Alertas de inactividad"] },
    { t: "Reportes maestro / distribución", pain: "Google Forms gigantes en iframes", sol: "Formularios nativos + validación IA", imp: "alto", ic: "clipboard-check", m: "C", e: 46, v: 92,
      b: ["UX móvil por pasos", "Detección de inconsistencias", "Consolidación automática"] },
    { t: "Logística de cajas", pain: "Conteo y distribución manual", sol: "Visión por computador + OCR", imp: "medio-alto", ic: "package", m: "D", e: 82, v: 74,
      b: ["Conteo por cámaras", "OCR de etiquetas", "Rutas con OR-Tools"] },
    { t: "Métricas nacionales", pain: "Reporte manual en PPT", sol: "Dashboard con IA + alertas", imp: "alto", ic: "bar-chart-3", m: "E", e: 60, v: 84,
      b: ["KPIs en tiempo real", "Alertas < 80%", "Resúmenes ejecutivos"] },
    { t: "Capacitación", pain: "Solo eventos presenciales", sol: "Contenido IA (guías, videos, quiz)", imp: "medio", ic: "graduation-cap", m: "F", e: 45, v: 58,
      b: ["Guías por rol", "Quiz con feedback", "Actas automáticas"] },
    { t: "Comunicación", pain: "Redes gestionadas a mano", sol: "Generación de contenido + programación", imp: "medio", ic: "megaphone", m: "G", e: 25, v: 55,
      b: ["Calendario editorial", "Posts por hito", "Newsletter regional"] },
    { t: "Atención a consultas", pain: "Email lento", sol: "Chatbot RAG sobre FAQs/documentos", imp: "alto", ic: "message-circle-heart", m: "H", e: 31, v: 82,
      b: ["Respuestas citadas", "Enrutamiento por tema", "Sugerencias al equipo"] },
    { t: "Traducción / localización", pain: "Proceso manual", sol: "IA multilingüe", imp: "bajo-medio", ic: "languages", m: "F", e: 18, v: 32,
      b: ["Materiales ES/EN/PT", "Revisión humana", "Glosario de la obra"] },
  ];

  const PROCESSES_EN = [
    { t: "Church Application & Intake", pain: "Manual emails with 7 disconnected fields", sol: "Smart form + automated routing & classification", imp: "alto", ic: "church", m: "A", e: 24, v: 94,
      b: ["Address autocomplete", "Region & size tier classification", "Fuzzy deduplication"] },
    { t: "Volunteer Onboarding", pain: "Manual tracking with high drop-off", sol: "Chatbot + automated pathways + reminders", imp: "alto", ic: "user-plus", m: "B", e: 40, v: 76,
      b: ["Role-specific checklists", "Skill-based AI matching", "Inactivity alerts"] },
    { t: "Teacher & Distribution Reports", pain: "Bulky Google Forms embedded in iframes", sol: "Native mobile forms + AI validation", imp: "alto", ic: "clipboard-check", m: "C", e: 46, v: 92,
      b: ["Step-by-step mobile UX", "Data inconsistency detection", "Offline mode (PWA)"] },
    { t: "Physical Evidence OCR", pain: "Unclear photos, manual transcription", sol: "Vision AI OCR + assisted verification", imp: "medio-alto", ic: "scan", m: "C", e: 32, v: 88,
      b: ["Key data & date extraction", "Roster normalization", "Secure cloud storage"] },
    { t: "Last-Mile Logistics & Routing", pain: "Manual routing, elevated freight costs", sol: "Cluster optimization + geocoding", imp: "alto", ic: "truck", m: "D", e: 55, v: 82,
      b: ["Cubic volume calculations", "Multi-stop routing", "Local carrier integration"] },
    { t: "Teacher Training", pain: "100% in-person, limited reach", sol: "Micro-learning platform + dynamic quizzes", imp: "medio", ic: "graduation-cap", m: "E", e: 18, v: 70,
      b: ["Short videos <5 min", "Downloadable progress", "Automated certificates"] },
    { t: "Material Translation", pain: "Slow and costly manual translations", sol: "Generative AI + human editorial review", imp: "bajo-medio", ic: "languages", m: "F", e: 18, v: 32,
      b: ["EN/ES/PT curriculum", "Human oversight", "Theological glossaries"] },
    { t: "Donor Impact Dashboard", pain: "Quarterly static PDF reports", sol: "Real-time portal with multimedia storytelling", imp: "medio-alto", ic: "bar-chart-3", m: "G", e: 30, v: 65,
      b: ["Live delivery metrics", "Geolocated photos", "Verified impact stories"] },
    { t: "RAG Inquiry Support", pain: "Overcrowded inboxes, repetitive questions", sol: "RAG Assistant trained on official manuals", imp: "alto", ic: "message-square", m: "H", e: 38, v: 90,
      b: ["Manuals vector embeddings", "Grounded citations", "Seamless human handoff"] },
  ];
  const PROCESSES = IS_EN ? PROCESSES_EN : PROCESSES_ES;
  const IMP_LABEL = { alto: "Alto", "medio-alto": "Medio-Alto", medio: "Medio", "bajo-medio": "Bajo-Medio" };
  const IMP_COLOR = { alto: "var(--red)", "medio-alto": "#e5662b", medio: "#d49112", "bajo-medio": "var(--pine-2)" };

  const FLOWS_ES = [
    { k: "A", t: "Captación y onboarding de iglesias", ic: "church",
      before: "La iglesia envía un email a contacto con 7 datos (nombre, contacto, dirección postal, dirección de distribución, niños por rango etario, email, celular). El equipo procesa todo a mano.",
      after: "Formulario guiado o chatbot que valida, clasifica y asigna la postulación al equipo regional en segundos.",
      items: ["Formulario web con validación en tiempo real", "Autocompletado de direcciones (Google Maps API)", "Clasificación IA por región, tamaño y urgencia", "Chatbot en “¿Quieres ser parte?”", "Deduplicación por similitud de nombre/dirección", "Respuesta automática con próximos pasos y materiales"],
      kpi: [["Tiempo de respuesta", "Días → minutos"], ["Conversión", "↑ postulaciones completas"]] },
    { k: "B", t: "Onboarding y gestión de voluntarios", ic: "users",
      before: "27 voluntarios nuevos y equipos regionales de 6 roles coordinados por email y redes, sin seguimiento.",
      after: "Asistente que acompaña a cada voluntario según su rol y alerta cuando alguien se desconecta.",
      items: ["Checklist, manuales y capacitaciones por rol", "Matching de voluntarios a roles por habilidades/ubicación", "Recordatorios automáticos de tareas", "Análisis de engagement con alertas proactivas", "Certificados y badges personalizados"],
      kpi: [["Activación", "Onboarding en 7 días"], ["Retención", "↓ voluntarios inactivos"]] },
    { k: "C", t: "Reportes post-distribución y del maestro", ic: "clipboard-check",
      before: "Google Forms embebidos con iframes enormes, llenado manual y consolidación en planillas.",
      after: "Formularios nativos móviles que validan, leen fotos de evidencia y consolidan solos.",
      items: ["Formularios nativos con UX móvil", "Validación inteligente de inconsistencias y rangos", "OCR + visión sobre fotos de evidencia", "Detección de anomalías (duplicados, cajas no distribuidas)", "Resumen ejecutivo automático por región"],
      kpi: [["Errores", "↓ 70% datos inválidos"], ["Consolidación", "Manual → automática"]] },
    { k: "D", t: "Logística y distribución de cajitas", ic: "truck",
      before: "Recepción, conteo y distribución manual de 228.024 cajas, con meta de 42 contenedores en 2027.",
      after: "Cada caja contada y trazada por cámara, con rutas y stock optimizados por región.",
      items: ["Conteo automático por visión en bodegas", "Optimización de rutas (OR-Tools + IA)", "Predicción de demanda regional", "Inventario con alertas de stock", "OCR de etiquetas para trazabilidad"],
      kpi: [["Exactitud de conteo", "> 99%"], ["Kilómetros", "↓ 15–25%"]] },
    { k: "E", t: "Métricas, monitoreo y decisiones", ic: "layout-dashboard",
      before: "Métricas presentadas en PPT manual (228k cajas, 90,5% distribuidas…).",
      after: "Dashboard vivo con alertas y reportes ejecutivos que se escriben solos.",
      items: ["KPIs nacionales y regionales en tiempo real", "Alertas cuando una región baja de 80%", "Predicción de cumplimiento de 42 contenedores", "Reportes ejecutivos mensuales/trimestrales con IA", "Análisis de sentimiento de feedback"],
      kpi: [["Visibilidad", "Semanal → tiempo real"], ["Preparación de reportes", "Horas → segundos"]] },
    { k: "F", t: "Capacitación y discipulado", ic: "graduation-cap",
      before: "Eventos presenciales (V Región 105, Metropolitana 190 asistentes) y materiales estáticos.",
      after: "Aprendizaje continuo por rol, disponible 24/7 y en varios idiomas.",
      items: ["Guías de capacitación por rol (IA + revisión humana)", "Chatbot de soporte operativo", "Quiz y evaluación con retroalimentación", "Traducción automática de materiales", "Transcripción y resumen de reuniones"],
      kpi: [["Alcance", "Capacitación sin límite de aforo"], ["Actas", "Automáticas"]] },
    { k: "G", t: "Comunicación y marketing digital", ic: "megaphone",
      before: "Facebook/Instagram y web con contenido manual, sin calendario editorial.",
      after: "Calendario editorial asistido por IA, alineado a los hitos de cada región.",
      items: ["Posts, historias y guiones de reels por hito (Calama, Punta Arenas, Puerto Natales)", "Programación automática (Buffer/Hootsuite)", "Respuestas a DMs/comentarios frecuentes", "Newsletter personalizado por región", "SEO: noindex, páginas demo, velocidad"],
      kpi: [["Frecuencia", "Publicación constante"], ["Alcance orgánico", "↑ con SEO técnico"]] },
    { k: "H", t: "Atención y soporte", ic: "life-buoy",
      before: "Formulario Contact Form 7 + email; respuesta manual y lenta.",
      after: "Asistente RAG que responde con fuentes y deriva al equipo correcto.",
      items: ["Chatbot RAG con FAQs, manuales y páginas del sitio", "Clasificación y enrutamiento (voluntariado, donaciones, iglesias, prensa)", "Respuestas sugeridas para el equipo", "Análisis de temas recurrentes"],
      kpi: [["Primera respuesta", "< 5 segundos"], ["Consultas resueltas", "~70% sin intervención"]] },
  ];

  const FLOWS_EN = [
    { k: "A", t: "Church Outreach & Onboarding", ic: "church",
      before: "The church emails contact info with 7 fields (name, contact, postal address, delivery venue, children by age, email, phone). The team processes everything by hand.",
      after: "Guided smart form or chatbot that validates, classifies, and routes applications to regional teams in seconds.",
      items: ["Real-time validated web form", "Address autocomplete (Google Maps API)", "AI classification by region, size, and urgency", "Chatbot on 'Want to Join?'", "Fuzzy deduplication for church names and addresses", "Instant automated reply with next steps and materials"],
      kpi: [["Response Time", "Days → minutes"], ["Conversion", "↑ complete applications"]] },
    { k: "B", t: "Volunteer Onboarding & Leadership Matching", ic: "users",
      before: "27 new volunteers and regional teams across 6 roles coordinated through loose emails and social messaging without follow-up.",
      after: "AI assistant that guides volunteers by role and proactively flags inactive members.",
      items: ["Role-specific checklists, handbooks, and trainings", "AI skill and location matching to ministry roles", "Automated task reminders", "Engagement analytics with early-warning alerts", "Personalized badges and service certificates"],
      kpi: [["Activation", "7-day full onboarding"], ["Retention", "↓ volunteer drop-off"]] },
    { k: "C", t: "Teacher & Post-Distribution Reporting", ic: "clipboard-check",
      before: "Oversized Google Forms embedded in iframes, manual entry, and error-prone spreadsheet consolidation.",
      after: "Native mobile step-by-step forms that validate, read photo rosters via OCR, and auto-consolidate data.",
      items: ["Step-by-step mobile UX", "Smart range and consistency validation", "Vision OCR on attendance photos", "Anomaly detection (duplicate reports, undistributed boxes)", "Instant automated regional executive summaries"],
      kpi: [["Error Reduction", "↓ 70% invalid entries"], ["Consolidation", "Manual → instantaneous"]] },
    { k: "D", t: "Shoebox Logistics & Regional Distribution", ic: "truck",
      before: "Manual intake, counting, and routing of 228,024 shoeboxes toward a 42-container goal in 2027.",
      after: "Every shoebox verified and tracked by computer vision, with routes and inventory optimized by region.",
      items: ["Automated camera tallying in warehouse docks", "Route optimization (OR-Tools + AI)", "Regional demand forecasting", "Real-time inventory alerts", "Label OCR for full supply-chain traceability"],
      kpi: [["Count Accuracy", "> 99%"], ["Mileage / Freight", "↓ 15–25%"]] },
    { k: "E", t: "Metrics, Real-time Monitoring & Decision Intelligence", ic: "layout-dashboard",
      before: "Metrics compiled into manual PowerPoint presentations (228k boxes, 90.5% distributed).",
      after: "Live interactive dashboard with smart anomaly alerts and auto-generated executive briefs.",
      items: ["Real-time national and regional KPIs", "Alerts when a region drops below 80% coverage", "42-container predictive milestone tracking", "Monthly/quarterly automated AI executive reports", "Feedback sentiment and prayer request analysis"],
      kpi: [["Visibility", "Weekly → real-time"], ["Report Preparation", "Hours → seconds"]] },
    { k: "F", t: "Training & Discipleship Microlearning", ic: "graduation-cap",
      before: "Strictly in-person workshops (Valparaíso 105, Santiago 190 attendees) with static paper materials.",
      after: "Continuous 24/7 role-based learning accessible from any smartphone in multiple languages.",
      items: ["Role-specific micro-guides (AI + human review)", "Operational support chatbot", "Interactive quizzes with instant feedback", "Automated curriculum translation", "Automated meeting minutes and action items"],
      kpi: [["Reach", "Unlimited workshop capacity"], ["Records", "100% automated"]] },
    { k: "G", t: "Digital Communication & Ministry Storytelling", ic: "megaphone",
      before: "Social channels and web updated manually without a structured editorial calendar.",
      after: "AI-assisted editorial calendar aligned with regional distribution milestones.",
      items: ["Posts, stories, and reel scripts tailored to milestones (Calama, Punta Arenas, Puerto Natales)", "Automated scheduling integrations", "Instant FAQ responses to direct messages", "Personalized regional newsletters", "Technical SEO and speed optimization"],
      kpi: [["Publishing Frequency", "Consistent weekly schedule"], ["Organic Reach", "↑ technical SEO"]] },
    { k: "H", t: "Inquiry Support & Grounded RAG Copilot", ic: "life-buoy",
      before: "Standard contact form with delayed manual email responses.",
      after: "RAG Assistant that answers with verified manual citations and escalates when needed.",
      items: ["RAG chatbot trained on official OCC Chile FAQs and handbooks", "Smart routing (volunteers, donations, churches, press)", "Suggested drafted replies for staff", "Recurring question trend analysis"],
      kpi: [["First Response", "< 5 seconds"], ["Resolution Rate", "~70% autonomous"]] },
  ];
  const FLOWS = IS_EN ? FLOWS_EN : FLOWS_ES;

  /* ---------------- THEME (Dark por defecto permanente) ---------------- */
  function initTheme() {
    document.documentElement.dataset.theme = "dark";
    try { localStorage.setItem("occ-theme", "dark"); } catch (_) {}
  }

  /* ---------------- LANGUAGE SWITCH (ES/EN/PT) ---------------- */
  function initLangSwitch() {
    if (sessionStorage.getItem("occ-lang-switch")) {
      sessionStorage.removeItem("occ-lang-switch");
      if ("scrollRestoration" in history) {
        try { history.scrollRestoration = "manual"; } catch (_) {}
      }
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    $(".lang-switch .lang").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      const target = b.dataset.lang || "es";
      LANG = target;
      $(".lang-switch .lang").forEach((x) => {
        x.classList.remove("is-active");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("is-active");
      b.setAttribute("aria-pressed", "true");
    }));
  }

  /* ---------------- NAV / SCROLL ---------------- */
  function initNav() {
    const nav = $("#nav"), bar = $("#progress"), links = $$("#navLinks2 a");
    const onScroll = () => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle("is-scrolled", y > 20);
      bar.style.width = (y / h) * 100 + "%";
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const burger = $("#burger");
    const navMenu = $("#navMenu") || $(".nav__links-wrap");
    if (burger && navMenu) {
      burger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(isOpen));
      });
      $("a", navMenu).forEach((a) => a.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }));
      document.addEventListener("click", (e) => {
        if (navMenu.classList.contains("is-open") && !navMenu.contains(e.target) && !burger.contains(e.target)) {
          navMenu.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
        }
      });
    }
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    ["procesos", "flujos", "demos", "arquitectura", "roadmap"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  function initReveal() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 5) * 70 + "ms"; io.observe(el); });

    // Fallback de seguridad: por si algún elemento no intersecta o el navegador falla
    setTimeout(() => {
      $$(".reveal:not(.is-in)").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) el.classList.add("is-in");
      });
    }, 1200);
  }

  function animateCount(el, to, dec = 0, suffix = "", dur = 1800) {
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      animateCount(el, parseFloat(el.dataset.count), +(el.dataset.decimals || 0), el.dataset.suffix || "");
      io.unobserve(el);
    }), { threshold: 0.5 });
    $$("[data-count]").forEach((el) => io.observe(el));
  }

  /* ---------------- HERO ---------------- */
  /* ---------------- ODÓMETRO: % entregado (tarjeta fc2) ---------------- */
  function initOdometer() {
    const host = $('[data-odo="pct"]');
    if (!host) return;
    const MS_RODILLO = 900;
    let decimas = 905;         // 91,0 %
    const piezas = [];         // columnas de dígitos y separadores

    const formatear = (v) => (v / 10).toFixed(1).replace(".", ",");
    const soloDigitos = (t) => t.replace(/\D/g, "");

    const montar = () => {
      host.textContent = "";
      piezas.length = 0;
      host.setAttribute("aria-label", formatear(decimas) + "%");
      for (const ch of formatear(decimas)) {
        if (ch >= "0" && ch <= "9") {
          const col = document.createElement("span");
          col.className = "odo__d";
          col.setAttribute("aria-hidden", "true");
          const strip = document.createElement("span");
          strip.className = "odo__s";
          for (let i = 0; i < 20; i++) {
            const celda = document.createElement("span");
            celda.textContent = String(i % 10);
            strip.appendChild(celda);
          }
          col.appendChild(strip);
          host.appendChild(col);
          piezas.push({ tipo: "d", strip, idx: 0, timer: 0 });
        } else {
          const sep = document.createElement("span");
          sep.className = "odo__sep";
          sep.textContent = ch;
          sep.setAttribute("aria-hidden", "true");
          host.appendChild(sep);
          piezas.push({ tipo: "s" });
        }
      }
      const dig = soloDigitos(formatear(decimas));
      let k = 0;
      piezas.forEach((p) => {
        if (p.tipo !== "d") return;
        const d = Number(dig[k++]);
        p.idx = d;
        p.strip.style.transition = "none";
        p.strip.style.setProperty("--i", d);
      });
      void host.offsetWidth;
      piezas.forEach((p) => { if (p.tipo === "d") p.strip.style.transition = ""; });
      document.dispatchEvent(new CustomEvent("occ:pct", { detail: { value: decimas / 10 } }));
    };

    const mostrar = (nuevo) => {
      const antes = formatear(decimas);
      decimas = nuevo;
      const ahora = formatear(decimas);
      host.setAttribute("aria-label", ahora + "%");
      document.dispatchEvent(new CustomEvent("occ:pct", { detail: { value: decimas / 10 } }));
      if (antes.length !== ahora.length) { montar(); return; }
      const dig = soloDigitos(ahora);
      let k = 0;
      piezas.forEach((p) => {
        if (p.tipo !== "d") return;
        const objetivo = Number(dig[k++]);
        if (objetivo === p.idx) return;
        // siempre gira hacia adelante, como un odómetro real
        const destino = objetivo > p.idx ? objetivo : objetivo + 10;
        clearTimeout(p.timer);
        p.strip.style.setProperty("--i", destino);
        p.idx = objetivo;
        p.timer = setTimeout(() => {
          p.strip.style.transition = "none";
          p.strip.style.setProperty("--i", objetivo);
          void p.strip.offsetWidth;
          p.strip.style.transition = "";
        }, MS_RODILLO);
      });
    };

    // qué tan probable es que el % reaccione a cada tipo de salto
    const REACCION = {
      5:    { prob: .06, paso: 1 },
      10:   { prob: .15, paso: 1 },
      50:   { prob: .40, paso: 1 },
      100:  { prob: .65, paso: 2 },
      1000: { prob: 1,   paso: 3 }
    };

    document.addEventListener("occ:entrega", (e) => {
      const r = REACCION[e.detail && e.detail.delta];
      if (!r || decimas >= 1000 || Math.random() > r.prob) return;
      mostrar(Math.min(1000, decimas + r.paso));
    });

    montar();
  }

  function initHero() {
    const gift = $("#gift");
    if (gift) {
      gift.addEventListener("click", () => {
        gift.classList.remove("is-open");
        void gift.offsetWidth;
        gift.classList.add("is-open");
        toast("¡Una cajita más camino a un niño! 🎁", "gift");
        setTimeout(() => gift.classList.remove("is-open"), 2600);
      });
    }
    const scan = $('[data-live="scan"]');
    if (scan) {
      // Contador "en vivo": arranca en 206.274 y sube con saltos aleatorios.
      // Cada magnitud tiene su propio color y su propia velocidad de conteo.
      // Los colores viven en styles.css ([data-step="N"]), así el tema oscuro
      // puede usar su propia versión de la misma rampa rojo → verde.
      const PASOS = [
        { d: 5,    ms: 480 },
        { d: 10,   ms: 540 },
        { d: 50,   ms: 620 },
        { d: 100,  ms: 700 },
        { d: 1000, ms: 880 }
      ];
      const PESOS = [38, 27, 18, 12, 5]; // los saltos chicos son más frecuentes
      const totalPesos = PESOS.reduce((a, b) => a + b, 0);
      let n = 206274;
      scan.textContent = fmt(n);

      const elegirPaso = () => {
        let r = Math.random() * totalPesos;
        for (let i = 0; i < PASOS.length; i++) { r -= PESOS[i]; if (r <= 0) return PASOS[i]; }
        return PASOS[0];
      };

      const tarjeta = scan.closest(".float-card") || scan.parentElement;
      let token = 0;

      const subir = () => {
        const p = elegirPaso();
        const desde = n;
        n += p.d;
        const hasta = n;
        const mio = ++token;

        // el número destella con el color de su magnitud
        scan.dataset.step = String(p.d);
        scan.classList.remove("is-bump");
        void scan.offsetWidth;
        scan.classList.add("is-bump");
        setTimeout(() => scan.classList.remove("is-bump"), 760);

        // etiqueta flotante "+N"
        const badge = document.createElement("span");
        badge.className = "live-bump";
        badge.textContent = "+" + fmt(p.d);
        badge.dataset.step = String(p.d);
        tarjeta.appendChild(badge);
        setTimeout(() => badge.remove(), 1400);

        // avisa al odómetro del % entregado para que reaccione
        document.dispatchEvent(new CustomEvent("occ:entrega", { detail: { delta: p.d, total: hasta } }));

        // conteo ascendente suave hasta el nuevo total
        const t0 = performance.now();
        const contar = (now) => {
          if (mio !== token) return; // otra subida tomó el control
          const k = Math.min(1, (now - t0) / p.ms);
          const eased = 1 - Math.pow(1 - k, 3);
          scan.textContent = fmt(Math.round(desde + (hasta - desde) * eased));
          if (k < 1) requestAnimationFrame(contar); else scan.textContent = fmt(hasta);
        };
        requestAnimationFrame(contar);
        // respaldo: si el navegador pausa los frames (pestaña en 2º plano) igual se actualiza
        setTimeout(() => { if (mio === token) scan.textContent = fmt(hasta); }, p.ms + 900);

        // espacios largos y variables entre subidas (4,2 s – 11,4 s)
        setTimeout(subir, 4200 + Math.random() * 7200);
      };
      setTimeout(subir, 2600);
    }

    // partículas (nieve dorada/roja suave)
    const c = $("#snow"), ctx = c.getContext("2d");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let W, H, parts = [];
    const resize = () => { W = c.width = c.offsetWidth * devicePixelRatio; H = c.height = c.offsetHeight * devicePixelRatio; };
    resize(); addEventListener("resize", resize);
    const cols = ["rgba(242,179,61,", "rgba(214,31,60,", "rgba(26,107,82,"];
    for (let i = 0; i < 60; i++) parts.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2.4 + .6, s: Math.random() * .0006 + .0002, w: Math.random() * 6.28, c: cols[i % 3], a: Math.random() * .5 + .2 });
    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(c);
    (function loop() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        parts.forEach((p) => {
          p.y += p.s; p.w += .01;
          if (p.y > 1.02) { p.y = -.02; p.x = Math.random(); }
          ctx.beginPath();
          ctx.arc((p.x + Math.sin(p.w) * .01) * W, p.y * H, p.r * devicePixelRatio, 0, 6.28);
          ctx.fillStyle = p.c + p.a + ")";
          ctx.fill();
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- PROCESS MAP ---------------- */
  function initProcesses() {
    const grid = $("#processGrid");
    if (!grid) return;
    grid.innerHTML = PROCESSES.map((p, i) => `
      <article class="pcard reveal" data-imp="${p.imp}" tabindex="0" aria-label="${p.t}">
        <div class="pcard__inner">
          <div class="pcard__face pcard__face--front">
            <span class="pcard__num">${String(i + 1).padStart(2, "0")}</span>
            <div class="pcard__icon"><i data-lucide="${p.ic}"></i></div>
            <h3>${p.t}</h3>
            <p class="pain"><i data-lucide="circle-alert"></i> ${p.pain}</p>
            <div class="pcard__foot"><span class="impact impact--${p.imp}">${IMP_LABEL[p.imp]}</span><span>Ver solución <i data-lucide="rotate-cw"></i></span></div>
          </div>
          <div class="pcard__face pcard__face--back">
            <h4>Solución IA · Módulo ${p.m}</h4>
            <p>${p.sol}</p>
            <ul>${p.b.map((x) => `<li>${x}</li>`).join("")}</ul>
            <div class="pcard__foot"><span>Impacto ${IMP_LABEL[p.imp]}</span><span>Volver <i data-lucide="rotate-ccw"></i></span></div>
          </div>
        </div>
      </article>`).join("");
    $$(".pcard", grid).forEach((c) => {
      const flip = () => c.classList.toggle("is-flipped");
      c.addEventListener("click", flip);
      c.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip()));
    });
    $$("#impactFilters .chip").forEach((b) => b.addEventListener("click", () => {
      $$("#impactFilters .chip").forEach((x) => x.classList.toggle("is-active", x === b));
      const f = b.dataset.filter;
      $$(".pcard", grid).forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.imp !== f));
    }));

    const m = $("#matrix");
    /* El bloque "Matriz esfuerzo/impacto" se quitó del HTML: si #matrix no
       existe, salta solo esta parte (los pcards y filtros ya quedaron hechos). */
    if (!m) return;
    PROCESSES.forEach((p, i) => {
      const d = document.createElement("span");
      d.className = "mdot";
      d.textContent = String(i + 1).padStart(2, "0");
      d.title = `${p.t} — ${p.sol}`;
      d.style.left = 6 + p.e * .88 + "%";
      d.style.bottom = 4 + p.v * .86 + "%";
      d.style.background = IMP_COLOR[p.imp];
      d.style.transitionDelay = i * 80 + "ms";
      m.appendChild(d);
    });
    const legend = document.createElement("ol");
    legend.className = "matrix__legend";
    legend.innerHTML = PROCESSES.map((p, i) => `<li><b style="background:${IMP_COLOR[p.imp]}">${String(i + 1).padStart(2, "0")}</b>${p.t}</li>`).join("");
    m.after(legend);
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { m.classList.add("is-in"); o.disconnect(); } }, { threshold: .3 }).observe(m);
  }

  /* ---------------- FLOWS ---------------- */
  function initFlows() {
    const tabs = $("#flowTabs"), panel = $("#flowPanel");
    if (!tabs || !panel) return;
    tabs.innerHTML = FLOWS.map((f, i) => `<button class="ftab${i ? "" : " is-active"}" role="tab" data-i="${i}"><b>${f.k}</b><span>${f.t}</span></button>`).join("");
    const render = (i) => {
      const f = FLOWS[i];
      panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
      panel.innerHTML = `
        <div class="fp__top"><div class="big"><i data-lucide="${f.ic}"></i></div><div><small>Flujo ${f.k}</small><h3>${f.t}</h3></div></div>
        <div class="compare">
          <div class="compare__col compare__col--before"><h5><i data-lucide="hourglass"></i> Flujo actual</h5><p>${f.before}</p></div>
          <div class="compare__arrow"><i data-lucide="arrow-right"></i></div>
          <div class="compare__col compare__col--after"><h5><i data-lucide="sparkles"></i> Con IA</h5><p>${f.after}</p></div>
        </div>
        <ul class="fp__list">${f.items.map((x, j) => `<li style="animation-delay:${j * 70}ms"><i data-lucide="check"></i><span>${x}</span></li>`).join("")}</ul>
        <div class="fp__kpi">${f.kpi.map(([a, b]) => `<div><small>KPI · ${a}</small><strong>${b}</strong></div>`).join("")}</div>`;
      icons();
    };
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest(".ftab"); if (!b) return;
      $$(".ftab", tabs).forEach((x) => x.classList.toggle("is-active", x === b));
      render(+b.dataset.i);
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    });
    render(0);
  }

  /* ---------------- DEMO TABS ---------------- */
  const demoHooks = {};
  function initDemoTabs() {
    const demoTabs = $("#demoTabs");
    if (!demoTabs) return;
    demoTabs.addEventListener("click", (e) => {
      const b = e.target.closest(".demo-tab"); if (!b) return;
      $$(".demo-tab").forEach((x) => x.classList.toggle("is-active", x === b));
      $$(".demo").forEach((d) => d.classList.toggle("is-active", d.id === "demo-" + b.dataset.demo));
      demoHooks[b.dataset.demo] && demoHooks[b.dataset.demo]();
    });
  }
  const isDemoOn = (k) => $("#demo-" + k).classList.contains("is-active") && !document.hidden;

  /* ---------------- A · SMART FORM ---------------- */
  const ADDRESSES = [
    { a: "Av. Granaderos 2050, Calama", r: "Antofagasta" },
    { a: "Av. Argentina 1340, Antofagasta", r: "Antofagasta" },
    { a: "Av. Brasil 2241, Valparaíso", r: "Valparaíso" },
    { a: "Calle Valparaíso 650, Viña del Mar", r: "Valparaíso" },
    { a: "Av. Vicuña Mackenna 4860, Macul, Santiago", r: "Metropolitana" },
    { a: "Gran Avenida 5420, San Miguel, Santiago", r: "Metropolitana" },
    { a: "Av. Colón 1110, Talcahuano", r: "Biobío" },
    { a: "O'Higgins 940, Concepción", r: "Biobío" },
    { a: "Av. Alemania 0280, Temuco", r: "La Araucanía" },
    { a: "Av. Bulnes 0910, Punta Arenas", r: "Magallanes" },
    { a: "Baquedano 255, Puerto Natales", r: "Magallanes" },
    { a: "21 de Mayo 380, Arica", r: "Arica y Parinacota" },
    { a: "Av. Ejército 1120, Coyhaique", r: "Aysén" },
    { a: "Av. Francisco del Campo 470, La Serena", r: "Coquimbo" },
    { a: "Av. Angelmó 2350, Puerto Montt", r: "Los Lagos" },
    { a: "Picarte 1450, Valdivia", r: "Los Ríos" },
    { a: "1 Sur 1290, Talca", r: "Maule" },
    { a: "Av. Libertad 410, Chillán", r: "Ñuble" },
    { a: "Av. Copayapu 2100, Copiapó", r: "Atacama" },
    { a: "Av. Arturo Prat 2120, Iquique", r: "Tarapacá" },
    { a: "Av. Libertador B. O'Higgins 640, Rancagua", r: "O'Higgins" },
  ];
  const EXISTING = [
    { n: "Iglesia Evangélica Luz del Valle", c: "Calama" },
    { n: "Iglesia Bautista Getsemaní", c: "Temuco" },
    { n: "Comunidad Cristiana Esperanza", c: "Calama" },
    { n: "Iglesia Metodista Pentecostal Jotabeche", c: "Santiago" },
    { n: "Centro Cristiano Vida Nueva", c: "Punta Arenas" },
    { n: "Iglesia Alianza Cristiana y Misionera El Faro", c: "Valparaíso" },
    { n: "Ministerio Restauración Familiar", c: "Concepción" },
    { n: "Iglesia Presbiteriana San Pablo", c: "Puerto Montt" },
  ];
  const STOP = new Set(["iglesia", "evangelica", "comunidad", "cristiana", "ministerio", "centro", "de", "del", "la", "el", "los", "las", "y"]);
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n);
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function similarity(a, b) {
    const core = (s) => norm(s).split(" ").filter((w) => !STOP.has(w)).join(" ");
    const x = core(a), y = core(b);
    if (!x || !y) return 0;
    const ed = 1 - lev(x, y) / Math.max(x.length, y.length);
    const tx = new Set(x.split(" ")), ty = new Set(y.split(" "));
    const jac = [...tx].filter((t) => ty.has(t)).length / new Set([...tx, ...ty]).size;
    return Math.max(ed, jac * .95);
  }

  function initForm() {
    const f = $("#churchForm");
    const F = { name: $("#fName"), contact: $("#fContact"), email: $("#fEmail"), phone: $("#fPhone"), addr: $("#fAddr") };
    let step = 0, region = null, submitted = false;
    const rules = {
      name: (v) => v.trim().length >= 4 || "Mínimo 4 caracteres",
      contact: (v) => v.trim().split(/\s+/).length >= 2 || "Incluye nombre y apellido",
      email: (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || "Email no válido",
      phone: (v) => { const d = v.replace(/\D/g, "").replace(/^56/, ""); return /^9\d{8}$/.test(d) || "Formato: +56 9 XXXX XXXX"; },
      addr: (v) => v.trim().length >= 8 || "Selecciona o escribe una dirección",
    };
    const okMsg = { name: "✓ Nombre válido", contact: "✓ Perfecto", email: "✓ Email válido", phone: "✓ Celular chileno válido", addr: "✓ Dirección verificada" };
    const check = (k, show = true) => {
      const r = rules[k](F[k].value), ok = r === true, h = $(`.hint[data-for="${F[k].id}"]`);
      if (show && F[k].value) {
        F[k].classList.toggle("ok", ok); F[k].classList.toggle("err", !ok);
        h.textContent = ok ? okMsg[k] : r; h.className = "hint " + (ok ? "ok" : "err");
      }
      return ok;
    };
    Object.keys(F).forEach((k) => {
      F[k].addEventListener("input", () => { F[k].classList.remove("err"); if (k !== "addr") check(k); update(); });
      F[k].addEventListener("blur", () => { check(k); update(); });
    });
    F.phone.addEventListener("blur", () => {
      const d = F.phone.value.replace(/\D/g, "").replace(/^56/, "");
      if (/^9\d{8}$/.test(d)) F.phone.value = `+56 ${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`;
    });

    // autocompletado
    const ac = $("#acList"); let hl = -1, opts = [];
    const pick = (o) => { F.addr.value = o.a; region = o.r; ac.classList.remove("is-open"); check("addr"); update(); };
    F.addr.addEventListener("input", () => {
      region = null;
      const q = norm(F.addr.value);
      opts = q.length < 2 ? [] : ADDRESSES.filter((o) => norm(o.a + " " + o.r).includes(q)).slice(0, 5);
      hl = -1;
      ac.innerHTML = opts.map((o, i) => `<li data-i="${i}" role="option"><i data-lucide="map-pin"></i>${o.a}<small>${o.r}</small></li>`).join("");
      ac.classList.toggle("is-open", opts.length > 0); icons();
      // detección de región por texto libre
      const hit = ADDRESSES.find((o) => q && norm(o.a).split(",").pop().trim() && q.includes(norm(o.a.split(",").pop())));
      if (hit) region = hit.r;
      update();
    });
    F.addr.addEventListener("keydown", (e) => {
      if (!ac.classList.contains("is-open")) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); hl = (hl + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
        $$("li", ac).forEach((li, i) => li.classList.toggle("is-hl", i === hl));
      } else if (e.key === "Enter" && hl >= 0) { e.preventDefault(); pick(opts[hl]); }
      else if (e.key === "Escape") ac.classList.remove("is-open");
    });
    ac.addEventListener("mousedown", (e) => { const li = e.target.closest("li"); if (li) { e.preventDefault(); pick(opts[+li.dataset.i]); } });
    F.addr.addEventListener("blur", () => setTimeout(() => ac.classList.remove("is-open"), 120));
    $("#sameAddr").addEventListener("change", (e) => ($("#distField").hidden = e.target.checked));

    // niños
    const kids = () => ["k1", "k2", "k3"].map((id) => Math.max(0, parseInt($("#" + id).value) || 0));
    $$(".stepper button").forEach((b) => b.addEventListener("click", () => {
      const i = $("#" + b.dataset.k); i.value = Math.max(0, (parseInt(i.value) || 0) + +b.dataset.d); update();
    }));
    $$(".stepper input").forEach((i) => i.addEventListener("input", update));

    function setDD(id, val) { const el = $(id); if (el.textContent !== val) { el.textContent = val; el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); } }

    function update() {
      const k = kids(), total = k.reduce((a, b) => a + b, 0);
      animateCount($("#kidsTotal"), total, 0, "", 300);
      const kh = $("#kidsHint");
      if (total > 600) { kh.textContent = "⚠ Cantidad inusual para una sola iglesia: un coordinador lo confirmará."; kh.className = "hint err"; }
      else if (total && k[1] === 0) { kh.textContent = "ℹ El rango 5–9 suele ser el mayor. ¿Es correcto en 0?"; kh.className = "hint"; }
      else { kh.textContent = ""; kh.className = "hint"; }

      setDD("#cRegion", region || "—");
      setDD("#cSize", !total ? "—" : total < 50 ? `Pequeña · ${total}` : total < 150 ? `Mediana · ${total}` : `Grande · ${total}`);
      const remote = ["Magallanes", "Aysén", "Arica y Parinacota", "Antofagasta", "Tarapacá"].includes(region);
      const regionPct = region ? (REGIONS.find((r) => r.n === region) || {}).d : null;
      let urg = "—";
      if (region || total) urg = remote || total >= 200 || (regionPct && regionPct < 80) ? "🔴 Alta" : total >= 80 ? "🟠 Media" : "🟢 Normal";
      setDD("#cUrg", urg);
      setDD("#cTeam", region ? `Equipo ${REGIONS.find((r) => r.n === region)?.s || region}` : "—");

      // dedup
      const name = F.name.value;
      const dd = $("#dedup");
      if (name.trim().length < 4) dd.innerHTML = `<p class="muted">Escribe el nombre de la iglesia…</p>`;
      else {
        const hits = EXISTING.map((x) => ({ ...x, s: similarity(name, x.n) })).filter((x) => x.s > .5).sort((a, b) => b.s - a.s).slice(0, 2);
        dd.innerHTML = hits.length
          ? hits.map((h) => `<div class="match ${h.s > .8 ? "high" : "mid"}"><i data-lucide="${h.s > .8 ? "copy" : "git-compare"}"></i><div><strong>${h.n}</strong><br><small class="muted">${h.c} · ${h.s > .8 ? "posible duplicado" : "similar"}</small></div><span class="sim">${Math.round(h.s * 100)}%</span></div>`).join("")
          : `<div class="match"><i data-lucide="badge-check"></i> Sin duplicados en la base <span class="sim" style="color:var(--ok)">Nueva</span></div>`;
        icons();
      }

      const checks = [...Object.keys(F).map((k) => rules[k](F[k].value) === true), total > 0];
      const q = Math.round((checks.filter(Boolean).length / checks.length) * 100);
      $("#qBar").style.width = q + "%";
      $("#qBar").style.backgroundPosition = 100 - q + "% 0";
      $("#qPct").textContent = q + "%";
    }

    // pasos
    const stepFields = [["name", "contact", "email", "phone"], ["addr"], [], []];
    const gridEl = $("#postularGrid") || $(".postular__grid");
    const go = (n) => {
      step = n;
      $$(".fstep", f).forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
      $$("#formSteps span").forEach((s, i) => s.classList.toggle("is-on", i <= n));
      $("#prevStep").disabled = n === 0;

      // Al llegar al paso 4 (índice 3), expande para ocupar ambos paneles
      if (gridEl) {
        gridEl.classList.toggle("is-step-vol", n === 3);
      }

      if (n === 3) {
        $("#nextStep").innerHTML = IS_EN ? `<i data-lucide="send"></i> Submit Application` : `<i data-lucide="send"></i> Finalizar postulación`;
        // Si hay una región detectada en el paso 2, sincronizarla con el selector de voluntarios
        const vReg = $("#vRegion");
        if (vReg && region && vReg.value !== region) {
          vReg.value = region;
          vReg.dispatchEvent(new Event("change"));
        }
      } else {
        $("#nextStep").innerHTML = IS_EN ? `Next <i data-lucide="arrow-right"></i>` : `Siguiente <i data-lucide="arrow-right"></i>`;
      }
      icons();
    };

    // Permitir navegar a pasos previos haciendo click en los indicadores
    $$("#formSteps span").forEach((s, i) => {
      s.addEventListener("click", () => {
        if (i < step) go(i);
      });
    });

    $("#prevStep").addEventListener("click", () => go(Math.max(0, step - 1)));
    $("#nextStep").addEventListener("click", () => {
      const bad = stepFields[step].filter((k) => !check(k));
      if (bad.length) {
        bad.forEach((k) => { F[k].classList.add("err"); const h = $(`.hint[data-for="${F[k].id}"]`); if (!F[k].value) { h.textContent = "Campo requerido"; h.className = "hint err"; } });
        F[bad[0]].focus(); return;
      }
      if (step === 2) {
        if (!kids().reduce((a, b) => a + b, 0)) { $("#kidsHint").textContent = "Indica al menos un niño para continuar."; $("#kidsHint").className = "hint err"; return; }
      }
      if (step < 3) return go(step + 1);
      submit();
    });
    function submit() {
      if (submitted) return;
      submitted = true;
      const r = $("#autoReply");
      const total = kids().reduce((a, b) => a + b, 0);
      const first = F.contact.value.trim().split(" ")[0];
      const hours = $("#vHours") ? $("#vHours").value : 8;
      const reg = region || ($("#vRegion") ? $("#vRegion").value : "tu región");

      if (r) {
        r.hidden = false;
        r.innerHTML = `<h4><i data-lucide="mail-check"></i> Postulación y Equipo Asignado</h4>
          <p>Hola ${first}, ¡gracias por sumar a <b>${F.name.value.trim()}</b>! 🎁</p>
          <p>Tu postulación para <b>${fmt(total)} niños</b> fue asignada al <b>${$("#cTeam").textContent || ("Equipo " + reg)}</b> con compromiso de <b>${hours} h/sem</b> de voluntariado local.</p>
          <p><b>Próximos pasos:</b> 1) Ver video de bienvenida · 2) Descargar guía de distribución · 3) Agendar capacitación de El Gran Viaje.</p>`;
      }

      toast("¡Postulación y roles de voluntarios enviados con éxito! 🏅", "award");
      $("#nextStep").innerHTML = `<i data-lucide="check"></i> Postulación enviada`;
      $("#nextStep").disabled = true;
      icons();
    }
    $("#fillDemo").addEventListener("click", async () => {
      const typeIn = async (el, txt) => { el.value = ""; for (const ch of txt) { el.value += ch; el.dispatchEvent(new Event("input")); await sleep(14); } el.dispatchEvent(new Event("blur")); };
      go(0);
      await typeIn(F.name, "Comunidad Cristiana La Esperanza");
      await typeIn(F.contact, "Marcela Rojas Fuentes");
      await typeIn(F.email, "contacto@laesperanza.cl");
      await typeIn(F.phone, "987654321");
      await sleep(250); go(1);
      await typeIn(F.addr, "Granaderos");
      await sleep(400); pick(ADDRESSES[0]);
      await sleep(350); go(2);
      $("#k1").value = 45; $("#k2").value = 92; $("#k3").value = 60; update();
      await sleep(400);
      // Avanzar al paso 4 (Voluntarios) en pantalla completa
      go(3);
      const skillBtns = $$("#skills .skill");
      if (skillBtns.length >= 4) {
        skillBtns[0].classList.add("is-on");
        skillBtns[1].classList.add("is-on");
        skillBtns[3].classList.add("is-on");
        skillBtns[6].classList.add("is-on");
      }
      if ($("#vHours")) {
        $("#vHours").value = 10;
        $("#vHours").dispatchEvent(new Event("input"));
      }
      await sleep(300);
      const firstCheck = $("#checklist li");
      if (firstCheck) firstCheck.classList.add("done");
      toast("¡Demo de 4 pasos completada en vivo! ✨", "sparkles");
    });
    go(0); update();
  }

  /* ---------------- B · VOLUNTARIOS ---------------- */
  const SKILLS = ["Conducción", "Logística", "Redes sociales", "Enseñanza", "Diseño", "Excel / datos", "Liderazgo", "Fotografía", "Oración", "Inglés", "Relación con iglesias"];
  const ROLES = [
    { n: "Coordinador/a regional", ic: "crown", s: { Liderazgo: 3, "Relación con iglesias": 2, Oración: 1, Logística: 1 }, h: 10,
      cl: ["Reunión 1:1 con coordinación nacional", "Manual del coordinador regional", "Acceso al dashboard regional", "Plan de metas de cajas"] },
    { n: "Relación con iglesias", ic: "church", s: { "Relación con iglesias": 3, Oración: 2, Enseñanza: 1, Liderazgo: 1 }, h: 5,
      cl: ["Guía de captación de iglesias", "Guion de visita pastoral", "Acceso al CRM de iglesias", "Capacitación El Gran Viaje"] },
    { n: "Logística y bodega", ic: "truck", s: { Logística: 3, Conducción: 3, "Excel / datos": 1 }, h: 6,
      cl: ["Protocolo de bodega y seguridad", "App de conteo con cámara", "Mapa de rutas de su región", "Turnos de semana de recolección"] },
    { n: "Comunicaciones", ic: "megaphone", s: { "Redes sociales": 3, Fotografía: 2, Diseño: 2, Inglés: 1 }, h: 4,
      cl: ["Manual de marca y tono", "Banco de fotos con consentimiento", "Calendario editorial IA", "Plantillas de historias"] },
    { n: "Capacitación / El Gran Viaje", ic: "graduation-cap", s: { Enseñanza: 3, Oración: 2, Liderazgo: 1, Inglés: 1 }, h: 5,
      cl: ["Curso de facilitador (online)", "Quiz de certificación", "Materiales para maestros", "Reporte del maestro (formulario nativo)"] },
    { n: "Reportes y datos", ic: "database", s: { "Excel / datos": 3, Logística: 1, Diseño: 1 }, h: 3,
      cl: ["Tour del dashboard", "Guía de validación de reportes", "Alertas de anomalías", "Plantilla de resumen mensual"] },
  ];
  const VOLS = [
    ["Camila S.", "Valparaíso", 2, "#d61f3c"], ["Joaquín P.", "Biobío", 9, "#1a6b52"], ["Fernanda M.", "Metropolitana", 1, "#e5662b"],
    ["Diego A.", "Antofagasta", 23, "#2f6fdb"], ["Valentina R.", "Magallanes", 5, "#a855f7"], ["Matías C.", "Araucanía", 16, "#0f4d3a"],
    ["Ignacia T.", "Coquimbo", 3, "#b3122e"], ["Benjamín L.", "Los Lagos", 31, "#d49112"],
  ];
  function initVolunteers() {
    const sel = $("#vRegion");
    if (!sel) return;
    sel.innerHTML = REGIONS.map((r) => `<option ${r.n === "Valparaíso" ? "selected" : ""}>${r.n}</option>`).join("");
    const on = new Set(["Logística", "Conducción"]);
    $("#skills").innerHTML = SKILLS.map((s) => `<button type="button" class="skill${on.has(s) ? " is-on" : ""}">${s}</button>`).join("");
    $("#skills").addEventListener("click", (e) => {
      const b = e.target.closest(".skill"); if (!b) return;
      b.classList.toggle("is-on"); on.has(b.textContent) ? on.delete(b.textContent) : on.add(b.textContent); render();
    });
    sel.addEventListener("change", render);
    $("#vHours").addEventListener("input", (e) => { $("#vHoursOut").textContent = e.target.value; render(); });

    function render() {
      const hrs = +$("#vHours").value;
      const reg = REGIONS.find((r) => r.n === sel.value);
      const scored = ROLES.map((r) => {
        const max = Object.values(r.s).reduce((a, b) => a + b, 0);
        const got = Object.entries(r.s).reduce((a, [k, w]) => a + (on.has(k) ? w : 0), 0);
        let sc = (got / max) * 75 + Math.min(1, hrs / r.h) * 20;
        if (reg.d < 85 && r.n.startsWith("Logística")) sc += 5; // región con brecha de distribución
        return { ...r, sc: Math.min(99, Math.round(sc)) };
      }).sort((a, b) => b.sc - a.sc);
      $("#matches").innerHTML = scored.slice(0, 3).map((r, i) => `
        <li style="animation-delay:${i * 80}ms"><span class="ico"><i data-lucide="${r.ic}"></i></span>
          <div><strong>${r.n}</strong><small>${i === 0 ? `Mejor ajuste en ${reg.s}` : `${r.h} h/sem sugeridas`}${reg.d < 85 && r.n.startsWith("Logística") ? " · región prioritaria" : ""}</small>
          <div class="score-bar"><i style="width:${r.sc}%"></i></div></div>
          <span class="score">${r.sc}%</span></li>`).join("");
      const done = new Set();
      $("#checklist").innerHTML = scored[0].cl.map((c) => `<li><span class="cb"><i data-lucide="check" style="width:14px;height:14px"></i></span><span>${c}</span></li>`).join("");
      $$("#checklist li").forEach((li, i) => li.addEventListener("click", () => {
        li.classList.toggle("done"); done.has(i) ? done.delete(i) : done.add(i);
        if (done.size === scored[0].cl.length) toast("¡Onboarding completo! Badge “Mensajero de esperanza” desbloqueado 🏅", "award");
      }));
      icons();
    }
    const elEngage = $("#engage");
    if (elEngage) {
      elEngage.innerHTML = VOLS.map(([n, r, d, c]) => {
        const st = d > 20 ? "inactive" : d > 7 ? "risk" : "";
        const col = d > 20 ? "var(--bad)" : d > 7 ? "var(--warn)" : "var(--ok)";
        return `<div class="vol ${st}"><span class="av" style="background:${c}">${n.split(" ").map((x) => x[0]).join("")}</span>
        <div><strong>${n}</strong><small>${r} · ${d === 1 ? "activo hoy" : `hace ${d} días`}</small>${st ? `<br><button data-n="${n}">Enviar recordatorio</button>` : ""}</div>
        <span class="st" style="background:${col}"></span></div>`;
      }).join("");
      elEngage.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        b.textContent = "✓ Enviado"; b.disabled = true; b.style.background = "var(--ok)";
        toast(`Recordatorio personalizado enviado a ${b.dataset.n} por WhatsApp`, "send");
      });
    }
    render();
  }

  /* ---------------- C · OCR ---------------- */
  function initOCR() {
    const stage = $("#ocrStage");
    if (!stage) return;
    const boxes = $("#ocrBoxes"), tbl = $("#ocrTable tbody"), flags = $("#ocrFlags");
    let busy = false, userImg = false;
    const FIELDS = [
      ["Iglesia", "Comunidad Cristiana Esperanza", 97], ["Ciudad", "Calama → Antofagasta", 99], ["Fecha", "14-12-2026", 95],
      ["Niños asistentes", "184", 93], ["Cajas entregadas", "197", 91], ["Inscritos El Gran Viaje", "63", 88], ["Firma", "Detectada (M. Rojas)", 84],
    ];
    async function run() {
      if (busy) return; busy = true;
      boxes.innerHTML = ""; flags.innerHTML = "";
      tbl.innerHTML = `<tr><td colspan="3" class="muted">Analizando imagen…</td></tr>`;
      stage.classList.add("is-scanning");
      await sleep(1600);
      if (!userImg) {
        const sr = stage.getBoundingClientRect();
        $$(".doc__row em", stage).forEach((em, i) => {
          const r = em.getBoundingClientRect();
          const b = document.createElement("i");
          Object.assign(b.style, { left: r.left - sr.left - 4 + "px", top: r.top - sr.top - 3 + "px", width: r.width + 8 + "px", height: r.height + 6 + "px", animationDelay: i * 90 + "ms" });
          boxes.appendChild(b);
        });
      }
      await sleep(1800);
      stage.classList.remove("is-scanning");
      tbl.innerHTML = FIELDS.map(([k, v, c], i) => `<tr style="animation-delay:${i * 70}ms"><td>${k}</td><td>${v}</td><td><span class="conf"><i style="--w:${c}%"></i>${c}%</span></td></tr>`).join("");
      await sleep(400);
      flags.innerHTML = [
        ["warn", "triangle-alert", "<b>Inconsistencia:</b> 197 cajas vs 184 niños (+13). ¿Hermanos ausentes o cajas de reserva? Se pidió confirmación al responsable."],
        ["ok", "copy-check", "<b>Sin duplicados:</b> no existe otro reporte de esta iglesia para el 14-12-2026."],
        ["ok", "map-pinned", "<b>Coherente:</b> Calama pertenece al Equipo Antofagasta (región en alerta: 76,2%)."],
        ["info", "sparkles", `<b>Resumen IA:</b> Entrega exitosa con 34% de inscripción a El Gran Viaje (promedio nacional 29%).`],
      ].map(([t, ic, x], i) => `<div class="flag flag--${t}" style="animation-delay:${i * 120}ms"><i data-lucide="${ic}"></i><span>${x}</span></div>`).join("")
        + (userImg ? `<div class="flag flag--info"><i data-lucide="info"></i><span>Demo: la extracción de tu foto es simulada. En producción se usaría un modelo de visión/OCR en el servidor.</span></div>` : "");
      icons(); busy = false;
      toast("Reporte extraído y validado — listo para consolidar", "file-check-2");
    }
    $("#runOcr").addEventListener("click", run);
    $("#ocrFile").addEventListener("change", (e) => {
      const file = e.target.files[0]; if (!file) return;
      const url = URL.createObjectURL(file);
      let img = $("img.user-img", stage);
      if (!img) { img = document.createElement("img"); img.className = "user-img"; img.alt = "Evidencia subida"; stage.prepend(img); }
      img.src = url; userImg = true; $(".doc", stage).style.visibility = "hidden";
      run();
    });
  }

  /* ---------------- D · LOGÍSTICA ---------------- */
  function initLogistics() {
    // conteo por visión
    const conv = $("#conveyor");
    if (!conv) return;
    let count = 0;
    setInterval(() => {
      if (!isDemoOn("logi")) return;
      const b = document.createElement("div");
      const tag = "CL-" + (Math.random() * 1e5 | 0).toString().padStart(5, "0");
      b.className = "cbox" + (Math.random() < .35 ? " green" : "");
      b.dataset.tag = tag;
      b.style.transform = `scale(${.85 + Math.random() * .25})`;
      conv.appendChild(b);
      // momento exacto en que el centro de la caja cruza la línea del sensor (60%)
      const W = conv.offsetWidth, tCross = 5000 * (0.6 * W + 80 - 31) / (W + 100);
      setTimeout(() => {
        const conf = (95 + Math.random() * 4.8).toFixed(1);
        b.classList.add("det"); b.innerHTML = `<b>caja ${conf}%</b>`;
        count++; $("#cvCount").textContent = fmt(count); $("#cvTag").textContent = tag; $("#cvConf").textContent = conf + "%";
      }, tCross);
      setTimeout(() => b.remove(), 5200);
    }, 1300);

    // rutas
    const svg = $("#routes");
    const CITIES = ["Iglesia A", "Iglesia B", "Iglesia C", "Iglesia D", "Iglesia E", "Iglesia F", "Iglesia G", "Iglesia H", "Iglesia I"];
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const len = (pts, ord) => ord.reduce((s, _, i) => s + d(pts[ord[i]], pts[ord[(i + 1) % ord.length]]), 0);
    function solve(pts) {
      // vecino más cercano + 2-opt (lo que OR-Tools hace mejor a escala)
      const left = new Set(pts.map((_, i) => i).slice(1)); const ord = [0];
      while (left.size) { const last = pts[ord.at(-1)]; let best = null; left.forEach((i) => { if (best === null || d(last, pts[i]) < d(last, pts[best])) best = i; }); ord.push(best); left.delete(best); }
      let improved = true;
      while (improved) {
        improved = false;
        for (let i = 1; i < ord.length - 1; i++) for (let k = i + 1; k < ord.length; k++) {
          const nw = [...ord.slice(0, i), ...ord.slice(i, k + 1).reverse(), ...ord.slice(k + 1)];
          if (len(pts, nw) < len(pts, ord) - .01) { ord.splice(0, ord.length, ...nw); improved = true; }
        }
      }
      return ord;
    }
    function draw() {
      const pts = [{ x: 200, y: 150, n: "Bodega" }, ...CITIES.map((n) => ({ x: 30 + Math.random() * 340, y: 25 + Math.random() * 250, n }))];
      const naive = pts.map((_, i) => i), opt = solve(pts);
      const path = (o) => "M" + o.map((i) => `${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`).join("L") + "Z";
      svg.innerHTML = `<path class="naive" d="${path(naive)}"/><path class="opt" id="optPath" d="${path(opt)}"/>` +
        pts.map((p, i) => i ? `<circle class="node" cx="${p.x}" cy="${p.y}" r="6"/><text x="${p.x + 9}" y="${p.y + 3}">${p.n.replace("Iglesia ", "")}</text>`
          : `<circle class="depot" cx="${p.x}" cy="${p.y}" r="10"/><text x="${p.x + 13}" y="${p.y + 4}" font-weight="700">Bodega</text>`).join("");
      const op = $("#optPath"), L = op.getTotalLength();
      op.style.strokeDasharray = L; op.style.strokeDashoffset = L;
      op.getBoundingClientRect();
      op.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1)"; op.style.strokeDashoffset = 0;
      const k = 1.9, a = len(pts, naive) * k, b = len(pts, opt) * k;
      animateCount($("#dNaive"), a, 0, "", 900); animateCount($("#dOpt"), b, 0, "", 1400);
      $("#dSave").textContent = `−${Math.round((1 - b / a) * 100)}% km`;
    }
    $("#reroute").addEventListener("click", draw);
    demoHooks.logi = () => draw();
    draw();

    // demanda
    $("#demand").innerHTML = REGIONS.map((r) => {
      const hist = [.78, .84, .9, .95, 1].map((f) => r.b * f * (0.96 + Math.random() * .08));
      const growth = r.d < 82 ? -2 + Math.random() * 4 : 3 + Math.random() * 6;
      const pred = r.b * (1 + growth / 100);
      const all = [...hist, pred], mx = Math.max(...all), mn = Math.min(...all);
      const sp = all.map((v, i) => `${(i / 5) * 100},${26 - ((v - mn) / (mx - mn || 1)) * 22}`).join(" L");
      return `<div class="dcell${r.d < 80 ? " alert" : ""}"><small>${r.s}</small><strong>${fmt(pred)}</strong><span class="delta ${growth >= 0 ? "up" : "dn"}">${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%</span>
        <svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><path d="M${sp}"/></svg></div>`;
    }).join("");
  }

  /* ---------------- E · DASHBOARD ---------------- */
  function initDashboard() {
    const data = REGIONS.map((r) => ({ ...r }));
    let sort = "geo";
    const barsEl = $("#bars");
    barsEl.innerHTML = data.map((r) => `<div class="bar" data-i="${r.i}"><span class="bar__name" title="${r.n}">${r.s}</span><div class="bar__track"><div class="bar__fill"></div></div><span class="bar__val"></span></div>`).join("");
    const rowH = () => ($(".bar", barsEl)?.offsetHeight || 20) + 7;

    function render() {
      const order = [...data].sort((a, b) => (sort === "pct" ? b.d - a.d : a.i - b.i));
      barsEl.style.position = "relative";
      barsEl.style.height = order.length * rowH() + "px";
      order.forEach((r, pos) => {
        const el = $(`.bar[data-i="${r.i}"]`, barsEl);
        el.style.position = "absolute"; el.style.left = 0; el.style.right = 0; el.style.top = 0;
        el.style.transform = `translateY(${pos * rowH()}px)`;
        el.className = "bar" + (r.d < 80 ? " low" : r.d < 88 ? " mid" : "");
        $(".bar__fill", el).style.width = r.d + "%";
        $(".bar__val", el).textContent = fmt(r.d, 1) + "%";
      });
      const total = data.reduce((a, r) => a + r.b, 0);
      const dist = data.reduce((a, r) => a + r.b * r.d, 0) / total;
      $("#kDist").textContent = fmt(dist, 1) + "%";
      $("#ringDist").style.setProperty("--p", dist.toFixed(1));
      $("#kTotal").textContent = fmt(total);
      const low = data.filter((r) => r.d < 80);
      $("#kAlerts").textContent = low.length;
      $("#alerts").innerHTML = (low.length ? low.map((r) => `<li><i data-lucide="triangle-alert"></i><div><strong>${r.n}: ${fmt(r.d, 1)}%</strong>${fmt(Math.round(r.b * (1 - r.d / 100)))} cajas sin distribuir · equipo notificado</div></li>`).join("")
        : `<li class="ok"><i data-lucide="party-popper"></i><div><strong>¡Todas las regiones sobre 80%!</strong>Meta de cumplimiento alcanzada.</div></li>`)
        + `<li class="ok"><i data-lucide="trending-up"></i><div><strong>Metropolitana lidera</strong>${fmt(data[6].d, 1)}% distribuido</div></li>`;
      icons();
      return { dist, low, total };
    }
    $("#sortSeg").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#sortSeg button").forEach((x) => x.classList.toggle("is-on", x === b)); sort = b.dataset.s; render();
    });

    // tiempo real: llegan reportes nuevos
    setInterval(() => {
      if (!isDemoOn("dash")) return;
      const r = data[(Math.random() * data.length) | 0];
      if (r.d < 99) r.d = Math.min(99.4, r.d + Math.random() * .9);
      render();
    }, 2500);

    async function summary() {
      const s = render(), el = $("#summary");
      const sorted = [...data].sort((a, b) => b.d - a.d);
      const txt = `Resumen ejecutivo (generado por IA · ${new Date().toLocaleDateString("es-CL")}): A nivel nacional se han distribuido el ${fmt(s.dist, 1)}% de ${fmt(s.total)} cajas. `
        + `Las regiones con mejor desempeño son ${sorted[0].s} (${fmt(sorted[0].d, 1)}%) y ${sorted[1].s} (${fmt(sorted[1].d, 1)}%). `
        + (s.low.length ? `Requieren apoyo inmediato: ${s.low.map((r) => `${r.s} (${fmt(r.d, 1)}%)`).join(", ")}; se recomienda reasignar voluntarios de logística y revisar rutas de entrega. ` : "Ninguna región está bajo el umbral de 80%. ")
        + `Con la tendencia actual, la proyección indica 43 contenedores para 2027, superando la meta de 42.`;
      el.innerHTML = ""; const span = document.createElement("span"); const caret = document.createElement("span"); caret.className = "caret";
      el.append(span, caret);
      for (const w of txt.split(" ")) { span.textContent += w + " "; await sleep(28); }
      caret.remove();
    }
    $("#regen").addEventListener("click", summary);

    // forecast
    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];
    const real = [18, 22, 26, 29, 33, 36, 38];
    const pred = 43, goal = 42;
    $("#kCont").textContent = `${real.at(-1)} → ${goal}`;
    $("#kContEta").textContent = `Predicción 2027: ${pred} ✓`;
    $("#kContEta").className = "up";
    const W = 800, H = 220, pl = 40, pr = 20, pt = 16, pb = 30;
    const x = (i) => pl + (i / (years.length - 1)) * (W - pl - pr);
    const y = (v) => pt + (1 - (v - 10) / 40) * (H - pt - pb);
    const svg = $("#forecast");
    let g = "";
    [10, 20, 30, 40, 50].forEach((v) => (g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text x="6" y="${y(v) + 4}">${v}</text>`));
    years.forEach((yr, i) => (g += `<text x="${x(i) - 15}" y="${H - 8}">${yr}</text>`));
    const rp = real.map((v, i) => `${x(i)},${y(v)}`).join(" L");
    const li = real.length - 1;
    g += `<path class="band" d="M${x(li)},${y(real[li])} L${x(li + 1)},${y(pred + 3)} L${x(li + 1)},${y(pred - 3)} Z"/>`;
    g += `<line class="goal" x1="${pl}" x2="${W - pr}" y1="${y(goal)}" y2="${y(goal)}"/><text x="${W - pr - 90}" y="${y(goal) - 6}" style="fill:#d49112;font-weight:700">Meta 42</text>`;
    g += `<path class="real draw" style="--len:900" d="M${rp}"/>`;
    g += `<path class="pred" d="M${x(li)},${y(real[li])} L${x(li + 1)},${y(pred)}"/>`;
    g += real.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="var(--red)"><title>${years[i]}: ${v} contenedores</title></circle>`).join("");
    g += `<circle cx="${x(li + 1)}" cy="${y(pred)}" r="6" fill="var(--pine-2)"><title>Predicción 2027: ${pred}</title></circle><text x="${x(li + 1) - 70}" y="${y(pred) - 10}" style="fill:var(--pine-2);font-weight:700">Pred. ${pred}</text>`;
    svg.innerHTML = g;

    let first = true;
    demoHooks.dash = () => { render(); if (first) { first = false; summary(); } };
    render();
  }

  /* ---------------- H · CHAT RAG ---------------- */
  const KB = [
    {
      cat: "Saludos",
      route: "Asistente OCC",
      kw: [
        "hola", "buenos dias", "buen dia", "buenas tardes", "buenas noches", "buena tarde",
        "buenas", "que tal", "como estas", "como te va", "como esta", "saludos",
        "hi", "hello", "hey", "how are you", "good morning", "good evening",
        "ola", "oi", "bom dia", "boa tarde", "boa noite"
      ],
      src: ["Asistente OCC Chile", "Atención al usuario"],
      a: {
        es: "¡Hola! Bendiciones 🙏 Qué alegría saludarte. Soy el asistente inteligente de OCC Chile. Estoy aquí para orientarte sobre el armado de cajitas, postulación de iglesias, fechas, voluntariado o reportes. ¿En qué te puedo ayudar hoy?",
        en: "Hello! Blessings 🙏 Great to connect with you. I'm the OCC Chile smart assistant. I'm here to help with packing shoeboxes, church applications, key dates, volunteering, or reports. How can I assist you today?",
        pt: "Olá! Bênçãos 🙏 Que alegria falar com você! Sou o assistente inteligente da OCC Chile. Como posso te ajudar hoje?"
      }
    },
    {
      cat: "Bendiciones",
      route: "Comunidad de fe",
      kw: [
        "bendiciones", "dios te bendiga", "dios los bendiga", "que dios te bendiga",
        "paz de dios", "paz del senor", "amen", "gloria a dios", "shalom", "god bless", "blessings"
      ],
      src: ["Comunidad de fe", "OCC Chile"],
      a: {
        es: "¡Amén! Muchas bendiciones para ti y tu comunidad. 🙏 Es un privilegio servir juntos en esta misión de llevar el amor de Dios y alegría a los niños de Chile. ¿Tienes alguna pregunta sobre el proceso o tu iglesia?",
        en: "Amen! Many blessings to you and your community. 🙏 It is a privilege to serve together in sharing God's love and joy with children in Chile. How can I assist you today?",
        pt: "Amém! Muitas bênçãos para você e sua comunidade. 🙏 É um privilégio servir juntos. Em que posso te ajudar hoje?"
      }
    },
    {
      cat: "Agradecimientos",
      route: "Atención al usuario",
      kw: [
        "gracias", "muchas gracias", "te agradezco", "agradecido", "agradecida",
        "chao", "adios", "hasta luego", "nos vemos", "que estes bien",
        "thanks", "thank you", "bye", "see you", "obrigado", "obrigada", "valeu"
      ],
      src: ["Atención al usuario", "OCC Chile"],
      a: {
        es: "¡De nada! Que Dios te bendiga mucho. Si necesitas algo más sobre el proceso de las cajitas o tu iglesia, aquí estaré siempre disponible. ¡Hasta pronto! 👋✨",
        en: "You're very welcome! God bless you. If you need anything else about shoeboxes or your church, I'm always here. See you soon! 👋✨",
        pt: "De nada! Deus te abençoe muito. Estou sempre por aqui se precisar de algo mais. Até logo! 👋✨"
      }
    },
    {
      cat: "Identidad",
      route: "Misión y Visión",
      kw: [
        "quien eres", "quien sos", "que haces", "como te llamas", "que es occ",
        "que es operacion nino de la navidad", "que es samaritan", "samaritans purse",
        "mision", "proposito", "quienes son", "what is occ", "who are you"
      ],
      src: ["Misión y Visión OCC Chile", "Samaritan's Purse International"],
      a: {
        es: "Operación Niño de la Navidad (OCC) es un ministerio de Samaritan's Purse que colabora con iglesias locales en Chile y más de 170 países para entregar cajitas llenas de regalos a niños en situación de vulnerabilidad, compartiendo el mensaje del Evangelio y el programa de discipulado 'El Gran Viaje'. En Chile llegamos desde el Altiplano hasta la Patagonia.",
        en: "Operation Christmas Child (OCC) is a ministry of Samaritan's Purse partnering with local churches in Chile and over 170 countries to deliver gift-filled shoeboxes to children in need, sharing the Gospel and The Greatest Journey discipleship program.",
        pt: "Operação Natal de Jesus (OCC) é um ministério de Samaritan's Purse em parceria com igrejas locais para levar caixas de presentes e o Evangelho a crianças vulneráveis."
      }
    },
    {
      cat: "Iglesias",
      route: "Equipo regional",
      kw: [
        "iglesia", "postular", "participar", "ser parte", "inscribir", "ministerio",
        "congregacion", "pastor", "pastora", "lider", "requisitos", "templo", "capilla",
        "comunidad", "anotar", "anotarme", "registrar", "recibir cajas", "como participo",
        "church", "join", "igreja"
      ],
      src: ["Manual de Iglesias Participantes §2", "Página ¿Quieres ser parte?"],
      a: {
        es: "¡Qué alegría! Tu iglesia puede postular completando el formulario inteligente (sección '¿Quieres ser parte?'): solo necesitas nombre de la iglesia, contacto pastoral, dirección postal y de distribución, cantidad de niños estimada, email y celular. Te asignamos automáticamente al equipo regional correspondiente y te contactamos en minutos.",
        en: "Wonderful! Your church can apply through the smart form (section 'Partner With Us'): church name, pastoral contact, postal and distribution addresses, estimated children count, email and phone. You will be assigned to your regional team right away.",
        pt: "Que alegria! Sua igreja pode se inscrever pelo formulário inteligente: nome da igreja, contato pastoral, endereço postal e de distribuição, número estimado de crianças, e-mail e celular."
      }
    },
    {
      cat: "Armado de cajas",
      route: "Resuelto por IA",
      kw: [
        "caja", "cajita", "cajas", "cajitas", "armar", "poner", "echar", "meter", "llevar",
        "regalo", "regalos", "que va", "prohibido", "prohibiciones", "box", "pack", "caixa",
        "contenido", "articulos", "juguetes", "dulces", "comida", "ropa", "zapatos",
        "pasta de dientes", "cepillo", "jabon", "cuadernos", "lapices", "peluche", "pelota", "tamano", "medidas"
      ],
      src: ["Guía de armado de cajas", "FAQ #4"],
      a: {
        es: "Elige si la cajita es para niño o niña y el rango etario (2–4, 5–9 o 10–14 años). Incluye un artículo destacado (peluche, muñeca, pelota con bombín), útiles escolares (cuadernos, lápices), artículos de higiene (cepillo, jabón, peineta) y un mensaje o foto personal. ⚠️ No incluyas: alimentos, dulces, líquidos, medicamentos, artículos usados ni juguetes bélicos.",
        en: "Choose boy or girl and age range (2–4, 5–9, 10–14). Include a 'wow' item (stuffed animal, doll, soccer ball with pump), school supplies, hygiene items (toothbrush, bar soap, comb) and a personal note/photo. ⚠️ Do not include: food, candy, liquids, medicine, used items or war-related toys.",
        pt: "Escolha menino ou menina e a faixa etária (2–4, 5–9, 10–14). Inclua um item especial, material escolar, higiene e um bilhete pessoal. ⚠️ Não inclua comida, doces, líquidos, remédios, itens usados ou brinquedos de guerra."
      }
    },
    {
      cat: "Fechas y Acopio",
      route: "Red logística",
      kw: [
        "fechas", "cuando", "plazos", "calendario", "cronograma", "donde entregar",
        "donde dejar", "acopio", "punto de entrega", "recoleccion", "cuando entregan",
        "fecha limite", "donde se entregan", "donde se dejan", "entregar", "entregan",
        "dates", "when", "deadline", "schedule"
      ],
      src: ["Cronograma Nacional OCC 2026", "Red de Puntos de Acopio"],
      a: {
        es: "El calendario anual OCC Chile: las iglesias postulan entre marzo y agosto; la capacitación de coordinadores y maestros se realiza en septiembre y octubre; la Semana Nacional de Recolección es en noviembre (cuando se entregan las cajas a los centros de acopio regionales), y las celebraciones de distribución con los niños se realizan entre diciembre y enero. Escríbenos a WhatsApp (+56 9 37479835) para ubicar tu centro de acopio más cercano.",
        en: "Annual OCC Chile schedule: Church applications open March to August; leader training runs September–October; National Collection Week is in November (drop-off at regional centers); and festive distributions occur December–January. Contact WhatsApp (+56 9 37479835) for your nearest drop-off point.",
        pt: "O cronograma da OCC: inscrições de março a agosto, capacitação em setembro-outubro, coleta em novembro e distribuições entre dezembro e janeiro."
      }
    },
    {
      cat: "Gratuidad",
      route: "Transparencia y Ética",
      kw: [
        "cuanto cuesta", "costo", "valor", "precio", "cobrar", "cobran", "gratis",
        "se pagan", "vender", "venta", "cuanto vale", "pago", "price", "free", "cost"
      ],
      src: ["Código de Integridad OCC", "Política de Gratuidad"],
      a: {
        es: "¡Las cajitas son 100% gratuitas para los niños, sus familias y las comunidades! Son regalos de amor incondicional. Jamás se cobra dinero por recibir una cajita, por asistir a los eventos de entrega ni por participar en las clases de discipulado de 'El Gran Viaje'.",
        en: "Shoeboxes are 100% free for children, families and communities! They are gifts of unconditional love. Nothing is ever charged to receive a box or join The Greatest Journey discipleship.",
        pt: "As caixas são 100% gratuitas para crianças e famílias! São presentes de amor incondicional sem nenhum custo."
      }
    },
    {
      cat: "Contacto y Soporte",
      route: "Canal oficial",
      kw: [
        "contacto", "telefono", "whatsapp", "celular", "wsp", "numero",
        "hablar con alguien", "humano", "persona", "atencion", "llamar", "contact", "phone"
      ],
      src: ["Canales de Atención Oficial", "WhatsApp OCC Chile"],
      a: {
        es: "Puedes comunicarte directamente con nuestro equipo a través de nuestro WhatsApp oficial: <a href='https://wa.me/56937479835' target='_blank' style='color:var(--gold);font-weight:700;text-decoration:underline'>+56 9 37479835</a> o dejarnos tus datos en el formulario de contacto. ¡Estaremos felices de orientarte!",
        en: "You can reach our team directly via our official WhatsApp: <a href='https://wa.me/56937479835' target='_blank' style='color:var(--gold);font-weight:700;text-decoration:underline'>+56 9 37479835</a> or submit the website contact form. We'll be glad to help!",
        pt: "Você pode falar diretamente com nossa equipe pelo WhatsApp oficial: +56 9 37479835."
      }
    },
    {
      cat: "Testimonios",
      route: "Comunicaciones",
      kw: [
        "testimonio", "testimonios", "historia", "historias", "video", "videos",
        "experiencia", "milagro", "vidas transformadas", "relatos", "stories", "testimonies"
      ],
      src: ["Historias de Vida OCC Chile", "Testimonios 2026"],
      a: {
        es: "En la sección 'Historias reales del amor de Dios' puedes ver los testimonios de Agustín (Santiago), Johan (Viña del Mar) y Gaspar, con fotos y videos. Si tu iglesia o familia vivió una experiencia transformadora con OCC, puedes pulsar 'Compartir mi testimonio' o escribirnos al WhatsApp +56 9 37479835.",
        en: "In our 'Real stories of God's love' section you can explore testimonies of Agustin, Johan and Gaspar with videos and photos. If you'd like to share your story, click 'Share my testimony' or message WhatsApp +56 9 37479835.",
        pt: "Na seção de Testemunhos você pode conhecer histórias de vidas transformadas e vídeos de crianças no Chile."
      }
    },
    {
      cat: "Reportes",
      route: "Resuelto por IA",
      kw: [
        "reporte", "informe", "distribucion", "post", "planilla", "formulario",
        "evidencia", "foto", "asistencia", "acta", "report"
      ],
      src: ["Instructivo Reporte Post-Distribución", "Módulo C"],
      a: {
        es: "El reporte post-distribución se realiza desde el formulario inteligente de 3 pasos: subes la foto de la planilla de asistencia y la IA extrae automáticamente asistencia de niños, cajas entregadas y fecha. Si el sistema detecta inconsistencias (como más cajas que niños), te pedirá confirmación antes de guardar.",
        en: "The post-distribution report is a 3-step native form: take a photo of your attendance sheet and AI extracts attendees, boxes delivered and date, checking for any inconsistencies before submitting.",
        pt: "O relatório pós-distribuição é feito em 3 etapas com verificação de fotos e lista de presença por IA."
      }
    },
    {
      cat: "Discipulado",
      route: "Equipo de capacitación",
      kw: [
        "gran viaje", "discipulado", "maestro", "lecciones", "curso", "clases",
        "12 lecciones", "material", "capacitacion", "journey", "teacher"
      ],
      src: ["Guía del Maestro – El Gran Viaje", "Reporte del Maestro"],
      a: {
        es: "El Gran Viaje es un discipulado de 12 lecciones bíblicas creado para los niños que reciben una cajita. Los maestros de las iglesias locales reciben capacitación presencial u online (con módulos y cuestionarios interactivos) y reportan el avance y graduación de los niños desde el celular.",
        en: "The Greatest Journey is a 12-lesson discipleship program designed for children who receive a shoebox. Local church teachers receive training and submit class progress and graduations right from their phone.",
        pt: "A Maior Jornada é o programa de discipulado em 12 lições bíblicas para as crianças que recebem uma caixa."
      }
    },
    {
      cat: "Voluntariado",
      route: "Coordinación de voluntarios",
      kw: [
        "voluntario", "voluntariado", "ayudar", "servir", "rol", "equipo", "sumarme",
        "inscribirme", "colaborar", "volunteer", "help"
      ],
      src: ["Manual del Voluntario", "Roles de equipos regionales"],
      a: {
        es: "Hay 6 roles en los equipos regionales: coordinación general, relación con iglesias, logística y centros de acopio, comunicaciones y prensa, capacitación de discipulado y gestión de datos. Cuéntame qué habilidades tienes o tu región y te orientamos al rol ideal.",
        en: "There are 6 roles on regional teams: coordination, church relations, logistics/drop-off, communications, discipleship training, and data management. Tell me your skills and region to connect you with the right team.",
        pt: "Há 6 funções nas equipes regionais: coordenação, igrejas, logística, comunicação, capacitação e dados."
      }
    },
    {
      cat: "Donaciones",
      route: "Equipo de donaciones",
      kw: [
        "donar", "donacion", "dinero", "envio", "costo", "aporte", "pagar",
        "transferencia", "cuenta", "banco", "donate", "doar"
      ],
      src: ["FAQ Donaciones", "Política de transparencia"],
      a: {
        es: "Puedes apoyar armando cajitas o realizando un aporte financiero para cubrir los costos de transporte marítimo, aduanas y el material de discipulado de El Gran Viaje. Para datos bancarios y certificados, te contactaremos con el equipo de donaciones.",
        en: "You can support by packing shoeboxes or donating toward shipping logistics and discipleship booklets. For account details and tax receipts, we'll route you to the donations team.",
        pt: "Você pode ajudar montando caixas ou contribuindo financeiramente para o transporte e material de discipulado."
      }
    },
    {
      cat: "Prensa",
      route: "Comunicaciones",
      kw: [
        "prensa", "medio", "entrevista", "periodista", "noticia", "comunicado",
        "radio", "television", "press", "media"
      ],
      src: ["Kit de prensa OCC Chile", "Sala de prensa"],
      a: {
        es: "Para entrevistas, notas de prensa o material audiovisual oficial, te conectamos con el equipo de comunicaciones. También puedes descargar el kit de prensa con estadísticas nacionales y fotografías autorizadas en alta resolución.",
        en: "For interviews, press releases, or official media assets, we connect you with our communications team, where you can download our approved press kit.",
        pt: "Para entrevistas ou notas de imprensa, conectamos você com nossa equipe de comunicação."
      }
    }
  ];
  const UI = {
    es: {
      hi: "¡Hola! Bendiciones 🙏 Soy el asistente inteligente de OCC Chile. ¿En qué te puedo ayudar hoy?",
      miss: "No encontré esa información exacta en los manuales oficiales. He derivado tu consulta a un coordinador del equipo regional para que te responda a la brevedad. También puedes escribirnos directamente a WhatsApp: +56 9 37479835. 🙏",
      chips: ["¡Hola, bendiciones!", "¿Cómo postula mi iglesia?", "¿Qué pongo en una cajita?", "¿Cuándo y dónde se entregan?", "¿Las cajitas son gratis?", "¿Cómo hago el reporte?", "Quiero ser voluntario", "¿Qué es El Gran Viaje?"]
    },
    en: {
      hi: "Hello! Blessings 🙏 I'm the OCC Chile smart assistant. How can I help you today?",
      miss: "I couldn't find that exact information in official manuals. I've forwarded your query to our regional team. You can also message us directly on WhatsApp: +56 9 37479835. 🙏",
      chips: ["Hello, blessings!", "How can my church join?", "What goes in a shoebox?", "When & where to drop off?", "Are shoeboxes free?", "How do I report?", "I want to volunteer"]
    },
    pt: {
      hi: "Olá! Bênçãos 🙏 Sou o assistente inteligente da OCC Chile. Como posso te ajudar hoje?",
      miss: "Não encontrei essa informação nos manuais oficiais. Encaminhei sua pergunta para nossa equipe. Você também pode nos contatar no WhatsApp: +56 9 37479835. 🙏",
      chips: ["Olá, bênçãos!", "Como minha igreja participa?", "O que vai na caixa?", "Onde entregar?", "Quero ser voluntário"]
    },
  };
  function initChat() {
    const body = $("#chatBody"), form = $("#chatForm");
    if (!body || !form) return;
    const input = $("#chatIn"), langSel = $("#lang");
    let lang = "es", busy = false;
    const add = (html, who) => {
      const m = document.createElement("div"); m.className = "msg msg--" + who; m.innerHTML = html; body.appendChild(m);
      body.scrollTop = body.scrollHeight; icons(); return m;
    };
    const chips = () => { $("#chatChips").innerHTML = UI[lang].chips.map((c) => `<button type="button">${c}</button>`).join(""); };
    const steps = $$("#ragSteps li");
    const setStep = (i, txt) => { steps[i].classList.add("on"); steps[i].querySelector("span").textContent = txt; };
    async function ask(q) {
      if (busy || !q.trim()) return; busy = true;
      add(q.replace(/</g, "&lt;"), "user");
      steps.forEach((s) => { s.classList.remove("on"); s.querySelector("span").textContent = "—"; });
      const t = add(`<span class="typing"><i></i><i></i><i></i></span>`, "bot");
      const nq = norm(q);
      const scored = KB.map((k) => ({
        k,
        s: k.kw.reduce((a, w) => {
          const nw = norm(w);
          if (!nw) return a;
          if (nq === nw) return a + nw.length * 4;
          if (nq.split(" ").includes(nw)) return a + nw.length * 2.5;
          if (nq.includes(nw)) return a + nw.length;
          return a;
        }, 0),
      })).sort((a, b) => b.s - a.s);
      const hit = scored[0].s > 0 ? scored[0].k : null;
      await sleep(350); setStep(0, hit ? `${hit.cat} · confianza ${(.82 + Math.random() * .15).toFixed(2)}` : "Sin categoría clara");
      await sleep(450); setStep(1, hit ? `${hit.src.length} fragmentos · top-k=4` : "0 fragmentos relevantes");
      await sleep(450); setStep(2, hit ? `Respuesta con ${hit.src.length} citas · ${lang.toUpperCase()}` : "Se evita inventar respuesta");
      await sleep(250); setStep(3, hit ? hit.route : "Humano · bandeja de atención");
      t.remove();
      if (hit) add(`${hit.a[lang]}<div class="src">${hit.src.map((s) => `<span><i data-lucide="file-text" style="width:12px;height:12px"></i>${s}</span>`).join("")}</div>`, "bot");
      else add(UI[lang].miss, "bot");
      busy = false;
    }
    form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
    $("#chatChips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    langSel.addEventListener("change", () => { lang = langSel.value; chips(); add(UI[lang].hi, "bot"); toast("Idioma cambiado · traducción con IA", "languages"); });
    add(UI.es.hi, "bot"); chips();

    const topics = [["Armado de cajas", 34], ["Fechas de recolección", 26], ["Postulación de iglesias", 18], ["Reportes", 12], ["Voluntariado", 10]];
    $("#topics").innerHTML = topics.map(([n, v]) => `<div class="topic"><span>${n}</span><b>${v}%</b><i style="--w:${v * 2.5}%"></i></div>`).join("");
  }

  /* ---------------- WIDGET FLOTANTE ASISTENTE OCC (IA) ---------------- */
  function initChatWidget() {
    const widget = $("#chatWidget"),
      fab = $("#fabAgent"),
      body = $("#widgetChatBody"),
      form = $("#widgetChatForm"),
      input = $("#widgetChatIn"),
      langSel = $("#widgetLang"),
      closeBtn = $("#widgetClose"),
      expandBtn = $("#widgetExpand");

    if (!widget || !fab) return;

    let lang = LANG, busy = false, initialized = false;

    const add = (html, who) => {
      const m = document.createElement("div");
      m.className = "msg msg--" + who;
      m.innerHTML = html;
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      icons();
      return m;
    };

    const chips = () => {
      const cWrap = $("#widgetChatChips");
      if (!cWrap) return;
      cWrap.innerHTML = (UI[lang]?.chips || UI.es.chips)
        .map((c) => `<button type="button">${c}</button>`)
        .join("");
    };

    function startConversation() {
      if (initialized) return;
      initialized = true;
      add(UI[lang].hi, "bot");
      chips();
    }

    async function askWidget(q) {
      if (busy || !q.trim()) return;
      busy = true;
      add(q.replace(/</g, "&lt;"), "user");
      const t = add(`<span class="typing"><i></i><i></i><i></i></span>`, "bot");
      const nq = norm(q);
      const scored = KB.map((k) => ({
        k,
        s: k.kw.reduce((a, w) => {
          const nw = norm(w);
          if (!nw) return a;
          if (nq === nw) return a + nw.length * 4;
          if (nq.split(" ").includes(nw)) return a + nw.length * 2.5;
          if (nq.includes(nw)) return a + nw.length;
          return a;
        }, 0),
      })).sort((a, b) => b.s - a.s);
      const hit = scored[0].s > 0 ? scored[0].k : null;

      await sleep(550);
      t.remove();

      if (hit) {
        add(
          `${hit.a[lang]}<div class="src">${hit.src
            .map(
              (s) =>
                `<span><i data-lucide="file-text" style="width:12px;height:12px"></i>${s}</span>`
            )
            .join("")}</div>`,
          "bot"
        );
      } else {
        add(UI[lang].miss, "bot");
      }
      busy = false;
    }

    function openWidget() {
      widget.classList.add("is-open");
      widget.setAttribute("aria-hidden", "false");
      fab.classList.add("is-active");
      fab.setAttribute("aria-expanded", "true");
      startConversation();
      setTimeout(() => input?.focus(), 150);
    }

    function closeWidget() {
      widget.classList.remove("is-open");
      widget.setAttribute("aria-hidden", "true");
      fab.classList.remove("is-active");
      fab.setAttribute("aria-expanded", "false");
    }

    function toggleWidget() {
      if (widget.classList.contains("is-open")) {
        closeWidget();
      } else {
        openWidget();
      }
    }

    fab.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWidget();
    });

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      closeWidget();
    });

    expandBtn?.addEventListener("click", (e) => {
      closeWidget();
      const chatTab = document.querySelector('.demo-tab[data-demo="chat"]');
      if (chatTab) {
        chatTab.click();
        const demoChatEl = document.getElementById("demo-chat");
        if (demoChatEl) {
          demoChatEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value;
      input.value = "";
      askWidget(q);
    });

    $("#widgetChatChips")?.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b) askWidget(b.textContent);
    });

    langSel?.addEventListener("change", () => {
      lang = langSel.value;
      chips();
      add(UI[lang].hi, "bot");
      toast("Idioma cambiado · traducción con IA", "languages");
      const mainLang = $("#lang");
      if (mainLang && mainLang.value !== lang) {
        mainLang.value = lang;
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && widget.classList.contains("is-open")) {
        closeWidget();
      }
    });

    document.addEventListener("click", (e) => {
      if (
        widget.classList.contains("is-open") &&
        !widget.contains(e.target) &&
        !fab.contains(e.target)
      ) {
        closeWidget();
      }
    });
  }

  /* ---------------- ARQUITECTURA ---------------- */
  function initArch() {
    const matrix = $("#matrix");
    if (!matrix) return;
    const mods = [["A", "Iglesias", "church"], ["B", "Voluntarios", "users"], ["C", "Reportes", "clipboard-check"], ["D", "Logística", "truck"],
      ["E", "Métricas", "layout-dashboard"], ["F", "Capacitación", "graduation-cap"], ["G", "Comunicación", "megaphone"], ["H", "Soporte", "life-buoy"]];
    $("#archMods").innerHTML = mods.map(([k, n, ic]) => `<span><i data-lucide="${ic}"></i><b>${k}</b> ${n}</span>`).join("");
  }

  /* ---------------- CENTRO DE DATOS (gráficos en vivo) ---------------- */
  function initDatosSection() {
    const ringFill = $('[data-ring="pct"]');
    const pctText = $('[data-dato="pct"]');
    const regionsHost = $("#regionsChart");
    const liveCounter = $('[data-live="scan-datos"]');

    // ---- 1. Dona: Porcentaje entregado (Sincronizado 90,5%) ----
    if (ringFill && pctText) {
      const CIRC = 2 * Math.PI * 48; // r=48 -> 301.59
      let pctActual = 90.5;
      const updateRing = (pct) => {
        const v = Math.max(0, Math.min(100, pct));
        pctActual = v;
        ringFill.style.strokeDasharray = CIRC.toFixed(1);
        ringFill.style.strokeDashoffset = (CIRC * (1 - v / 100)).toFixed(1);
        pctText.textContent = v.toFixed(1).replace(".", ",") + "%";
      };
      updateRing(90.5);

      document.addEventListener("occ:pct", (e) => {
        if (!e.detail || typeof e.detail.value !== "number") return;
        updateRing(e.detail.value);
      });
    }

    // ---- 2. Cajitas entregadas en vivo y barras cápsula por región (AP..MG) ----
    if (regionsHost) {
      const pillBars = $$(".interactive-pill", regionsHost);

      // Contador en vivo sincronizado con el hero (206.274 cajitas)
      let totalCajas = 206274;
      if (liveCounter) liveCounter.textContent = fmt(totalCajas);

      let animToken = 0;
      const animTotalTo = (nuevoTotal) => {
        const desde = totalCajas;
        totalCajas = nuevoTotal;
        const hasta = totalCajas;
        const mio = ++animToken;
        const t0 = performance.now();
        const dur = 550;
        const paso = (now) => {
          if (mio !== animToken) return;
          const k = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          if (liveCounter) liveCounter.textContent = fmt(Math.round(desde + (hasta - desde) * eased));
          if (k < 1) requestAnimationFrame(paso);
          else if (liveCounter) liveCounter.textContent = fmt(hasta);
        };
        requestAnimationFrame(paso);
      };

      const PASOS = [5, 10, 50, 100, 1000];
      const spawnBadge = (deltaOpt) => {
        if (!pillBars.length) return;
        const i = Math.floor(Math.random() * pillBars.length);
        const delta = deltaOpt || PASOS[Math.floor(Math.random() * PASOS.length)];
        const barEl = pillBars[i];
        if (!barEl) return;

        const oldVal = parseInt(barEl.getAttribute("data-val"), 10) || 50;
        const stepPct = delta >= 1000 ? 2 : 1;
        const nextVal = oldVal >= 97 ? 62 : Math.min(98, oldVal + stepPct);
        barEl.setAttribute("data-val", String(nextVal));

        const fill = barEl.querySelector(".mx-bar__fill");
        const labelSpan = fill && fill.querySelector("span");
        if (fill) fill.style.height = nextVal + "%";
        if (labelSpan) labelSpan.textContent = nextVal + "%";
        barEl.title = `Ver detalle de ${barEl.dataset.barName || barEl.dataset.barId} (${barEl.dataset.barId}): ${nextVal}%`;

        barEl.classList.add("is-bump");
        setTimeout(() => barEl.classList.remove("is-bump"), 650);

        // Inserta badge flotante "+N" sobre la barra que sube en vivo (fuera de la columna)
        const badge = document.createElement("span");
        badge.className = "region-col__badge";
        badge.dataset.step = String(delta);
        badge.textContent = "+" + (delta >= 1000 ? "1k" : fmt(delta));
        barEl.appendChild(badge);
        setTimeout(() => badge.remove(), 1400);

        document.dispatchEvent(new CustomEvent("occ:bars-updated"));
      };

      // Reacciona al evento global sincronizado del hero
      document.addEventListener("occ:entrega", (e) => {
        const delta = (e.detail && e.detail.delta) || 5;
        const targetTotal = (e.detail && e.detail.total) || (totalCajas + delta);
        animTotalTo(targetTotal);
        spawnBadge(delta);
      });
    }
  }

  /* ---------------- CENTRO DE DATOS · panel de métricas (graficos + OCC) ---------------- */
  function initMetricsPanel() {
    const root = $("#datos");
    const modal = $("#mxModal");
    if (!root || !modal) return;

    const MX_YEARS = {
      "27": { volume: "42", unit: "meta", fullUnit: "contenedores meta", delta: "+18% proyección", peak: "+18% proyección" },
      "26": { volume: "38", unit: "anuales", fullUnit: "contenedores anuales", delta: "+15.2% vs '25", peak: "38 contenedores ('26)" },
      "25": { volume: "33", unit: "anuales", fullUnit: "contenedores anuales", delta: "+17.8% vs '24", peak: "33 contenedores ('25)" },
      "24": { volume: "28", unit: "anuales", fullUnit: "contenedores anuales", delta: "Base histórica", peak: "28 contenedores ('24)" },
    };

    // ---- Anillo radial: Porcentaje entregado (92,8%) ----
    let currentPct = 90.5;
    const ringFill = $('[data-ring="pct"]', root);
    const pctText = $('[data-dato="pct"]', root);
    const setPctRing = (value) => {
      const v = Math.max(0, Math.min(100, Number(value) || 90.5));
      currentPct = v;
      const circ = 2 * Math.PI * 48; // 301.59
      if (ringFill) {
        ringFill.style.strokeDasharray = circ.toFixed(1);
        ringFill.style.strokeDashoffset = (circ * (1 - v / 100)).toFixed(1);
      }
      if (pctText) pctText.textContent = v.toFixed(1).replace(".", ",") + "%";
    };

    // ---- Selector de año en Meta y Crecimiento ('24 - '27) ----
    const monthSel = $("#mxMonth", root);
    const volumeEl = $("[data-mx-volume]", root);
    const unitEl = $("[data-mx-unit]", root);
    const deltaEl = $("[data-mx-delta]", root);
    const peakEl = $("[data-mx-peak]", root);
    const yearPills = $$(".mx-year-pill", root);

    const selectYear = (yr) => {
      const y = MX_YEARS[yr] || MX_YEARS["27"];
      if (volumeEl) volumeEl.textContent = y.volume;
      if (unitEl) {
        const textEl = unitEl.querySelector("[data-mx-unit-text]");
        if (textEl) {
          textEl.textContent = y.unit;
        } else {
          unitEl.innerHTML = `<i data-lucide="container" aria-hidden="true"></i> <span data-mx-unit-text>${y.unit}</span>`;
          icons();
        }
        if (y.fullUnit) unitEl.setAttribute("aria-label", y.fullUnit);
      }
      if (deltaEl) deltaEl.textContent = y.delta;
      if (peakEl) peakEl.textContent = y.peak;
      yearPills.forEach((pill) => {
        pill.classList.toggle("is-peak", pill.dataset.year === yr);
      });
    };

    if (monthSel) {
      monthSel.addEventListener("change", () => selectYear(monthSel.value));
      monthSel.addEventListener("click", (e) => e.stopPropagation());
    }
    yearPills.forEach((pill) => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        const yr = pill.dataset.year || "27";
        if (monthSel) monthSel.value = yr;
        selectYear(yr);
      });
    });

    // ---- Barras interactivas por región (16 regiones AP..MG) ----
    const pillBars = root.querySelectorAll(".interactive-pill");
    const readBars = () => Array.from(pillBars).map((el) => ({
      el,
      id: el.getAttribute("data-bar-id") || "",
      name: el.getAttribute("data-bar-name") || el.getAttribute("data-bar-id") || "",
      category: el.getAttribute("data-category") || "",
      grad: el.getAttribute("data-grad") || "grad-blue",
      value: parseInt(el.getAttribute("data-val"), 10) || 0,
    }));
    const average = () => {
      const list = readBars();
      return list.length ? list.reduce((sum, b) => sum + b.value, 0) / list.length : 0;
    };
    const renderAggregates = () => {
      const avg = average();
      const avgEl = $("[data-mx-avg]", root);
      const availEl = $("[data-mx-avail]", root);
      const avgModal = $("[data-mx-avg-modal]", modal);
      if (avgEl) avgEl.textContent = avg.toFixed(1) + "%";
      if (availEl) availEl.textContent = (100 - avg).toFixed(1) + "%";
      if (avgModal) {
        avgModal.textContent = avg.toFixed(1) + "%";
        const compare = avgModal.closest(".mx-compare");
        const fill = compare && compare.querySelector(".mx-compare__avg");
        if (fill) fill.style.width = avg.toFixed(1) + "%";
      }
    };
    renderAggregates();
    document.addEventListener("occ:bars-updated", renderAggregates);

    $$(".mx-tabs button", root).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".mx-tabs button", root).forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
      });
    });

    // ---- Modal de detalle (integración exacta de telemetría interactiva) ----
    const modalContainer = document.getElementById("mxModalContainer") || $(".mx-modal__panel", modal);
    const modalBackdrop = document.getElementById("mxModalBackdrop") || $(".mx-modal__backdrop", modal);
    const btnClose = document.getElementById("mxBtnClose");
    const btnCloseAlt = document.getElementById("mxBtnCloseAlt");
    const modalStatusDot = document.getElementById("mxModalDot");
    const modalStatusBadge = document.getElementById("mxModalStatus");
    const modalCat = document.getElementById("mxModalCat");
    const modalTitle = document.getElementById("mxModalTitle");
    const modalSubtitle = document.getElementById("mxModalSubtitle");
    const metricLoad = document.getElementById("mxMetricLoad");
    const metricLoadDelta = document.getElementById("mxMetricLoadDelta");
    const metricBandwidth = document.getElementById("mxMetricBandwidth");
    const metricLatency = document.getElementById("mxMetricLatency");
    const metricPackets = document.getElementById("mxMetricPackets");
    const metricError = document.getElementById("mxMetricError");
    const metricTemp = document.getElementById("mxMetricTemp");
    const efficiencyBadge = document.getElementById("mxEfficiencyBadge");
    const barLabelNode = document.getElementById("mxBarLabel");
    const barValNode = document.getElementById("mxBarVal");
    const barFillNode = document.getElementById("mxBarFill");
    let currentData = null;

    function openModal(data) {
      currentData = data;
      const pauseBtnEl = document.getElementById("btn-pause-node");
      if (pauseBtnEl) {
        pauseBtnEl.setAttribute("data-paused", "false");
        pauseBtnEl.innerHTML = '<i data-lucide="pause"></i> Pausar Balanceo';
      }

      if (modalTitle) modalTitle.textContent = data.title || "Detalle del Nodo";
      if (modalSubtitle) modalSubtitle.textContent = data.subtitle || "Telemetría individual de rendimiento.";
      if (modalCat) modalCat.textContent = data.category || "Balance Concurrente";

      const numericVal = parseInt(data.val, 10) || 68;
      if (metricLoad) metricLoad.textContent = numericVal + "%";

      // Color y gradiente dinámico
      const gradClass = data.grad
        ? (data.grad.startsWith("grad-") ? data.grad : "grad-" + data.grad)
        : "grad-blue";
      const mxGradClass = "mx-grad--" + gradClass.replace(/^grad-/, "");
      if (barFillNode) {
        barFillNode.className = "h-full rounded-full transition-all duration-700 " + gradClass + " " + mxGradClass;
        barFillNode.style.width = numericVal + "%";
      }
      if (barLabelNode) {
        barLabelNode.textContent = (data.nodeId ? "Canal " + data.nodeId : data.title) + " (Actual)";
      }
      if (barValNode) {
        barValNode.textContent = numericVal + "%";
      }

      // Cálculo de ancho de banda y latencia proporcionales simulados
      const bw = ((numericVal / 100) * 5.8).toFixed(2);
      if (metricBandwidth) metricBandwidth.textContent = bw;

      const lat = (8 + (numericVal * 0.08)).toFixed(1);
      if (metricLatency) metricLatency.textContent = lat;

      const packets = ((numericVal * 0.18) + 2.5).toFixed(1) + "M";
      if (metricPackets) metricPackets.textContent = packets;

      // Estado condicional
      if (numericVal >= 90) {
        if (modalStatusDot) modalStatusDot.className = "mx-dot mx-dot--warn w-3 h-3 rounded-full bg-amber-500 animate-pulse shadow-sm";
        if (modalStatusBadge) modalStatusBadge.textContent = "Alerta / Umbral Alto";
        if (metricError) {
          metricError.textContent = "0.04%";
          metricError.className = "is-warn text-2xl font-bold text-amber-600";
        }
        if (metricTemp) metricTemp.textContent = "49°C";
        if (efficiencyBadge) {
          efficiencyBadge.textContent = "+26.4% Pico Máx";
          efficiencyBadge.className = "mx-badge-up is-warn text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full";
        }
        if (metricLoadDelta) {
          metricLoadDelta.textContent = "+18.2%";
          metricLoadDelta.className = "is-warn text-[11px] text-amber-600 font-semibold";
        }
      } else if (numericVal <= 35) {
        if (modalStatusDot) modalStatusDot.className = "mx-dot mx-dot--bad w-3 h-3 rounded-full bg-rose-500 animate-ping shadow-sm";
        if (modalStatusBadge) modalStatusBadge.textContent = "Carga Crítica / Desbalance";
        if (metricError) {
          metricError.textContent = "0.08%";
          metricError.className = "is-bad text-2xl font-bold text-rose-600";
        }
        if (metricTemp) metricTemp.textContent = "38°C";
        if (efficiencyBadge) {
          efficiencyBadge.textContent = "-33.6% Subutilizado";
          efficiencyBadge.className = "mx-badge-up is-bad text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full";
        }
        if (metricLoadDelta) {
          metricLoadDelta.textContent = "-12.0%";
          metricLoadDelta.className = "is-bad text-[11px] text-rose-600 font-semibold";
        }
      } else {
        if (modalStatusDot) modalStatusDot.className = "mx-dot mx-dot--ok w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-sm";
        if (modalStatusBadge) modalStatusBadge.textContent = "En Línea / Óptimo";
        if (metricError) {
          metricError.textContent = "0.01%";
          metricError.className = "text-2xl font-bold text-emerald-700";
        }
        if (metricTemp) metricTemp.textContent = "42°C";
        if (efficiencyBadge) {
          efficiencyBadge.textContent = "+11.8% Eficiencia";
          efficiencyBadge.className = "mx-badge-up text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full";
        }
        if (metricLoadDelta) {
          metricLoadDelta.textContent = "+3.5%";
          metricLoadDelta.className = "text-[11px] text-emerald-600 font-semibold";
        }
      }

      renderAggregates();
      icons();

      // Animación de despliegue
      modal.classList.remove("opacity-0", "pointer-events-none");
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (modalContainer) {
        modalContainer.classList.remove("scale-95");
        modalContainer.classList.add("scale-100");
      }
      document.body.style.overflow = "hidden";
    }

    // Cierra el modal con animación
    function closeModal() {
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (modalContainer) {
        modalContainer.classList.remove("scale-100");
        modalContainer.classList.add("scale-95");
      }
      document.body.style.overflow = "";
    }

    // Escuchar cierres (click afuera, botones, ESC)
    if (btnClose) btnClose.addEventListener("click", closeModal);
    if (btnCloseAlt) btnCloseAlt.addEventListener("click", closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.classList.contains("pointer-events-none")) {
        closeModal();
      }
    });

    // 3. Conectar las 16 barras interactivas regionales
    pillBars.forEach((bar) => {
      bar.addEventListener("click", function () {
        const id = this.getAttribute("data-bar-id");
        const name = this.getAttribute("data-bar-name");
        const val = this.getAttribute("data-val");
        const cat = this.getAttribute("data-category");
        const grad = this.getAttribute("data-grad");

        openModal({
          nodeId: id,
          title: name ? `Detalle del Nodo: ${name} (${id})` : `Detalle del Nodo: Canal ${id}`,
          subtitle: `Telemetría individual de rendimiento para el bus balanceado ${name ? name + " (" + id + ")" : id}.`,
          category: cat,
          val: val,
          grad: grad,
        });
      });

      // Accesibilidad con teclado (Enter o Espacio)
      bar.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // 4. Conectar también las tarjetas superiores (Anillos y Gráfica de Onda)
    const radialCard = root.querySelector('[data-metric-type="radial-gauges"]');
    if (radialCard) {
      radialCard.addEventListener("click", function (e) {
        if (e.target.closest("button")) return;
        openModal({
          nodeId: "GLOBAL-SLA",
          title: "Porcentaje Entregado: Objetivos & SLA",
          subtitle: `Sincronizado (${currentPct.toFixed(1).replace(".", ",")}%) · 91% Entregado, 6% En ruta y 3% en Bodega.`,
          category: "Disponibilidad Global",
          val: Math.round(currentPct) + "%",
          grad: "grad-emerald",
        });
      });
      radialCard.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    }

    const waveCard = root.querySelector('[data-metric-type="wave-chart"]');
    if (waveCard) {
      waveCard.addEventListener("click", function (e) {
        if (e.target.closest("button, select, label, .mx-year-pill")) return;
        openModal({
          nodeId: "FLOW-WEEKLY",
          title: "Meta y Crecimiento: Contenedores Anuales",
          subtitle: "Evolución 28 ('24) → 33 ('25) → 38 ('26) → 42 Meta ('27) con +18% proyección.",
          category: "Tendencia Anual",
          val: "82%",
          grad: "grad-purple",
        });
      });
      waveCard.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    }

    // Botones adicionales dentro del modal
    const pauseBtn = document.getElementById("btn-pause-node");
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        const isPaused = this.getAttribute("data-paused") === "true";
        if (!isPaused) {
          this.setAttribute("data-paused", "true");
          this.innerHTML = '<i data-lucide="play"></i> Reanudar Balanceo';
          if (modalStatusBadge) modalStatusBadge.textContent = "Pausado Manualmente";
          if (modalStatusDot) modalStatusDot.className = "mx-dot w-3 h-3 rounded-full bg-slate-400";
        } else {
          this.setAttribute("data-paused", "false");
          this.innerHTML = '<i data-lucide="pause"></i> Pausar Balanceo';
          if (modalStatusBadge) modalStatusBadge.textContent = "En Línea / Óptimo";
          if (modalStatusDot) modalStatusDot.className = "mx-dot mx-dot--ok w-3 h-3 rounded-full bg-emerald-500 animate-pulse";
        }
        icons();
      });
    }

    const downloadBtn = document.getElementById("btn-download-logs");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        const origText = this.innerHTML;
        this.innerHTML = '<i data-lucide="refresh-cw"></i> Descargando...';
        icons();
        setTimeout(() => {
          if (currentData) {
            const numeric = parseInt(currentData.val, 10) || 68;
            const lines = [
              "--- LOG DE TELEMETRÍA OCC ---",
              "Nodo: " + (currentData.nodeId || "N/A") + " · " + (currentData.title || ""),
              "Fecha: " + new Date().toISOString(),
              "Carga actual: " + numeric + "%",
              "Ancho de banda: " + ((numeric / 100) * 5.8).toFixed(2) + " GB/s",
              "Latencia: " + (8 + numeric * 0.08).toFixed(1) + " ms",
              "Paquetes: " + ((numeric * 0.18) + 2.5).toFixed(1) + "M req",
              "Categoría: " + (currentData.category || "N/A"),
              "------------------------------",
            ];
            const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "telemetria-" + String(currentData.nodeId || "nodo").toLowerCase() + ".txt";
            a.click();
            URL.revokeObjectURL(url);
          }
          this.innerHTML = '<i data-lucide="check-circle-2"></i> Logs Guardados';
          icons();
          setTimeout(() => {
            this.innerHTML = origText;
            icons();
          }, 1500);
        }, 800);
      });
    }

    // ---- Refresco y sincronización ----
    let syncSec = 3;
    const syncEl = $("[data-mx-sync]", root);
    setInterval(() => {
      syncSec = syncSec >= 60 ? 1 : syncSec + 1;
      if (syncEl) syncEl.textContent = String(syncSec);
    }, 1000);
    const resetSync = () => {
      syncSec = 0;
      if (syncEl) syncEl.textContent = "0";
    };

    const refreshGaugesBtn = $("#mxRefreshGauges", root);
    if (refreshGaugesBtn) {
      refreshGaugesBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        refreshGaugesBtn.classList.add("is-spinning");
        const nextPct = Math.min(96.5, Math.max(91.0, currentPct + (Math.random() * 0.8 - 0.3)));
        setPctRing(nextPct);
        setTimeout(() => refreshGaugesBtn.classList.remove("is-spinning"), 800);
      });
    }

    const refreshAllBtn = $("#mxRefreshAll", root);
    if (refreshAllBtn) {
      refreshAllBtn.addEventListener("click", () => {
        refreshAllBtn.classList.add("is-spinning");
        pillBars.forEach((bar) => {
          const old = parseInt(bar.getAttribute("data-val"), 10) || 0;
          const next = Math.min(98, Math.max(15, old + (Math.floor(Math.random() * 11) - 5)));
          bar.setAttribute("data-val", String(next));
          const fill = bar.querySelector(".mx-bar__fill");
          const label = fill && fill.querySelector("span");
          if (fill) fill.style.height = next + "%";
          if (label) label.textContent = next + "%";
          bar.title = `Ver detalle de ${bar.dataset.barName || bar.dataset.barId} (${bar.dataset.barId}): ${next}%`;
        });
        setPctRing(Math.min(96.5, Math.max(91.0, currentPct + (Math.random() * 0.6 - 0.2))));
        renderAggregates();
        resetSync();
        setTimeout(() => refreshAllBtn.classList.remove("is-spinning"), 800);
      });
    }

    const exportBtn = $("#mxExport", root);
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const rows = [["ID", "Region", "Carga %", "Categoria", "Gradiente"]];
        readBars().forEach((b) => rows.push([b.id, b.name, String(b.value), b.category, b.grad]));
        rows.push([]);
        rows.push(["Promedio regional", average().toFixed(1) + "%"]);
        const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
        const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reporte-cajitas-occ.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast("Reporte exportado · 16 regiones", "download");
      });
    }
  }

  /* ---------------- BOOT ---------------- */
  /* ---- Carrusel 3D "Hasta lo último de la tierra" ---- */
  function initTierraPanels() {
    const carousel = document.getElementById("tierraCarousel");
    if (!carousel) return;

    const items = [...carousel.querySelectorAll(".tierra-carousel-item")].slice(0, 4);
    const prevBtn = document.getElementById("tierraPrevBtn");
    const nextBtn = document.getElementById("tierraNextBtn");
    if (items.length === 0) return;

    const radius = 350;
    let currAngle = 0;

    const angleStep = 360 / items.length;
    items.forEach((item, index) => {
      const angle = angleStep * index;
      item.style.transform = `rotateY(${angle}deg) translateZ(${radius}px)`;
    });

    function rotateCarousel(direction) {
      currAngle += direction * angleStep;
      carousel.style.transform = `rotateY(${currAngle * -1}deg)`;
    }

    if (prevBtn) prevBtn.addEventListener("click", () => rotateCarousel(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => rotateCarousel(1));

    items.forEach((item, index) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".tierra-panel__video-thumb--playing")) return;
        const normAngle = ((currAngle % 360) + 360) % 360;
        const activeIndex = Math.round(normAngle / angleStep) % items.length;
        if (index === activeIndex) return; // Ya está al frente
        let diff = index - activeIndex;
        if (diff > items.length / 2) diff -= items.length;
        if (diff < -items.length / 2) diff += items.length;
        rotateCarousel(diff);
      });
    });

    carousel.querySelectorAll(".tierra-panel__video-thumb").forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = thumb.closest(".tierra-carousel-item");
        const index = Array.from(items).indexOf(item);
        const normAngle = ((currAngle % 360) + 360) % 360;
        const activeIndex = Math.round(normAngle / angleStep) % items.length;
        if (index !== -1 && index !== activeIndex) {
          let diff = index - activeIndex;
          if (diff > items.length / 2) diff -= items.length;
          else if (diff < -items.length / 2) diff += items.length;
          rotateCarousel(diff);
          return;
        }
        if (thumb.dataset.played === "1") return;
        thumb.dataset.played = "1";
        const videoSrc = thumb.dataset.videoSrc || "https://www.youtube.com/embed/KOKtonyYIFs?rel=0";
        const embedUrl = videoSrc.includes("?") ? `${videoSrc}&autoplay=1` : `${videoSrc}?autoplay=1`;
        thumb.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" title="Video de Norte" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="width:100%;height:100%;border:0;border-radius:inherit;display:block;"></iframe>`;
        thumb.classList.add("tierra-panel__video-thumb--playing");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const safeRun = (name, fn) => {
      try {
        fn();
      } catch (err) {
        console.warn(`[OCC Chile] Módulo no crítico '${name}' con aviso:`, err);
      }
    };

    safeRun("theme", initTheme);
    safeRun("langSwitch", initLangSwitch);
    safeRun("reveal", initReveal);
    safeRun("nav", initNav);
    safeRun("hero", initHero);
    safeRun("processes", initProcesses);
    safeRun("flows", initFlows);
    safeRun("arch", initArch);
    safeRun("tierraPanels", initTierraPanels);
    safeRun("datosSection", initDatosSection);
    safeRun("metricsPanel", initMetricsPanel);
    safeRun("counters", initCounters);
    safeRun("odometer", initOdometer);
    safeRun("demoTabs", initDemoTabs);
    safeRun("form", initForm);
    safeRun("volunteers", initVolunteers);
    safeRun("ocr", initOCR);
    safeRun("logistics", initLogistics);
    safeRun("dashboard", initDashboard);
    safeRun("chat", initChat);
    safeRun("chatWidget", initChatWidget);
    safeRun("icons", icons);
  });
})();
