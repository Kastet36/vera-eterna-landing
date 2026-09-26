(() => {
  'use strict';

  const endpoint = 'https://vera-eterna.ru/api/proxy.ashx?path=RecordsExchange%2FClientsRequest';
  const salon = { Наименование: 'Вера Этерна', ID: '073ee654-ec6a-11f0-895b-60452ef7c654' };
  const sourceKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'from', 'yclid'];
  const reachGoal = (goalId) => {
    try { window.ym?.(112812642, 'reachGoal', goalId); } catch (_) { /* Analytics must not affect the form. */ }
  };

  const normalizePhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 10) digits = `7${digits}`;
    if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    return digits;
  };

  const buildPayload = (form, kind) => {
    const now = new Date().toISOString();
    const name = form.elements.namedItem('name').value.trim();
    const phone = normalizePhone(form.elements.namedItem('phone').value);
    const service = form.elements.namedItem('service').value;
    const source = window.veraAttribution?.get() || {};
    const fields = Object.fromEntries(sourceKeys.map((key) => [key, source[key] || '']));
    const comment = [kind, service ? `Услуга: ${service}` : 'Услугу поможет выбрать администратор'].join('. ');

    return {
      Клиент: { Имя: name, НомерТелефона: phone, ID: '' },
      ДатаЗаписи: now,
      Комментарий: comment,
      СалонID: salon.ID,
      Салон: salon.Наименование,
      ВыбранныеДанные: {
        Салон: salon,
        Дата: '',
        ДатаЗаписи: now,
        Время: '',
        НачалоОкошка: '',
        КонецОкошка: '',
        Мастер: null,
        Услуги: []
      },
      ВыбранноеВремя: null,
      Мастер: null,
      Услуги: [],
      ...fields
    };
  };

  const setupForm = (formId, kind, goalId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const submit = form.querySelector('[type="submit"]');
    const phoneInput = form.elements.namedItem('phone');
    const status = document.createElement('p');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.tabIndex = -1;
    form.querySelector('.form-consent').before(status);
    let busy = false;
    const dialog = form.closest('dialog');
    if (dialog && typeof MutationObserver !== 'undefined') {
      let wasOpen = dialog.open;
      new MutationObserver(() => {
        if (dialog.open && !wasOpen) reachGoal('lead_form_open');
        wasOpen = dialog.open;
      }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      if (!/^7\d{10}$/.test(normalizePhone(phoneInput.value))) {
        status.className = 'form-status form-status--error';
        status.textContent = 'Проверьте номер телефона: укажите 10 цифр или номер с +7.';
        phoneInput.focus();
        return;
      }

      busy = true;
      submit.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Отправляем заявку…';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(buildPayload(form, kind))
        });
        const body = await response.text();
        let result = null;
        if (body) {
          try { result = JSON.parse(body); } catch (_) { /* A successful response may be empty or non-JSON. */ }
        }
        if (!response.ok || (result && typeof result === 'object' && ('error' in result || result.success === false))) {
          throw new Error(`ClientsRequest returned HTTP ${response.status}`);
        }

        form.reset();
        status.className = 'form-status form-status--success';
        status.textContent = 'Заявка отправлена. Администратор свяжется с вами.';
        status.focus();
        reachGoal(goalId);
      } catch (error) {
        console.error('Не удалось отправить заявку:', error);
        status.className = 'form-status form-status--error';
        status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.';
        status.focus();
      } finally {
        busy = false;
        submit.disabled = false;
      }
    });

    dialog?.addEventListener('close', () => {
      status.textContent = '';
      status.className = 'form-status';
    });
  };

  setupForm('lead-form', 'Запланировать визит', 'lead_visit');
  setupForm('price-lead-form', 'Уточнить стоимость', 'lead_price');
})();
