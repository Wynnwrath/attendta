/* Prototype account forms and shared record editors. Port persistence to Razor/SQL. */
(function () {
  'use strict';
  var Ta = window.Ta;
  var base = new URL('../', document.currentScript.src);
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function audit(action, target, reason, before, after) {
    var session = Ta.store.get('session') || {};
    var rows = (Ta.store.get('auditlog') || []).slice();
    rows.push({ id: Ta.store.nextId('auditlog', 'log-'), actor: session.name || 'Prototype operator', action: action,
      target: target, reason: reason || '', before: before || null, after: after || null, timestamp: new Date().toISOString() });
    Ta.store.set('auditlog', rows);
  }
  function identity() {
    var s = Ta.store.get('session');
    if (!s) return null;
    var users = Ta.store.get('users') || [];
    var members = Ta.store.get('members') || [];
    var user = users.find(function (u) { return u.id === s.id || (s.email && u.email.toLowerCase() === s.email.toLowerCase()); });
    var member = members.find(function (m) { return m.id === (s.studentId || s.id) || (s.email && m.email.toLowerCase() === s.email.toLowerCase()); });
    return { session: s, user: user, member: member, name: user ? user.name : member ? member.name : s.name, email: user ? user.email : member ? member.email : s.email };
  }
  function field(name, label, value, opts) {
    opts = opts || {};
    var id = 'record-' + name;
    if (name === 'Program') {
      var choices = ['BSIT', 'BSCS', 'BSIS', 'BSEMC'];
      if (value && choices.indexOf(value) < 0) choices.push(value);
      return '<div class="field"><label class="field-label field-required" for="' + id + '">' + label + '</label><select class="select" id="' + id + '" name="Program" required>' +
        choices.map(function (choice) { return '<option' + (choice === value ? ' selected' : '') + '>' + esc(choice) + '</option>'; }).join('') + '</select><div class="field-error"></div></div>';
    }
    if (name === 'YearLevel') opts.type = 'number';
    return '<div class="field"><label class="field-label' + (opts.required ? ' field-required' : '') + '" for="' + id + '">' + label + '</label>' +
      '<input class="input" id="' + id + '" name="' + name + '" type="' + (opts.type || 'text') + '" value="' + esc(value) + '"' + (opts.required ? ' required' : '') +
      (name === 'YearLevel' ? ' min="1" step="1"' : '') +
      (opts.readonly ? ' readonly' : '') + '><div class="field-error"></div></div>';
  }
  function editDialog(title, markup, save, label) {
    return new Promise(function (resolve) {
      var previous = document.activeElement;
      var dlg = document.createElement('dialog');
      dlg.className = 'dialog record-dialog';
      dlg.setAttribute('aria-modal', 'true');
      dlg.setAttribute('aria-labelledby', 'record-dialog-title');
      dlg.innerHTML = '<form method="post" data-action="records.save" novalidate><h2 class="dialog__title" id="record-dialog-title">' + esc(title) + '</h2>' +
        '<div class="dialog__body space-y-4">' + markup + '<p class="field-error" data-editor-error role="alert"></p></div>' +
        '<div class="dialog__footer"><button class="btn btn--ghost" type="button" data-editor-cancel>Cancel</button><button class="btn btn--primary" type="submit">' + esc(label || 'Save changes') + '</button></div></form>';
      function close(value) { dlg.close(); dlg.remove(); if (previous && previous.isConnected) previous.focus(); resolve(value); }
      dlg.querySelector('[data-editor-cancel]').addEventListener('click', function () { close(null); });
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(null); });
      dlg.querySelector('form').addEventListener('submit', async function (e) {
        e.preventDefault(); e.stopPropagation();
        var form = e.currentTarget;
        var error = form.querySelector('[data-editor-error]');
        error.textContent = '';
        if (!Ta.form.validate(form)) return;
        var button = form.querySelector('[type=submit]');
        button.disabled = true;
        try {
          var data = Object.fromEntries(new FormData(form));
          Object.keys(data).forEach(function (k) { if (typeof data[k] === 'string') data[k] = data[k].trim(); });
          var result = await save(data);
          close(result === undefined ? data : result);
        } catch (err) { error.textContent = err.message; button.disabled = false; }
      });
      document.body.appendChild(dlg); dlg.showModal();
      dlg.querySelector('input:not([readonly]),textarea,button').focus();
    });
  }
  function reason(options) {
    return editDialog(options.title, '<p>' + esc(options.message) + '</p><div class="field"><label class="field-label field-required" for="record-reason">Reason</label>' +
      '<textarea class="textarea" id="record-reason" name="reason" rows="3" required maxlength="500"></textarea><p class="field-help">This reason is kept with the decision.</p><div class="field-error"></div></div>',
      function (data) { return data.reason; }, options.confirmText || 'Confirm');
  }
  async function credential(password, salt) {
    var bytes = salt ? Uint8Array.from(atob(salt), function (c) { return c.charCodeAt(0); }) : crypto.getRandomValues(new Uint8Array(16));
    var key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    var result = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: bytes, iterations: 100000, hash: 'SHA-256' }, key, 256);
    return { salt: btoa(String.fromCharCode.apply(null, bytes)), hash: btoa(String.fromCharCode.apply(null, new Uint8Array(result))) };
  }
  async function verify(password, stored) { return !!stored && (await credential(password, stored.salt)).hash === stored.hash; }
  function saveProfile(data, person, management) {
    var member = person.member;
    var before = member ? { name: member.name, studentId: member.studentId, program: member.program, yearSection: member.yearSection, mobile: member.mobile || '', type: member.type || 'Member' } : { name: person.name };
    if (management && data.StudentNumber !== member.studentId) {
      if (!data.Reason) throw new Error('Enter a reason for correcting the student number.');
      if ((Ta.store.get('members') || []).some(function (m) { return m.id !== member.id && m.studentId === data.StudentNumber; })) throw new Error('That student number is already assigned to another member.');
    }
    var changes = { name: data.FullName };
    if (member) Object.assign(changes, { program: data.Program, yearLevel: data.YearLevel, section: data.Section,
      yearSection: data.YearLevel + '-' + data.Section, mobile: data.Mobile || '' });
    if (management) Object.assign(changes, { studentId: data.StudentNumber, type: data.MembershipType });
    if (member) Ta.store.set('members', (Ta.store.get('members') || []).map(function (m) { return m.id === member.id ? Object.assign({}, m, changes) : m; }));
    if (person.user) Ta.store.set('users', (Ta.store.get('users') || []).map(function (u) { return u.id === person.user.id ? Object.assign({}, u, { name: data.FullName }) : u; }));
    var current = identity();
    if (current && ((member && current.member && current.member.id === member.id) || (person.user && current.user && current.user.id === person.user.id))) {
      Ta.store.set('session', Object.assign({}, current.session, { name: data.FullName }));
    }
    audit(management ? 'Updated member' : 'Updated profile', member ? member.id : person.user.id, data.Reason, before, changes);
  }
  function editMember(id) {
    var m = Ta.store.find('members', id);
    if (!m) return;
    var parts = (m.yearSection || '').split('-');
    var markup = '<p class="text-sm text-ink-muted">Update member details. Previous attendance and certificates stay in the record.</p><div class="record-grid">' +
      field('FullName', 'Full name', m.name, { required: true }) + field('StudentNumber', 'Student number', m.studentId, { required: true }) +
      field('Program', 'Course / program', m.program, { required: true }) + field('YearLevel', 'Year level', m.yearLevel || parts[0], { required: true }) +
      field('Section', 'Section', m.section || parts.slice(1).join('-'), { required: true }) + field('Mobile', 'Mobile number (optional)', m.mobile, { type: 'tel' }) +
      field('MembershipType', 'Membership type', m.type || 'Member', { required: true }) + field('Email', 'Account email', m.email, { readonly: true }) + '</div>' +
      field('Reason', 'Student-number correction reason', '', {}) + '<p class="field-help">Required only when the student number changes.</p>';
    var user = (Ta.store.get('users') || []).find(function (u) { return u.email === m.email; });
    return editDialog('Edit member', markup, function (data) { saveProfile(data, { member: m, user: user }, true); }).then(function (saved) {
      if (saved) { document.dispatchEvent(new CustomEvent('ta:records-updated')); Ta.toast('Member details saved.', { type: 'success' }); }
    });
  }
  function editType(id) {
    var type = Ta.store.find('types', id);
    if (!type) return;
    return editDialog('Edit event type', field('Name', 'Name', type.name, { required: true }) +
      '<div class="field"><label class="field-label" for="type-description-edit">Description</label><textarea class="textarea" id="type-description-edit" name="Description" rows="3">' + esc(type.description || '') + '</textarea></div>', function (data) {
      if ((Ta.store.get('types') || []).some(function (t) { return t.id !== id && t.name.toLowerCase() === data.Name.toLowerCase(); })) throw new Error('An event type with this name already exists.');
      var after = Object.assign({}, type, { name: data.Name, description: data.Description });
      Ta.store.set('types', (Ta.store.get('types') || []).map(function (t) { return t.id === id ? after : t; }));
      audit('Updated event type', id, '', { name: type.name, description: type.description }, { name: after.name, description: after.description });
    }).then(function (saved) { if (saved) { document.dispatchEvent(new CustomEvent('ta:records-updated')); Ta.toast('Event type saved.', { type: 'success' }); } });
  }
  function navigation() {
    document.querySelectorAll('[data-sign-out]').forEach(function (button) {
      if (button.closest('[data-account-menu]')) return;
      var host = document.createElement('div');
      host.className = 'menu'; host.setAttribute('data-account-menu', '');
      host.innerHTML = '<button class="btn btn--ghost btn--sm" type="button" data-menu-trigger aria-haspopup="true" aria-expanded="false">Account</button>' +
        '<div class="menu__panel" data-menu><a class="menu__item" href="' + new URL('account/profile.html', base).href + '">My profile</a>' +
        '<a class="menu__item" href="' + new URL('account/change-password.html', base).href + '">Change password</a></div>';
      button.before(host);
    });
  }
  function accountPage() {
    var form = document.querySelector('[data-account-form]');
    if (!form) return;
    var person = identity();
    var notice = document.querySelector('[data-account-notice]');
    if (!person) {
      form.hidden = true; notice.hidden = false;
      notice.innerHTML = '<h2 class="text-lg font-semibold">Sign in to manage your account</h2><p class="mt-2 text-ink-muted">Your profile and password settings belong to your signed-in account.</p><a class="btn btn--primary mt-4" href="login.html">Sign in</a>';
      return;
    }
    var back = document.querySelector('[data-account-back]');
    back.href = new URL(person.session.role === 'admin' ? 'admin/users.html' : person.session.role === 'officer' ? 'events/index.html' : 'student/events.html', base).href;
    document.querySelector('[data-account-name]').textContent = person.name;
    document.querySelector('[data-account-email]').textContent = person.email;
    var mode = form.getAttribute('data-account-form');
    var visibility = form.querySelector('[data-show-account-passwords]');
    if (visibility) visibility.addEventListener('change', function () {
      form.querySelectorAll('input[autocomplete="current-password"],input[autocomplete="new-password"]').forEach(function (input) { input.type = visibility.checked ? 'text' : 'password'; });
    });
    if (visibility) form.addEventListener('reset', function () {
      form.querySelectorAll('input[autocomplete="current-password"],input[autocomplete="new-password"]').forEach(function (input) { input.type = 'password'; });
    });
    if (mode === 'profile') {
      var m = person.member;
      var parts = m ? (m.yearSection || '').split('-') : [];
      var values = { FullName: person.name, Email: person.email, StudentNumber: m ? m.studentId : '', Program: m ? m.program : '',
        YearLevel: m ? m.yearLevel || parts[0] : '', Section: m ? m.section || parts.slice(1).join('-') : '', Mobile: m ? m.mobile || '' : '' };
      if (values.Program && !Array.from(form.elements.Program.options).some(function (o) { return o.value === values.Program; })) form.elements.Program.add(new Option(values.Program, values.Program));
      Object.keys(values).forEach(function (key) { form.elements[key].value = values[key] || ''; });
      if (!m) { var academic = form.querySelector('[data-member-fields]'); academic.hidden = true; academic.querySelectorAll('input,select').forEach(function (el) { el.disabled = true; }); }
      var initial = new FormData(form);
      form.addEventListener('reset', function () { setTimeout(function () {
        initial.forEach(function (value, key) { form.elements[key].value = value; });
        Ta.form.validate(form); form.querySelector('[data-account-error]').textContent = '';
      }, 0); });
    } else if (!person.user || !person.user.credential) {
      notice.hidden = false;
      notice.textContent = 'This sample account has no password credential. To try this flow, submit a new membership request, approve it, and sign in with that account.';
      form.querySelector('fieldset').disabled = true;
    }
    form.addEventListener('submit', async function (e) {
      e.preventDefault(); e.stopPropagation();
      var error = form.querySelector('[data-account-error]'); error.textContent = '';
      if (!Ta.form.validate(form)) return;
      var submit = form.querySelector('[type=submit]'); submit.disabled = true;
      form.setAttribute('aria-busy', 'true');
      try {
        var data = Object.fromEntries(new FormData(form));
        if (mode === 'profile') {
          Object.keys(data).forEach(function (key) { if (typeof data[key] === 'string') data[key] = data[key].trim(); });
          saveProfile(data, identity(), false);
          document.querySelector('[data-account-name]').textContent = data.FullName;
          initial = new FormData(form);
          Ta.toast('Profile changes saved.', { type: 'success' });
        } else {
          var fresh = identity();
          if (!fresh.user || !await verify(data.CurrentPassword, fresh.user.credential)) throw new Error('The current password is incorrect. Try again.');
          if (data.NewPassword === data.CurrentPassword) throw new Error('Choose a different new password.');
          var updated = await credential(data.NewPassword);
          Ta.store.set('users', (Ta.store.get('users') || []).map(function (u) { return u.id === fresh.user.id ? Object.assign({}, u, { credential: updated }) : u; }));
          audit('Changed password', fresh.user.id);
          form.reset(); Ta.toast('Password changed for this prototype account.', { type: 'success' });
        }
      } catch (err) { error.textContent = err.message; error.focus(); }
      finally { submit.disabled = false; form.removeAttribute('aria-busy'); }
    });
  }
  Ta.account = { identity: identity, audit: audit, reason: reason, editMember: editMember, editType: editType, credential: credential, verify: verify };
  function init() {
    navigation(); accountPage();
    document.addEventListener('click', function (e) {
      var member = e.target.closest('[data-edit-member]');
      var type = e.target.closest('[data-edit-type]');
      if (member) editMember(member.getAttribute('data-edit-member'));
      if (type) editType(type.getAttribute('data-edit-type'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('ta:ready', init, { once: true });
  else init();
})();
