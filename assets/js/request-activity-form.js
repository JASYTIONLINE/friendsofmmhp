/**
 * Request a new recurring activity — validates the request and sends the text to Formspree.
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

  var FORMSPREE_ENDPOINT = "https://formspree.io/f/xnjkjbbe";
  var FORMSPREE_EMAIL_SUBJECT = "MMHP Events Request.";

  var LOCATION_OTHER_PLACEHOLDER = "Example: Hall B, library, pool room…";

  var __mmhpRequestSubmitNoticeKeyHandler = null;

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
    return email
      ? " If email confirmation is enabled for this form, a confirmation copy will be sent to " + email + "."
      : "";
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

  function submitActivityRequestText(subject, message, statusEl, senderName, senderEmail) {
    var formData = new FormData();
    formData.append("_subject", FORMSPREE_EMAIL_SUBJECT);
    formData.append("request_type", "Recurring activity request");
    formData.append("subject", subject || "Request activity");
    formData.append("message", message || "");
    formData.append("source_page", "Request Activity");
    if (senderName) formData.append("name", senderName);
    if (senderEmail) {
      formData.append("email", senderEmail);
      formData.append("_replyto", senderEmail);
    }

    if (statusEl) {
      statusEl.hidden = false;
      setStatusState(statusEl, "sending");
      statusEl.textContent = "Sending your request...";
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
          confirmationCopyText(senderEmail);
        focusStatus(statusEl);
      }
    });
  }

  function announceMissingRequired(statusEl, message, focusEl) {
    if (statusEl) {
      statusEl.hidden = false;
      setStatusState(statusEl, "error");
      statusEl.textContent =
        "Please fill in all required fields before sending. " + message;
    }
    window.setTimeout(function () {
      if (focusEl && typeof focusEl.focus === "function") {
        try {
          focusEl.focus({ preventScroll: true });
        } catch (e) {
          try {
            focusEl.focus();
          } catch (e2) {}
        }
      }
      if (focusEl && focusEl.scrollIntoView) {
        focusEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 0);
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
          setStatusState(statusEl, "");
        }
        var nm = String(callmeName ? callmeName.value : "").trim();
        var ph = String(callmePhone ? callmePhone.value : "").trim();
        if (!nm) {
          announceMissingRequired(
            statusEl,
            "Please add your name; both name and phone are required if you want the coordinator to call you.",
            callmeName
          );
          return;
        }
        if (!ph) {
          announceMissingRequired(
            statusEl,
            "Please add your phone number; both name and phone are required if you want the coordinator to call you.",
            callmePhone
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
        submitActivityRequestText(CALLME_SUBJECT, body, statusEl, nm, "").catch(function () {
          if (statusEl) {
            setStatusState(statusEl, "error");
            statusEl.hidden = false;
            statusEl.textContent =
              "We could not send the call request automatically. Check your connection and try again.";
            focusStatus(statusEl);
          }
        });
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

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.hidden = true;
        setStatusState(statusEl, "");
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
      var proposerName = String(document.getElementById("mmhp-request-proposer-name").value || "").trim();
      var proposerPhone = String(document.getElementById("mmhp-request-proposer-phone").value || "").trim();
      var proposerEmail = String(document.getElementById("mmhp-request-proposer-email").value || "").trim();

      if (!name) {
        announceMissingRequired(statusEl, "Please add a name for the activity.", document.getElementById("mmhp-request-activityName"));
        return;
      }
      if (!description) {
        announceMissingRequired(statusEl, "Please write a short description of what happens at the activity.", document.getElementById("mmhp-request-description"));
        return;
      }
      if (!location) {
        announceMissingRequired(
          statusEl,
          locPreset && locPreset.value === "__other__"
            ? "Please say where you meet in the line under Other."
            : "Please pick where you meet, or choose Other and describe it.",
          locPreset && locPreset.value === "__other__" ? locOther : locPreset
        );
        return;
      }
      if (weekdays.length === 0) {
        announceMissingRequired(statusEl, "Please tap at least one day the group usually meets.", form.querySelector('input[name="mmhp-request-weekday"]'));
        return;
      }
      if (!/^([01]?\d|2[0-3]):[0-5]\d$/.test(startTime)) {
        announceMissingRequired(statusEl, "Please choose a start time with the clock box above.", startTimeEl);
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
          announceMissingRequired(
            statusEl,
            "Please pick both a season start and season end, or uncheck the box above if the activity runs year-round.",
            !activeFromMmdd ? activeFromEl : activeToEl
          );
          return;
        }
        if (activeFromMmdd === activeToMmdd) {
          announceMissingRequired(statusEl, "Season start and season end need to be two different calendar days.", activeToEl);
          return;
        }
      } else {
        activeFromMmdd = "01-01";
        activeToMmdd = "12-31";
      }

      if (!chairSel || residentsLoadFailed || !residentsList.length) {
        announceMissingRequired(
          statusEl,
          "The resident list did not load. Refresh the page and try again, or contact the coordinator.",
          chairSel
        );
        return;
      }
      var chairpersonId = String(chairSel.value || "").trim();
      if (!chairpersonId) {
        announceMissingRequired(statusEl, "Please choose who will chair this activity.", chairSel);
        return;
      }
      if (!proposerEmail) {
        announceMissingRequired(statusEl, "Please add your email address.", document.getElementById("mmhp-request-proposer-email"));
        return;
      }
      if (!isValidEmail(proposerEmail)) {
        announceMissingRequired(statusEl, "Please enter a valid email address.", document.getElementById("mmhp-request-proposer-email"));
        return;
      }
      var contactResidentId;
      if (contactSameCb && contactSameCb.checked) {
        contactResidentId = chairpersonId;
      } else {
        contactResidentId = String(contactSel ? contactSel.value : "").trim();
        if (!contactResidentId) {
          announceMissingRequired(
            statusEl,
            "Please choose a neighbor point of contact, or check \"same as chair\" above.",
            contactSel
          );
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

        var subject = "Request new recurring activity: " + name;
        submitActivityRequestText(subject, fullTextBody, statusEl, proposerName, proposerEmail).catch(function () {
          if (statusEl) {
            setStatusState(statusEl, "error");
            statusEl.textContent =
              "We could not send the request automatically. Check your connection and try again.";
            statusEl.hidden = false;
            focusStatus(statusEl);
          }
        });
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
