/**
 * Request a new recurring activity — builds a coordinator handoff (same flow as event submit: validate images, Share or ZIP + email).
 */
(function () {
  var WEEKDAYS_ORDER = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  var REQUEST_IMAGE_INPUT_IDS = [
    "mmhp-request-image-feature",
    "mmhp-request-image-extra-1",
    "mmhp-request-image-extra-2",
    "mmhp-request-image-extra-3",
    "mmhp-request-image-extra-4",
  ];

  var MMHP_IMAGE_MAX_SINGLE_BYTES = 4 * 1024 * 1024;
  var MMHP_IMAGE_MAX_TOTAL_BYTES = 16 * 1024 * 1024;

  var LOCATION_OTHER_PLACEHOLDER = "Example: Rec hall, library, pool room…";

  var __mmhpRequestSizeModalKeyHandler = null;
  var __mmhpRequestSubmitNoticeKeyHandler = null;

  function buildMailtoHref(email, subject, body) {
    var addr = String(email || "").replace(/^mailto:/i, "").trim();
    var h = "mailto:" + addr;
    var params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("body=" + encodeURIComponent(body));
    if (params.length) h += "?" + params.join("&");
    return h;
  }

  function sortWeekdays(days) {
    var set = {};
    for (var i = 0; i < days.length; i++) set[days[i]] = true;
    var out = [];
    for (var j = 0; j < WEEKDAYS_ORDER.length; j++) {
      if (set[WEEKDAYS_ORDER[j]]) out.push(WEEKDAYS_ORDER[j]);
    }
    return out;
  }

  function parseKeywords(raw) {
    return String(raw || "")
      .split(",")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /** HTML date input value (YYYY-MM-DD) → MM-DD for mmhp-master-data.json */
  function dateInputToMmDd(yyyyMmDd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(yyyyMmDd || "").trim());
    if (!m) return null;
    return m[2] + "-" + m[3];
  }

  function fileDateStamp() {
    var n = new Date();
    return n.getFullYear() + "-" + pad2(n.getMonth() + 1) + "-" + pad2(n.getDate());
  }

  function formatBytesShort(bytes) {
    var num = Number(bytes);
    if (!isFinite(num) || num < 0) return "0 MB";
    var mb = num / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(mb >= 10 ? 0 : 1) + " MB";
    var kb = num / 1024;
    return kb.toFixed(0) + " KB";
  }

  function collectRequestImageFiles() {
    var out = [];
    for (var i = 0; i < REQUEST_IMAGE_INPUT_IDS.length; i++) {
      var el = document.getElementById(REQUEST_IMAGE_INPUT_IDS[i]);
      if (el && el.files && el.files[0]) out.push(el.files[0]);
    }
    return out;
  }

  function getRequestImageStats() {
    var items = [];
    var total = 0;
    var maxSingle = 0;
    for (var i = 0; i < REQUEST_IMAGE_INPUT_IDS.length; i++) {
      var el = document.getElementById(REQUEST_IMAGE_INPUT_IDS[i]);
      if (el && el.files && el.files[0]) {
        var f = el.files[0];
        items.push({ name: f.name, size: f.size });
        total += f.size;
        if (f.size > maxSingle) maxSingle = f.size;
      }
    }
    return { items: items, total: total, maxSingle: maxSingle };
  }

  function imageSelectionOverRecommendedLimit(stats) {
    if (!stats || !stats.items.length) return false;
    if (stats.maxSingle > MMHP_IMAGE_MAX_SINGLE_BYTES) return true;
    if (stats.total > MMHP_IMAGE_MAX_TOTAL_BYTES) return true;
    return false;
  }

  function sanitizeZipEntryName(name) {
    var n = String(name || "image").replace(/[/\\]/g, "_").replace(/\.\.+/g, ".");
    n = n.replace(/^\.+/, "") || "image";
    if (n.length > 100) n = n.slice(-100);
    return n;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function closeRequestSizeModal() {
    var modal = document.getElementById("mmhp-request-size-modal");
    var backdrop = document.getElementById("mmhp-request-size-modal-backdrop");
    var btnOk = document.getElementById("mmhp-request-size-modal-ok");
    var btnContinue = document.getElementById("mmhp-request-size-modal-continue");
    var btnBack = document.getElementById("mmhp-request-size-modal-back");
    if (backdrop) backdrop.onclick = null;
    if (btnOk) btnOk.onclick = null;
    if (btnContinue) btnContinue.onclick = null;
    if (btnBack) btnBack.onclick = null;
    if (__mmhpRequestSizeModalKeyHandler) {
      document.removeEventListener("keydown", __mmhpRequestSizeModalKeyHandler);
      __mmhpRequestSizeModalKeyHandler = null;
    }
    if (modal) modal.hidden = true;
  }

  function populateRequestSizeModalBody(stats, forSubmitStep) {
    var body = document.getElementById("mmhp-request-size-modal-body");
    if (!body) return;
    while (body.firstChild) body.removeChild(body.firstChild);

    var p0 = document.createElement("p");
    p0.textContent =
      "Many email apps struggle with very large attachments. Very large photos sometimes bounce back or never leave your outbox.";
    body.appendChild(p0);

    var p1 = document.createElement("p");
    p1.textContent =
      "We suggest keeping each photo under about " +
      formatBytesShort(MMHP_IMAGE_MAX_SINGLE_BYTES) +
      " and all of them together under about " +
      formatBytesShort(MMHP_IMAGE_MAX_TOTAL_BYTES) +
      "—that’s usually a safe, friendly size.";
    body.appendChild(p1);

    if (stats.items.length) {
      var p2 = document.createElement("p");
      p2.textContent = "Here’s what you picked:";
      body.appendChild(p2);
      var ul = document.createElement("ul");
      for (var i = 0; i < stats.items.length; i++) {
        var li = document.createElement("li");
        li.textContent = stats.items[i].name + " — " + formatBytesShort(stats.items[i].size);
        ul.appendChild(li);
      }
      body.appendChild(ul);
      var p3 = document.createElement("p");
      p3.textContent =
        "All together: " +
        formatBytesShort(stats.total) +
        " (largest single photo: " +
        formatBytesShort(stats.maxSingle) +
        ").";
      body.appendChild(p3);
    }

    var pEnd = document.createElement("p");
    pEnd.textContent = forSubmitStep
      ? "You can swap in smaller photos, or continue anyway—just know a very large message might not deliver."
      : "If you’d like an easier send, try smaller or more compressed photos.";
    body.appendChild(pEnd);
  }

  function showRequestSizeModalAfterFilePick() {
    var stats = getRequestImageStats();
    if (!imageSelectionOverRecommendedLimit(stats)) return;

    var modal = document.getElementById("mmhp-request-size-modal");
    var btnOk = document.getElementById("mmhp-request-size-modal-ok");
    var btnContinue = document.getElementById("mmhp-request-size-modal-continue");
    var btnBack = document.getElementById("mmhp-request-size-modal-back");
    var backdrop = document.getElementById("mmhp-request-size-modal-backdrop");
    if (!modal || !btnOk || !btnContinue || !btnBack || !backdrop) return;

    if (__mmhpRequestSizeModalKeyHandler) {
      document.removeEventListener("keydown", __mmhpRequestSizeModalKeyHandler);
      __mmhpRequestSizeModalKeyHandler = null;
    }
    backdrop.onclick = null;
    btnOk.onclick = null;
    btnContinue.onclick = null;
    btnBack.onclick = null;

    populateRequestSizeModalBody(stats, false);
    btnOk.hidden = false;
    btnContinue.hidden = true;
    btnBack.hidden = true;
    modal.hidden = false;

    __mmhpRequestSizeModalKeyHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRequestSizeModal();
      }
    };
    document.addEventListener("keydown", __mmhpRequestSizeModalKeyHandler);

    btnOk.onclick = function () {
      closeRequestSizeModal();
    };
    backdrop.onclick = function (ev) {
      if (ev.target === backdrop) closeRequestSizeModal();
    };

    try {
      btnOk.focus();
    } catch (f) {}
  }

  function showRequestSizeModalBeforeSubmit(onContinue) {
    var stats = getRequestImageStats();
    var modal = document.getElementById("mmhp-request-size-modal");
    var btnOk = document.getElementById("mmhp-request-size-modal-ok");
    var btnContinue = document.getElementById("mmhp-request-size-modal-continue");
    var btnBack = document.getElementById("mmhp-request-size-modal-back");
    var backdrop = document.getElementById("mmhp-request-size-modal-backdrop");
    if (!modal || !btnOk || !btnContinue || !btnBack || !backdrop) {
      if (typeof onContinue === "function") onContinue();
      return;
    }

    if (__mmhpRequestSizeModalKeyHandler) {
      document.removeEventListener("keydown", __mmhpRequestSizeModalKeyHandler);
      __mmhpRequestSizeModalKeyHandler = null;
    }
    backdrop.onclick = null;
    btnOk.onclick = null;
    btnContinue.onclick = null;
    btnBack.onclick = null;

    populateRequestSizeModalBody(stats, true);
    btnOk.hidden = true;
    btnContinue.hidden = false;
    btnBack.hidden = false;
    modal.hidden = false;

    __mmhpRequestSizeModalKeyHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRequestSizeModal();
      }
    };
    document.addEventListener("keydown", __mmhpRequestSizeModalKeyHandler);

    btnContinue.onclick = function () {
      closeRequestSizeModal();
      if (typeof onContinue === "function") onContinue();
    };
    btnBack.onclick = function () {
      closeRequestSizeModal();
      var feat = document.getElementById("mmhp-request-image-feature");
      if (feat && typeof feat.focus === "function") {
        try {
          feat.focus({ preventScroll: true });
        } catch (f) {
          try {
            feat.focus();
          } catch (f2) {}
        }
      }
    };
    backdrop.onclick = function (ev) {
      if (ev.target === backdrop) btnBack.onclick();
    };

    try {
      btnBack.focus();
    } catch (f2) {}
  }

  function closeSubmitNoticeModal() {
    var modal = document.getElementById("mmhp-request-submit-notice-modal");
    var backdrop = document.getElementById("mmhp-request-submit-notice-modal-backdrop");
    var btnCancel = document.getElementById("mmhp-request-submit-notice-cancel");
    var btnContinue = document.getElementById("mmhp-request-submit-notice-continue");
    if (backdrop) backdrop.onclick = null;
    if (btnCancel) btnCancel.onclick = null;
    if (btnContinue) btnContinue.onclick = null;
    if (__mmhpRequestSubmitNoticeKeyHandler) {
      document.removeEventListener("keydown", __mmhpRequestSubmitNoticeKeyHandler);
      __mmhpRequestSubmitNoticeKeyHandler = null;
    }
    if (modal) modal.hidden = true;
  }

  function showSubmitNoticeModal(onContinue) {
    var modal = document.getElementById("mmhp-request-submit-notice-modal");
    var backdrop = document.getElementById("mmhp-request-submit-notice-modal-backdrop");
    var btnCancel = document.getElementById("mmhp-request-submit-notice-cancel");
    var btnContinue = document.getElementById("mmhp-request-submit-notice-continue");
    if (!modal || !backdrop || !btnCancel || !btnContinue) {
      if (typeof onContinue === "function") onContinue();
      return;
    }

    if (__mmhpRequestSubmitNoticeKeyHandler) {
      document.removeEventListener("keydown", __mmhpRequestSubmitNoticeKeyHandler);
      __mmhpRequestSubmitNoticeKeyHandler = null;
    }
    backdrop.onclick = null;
    btnCancel.onclick = null;
    btnContinue.onclick = null;

    modal.hidden = false;

    __mmhpRequestSubmitNoticeKeyHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSubmitNoticeModal();
      }
    };
    document.addEventListener("keydown", __mmhpRequestSubmitNoticeKeyHandler);

    btnCancel.onclick = function () {
      closeSubmitNoticeModal();
    };
    btnContinue.onclick = function () {
      closeSubmitNoticeModal();
      if (typeof onContinue === "function") onContinue();
    };
    backdrop.onclick = function (ev) {
      if (ev.target === backdrop) closeSubmitNoticeModal();
    };

    try {
      btnContinue.focus();
    } catch (f) {}
  }

  function wireRequestImageSizeWarningOnChange() {
    for (var i = 0; i < REQUEST_IMAGE_INPUT_IDS.length; i++) {
      var inp = document.getElementById(REQUEST_IMAGE_INPUT_IDS[i]);
      if (!inp) continue;
      inp.addEventListener("change", function () {
        window.setTimeout(showRequestSizeModalAfterFilePick, 0);
      });
    }
  }

  function buildActivityRequestZipBlob(textBody, stamp, imageFiles) {
    if (typeof JSZip === "undefined") return Promise.reject(new Error("JSZip not loaded"));
    var zip = new JSZip();
    zip.file("mmhp-activity-request-" + stamp + ".txt", textBody);
    for (var i = 0; i < imageFiles.length; i++) {
      var f = imageFiles[i];
      var prefix = i === 0 ? "featured" : "extra-" + i;
      zip.file(prefix + "-" + sanitizeZipEntryName(f.name), f);
    }
    return zip.generateAsync({ type: "blob" });
  }

  function openMailtoActivityRequest(coordinatorEmail, subject, body, statusEl, leadNotice) {
    var notice = leadNotice != null ? String(leadNotice).trim() : "";
    var fullBody;
    if (notice) {
      fullBody =
        "Note about attachments\r\n" +
        notice +
        "\r\n\r\n————————————————————————————\r\n\r\n" +
        body;
    } else {
      fullBody = body;
    }
    window.location.href =
      "mailto:" +
      coordinatorEmail +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(fullBody);
    if (statusEl) {
      statusEl.textContent =
        "If your email opened, you’re set—if a file downloaded instead, attach it, then send.";
      statusEl.hidden = false;
    }
  }

  function deliverActivityRequest(coordinatorEmail, subject, mailtoBodyShort, fullTextForZip, statusEl, stamp) {
    return new Promise(function (resolve, reject) {
      coordinatorEmail =
        coordinatorEmail && String(coordinatorEmail).trim()
          ? String(coordinatorEmail).trim()
          : typeof mmhpGetCoordinatorEmail === "function"
            ? mmhpGetCoordinatorEmail()
            : "";

      var shareHint =
        "Send to: " + coordinatorEmail + " (add them in To: if your app left it blank).";
      var txtBlob = new Blob([fullTextForZip], { type: "text/plain;charset=utf-8" });
      var txtFile = new File([txtBlob], "mmhp-activity-request-" + stamp + ".txt", { type: "text/plain;charset=utf-8" });
      var imageFiles = collectRequestImageFiles();
      var allFiles = [txtFile].concat(imageFiles);

      function afterDownloadMailto(footer) {
        window.setTimeout(function () {
          openMailtoActivityRequest(coordinatorEmail, subject, mailtoBodyShort, statusEl, footer);
          resolve();
        }, 400);
      }

      var canShareAll = false;
      if (navigator.share && allFiles.length && navigator.canShare) {
        try {
          canShareAll = navigator.canShare({ files: allFiles });
        } catch (err1) {
          canShareAll = false;
        }
      }

      if (canShareAll) {
        navigator
          .share({
            files: allFiles,
            title: subject,
            text: shareHint,
          })
          .then(function () {
            if (statusEl) {
              statusEl.textContent =
                "Shared your request. If the To: line is blank, add " + coordinatorEmail + ".";
              statusEl.hidden = false;
            }
            resolve();
          })
          .catch(function () {
            tryZipOrFallback();
          });
        return;
      }

      tryZipOrFallback();

      function tryZipOrFallback() {
        buildActivityRequestZipBlob(fullTextForZip, stamp, imageFiles)
          .then(function (zipBlob) {
            var zipName = "mmhp-activity-request-" + stamp + ".zip";
            var zipFile = new File([zipBlob], zipName, { type: "application/zip" });
            var canShareZip = false;
            if (navigator.share && navigator.canShare) {
              try {
                canShareZip = navigator.canShare({ files: [zipFile] });
              } catch (err2) {
                canShareZip = false;
              }
            }
            if (canShareZip) {
              navigator
                .share({
                  files: [zipFile],
                  title: subject,
                  text: shareHint,
                })
                .then(function () {
                  if (statusEl) {
                    statusEl.textContent =
                      "Shared your request. If the To: line is blank, add " + coordinatorEmail + ".";
                    statusEl.hidden = false;
                  }
                  resolve();
                })
                .catch(function () {
                  downloadBlob(zipBlob, zipName);
                  afterDownloadMailto(
                    "A zip file downloaded (" +
                      zipName +
                      "). Please attach it to your email—it has your request and photos together.\r\n"
                  );
                });
            } else {
              downloadBlob(zipBlob, zipName);
              afterDownloadMailto(
                "A zip file downloaded (" +
                  zipName +
                  "). Please attach it to your email—it has your request and photos together.\r\n"
              );
            }
          })
          .catch(function () {
            downloadBlob(
              new Blob([fullTextForZip], { type: "text/plain;charset=utf-8" }),
              "mmhp-activity-request-" + stamp + ".txt"
            );
            afterDownloadMailto(
              "A small text file downloaded—attach it, along with your photos if you have any, to the email.\r\n"
            );
          });
      }
    });
  }

  function init() {
    var form = document.getElementById("mmhp-request-activity-form");
    if (!form) return;

    var locPreset = document.getElementById("mmhp-request-location-preset");
    var locOtherWrap = document.getElementById("mmhp-request-location-other-wrap");
    var locOther = document.getElementById("mmhp-request-location-other");
    var statusEl = document.getElementById("mmhp-request-activity-status");

    var callmeCb = document.getElementById("mmhp-request-callme");
    var callmeWrap = document.getElementById("mmhp-request-callme-wrap");
    var callmeName = document.getElementById("mmhp-request-callme-name");
    var callmePhone = document.getElementById("mmhp-request-callme-phone");
    var callmeSend = document.getElementById("mmhp-request-callme-send");
    var CALLME_SUBJECT = "Please call me";

    function syncCallMe() {
      var on = !!(callmeCb && callmeCb.checked);
      if (callmeWrap) {
        callmeWrap.hidden = !on;
      }
      if (callmeCb) {
        callmeCb.setAttribute("aria-expanded", on ? "true" : "false");
      }
      if (!on) {
        if (callmeName) callmeName.value = "";
        if (callmePhone) callmePhone.value = "";
      }
    }
    if (callmeCb) {
      callmeCb.addEventListener("change", function () {
        syncCallMe();
        if (statusEl && callmeCb.checked) {
          statusEl.textContent = "";
          statusEl.hidden = true;
        }
      });
      syncCallMe();
    }
    if (callmeSend) {
      callmeSend.addEventListener("click", function () {
        if (statusEl) {
          statusEl.textContent = "";
          statusEl.hidden = true;
        }
        var nm = String(callmeName ? callmeName.value : "").trim();
        var ph = String(callmePhone ? callmePhone.value : "").trim();
        if (!nm) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent =
              "Please add your name—both name and phone are required if you want the coordinator to call you.";
          }
          try {
            if (callmeName) callmeName.focus({ preventScroll: true });
          } catch (f) {
            try {
              if (callmeName) callmeName.focus();
            } catch (f2) {}
          }
          return;
        }
        if (!ph) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent =
              "Please add your phone number—both name and phone are required if you want the coordinator to call you.";
          }
          try {
            if (callmePhone) callmePhone.focus({ preventScroll: true });
          } catch (f3) {
            try {
              if (callmePhone) callmePhone.focus();
            } catch (f4) {}
          }
          return;
        }
        var email =
          typeof mmhpGetCoordinatorEmail === "function" ? mmhpGetCoordinatorEmail() : "";
        if (!email) {
          window.alert(
            "We can’t find the coordinator’s email for this site. Ask whoever looks after the calendar to add it in the site settings."
          );
          return;
        }
        var body =
          "I'm having trouble with the “request an activity” form and would like a phone call instead.\r\n\r\n" +
          "Name: " +
          nm +
          "\r\n" +
          "Phone: " +
          ph +
          "\r\n";
        window.location.href = buildMailtoHref(email, CALLME_SUBJECT, body);
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent =
            "If your email opened, add the coordinator in “To:” if needed, then send. If nothing opened, check that an email app is set up on this device.";
        }
      });
    }

    if (locPreset && locOtherWrap && locOther) {
      function syncLoc() {
        var v = locPreset.value;
        if (v === "__other__") {
          locOtherWrap.hidden = false;
          locOther.removeAttribute("readonly");
          locOther.removeAttribute("tabindex");
          locOther.required = true;
          locOther.setAttribute("placeholder", LOCATION_OTHER_PLACEHOLDER);
        } else {
          locOtherWrap.hidden = true;
          locOther.setAttribute("readonly", "readonly");
          locOther.setAttribute("tabindex", "-1");
          locOther.required = false;
          locOther.value = "";
          locOther.removeAttribute("placeholder");
        }
      }
      locPreset.addEventListener("change", syncLoc);
      syncLoc();
    }

    var seasonalCb = document.getElementById("mmhp-request-is-seasonal");
    var seasonWrap = document.getElementById("mmhp-request-season-dates-wrap");
    var activeFromEl = document.getElementById("mmhp-request-active-from");
    var activeToEl = document.getElementById("mmhp-request-active-to");

    function syncSeasonal() {
      var on = !!(seasonalCb && seasonalCb.checked);
      if (seasonWrap) {
        seasonWrap.hidden = !on;
      }
      if (activeFromEl) {
        activeFromEl.required = on;
        if (!on) activeFromEl.value = "";
      }
      if (activeToEl) {
        activeToEl.required = on;
        if (!on) activeToEl.value = "";
      }
      if (seasonalCb) {
        seasonalCb.setAttribute("aria-expanded", on ? "true" : "false");
      }
    }
    if (seasonalCb) {
      seasonalCb.addEventListener("change", syncSeasonal);
      syncSeasonal();
    }

    wireRequestImageSizeWarningOnChange();

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.hidden = true;
      }

      var name = String(document.getElementById("mmhp-request-activityName").value || "").trim();
      var description = String(document.getElementById("mmhp-request-description").value || "").trim();
      var rtEl = document.getElementById("mmhp-request-recurrenceType");
      var recurrenceType =
        rtEl && rtEl.value ? String(rtEl.value).trim() : "Recurring";

      var location = "";
      if (locPreset) {
        if (locPreset.value === "__other__") {
          location = String(locOther ? locOther.value : "").trim();
        } else {
          location = String(locPreset.value || "").trim();
        }
      }

      var weekdays = [];
      var boxes = form.querySelectorAll('input[name="mmhp-request-weekday"]:checked');
      for (var i = 0; i < boxes.length; i++) {
        weekdays.push(boxes[i].value);
      }
      weekdays = sortWeekdays(weekdays);

      var startTimeEl = document.getElementById("mmhp-request-startTime");
      var startTime = startTimeEl ? String(startTimeEl.value || "").trim() : "";
      if (startTimeEl && startTimeEl.type === "time" && startTime.length >= 5) {
        startTime = startTime.slice(0, 5);
      }

      var featImg = document.getElementById("mmhp-request-image-feature");

      if (!name) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Please add a name for the activity.";
        }
        return;
      }
      if (!description) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Please write a short description of what happens at the activity.";
        }
        return;
      }
      if (!location) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent =
            locPreset && locPreset.value === "__other__"
              ? "Please say where you meet—in the line under Other."
              : "Please pick where you meet, or choose Other and describe it.";
        }
        return;
      }
      if (weekdays.length === 0) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Please tap at least one day the group usually meets.";
        }
        return;
      }
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Please choose a start time with the clock box above.";
        }
        return;
      }

      var isSeasonal = !!(seasonalCb && seasonalCb.checked);
      var activeFromMmdd;
      var activeToMmdd;
      if (isSeasonal) {
        var fromVal = activeFromEl ? String(activeFromEl.value || "").trim() : "";
        var toVal = activeToEl ? String(activeToEl.value || "").trim() : "";
        activeFromMmdd = dateInputToMmDd(fromVal);
        activeToMmdd = dateInputToMmDd(toVal);
        if (!activeFromMmdd || !activeToMmdd) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent =
              "Please pick both a season start and season end, or uncheck the box above if the activity runs year-round.";
          }
          return;
        }
        if (activeFromMmdd === activeToMmdd) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = "Season start and season end need to be two different calendar days.";
          }
          return;
        }
      } else {
        activeFromMmdd = "01-01";
        activeToMmdd = "12-31";
      }

      function finishSubmitAfterNotice() {
        var keywords = parseKeywords(document.getElementById("mmhp-request-keywords").value);
        var imagePath =
          featImg && featImg.files && featImg.files[0] ? featImg.files[0].name : null;

        var adCopyOpt = String(document.getElementById("mmhp-request-adCopy").value || "").trim();
        var adCopyFinal = adCopyOpt || description;

        var endTimeEl = document.getElementById("mmhp-request-endTime");
        var endTime = endTimeEl ? String(endTimeEl.value || "").trim() : "";
        if (endTimeEl && endTimeEl.type === "time" && endTime.length >= 5) {
          endTime = endTime.slice(0, 5);
        }

        var recurrenceDetails = {
          weekdays: weekdays,
          startTime: startTime,
        };
        if (endTime && /^([01]?\d|2[0-3]):[0-5]\d$/.test(endTime)) {
          recurrenceDetails.endTime = endTime;
        }

        var activityPayload = {
          activityName: name,
          description: description,
          adCopy: adCopyFinal,
          location: location,
          recurrenceType: recurrenceType,
          recurrenceDetails: recurrenceDetails,
          isActive: true,
          isSeasonal: isSeasonal,
          activeFrom: activeFromMmdd,
          activeTo: activeToMmdd,
          keywords: keywords,
          imagePath: imagePath,
        };

        var proposerName = String(document.getElementById("mmhp-request-proposer-name").value || "").trim();
        var proposerPhone = String(document.getElementById("mmhp-request-proposer-phone").value || "").trim();
        var proposerEmail = String(document.getElementById("mmhp-request-proposer-email").value || "").trim();
        var willingPocEl = document.getElementById("mmhp-request-willing-poc");
        var willingPointOfContact = !!(willingPocEl && willingPocEl.checked);

        var jsonBlock = JSON.stringify(activityPayload, null, 2);
        var fullTextBody =
          "Request to add a recurring activity to the park calendar.\r\n\r\n" +
          "The coordinator still wires in the activity’s id numbers and who to list as contacts before it is live.\r\n\r\n" +
          "--- Activity details (structured for the site data file; mmhp-master-data.json activities list) ---\r\n" +
          jsonBlock +
          "\r\n\r\n" +
          "--- Who sent this (for the coordinator; not part of the activity entry) ---\r\n" +
          "Name: " +
          (proposerName || "—") +
          "\r\n" +
          "Phone: " +
          (proposerPhone || "—") +
          "\r\n" +
          "Email: " +
          (proposerEmail || "—") +
          "\r\n" +
          "Willing to be point of contact for neighbors: " +
          (willingPointOfContact ? "Yes" : "No") +
          "\r\n";

        var mailtoBodyShort =
          "The attached file or zip has everything the coordinator needs (your wording, optional photos, and a plain summary).\r\n\r\n" +
          "Activity name: " +
          name +
          "\r\n" +
          "Main photo file name: " +
          (imagePath || "none sent") +
          "\r\n" +
          "Willing to be a contact for neighbors: " +
          (willingPointOfContact ? "Yes" : "No") +
          "\r\n\r\n" +
          "If something downloaded, attach it before sending. The text file lists full details for the calendar keeper.\r\n";

        var email =
          typeof mmhpGetCoordinatorEmail === "function" ? mmhpGetCoordinatorEmail() : "";
        if (!email) {
          window.alert(
            "We can’t find the coordinator’s email for this site. Ask whoever looks after the calendar to add it in the site settings."
          );
          return;
        }

        var subject = "Request new recurring activity: " + name;
        var stamp = fileDateStamp();

        function runDeliver() {
          deliverActivityRequest(email, subject, mailtoBodyShort, fullTextBody, statusEl, stamp).catch(function () {
            if (statusEl) {
              statusEl.textContent =
                "We couldn’t finish sharing or downloading. Check your connection, allow downloads if asked, or try another browser.";
              statusEl.hidden = false;
            }
          });
        }

        var stats = getRequestImageStats();
        if (imageSelectionOverRecommendedLimit(stats)) {
          showRequestSizeModalBeforeSubmit(runDeliver);
        } else {
          runDeliver();
        }
      }

      showSubmitNoticeModal(finishSubmitAfterNotice);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
