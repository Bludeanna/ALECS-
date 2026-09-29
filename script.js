/* =============================================
   ALECS: script.js
   A Supplementary Mobile Learning App for Grade 10 Physics
   ============================================= */

/* ── CONSTANTS ── */
// XP cumulative thresholds per level (index = level number)
// Each level requires 350 XP to advance. Only perfect scorers reach level 5
const XP_PER_LEVEL = 350;
const LEVEL_THRESHOLDS = [0, 0, 350, 700, 1050, 1400];
const MAX_LEVEL = 5;

// Deep-link each game to its lesson's Phase 3
// Each lesson page checks localStorage for 'alecs_goto_phase' on load and auto-navigates
const GAME_LINKS = {
  1: 'lesson1.html?phase=3',
  2: 'lesson2.html?phase=3',
  3: 'lesson3.html?phase=3',
  4: 'lesson4.html?phase=3',
};


/* ── PHYSICS / ENERGY MOTIVATIONAL CHEERS ── */
const PHYSICS_CHEERS = [
  "⚡ Energy can't be destroyed, keep it going!",
  "🚀 Every expert was once a beginner. Launch yourself!",
  "🔥 You've got potential energy, convert it into action!",
  "💥 Like momentum: the more you learn, the harder you are to stop!",
  "🌊 Stay in motion. Newton says objects in motion stay in motion!",
  "⚛️ Small efforts compound like quantum leaps. Keep going!",
  "🎯 Aim at 45°, that's the angle for maximum range!",
  "🌟 Gravity brings things down; your curiosity lifts you up!",
  "💡 Every light bulb moment starts with a spark of effort!",
  "🔬 Science is not a destination, it's the most exciting journey!",
  "🏋️ Your brain is like a muscle, every lesson makes it stronger!",
  "⚡ Voltage rises with effort, charge up and push forward!",
];
function getPhysicsCheer() {
  // Main interface: always randomize (different each open)
  return PHYSICS_CHEERS[Math.floor(Math.random() * PHYSICS_CHEERS.length)];
}
function renderQuote() {
  const cheer = getPhysicsCheer();
  const el = document.getElementById('streak-pill');
  if (el) { el.textContent = cheer; el.style.cssText = 'font-size:11px;color:var(--text-secondary);font-style:italic;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:380px'; }
}

/* ── SAVE SLOTS ── */
const MAX_SAVES = 100;
function getSaveSlots() { try { return JSON.parse(localStorage.getItem('alecs_saves')||'[]'); } catch { return []; } }
function writeSaves(s)  { localStorage.setItem('alecs_saves', JSON.stringify(s)); }

function createSave(label) {
  const u = loadUser();
  const slots = getSaveSlots();
  if (slots.length >= MAX_SAVES) { showToast('Max ' + MAX_SAVES + ' saves reached. Delete one first.'); return false; }
  const snap = {
    id: Date.now(),
    label: label || ('Save ' + (slots.length + 1)),
    savedAt: new Date().toISOString(),
    name: u.name, avatar: u.avatar, xp: u.xp,
    level: getLevel(u),
    streak: u.streak,
    lessons: JSON.parse(JSON.stringify(u.lessons)),
    scores: JSON.parse(JSON.stringify(u.scores || {})),
    unlockedAchievements: u.unlockedAchievements ? [...u.unlockedAchievements] : [],
    lesson1: u.lesson1 ? JSON.parse(JSON.stringify(u.lesson1)) : undefined,
    lesson2: u.lesson2 ? JSON.parse(JSON.stringify(u.lesson2)) : undefined,
    lesson3: u.lesson3 ? JSON.parse(JSON.stringify(u.lesson3)) : undefined,
    lesson4: u.lesson4 ? JSON.parse(JSON.stringify(u.lesson4)) : undefined,
  };
  slots.push(snap);
  writeSaves(slots);
  showToast('💾 Game saved!');
  return true;
}
function loadSave(id) {
  const snap = getSaveSlots().find(s => s.id === id);
  if (!snap) { showToast('Save not found.'); return; }
  let u = loadUser();
  u.name = snap.name; u.avatar = snap.avatar; u.xp = snap.xp;
  u.level = snap.level; u.streak = snap.streak || 0;
  u.lessons = JSON.parse(JSON.stringify(snap.lessons));
  u.scores  = JSON.parse(JSON.stringify(snap.scores || {}));
  u.unlockedAchievements = snap.unlockedAchievements ? [...snap.unlockedAchievements] : [];
  ['lesson1','lesson2','lesson3','lesson4'].forEach(k => {
    if (snap[k]) u[k] = JSON.parse(JSON.stringify(snap[k]));
  });
  saveUser(u);
  showToast('✅ Save loaded!');
  setTimeout(() => location.reload(), 800);
}
function deleteSave(id) {
  writeSaves(getSaveSlots().filter(s => s.id !== id));
  renderSaveModal();
  showToast('🗑️ Save deleted.');
}
function quickSave() {
  const u = loadUser();
  const label = (u.name !== 'N/A' ? u.name : 'Player') + ' · ' + new Date().toLocaleDateString('en-PH',{month:'short',day:'numeric'});
  if (createSave(label)) renderSaveModal();
}
window.loadSave   = loadSave;
window.deleteSave = deleteSave;
window.quickSave  = quickSave;

function openSaveModal() {
  renderSaveModal();
  document.getElementById('save-modal').style.display = 'flex';
}
function closeSaveModal() {
  document.getElementById('save-modal').style.display = 'none';
}
window.openSaveModal  = openSaveModal;
window.closeSaveModal = closeSaveModal;

function renderSaveModal() {
  const wrap = document.getElementById('save-slots-wrap');
  if (!wrap) return;
  const u = loadUser();
  const slots = getSaveSlots();
  const done = [1,2,3,4].filter(n => u.lessons[n].pct >= 100).length;
  let html = `<div style="margin-bottom:14px;padding:12px;background:var(--navy-darkest,#16151a);border-radius:10px;border:1px solid rgba(255,255,255,.07)">
    <div style="font-size: .75rem;font-weight:800;letter-spacing:1px;color:#7d93a8;text-transform:uppercase;margin-bottom:8px">CURRENT PROGRESS</div>
    <div style="display:flex;gap:8px;margin-bottom:10px">
      ${[1,2,3,4].map(n=>`<div style="flex:1;background:#2b2831;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size: .73rem;color:#7d93a8;margin-bottom:2px">L${n}</div>
        <div style="font-weight:800;font-size:.88rem;color:${u.lessons[n].pct>=100?'#22c55e':u.lessons[n].unlocked?'#f97316':'#7d93a8'}">${u.lessons[n].unlocked?u.lessons[n].pct+'%':'🔒'}</div>
      </div>`).join('')}
    </div>
    <button onclick="quickSave()" style="width:100%;padding:9px;background:linear-gradient(135deg,#f97316,#fb923c);color:white;border:none;border-radius:9px;font-family:inherit;font-weight:800;font-size:.85rem;cursor:pointer">💾 Quick Save</button>
  </div>
  <div style="font-size: .75rem;font-weight:800;letter-spacing:1px;color:#7d93a8;text-transform:uppercase;margin-bottom:8px">SAVE FILES (${slots.length}/${MAX_SAVES})</div>`;
  if (!slots.length) {
    html += `<div style="text-align:center;padding:20px;color:#7d93a8;font-size:.85rem">No saves yet. Click Quick Save above.</div>`;
  } else {
    slots.forEach(s => {
      const d = new Date(s.savedAt);
      const ds = d.toLocaleDateString('en-PH',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
      const sc = s.scores || {};
      const avBg = s.avatar && s.avatar > 0 ? `hsl(${(s.avatar*37)%360},50%,32%)` : '#f97316';
      const avTxt = s.avatar && s.avatar > 0 ? s.avatar : (s.name||'?').slice(0,2).toUpperCase();
      html += `<div style="background:#2b2831;border:1px solid rgba(255,255,255,.1);border-radius:11px;padding:12px;margin-bottom:8px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:34px;height:34px;border-radius:50%;background:${avBg};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${s.avatar&&s.avatar>0?'13px':'11px'};color:white;flex-shrink:0">${avTxt}</div>
            <div>
              <strong style="font-size:.88rem">${s.label}</strong>
              <small style="display:block;font-size: .74rem;color:#7d93a8">${ds} · Lv${s.level} · ${s.xp} XP</small>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button onclick="loadSave(${s.id})" style="padding:5px 11px;background:rgba(249,115,22,.15);border:1px solid rgba(249,115,22,.4);color:#f97316;border-radius:7px;font-family:inherit;font-weight:800;font-size:.72rem;cursor:pointer">▶ Load</button>
            <button onclick="deleteSave(${s.id})" style="padding:5px 9px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#ef4444;border-radius:7px;font-family:inherit;font-weight:800;font-size:.72rem;cursor:pointer">✕</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px">
          ${[1,2,3,4].map(n=>{
            const lsc = sc[n]||{};
            const pct = s.lessons[n]?.pct||0;
            return `<div style="background:#16151a;border-radius:7px;padding:6px;font-size: .73rem;text-align:center">
              <div style="color:#7d93a8;font-weight:800;margin-bottom:2px">L${n}</div>
              <div style="font-weight:800;color:${pct>=100?'#22c55e':s.lessons[n]?.unlocked?'#f97316':'#7d93a8'}">${s.lessons[n]?.unlocked?pct+'%':'🔒'}</div>
              <div style="color:#38bdf8;margin-top:1px">${lsc.kcScore!=null&&lsc.kcTotal?'KC:'+lsc.kcScore+'/'+lsc.kcTotal:'KC:—'}</div>
              <div style="color:#a78bfa;margin-top:1px">${'Cn:'+(lsc.conceptScore!=null?lsc.conceptScore+'%':'0%')}</div>
              <div style="color:#facc15;margin-top:1px">${'Gm:'+(lsc.gameScore!=null?lsc.gameScore+'%':'0%')}</div>
              <div style="color:#34d399;margin-top:1px">${'An:'+(lsc.analysisScore!=null?lsc.analysisScore+'%':'0%')}</div>
              ${lsc.quizScore?`<div style="color:#f97316;margin-top:1px">Qz:${lsc.quizScore}/${lsc.quizTotal||10}</div>`:'<div style="color:#7d93a8;margin-top:1px">Qz:—</div>'}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    });
  }
  wrap.innerHTML = html;
}
const ALL_ACHIEVEMENTS = [
  { id:'lvl2',    icon:'⚡', name:'Rising Star',      desc:'Reached Level 2',           type:'level',  req: u => getLevel(u) >= 2 },
  { id:'lvl3',    icon:'🔥', name:'On Fire',           desc:'Reached Level 3',           type:'level',  req: u => getLevel(u) >= 3 },
  { id:'lvl4',    icon:'💎', name:'Knowledge Seeker',  desc:'Reached Level 4',           type:'level',  req: u => getLevel(u) >= 4 },
  { id:'lvl5',    icon:'🏆', name:'Physics Master',    desc:'Reached MAX Level 5',       type:'level',  req: u => getLevel(u) >= 5 },
  { id:'l1done',  icon:'🚀', name:'Projectile Pro',    desc:'Completed Lesson 1 (100%)', type:'lesson', req: u => u.lessons[1].pct >= 100 },
  { id:'l2done',  icon:'💥', name:'Momentum Master',   desc:'Completed Lesson 2 (100%)', type:'lesson', req: u => u.lessons[2].pct >= 100 },
  { id:'l3done',  icon:'⚡', name:'Electricity Expert',desc:'Completed Lesson 3 (100%)', type:'lesson', req: u => u.lessons[3].pct >= 100 },
  { id:'l4done',  icon:'🌿', name:'Eco Champion',      desc:'Completed Lesson 4 (100%)', type:'lesson', req: u => u.lessons[4].pct >= 100 },
  { id:'alldone', icon:'🌟', name:'ALECS Graduate',    desc:'Completed all 4 lessons',   type:'lesson', req: u => [1,2,3,4].every(n => u.lessons[n].pct >= 100) },
];

/* ── STORAGE ── */
function getDefaultUser() {
  return {
    name: 'N/A', avatar: 0, xp: 0, level: 1, streak: 0,
    lastLoginDate: null, unlockedAchievements: [],
    lessons: {
      1: { pct: 0, unlocked: true  },
      2: { pct: 0, unlocked: false },
      3: { pct: 0, unlocked: false },
      4: { pct: 0, unlocked: false },
    },
    scores: {
      1: { kcScore:0, kcTotal:5, conceptScore:0, gameScore:0, analysisScore:0, quizScore:0, quizTotal:10 },
      2: { kcScore:0, kcTotal:5, conceptScore:0, gameScore:0, analysisScore:0, quizScore:0, quizTotal:10 },
      3: { kcScore:0, kcTotal:5, conceptScore:0, gameScore:0, analysisScore:0, quizScore:0, quizTotal:10 },
      4: { kcScore:0, kcTotal:5, conceptScore:0, gameScore:0, analysisScore:0, quizScore:0, quizTotal:10 },
    },
  };
}

function loadUser() {
  try {
    const u = JSON.parse(localStorage.getItem('alecs_user') || 'null');
    if (!u) return getDefaultUser();
    if (u.avatar === undefined) u.avatar = 0;
    if (!u.unlockedAchievements) u.unlockedAchievements = [];
    if (!u.scores) u.scores = getDefaultUser().scores;
    // Ensure all score slots exist and bridge legacy lesson-level data
    [1,2,3,4].forEach(n => {
      if (!u.scores[n]) u.scores[n] = {kcScore:0,kcTotal:5,conceptScore:0,gameScore:0,analysisScore:0,quizScore:0,quizTotal:10};
      const leg = u['lesson'+n];
      if (leg) {
        if (!u.scores[n].quizScore && leg.quizScore) u.scores[n].quizScore = leg.quizScore;
        if (!u.scores[n].kcScore   && leg.kcScore)   u.scores[n].kcScore   = leg.kcScore;
      }
    });
    return u;
  } catch { return getDefaultUser(); }
}
function saveUser(u) { localStorage.setItem('alecs_user', JSON.stringify(u)); }

/* ── STREAK ── */
function todayStr() { return new Date().toISOString().slice(0,10); }
function updateStreak(u) {
  const today = todayStr();
  if (!u.lastLoginDate) { u.streak = 1; u.lastLoginDate = today; return u; }
  const diff = Math.round((new Date(today) - new Date(u.lastLoginDate)) / 86400000);
  if (diff === 0) return u;
  u.streak = diff === 1 ? u.streak + 1 : 1;
  u.lastLoginDate = today;
  return u;
}

/* ── XP & LEVEL ── */
function getLevel(u)   { return Math.min(MAX_LEVEL, Math.max(1, u.level || 1)); }
function xpInLevel(u)  { return u.xp || 0; }
function xpForNext(u)  { return getLevel(u) >= MAX_LEVEL ? 0 : XP_PER_LEVEL; }
function xpPct(u)      { return getLevel(u) >= MAX_LEVEL ? 100 : Math.min(((u.xp||0) / XP_PER_LEVEL) * 100, 100); }

function addXP(u, amount) {
  const prev = getLevel(u);
  u.xp = Math.max(0, (u.xp || 0) + amount);
  while (u.xp >= XP_PER_LEVEL && u.level < MAX_LEVEL) { u.xp -= XP_PER_LEVEL; u.level++; }
  u.level = getLevel(u);
  if (u.level > prev) showLevelUp(u.level);
  return u;
}

/* ── PROGRESS ── */
function overallPct(u) { return Math.round(([1,2,3,4].reduce((s,n) => s + u.lessons[n].pct, 0)) / 4); }
function doneLessons(u) { return [1,2,3,4].filter(n => u.lessons[n].pct >= 100).length; }
function setLessonPct(u, n, pct) {
  u.lessons[n].pct = Math.min(Math.max(pct, 0), 100);
  if (pct >= 100 && u.lessons[n+1]) u.lessons[n+1].unlocked = true;
  return u;
}

/* ── TOAST ── */
function showToast(msg, duration = 3000) {
  let t = document.getElementById('alecs-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'alecs-toast';
    t.style.cssText = `position:fixed;bottom:26px;left:50%;transform:translateX(-50%) translateY(60px);
      background:#2b2831;border:1px solid rgba(249,115,22,.5);color:#f0f6ff;padding:11px 22px;
      border-radius:99px;font-family:'Atkinson Hyperlegible',sans-serif;font-weight:700;font-size:13px;
      z-index:10001;transition:transform .25s,opacity .25s;opacity:0;pointer-events:none;white-space:nowrap`;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.transform = 'translateX(-50%) translateY(0)'; t.style.opacity = '1'; });
  clearTimeout(t._tid);
  t._tid = setTimeout(() => { t.style.transform = 'translateX(-50%) translateY(60px)'; t.style.opacity = '0'; }, duration);
}

/* ── LEVEL-UP POPUP ── */
function showLevelUp(lvl) {
  const p = document.getElementById('levelup-popup');
  if (!p) return;
  document.getElementById('levelup-text').textContent = `⚡ Level ${lvl}!`;
  document.getElementById('levelup-sub').textContent = lvl >= MAX_LEVEL
    ? '🏆 Maximum level reached. Physics Master!'
    : `Keep earning XP to reach Level ${lvl + 1}!`;
  p.style.display = 'block';
  requestAnimationFrame(() => p.classList.add('show'));
  setTimeout(() => { p.classList.remove('show'); setTimeout(() => { p.style.display = 'none'; }, 300); }, 3000);
}

/* ── ACHIEVEMENTS ── */
function checkAchievements(u) {
  ALL_ACHIEVEMENTS.forEach(a => {
    if (!u.unlockedAchievements.includes(a.id) && a.req(u)) {
      u.unlockedAchievements.push(a.id);
      setTimeout(() => showToast(`${a.icon} Achievement: ${a.name}!`, 4000), 600);
    }
  });
  return u;
}

function openAchievementsModal() {
  const u = loadUser();
  const grid = document.getElementById('achievements-grid');
  const modal = document.getElementById('achievements-modal');
  if (!grid || !modal) return;
  const unlocked = new Set(u.unlockedAchievements);
  const groups = { level:'⚡ Level', lesson:'📚 Lesson' };
  let html = '';
  Object.entries(groups).forEach(([type, label]) => {
    const items = ALL_ACHIEVEMENTS.filter(a => a.type === type);
    html += `<div style="font-size: .75rem;font-weight:800;letter-spacing:1px;color:var(--text-muted);margin:12px 0 7px;text-transform:uppercase">${label} Achievements</div>`;
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">`;
    items.forEach(a => {
      const done = unlocked.has(a.id);
      html += `<div style="display:flex;align-items:center;gap:9px;padding:9px 11px;background:${done?'rgba(249,115,22,.1)':'rgba(255,255,255,.04)'};border:1px solid ${done?'rgba(249,115,22,.3)':'rgba(255,255,255,.06)'};border-radius:10px;${done?'':'opacity:.4'}">
        <span style="font-size:1.3rem">${done?a.icon:'🔒'}</span>
        <div><strong style="display:block;font-size:.78rem;color:${done?'var(--text-primary)':'var(--text-muted)'}">${a.name}</strong>
        <small style="font-size: .75rem;color:var(--text-muted)">${a.desc}</small></div></div>`;
    });
    html += `</div>`;
  });
  grid.innerHTML = html;
  modal.style.display = 'flex';
}
function closeAchievementsModal() { document.getElementById('achievements-modal').style.display = 'none'; }
window.openAchievementsModal = openAchievementsModal;
window.closeAchievementsModal = closeAchievementsModal;

/* ── PROFILE ── */
let _selectedAvatar = 0;

function openProfileModal() {
  const u = loadUser();
  _selectedAvatar = u.avatar || 0;
  document.getElementById('prof-name-input').value = u.name === 'N/A' ? '' : u.name;
  document.getElementById('prof-level-preview').textContent = getLevel(u);
  buildAvatarGrid(_selectedAvatar);
  updateProfilePreview();
  document.getElementById('profile-modal').style.display = 'flex';
}
function closeProfileModal() { document.getElementById('profile-modal').style.display = 'none'; }
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

function buildAvatarGrid(selected) {
  const grid = document.getElementById('avatar-picker-grid');
  if (!grid) return;
  grid.innerHTML = '';
  // Option 0: initials
  const init = document.createElement('button');
  init.className = 'av-btn' + (selected === 0 ? ' av-selected' : '');
  init.textContent = 'AB'; init.title = 'Use initials';
  init.onclick = () => { _selectedAvatar = 0; buildAvatarGrid(0); updateProfilePreview(); };
  grid.appendChild(init);
  for (let i = 1; i <= 100; i++) {
    const b = document.createElement('button');
    b.className = 'av-btn' + (selected === i ? ' av-selected' : '');
    b.textContent = i; b.title = `Avatar ${i}`;
    b.onclick = () => { _selectedAvatar = i; buildAvatarGrid(i); updateProfilePreview(); };
    grid.appendChild(b);
  }
}

function updateProfilePreview() {
  const name = (document.getElementById('prof-name-input').value.trim()) || 'Your Name';
  document.getElementById('prof-name-preview').textContent = name;
  const el = document.getElementById('prof-avatar-preview');
  if (!el) return;
  if (_selectedAvatar === 0) {
    el.textContent = name.slice(0,2).toUpperCase();
    el.style.cssText = `background:var(--orange);font-size:20px`;
  } else {
    el.textContent = _selectedAvatar;
    el.style.cssText = `background:hsl(${(_selectedAvatar * 37) % 360},50%,32%);font-size:18px`;
  }
}
window.updateProfilePreview = updateProfilePreview;

function saveProfile() {
  let u = loadUser();
  const name = document.getElementById('prof-name-input').value.trim();
  u.name = name || 'N/A';
  u.avatar = _selectedAvatar;
  saveUser(u);
  closeProfileModal();
  renderDashboard(u);
  showToast('✅ Profile saved!');
}
window.saveProfile = saveProfile;

/* ── AVATAR APPLY ── */
function applyAvatar(el, u) {
  if (!el) return;
  if (u.avatar && u.avatar > 0) {
    el.textContent = u.avatar;
    el.style.fontSize = '13px';
    el.style.fontWeight = '900';
    el.style.background = `hsl(${(u.avatar * 37) % 360},50%,32%)`;
    el.style.color = 'white';
  } else {
    el.textContent = (u.name || '?').slice(0,2).toUpperCase();
    el.style.fontSize = '12px';
    el.style.background = 'var(--orange)';
    el.style.color = 'white';
  }
}

/* ── PROGRESS RING ── */
function renderRing(pct) {
  const fg = document.querySelector('.ring-fg');
  if (fg) fg.style.strokeDashoffset = 239 - (pct / 100) * 239;
}

/* ── VIEW SWITCHING ── */
function showView(viewId) {
  document.querySelectorAll('.main-view').forEach(v => v.classList.remove('active'));
  const t = document.getElementById('view-' + viewId);
  if (t) t.classList.add('active');
  if (viewId === 'lessons') syncLessonView();
  if (viewId === 'games')   syncGamesView();
  if (viewId === 'progress') renderProgressDetail();
}
window.showView = showView;

function setActiveNav(el) {
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}
window.setActiveNav = setActiveNav;

function setActiveMenu(el) {
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  closeMobileMenu();
}
window.setActiveMenu = setActiveMenu;

function toggleMobileMenu() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mobile-menu-backdrop');
  if (!sb || !bd) return;
  const opening = !sb.classList.contains('mobile-open');
  sb.classList.toggle('mobile-open', opening);
  bd.classList.toggle('show', opening);
}
window.toggleMobileMenu = toggleMobileMenu;

function closeMobileMenu() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mobile-menu-backdrop');
  if (sb) sb.classList.remove('mobile-open');
  if (bd) bd.classList.remove('show');
}
window.closeMobileMenu = closeMobileMenu;

/* ── GAME LAUNCH (deep-link to Phase 3) ── */
function launchGame(n) {
  const u = loadUser();
  if (!u.lessons[n] || !u.lessons[n].unlocked) { showToast('🔒 Complete the previous lesson first!'); return; }
  if ((u.lessons[n].pct || 0) < 100) { showToast('🔒 Finish the lesson first before playing the game!'); return; }
  window.location.href = GAME_LINKS[n];
}
window.launchGame = launchGame;

/* ── LESSON SUMMARY VIEW ── */
function syncLessonView() {
  const u = loadUser();
  [1,2,3,4].forEach(n => {
    const pct = u.lessons[n].pct;
    const unlocked = u.lessons[n].unlocked;
    const pctEl  = document.getElementById('lsc-pct-'  + n);
    const fillEl = document.getElementById('lsc-fill-' + n);
    const tagEl  = document.getElementById('lsc-tag-'  + n);
    const card   = document.getElementById('lscard-'   + n);
    if (pctEl)  pctEl.textContent = pct + '%';
    if (fillEl) fillEl.style.width = pct + '%';
    if (n > 1 && card && unlocked) {
      card.classList.remove('locked-summary');
      card.onclick = () => window.location.href = 'lesson' + n + '.html';
      if (tagEl) { tagEl.className = 'lsc-tag'; tagEl.textContent = `LESSON 0${n} · ${pct >= 100 ? 'Complete ✓' : 'In Progress'}`; }
      card.querySelectorAll('.lsc-title-muted,.lsc-desc-muted,.lsc-pct-muted').forEach(e => {
        e.classList.remove('lsc-title-muted','lsc-desc-muted','lsc-pct-muted');
      });
      card.querySelectorAll('.muted-tag').forEach(e => e.classList.remove('muted-tag'));
    }
  });
}

/* ── GAMES VIEW ── */
function syncGamesView() {
  const u = loadUser();
  [2,3,4].forEach(n => {
    if (!u.lessons[n] || !u.lessons[n].unlocked || (u.lessons[n].pct || 0) < 100) return;
    const card = document.getElementById('gcrd-' + n);
    if (!card) return;
    card.classList.remove('gc-locked');
    const badge = card.querySelector('.gc-badge');
    const title = card.querySelector('.gc-title');
    const emoji = card.querySelector('.gc-emoji');
    const tag   = card.querySelector('.gc-lesson-tag');
    const btn   = card.querySelector('.gc-play-btn');
    if (badge) { badge.innerHTML = '<span class="ic ic-check"></span> Playable'; badge.className = 'gc-badge gc-unlocked'; }
    if (title) title.style.color = '';
    if (emoji) emoji.style.opacity = '1';
    if (tag)   tag.style.opacity = '1';
    if (btn) {
      btn.className = 'gc-play-btn';
      btn.disabled = false;
      btn.textContent = '▶ Play';
      btn.onclick = () => launchGame(n);
    }
  });

  // Show scores on game cards
  const _scUser = loadUser();
  [1,2,3,4].forEach(n => {
    const scEl = document.getElementById('gc-score-' + n);
    if (!scEl) return;
    const sc = (_scUser.scores || {})[n] || {};
    const parts = [];
    if (_scUser.lessons[n] && _scUser.lessons[n].unlocked && sc.gameScore != null) parts.push('🎮 ' + sc.gameScore + '%');
    if (sc.quizScore > 0) parts.push('📝 ' + sc.quizScore + '/' + (sc.quizTotal||10));
    scEl.textContent = parts.join(' · ');
  });
}

/* ── PROGRESS DETAIL ── */
function renderProgressDetail() {
  const u = loadUser();
  const wrap = document.getElementById('progress-detail-wrap');
  if (!wrap) return;
  const LESSONS = {
    1:{icon:'🚀',title:'Projectile Motion',    phases:['Knowledge Check','Concepts','Basketball Game','Analysis','Final Quiz','Results']},
    2:{icon:'💥',title:'Momentum & Collisions', phases:['Knowledge Check','Concepts','Collision Lab','Analysis','Final Quiz','Results']},
    3:{icon:'⚡',title:'Electricity Generation',phases:['Knowledge Check','Concepts','Generator Sim','Analysis','Final Quiz','Results']},
    4:{icon:'🌿',title:'Energy Sources',         phases:['Knowledge Check','Sort & Match','Energy Simulator','Community App','Analysis','Final Quiz','Results']},
  };
  const ov = overallPct(u);
  let html = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:14px">
    <div style="background:var(--navy-card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
      <div style="font-size:1.9rem;font-family:'Fredoka',sans-serif;font-weight:800;color:var(--orange)">${ov}%</div>
      <div style="font-size:.74rem;color:var(--text-secondary);margin-top:3px">Overall Completion</div>
    </div>
    <div style="background:var(--navy-card);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
      <div style="font-size:1.9rem;font-family:'Fredoka',sans-serif;font-weight:800;color:var(--yellow)">Lvl ${getLevel(u)}</div>
      <div style="font-size:.74rem;color:var(--text-secondary);margin-top:3px">Current Level (Max ${MAX_LEVEL})</div>
    </div>
  </div>`;
  [1,2,3,4].forEach(n => {
    const info = LESSONS[n];
    const pct = u.lessons[n].pct;
    const unlocked = u.lessons[n].unlocked;
    const statusColor = pct >= 100 ? 'var(--green)' : unlocked ? 'var(--orange)' : 'var(--text-muted)';
    const statusLabel = pct >= 100 ? '✓ Complete' : unlocked ? `${pct}% In Progress` : '<span class="ic ic-lock"></span> Locked';
    html += `<div style="background:var(--navy-card);border:1px solid var(--border);border-radius:12px;padding:16px;${!unlocked?'opacity:.45':''}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:11px">
        <span style="font-size:1.3rem">${info.icon}</span>
        <div style="flex:1">
          <strong style="font-family:'Fredoka',sans-serif;font-size:.9rem">Lesson ${n}: ${info.title}</strong>
          <div style="font-size:.75rem;color:${statusColor};font-weight:700">${statusLabel}</div>
        </div>
      </div>
      <div style="height:5px;background:var(--navy-mid);border-radius:99px;overflow:hidden;margin-bottom:11px">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--orange),var(--yellow));border-radius:99px;transition:.5s"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:11px">
        <div style="background:var(--navy-mid,#2b2831);border-radius:8px;padding:8px;text-align:center"><div style="font-size: .72rem;color:var(--text-muted);font-weight:800;margin-bottom:2px">KC</div><div style="font-weight:800;color:#38bdf8;font-size:.85rem">${(u.scores||{})[n]&&(u.scores[n].kcTotal)?(u.scores[n].kcScore+'/'+u.scores[n].kcTotal):'—'}</div></div>
        <div style="background:var(--navy-mid,#2b2831);border-radius:8px;padding:8px;text-align:center"><div style="font-size: .72rem;color:var(--text-muted);font-weight:800;margin-bottom:2px">CONCEPT</div><div style="font-weight:800;color:#a78bfa;font-size:.85rem">${(u.scores||{})[n]?.conceptScore!=null?((u.scores||{})[n].conceptScore+'%'):'0%'}</div></div>
        <div style="background:var(--navy-mid,#2b2831);border-radius:8px;padding:8px;text-align:center"><div style="font-size: .72rem;color:var(--text-muted);font-weight:800;margin-bottom:2px">GAME</div><div style="font-weight:800;color:#facc15;font-size:.85rem">${(u.scores||{})[n]&&(u.scores[n].gameScore!=null)?((u.scores||{})[n].gameScore+'%'):'0%'}</div></div>
        <div style="background:var(--navy-mid,#2b2831);border-radius:8px;padding:8px;text-align:center"><div style="font-size: .72rem;color:var(--text-muted);font-weight:800;margin-bottom:2px">ANALYSIS</div><div style="font-weight:800;color:#34d399;font-size:.85rem">${(u.scores||{})[n]?.analysisScore!=null?((u.scores||{})[n].analysisScore+'%'):'0%'}</div></div>
        <div style="background:var(--navy-mid,#2b2831);border-radius:8px;padding:8px;text-align:center"><div style="font-size: .72rem;color:var(--text-muted);font-weight:800;margin-bottom:2px">QUIZ</div><div style="font-weight:800;color:#f97316;font-size:.85rem">${(u.scores||{})[n]&&u.scores[n].quizScore?(u.scores[n].quizScore+'/'+(u.scores[n].quizTotal||10)):'—'}</div></div>
      </div>
      <div style="font-size: .74rem;font-weight:800;color:var(--text-muted);letter-spacing:1px;margin-bottom:7px">PHASES</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px">`;
    info.phases.forEach((ph, i) => {
      const done = pct >= 100 || (pct > 0 && i === 0);
      html += `<span style="padding:3px 9px;border-radius:99px;font-size: .74rem;font-weight:700;background:${done?'rgba(34,197,94,.1)':'rgba(255,255,255,.04)'};color:${done?'var(--green)':'var(--text-muted)'};border:1px solid ${done?'rgba(34,197,94,.3)':'rgba(255,255,255,.06)'}">${done?'✓ ':''}${ph}</span>`;
    });
    html += `</div></div>`;
  });
  wrap.innerHTML = html;
}

/* ── LESSON CARDS ── */
function updateLessonCard(u, n) {
  const card = document.getElementById('card-lesson-' + n);
  if (!card) return;
  const pct = u.lessons[n].pct;
  const unlocked = u.lessons[n].unlocked;
  const fill = document.getElementById('fill-l' + n);
  const pctEl = document.getElementById('pct-l' + n);
  const sbStatus = document.getElementById('sidebar-l' + n + '-status');
  const pbVal = document.getElementById('pb-val-l' + n);
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (sbStatus) sbStatus.innerHTML = pct >= 100 ? 'Complete ✓' : unlocked ? pct + '%' : 'Locked <span class="ic ic-lock"></span>';
  if (pbVal) pbVal.innerHTML = pct >= 100 ? '✓' : unlocked ? pct + '%' : '<span class="ic ic-lock"></span>';
  if (unlocked) {
    card.className = 'lesson-card' + (pct >= 100 ? ' done' : '');
    card.onclick = () => window.location.href = 'lesson' + n + '.html';
    card.querySelectorAll('.muted').forEach(e => e.classList.remove('muted'));
    const badge = card.querySelector('.status-badge');
    if (badge) {
      badge.className = 'status-badge';
      badge.textContent = pct >= 100 ? '✓ Done' : '▶ Active';
      badge.style.background = pct >= 100 ? 'rgba(34,197,94,.2)' : 'rgba(249,115,22,.2)';
      badge.style.color = pct >= 100 ? 'var(--green)' : 'var(--orange)';
    }
    const sb = document.getElementById('sidebar-l' + n);
    if (sb) {
      sb.classList.remove('locked');
      sb.onclick = () => window.location.href = 'lesson' + n + '.html';
      const pill = sb.querySelector('.lesson-pill');
      if (pill) pill.classList.add('l' + n + '-pill');
    }
  }
}

/* ── MAIN RENDER ── */
function renderDashboard(u) {
  // Avatar
  applyAvatar(document.getElementById('user-initials'), u);
  // Name
  const nameEl = document.getElementById('user-name');
  if (nameEl) nameEl.textContent = u.name;
  // XP bar
  const lvl = getLevel(u);
  const el = id => document.getElementById(id);
  if (el('level-num'))   el('level-num').textContent   = lvl;
  if (el('xp-fill'))     el('xp-fill').style.width     = xpPct(u) + '%';
  if (el('xp-current'))  el('xp-current').textContent  = xpInLevel(u);
  if (el('xp-max'))      el('xp-max').textContent      = lvl >= MAX_LEVEL ? 'MAX' : xpForNext(u);
  renderQuote();
  // Sidebar lesson scores
  [1,2,3,4].forEach(n => {
    const scEl = document.getElementById('sidebar-score-l'+n);
    if (!scEl) return;
    const sc = (u.scores||{})[n]||{};
    scEl.textContent = sc.quizScore ? 'Quiz: '+sc.quizScore+'/'+(sc.quizTotal||10) : '';
  });
  // Newton
  if (el('newton-username')) el('newton-username').textContent = u.name;
  if (el('newton-message'))  el('newton-message').textContent  = getNewtonMsg(u);
  // Lesson cards
  [1,2,3,4].forEach(n => updateLessonCard(u, n));
  // Ring
  const ov = overallPct(u);
  renderRing(ov);
  if (el('ring-pct-text')) el('ring-pct-text').textContent = ov + '%';
  if (el('ring-sub')) el('ring-sub').textContent = `${doneLessons(u)} of 4 lessons complete`;
}

const NEWTON_CHEERS = [
  "⚡ Energy is never lost. It only changes form. So does knowledge!",
  "🚀 Every great scientist started exactly where you are right now.",
  "🔥 Potential energy becomes kinetic when you take action. Start now!",
  "💥 Like a collision, one idea can set a whole chain of discoveries in motion!",
  "🌊 Knowledge flows like a wave. The more you learn, the further it reaches.",
  "🎯 At 45°, a projectile travels its farthest. Aim high, aim smart!",
  "⚛️ The universe runs on physics. And now, so do you.",
  "🌟 Newton stood on the shoulders of giants. You're climbing too!",
  "💡 Electricity lights the world. Curiosity lights the mind.",
  "🔬 Science is seeing what everyone else has seen and thinking what no one has thought.",
  "🌿 Sustainable energy starts with a single curious mind. Like yours.",
  "🏋️ The more force you apply to learning, the greater your acceleration!",
];
function getNewtonMsg(u) {
  if ([1,2,3,4].every(n => u.lessons[n].pct >= 100)) return '🌟 You completed all lessons! Physics master: the universe is yours!';
  return NEWTON_CHEERS[new Date().getDate() % NEWTON_CHEERS.length];
}

/* ── SETTINGS / RESET ── */
function openSettingsModal() { document.getElementById('reset-modal').style.display = 'flex'; }
function resetAllProgress() {
  ['alecs_user','alecs_goto_phase'].forEach(k => localStorage.removeItem(k));
  document.getElementById('reset-modal').style.display = 'none';
  showToast('✅ All progress reset!');
  setTimeout(() => location.reload(), 1100);
}
window.openSettingsModal = openSettingsModal;
window.resetAllProgress  = resetAllProgress;

/* ── PUBLIC API (lesson pages call these) ── */
window.ALECS = {
  loadUser, saveUser, addXP, showToast, getLevel, checkAchievements,
  setLessonPct,
  updateLessonProgress(n, pct) {
    let u = loadUser();
    setLessonPct(u, n, pct);
    u = checkAchievements(u);
    saveUser(u);
    updateLessonCard(u, n);
    renderRing(overallPct(u));
  },
  recordScore(n, field, value) {
    let u = loadUser();
    if (!u.scores) u.scores = getDefaultUser().scores;
    if (!u.scores[n]) u.scores[n] = { kcScore:0,kcTotal:5,conceptScore:0,gameScore:0,analysisScore:0,quizScore:0,quizTotal:10 };
    const firstOnly = ['conceptScore','analysisScore','gameScore','quizScore'];
    if (firstOnly.includes(field) && u.scores[n][field] > 0) return;
    u.scores[n][field] = value;
    saveUser(u);
  },
  markKCDone(n, score, total) {
    let u = loadUser();
    if (!u.scores) u.scores = getDefaultUser().scores;
    if (!u.scores[n]) u.scores[n] = { kcScore:0,kcTotal:5,conceptScore:0,gameScore:0,analysisScore:0,quizScore:0,quizTotal:10 };
    u.scores[n].kcScore = score;
    u.scores[n].kcTotal = total;
    saveUser(u);
  },
  markGamePlayed() {
    let u = loadUser();
    u = addXP(u, 30);
    u = checkAchievements(u);
    saveUser(u);
    showToast('🎮 +30 XP for playing!');
  },
  markQuizPassed(n, score, total) {
    let u = loadUser();
    const pct = Math.round((score / total) * 100);
    u = addXP(u, Math.round(pct * 0.5));
    if (pct >= 80) u = addXP(u, 20);
    setLessonPct(u, n, 100);
    if (!u.scores) u.scores = getDefaultUser().scores;
    if (!u.scores[n]) u.scores[n] = {kcScore:0,kcTotal:5,conceptScore:0,gameScore:0,analysisScore:0,quizScore:0,quizTotal:10};
    if (!u.scores[n].quizScore) { u.scores[n].quizScore = score; u.scores[n].quizTotal = total; }
    u = checkAchievements(u);
    saveUser(u);
    showToast(`🧠 Quiz: ${score}/${total} · +XP!`);
  },
};

/* ── HANDLE ?phase= DEEP-LINK (called by lesson pages) ── */
window.ALECS.handlePhaseDeepLink = function(goPhaseFunc) {
  const params = new URLSearchParams(window.location.search);
  const gotoPhase = params.get('phase') || localStorage.getItem('alecs_goto_phase');
  if (gotoPhase) {
    localStorage.removeItem('alecs_goto_phase');
    const n = parseInt(gotoPhase);
    if (!isNaN(n) && typeof goPhaseFunc === 'function') {
      setTimeout(() => goPhaseFunc(n), 300);
    }
  }
};


/* ── SCORES MODAL ── */
function openScoresModal() {
  const u = loadUser();
  const sc = u.scores || {};
  const wrap = document.getElementById('scores-modal-wrap');
  const LNAMES = {1:'Projectile Motion',2:'Momentum & Collisions',3:'Electricity Generation',4:'Energy Sources'};
  let html = '';
  [1,2,3,4].forEach(n => {
    const pct = u.lessons[n].pct;
    const unlocked = u.lessons[n].unlocked;
    const lsc = sc[n] || {};
    html += `<div style="background:var(--navy-darkest,#16151a);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:14px;margin-bottom:10px;${!unlocked?'opacity:.4':''}">
      <strong style="font-family:'Fredoka',sans-serif;font-size:.88rem">L${n}: ${LNAMES[n]}</strong>
      <div style="height:4px;background:#2b2831;border-radius:99px;margin:8px 0;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#f97316,#facc15);border-radius:99px"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px">
        <div style="background:#2b2831;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size: .72rem;color:#7d93a8;font-weight:800;margin-bottom:2px">KC SCORE</div>
          <div style="font-weight:800;color:#38bdf8">${lsc.kcScore!=null&&lsc.kcTotal?lsc.kcScore+'/'+lsc.kcTotal:'—'}</div>
        </div>
        <div style="background:#2b2831;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size: .72rem;color:#7d93a8;font-weight:800;margin-bottom:2px">CONCEPT</div>
          <div style="font-weight:800;color:#a78bfa">${lsc.conceptScore!=null?lsc.conceptScore+'%':'0%'}</div>
        </div>
        <div style="background:#2b2831;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size: .72rem;color:#7d93a8;font-weight:800;margin-bottom:2px">GAME</div>
          <div style="font-weight:800;color:#facc15">${lsc.gameScore!=null?(lsc.gameScore+'%'):'0%'}</div>
        </div>
        <div style="background:#2b2831;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size: .72rem;color:#7d93a8;font-weight:800;margin-bottom:2px">ANALYSIS</div>
          <div style="font-weight:800;color:#34d399">${lsc.analysisScore!=null?lsc.analysisScore+'%':'0%'}</div>
        </div>
        <div style="background:#2b2831;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size: .72rem;color:#7d93a8;font-weight:800;margin-bottom:2px">QUIZ</div>
          <div style="font-weight:800;color:#f97316">${lsc.quizScore?lsc.quizScore+'/'+(lsc.quizTotal||10):'—'}</div>
        </div>
      </div>
    </div>`;
  });
  // summary
  const scores = [1,2,3,4].map(n=>(u.scores||{})[n]||{});
  const quizzes = scores.filter(s=>s.quizScore>0);
  const avgQuiz = quizzes.length ? Math.round(quizzes.reduce((a,s)=>a+s.quizScore/(s.quizTotal||10)*100,0)/quizzes.length) : 0;
  html += `<div style="background:rgba(56,189,248,.06);border:1px solid rgba(56,189,248,.2);border-radius:11px;padding:14px">
    <strong style="font-size:.8rem;color:#38bdf8">📈 Summary</strong>
    <div style="font-size:.78rem;color:#94afc7;margin-top:8px;line-height:1.8">
      Lessons completed: <strong style="color:#22c55e">${[1,2,3,4].filter(n=>u.lessons[n].pct>=100).length}/4</strong><br>
      Avg quiz score: <strong style="color:#f97316">${avgQuiz}%</strong><br>
      Total XP: <strong style="color:#facc15">${u.xp}</strong>
    </div>
  </div>`;
  if (wrap) wrap.innerHTML = html;
  document.getElementById('scores-modal').style.display = 'flex';
}
function closeScoresModal() { document.getElementById('scores-modal').style.display = 'none'; }
window.openScoresModal  = openScoresModal;
window.closeScoresModal = closeScoresModal;
/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  let u = loadUser();
  u = updateStreak(u);
  u = checkAchievements(u);
  saveUser(u);
  renderDashboard(u);
  renderQuote();
});

// Re-render if this page is restored from bfcache (e.g. browser Back from a lesson)
// so the progress bars reflect the latest saved state instead of a stale snapshot.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    let u = loadUser();
    renderDashboard(u);
    renderQuote();
  }
});

// ── Basketball game stubs (lesson1 only) ──
const canvas2 = document.getElementById('game');
const ctx2    = canvas2 ? canvas2.getContext('2d') : null;