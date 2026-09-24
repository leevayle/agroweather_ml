function show(id) {
  ['landing', 'login', 'app'].forEach(s => {
    const el = document.getElementById('screen-' + s);
    if (el) el.hidden = s !== id;
  });
}

function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const scrim = document.querySelector('.scrim');
  sb?.classList.remove('open');
  scrim?.classList.remove('on');
  document.body.style.overflow = '';
}

function goPage(name) {
  S.page = name;
  document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.classList.toggle('active', b.dataset.page === name);
  });
  closeSidebar();

  if (name === 'home') renderHome();
  else if (name === 'crops') renderCrops();
  else if (name === 'plan') renderPlan();
  else if (name === 'account') renderAccount();
}

function enterApp() {
  S.authed = true;
  persist();
  show('app');
  document.getElementById('userName').textContent = S.profile.name;
  goPage('home');
  if (window.lucide) lucide.createIcons();
}

function exitApp() {
  S.authed = false;
  persist();
  show('landing');
  renderLanding();
}

document.addEventListener('DOMContentLoaded', () => {
  boot();

  if (S.authed) enterApp();
  else {
    show('landing');
    renderLanding();
  }

  ['btnSignIn', 'btnStart', 'btnCta'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      show('login');
      if (window.lucide) lucide.createIcons();
    });
  });

  document.getElementById('btnBack').onclick = () => {
    show('landing');
    renderLanding();
  };

  document.getElementById('loginForm').onsubmit = e => {
    e.preventDefault();
    if (document.getElementById('password').value !== 'demo') {
      toast('Password is: demo');
      return;
    }
    const email = document.getElementById('email').value.trim();
    if (email) S.profile.email = email;
    enterApp();
    toast('Welcome back');
  };

  document.getElementById('btnLogout').onclick = () => {
    exitApp();
    toast('Signed out');
  };

  document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.addEventListener('click', () => goPage(b.dataset.page));
  });

  document.getElementById('themeBtn').onclick = () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    persist();
  };

  document.getElementById('modalClose').onclick = () => Modal.close();
  document.getElementById('modalScrim').onclick = () => Modal.close();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') Modal.close(); });

  document.getElementById('menuBtn').onclick = () => {
    const sb = document.getElementById('sidebar');
    const opening = !sb.classList.contains('open');
    sb.classList.toggle('open', opening);
    let s = document.querySelector('.scrim');
    if (!s) {
      s = document.createElement('div');
      s.className = 'scrim';
      document.body.appendChild(s);
      s.onclick = () => closeSidebar();
    }
    s.classList.toggle('on', opening);
    document.body.style.overflow = opening ? 'hidden' : '';
  };

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 800) closeSidebar();
  });

  if (window.lucide) lucide.createIcons();
});
