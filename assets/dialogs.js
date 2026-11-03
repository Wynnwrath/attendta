/* Shared dismissal, focus and layering for static mockup dialogs. */
(function () {
  'use strict';
  var stack = [], states = new WeakMap(), scheduled = false;
  var cancelIds = {
    'rejection-modal':'reject-cancel-btn', 'dossier-drawer':'dossier-close-btn',
    'member-drawer':'member-drawer-close', 'correction-modal':'correction-cancel-btn',
    'venue-drawer':'venue-drawer-close', 'type-modal':'type-cancel-btn',
    'decline-reg-modal':'decline-reg-abort', 'promote-modal':'promote-modal-abort',
    'complete-event-modal':'complete-modal-abort', 'cancel-event-modal':'cancel-event-abort',
    'edit-metadata-modal':'edit-metadata-abort', 'member-cancel-modal':'member-cancel-abort',
    'decline-eligibility-modal':'decline-cert-cancel', 'issue-confirm-modal':'issue-modal-cancel',
    'inval-modal':'inval-modal-close'
  };
  function visible(el) { return el.isConnected && (el.tagName === 'DIALOG' ? el.open : !el.classList.contains('hidden')); }
  function focusables(el) { return Array.from(el.querySelectorAll('button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(function (n) { return n.getClientRects().length; }); }
  function dismiss(el) {
    if (el.tagName === 'DIALOG') {
      var event = new Event('cancel', {cancelable:true});
      if (el.dispatchEvent(event)) el.close();
      return;
    }
    var btn = document.getElementById(cancelIds[el.id]);
    if (btn && el.contains(btn)) btn.click();
    el.classList.add('hidden');
  }
  function prepare(el) {
    if (states.has(el)) return;
    var native = el.tagName === 'DIALOG';
    var panel = native ? el : el.firstElementChild;
    if (!panel) return;
    states.set(el, {open:false, previous:null});
    if (!native) { el.setAttribute('data-ta-modal',''); panel.setAttribute('data-ta-panel',''); }
    var heading = el.querySelector('h2,h3');
    if (heading && !el.hasAttribute('aria-labelledby')) {
      heading.id = heading.id || el.id + '-heading'; el.setAttribute('aria-labelledby',heading.id);
    }
    var close = Array.from(el.querySelectorAll('button')).find(function (b) { return /close/.test(b.id) || /close/i.test(b.getAttribute('aria-label') || ''); });
    if (!close) {
      close = document.createElement('button'); close.type = 'button';
      close.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
      panel.appendChild(close);
      close.addEventListener('click', function () { dismiss(el); });
    }
    close.classList.add('ta-dialog-close'); close.setAttribute('aria-label','Close dialog');
    if (!native) close.addEventListener('click', function () { el.classList.add('hidden'); });
    if (!native) el.addEventListener('click',function (e) { if (e.target === el) { e.stopImmediatePropagation(); dismiss(el); } },true);
  }
  function sync() {
    scheduled = false;
    document.querySelectorAll('div[role="dialog"], dialog.dialog').forEach(function (el) {
      prepare(el); var state = states.get(el); if (!state) return;
      var now = visible(el);
      if (now && !state.open) {
        state.previous = lastTrigger || document.activeElement;
        stack.push(el);
      } else if (!now && state.open) {
        stack = stack.filter(function (item) {return item !== el;});
        if (state.previous && state.previous.isConnected) state.previous.focus();
      }
      state.open = now;
    });
    stack = stack.filter(visible);
    var top = stack[stack.length-1];
    document.querySelectorAll('[data-ta-modal],dialog.dialog').forEach(function (el) {
      var suspended = visible(el) && el !== top;
      el.toggleAttribute('data-dialog-suspended',suspended);
      el.inert = suspended;
    });
    document.body.style.overflow = top ? 'hidden' : '';
    if (top && !top.contains(document.activeElement)) {
      var controls = focusables(top); if (controls.length) controls[0].focus();
    }
  }
  var lastTrigger = null;
  document.addEventListener('click',function (e) { var trigger = e.target.closest('button,a,tr[data-view-dossier],tr[data-view-member]'); if(trigger)lastTrigger=trigger; },true);
  document.addEventListener('keydown',function (e) {
    var top = stack[stack.length-1]; if(!top)return;
    if(e.key==='Escape') { e.preventDefault();e.stopImmediatePropagation();dismiss(top); }
    if(e.key==='Tab') {
      var controls=focusables(top);if(!controls.length)return;
      var first=controls[0],last=controls[controls.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  },true);
  function start() {
    new MutationObserver(function () { if(!scheduled){scheduled=true;queueMicrotask(sync);} }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','open']});
    sync();
    var applied = false;
    function applyScreenshotState() {
      if (applied || !window.Ta || !window.Ta.store) return;
      applied = true;
      var params = new URLSearchParams(location.search), modal = params.get('modal');
      var map = location.pathname.includes('/admin/users') ? {deactivate:'deactivate-user-modal',reactivate:'reactivate-user-modal'} :
        location.pathname.includes('/kiosk/') ? {invalidation:'inval-modal'} :
        location.pathname.includes('/events/details') ? {'decline-reg':'decline-reg-modal'} : {};
      var target = document.getElementById(map[modal]);
      if (target) {
        var store = window.Ta.store;
        if (modal === 'deactivate' || modal === 'reactivate') {
          var user = (store.get('users') || []).find(function (u) { return modal === 'reactivate' ? u.active === false : u.role === 'officer'; });
          if (user) {
            document.getElementById(modal + '-user-id').value = user.id;
            document.getElementById(modal + '-user-name').textContent = user.name;
          }
        }
        if (modal === 'invalidation') {
          var member = store.find('members','22309821') || {};
          document.getElementById('inval-target-name').textContent = member.name || 'Adrian Jose V. Ramirez';
          document.getElementById('inval-target-sid').textContent = member.studentId || '22309821';
          document.getElementById('inval-target-time').textContent = 'Oct 15, 2026 · 09:14 AM';
        }
        if (modal === 'decline-reg') {
          document.getElementById('decline-participant-desc').textContent = 'Request from Renzo Gabriel S. Mendoza · AI Architecture & High-Agency Systems';
        }
        target.classList.remove('hidden');
      }
      if (location.pathname.includes('/events/details') && params.get('tab') === 'waitlisted') {
        var tab = document.querySelector('[data-reg-tab="waitlisted"]'); if (tab) tab.click();
      }
    }
    document.addEventListener('ta:ready', applyScreenshotState);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyScreenshotState, {once:true});
    else setTimeout(applyScreenshotState, 0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
