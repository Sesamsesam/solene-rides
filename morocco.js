(function () {
  var progress = document.getElementById("progress");
  var stageNum = document.querySelector(".stage-num");
  var stageCaption = document.querySelector(".stage-caption");
  var current = "tea";
  var active = null;

  function setPhoto(name) {
    if (!name || name === current) return;
    current = name;
    document.querySelectorAll(".stage img").forEach(function (img) {
      var on = img.dataset.photo === name;
      img.classList.toggle("is-on", on);
      if (on) img.removeAttribute("aria-hidden");
      else img.setAttribute("aria-hidden", "true");
    });
  }

  function show(section) {
    if (!section || section === active) return;
    active = section;
    setPhoto(section.dataset.photo);
    stageNum.textContent = section.dataset.num || "";
    stageCaption.textContent = section.dataset.caption || "";
    document.querySelectorAll(".index a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + section.id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  var chapters = document.querySelectorAll(".chapter");

  function chapterAtMark() {
    var mark = window.innerHeight * 0.42;
    var chosen = chapters[0];
    chapters.forEach(function (chapter) {
      if (chapter.getBoundingClientRect().top <= mark) chosen = chapter;
    });
    if (chosen) show(chosen);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset || 0;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      chapterAtMark();
      ticking = false;
    });
  }, { passive: true });
  chapterAtMark();
})();
