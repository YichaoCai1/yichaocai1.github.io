$(document).ready(function () {
  ($("a.abstract, a.award, a.bibtex")
    .attr("tabindex", "0")
    .attr("aria-expanded", "false")
    .on("click", function () {
      const t = ["abstract", "award", "bibtex"].find((t) => this.classList.contains(t)),
        e = $(this).closest(".publication-content"),
        a = e.find("div." + t + ".hidden"),
        n = !a.hasClass("open");
      (e.find("div.hidden.open").removeClass("open"),
        e.find("a[aria-expanded]").attr("aria-expanded", "false"),
        a.toggleClass("open", n),
        $(this).attr("aria-expanded", String(n)));
    })
    .on("keydown", function (t) {
      ("Enter" !== t.key && " " !== t.key) || (t.preventDefault(), this.click());
    }),
    $("a").removeClass("waves-effect waves-light"));
  var t = $("nav.js-toc, #toc-sidebar");
  if (t.length && window.Toc) {
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var e = $("#markdown-content").length ? $("#markdown-content") : $(document.body);
    (t.each(function () {
      Toc.init({ $nav: $(this), $scope: e });
    }),
      $("#toc-sidebar").length && $("body").scrollspy({ target: "#toc-sidebar", offset: 100 }));
  }
  const a = document.createElement("link");
  ((a.href = "../css/jupyter.css"), (a.rel = "stylesheet"), (a.type = "text/css"));
  let n = determineComputedTheme();
  ($(".jupyter-notebook-iframe-container iframe").each(function () {
    ($(this).contents().find("head").append(a),
      "dark" == n &&
        $(this).bind("load", function () {
          $(this).contents().find("body").attr({ "data-jp-theme-light": "false", "data-jp-theme-name": "JupyterLab Dark" });
        }));
  }),
    $('[data-toggle="popover"]').popover({ trigger: "hover" }));
});
