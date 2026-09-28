$(document).ready(function () {
  // Disclosures retain keyboard support and expose their expanded state.
  $("a.abstract, a.award, a.bibtex")
    .attr("tabindex", "0")
    .attr("aria-expanded", "false")
    .on("click", function () {
      const kind = ["abstract", "award", "bibtex"].find((name) => this.classList.contains(name));
      const entry = $(this).closest(".publication-content");
      const panel = entry.find("div." + kind + ".hidden");
      const opening = !panel.hasClass("open");
      entry.find("div.hidden.open").removeClass("open");
      entry.find("a[aria-expanded]").attr("aria-expanded", "false");
      panel.toggleClass("open", opening);
      $(this).attr("aria-expanded", String(opening));
    })
    .on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.click();
      }
    });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  var $tocNavs = $("nav.js-toc, #toc-sidebar");
  if ($tocNavs.length && window.Toc) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var $tocScope = $("#markdown-content").length ? $("#markdown-content") : $(document.body);
    $tocNavs.each(function () {
      Toc.init({
        $nav: $(this),
        $scope: $tocScope,
      });
    });
    if ($("#toc-sidebar").length) {
      $("body").scrollspy({
        target: "#toc-sidebar",
        offset: 100,
      });
    }
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
