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
    if (document.getElementById("viaje")) {
      const spyLinks = [...links, ...$$(".topbar__links a")];
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) spyLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
      }), { rootMargin: "-45% 0px -50% 0px" });
      ["inicio", "viaje", "tierra", "testimonios", "enfoque", "postular"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }
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

  /* ---------------- H · CHAT RAG (ENTRENADO CON TODO EL SITIO) ---------------- */
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
      src: [
        { label: "Inicio OCC Chile", href: "index.html#inicio" },
        { label: "El viaje de una cajita", href: "index.html#viaje" }
      ],
      links: [
        { label: "Quiénes Somos", href: "quienes-somos.html", icon: "users" },
        { label: "Misión e Historia", href: "mision-e-historia.html", icon: "book-open" },
        { label: "Ver Videos", href: "videos.html", icon: "play" },
        { label: "Postular iglesia", href: "index.html#postular", icon: "church" }
      ],
      a: {
        es: "¡Hola! Bendiciones 🙏 Qué alegría saludarte. Soy el asistente de OCC Chile. Puedo orientarte sobre quiénes somos, nuestra misión e historia, videos, armado de cajitas, postulación de iglesias, equipo nacional o dónde estamos ubicados. ¿En qué te ayudo hoy?",
        en: "Hello! Blessings 🙏 Great to connect with you. I'm the OCC Chile assistant. I can guide you on who we are, our mission & history, videos, shoebox packing, church applications, national leadership, or location. How can I help?",
        pt: "Olá! Bênçãos 🙏 Sou o assistente da OCC Chile. Posso ajudar sobre quem somos, missão e história, vídeos, caixas de presente, inscrição de igrejas e localização. Como posso ajudar?"
      }
    },
    {
      cat: "Bendiciones",
      route: "Comunidad de fe",
      kw: [
        "bendiciones", "dios te bendiga", "dios los bendiga", "que dios te bendiga",
        "paz de dios", "paz del senor", "amen", "gloria a dios", "shalom", "god bless", "blessings"
      ],
      src: [
        { label: "Evangelismo y Discipulado", href: "index.html#enfoque" },
        { label: "OCC Chile", href: "quienes-somos.html" }
      ],
      links: [
        { label: "Quiénes Somos", href: "quienes-somos.html", icon: "globe-2" },
        { label: "Postular iglesia", href: "index.html#postular", icon: "church" }
      ],
      a: {
        es: "¡Amén! Muchas bendiciones para ti y tu comunidad. 🙏 Es un privilegio servir juntos para llevar el amor de Dios y las Buenas Nuevas a los niños de Chile. ¿Tienes alguna consulta sobre el ministerio o tu iglesia?",
        en: "Amen! Many blessings to you and your community. 🙏 It is a privilege to serve together in sharing God's love with children in Chile. How can I assist you?",
        pt: "Amém! Muitas bênçãos para você e sua comunidade. 🙏 Em que posso ajudar hoje?"
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
      src: [
        { label: "WhatsApp Oficial", href: "https://wa.me/56937479835", ext: true },
        { label: "Inicio OCC Chile", href: "index.html#inicio" }
      ],
      links: [
        { label: "Volver al inicio", href: "index.html#inicio", icon: "home" },
        { label: "Ver Videos", href: "videos.html", icon: "play" }
      ],
      a: {
        es: "¡De nada! Que Dios te bendiga mucho. Si necesitas más información o enlaces del sitio, aquí estaré disponible. ¡Hasta pronto! 👋✨",
        en: "You're very welcome! God bless you. Whenever you need site links or info about OCC Chile, I'm here. See you soon! 👋✨",
        pt: "De nada! Deus te abençoe muito. Estou sempre por aqui se precisar de algo mais. Até logo! 👋✨"
      }
    },
    {
      cat: "Quiénes Somos",
      route: "Página Quiénes Somos",
      kw: [
        "quienes somos", "quienes son", "que es occ", "que es operacion nino de la navidad",
        "operation christmas child", "samaritan", "samaritans purse", "brazo", "ministerio",
        "que hacen", "about", "who are you", "quem somos"
      ],
      src: [
        { label: "Página Quiénes Somos", href: "quienes-somos.html" },
        { label: "Samaritan's Purse Intl", href: "https://www.samaritanspurse.org/what-we-do/operation-christmas-child/", ext: true }
      ],
      links: [
        { label: "Ir a Quiénes Somos", href: "quienes-somos.html", icon: "globe-2" },
        { label: "Conocer Equipo Nacional", href: "quienes-somos.html#equipo-nacional", icon: "users" }
      ],
      a: {
        es: "<strong>OCC Chile</strong> es un ministerio usado por Dios como herramienta para ayudar a las iglesias chilenas en su tarea evangelística infantil. Es brazo de <strong>Operation Christmas Child International</strong> (Samaritan's Purse), presente en <strong>más de 100 países</strong> con más de <strong>100 millones de cajitas</strong> distribuidas y más de 7 años sirviendo en Chile junto a todas las iglesias cristianas.",
        en: "<strong>OCC Chile</strong> is a ministry used by God to equip Chilean churches in children's evangelism. As part of <strong>Operation Christmas Child International</strong> (Samaritan's Purse), we serve across <strong>100+ countries</strong> with over <strong>100 million shoeboxes</strong> delivered.",
        pt: "<strong>OCC Chile</strong> é um braço da Operation Christmas Child International (Samaritan's Purse), presente em mais de 100 países com mais de 100 milhões de caixas distribuídas junto às igrejas locais."
      }
    },
    {
      cat: "Equipo Nacional",
      route: "Liderazgo Nacional",
      kw: [
        "equipo nacional", "quien dirige", "quienes dirigen", "coordinador nacional",
        "ramon mercado", "carolina nunez", "esmeralda munoz", "mireya inostroza",
        "sandra valdivia", "marcelo herrera", "directiva", "lideres nacionales", "national team"
      ],
      src: [
        { label: "Equipo Nacional · Quiénes Somos", href: "quienes-somos.html#equipo-nacional" },
        { label: "Organigrama OCC Chile", href: "index.html#organigrama" }
      ],
      links: [
        { label: "Ver Equipo Nacional", href: "quienes-somos.html#equipo-nacional", icon: "users" },
        { label: "Postular a equipo regional", href: "index.html#postular", icon: "user-plus" }
      ],
      a: {
        es: "El <strong>Equipo Nacional de OCC Chile</strong> está integrado por: <strong>Ramón Mercado</strong> (Coordinador Nacional), <strong>Carolina Núñez</strong> (Recursos), <strong>Esmeralda Muñoz</strong> (Discipulado), <strong>Mireya Inostroza</strong> (Logística), <strong>Sandra Valdivia</strong> (Oración) y <strong>Marcelo Herrera</strong> (Movilización).",
        en: "The <strong>OCC Chile National Team</strong> includes: <strong>Ramón Mercado</strong> (National Coordinator), <strong>Carolina Núñez</strong> (Resources), <strong>Esmeralda Muñoz</strong> (Discipleship), <strong>Mireya Inostroza</strong> (Logistics), <strong>Sandra Valdivia</strong> (Prayer) and <strong>Marcelo Herrera</strong> (Mobilization).",
        pt: "A <strong>Equipe Nacional da OCC Chile</strong> é formada por Ramón Mercado, Carolina Núñez, Esmeralda Muñoz, Mireya Inostroza, Sandra Valdivia e Marcelo Herrera."
      }
    },
    {
      cat: "Misión e Historia",
      route: "Página Misión e Historia",
      kw: [
        "mision", "historia", "como comenzo", "como empezo", "origen", "fundacion",
        "dave cooke", "rumania", "1990", "1970", "camiones", "orfanatos",
        "mision en tres partes", "demostrar", "juntos", "compartir", "juan 3 16", "proposito",
        "mission", "history", "missao"
      ],
      src: [
        { label: "Misión e Historia · Cómo comenzó", href: "mision-e-historia.html#como-comenzo" },
        { label: "Nuestra misión en tres partes", href: "mision-e-historia.html#mision-tres-partes" }
      ],
      links: [
        { label: "Cómo comenzó (1990)", href: "mision-e-historia.html#como-comenzo", icon: "history" },
        { label: "Misión en tres partes", href: "mision-e-historia.html#mision-tres-partes", icon: "compass" }
      ],
      a: {
        es: "La obra comenzó en <strong>octubre de 1990</strong> cuando <strong>Dave Cooke</strong> organizó en Reino Unido una caravana de 9 camiones y 17 voluntarios hacia Rumania (Samaritan's Purse nació en 1970). Nuestra misión se resume en tres partes: <strong>01 Demostrar</strong> el amor de Dios, <strong>02 Juntos</strong> con la iglesia local y <strong>03 Compartir</strong> el Evangelio (Juan 3:16).",
        en: "It began in <strong>October 1990</strong> when <strong>Dave Cooke</strong> led 9 trucks and 17 volunteers from the UK to Romania (Samaritan's Purse started in 1970). Our 3-part mission: <strong>01 Demonstrate</strong> God's love, <strong>02 Together</strong> with local churches, and <strong>03 Share</strong> the Gospel (John 3:16).",
        pt: "Tudo começou em <strong>outubro de 1990</strong> com Dave Cooke levando 9 caminhões à Romênia. Nossa missão em três partes: <strong>01 Demonstrar</strong>, <strong>02 Juntos</strong> com a igreja local e <strong>03 Compartilhar</strong> João 3:16."
      }
    },
    {
      cat: "Videos",
      route: "Galería Audiovisual",
      kw: [
        "video", "videos", "ver videos", "resena", "promo", "documental",
        "adryana", "fernanda", "sardius", "ver", "pelicula", "clips", "audiovisual"
      ],
      src: [
        { label: "Página de Videos OCC Chile", href: "videos.html" },
        { label: "Samaritan's Purse Media", href: "https://video.samaritanspurse.org/", ext: true }
      ],
      links: [
        { label: "Ir a Videos", href: "videos.html", icon: "film" },
        { label: "Reseña Principal 2026", href: "videos.html#video-principal", icon: "play" },
        { label: "Catálogo de 5 videos", href: "videos.html#mas-videos", icon: "tv" }
      ],
      a: {
        es: "En nuestra página de <strong>Videos</strong> puedes reproducir la <strong>Reseña de Operation Christmas Child 2026</strong> y otros 5 videos oficiales (en español e inglés): cómo preparar una caja, impacto hispano, Fernanda en Valparaíso, Gaspar en Santiago y la historia de Adryana (+1.700 cajitas).",
        en: "On our <strong>Videos</strong> page you can watch the <strong>2026 Operation Christmas Child Overview</strong> plus 5 official videos in Spanish and English (packing, Hispanic ministry impact, Valparaíso, Santiago and Adryana's story).",
        pt: "Na página de <strong>Vídeos</strong> você pode assistir à resenha oficial 2026 e a mais 5 vídeos em espanhol e inglês."
      }
    },
    {
      cat: "Dirección y Contacto",
      route: "Ubicación y Canales Oficiales",
      kw: [
        "direccion", "ubicacion", "donde estan", "donde quedan", "donde queda", "oficina",
        "mapa", "maps", "google maps", "naciones unidas", "san joaquin", "santiago",
        "contacto", "telefono", "whatsapp", "celular", "wsp", "numero", "correo", "email", "mail",
        "hablar con alguien", "humano", "atencion", "llamar", "contact", "address", "location"
      ],
      src: [
        { label: "Sede San Joaquín · Maps", href: "https://maps.google.com/maps?z=16&q=naciones+unidas+49+san+joaqu%C3%ADn+santiago,+chile", ext: true },
        { label: "Postular / Contacto", href: "index.html#postular" }
      ],
      links: [
        { label: "Naciones Unidas 49 (Maps)", href: "https://maps.google.com/maps?z=16&q=naciones+unidas+49+san+joaqu%C3%ADn+santiago,+chile", ext: true, icon: "map-pin" },
        { label: "WhatsApp +56 9 37479835", href: "https://wa.me/56937479835", ext: true, icon: "message-circle" },
        { label: "contacto@occchile.cl", href: "mailto:contacto@occchile.cl", ext: true, icon: "mail" }
      ],
      a: {
        es: "Nuestra sede se ubica en <strong>Naciones Unidas 49 - San Joaquín, Santiago - Chile</strong>. Puedes escribirnos a <strong>contacto@occchile.cl</strong> o contactarnos directamente por WhatsApp al <strong>+56 9 37479835</strong>.",
        en: "Our Chile headquarters is at <strong>Naciones Unidas 49 - San Joaquín, Santiago - Chile</strong>. Email us at <strong>contacto@occchile.cl</strong> or message WhatsApp <strong>+56 9 37479835</strong>.",
        pt: "Nossa sede fica em <strong>Naciones Unidas 49 - San Joaquín, Santiago - Chile</strong>. E-mail: <strong>contacto@occchile.cl</strong> · WhatsApp: <strong>+56 9 37479835</strong>."
      }
    },
    {
      cat: "Organigrama y Regiones",
      route: "Estructura Nacional",
      kw: [
        "organigrama", "estructura", "enl", "erle", "erl", "equipos regionales",
        "metronorte", "metrosur", "v region", "valparaiso", "los lagos", "concepcion", "coquimbo",
        "liderazgo", "regiones", "norte a sur", "hasta lo ultimo de la tierra", "ciudades", "regional"
      ],
      src: [
        { label: "Organigrama de Chile", href: "index.html#organigrama" },
        { label: "Hasta lo último de la tierra", href: "index.html#tierra" }
      ],
      links: [
        { label: "Ver Organigrama de Chile", href: "index.html#organigrama", icon: "network" },
        { label: "Hasta lo último de la tierra", href: "index.html#tierra", icon: "map" }
      ],
      a: {
        es: "En Chile operamos bajo el <strong>ENL Chile</strong>, 6 coordinaciones regionales <strong>ERLE</strong> (Metronorte, Metrosur, V Región, Los Lagos, Concepción y Coquimbo) y equipos locales <strong>ERL</strong> desde Arica hasta Magallanes.",
        en: "In Chile we coordinate through <strong>ENL Chile</strong>, 6 regional <strong>ERLE</strong> teams (Metronorte, Metrosur, V Región, Los Lagos, Concepción, Coquimbo) and local <strong>ERL</strong> teams nationwide.",
        pt: "No Chile atuamos com o <strong>ENL Chile</strong>, 6 coordenações regionais <strong>ERLE</strong> e equipes locais <strong>ERL</strong> de norte a sul."
      }
    },
    {
      cat: "El viaje de una cajita",
      route: "Paso a paso",
      kw: [
        "viaje de una cajita", "paso a paso", "etapas", "proceso", "recorrido",
        "como llega", "como funciona", "journey of a shoebox", "steps"
      ],
      src: [
        { label: "Sección El viaje de una cajita", href: "index.html#viaje" },
        { label: "Operación OCC Chile", href: "quienes-somos.html" }
      ],
      links: [
        { label: "Ver el viaje paso a paso", href: "index.html#viaje", icon: "route" },
        { label: "Postular iglesia", href: "index.html#postular", icon: "church" }
      ],
      a: {
        es: "En la sección <strong>El viaje de una cajita</strong> puedes recorrer las etapas completas: desde que la cajita se arma y entrega en centros de acopio, pasando por aduana/logística nacional y eventos en iglesias locales, hasta el discipulado <strong>La Gran Aventura</strong>.",
        en: "In the <strong>Shoebox Journey</strong> section you can follow every stage from packing and collection week to regional logistics, church events and The Greatest Journey.",
        pt: "Na seção <strong>A jornada da caixa</strong> você acompanha cada etapa até a entrega e o discipulado na igreja local."
      }
    },
    {
      cat: "Iglesias",
      route: "Postulación de iglesias",
      kw: [
        "iglesia", "postular", "participar", "ser parte", "inscribir", "companero de ministerio",
        "congregacion", "pastor", "pastora", "lider", "requisitos", "templo", "capilla",
        "comunidad", "anotar", "anotarme", "registrar", "recibir cajas", "como participo",
        "church", "join", "igreja"
      ],
      src: [
        { label: "Formulario ¿Tu Iglesia quiere ser parte?", href: "index.html#postular" },
        { label: "Compañero de Ministerio", href: "index.html#cta" }
      ],
      links: [
        { label: "Ir al formulario de postulación", href: "index.html#postular", icon: "church" },
        { label: "Compañero de Ministerio", href: "index.html#cta", icon: "heart-handshake" }
      ],
      a: {
        es: "¡Qué alegría! Tu iglesia puede postular en 3 sencillos pasos en el formulario <strong>¿Tu Iglesia quiere ser parte?</strong>: solo ingresas nombre de la iglesia, contacto pastoral, dirección, cantidad estimada de niños, email y celular. Te asignamos automáticamente al equipo regional correspondiente.",
        en: "Wonderful! Your church can apply in 3 easy steps via <strong>Partner With Us</strong>: church name, pastoral contact, address, estimated children count, email and phone for instant regional team routing.",
        pt: "Que alegria! Sua igreja pode se inscrever em 3 etapas no formulário inteligente da página inicial."
      }
    },
    {
      cat: "Armado de cajas",
      route: "Guía de armado",
      kw: [
        "caja", "cajita", "cajas", "cajitas", "armar", "poner", "echar", "meter", "llevar",
        "regalo", "regalos", "que va", "prohibido", "prohibiciones", "box", "pack", "caixa",
        "contenido", "articulos", "juguetes", "dulces", "comida", "ropa", "zapatos",
        "pasta de dientes", "cepillo", "jabon", "cuadernos", "lapices", "peluche", "pelota", "tamano", "medidas"
      ],
      src: [
        { label: "Guía de armado · Paso a paso", href: "index.html#viaje" },
        { label: "Video: Prepara una caja", href: "videos.html#mas-videos" }
      ],
      links: [
        { label: "Video: Prepara una caja", href: "videos.html#mas-videos", icon: "play" },
        { label: "El viaje de una cajita", href: "index.html#viaje", icon: "gift" }
      ],
      a: {
        es: "Elige niño o niña y rango etario (<strong>2–4, 5–9 o 10–14 años</strong>). Incluye un artículo especial (peluche, muñeca, pelota con bombín), útiles escolares (cuadernos, lápices), higiene personal (cepillo, jabón, peineta) y un mensaje personal. ⚠️ <strong>No incluyas:</strong> alimentos, dulces, líquidos, medicamentos, artículos usados ni juguetes bélicos.",
        en: "Pick boy or girl and age group (<strong>2–4, 5–9, or 10–14</strong>). Include a 'wow' item, school supplies, hygiene items and a personal note. ⚠️ <strong>Avoid:</strong> food, candy, liquids, medicine, used items or war toys.",
        pt: "Escolha menino/menina (2–4, 5–9 ou 10–14 anos) e inclua brinquedo especial, material escolar, higiene e bilhete. ⚠️ Não envie comida, doces, líquidos, remédios ou itens usados."
      }
    },
    {
      cat: "Fechas y Acopio",
      route: "Calendario Nacional",
      kw: [
        "fechas", "cuando", "plazos", "calendario", "cronograma", "donde entregar",
        "donde dejar", "acopio", "punto de entrega", "recoleccion", "cuando entregan",
        "fecha limite", "donde se entregan", "donde se dejan", "entregar", "entregan",
        "dates", "when", "deadline", "schedule"
      ],
      src: [
        { label: "Cronograma Nacional OCC", href: "index.html#viaje" },
        { label: "Red de Acopio · WhatsApp", href: "https://wa.me/56937479835", ext: true }
      ],
      links: [
        { label: "WhatsApp centros de acopio", href: "https://wa.me/56937479835", ext: true, icon: "message-circle" },
        { label: "Ver el viaje paso a paso", href: "index.html#viaje", icon: "calendar" }
      ],
      a: {
        es: "Calendario anual OCC Chile: postulación de iglesias entre <strong>marzo y agosto</strong>; capacitación en <strong>septiembre y octubre</strong>; Semana Nacional de Recolección en <strong>noviembre</strong>; y eventos de entrega con los niños entre <strong>diciembre y enero</strong>. Escríbenos a WhatsApp (+56 9 37479835) para tu punto de acopio más cercano.",
        en: "Annual OCC Chile calendar: church intake Mar–Aug; training Sep–Oct; National Collection Week in November; distribution celebrations Dec–Jan. Message WhatsApp +56 9 37479835 for your nearest drop-off center.",
        pt: "Cronograma: inscrições mar–ago, capacitação set–out, coleta em novembro e eventos dez–jan. WhatsApp: +56 9 37479835."
      }
    },
    {
      cat: "Gratuidad",
      route: "Transparencia y Ética",
      kw: [
        "cuanto cuesta", "costo", "valor", "precio", "cobrar", "cobran", "gratis",
        "se pagan", "vender", "venta", "cuanto vale", "pago", "price", "free", "cost"
      ],
      src: [
        { label: "Nuestra Misión", href: "mision-e-historia.html#mision-tres-partes" },
        { label: "Transparencia y Reportes", href: "admin.html" }
      ],
      links: [
        { label: "Misión en tres partes", href: "mision-e-historia.html#mision-tres-partes", icon: "shield-check" }
      ],
      a: {
        es: "¡Las cajitas son <strong>100% gratuitas</strong> para los niños, sus familias y comunidades! Son regalos de amor incondicional. Jamás se cobra por recibir una cajita, asistir a eventos ni participar en La Gran Aventura.",
        en: "Shoeboxes are <strong>100% free</strong> for children, families and communities! Nothing is ever charged to receive a box or join The Greatest Journey.",
        pt: "As caixas são <strong>100% gratuitas</strong> para crianças e famílias, sem nenhum custo!"
      }
    },
    {
      cat: "Testimonios",
      route: "Historias reales",
      kw: [
        "testimonio", "testimonios", "agustin", "johan", "gaspar", "vidas transformadas",
        "relatos", "experiencias", "milagro", "historias reales", "stories", "testimonies"
      ],
      src: [
        { label: "Historias reales del amor de Dios", href: "index.html#testimonios" },
        { label: "Videos Samaritan's Purse", href: "videos.html#mas-videos" }
      ],
      links: [
        { label: "Ver Testimonios", href: "index.html#testimonios", icon: "heart" },
        { label: "Ver Videos de historias", href: "videos.html#mas-videos", icon: "play" }
      ],
      a: {
        es: "En <strong>Historias reales del amor de Dios</strong> puedes leer los testimonios de <strong>Agustín</strong> (Santiago), <strong>Johan</strong> (Viña del Mar) y <strong>Gaspar</strong>, además de ver videos de impacto en nuestra galería audiovisual.",
        en: "In <strong>Real stories of God's love</strong> you can read testimonies from <strong>Agustín</strong> (Santiago), <strong>Johan</strong> (Viña del Mar) and <strong>Gaspar</strong>, and watch full impact videos.",
        pt: "Na seção de <strong>Testemunhos</strong> você conhece histórias reais como Agustín, Johan e Gaspar."
      }
    },
    {
      cat: "Centro de Datos y Reportes",
      route: "Transparencia y Métricas",
      kw: [
        "datos", "centro de datos", "metricas", "estadisticas", "cuantas cajas", "contenedores",
        "228", "90 5", "42", "reporte", "reportes", "informe", "informes", "admin", "panel",
        "transparencia", "distribucion", "planilla", "evidencia", "ocr", "acta", "report"
      ],
      src: [
        { label: "Centro de Datos OCC Chile", href: "index.html#datos" },
        { label: "Panel Admin & Reportes", href: "admin.html" }
      ],
      links: [
        { label: "Ver Centro de Datos", href: "index.html#datos", icon: "bar-chart-3" },
        { label: "Ir a Reportes y Admin", href: "admin.html", icon: "layout-dashboard" }
      ],
      a: {
        es: "En el <strong>Centro de Datos</strong> puedes seguir métricas nacionales en vivo (<strong>228.024</strong> cajas recibidas, <strong>90,5%</strong> entregadas y meta de <strong>42 contenedores</strong> para 2027 en 16 regiones). Para gestión de equipos, auditoría OCR y descarga/envío oficial de informes, ingresa al <strong>Panel Admin &amp; Reportes</strong>.",
        en: "In our <strong>Data Center</strong> you can inspect live national metrics (<strong>228,024</strong> shoeboxes, <strong>90.5%</strong> delivered, <strong>42-container</strong> 2027 goal across 16 regions) or open the <strong>Admin &amp; Reports Panel</strong>.",
        pt: "No <strong>Centro de Dados</strong> você acompanha métricas nacionais (228.024 caixas e 90,5% entregues) e no <strong>Painel Admin</strong> acessa relatórios oficiais."
      }
    },
    {
      cat: "Discipulado",
      route: "La Gran Aventura",
      kw: [
        "gran aventura", "gran viaje", "discipulado", "evangelismo", "multiplicacion",
        "enfoque", "maestro", "lecciones", "curso", "clases", "12 lecciones",
        "material", "capacitacion", "journey", "teacher"
      ],
      src: [
        { label: "Evangelismo y Discipulado", href: "index.html#enfoque" },
        { label: "Quiénes Somos · La Gran Aventura", href: "quienes-somos.html" }
      ],
      links: [
        { label: "Evangelismo y Discipulado", href: "index.html#enfoque", icon: "book-open" },
        { label: "Misión en tres partes", href: "mision-e-historia.html#mision-tres-partes", icon: "compass" }
      ],
      a: {
        es: "Nuestro enfoque une <strong>Evangelismo, Discipulado y Multiplicación</strong>. A través de <strong>La Gran Aventura</strong> (curso de 12 lecciones bíblicas), los niños que reciben una cajita conocen a Jesús e invitan a sus amigos y familias a la iglesia local.",
        en: "Our focus unites <strong>Evangelism, Discipleship, and Multiplication</strong> through <strong>The Greatest Journey</strong> (12 Bible lessons for children who receive a shoebox).",
        pt: "Nosso enfoque une Evangelismo, Discipulado (<strong>A Maior Jornada</strong>, 12 lições bíblicas) e Multiplicação."
      }
    },
    {
      cat: "Voluntariado",
      route: "Equipos y Servicio",
      kw: [
        "voluntario", "voluntariado", "ayudar", "servir", "rol", "equipo", "sumarme",
        "inscribirme", "colaborar", "volunteer", "help"
      ],
      src: [
        { label: "Organigrama de Chile", href: "index.html#organigrama" },
        { label: "Postular ahora", href: "index.html#postular" }
      ],
      links: [
        { label: "Ver Organigrama", href: "index.html#organigrama", icon: "users" },
        { label: "Postular ahora", href: "index.html#postular", icon: "user-plus" }
      ],
      a: {
        es: "Puedes servir en equipos regionales <strong>ERLE</strong> y locales <strong>ERL</strong> en áreas como coordinación, recursos, discipulado, logística, oración y movilización. Revisa la estructura en el organigrama o contáctanos para sumarte.",
        en: "You can serve across regional <strong>ERLE</strong> and local <strong>ERL</strong> teams in coordination, resources, discipleship, logistics, prayer and mobilization.",
        pt: "Você pode servir nas equipes regionais <strong>ERLE</strong> e locais <strong>ERL</strong> em diversas áreas ministeriais."
      }
    },
    {
      cat: "Donaciones",
      route: "Apoyo al Ministerio",
      kw: [
        "donar", "donacion", "dinero", "envio", "aporte", "pagar",
        "transferencia", "cuenta", "banco", "donate", "doar"
      ],
      src: [
        { label: "Centro de Datos", href: "index.html#datos" },
        { label: "Contacto Oficial", href: "mailto:contacto@occchile.cl", ext: true }
      ],
      links: [
        { label: "WhatsApp +56 9 37479835", href: "https://wa.me/56937479835", ext: true, icon: "message-circle" },
        { label: "contacto@occchile.cl", href: "mailto:contacto@occchile.cl", ext: true, icon: "mail" }
      ],
      a: {
        es: "Puedes apoyar armando cajitas o realizando un aporte para transporte, logística nacional y el material de discipulado. Escríbenos a <strong>contacto@occchile.cl</strong> o al WhatsApp <strong>+56 9 37479835</strong> para orientarte.",
        en: "You can help by packing shoeboxes or supporting shipping and discipleship materials. Contact <strong>contacto@occchile.cl</strong> or WhatsApp <strong>+56 9 37479835</strong>.",
        pt: "Você pode apoiar montando caixas ou contribuindo para logística e discipulado via <strong>contacto@occchile.cl</strong>."
      }
    },
    {
      cat: "Prensa",
      route: "Comunicaciones",
      kw: [
        "prensa", "medio", "entrevista", "periodista", "noticia", "comunicado",
        "radio", "television", "press", "media"
      ],
      src: [
        { label: "Correo Comunicaciones", href: "mailto:contacto@occchile.cl", ext: true },
        { label: "Galería de Videos", href: "videos.html" }
      ],
      links: [
        { label: "Ver Videos oficiales", href: "videos.html", icon: "film" },
        { label: "contacto@occchile.cl", href: "mailto:contacto@occchile.cl", ext: true, icon: "mail" }
      ],
      a: {
        es: "Para entrevistas, notas de prensa o material audiovisual oficial, escribe a <strong>contacto@occchile.cl</strong> y revisa nuestra galería oficial de videos.",
        en: "For interviews, press releases or official media assets, email <strong>contacto@occchile.cl</strong> and browse our official video gallery.",
        pt: "Para imprensa e material audiovisual oficial, escreva para <strong>contacto@occchile.cl</strong>."
      }
    }
  ];

  const UI = {
    es: {
      hi: "¡Hola! Bendiciones 🙏 Soy el asistente de OCC Chile. Pregúntame sobre el ministerio, el Equipo Nacional, videos, cajitas o dónde encontrarnos y te doy la info con enlaces directos.",
      miss: "No encontré esa consulta exacta, pero puedes explorar estas secciones del sitio o escribirnos directo a WhatsApp (+56 9 37479835) o a contacto@occchile.cl. 🙏",
      missLinks: [
        { label: "Quiénes Somos", href: "quienes-somos.html", icon: "users" },
        { label: "Misión e Historia", href: "mision-e-historia.html", icon: "book-open" },
        { label: "Videos", href: "videos.html", icon: "play" },
        { label: "Postular iglesia", href: "index.html#postular", icon: "church" }
      ],
      chips: [
        "¿Quiénes somos?",
        "¿Cuál es su misión e historia?",
        "¿Quiénes forman el Equipo Nacional?",
        "Quiero ver los videos",
        "¿Dónde están ubicados?",
        "¿Cómo postula mi iglesia?",
        "¿Qué pongo en una cajita?",
        "Organigrama y regiones"
      ]
    },
    en: {
      hi: "Hello! Blessings 🙏 I'm the OCC Chile assistant. Ask about who we are, mission & history, videos, shoeboxes or church applications and I'll share direct site links.",
      miss: "I couldn't find that exact topic, but you can browse these sections or contact WhatsApp (+56 9 37479835) / contacto@occchile.cl. 🙏",
      missLinks: [
        { label: "Who We Are", href: "quienes-somos.html", icon: "users" },
        { label: "Mission & History", href: "mision-e-historia.html", icon: "book-open" },
        { label: "Videos", href: "videos.html", icon: "play" },
        { label: "Apply as a church", href: "index.html#postular", icon: "church" }
      ],
      chips: [
        "Who are you?",
        "Mission & history",
        "National leadership team",
        "Watch videos",
        "Location & contact",
        "How can my church join?",
        "What goes in a shoebox?"
      ]
    },
    pt: {
      hi: "Olá! Bênçãos 🙏 Sou o assistente da OCC Chile. Pergunte sobre quem somos, missão e história, vídeos, caixas ou inscrição e envio os links do site.",
      miss: "Não encontrei essa informação exata. Explore os links abaixo ou fale conosco pelo WhatsApp (+56 9 37479835). 🙏",
      missLinks: [
        { label: "Quem Somos", href: "quienes-somos.html", icon: "users" },
        { label: "Missão e História", href: "mision-e-historia.html", icon: "book-open" },
        { label: "Vídeos", href: "videos.html", icon: "play" }
      ],
      chips: [
        "Quem somos?",
        "Missão e história",
        "Ver vídeos",
        "Como minha igreja participa?",
        "O que vai na caixa?"
      ]
    }
  };

  function resolveChatHref(href) {
    if (!href || /^(https?:|mailto:|tel:)/.test(href)) return href;
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    if ((file === "index.html" || file === "") && href.startsWith("index.html#")) {
      return href.slice("index.html".length);
    }
    return href;
  }

  function scoreKB(q) {
    const nq = norm(q);
    const words = nq.split(" ").filter((w) => w.length > 2);
    const scored = KB.map((k) => {
      let s = k.kw.reduce((a, w) => {
        const nw = norm(w);
        if (!nw) return a;
        if (nq === nw) return a + nw.length * 5;
        if (nq.split(" ").includes(nw)) return a + nw.length * 3;
        if (nq.includes(nw)) return a + nw.length * 1.6;
        return a;
      }, 0);
      if (s === 0 && words.length) {
        const hay = norm(k.kw.join(" "));
        words.forEach((w) => {
          if (hay.includes(w)) s += w.length * 0.8;
        });
      }
      return { k, s };
    }).sort((a, b) => b.s - a.s);
    return scored[0] && scored[0].s >= 2.5 ? scored[0].k : null;
  }

  function renderBotLinks(links) {
    if (!links || !links.length) return "";
    return '<div class="chat-links">' + links.map((l) => {
      const href = resolveChatHref(l.href);
      const attrs = l.ext ? ' target="_blank" rel="noopener noreferrer"' : "";
      const ic = l.icon || "arrow-up-right";
      return `<a class="chat-link" href="${href}"${attrs}><i data-lucide="${ic}" style="width:13px;height:13px"></i><span>${l.label}</span></a>`;
    }).join("") + "</div>";
  }

  function renderBotSrcLinks(srcList) {
    if (!srcList || !srcList.length) return "";
    return '<div class="src">' + srcList.map((s) => {
      const item = typeof s === "string" ? { label: s, href: "index.html#inicio" } : s;
      const href = resolveChatHref(item.href);
      const attrs = item.ext ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a class="chat-src-link" href="${href}"${attrs}><i data-lucide="file-text" style="width:12px;height:12px"></i><span>${item.label}</span></a>`;
    }).join("") + "</div>";
  }

  function renderBotHtml(hit, lang) {
    const u = UI[lang] || UI.es;
    if (!hit) {
      return `${u.miss}${renderBotLinks(u.missLinks)}`;
    }
    const answer = hit.a[lang] || hit.a.es;
    const linksHtml = renderBotLinks(hit.links);
    const srcHtml = renderBotSrcLinks(hit.src);
    return `${answer}${linksHtml}${srcHtml}`;
  }

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
    const setStep = (i, txt) => { if (steps[i]) { steps[i].classList.add("on"); steps[i].querySelector("span").textContent = txt; } };
    async function ask(q) {
      if (busy || !q.trim()) return; busy = true;
      add(q.replace(/</g, "&lt;"), "user");
      steps.forEach((s) => { s.classList.remove("on"); s.querySelector("span").textContent = "—"; });
      const t = add(`<span class="typing"><i></i><i></i><i></i></span>`, "bot");
      const hit = scoreKB(q);
      await sleep(350); setStep(0, hit ? `${hit.cat} · confianza ${(.85 + Math.random() * .13).toFixed(2)}` : "Sin categoría clara");
      await sleep(450); setStep(1, hit ? `${hit.src.length} fragmentos · enlaces ${hit.links ? hit.links.length : 0}` : "0 fragmentos relevantes");
      await sleep(450); setStep(2, hit ? `Respuesta con ${hit.src.length} citas · ${lang.toUpperCase()}` : "Derivación segura con enlaces");
      await sleep(250); setStep(3, hit ? hit.route : "Humano · bandeja de atención");
      t.remove();
      add(renderBotHtml(hit, lang), "bot");
      busy = false;
    }
    form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value; input.value = ""; ask(q); });
    $("#chatChips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
    langSel?.addEventListener("change", () => { lang = langSel.value; chips(); add(UI[lang].hi, "bot"); toast("Idioma cambiado · traducción con IA", "languages"); });
    add(UI.es.hi, "bot"); chips();

    const topics = [["Armado de cajas", 34], ["Fechas de recolección", 26], ["Postulación de iglesias", 18], ["Reportes", 12], ["Voluntariado", 10]];
    const topicsEl = $("#topics");
    if (topicsEl) {
      topicsEl.innerHTML = topics.map(([n, v]) => `<div class="topic"><span>${n}</span><b>${v}%</b><i style="--w:${v * 2.5}%"></i></div>`).join("");
    }
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
      add(`${UI[lang].hi}${renderBotLinks(UI[lang].missLinks)}`, "bot");
      chips();
    }

    async function askWidget(q) {
      if (busy || !q.trim()) return;
      busy = true;
      add(q.replace(/</g, "&lt;"), "user");
      const t = add(`<span class="typing"><i></i><i></i><i></i></span>`, "bot");
      const hit = scoreKB(q);

      await sleep(450);
      t.remove();

      add(renderBotHtml(hit, lang), "bot");
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

    expandBtn?.addEventListener("click", () => {
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

    body?.addEventListener("click", (e) => {
      const link = e.target.closest("a.chat-link, a.chat-src-link");
      if (link) {
        const href = link.getAttribute("href") || "";
        if (href.startsWith("#")) {
          closeWidget();
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
      add(`${UI[lang].hi}${renderBotLinks(UI[lang].missLinks)}`, "bot");
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

  /* ---------------- SKY FLEET (3 PLANOS GPU · 10 DISEÑOS) ---------------- */
  function initSkyFleet() {
    const flights = $$(".htl__sky .htl__flight");
    if (!flights.length) return;
    const FLEET_SRCS = [
      { src: "img/mascota_avion_4.png?v=2", w: 383, h: 356 },
      { src: "img/mascota_avion_5.png", w: 383, h: 355 },
      { src: "img/mascota_avion_6.png", w: 384, h: 357 },
      { src: "img/mascota_avion_7.png", w: 377, h: 350 },
      { src: "img/mascota_avion_8.png", w: 377, h: 350 },
      { src: "img/mascota_avion_9.png", w: 378, h: 350 },
      { src: "img/mascota_avion_10.png", w: 378, h: 350 },
      { src: "img/mascota_avion_11.png", w: 379, h: 350 },
      { src: "img/mascota_avion_12.png", w: 379, h: 350 },
      { src: "img/mascota_avion_13.png", w: 379, h: 350 }
    ];
    FLEET_SRCS.forEach((item) => {
      const pre = new Image();
      pre.src = item.src;
    });
    const activeIdx = flights.map((f, i) => {
      const src = f.querySelector("img")?.getAttribute("src") || "";
      const found = FLEET_SRCS.findIndex((x) => x.src === src);
      return found >= 0 ? found : (i * 3) % FLEET_SRCS.length;
    });
    let cursor = 0;
    flights.forEach((flight, slot) => {
      const img = flight.querySelector("img");
      if (!img) return;
      flight.addEventListener("animationiteration", (e) => {
        if (e.animationName !== "htlCross") return;
        let pick = cursor % FLEET_SRCS.length;
        for (let tries = 0; tries < FLEET_SRCS.length; tries++) {
          const cand = (cursor + tries) % FLEET_SRCS.length;
          if (!activeIdx.includes(cand)) {
            pick = cand;
            cursor = (cand + 1) % FLEET_SRCS.length;
            break;
          }
        }
        activeIdx[slot] = pick;
        const next = FLEET_SRCS[pick];
        img.src = next.src;
        img.width = next.w;
        img.height = next.h;
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
    safeRun("skyFleet", initSkyFleet);
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
