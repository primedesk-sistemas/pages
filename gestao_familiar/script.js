'use strict';

// CONFIGURAÇÃO DE CONTATO
// Número oficial do PrimeDesk, com DDI e DDD, apenas números.
const WHATSAPP_NUMBER = '5589994716436';

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-nav');
const toast = document.getElementById('toast');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 12);
}
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
});

document.querySelectorAll('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.getElementById('current-year').textContent = String(new Date().getFullYear());

const video = document.getElementById('product-video');
const fallback = document.getElementById('video-fallback');
let videoAvailable = false;

video.addEventListener('loadedmetadata', () => {
  videoAvailable = true;
  fallback.classList.add('hidden');
});
video.addEventListener('error', () => {
  videoAvailable = false;
  fallback.classList.remove('hidden');
});
fallback.addEventListener('click', () => {
  if (videoAvailable) {
    fallback.classList.add('hidden');
    video.play().catch(() => {});
  } else {
    showToast('Não foi possível carregar a apresentação. Verifique se o arquivo video.mp4 foi publicado junto com a página.');
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 4500);
}

const leadForm = document.getElementById('lead-form');
leadForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!leadForm.reportValidity()) return;

  const data = new FormData(leadForm);
  const text = [
    'Olá! Gostaria de solicitar uma demonstração do PrimeDesk Gestão Familiar.',
    '',
    `Nome: ${data.get('nome')}`,
    `Instituição: ${data.get('instituicao')}`,
    `WhatsApp: ${data.get('telefone')}`,
    `E-mail: ${data.get('email') || 'Não informado'}`
  ].join('\n');

  if (WHATSAPP_NUMBER) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Mensagem copiada. Configure seu WhatsApp no arquivo script.js para abrir o contato automaticamente.');
    }).catch(() => showToast('Configure o número de WhatsApp no arquivo script.js.'));
  } else {
    showToast('Configure o número de WhatsApp no arquivo script.js.');
  }
});
