/* Prototype-only account administration. Server authorization remains required. */
(function () {
  function active(u) { return !!u && u.active !== false && u.deactivated !== true; }
  function actor() {
    var session = Ta.store.get('session') || {};
    var user = (Ta.store.get('users') || []).find(function (u) { return u.id === session.id; });
    if (!active(user) || user.role !== 'admin') throw new Error('An active administrator account is required.');
    return user;
  }
  window.AttendTaAdmin = {
    actor: actor,
    protect: function (id, role, enabled) {
      actor();
      if (['member', 'officer', 'admin'].indexOf(role) < 0) throw new Error('Select a fixed account role.');
      var users = Ta.store.get('users') || [];
      var user = users.find(function (u) { return u.id === id; });
      if (!user) throw new Error('Account not found.');
      if (user.role === 'admin' && active(user) && (role !== 'admin' || !enabled) &&
          !users.some(function (u) { return u.id !== id && u.role === 'admin' && active(u); })) {
        throw new Error('At least one active administrator must remain.');
      }
    },
    cancelFuture: function (user, reason) {
      var member = (Ta.store.get('members') || []).find(function (m) {
        return m.id === user.memberId || (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase());
      });
      if (!member) return;
      var changed = [];
      var now = Date.now();
      var regs = (Ta.store.get('registrations') || []).map(function (r) {
        var ev = Ta.store.find('events', r.eventId);
        var start = ev && Date.parse(ev.date + 'T' + (ev.startTime || '00:00') + ':00+08:00');
        if (r.memberId !== member.id || !ev || !Number.isFinite(start) || start <= now ||
            ['completed','past','archived','cancelled'].indexOf(ev.status) !== -1 ||
            ['pending','confirmed','waitlisted'].indexOf(r.status) === -1) return r;
        changed.push(r.id);
        return Object.assign({}, r, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancellationReason: reason });
      });
      Ta.store.set('registrations', regs);
      Ta.store.set('passes', (Ta.store.get('passes') || []).map(function (p) {
        return changed.indexOf(p.registrationId) !== -1 ? Object.assign({}, p, { status: 'cancelled' }) : p;
      }));
      // Recalculate reserved seats from the complete dataset; never promote a queue.
      Ta.store.set('events', (Ta.store.get('events') || []).map(function (ev) {
        if (!regs.some(function (r) { return changed.indexOf(r.id) !== -1 && r.eventId === ev.id; })) return ev;
        return Object.assign({}, ev, { registered: regs.filter(function (r) {
          return r.eventId === ev.id && ['confirmed','attended'].indexOf(r.status) !== -1;
        }).length });
      }));
    }
  };
})();
