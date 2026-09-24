const KEY = 'aw_v4';
const uid = () => 'id' + Math.random().toString(36).slice(2, 9);
const day = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(p) {
  localStorage.setItem(KEY, JSON.stringify({ ...load(), ...p }));
}

const S = {
  authed: false,
  theme: 'light',
  unit: 'C',
  page: 'home',
  profile: { name: 'Farmer', email: 'farmer@example.com', farm: 'Green Valley', location: 'Kisii, Kenya' },
  crops: [],
  activities: [],
  weather: null,
  forecast: [],
  history: [],
  calMonth: new Date()
};

function boot() {
  const s = load();
  if (s.theme) S.theme = s.theme;
  if (s.unit) S.unit = s.unit;
  if (s.profile) Object.assign(S.profile, s.profile);
  if (s.crops) S.crops = s.crops;
  if (s.activities) S.activities = s.activities;
  if (s.authed) S.authed = true;

  if (!S.crops.length) {
    S.crops = [
      { id: 'c1', name: 'Maize', acres: 2.5, planted: day(-55), harvest: day(40), stage: 'Growing', progress: 48, irrigation: 'Drip' },
      { id: 'c2', name: 'Kidney Beans', acres: 1.2, planted: day(-35), harvest: day(18), stage: 'Flowering', progress: 70, irrigation: 'Sprinkler' },
      { id: 'c3', name: 'Tomatoes', acres: 0.8, planted: day(-30), harvest: day(25), stage: 'Fruiting', progress: 58, irrigation: 'Drip' }
    ];
  }
  if (!S.activities.length) {
    S.activities = [
      { id: 'a1', title: 'Weed maize', cropId: 'c1', date: day(1), type: 'weeding' },
      { id: 'a2', title: 'Irrigate tomatoes', cropId: 'c3', date: day(2), type: 'irrigation' },
      { id: 'a3', title: 'Check beans', cropId: 'c2', date: day(4), type: 'other' }
    ];
  }

  S.weather = {
    temp: 22, humidity: 72, rainfall: 0, wind: 3.4, windDir: 'NE',
    pressure: 1012, visibility: 4.3, condition: 'Partly cloudy',
    min: 15, max: 27, isDay: true, ldr: 820, updated: new Date(),
    uvi: 6, aqi: 42, sunrise: '06:45', sunset: '18:30'
  };
  S.forecast = [
    { date: day(1), condition: 'Partly cloudy', icon: 'cloud-sun', max: 23, min: 15, rain: 20 },
    { date: day(2), condition: 'Sunny', icon: 'sun', max: 25, min: 16, rain: 5 },
    { date: day(3), condition: 'Light rain', icon: 'cloud-rain', max: 21, min: 14, rain: 65 },
    { date: day(4), condition: 'Sunny', icon: 'sun', max: 24, min: 15, rain: 10 },
    { date: day(5), condition: 'Cloudy', icon: 'cloud', max: 22, min: 14, rain: 30 },
    { date: day(6), condition: 'Light rain', icon: 'cloud-rain', max: 20, min: 13, rain: 55 },
    { date: day(7), condition: 'Sunny', icon: 'sun', max: 24, min: 15, rain: 8 }
  ];
  S.history = [
    { label: 'Morning', temp: 20, icon: 'cloud' },
    { label: 'Afternoon', temp: 27, icon: 'sun' },
    { label: 'Evening', temp: 24, icon: 'cloud-sun' },
    { label: 'Night', temp: 18, icon: 'moon' }
  ];
  applyTheme();
}

function persist() {
  save({ theme: S.theme, unit: S.unit, profile: S.profile, crops: S.crops, activities: S.activities, authed: S.authed });
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', S.theme);
  const ic = document.getElementById('themeIcon');
  if (ic) {
    ic.setAttribute('data-lucide', S.theme === 'dark' ? 'moon' : 'sun');
    if (window.lucide) lucide.createIcons();
  }
}

function toF(c) { return c * 9 / 5 + 32; }
function T(c) {
  const v = S.unit === 'F' ? Math.round(toF(c)) : Math.round(c);
  return v + '°';
}
function TF(c) {
  const v = S.unit === 'F' ? Math.round(toF(c) * 10) / 10 : Math.round(c * 10) / 10;
  return v + (S.unit === 'F' ? '°F' : '°C');
}
function shortD(s) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function dow(s) {
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
}
function fmtDate(s) {
  if (!s) return '—';
  return new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function monthName(d) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function insights() {
  const w = S.weather, crops = S.crops, f = S.forecast, out = [];
  if (w.rainfall === 0 && w.humidity < 70) {
    out.push({ t: 'Irrigation', d: 'Soil may be drying. Check moisture on irrigated fields.', warn: false, icon: 'droplets' });
  } else {
    out.push({ t: 'Irrigation OK', d: 'Moisture conditions look fine for now.', warn: false, icon: 'droplets' });
  }
  if (f.filter(x => x.rain < 30).length >= 3) {
    const g = crops.find(c => ['Growing', 'Flowering'].includes(c.stage));
    if (g) out.push({ t: 'Weeding window', d: `Dry days ahead — good time to weed ${g.name}.`, warn: false, icon: 'leaf' });
  }
  crops.forEach(c => {
    if (c.progress >= 65) {
      const days = c.harvest ? Math.ceil((new Date(c.harvest) - new Date()) / 864e5) : 14;
      if (days > 0 && days < 25) out.push({ t: `Harvest · ${c.name}`, d: `Window opens in about ${Math.max(days, 5)} days.`, warn: true, icon: 'wheat' });
    }
  });
  const wet = f.find(x => x.rain >= 55);
  if (wet) out.push({ t: 'Rain coming', d: `Higher rain chance around ${shortD(wet.date)}. Plan accordingly.`, warn: true, icon: 'cloud-rain' });
  return out.slice(0, 4);
}
