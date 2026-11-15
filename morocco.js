(function () {
  var progress = document.getElementById("progress");
  var stageNum = document.querySelector(".stage-num");
  var stageCaption = document.querySelector(".stage-caption");
  var current = "tea";

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
    setPhoto(section.dataset.photo);
    stageNum.textContent = section.dataset.num || "";
    stageCaption.textContent = section.dataset.caption || "";
    document.querySelectorAll(".index a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + section.id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (visible) show(visible.target);
    }, { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.4, 0.75] });
    document.querySelectorAll(".chapter").forEach(function (chapter) { observer.observe(chapter); });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var y = window.scrollY || window.pageYOffset || 0;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      ticking = false;
    });
  }, { passive: true });
})();
