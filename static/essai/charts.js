/* Aides Chart.js – réglages visuels repris du tableau de bord MEURI RDC. */
(function () {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const COUL = ["#2f6fdb", "#f08a24", "#16a37f", "#e9a514", "#7c5cff", "#e0569b", "#0e9fb8", "#d1364a"];
  window.COUL = COUL;
  window.PC = {
    css,
    slot: (i) => COUL[(i - 1) % COUL.length],
    base() {
      Chart.defaults.font.family = 'Inter,"Segoe UI",system-ui,sans-serif';
      Chart.defaults.color = "#b8c7dc";
      Chart.defaults.borderColor = "rgba(148,178,222,.16)";
      Chart.defaults.plugins.legend.labels.boxWidth = 10;
      Chart.defaults.plugins.legend.labels.boxHeight = 10;
      Chart.defaults.plugins.legend.labels.usePointStyle = true;
      Chart.defaults.plugins.legend.labels.pointStyle = "rectRounded";
      Chart.defaults.plugins.legend.labels.padding = 14;
      Chart.defaults.plugins.legend.align = "start";
      Chart.defaults.plugins.tooltip.backgroundColor = "rgba(8,26,49,.95)";
      Chart.defaults.plugins.tooltip.padding = 10;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
      Chart.defaults.plugins.tooltip.boxPadding = 4;
      Chart.defaults.plugins.tooltip.usePointStyle = true;
      Chart.defaults.plugins.tooltip.titleFont = { weight: "600" };
      Chart.defaults.elements.line.tension = 0.3;
      Chart.defaults.elements.line.borderWidth = 2.5;
      Chart.defaults.animation.duration = 900;
      Chart.defaults.animation.easing = "easeOutQuart";
      Chart.defaults.scale.grid.color = "rgba(148,178,222,.12)";
      Chart.defaults.scale.border.display = false;
      Chart.defaults.maintainAspectRatio = false;
      // barres en dégradé (couleur pleine en haut, plus claire à la base), comme MEURI
      if (!Chart.registry.plugins.get("degrade")) {
        Chart.register({ id: "degrade", beforeUpdate(chart) {
          chart.data.datasets.forEach(ds => {
            const type = ds.type || chart.config.type;
            if (type !== "bar" || typeof ds.backgroundColor !== "string" || !/^#[0-9a-f]{6}$/i.test(ds.backgroundColor) || ds._degrade) return;
            const c = ds.backgroundColor; ds._degrade = true; ds.hoverBackgroundColor = c;
            ds.backgroundColor = ctx => { const a = ctx.chart.chartArea; if (!a) return c;
              const h = ctx.chart.options.indexAxis === "y";
              const g = h ? ctx.chart.ctx.createLinearGradient(a.left, 0, a.right, 0) : ctx.chart.ctx.createLinearGradient(0, a.bottom, 0, a.top);
              g.addColorStop(0, c + "99"); g.addColorStop(1, c); return g; };
          });
        } });
      }
    },
    barre(couleur) {
      return { backgroundColor: couleur, borderRadius: 5, borderSkipped: "bottom", maxBarThickness: 40 };
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
        { label: "Hommes", data: M.map(v => -conv(v)), brut: M, backgroundColor: COUL[0], borderRadius: 4, barPercentage: 0.95, categoryPercentage: 0.9 },
        { label: "Femmes", data: F.map(conv), brut: F, backgroundColor: COUL[5], borderRadius: 4, barPercentage: 0.95, categoryPercentage: 0.9 },
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
        backgroundColor: couleur, borderRadius: 4, barThickness: 16 }] },
      options: { indexAxis: "y", plugins: { legend: { display: false },
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
