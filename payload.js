/* Turns the page's answers into Google Form fields. No DOM. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SoleneForm = api;
})(typeof self !== "undefined" ? self : this, function () {
  function realDate(year, month, day) {
    var dt = new Date(Date.UTC(year, month - 1, day));
    return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
  }

  function ageOn(year, month, day, today) {
    var years = today.getFullYear() - year;
    var monthNow = today.getMonth() + 1;
    var dayNow = today.getDate();
    if (monthNow < month || (monthNow === month && dayNow < day)) years -= 1;
    return years;
  }

  function build(dict, input, today) {
    var errors = [];
    var fields = [];
    var entries = dict.entries;

    function text(value) {
      return typeof value === "string" ? value.trim() : "";
    }

    function need(id, value, message) {
      var cleaned = text(value);
      if (!cleaned) errors.push({ id: id, message: message });
      return cleaned;
    }

    function push(name, value) {
      var cleaned = text(value);
      if (!cleaned) return;
      fields.push({ name: name, value: cleaned });
    }

    push(entries.first, need("first", input.first, "We need your first name."));
    push(entries.last, need("last", input.last, "We need your last name."));

    var email = need("email", input.email, "We need an email so Solene can write back.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ id: "email", message: "That email doesn't look right." });
    } else if (email) {
      push(entries.email, email);
    }

    var day = Number(input.day);
    var month = Number(input.month);
    var year = Number(input.year);
    if (!input.day || !input.month || !input.year) {
      errors.push({ id: "birthday", message: "We need your birthday." });
    } else if (!realDate(year, month, day)) {
      errors.push({ id: "birthday", message: "That date doesn't exist. Check the day and month." });
    } else if (ageOn(year, month, day, today) < 18) {
      errors.push({ id: "birthday", message: "These rides are for riders 18 and over." });
    } else {
      push(entries.birthday + "_year", String(year));
      push(entries.birthday + "_month", String(month));
      push(entries.birthday + "_day", String(day));
    }

    push(entries.city, need("city", input.city, "Which city or town?"));
    push(entries.country, need("country", input.country, "Which country?"));
    push(entries.nationality, need("nationality", input.nationality, "We need a nationality. More than one is fine."));

    if (!text(input.riding)) errors.push({ id: "riding", message: "Pick the riding that sounds most like you." });
    else push(entries.riding, input.riding);

    var languages = Array.isArray(input.languages) ? input.languages : [];
    if (!languages.length) errors.push({ id: "languages", message: "Pick at least one language." });
    languages.forEach(function (item) {
      if (item !== "__other_option__") push(entries.languages, item);
    });
    if (languages.indexOf("__other_option__") !== -1) {
      var languageOther = need("languageOther", input.languageOther, "Write the other language.");
      if (languageOther) {
        push(entries.languages, "__other_option__");
        push(entries.languages + ".other_option_response", languageOther);
      }
    }

    push(entries.airport, need("airport", input.airport, "Which airport do you usually fly from?"));
    push(entries.instagram, input.instagram || "");
    push(entries.whatsapp, input.whatsapp || "");

    var styles = Array.isArray(input.styles) ? input.styles : [];
    if (!styles.length) errors.push({ id: "styles", message: "Pick at least one kind of trip." });
    styles.forEach(function (item) {
      if (item !== "__other_option__") push(entries.styles, item);
    });
    if (styles.indexOf("__other_option__") !== -1) {
      var styleOther = need("styleOther", input.styleOther, "Say a little about that other kind of trip.");
      if (styleOther) {
        push(entries.styles, "__other_option__");
        push(entries.styles + ".other_option_response", styleOther);
      }
    }

    var places = Array.isArray(input.places) ? input.places : [];
    if (!places.length) errors.push({ id: "places-set", message: "Pick at least one place, or write another." });
    places.forEach(function (item) {
      if (item !== "__other_option__") push(entries.places, item);
    });
    if (places.indexOf("__other_option__") !== -1) {
      var placeOther = need("placeOther", input.placeOther, "Where else would you love to ride?");
      if (placeOther) {
        push(entries.places, "__other_option__");
        push(entries.places + ".other_option_response", placeOther);
      }
    }

    push(entries.when, input.when || "");
    if (text(input.who)) push(entries.who, input.who);
    if (text(input.updates)) push(entries.updates, input.updates);
    if (text(input.group)) push(entries.group, input.group);

    return { ok: errors.length === 0, errors: errors, fields: fields };
  }

  return { build: build, realDate: realDate, ageOn: ageOn };
});
