// @ts-check
'use strict';

const btn = /** @type {HTMLButtonElement} */ (document.getElementById('capture-btn'));
const status = /** @type {HTMLParagraphElement} */ (document.getElementById('status'));

/** @type {any} */
const photobooth = window.photobooth;

photobooth.onStatus(( /** @type {string} */ s) => {
  status.textContent = s.charAt(0).toUpperCase() + s.slice(1);
  status.className = s.startsWith('error') ? 'error' : '';
  btn.disabled = s === 'capturing';
});

btn.addEventListener('click', () => {
  photobooth.capture().catch((/** @type {Error} */ err) => {
    status.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
    status.className = 'error';
    btn.disabled = false;
  });
});
