let chartInst = null;

const Modal = {
  open(title, body, foot) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFoot').innerHTML = foot || '';
    document.getElementById('modal').hidden = false;
    if (window.lucide) lucide.createIcons();
  },
  close() { document.getElementById('modal').hidden = true; }
};

function toast(m) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = m;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = '150ms'; setTimeout(() => t.remove(), 150); }, 2500);
}

function renderLanding() {
  const w = S.weather;
  document.getElementById('landTemp').textContent = T(w.temp);
  document.getElementById('landCond').textContent = w.condition;
  document.getElementById('landChips').innerHTML = `
    <span class="chip dark">Pressure ${w.pressure} hPa</span>
    <span class="chip green">Visibility ${w.visibility} km</span>
    <span class="chip soft">Humidity ${w.humidity}%</span>
    <span class="chip soft">Wind ${w.wind} m/s ${w.windDir}</span>
  `;
  document.getElementById('landForecast').innerHTML = S.forecast.map(f => `
    <div class="land-day">
      <div class="d">${dow(f.date)}</div>
      <div class="dt">${shortD(f.date)}</div>
      <div class="ic"><i data-lucide="${f.icon}"></i></div>
      <div class="t">${T(f.max)} / ${T(f.min)}</div>
    </div>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

function renderHome() {
  const w = S.weather;
  const ins = insights();
  const tomorrow = S.forecast[0];
  const el = document.getElementById('content');

  el.innerHTML = `
    <div class="dash">
      <div class="dash-main">
        <div class="cards-row">
          <div class="wx-card sky">
            <div class="wx-deco"><div class="sun"></div><div class="cloud"></div></div>
            <div class="wx-label"><i data-lucide="cloud-sun"></i> Weather</div>
            <div class="wx-title">What's the weather?</div>
            <div class="wx-temp">${T(w.temp)} <span>${T(w.min)}</span></div>
            <div class="wx-cond">${esc(w.condition)}</div>
            <div class="wx-chips">
              <span class="dark">Pressure ${w.pressure}mb</span>
              <span class="lime">Visibility ${w.visibility} km</span>
              <span>Humidity ${w.humidity}%</span>
            </div>
          </div>
          <div class="wx-card air">
            <div class="wx-label"><i data-lucide="wind"></i> Farm conditions</div>
            <div class="wx-title">Station sensors</div>
            <div class="air-value">${w.wind.toFixed(1)} <span>m/s ${w.windDir}</span></div>
            <div class="wx-cond">Wind · Rain ${w.rainfall.toFixed(1)} mm</div>
            <div class="air-bar"><div class="air-bar-fill" style="width:${Math.min(100, w.humidity)}%"></div></div>
            <div class="air-scale"><span>Dry</span><span>Ideal</span><span>Wet</span></div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-head">
            <h2>How's the temperature today?</h2>
            <div class="section-tools">
              <button class="tool-btn active"><i data-lucide="thermometer"></i></button>
              <button class="tool-btn"><i data-lucide="droplets"></i></button>
              <button class="tool-btn"><i data-lucide="wind"></i></button>
            </div>
          </div>
          <div class="temp-timeline">
            <div>
              <div class="timeline-chart"><canvas id="dayChart"></canvas></div>
              <div class="dayparts">
                ${S.history.map(h => `
                  <div class="daypart">
                    <div class="t">${T(h.temp)}</div>
                    <div class="l">${h.label}</div>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="tomorrow-card">
              <div>
                <div class="tm-label">Tomorrow</div>
                <div class="tm-place">${esc(S.profile.location.split(',')[0] || 'Farm')}</div>
                <div class="tm-temp">${T(tomorrow.max)}</div>
                <div class="tm-cond">${esc(tomorrow.condition)}</div>
              </div>
              <div class="tm-illust">${tomorrow.rain > 40 ? '🌧️' : '☀️'}</div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-head"><h2>Farm insights</h2></div>
          ${ins.map(i => `
            <div class="insight-row">
              <div class="insight-icon ${i.warn ? 'warn' : ''}"><i data-lucide="${i.icon}"></i></div>
              <div>
                <strong>${esc(i.t)}</strong>
                <p>${esc(i.d)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="dash-side">
        <div class="side-card">
          <div class="loc-row">
            <div class="loc"><i data-lucide="map-pin"></i> ${esc(S.profile.location)}</div>
          </div>
          <div class="side-temp">${T(w.temp)}</div>
          <div class="sun-arc">
            <svg viewBox="0 0 200 80" fill="none">
              <path d="M 20 70 Q 100 0 180 70" stroke="#fdba74" stroke-width="2" stroke-dasharray="4 4" fill="none"/>
              <circle cx="100" cy="20" r="8" fill="#fbbf24"/>
              <line x1="20" y1="70" x2="180" y2="70" stroke="#e2e8f0" stroke-width="1"/>
            </svg>
          </div>
          <div class="sun-times">
            <div><strong>${w.sunset}</strong>Sunset</div>
            <div style="text-align:right"><strong>${w.sunrise}</strong>Sunrise</div>
          </div>
          <div class="uvi-card">
            <div class="uvi-icon"><i data-lucide="sun"></i></div>
            <div>
              <strong>${w.uvi} UVI</strong>
              <span>UV index for field work</span>
            </div>
            <span class="uvi-badge">${w.uvi < 3 ? 'Low' : w.uvi < 6 ? 'Moderate' : 'High'}</span>
          </div>
        </div>

        <div class="side-card">
          <div class="section-head" style="margin-bottom:12px"><h2 style="font-size:0.95rem">Weather prediction</h2></div>
          <div class="pred-list">
            ${S.forecast.slice(0, 4).map(f => `
              <div class="pred-item">
                <div class="pi-icon"><i data-lucide="${f.icon}"></i></div>
                <div class="pi-info">
                  <div class="pi-date">${shortD(f.date)}</div>
                  <div class="pi-cond">${esc(f.condition)}</div>
                </div>
                <div class="pi-temp">${T(f.max)} / ${T(f.min)}</div>
              </div>
            `).join('')}
          </div>
          <button class="btn-next" id="seeMoreFc">Next 7 days</button>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  drawDayChart();
  document.getElementById('seeMoreFc')?.addEventListener('click', () => {
    toast('Showing full 7-day forecast on home');
  });
}

function drawDayChart() {
  const ctx = document.getElementById('dayChart');
  if (!ctx) return;
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const data = S.history.map(h => S.unit === 'F' ? toF(h.temp) : h.temp);
  if (chartInst) chartInst.destroy();
  chartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: S.history.map(h => h.label),
      datasets: [{
        data,
        borderColor: '#ff8a3d',
        backgroundColor: 'rgba(255, 138, 61, 0.1)',
        fill: true,
        tension: 0.45,
        pointRadius: 5,
        pointBackgroundColor: '#ff8a3d',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        borderWidth: 2.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
          ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 10 }, callback: v => v + '°' }
        }
      }
    }
  });
}

function renderCrops() {
  const el = document.getElementById('content');
  el.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Crops</h1>
        <p>Track fields and growth stages</p>
      </div>
      <button class="btn-orange" id="addCrop">+ Add crop</button>
    </div>
    ${S.crops.length ? `
      <div class="crop-grid">
        ${S.crops.map(c => `
          <div class="crop-card">
            <h3>${esc(c.name)}</h3>
            <div class="meta">${esc(c.stage)} · ${c.acres} acres · ${c.progress}%</div>
            <dl>
              <div><dt>Planted</dt><dd>${fmtDate(c.planted)}</dd></div>
              <div><dt>Harvest</dt><dd>${fmtDate(c.harvest)}</dd></div>
              <div><dt>Irrigation</dt><dd>${esc(c.irrigation)}</dd></div>
            </dl>
            <div class="progress"><span style="width:${c.progress}%"></span></div>
            <div class="crop-actions">
              <button class="btn-soft" data-edit="${c.id}">Edit</button>
              <button class="btn-soft danger" data-del="${c.id}">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="empty-box">
        <h3>No crops yet</h3>
        <p>Add your first crop to get farm insights.</p>
        <button class="btn-orange" id="addCrop2">+ Add crop</button>
      </div>
    `}
  `;
  document.getElementById('addCrop')?.addEventListener('click', () => cropForm());
  document.getElementById('addCrop2')?.addEventListener('click', () => cropForm());
  el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => cropForm(S.crops.find(c => c.id === b.dataset.edit)));
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const c = S.crops.find(x => x.id === b.dataset.del);
    Modal.open('Delete crop?', `<p style="color:var(--muted)">Remove ${esc(c?.name)}?</p>`,
      `<button class="btn-soft" id="mc">Cancel</button><button class="btn-soft danger" id="mok">Delete</button>`);
    document.getElementById('mc').onclick = () => Modal.close();
    document.getElementById('mok').onclick = () => {
      S.crops = S.crops.filter(x => x.id !== b.dataset.del);
      persist(); Modal.close(); toast('Deleted'); renderCrops();
    };
  });
}

function cropForm(crop) {
  const e = !!crop;
  Modal.open(e ? 'Edit crop' : 'Add crop', `
    <div class="field"><label>Name</label><input id="cn" value="${e ? esc(crop.name) : ''}"></div>
    <div class="field"><label>Acres</label><input type="number" step="0.1" id="ca" value="${e ? crop.acres : ''}"></div>
    <div class="field"><label>Planted</label><input type="date" id="cp" value="${e ? crop.planted : ''}"></div>
    <div class="field"><label>Harvest</label><input type="date" id="ch" value="${e ? crop.harvest || '' : ''}"></div>
    <div class="field"><label>Stage</label>
      <select id="cs">${['Seedling','Growing','Flowering','Fruiting','Mature','Harvested'].map(s =>
        `<option ${e && crop.stage===s?'selected':''}>${s}</option>`).join('')}</select>
    </div>
    <div class="field"><label>Progress %</label><input type="number" id="cpr" min="0" max="100" value="${e ? crop.progress : 15}"></div>
    <div class="field"><label>Irrigation</label>
      <select id="ci">${['Drip','Sprinkler','Flood','Manual','Rainfed'].map(i =>
        `<option ${e && crop.irrigation===i?'selected':''}>${i}</option>`).join('')}</select>
    </div>
  `, `<button class="btn-soft" id="mc">Cancel</button><button class="btn-orange" id="ms">${e ? 'Save' : 'Add'}</button>`);
  document.getElementById('mc').onclick = () => Modal.close();
  document.getElementById('ms').onclick = () => {
    const name = document.getElementById('cn').value.trim();
    const acres = parseFloat(document.getElementById('ca').value);
    const planted = document.getElementById('cp').value;
    if (!name || !acres || !planted) { toast('Fill required fields'); return; }
    const row = {
      id: e ? crop.id : uid(), name, acres, planted,
      harvest: document.getElementById('ch').value,
      stage: document.getElementById('cs').value,
      progress: parseInt(document.getElementById('cpr').value) || 0,
      irrigation: document.getElementById('ci').value
    };
    if (e) { const i = S.crops.findIndex(c => c.id === crop.id); S.crops[i] = row; }
    else S.crops.push(row);
    persist(); Modal.close(); toast(e ? 'Updated' : 'Crop added'); renderCrops();
  };
}

function renderPlan() {
  const d = S.calMonth;
  const y = d.getFullYear(), m = d.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const first = new Date(y, m, 1).getDay();
  const today = day(0);
  let cells = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h => `<div class="hd">${h}</div>`).join('');
  const prev = new Date(y, m, 0).getDate();
  for (let i = first - 1; i >= 0; i--) cells += `<div class="cal-cell out"><div class="n">${prev - i}</div></div>`;
  for (let dayN = 1; dayN <= dim; dayN++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(dayN).padStart(2,'0')}`;
    const evs = S.activities.filter(a => a.date === ds);
    cells += `<div class="cal-cell ${ds===today?'today':''}"><div class="n">${dayN}</div>
      ${evs.slice(0,2).map(a => `<div class="ev">${esc(a.title)}</div>`).join('')}</div>`;
  }
  const up = S.activities.filter(a => a.date >= today).sort((a,b) => a.date.localeCompare(b.date)).slice(0, 8);

  document.getElementById('content').innerHTML = `
    <div class="page-head">
      <div><h1>Plan</h1><p>Field activities</p></div>
      <button class="btn-orange" id="addAct">+ Activity</button>
    </div>
    <div class="plan-layout">
      <div class="section-card">
        <div class="section-head">
          <div class="cal-nav">
            <button class="icon-round" id="cp" style="width:32px;height:32px"><i data-lucide="chevron-left"></i></button>
            <span>${monthName(d)}</span>
            <button class="icon-round" id="cn" style="width:32px;height:32px"><i data-lucide="chevron-right"></i></button>
          </div>
          <button class="btn-soft" id="ct">Today</button>
        </div>
        <div class="cal-grid">${cells}</div>
      </div>
      <div class="section-card">
        <div class="section-head"><h2 style="font-size:0.95rem">Upcoming</h2></div>
        ${up.length ? up.map(a => {
          const c = S.crops.find(x => x.id === a.cropId);
          return `<div class="act-item">
            <div class="when">${shortD(a.date)}</div>
            <div class="what"><strong>${esc(a.title)}</strong><span>${c ? esc(c.name) : a.type}</span></div>
            <button class="icon-round" data-ad="${a.id}" style="width:28px;height:28px;border:none"><i data-lucide="trash-2"></i></button>
          </div>`;
        }).join('') : '<p style="font-size:0.85rem;color:var(--faint)">No upcoming activities</p>'}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();
  document.getElementById('cp').onclick = () => { S.calMonth.setMonth(S.calMonth.getMonth()-1); renderPlan(); };
  document.getElementById('cn').onclick = () => { S.calMonth.setMonth(S.calMonth.getMonth()+1); renderPlan(); };
  document.getElementById('ct').onclick = () => { S.calMonth = new Date(); renderPlan(); };
  document.getElementById('addAct').onclick = () => {
    Modal.open('Add activity', `
      <div class="field"><label>Title</label><input id="at"></div>
      <div class="field"><label>Date</label><input type="date" id="ad" value="${today}"></div>
      <div class="field"><label>Crop</label>
        <select id="ac"><option value="">—</option>${S.crops.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Type</label>
        <select id="aty">${['weeding','irrigation','planting','harvest','other'].map(t => `<option>${t}</option>`).join('')}</select>
      </div>
    `, `<button class="btn-soft" id="mc">Cancel</button><button class="btn-orange" id="ms">Save</button>`);
    document.getElementById('mc').onclick = () => Modal.close();
    document.getElementById('ms').onclick = () => {
      const title = document.getElementById('at').value.trim();
      const date = document.getElementById('ad').value;
      if (!title || !date) { toast('Required fields'); return; }
      S.activities.push({ id: uid(), title, date, cropId: document.getElementById('ac').value || null, type: document.getElementById('aty').value });
      persist(); Modal.close(); toast('Added'); renderPlan();
    };
  };
  document.querySelectorAll('[data-ad]').forEach(b => b.onclick = () => {
    S.activities = S.activities.filter(a => a.id !== b.dataset.ad);
    persist(); toast('Removed'); renderPlan();
  });
}

function renderAccount() {
  const p = S.profile;
  document.getElementById('content').innerHTML = `
    <div class="page-head"><div><h1>Account</h1><p>Profile & preferences</p></div></div>
    <div class="account-stack">
      <div class="section-card">
        <div class="section-head"><h2 style="font-size:0.95rem">Profile</h2></div>
        <div class="field"><label>Name</label><input id="pn" value="${esc(p.name)}"></div>
        <div class="field"><label>Email</label><input id="pe" value="${esc(p.email)}"></div>
        <div class="field"><label>Farm</label><input id="pf" value="${esc(p.farm)}"></div>
        <div class="field"><label>Location</label><input id="pl" value="${esc(p.location)}"></div>
        <button class="btn-orange" id="saveP">Save profile</button>
      </div>
      <div class="section-card">
        <div class="section-head"><h2 style="font-size:0.95rem">Preferences</h2></div>
        <div class="set-row">
          <span>Theme</span>
          <div class="radios">
            <label><input type="radio" name="th" value="light" ${S.theme==='light'?'checked':''}> Light</label>
            <label><input type="radio" name="th" value="dark" ${S.theme==='dark'?'checked':''}> Dark</label>
          </div>
        </div>
        <div class="set-row">
          <span>Temperature</span>
          <div class="radios">
            <label><input type="radio" name="un" value="C" ${S.unit==='C'?'checked':''}> °C</label>
            <label><input type="radio" name="un" value="F" ${S.unit==='F'?'checked':''}> °F</label>
          </div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-head"><h2 style="font-size:0.95rem">Station</h2></div>
        <div class="set-row"><span>Status</span><span style="color:var(--green);font-weight:700">Online</span></div>
        <div class="set-row"><span>ID</span><span>AGRO-001</span></div>
        <div class="set-row"><span>Last update</span><span>${S.weather.updated.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span></div>
      </div>
    </div>
  `;
  document.getElementById('saveP').onclick = () => {
    S.profile = {
      name: document.getElementById('pn').value.trim() || 'Farmer',
      email: document.getElementById('pe').value.trim(),
      farm: document.getElementById('pf').value.trim(),
      location: document.getElementById('pl').value.trim()
    };
    persist();
    document.getElementById('userName').textContent = S.profile.name;
    toast('Saved');
  };
  document.querySelectorAll('input[name="th"]').forEach(r => {
    r.onchange = () => { S.theme = r.value; applyTheme(); persist(); toast('Theme updated'); };
  });
  document.querySelectorAll('input[name="un"]').forEach(r => {
    r.onchange = () => { S.unit = r.value; persist(); toast('Unit updated'); };
  });
}
