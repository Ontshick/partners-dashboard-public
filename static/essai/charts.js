/* Aides Chart.js – thème PARTNERS (base MEURI) : traits fins, grilles discrètes, nombres au format français. */
(function () {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const COUL = ["#2f6fdb", "#f08a24", "#16a37f", "#e9a514", "#7c5cff", "#e0569b", "#0e9fb8", "#d1364a"];
  window.COUL = COUL;
  window.PC = {
    css,
    slot: (i) => COUL[(i - 1) % COUL.length],
    base() {
      if (window.__pcBase) return;
      window.__pcBase = true;
      // la police Inter arrive après la création des graphiques : on recalcule la mise en page
      // (sinon les étiquettes d'axe, mesurées avec la police de secours, sont rognées)
      if (document.fonts && document.fonts.ready) {
        const relayout = () => Object.values(Chart.instances).forEach(c => c.update("none"));
        document.fonts.ready.then(() => setTimeout(relayout, 0));
        document.fonts.addEventListener && document.fonts.addEventListener("loadingdone", relayout);
      }
      const D = Chart.defaults;
      D.locale = "fr-FR";                                   // séparateurs français (1 002 ; 26,2)
      D.font.family = 'Inter,"Segoe UI",system-ui,sans-serif';
      D.font.size = 12;
      D.color = "#93a6c2";
      D.borderColor = "rgba(148,178,222,.10)";
      D.maintainAspectRatio = false;
      D.layout.padding = { top: 4, right: 8, bottom: 0, left: 8 };
      D.interaction.mode = "nearest";
      D.interaction.intersect = false;
      // animation discrète
      D.animation.duration = 650;
      D.animation.easing = "easeOutCubic";
      // légende : pastilles rondes, texte clair, aligné à gauche
      const L = D.plugins.legend;
      L.align = "start";
      L.labels.usePointStyle = true;
      L.labels.pointStyle = "circle";
      L.labels.boxWidth = 7;
      L.labels.boxHeight = 7;
      L.labels.padding = 16;
      L.labels.color = "#c9d6e8";
      L.labels.font = { size: 12, weight: "500" };
      // infobulle : verre sombre, bord fin, typographie hiérarchisée
      const T = D.plugins.tooltip;
      T.backgroundColor = "rgba(9,20,40,.96)";
      T.borderColor = "rgba(140,180,240,.28)";
      T.borderWidth = 1;
      T.cornerRadius = 10;
      T.padding = { x: 12, y: 10 };
      T.caretSize = 5;
      T.boxPadding = 5;
      T.usePointStyle = true;
      T.titleColor = "#ffffff";
      T.titleFont = { size: 12.5, weight: "600" };
      T.titleMarginBottom = 6;
      T.bodyColor = "#c9d6e8";
      T.bodyFont = { size: 12 };
      T.bodySpacing = 4;
      // axes : grilles horizontales très légères, pas de bordure, graduations aérées
      D.scale.border.display = false;
      D.scale.grid.color = "rgba(148,178,222,.09)";
      D.scale.grid.drawTicks = false;
      D.scale.grid.tickLength = 0;          // sinon décalage des étiquettes d’axe (rognées à gauche)
      D.scale.grid.lineWidth = 1;
      D.scale.ticks.padding = 8;
      D.scale.ticks.color = "#8ea3c0";
      D.scale.ticks.font = { size: 11.5 };
      D.scale.title.color = "#8ea3c0";
      D.scale.title.font = { size: 11.5, weight: "500" };
      D.scales.category.grid = { display: false };
      // marques fines
      D.elements.line.borderWidth = 2;
      D.elements.line.tension = 0.32;
      D.elements.line.borderCapStyle = "round";
      D.elements.line.borderJoinStyle = "round";
      D.elements.point.radius = 0;
      D.elements.point.hoverRadius = 5;
      D.elements.point.hitRadius = 12;
      D.elements.point.borderWidth = 2;
      D.elements.point.hoverBorderWidth = 2;
      D.elements.point.borderColor = "#132a50";
      D.elements.point.hoverBorderColor = "#ffffff";
      D.elements.bar.borderRadius = 4;
      D.elements.arc.borderWidth = 2;
      D.elements.arc.borderColor = "#16305a";
      D.elements.arc.hoverOffset = 6;
      D.datasets.bar.maxBarThickness = 34;
      D.datasets.bar.categoryPercentage = 0.78;
      D.datasets.bar.barPercentage = 0.9;

      // barres : dégradé discret + séparation de 2 px entre segments empilés (lisibilité)
      if (!Chart.registry.plugins.get("degrade")) {
        Chart.register({ id: "degrade", beforeUpdate(chart) {
          const empile = Object.values(chart.options.scales || {}).some(s => s && s.stacked);
          chart.data.datasets.forEach(ds => {
            const type = ds.type || chart.config.type;
            if (type !== "bar") return;
            if (empile && ds.borderWidth === undefined) { ds.borderWidth = { top: 0, right: 0, bottom: 0, left: 0 }; ds.borderColor = "#14305a";
              ds.borderWidth = chart.options.indexAxis === "y" ? { right: 2 } : { top: 2 }; ds.borderSkipped = false; }
            if (typeof ds.backgroundColor !== "string" || !/^#[0-9a-f]{6}$/i.test(ds.backgroundColor) || ds._degrade) return;
            const c = ds.backgroundColor; ds._degrade = true; ds.hoverBackgroundColor = c;
            ds.backgroundColor = ctx => { const a = ctx.chart.chartArea; if (!a) return c;
              const h = ctx.chart.options.indexAxis === "y";
              const g = h ? ctx.chart.ctx.createLinearGradient(a.left, 0, a.right, 0) : ctx.chart.ctx.createLinearGradient(0, a.bottom, 0, a.top);
              g.addColorStop(0, c + "b3"); g.addColorStop(1, c); return g; };
          });
        } });
      }
      // étiquettes longues des axes de catégories : retour à la ligne (Chart.js limite la largeur de l'axe)
      if (!Chart.registry.plugins.get("retourLigne")) {
        const couper = (t, max) => {
          if (typeof t !== "string" || t.length <= max) return t;
          const mots = t.split(" "), lignes = [""];
          mots.forEach(m => { const l = lignes[lignes.length - 1];
            if ((l + " " + m).trim().length > max && l) lignes.push(m); else lignes[lignes.length - 1] = (l + " " + m).trim(); });
          return lignes;
        };
        Chart.register({ id: "retourLigne", beforeInit(chart) {
          if (chart.options.indexAxis !== "y" || !Array.isArray(chart.data.labels)) return;
          const w = (chart.canvas.parentNode && chart.canvas.parentNode.clientWidth) || chart.width;
          const max = w < 420 ? 15 : w < 800 ? 18 : 22;
          chart.data.labels = chart.data.labels.map(t => couper(t, max));
          // l'axe des étiquettes prend la largeur de sa plus longue ligne (pas de troncature)
          const opts = chart.config.options;
          opts.scales = opts.scales || {};
          opts.scales.y = opts.scales.y || {};
          if (!opts.scales.y.afterFit) opts.scales.y.afterFit = sc => {
            const ctx = sc.ctx, f = sc.options.ticks.font || {};
            ctx.save();
            ctx.font = `${f.weight || "normal"} ${f.size || 12}px ${f.family || "Inter, sans-serif"}`;
            let w = 0;
            (sc.chart.data.labels || []).forEach(l => (Array.isArray(l) ? l : [l]).forEach(x => { w = Math.max(w, ctx.measureText(String(x)).width); }));
            ctx.restore();
            sc.width = Math.max(sc.width, Math.ceil(w) + (sc.options.ticks.padding || 8) + 6);
          };
        } });
      }
      // étiquettes directes (valeur au bout de la barre) : options.plugins.valeurs = {format: v => …}
      if (!Chart.registry.plugins.get("valeurs")) {
        Chart.register({ id: "valeurs", afterDatasetsDraw(chart, _a, o) {
          if (!o || !o.actif) return;
          const ctx = chart.ctx, h = chart.options.indexAxis === "y";
          ctx.save();
          ctx.font = '600 11.5px Inter,"Segoe UI",sans-serif';
          ctx.fillStyle = "#dbe5f3";
          chart.data.datasets.forEach((ds, i) => {
            const meta = chart.getDatasetMeta(i);
            if (meta.hidden) return;
            meta.data.forEach((el, k) => {
              const v = ds.data[k];
              if (v == null || v === 0) return;
              const txt = o.format ? o.format(v, k, ds) : Number(v).toLocaleString("fr-FR");
              if (h) { ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(txt, el.x + 6, el.y); }
              else { ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.fillText(txt, el.x, el.y - 4); }
            });
          });
          ctx.restore();
        } });
      }
    },
    barre(couleur) {
      return { backgroundColor: couleur, borderRadius: 4, borderSkipped: "start", maxBarThickness: 34 };
    },
    axes(empile, titreY) {
      return {
        x: { stacked: !!empile, grid: { display: false } },
        y: { stacked: !!empile, beginAtZero: true, ticks: { precision: 0 },
             title: titreY ? { display: true, text: titreY } : undefined },
      };
    },
  };
  /* Pyramide des âges : hommes à gauche, femmes à droite.
     p = {labels, M:[], F:[], total} ; opts.pct = afficher en % du total ; opts.max = borne commune de l'axe. */
  window.PC.pyramide = function (canvas, p, opts = {}) {
    if (!canvas || !p) return;
    const pct = !!opts.pct, tot = p.total || 1;
    const conv = v => pct ? Math.round(1000 * v / tot) / 10 : v;
    const labels = [...p.labels].reverse();
    const M = [...p.M].reverse(), F = [...p.F].reverse();
    const fmt = v => pct ? Math.abs(v).toLocaleString("fr-FR") + " %" : Math.abs(v);
    return new Chart(canvas, {
      type: "bar",
      data: { labels, datasets: [
        { label: opts.libM || "Hommes", data: M.map(v => -conv(v)), brut: M, backgroundColor: COUL[0], borderRadius: 4, barPercentage: 0.95, categoryPercentage: 0.9 },
        { label: opts.libF || "Femmes", data: F.map(conv), brut: F, backgroundColor: COUL[5], borderRadius: 4, barPercentage: 0.95, categoryPercentage: 0.9 },
      ] },
      options: {
        indexAxis: "y",
        plugins: {
          legend: { display: opts.legende !== false },
          tooltip: { callbacks: {
            title: it => "Âge " + it[0].label + " ans",
            label: c => ` ${c.dataset.label} : ${c.dataset.brut[c.dataIndex]} (${(100 * c.dataset.brut[c.dataIndex] / tot).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %)`,
          } },
        },
        scales: {
          x: { stacked: true, min: opts.max ? -opts.max : undefined, max: opts.max || undefined,
               ticks: { callback: v => fmt(v), maxTicksLimit: opts.compact ? 5 : 7, stepSize: opts.compact && opts.max ? opts.max / 2 : undefined },
               title: { display: true, text: pct ? "% des participants du site" : "Participants" } },
          y: { stacked: true, grid: { display: false }, title: { display: !opts.compact, text: "Âge (ans)" } },
        },
      },
    });
  };

  /* Barres horizontales de proportions : items = [{lib, n, N, pct}] */
  window.PC.proportions = function (canvas, items, couleur) {
    if (!canvas || !items) return;
    return new Chart(canvas, {
      type: "bar",
      data: { labels: items.map(i => i.lib), datasets: [{ label: "% des participants", data: items.map(i => i.pct ?? 0),
        backgroundColor: couleur, borderRadius: 4, barThickness: 14 }] },
      options: { indexAxis: "y", layout: { padding: { right: 44 } }, plugins: { legend: { display: false },
          valeurs: { actif: true, format: (v, k) => items[k].N ? v.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " %" : "" },
          tooltip: { callbacks: { label: c => ` ${(items[c.dataIndex].pct ?? 0).toLocaleString("fr-FR")} % (${items[c.dataIndex].n}/${items[c.dataIndex].N})` } } },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: v => v + " %" } }, y: { grid: { display: false } } } },
    });
  };

  /* Comparaison par site : barres groupées, un jeu de données par site (couleur fixe du site).
     sites = [{nom, slot, items:[{lib,n,N,pct}]}] */
  window.PC.parSite = function (canvas, sites) {
    if (!canvas || !sites || !sites.length) return;
    const labels = sites[0].items.map(i => i.lib);
    return new Chart(canvas, {
      type: "bar",
      data: { labels, datasets: sites.map(s => ({ label: s.nom, data: s.items.map(i => i.pct ?? 0), items: s.items,
        backgroundColor: COUL[s.slot - 1], borderRadius: 3, barPercentage: 0.85, categoryPercentage: 0.8 })) },
      options: { indexAxis: "y", interaction: { mode: "index", axis: "y", intersect: false },
        plugins: { tooltip: { callbacks: { label: c => { const i = c.dataset.items[c.dataIndex];
          return ` ${c.dataset.label} : ${i.N ? (i.pct ?? 0).toLocaleString("fr-FR") + " % (" + i.n + "/" + i.N + ")" : "non mesuré"}`; } } } },
        scales: { x: { beginAtZero: true, max: 100, ticks: { callback: v => v + " %" } }, y: { grid: { display: false } } } },
    });
  };

  /* Localisation des sites : points (taille ∝ effectif) + étiquettes « nom / N participants ».
     sites = [{nom, slot, lat, lon, ville, n}] */
  window.PC.carteSites = function (canvas, sites) {
    if (!canvas || !sites || !sites.length) return;
    const nMax = Math.max(...sites.map(s => s.n), 1);
    // décalage des étiquettes pour les sites d'une même ville
    const parVille = {};
    sites.forEach(s => { const k = s.lat + "," + s.lon; (parVille[k] = parVille[k] || []).push(s); });
    const decal = new Map();
    Object.values(parVille).forEach(g => g.forEach((s, i) => decal.set(s, g.length === 1 ? { dx: 18, dy: -38 } :
      (i === 0 ? { dx: -190, dy: -46 } : { dx: 22, dy: 18 }))));
    const etiquettes = {
      id: "etiquettes-sites",
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx, meta = chart.getDatasetMeta(0);
        meta.data.forEach((pt, i) => {
          const s = sites[i], d = decal.get(s);
          const x = pt.x + d.dx, y = pt.y + d.dy, w = 168, h = 44;
          ctx.save();
          ctx.strokeStyle = "rgba(200,220,255,.55)"; ctx.setLineDash([3, 3]); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(pt.x, pt.y); ctx.lineTo(x + (d.dx < 0 ? w : 0), y + h / 2); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(14,32,62,.94)"; ctx.strokeStyle = "rgba(140,180,240,.45)";
          ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
          ctx.fillStyle = COUL[s.slot - 1]; ctx.fillRect(x, y + 6, 3, h - 12);
          ctx.fillStyle = "#dbe5f3"; ctx.font = "600 12px Inter, system-ui, sans-serif";
          ctx.fillText(s.nom.length > 24 ? s.nom.slice(0, 23) + "…" : s.nom, x + 10, y + 17);
          ctx.fillStyle = "#ffffff"; ctx.font = "800 15px Inter, system-ui, sans-serif";
          ctx.fillText(s.n + " participants", x + 10, y + 35);
          ctx.restore();
        });
      },
    };
    return new Chart(canvas, {
      type: "bubble",
      data: { datasets: [{ data: sites.map(s => ({ x: s.lon, y: s.lat, r: 7 + 14 * Math.sqrt(s.n / nMax) })),
        backgroundColor: sites.map(s => COUL[s.slot - 1] + "cc"), borderColor: "#ffffff", borderWidth: 1.5 }] },
      options: {
        layout: { padding: { top: 10, right: 10 } },
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: c => { const s = sites[c.dataIndex]; return ` ${s.nom} – ${s.ville} : ${s.n} participants`; } } } },
        scales: {
          x: { min: 28.6, max: 31.2, title: { display: true, text: "Longitude (° E)" }, ticks: { callback: v => v.toFixed(1) } },
          y: { min: -0.1, max: 2.5, title: { display: true, text: "Latitude (° N)" }, ticks: { callback: v => v.toFixed(1) } },
        },
      },
      plugins: [etiquettes],
    });
  };

  // menu latéral sur mobile
  document.addEventListener("DOMContentLoaded", () => {
    const m = document.getElementById("menu"), b = document.getElementById("bouton-menu");
    if (!m || !b) return;
    b.addEventListener("click", e => { e.stopPropagation(); m.classList.toggle("ouvert"); });
    document.addEventListener("click", e => { if (m.classList.contains("ouvert") && !m.contains(e.target)) m.classList.remove("ouvert"); });
  });
})();
