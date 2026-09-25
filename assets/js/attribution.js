(() => {
  'use strict';

  const keys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'from', 'yclid', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'vkclid'
  ];
  const storageKey = 'vera_attribution_v1';
  const lifetime = 30 * 24 * 60 * 60 * 1000;
  const maxValueLength = 200;

  const parseRecord = (value) => {
    try {
      const record = JSON.parse(value);
      if (!record || typeof record.expires !== 'number' || record.expires <= Date.now()) return null;
      const fields = {};
      keys.forEach((key) => {
        if (typeof record.fields?.[key] === 'string') fields[key] = record.fields[key];
      });
      return { fields, expires: record.expires };
    } catch (_) {
      return null;
    }
  };

  const readRecord = () => {
    try {
      const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${storageKey}=`));
      const record = cookie && parseRecord(decodeURIComponent(cookie.slice(storageKey.length + 1)));
      if (record) return record;
    } catch (_) { /* Storage restrictions must not interrupt navigation. */ }
    try { return parseRecord(localStorage.getItem(storageKey)); } catch (_) { return null; }
  };

  const incoming = new URLSearchParams(window.location.search);
  const hasIncomingTags = keys.some((key) => incoming.has(key));
  let record = readRecord();

  if (hasIncomingTags) {
    const fields = {};
    keys.forEach((key) => {
      if (incoming.has(key)) fields[key] = (incoming.get(key) || '').slice(0, maxValueLength);
    });
    // A new tagged visit replaces the campaign as a unit; fields from older visits are not mixed in.
    record = { fields, expires: Date.now() + lifetime };
  }

  if (record) {
    const serialized = JSON.stringify(record);
    try { localStorage.setItem(storageKey, serialized); } catch (_) { /* The URL link still carries the source. */ }
    try {
      const hostname = window.location.hostname;
      const domain = hostname === 'vera-eterna.ru' || hostname.endsWith('.vera-eterna.ru')
        ? '; Domain=vera-eterna.ru' : '';
      document.cookie = `${storageKey}=${encodeURIComponent(serialized)}; Path=/; Expires=${new Date(record.expires).toUTCString()}; SameSite=Lax${domain}${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    } catch (_) { /* The URL link still carries the source. */ }
  }

  const decorateBookingLink = (link) => {
    const url = new URL(link.href);
    const current = hasIncomingTags ? record : (readRecord() || record);
    keys.forEach((key) => {
      url.searchParams.delete(key);
      const value = current?.fields[key];
      if (value) url.searchParams.set(key, value);
    });
    link.href = url.href;
  };

  const updateBookingLinks = () => {
    document.querySelectorAll('[data-booking-link]').forEach(decorateBookingLink);
  };

  updateBookingLinks();
  window.addEventListener('pageshow', updateBookingLinks);
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('[data-booking-link]');
    if (link) decorateBookingLink(link);
  }, true);
})();
