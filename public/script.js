/* ===================================
   CILVEX — Landing Page Script
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ——— Navbar scroll effect ———
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ——— Hamburger menu ———
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ——— Scroll reveal animations ———
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // ——— Smooth scroll for anchor links ———
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ——— FAQ accordion ———
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains('active');
      // Close all
      document.querySelectorAll('.faq-item.active').forEach(i => i.classList.remove('active'));
      // Toggle clicked
      if (!isActive) item.classList.add('active');
    });
  });

  // ——— Chatbot ———
  const chatbot = document.getElementById('chatbot');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotSend = document.getElementById('chatbotSend');
  const chatbotSuggestions = document.getElementById('chatbotSuggestions');

  const faqResponses = {
    envios: '📦 Sí, realizamos envíos a todo Colombia con las mejores empresas de logística.',
    pagos: '💳 Aceptamos tarjetas de crédito/débito, Nequi, Daviplata, transferencia bancaria y pago contra entrega.',
    tiempos: '🚚 El tiempo de entrega es de 3 a 7 días hábiles dependiendo de tu ciudad.',
    producto: '🧲 Nuestro Magnetic Gym Bag cuenta con cierre magnético, diseño minimalista y materiales premium.',
    soporte: '📩 Puedes escribirnos por Instagram @cilvex_col o al WhatsApp para atención personalizada.'
  };

  chatbotToggle.addEventListener('click', () => {
    chatbot.classList.toggle('open');
    if (chatbot.classList.contains('open')) {
      chatbotInput.focus();
    }
  });

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    msg.innerHTML = `<p>${text}</p>`;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function handleBotResponse(key) {
    const response = faqResponses[key] || 'Gracias por tu mensaje. Para más información escríbenos por Instagram @cilvex_col 🙌';
    setTimeout(() => addMessage(response, 'bot'), 600);
  }

  // Suggestion chips
  chatbotSuggestions.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.question;
      addMessage(chip.textContent, 'user');
      handleBotResponse(q);
    });
  });

  // Text input
  function sendMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    chatbotInput.value = '';

    // Simple keyword matching
    const lower = text.toLowerCase();
    let key = null;
    if (lower.includes('envío') || lower.includes('envio') || lower.includes('enviar')) key = 'envios';
    else if (lower.includes('pago') || lower.includes('pagar') || lower.includes('nequi') || lower.includes('tarjeta')) key = 'pagos';
    else if (lower.includes('tiempo') || lower.includes('tarda') || lower.includes('demora') || lower.includes('entrega')) key = 'tiempos';
    else if (lower.includes('producto') || lower.includes('bag') || lower.includes('magnético') || lower.includes('magnetico')) key = 'producto';
    else if (lower.includes('soporte') || lower.includes('ayuda') || lower.includes('contacto') || lower.includes('whatsapp')) key = 'soporte';

    handleBotResponse(key);
  }

  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // ——— Instalación de la app (PWA) ———
  let deferredPrompt = null;
  const installBtn = document.getElementById('installApp');

  // Si la app ya está instalada (abierta en modo standalone), ocultar el botón
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone && installBtn) installBtn.style.display = 'none';

  // Chrome/Android dispara este evento cuando la app es instalable
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Instalación nativa (Android/Chrome): muestra el diálogo del sistema
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      } else {
        // Fallback para iOS (Safari) u otros navegadores sin instalación automática
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isIOS) {
          alert('Para instalar CILVEX en tu iPhone:\n\n1. Toca el botón Compartir (cuadro con flecha hacia arriba).\n2. Selecciona "Agregar a inicio".');
        } else {
          alert('Para instalar CILVEX:\n\nAbre el menú de tu navegador (⋮) y selecciona "Instalar app" o "Agregar a pantalla de inicio".');
        }
      }
    });
  }

  // Ocultar el botón una vez instalada la app
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = 'none';
  });

});
