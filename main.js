(function () {
  var dict = window.SOLENE;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var form = document.getElementById("note");
  var summary = document.getElementById("summary");
  var progress = document.getElementById("progress");
  var heroImg = document.querySelector(".hero-media img");
  var stageNum = document.querySelector(".stage-num");
  var stageCaption = document.querySelector(".stage-caption");
  var thanks = document.getElementById("thanks");
  var index = document.querySelector(".index");
  var bridge = document.getElementById("bridge");
  var sendButton = document.getElementById("send");
  var currentPhoto = "hills";
  var sent = false;
  var waiting = false;

  document.querySelectorAll("[data-key]").forEach(function (el) {
    var value = dict.values[el.dataset.key];
    if (value) el.value = value;
  });

  fillDates();
  bindOtherFields();
  bindCounts();
  watchChapters();
  watchScroll();

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (waiting) return;
    var result = window.SoleneForm.build(dict, readForm(), new Date());
    clearErrors();
    if (!result.ok) {
      showErrors(result.errors);
      return;
    }
    post(result.fields);
  });

  form.addEventListener("input", function (event) {
    var box = event.target.closest(".field, fieldset");
    if (box) box.classList.remove("is-bad");
  });

  function fillDates() {
    var day = document.getElementById("day");
    var month = document.getElementById("month");
    var year = document.getElementById("year");
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    addPlaceholder(day, "Day");
    addPlaceholder(month, "Month");
    addPlaceholder(year, "Year");
    for (var d = 1; d <= 31; d += 1) addOption(day, String(d), String(d));
    months.forEach(function (name, index) { addOption(month, String(index + 1), name); });
    for (var y = 2008; y >= 1930; y -= 1) addOption(year, String(y), String(y));
  }

  function addPlaceholder(select, label) {
    var option = document.createElement("option");
    option.value = "";
    option.textContent = label;
    select.appendChild(option);
  }

  function addOption(select, value, label) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  function bindOtherFields() {
    document.querySelectorAll("[data-other]").forEach(function (box) {
      var wrap = document.getElementById("wrap-" + box.dataset.other);
      var sync = function () {
        wrap.classList.toggle("is-open", box.checked);
        if (!box.checked) wrap.querySelector("input").value = "";
      };
      box.addEventListener("change", sync);
      sync();
    });
  }

  function bindCounts() {
    count("places", "place-count", "place", "places");
    count("styles", "style-count", "kind of day", "kinds of day");
    count("languages", "language-count", "language", "languages");
  }

  function count(name, outputId, singular, plural) {
    var output = document.getElementById(outputId);
    var boxes = form.querySelectorAll('input[name="' + name + '"]');
    var write = function () {
      var n = form.querySelectorAll('input[name="' + name + '"]:checked').length;
      output.textContent = n === 0 ? "" : n === 1 ? "1 " + singular : n + " " + plural;
    };
    boxes.forEach(function (box) { box.addEventListener("change", write); });
  }

  function watchChapters() {
    var chapters = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
    if (!("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (visible) showChapter(visible.target);
    }, { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.4, 0.75] });
    chapters.forEach(function (chapter) { observer.observe(chapter); });
  }

  function showChapter(section) {
    if (sent) return;
    setPhoto(section.dataset.photo);
    stageNum.textContent = section.dataset.num || "";
    stageCaption.textContent = section.dataset.caption || "";
    document.querySelectorAll(".index a").forEach(function (link) {
      var on = link.getAttribute("href") === "#" + section.id;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  function setPhoto(name) {
    if (!name || name === currentPhoto) return;
    currentPhoto = name;
    document.querySelectorAll(".stage img").forEach(function (img) {
      var on = img.dataset.photo === name;
      img.classList.toggle("is-on", on);
      if (on) img.removeAttribute("aria-hidden");
      else img.setAttribute("aria-hidden", "true");
    });
  }

  function watchScroll() {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var y = window.scrollY || window.pageYOffset || 0;
        progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
        if (!reduce && heroImg) {
          var shift = Math.min(y, window.innerHeight) * 0.08;
          heroImg.style.transform = "scale(1.12) translate3d(0," + shift + "px,0)";
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function readForm() {
    return {
      first: value("first"),
      last: value("last"),
      email: value("email"),
      day: value("day"),
      month: value("month"),
      year: value("year"),
      city: value("city"),
      country: value("country"),
      nationality: value("nationality"),
      riding: radio("riding"),
      languages: checked("languages"),
      languageOther: value("languageOther"),
      airport: value("airport"),
      instagram: value("instagram"),
      whatsapp: value("whatsapp"),
      styles: checked("styles"),
      styleOther: value("styleOther"),
      places: checked("places"),
      placeOther: value("placeOther"),
      when: value("when-text"),
      who: radio("who"),
      updates: radio("updates"),
      group: radio("group")
    };
  }

  function value(id) {
    var el = document.getElementById(id);
    return el ? el.value : "";
  }

  function radio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function checked(name) {
    return Array.prototype.map.call(
      form.querySelectorAll('input[name="' + name + '"]:checked'),
      function (el) { return el.value; }
    );
  }

  function clearErrors() {
    summary.hidden = true;
    summary.innerHTML = "";
    form.querySelectorAll(".is-bad").forEach(function (el) { el.classList.remove("is-bad"); });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".err").forEach(function (el) {
      el.hidden = true;
      el.textContent = "";
    });
  }

  function showErrors(errors) {
    var seen = {};
    var unique = errors.filter(function (error) {
      if (seen[error.id]) return false;
      seen[error.id] = true;
      return true;
    });
    summary.hidden = false;
    summary.innerHTML = "<p>A few things still need an answer.</p><ul>" + unique.map(function (error) {
      return '<li><a href="#' + error.id + '">' + error.message + "</a></li>";
    }).join("") + "</ul>";
    unique.forEach(function (error) {
      var el = document.getElementById(error.id);
      if (!el) return;
      var box = el.closest(".field, fieldset") || el;
      box.classList.add("is-bad");
      var control = el.matches("input, select, textarea") ? el : el.querySelector("input, select, textarea");
      if (control) control.setAttribute("aria-invalid", "true");
      var message = document.getElementById("err-" + error.id);
      if (message) {
        message.hidden = false;
        message.textContent = error.message;
      }
    });
    summary.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    var first = document.getElementById(unique[0].id);
    if (!first) return;
    var focusTarget = first.matches("input, select, textarea, button, a") ? first : first.querySelector("input, select, textarea");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function post(fields) {
    waiting = true;
    sendButton.disabled = true;
    sendButton.textContent = "Sending";
    var carrier = document.createElement("form");
    carrier.method = "POST";
    carrier.action = dict.action;
    carrier.target = "solene-bridge";
    carrier.acceptCharset = "UTF-8";
    hidden(carrier, "fvv", "1");
    hidden(carrier, "pageHistory", "0");
    hidden(carrier, "submissionTimestamp", String(Date.now()));
    fields.forEach(function (field) { hidden(carrier, field.name, field.value); });
    document.body.appendChild(carrier);

    var finished = false;
    var timer = window.setTimeout(function () {
      if (finished) return;
      finished = true;
      fail();
    }, 12000);

    bridge.onload = function () {
      if (!waiting || finished) return;
      finished = true;
      window.clearTimeout(timer);
      succeed();
    };

    carrier.submit();
    carrier.remove();
  }

  function hidden(carrier, name, value) {
    var input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    carrier.appendChild(input);
  }

  function succeed() {
    waiting = false;
    sent = true;
    form.hidden = true;
    index.hidden = true;
    thanks.hidden = false;
    setPhoto("hills");
    stageNum.textContent = "";
    stageCaption.textContent = "Open grass, a long horizon.";
    var title = document.getElementById("thanks-title");
    title.focus();
    thanks.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function fail() {
    waiting = false;
    sendButton.disabled = false;
    sendButton.textContent = "Send to Solene";
    summary.hidden = false;
    summary.innerHTML = "<p>That didn't go through. Your answers are still here. Try again in a moment.</p>";
    summary.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }
})();
