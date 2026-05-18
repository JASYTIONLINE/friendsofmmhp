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

  var LOCATION_OTHER_PLACEHOLDER = "Example: Hall B, library, pool room…";

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

  function getMasterJsonUrl() {
    var u = document.body && document.body.getAttribute("data-mmhp-master-json");
    u = u ? String(u).trim() : "";
    if (u) return u;
    var aside = document.querySelector("aside.site-sidebar-left[data-mmhp-master-json]");
    return aside ? String(aside.getAttribute("data-mmhp-master-json") || "").trim() : "";
  }

  var VACANT_RESIDENT_ID = "re0000";

  function filterSortResidents(raw) {
    var list = Array.isArray(raw) ? raw.slice() : [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (!r || typeof r !== "object") continue;
      var id = String(r.id || "").trim();
      if (!id || id === VACANT_RESIDENT_ID) continue;
      var name = String(r.name || "").trim();
      if (!name) name = id;
      out.push({ id: id, name: name });
    }
    out.sort(function (a, b) {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    return out;
  }

  function fillResidentSelect(selectEl, residents, placeholderText) {
    if (!selectEl) return;
    while (selectEl.firstChild) selectEl.removeChild(selectEl.firstChild);
    var ph = document.createElement("option");
    ph.value = "";
    ph.textContent = placeholderText || "Choose a resident…";
    selectEl.appendChild(ph);
    for (var i = 0; i < residents.length; i++) {
      var r = residents[i];
      var opt = document.createElement("option");
      opt.value = r.id;
      opt.textContent = r.name;
      selectEl.appendChild(opt);
    }
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
    var t = textBody != null ? String(textBody) : "";
    if (t.length) {
      zip.file("mmhp-activity-request-" + stamp + ".txt", t);
    }
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
        body +
        "\r\n\r\n————————————————————————————\r\n\r\n" +
        notice;
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
      statusEl.textContent = notice
        ? "If your email opened, attach the downloaded zip (full request + photos), then send."
        : "If your email opened, send when ready—the full activity request is in the message.";
      statusEl.hidden = false;
    }
  }

  function deliverActivityRequest(coordinatorEmail, subject, mailtoBodyFull, statusEl, stamp) {
    return new Promise(function (resolve, reject) {
      coordinatorEmail =
        coordinatorEmail && String(coordinatorEmail).trim()
          ? String(coordinatorEmail).trim()
          : typeof mmhpGetCoordinatorEmail === "function"
            ? mmhpGetCoordinatorEmail()
            : "";

      var shareHint =
        "Send to: " + coordinatorEmail + " (add them in To: if your app left it blank).";
      var imageFiles = collectRequestImageFiles();
      var txtBlob = new Blob([mailtoBodyFull], { type: "text/plain;charset=utf-8" });
      var txtFile = new File([txtBlob], "mmhp-activity-request-" + stamp + ".txt", {
        type: "text/plain;charset=utf-8",
      });

      function afterDownloadMailto(footer) {
        window.setTimeout(function () {
          openMailtoActivityRequest(coordinatorEmail, subject, mailtoBodyFull, statusEl, footer);
          resolve();
        }, 400);
      }

      if (imageFiles.length === 0) {
        window.setTimeout(function () {
          openMailtoActivityRequest(coordinatorEmail, subject, mailtoBodyFull, statusEl, null);
        }, 0);
        window.setTimeout(function () {
          downloadBlob(txtBlob, "mmhp-activity-request-" + stamp + ".txt");
          if (statusEl) {
            statusEl.textContent =
              "If your email opened, send when ready. A .txt copy of the full request also downloaded—attach it if the message looks shortened or empty.";
            statusEl.hidden = false;
          }
          resolve();
        }, 400);
        return;
      }

      var allFiles = [txtFile].concat(imageFiles);

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
            text: mailtoBodyFull + "\r\n\r\n—\r\n" + shareHint,
          })
          .then(function () {
            if (statusEl) {
              statusEl.textContent =
                "Shared your request file and photos. In your mail app, add " +
                coordinatorEmail +
                " to To: if needed, and confirm the full text appeared—or attach the shared .txt as a backup.";
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
        buildActivityRequestZipBlob(mailtoBodyFull, stamp, imageFiles)
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
            var zipFooter =
              "A zip downloaded (" +
              zipName +
              ") with the full request as a .txt inside plus your photos. Attach it as a backup if you like—the same text is in the email above.\r\n";
            if (canShareZip) {
              navigator
                .share({
                  files: [zipFile],
                  title: subject,
                  text: mailtoBodyFull + "\r\n\r\n—\r\n" + shareHint,
                })
                .then(function () {
                  if (statusEl) {
                    statusEl.textContent =
                      "Shared the zip (request + photos). Add " +
                      coordinatorEmail +
                      " to To: if needed. Attach the zip if the message body is incomplete.";
                    statusEl.hidden = false;
                  }
                  resolve();
                })
                .catch(function () {
                  downloadBlob(zipBlob, zipName);
                  afterDownloadMailto(zipFooter);
                });
            } else {
              downloadBlob(zipBlob, zipName);
              afterDownloadMailto(zipFooter);
            }
          })
          .catch(function () {
            downloadBlob(
              new Blob([mailtoBodyFull], { type: "text/plain;charset=utf-8" }),
              "mmhp-activity-request-" + stamp + ".txt"
            );
            afterDownloadMailto(
              "Could not build a photo zip. A text file with your full request downloaded—please add your photos manually to the email.\r\n"
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

    var chairSel = document.getElementById("mmhp-request-chairperson-id");
    var contactSameCb = document.getElementById("mmhp-request-contact-same-as-chair");
    var contactWrap = document.getElementById("mmhp-request-contact-resident-wrap");
    var contactSel = document.getElementById("mmhp-request-contact-resident-id");
    var residentsList = [];
    var residentsLoadFailed = false;

    function syncContactResidentUi() {
      if (!contactSameCb || !contactWrap || !contactSel || !chairSel) return;
      var same = !!contactSameCb.checked;
      contactWrap.hidden = same;
      if (same) {
        contactSel.disabled = true;
        contactSel.required = false;
        contactSel.value = "";
      } else {
        contactSel.disabled = residentsLoadFailed || !residentsList.length;
        contactSel.required = true;
      }
    }

    if (chairSel && contactSel && contactSameCb) {
      contactSameCb.addEventListener("change", function () {
        syncContactResidentUi();
        if (!contactSameCb.checked && chairSel.value && !contactSel.value) {
          contactSel.value = chairSel.value;
        }
      });
      chairSel.addEventListener("change", function () {
        if (!contactSameCb.checked && !contactSel.value && chairSel.value) {
          contactSel.value = chairSel.value;
        }
      });
    }

    var jsonUrl = getMasterJsonUrl();
    if (!jsonUrl) {
      residentsLoadFailed = true;
      if (chairSel) {
        fillResidentSelect(chairSel, [], "Resident list unavailable (missing data path)");
        chairSel.disabled = true;
      }
      if (contactSel) {
        fillResidentSelect(contactSel, [], "—");
        contactSel.disabled = true;
      }
      if (statusEl) {
        statusEl.hidden = false;
        statusEl.textContent =
          "This page couldn’t find the resident list URL. Ask the site maintainer to set data-mmhp-master-json on the page.";
      }
    } else {
      fetch(jsonUrl)
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          return r.json();
        })
        .then(function (data) {
          residentsList = filterSortResidents(data && data.residents);
          if (!chairSel || !contactSel) return;
          fillResidentSelect(chairSel, residentsList, "Choose who will chair…");
          fillResidentSelect(contactSel, residentsList, "Choose neighbor contact…");
          chairSel.disabled = false;
          syncContactResidentUi();
        })
        .catch(function () {
          residentsLoadFailed = true;
          if (chairSel) {
            fillResidentSelect(chairSel, [], "Could not load resident list—refresh the page");
            chairSel.disabled = true;
          }
          if (contactSel) {
            fillResidentSelect(contactSel, [], "—");
            contactSel.disabled = true;
          }
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent =
              "Could not load the resident list. Check your connection, then refresh the page.";
          }
          syncContactResidentUi();
        });
    }
    syncContactResidentUi();

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

      if (!chairSel || residentsLoadFailed || !residentsList.length) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent =
            "The resident list didn’t load. Refresh the page and try again, or contact the coordinator.";
        }
        return;
      }
      var chairpersonId = String(chairSel.value || "").trim();
      if (!chairpersonId) {
        if (statusEl) {
          statusEl.hidden = false;
          statusEl.textContent = "Please choose who will chair this activity.";
        }
        try {
          chairSel.focus({ preventScroll: true });
        } catch (foc) {
          try {
            chairSel.focus();
          } catch (foc2) {}
        }
        return;
      }
      var contactResidentId;
      if (contactSameCb && contactSameCb.checked) {
        contactResidentId = chairpersonId;
      } else {
        contactResidentId = String(contactSel ? contactSel.value : "").trim();
        if (!contactResidentId) {
          if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent =
              "Please choose a neighbor point of contact, or check “same as chair” above.";
          }
          try {
            if (contactSel) contactSel.focus({ preventScroll: true });
          } catch (foc3) {
            try {
              if (contactSel) contactSel.focus();
            } catch (foc4) {}
          }
          return;
        }
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
          chairpersonId: chairpersonId,
          contactResidentId: contactResidentId,
        };

        var proposerName = String(document.getElementById("mmhp-request-proposer-name").value || "").trim();
        var proposerPhone = String(document.getElementById("mmhp-request-proposer-phone").value || "").trim();
        var proposerEmail = String(document.getElementById("mmhp-request-proposer-email").value || "").trim();

        var chairLabel = "";
        var contactLabel = "";
        if (chairSel && chairSel.selectedOptions && chairSel.selectedOptions[0]) {
          chairLabel = String(chairSel.selectedOptions[0].textContent || "").trim();
        }
        if (contactSameCb && contactSameCb.checked) {
          contactLabel = chairLabel;
        } else if (contactSel && contactSel.selectedOptions && contactSel.selectedOptions[0]) {
          contactLabel = String(contactSel.selectedOptions[0].textContent || "").trim();
        }

        var jsonBlock = JSON.stringify(activityPayload, null, 2);
        var fullTextBody =
          "Request to add a recurring activity to the park calendar.\r\n\r\n" +
          "The coordinator still assigns the activity id in the site data before it goes live; chair and neighbor contact are included in the JSON block below.\r\n\r\n" +
          "--- Activity details (structured for the site data file; mmhp-master-data.json activities list) ---\r\n" +
          jsonBlock +
          "\r\n\r\n" +
          "--- Who sent this (for the coordinator; not part of the activity entry) ---\r\n" +
          "Chair (resident): " +
          (chairLabel || chairpersonId) +
          " (" +
          chairpersonId +
          ")\r\n" +
          "Neighbor contact (resident): " +
          (contactLabel || contactResidentId) +
          " (" +
          contactResidentId +
          ")\r\n" +
          "Name: " +
          (proposerName || "—") +
          "\r\n" +
          "Phone: " +
          (proposerPhone || "—") +
          "\r\n" +
          "Email: " +
          (proposerEmail || "—") +
          "\r\n";

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
          deliverActivityRequest(email, subject, fullTextBody, statusEl, stamp).catch(function () {
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
