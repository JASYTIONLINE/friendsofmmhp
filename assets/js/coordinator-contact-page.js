/**
 * Contact Event Coordinator intake switcher.
 *
 * This page intentionally keeps the one-time event and recurring activity forms separate behind
 * one decision point so the existing form scripts can keep owning validation and submission.
 */
(function () {
  function setPanelState(panel, isActive) {
    if (!panel) return;
    panel.hidden = !isActive;
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
  }

  function checkedValue(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].checked) return nodes[i].value;
    }
    return "";
  }

  function init() {
    var choices = document.querySelectorAll('input[name="mmhp-coordinator-request-kind"]');
    var eventPanel = document.getElementById("mmhp-coordinator-event-panel");
    var activityPanel = document.getElementById("mmhp-coordinator-activity-panel");
    var statusEl = document.getElementById("mmhp-coordinator-choice-status");
    if (!choices.length || !eventPanel || !activityPanel) return;

    function sync() {
      var value = checkedValue(choices);
      var showEvent = value === "event";
      var showActivity = value === "activity";
      setPanelState(eventPanel, showEvent);
      setPanelState(activityPanel, showActivity);
      if (statusEl) {
        statusEl.hidden = !(showEvent || showActivity);
        statusEl.textContent = showEvent
          ? "One time event fields are now shown below."
          : showActivity
            ? "Recurring activity fields are now shown below."
            : "";
      }
    }

    for (var i = 0; i < choices.length; i++) {
      choices[i].addEventListener("change", sync);
    }
    try {
      var params = new URLSearchParams(window.location.search || "");
      var requestedKind = params.get("type") || params.get("kind") || "";
      for (var j = 0; j < choices.length; j++) {
        if (choices[j].value === requestedKind) {
          choices[j].checked = true;
          break;
        }
      }
    } catch (ignore) {}
    sync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
