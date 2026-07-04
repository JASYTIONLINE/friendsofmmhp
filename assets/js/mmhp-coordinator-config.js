/**
 * Single source for event coordinator contact handoffs.
 *
 * Why isolate this in one IIFE: HTML pages intentionally keep human-readable fallback links and
 * data-* hooks; this script is the one place that turns those hooks into the current contact form.
 *
 * How it works: On DOM ready, mmhpApplyCoordinatorMailto scans for anchors tagged with
 * data-mmhp-coordinator-mailto and rewrites href to contents/contact.html. Optional subject/body
 * data attributes are carried as query parameters so the contact form can prefill them.
 *
 * Maintenance: Change MMHP_COORDINATOR_EMAIL_DEFAULT only for non-form fallbacks such as submit
 * workflows. General contact links should go through the Formspree-backed contact page.
 */
(function (global) {
  var MMHP_COORDINATOR_EMAIL_DEFAULT = "eventcoordinator@friendsofmmhp.com";

  function basicEmailCheck(s) {
    s = String(s || "").trim();
    if (!s || s.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  }

  function mmhpGetCoordinatorEmailDefault() {
    return MMHP_COORDINATOR_EMAIL_DEFAULT;
  }

  function mmhpGetCoordinatorEmail() {
    var raw = document.body && document.body.getAttribute("data-mmhp-coordinator-email");
    var v = raw != null ? String(raw).trim() : "";
    if (v) return v;
    return MMHP_COORDINATOR_EMAIL_DEFAULT;
  }

  function buildMailtoHref(email, subject, body) {
    var addr = String(email || "").replace(/^mailto:/i, "").trim();
    var h = "mailto:" + addr;
    var params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("body=" + encodeURIComponent(body));
    if (params.length) h += "?" + params.join("&");
    return h;
  }

  function coordinatorContactBaseHref() {
    var path = (global.location && global.location.pathname ? global.location.pathname : "").replace(/\\/g, "/");
    if (/contents\/(activity-flyer|feature-events)\//i.test(path)) return "../contact.html";
    if (/contents\//i.test(path)) return "contact.html";
    return "contents/contact.html";
  }

  function buildCoordinatorContactHref(subject, body) {
    var h = coordinatorContactBaseHref();
    var params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("message=" + encodeURIComponent(body));
    if (params.length) h += "?" + params.join("&");
    return h;
  }

  function mmhpApplyCoordinatorMailtoLinks(root) {
    root = root || document;
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll("a[data-mmhp-coordinator-mailto]");
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      var sub = a.getAttribute("data-mmhp-mailto-subject") || "";
      var bod = a.getAttribute("data-mmhp-mailto-body") || "";
      a.setAttribute("href", buildCoordinatorContactHref(sub, bod));
    }
  }

  global.mmhpGetCoordinatorEmailDefault = mmhpGetCoordinatorEmailDefault;
  global.mmhpGetCoordinatorEmail = mmhpGetCoordinatorEmail;
  global.mmhpApplyCoordinatorMailtoLinks = mmhpApplyCoordinatorMailtoLinks;
  global.mmhpValidateCoordinatorEmail = basicEmailCheck;
  global.mmhpBuildMailtoHref = buildMailtoHref;

  function onReady() {
    mmhpApplyCoordinatorMailtoLinks(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})(typeof window !== "undefined" ? window : this);
