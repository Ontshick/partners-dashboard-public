/* Aides Chart.js : couleurs lues dans les tokens CSS (clair/sombre). */
(function () {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  window.PC = {
    css,
    slot: (i) => css(`--s${((i - 1) % 8) + 1}`),
    base() {
      Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
      Chart.defaults.font.size = 12;
      Chart.defaults.color = css("--text-2");
      Chart.defaults.borderColor = css("--grid");
      Chart.defaults.plugins.legend.labels.boxWidth = 10;
      Chart.defaults.plugins.legend.labels.boxHeight = 10;
      Chart.defaults.plugins.legend.labels.useBorderRadius = true;
      Chart.defaults.plugins.legend.labels.borderRadius = 3;
      Chart.defaults.plugins.legend.align = "start";
      Chart.defaults.plugins.tooltip.backgroundColor = css("--surface");
      Chart.defaults.plugins.tooltip.titleColor = css("--text");
      Chart.defaults.plugins.tooltip.bodyColor = css("--text-2");
      Chart.defaults.plugins.tooltip.borderColor = css("--border");
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.padding = 10;
      Chart.defaults.plugins.tooltip.boxPadding = 4;
      Chart.defaults.plugins.tooltip.usePointStyle = true;
      Chart.defaults.maintainAspectRatio = false;
    },
    barre(couleur) {
      return {
        backgroundColor: couleur, borderColor: css("--surface"), borderWidth: { top: 0, bottom: 0, left: 1, right: 1 },
        borderRadius: { topLeft: 4, topRight: 4 }, borderSkipped: "bottom", maxBarThickness: 44,
      };
    },
    axes(empile, titreY) {
      return {
        x: { stacked: !!empile, grid: { display: false } },
        y: { stacked: !!empile, beginAtZero: true, border: { display: false }, ticks: { precision: 0 },
             title: titreY ? { display: true, text: titreY } : undefined },
      };
    },
  };
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const sombre = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
      const nv = sombre ? "light" : "dark";
      try { localStorage.setItem("theme", nv); } catch (e) {}
      document.documentElement.setAttribute("data-theme", nv);
      location.reload();
    });
  });
})();
