/**
 * Submit Event form — client-side validation and Formspree text submission.
 *
 * Why stay in the browser: There is no application server. This script assembles a disciplined
 * payload from validated fields and sends the text through the shared Formspree endpoint.
 *
 * How it works: readForm() mirrors the JSON schema the maintainer merges into features[]; event
 * rows include card lines and adCopy so promotional text lives in data, not only in static HTML.
 */
(function () {
  var KNOWN_HALLS = { "Hall A": true, "Hall B": true, "Hall C": true };
  /** Must match `<option value="…">` for Other on contents/submit-feature.html. */
  var LOCATION_PRESET_OTHER = "__other__";
  var LOCATION_OTHER_PLACEHOLDER = "Example: Hall B, library, pool room…";

  var TIME_24H_RE = /^\d{1,2}:\d{2}$/;
  /** `<select>` value for open-ended end time → exported as plain language for the coordinator. */
  var END_TIME_UNTIL_TIRED_VALUE = "__until_tired__";
  var END_TIME_UNTIL_TIRED_LABEL = "Until we get tired";

  var IMAGE_INPUT_IDS = [
    "mmhp-submit-image-feature",
    "mmhp-submit-image-extra-1",
    "mmhp-submit-image-extra-2",
    "mmhp-submit-image-extra-3",
    "mmhp-submit-image-extra-4",
  ];

  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjkjbbe";
  var FORMSPREE_EMAIL_SUBJECT = "MMHP Events Request.";

  function getMasterJsonUrl() {
    var u = document.body && document.body.getAttribute("data-mmhp-master-json");
    return u ? String(u).trim() : "";
  }

  function normalizeEndTimeFromSelect(raw) {
    var s = String(raw || "").trim();
    if (s === END_TIME_UNTIL_TIRED_VALUE) return END_TIME_UNTIL_TIRED_LABEL;
    return s;
  }

  function isValidEndTimeString(s) {
    var t = String(s || "").trim();
    if (t === END_TIME_UNTIL_TIRED_LABEL) return true;
    return TIME_24H_RE.test(t);
  }

  function isValidEmail(s) {
    if (window.mmhpValidateCoordinatorEmail) return window.mmhpValidateCoordinatorEmail(s);
    s = String(s || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  function coordinatorEmail() {
    if (window.mmhpGetCoordinatorEmailDefault) return window.mmhpGetCoordinatorEmailDefault();
    if (window.mmhpGetCoordinatorEmail) return window.mmhpGetCoordinatorEmail();
    return "eventcoordinator@friendsofmmhp.com";
  }

  function confirmationCopyText(email) {
    return " A confirmation copy will be sent to " + email + ".";
  }

  function focusStatus(statusEl) {
    if (!statusEl) return;
    if (!statusEl.hasAttribute("tabindex")) statusEl.setAttribute("tabindex", "-1");
    window.setTimeout(function () {
      if (statusEl.scrollIntoView) {
        statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (typeof statusEl.focus === "function") {
        try {
          statusEl.focus({ preventScroll: true });
        } catch (e) {
          try {
            statusEl.focus();
          } catch (e2) {}
        }
      }
    }, 0);
  }

  function setStatusState(statusEl, state) {
    if (!statusEl) return;
    statusEl.classList.remove(
      "event-submit-form__status--sending",
      "event-submit-form__status--success",
      "event-submit-form__status--error"
    );
    if (state) statusEl.classList.add("event-submit-form__status--" + state);
  }

  /** Append half-hour options after the first “until tired” option (runs once). */
  function buildEndTimeSelectOptions() {
    var sel = document.getElementById("mmhp-submit-endTime");
    if (!sel || sel.getAttribute("data-mmhp-endtime-built") === "1") return;
    sel.setAttribute("data-mmhp-endtime-built", "1");
    while (sel.options.length > 1) {
      sel.remove(1);
    }
    for (var h = 11; h <= 23; h++) {
      for (var half = 0; half < 2; half++) {
        if (h === 23 && half === 1) break;
        var mins = half === 0 ? "00" : "30";
        var tv = h + ":" + mins;
        var opt = document.createElement("option");
        opt.value = tv;
        opt.textContent = tv;
        sel.appendChild(opt);
      }
    }
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function todayIsoLocal() {
    var n = new Date();
    return n.getFullYear() + "-" + pad2(n.getMonth() + 1) + "-" + pad2(n.getDate());
  }

  function formatEventCardLine3FromIso(ymd) {
    var p = (ymd || "").trim().split("-");
    if (p.length !== 3) return "";
    var y = parseInt(p[0], 10);
    var mo = parseInt(p[1], 10) - 1;
    var d = parseInt(p[2], 10);
    if (isNaN(y) || isNaN(mo) || isNaN(d)) return "";
    var dt = new Date(y, mo, d);
    return dt
      .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      .replace(/,/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function deriveListingTitle(cardLine1, cardLine2) {
    var c2 = cardLine2 != null ? String(cardLine2).trim() : "";
    var c1 = cardLine1 != null ? String(cardLine1).trim() : "";
    if (!c1 && !c2) return "";
    if (!c1) return c2;
    if (!c2) return c1;
    return c1 + " — " + c2;
  }

  function activityNameFromListingTitle(listingTitle) {
    var t = String(listingTitle || "").trim();
    var sep = " — ";
    var idx = t.lastIndexOf(sep);
    if (idx === -1) return "";
    return t.slice(idx + sep.length).trim();
  }

  function computeNextFeatureId(featureRows) {
    if (!Array.isArray(featureRows)) return "fe0001";
    var max = 0;
    function bumpId(raw) {
      if (raw == null) return;
      var s = String(raw).trim();
      var m = /^fe(\d+)$/i.exec(s);
      if (m) {
        var n = parseInt(m[1], 10);
        if (!isNaN(n)) max = Math.max(max, n);
        return;
      }
      m = /^ev(\d+)$/i.exec(s);
      if (m) {
        var n2 = parseInt(m[1], 10);
        if (!isNaN(n2)) max = Math.max(max, n2);
      }
    }
    for (var i = 0; i < featureRows.length; i++) {
      var r = featureRows[i];
      if (!r) continue;
      bumpId(r.id);
      bumpId(r.featureId);
    }
    var used = {};
    for (var u = 0; u < featureRows.length; u++) {
      var r2 = featureRows[u];
      if (!r2) continue;
      if (r2.id != null) used[String(r2.id).trim()] = true;
      if (r2.featureId != null) used[String(r2.featureId).trim()] = true;
    }
    var next = max + 1;
    var candidate;
    do {
      var numStr = String(next);
      while (numStr.length < 4) numStr = "0" + numStr;
      candidate = "fe" + numStr;
      next++;
    } while (used[candidate]);
    return candidate;
  }

  /** Same style as master-data card line 3; capped at 32 chars for site cards. */
  function cardLine3FromEventDate(isoYmd) {
    var s = formatEventCardLine3FromIso(isoYmd);
    s = String(s || "").trim();
    if (s.length > 32) s = s.slice(0, 32);
    return s;
  }

  function finalizeFeatureRow(ev) {
    if (!ev || typeof ev !== "object") return;
    if (Object.prototype.hasOwnProperty.call(ev, "activityId")) {
      delete ev.activityId;
    }
    var sid = ev.id != null ? String(ev.id).trim() : "";
    var sfid = ev.featureId != null ? String(ev.featureId).trim() : "";
    if (sid && !sfid) ev.featureId = sid;
    if (sfid && !sid) ev.id = sfid;
    if (ev.id != null) ev.id = String(ev.id).trim();
    if (ev.featureId != null) ev.featureId = String(ev.featureId).trim();
    var c1 = ev.cardLine1 != null ? String(ev.cardLine1).trim() : "";
    var c2 = ev.cardLine2 != null ? String(ev.cardLine2).trim() : "";
    if (!c2 && ev.eventName != null && String(ev.eventName).trim()) {
      c2 = activityNameFromListingTitle(ev.eventName);
    }
    if (c2) ev.cardLine2 = c2;
    else delete ev.cardLine2;
    ev.eventName = deriveListingTitle(c1, c2);
  }

  function validateSubmissionForm(ev) {
    if (!ev || typeof ev !== "object")
      return { message: "Something went wrong. Please reload and try again.", focusEl: null };

    function needStr(v) {
      return v != null && String(v).trim() !== "";
    }

    var el;

    el = document.getElementById("mmhp-submit-requester-email");
    if (!needStr(ev.requesterEmail))
      return { message: "Please add your email address.", focusEl: el };
    if (!isValidEmail(ev.requesterEmail))
      return { message: "Please enter a valid email address.", focusEl: el };

    if (!needStr(ev.id))
      return { message: "Something’s wrong with your event number. Try refreshing the page.", focusEl: document.getElementById("mmhp-submit-date") };

    el = document.getElementById("mmhp-submit-date");
    if (!needStr(ev.date))
      return { message: "Pick the date of the event.", focusEl: el };

    el = document.getElementById("mmhp-submit-startTime");
    if (!needStr(ev.startTime))
      return { message: "Add a start time.", focusEl: el };
    if (!TIME_24H_RE.test(String(ev.startTime).trim()))
      return { message: "Use a time like 19:00 for 7:00 p.m.", focusEl: el };

    el = document.getElementById("mmhp-submit-endTime");
    if (!needStr(ev.endTime))
      return { message: "Pick an end time.", focusEl: el };
    if (!isValidEndTimeString(ev.endTime))
      return {
        message: "Pick an end time from the list, or “Until we get tired.”",
        focusEl: el,
      };

    var presetEl = document.getElementById("mmhp-submit-location-preset");
    if (!presetEl || !String(presetEl.value || "").trim())
      return { message: "Pick where you’ll meet.", focusEl: presetEl };

    if (presetEl.value === LOCATION_PRESET_OTHER) {
      el = document.getElementById("mmhp-submit-location-other");
      if (!needStr(ev.location))
        return { message: "Please say where you’ll meet—in the box below.", focusEl: el };
    } else if (!needStr(ev.location)) {
      return { message: "Pick where you’ll meet.", focusEl: presetEl };
    }

    el = document.getElementById("mmhp-submit-cardLine1");
    if (!el || !needStr(el.value))
      return { message: "Please add a title for the card.", focusEl: el };

    el = document.getElementById("mmhp-submit-cardLine2");
    if (!el || !needStr(el.value))
      return { message: "Please add a subtitle for the card.", focusEl: el };

    el = document.getElementById("mmhp-submit-adCopy");
    if (!el || !needStr(el.value))
      return { message: "Please add a short description for the flyer.", focusEl: el };

    if (!needStr(ev.eventName))
      return {
        message: "The full name didn’t build—check your title and subtitle above.",
        focusEl: document.getElementById("mmhp-submit-cardLine1"),
      };

    if (ev.isActive === undefined || ev.isActive === null)
      return {
        message: "Please say whether this should show on the calendar.",
        focusEl: document.getElementById("mmhp-submit-isActive"),
      };

    return { message: "", focusEl: null };
  }

  function announceIncompleteForm(statusEl, message, focusEl) {
    if (statusEl) {
      statusEl.textContent =
        "Please fill in all required fields before sending. " + message;
      statusEl.hidden = false;
    }
    var main = document.getElementById("submission-main");
    var form = document.getElementById("mmhp-event-submit-form");
    try {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search + "#mmhp-event-submit-form"
        );
      } else {
        window.location.hash = "mmhp-event-submit-form";
      }
    } catch (ignore) {}

    window.setTimeout(function () {
      if (main && typeof main.focus === "function") {
        try {
          main.focus({ preventScroll: true });
        } catch (e) {
          try {
            main.focus();
          } catch (e2) {}
        }
      }
      if (focusEl && typeof focusEl.focus === "function") {
        try {
          focusEl.focus({ preventScroll: true });
        } catch (e) {
          try {
            focusEl.focus();
          } catch (e2) {}
        }
      }
      var scrollEl = focusEl || form || main;
      if (scrollEl && scrollEl.scrollIntoView) {
        scrollEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
  }

  function eventSummaryPlainText(ev) {
    if (!ev || typeof ev !== "object") return "";
    var lines = [
      "Event submission",
      "",
      "Id: " + (ev.id || ""),
      "Reference: " + (ev.featureId || ev.id || ""),
      "Listing title: " + (ev.eventName || ""),
      "Date: " + (ev.date || ""),
      "Start: " + (ev.startTime || ""),
      "End: " + (ev.endTime != null ? String(ev.endTime) : ""),
      "Location: " + (ev.location || ""),
      "Card line 1: " + (ev.cardLine1 || ""),
      "Card line 2: " + (ev.cardLine2 || ""),
      "Card line 3: " + (ev.cardLine3 || ""),
      "Promotional copy: " + (ev.adCopy || ""),
      "Active: " + (ev.isActive === false ? "false" : "true"),
      "Image filename hint: " + (ev.imagePath || "(none)"),
      "Requester email: " + (ev.requesterEmail || ""),
    ];
    return lines.join("\r\n");
  }

  function submitEventText(ev, statusEl) {
    var formData = new FormData();
    formData.append("_subject", FORMSPREE_EMAIL_SUBJECT);
    formData.append("request_type", "One-time event submission");
    formData.append("subject", "Submit event: " + (ev.eventName || ev.id || "new event"));
    formData.append("message", eventSummaryPlainText(ev));
    formData.append("source_page", "Submit Event");
    formData.append("email", ev.requesterEmail);
    formData.append("_replyto", ev.requesterEmail);

    if (statusEl) {
      statusEl.hidden = false;
      setStatusState(statusEl, "sending");
      statusEl.textContent = "Sending your event submission...";
      focusStatus(statusEl);
    }

    return fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    }).then(function (response) {
      if (!response.ok) throw new Error("Formspree request failed");
      if (statusEl) {
        statusEl.hidden = false;
        setStatusState(statusEl, "success");
        statusEl.textContent =
          "Your request has been submitted to " +
          coordinatorEmail() +
          "." +
          confirmationCopyText(ev.requesterEmail);
        focusStatus(statusEl);
      }
    });
  }

  /** Value stored on the exported event as `location`. When "Other" is chosen, must be the custom text only (never "__other__"). */
  function readLocationFromForm() {
    var presetEl = document.getElementById("mmhp-submit-location-preset");
    var otherEl = document.getElementById("mmhp-submit-location-other");
    if (!presetEl) return "";
    var preset = String(presetEl.value || "").trim();
    if (preset === LOCATION_PRESET_OTHER) {
      return otherEl ? String(otherEl.value || "").trim() : "";
    }
    return preset;
  }

  function syncLocationOtherUi() {
    var presetEl = document.getElementById("mmhp-submit-location-preset");
    var wrap = document.getElementById("mmhp-submit-location-other-wrap");
    var otherEl = document.getElementById("mmhp-submit-location-other");
    var isOther = presetEl && presetEl.value === LOCATION_PRESET_OTHER;
    var presetVal = presetEl ? String(presetEl.value || "").trim() : "";
    if (wrap) {
      if (isOther) {
        wrap.removeAttribute("hidden");
      } else {
        wrap.setAttribute("hidden", "");
      }
    }
    if (otherEl) {
      otherEl.required = !!isOther;
           if (isOther) {
        otherEl.readOnly = false;
        otherEl.removeAttribute("readonly");
        otherEl.tabIndex = 0;
        otherEl.setAttribute("placeholder", LOCATION_OTHER_PLACEHOLDER);
      } else {
        otherEl.readOnly = true;
        otherEl.setAttribute("readonly", "readonly");
        otherEl.tabIndex = -1;
        otherEl.removeAttribute("placeholder");
        if (presetVal && KNOWN_HALLS[presetVal]) {
          otherEl.value = presetVal;
        } else {
          otherEl.value = "";
        }
      }
    }
  }

  function readForm(masterData) {
    var fid = String(document.getElementById("mmhp-submit-id").value || "").trim();
    var ev = {
      id: fid,
      featureId: fid,
      requesterEmail: String(document.getElementById("mmhp-submit-requester-email").value || "").trim(),
      date: String(document.getElementById("mmhp-submit-date").value || "").trim(),
      startTime: String(document.getElementById("mmhp-submit-startTime").value || "").trim(),
      endTime: normalizeEndTimeFromSelect(
        document.getElementById("mmhp-submit-endTime")
          ? document.getElementById("mmhp-submit-endTime").value
          : ""
      ),
      location: readLocationFromForm(),
      cardLine1: String(document.getElementById("mmhp-submit-cardLine1").value || "").trim(),
      cardLine2: String(document.getElementById("mmhp-submit-cardLine2").value || "").trim(),
      adCopy: String(document.getElementById("mmhp-submit-adCopy").value || "").trim(),
      isActive: document.getElementById("mmhp-submit-isActive").checked,
      isFeatured: false,
    };
    ev.cardLine3 = cardLine3FromEventDate(ev.date);
    var featImg = document.getElementById("mmhp-submit-image-feature");
    if (featImg && featImg.files && featImg.files[0]) {
      ev.imagePath = featImg.files[0].name;
    }
    finalizeFeatureRow(ev);
    return ev;
  }

  function refreshDerivedFields(masterData) {
    var ev = readForm(masterData);
    var enEl = document.getElementById("mmhp-submit-eventName");
    if (enEl) enEl.value = ev.eventName || "";
  }

  function init(masterData) {
    var errEl = document.getElementById("mmhp-event-submit-load-err");
    var form = document.getElementById("mmhp-event-submit-form");
    if (!form) return;

    var features = masterData.features || [];
    var nextId = computeNextFeatureId(features);
    var idInput = document.getElementById("mmhp-submit-id");
    var idDisplay = document.getElementById("mmhp-submit-id-display");
    if (idInput) idInput.value = nextId;
    if (idDisplay) {
      idDisplay.textContent = nextId;
      idDisplay.setAttribute("aria-label", "Event reference " + nextId);
    }

    buildEndTimeSelectOptions();
    document.getElementById("mmhp-submit-date").value = todayIsoLocal();
    document.getElementById("mmhp-submit-startTime").value = "19:00";
    var endSel = document.getElementById("mmhp-submit-endTime");
    if (endSel) endSel.value = "21:00";
    document.getElementById("mmhp-submit-isActive").checked = true;
    for (var ii = 0; ii < IMAGE_INPUT_IDS.length; ii++) {
      var imgIn = document.getElementById(IMAGE_INPUT_IDS[ii]);
      if (imgIn) imgIn.value = "";
    }

    var locPreset = document.getElementById("mmhp-submit-location-preset");
    var locOther = document.getElementById("mmhp-submit-location-other");
    if (locPreset) {
      locPreset.value = "";
      locPreset.dataset.mmhpTouched = "";
    }
    if (locOther) {
      locOther.value = "";
      locOther.dataset.mmhpTouched = "";
    }
    syncLocationOtherUi();
    var c1 = document.getElementById("mmhp-submit-cardLine1");
    c1.value = "";
    var c2 = document.getElementById("mmhp-submit-cardLine2");
    c2.value = "";
    c2.dataset.mmhpTouched = "";
    var adCopy = document.getElementById("mmhp-submit-adCopy");
    if (adCopy) adCopy.value = "";
    refreshDerivedFields(masterData);

    if (locPreset) {
      locPreset.addEventListener("change", function () {
        if (locPreset.value === LOCATION_PRESET_OTHER && locOther) {
          locOther.value = "";
        }
        syncLocationOtherUi();
        locPreset.dataset.mmhpTouched = "1";
      });
    }
    if (locOther) {
      locOther.addEventListener("input", function () {
        locOther.dataset.mmhpTouched = "1";
      });
    }
    c2.addEventListener("input", function () {
      c2.dataset.mmhpTouched = "1";
      refreshDerivedFields(masterData);
    });

    c1.addEventListener("input", function () {
      refreshDerivedFields(masterData);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("mmhp-event-submit-status");
      var ev = readForm(masterData);
      var presetForLoc = document.getElementById("mmhp-submit-location-preset");
      if (presetForLoc && presetForLoc.value === LOCATION_PRESET_OTHER) {
        var otherForLoc = document.getElementById("mmhp-submit-location-other");
        ev.location = otherForLoc ? String(otherForLoc.value || "").trim() : "";
      }
      var check = validateSubmissionForm(ev);
      if (check.message) {
        announceIncompleteForm(status, check.message, check.focusEl);
        return;
      }
      if (status) {
        status.textContent = "";
        status.hidden = true;
        setStatusState(status, "");
      }

      var confirmed = window.confirm(
        "Send this event submission to " + coordinatorEmail() + " now?\n\n" + eventSummaryPlainText(ev)
      );
      if (!confirmed) return;

      submitEventText(ev, status)
        .then(function () {
          form.reset();
          document.getElementById("mmhp-submit-date").value = todayIsoLocal();
          document.getElementById("mmhp-submit-startTime").value = "19:00";
          if (endSel) endSel.value = "21:00";
          document.getElementById("mmhp-submit-isActive").checked = true;
          if (locPreset) locPreset.dataset.mmhpTouched = "";
          if (locOther) locOther.dataset.mmhpTouched = "";
          if (c2) c2.dataset.mmhpTouched = "";
          syncLocationOtherUi();
          refreshDerivedFields(masterData);
        })
        .catch(function () {
          if (status) {
            setStatusState(status, "error");
            status.textContent =
              "Could not send the event submission automatically. Please check your connection and try again.";
            status.hidden = false;
            focusStatus(status);
          }
        });
    });

    if (errEl) errEl.hidden = true;
    form.hidden = false;
  }

  function showLoadError(msg) {
    var errEl = document.getElementById("mmhp-event-submit-load-err");
    var form = document.getElementById("mmhp-event-submit-form");
    if (errEl) {
      errEl.textContent = msg;
      errEl.hidden = false;
    }
    if (form) form.hidden = true;
  }

  function buildMasterDataLoadErrorMessage(err) {
    var parts = ["We couldn’t load the calendar information this form needs."];
    if (typeof location !== "undefined" && location.protocol === "file:") {
      parts.push(
        "This page was opened straight from a folder on your computer. Most browsers won’t load the calendar file that way."
      );
      parts.push(
        "Open this page through the live site link, or run a small local web server from the project folder and use an address like http://localhost instead of double-clicking the file."
      );
    }
    if (err && err.message) {
      parts.push("Details: " + String(err.message) + ".");
    }
    parts.push(
      "If you’re already on the published website, whoever maintains the site may need to check that the calendar data file is online and reachable."
    );
    return parts.join(" ");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var url = getMasterJsonUrl();
    var fetchUrl = url;
    if (url) {
      try {
        fetchUrl = new URL(url, window.location.href).href;
      } catch (e) {
        fetchUrl = url;
      }
    }
    if (!url) {
      showLoadError("This form can’t find its calendar data link. Whoever set up the page needs to fix that.");
      return;
    }
    fetch(fetchUrl, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(init)
      .catch(function (err) {
        showLoadError(buildMasterDataLoadErrorMessage(err));
      });
  });
})();
