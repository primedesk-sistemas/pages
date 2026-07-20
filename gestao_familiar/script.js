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

const videoShell = document.getElementById('video-shell');
const video = document.getElementById('product-video');
const fallback = document.getElementById('video-fallback');
let videoAvailable = false;

function isMobileDevice() {
  return window.matchMedia('(max-width: 900px)').matches &&
    (navigator.maxTouchPoints > 0 || 'ontouchstart' in window);
}

async function lockLandscapeWhenSupported() {
  if (!screen.orientation || typeof screen.orientation.lock !== 'function') return;
  try {
    await screen.orientation.lock('landscape');
  } catch (_) {
    // Alguns navegadores, especialmente no iPhone, não permitem o bloqueio.
  }
}

async function openMobileFullscreen() {
  const target = typeof video.requestFullscreen === 'function' ? video : videoShell;
  if (target && typeof target.requestFullscreen === 'function') {
    await target.requestFullscreen();
    await lockLandscapeWhenSupported();
  }
}

async function startPresentation() {
  if (!videoAvailable) {
    showToast('Não foi possível carregar a apresentação. Verifique se o arquivo video.mp4 foi publicado junto com a página.');
    return;
  }

  fallback.classList.add('hidden');

  try {
    if (isMobileDevice() && typeof video.webkitEnterFullscreen === 'function') {
      // No Safari móvel, iniciar pelo gesto do usuário antes de abrir o player nativo.
      await video.play();
      video.webkitEnterFullscreen();
    } else {
      if (isMobileDevice()) {
        await openMobileFullscreen();
      }
      await video.play();
    }
  } catch (_) {
    try {
      await video.play();
      if (isMobileDevice()) {
        showToast('Para melhor visualização, gire o celular para a posição horizontal.');
      }
    } catch (_) {
      fallback.classList.remove('hidden');
      showToast('Não foi possível iniciar o vídeo. Toque novamente no botão de reprodução.');
    }
  }
}

video.addEventListener('loadedmetadata', () => {
  videoAvailable = true;
});
video.addEventListener('error', () => {
  videoAvailable = false;
  fallback.classList.remove('hidden');
});
video.addEventListener('play', () => fallback.classList.add('hidden'));
video.addEventListener('ended', () => {
  fallback.classList.remove('hidden');
  video.currentTime = 0;
});
fallback.addEventListener('click', startPresentation);

function unlockOrientation() {
  if (screen.orientation && typeof screen.orientation.unlock === 'function') {
    try { screen.orientation.unlock(); } catch (_) {}
  }
}
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) unlockOrientation();
});
video.addEventListener('webkitendfullscreen', unlockOrientation);

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

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});
