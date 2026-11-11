const boilSheetCache = new Map();

function generateTwoFrameSpritesheet(img) {
  const w = img.naturalWidth || img.width || 160;
  const h = img.naturalHeight || img.height || 110;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tCtx = tempCanvas.getContext('2d');

  const slice = 2;
  for (let y = 0; y < h; y += slice) {
    tCtx.drawImage(img, 0, y, w, slice, Math.sin(y * 0.22) * 0.48, y, w, slice);
  }

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = w * 2;
  sheetCanvas.height = h;
  const sCtx = sheetCanvas.getContext('2d');
  sCtx.shadowColor = 'rgba(2, 62, 138, 0.28)';
  sCtx.shadowOffsetY = 3;
  sCtx.shadowBlur = 0;

  sCtx.drawImage(img, 0, 0, w, h);
  for (let x = 0; x < w; x += slice) {
    sCtx.drawImage(tempCanvas, x, 0, slice, h, w + x, Math.cos(x * 0.22) * 0.48, slice, h);
  }
  return { sheetURL: sheetCanvas.toDataURL('image/png'), w, h };
}

function registerSingleImageForBoil(initialSrc, onReady) {
  if (boilSheetCache.has(initialSrc)) {
    const cached = boilSheetCache.get(initialSrc);
    if (cached.ready && onReady) onReady(cached);
    else if (onReady) cached.callbacks.push(onReady);
    return;
  }
  const entry = { sheetURL: initialSrc, w: 160, h: 110, useFallback: false, ready: false, callbacks: onReady ? [onReady] : [] };
  boilSheetCache.set(initialSrc, entry);

  const probe = new Image();
  probe.onload = () => {
    try {
      const res = generateTwoFrameSpritesheet(probe);
      entry.sheetURL = res.sheetURL;
      entry.w = res.w;
      entry.h = res.h;
    } catch (err) {
      entry.useFallback = true;
    }
    entry.ready = true;
    entry.callbacks.forEach(cb => cb(entry));
    entry.callbacks = [];
  };
  probe.src = initialSrc;
}

function setBoilImageSrc(imgEl, initialSrc) {
  imgEl.src = initialSrc;
  registerSingleImageForBoil(initialSrc, (entry) => {
    if (entry.useFallback) {
      imgEl.classList.add('boil-fallback');
    } else {
      imgEl.style.aspectRatio = `${entry.w} / ${entry.h}`;
      imgEl.classList.add('boil-sheet');
      imgEl.src = entry.sheetURL;
    }
  });
}

setInterval(() => { if (!document.hidden) document.body.classList.toggle('boil-tick'); }, 500);

function updateShrimpCursor(cursorPath) {
  document.documentElement.style.setProperty('--shrimp-cursor', `url("${cursorPath}") 2 2, auto`);
}
updateShrimpCursor('assets/cursor-common.png');

const BUBBLE_INTACT_URI = 'assets/bubble.png';
const BUBBLE_POP_FRAME_URI = 'assets/bubble-pop.png';
const BUBBLEMANCER_POOF_BUBBLE_URI = 'assets/bubblemancer-poof-bubble.png';
const SPARKLE_STAR_URI = 'assets/sparkle-star.png';
const chestClosedPath = 'assets/chest-closed.png';
const chestOpenPath = 'assets/chest-open.png';

setBoilImageSrc(document.getElementById('sun-sprite'), 'assets/sun.png');
document.querySelectorAll('.cloud-sprite').forEach(el => setBoilImageSrc(el, 'assets/cloud.png'));
setBoilImageSrc(document.getElementById('boat-sprite'), 'assets/boat.png');

const chestSpriteEl = document.getElementById('chest-sprite');
registerSingleImageForBoil(chestOpenPath);
setBoilImageSrc(chestSpriteEl, chestClosedPath);

document.querySelectorAll('.coral-piece').forEach(piece => {
  piece.addEventListener('mouseenter', () => {
    if (piece.classList.contains('brushed')) return;
    piece.classList.add('brushed');
    setTimeout(() => piece.classList.remove('brushed'), 1050);
  });
});

const SHRIMP_SPECIES = [
  { id: 'common_tooth', name: 'shrimp shrimp', rarityLabel: 'common', rarityImg: 'assets/ui-rarity-common.png', cursor: 'assets/cursor-common.png', weight: 21, swimDuration: 9.5, bobSpeed: '0.7s', exitType: 'common', msSinceLastSpawn: 0, hint: 'do you really need a hint for this?', description: 'the og. the shrimp you think of when you think of shrimp. he reminds you of home. of the waves and the sea foam. of shrimp.', sprite: 'assets/shrimp-common.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'cherry_blossom', name: 'cherry blossom shrimp', rarityLabel: 'common', rarityImg: 'assets/ui-rarity-common.png', cursor: 'assets/cursor-cherry.png', weight: 16, swimDuration: 13.5, bobSpeed: '1.15s', exitType: 'common', msSinceLastSpawn: 4000, hint: 'they\'re pink now? they\'re pink now.', description: 'he\'s pink now. you know how flamingos turn pink because they eat a ton of shrimp? yeah. don\'t think about it too hard', sprite: 'assets/shrimp-cherry.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'sunny_citrus', name: 'lime juice shrimp', rarityLabel: 'common', rarityImg: 'assets/ui-rarity-common.png', cursor: 'assets/cursor-citrus.png', weight: 14, swimDuration: 7.0, bobSpeed: '0.45s', exitType: 'common', msSinceLastSpawn: 8000, hint: 'lemme get a little bit of lime on that', description: 'scientists have discovered that you can squeeze this guy into your water if you want. it won\'t taste like lime, but you can do it if you want.', sprite: 'assets/shrimp-citrus.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'red_velvet', name: 'red velvet shrimp', rarityLabel: 'uncommon', rarityImg: 'assets/ui-rarity-uncommon.png', cursor: 'assets/cursor-velvet.png', weight: 9, swimDuration: 12.0, bobSpeed: '0.95s', exitType: 'sine', msSinceLastSpawn: 12000, hint: 'he\'s covered in blood! oh my god!', description: 'this shrimp was indicted for the crime of bathing in his enemies\' blood. turns out that wasn\'t true. it was his friends\' blood instead. phew', sprite: 'assets/shrimp-velvet.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'bumblebee', name: 'bzzzzzz shrimp', rarityLabel: 'uncommon', rarityImg: 'assets/ui-rarity-uncommon.png', cursor: 'assets/cursor-bumblebee.png', weight: 8, swimDuration: 6.2, bobSpeed: '0.28s', exitType: 'sine', msSinceLastSpawn: 16000, hint: '*buzzes in your ear affectionately*', description: 'this cute little guy buzzes like a bee and likes to crawl into peoples ears! move over earwig, we got earshrimp now', sprite: 'assets/shrimp-bumblebee.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'bluebolt_tiger', name: 'blue jacket shrimp', rarityLabel: 'rare', rarityImg: 'assets/ui-rarity-rare.png', cursor: 'assets/cursor-bluebolt.png', weight: 4, swimDuration: 4.6, bobSpeed: '0.22s', exitType: 'sine', msSinceLastSpawn: 20000, hint: 'and he is so bluuuue!', description: 'studies have shown that looking at this deep of a blue color will hurt you. mentally? physically? spiritually? yes.', sprite: 'assets/shrimp-bluebolt.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'polka_prawn', name: 'shrimp wit da dots on em', rarityLabel: 'rare', rarityImg: 'assets/ui-rarity-rare.png', cursor: 'assets/cursor-polka.png', weight: 3.5, swimDuration: 10.5, bobSpeed: '0.8s', exitType: 'sine', msSinceLastSpawn: 24000, hint: 'bumpy, sensory nightmare, 0/10, what', description: 'this shrimp feels like running your hand over the warty backside of a toad, without having to go to a swamp to find one. what a bargain!', sprite: 'assets/shrimp-polka.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'ghost_shrimp', name: 'dark gothic glass shrimp', rarityLabel: 'very rare', rarityImg: 'assets/ui-rarity-very-rare.png', cursor: 'assets/cursor-ghost.png', weight: 2.5, swimDuration: 14.5, bobSpeed: '1.4s', exitType: 'ghost', msSinceLastSpawn: 28000, hint: 'in his dark academia era', description: 'he reclines studiously into the dark birchoak sofa chair in the corner nook of the dark academia library. he is reading fanfiction', sprite: 'assets/shrimp-ghost.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'emperor_krill', name: 'big king shimpo', rarityLabel: 'mythic', rarityImg: 'assets/ui-rarity-mythic.png', cursor: 'assets/cursor-emperor.png', weight: 2.0, swimDuration: 11.0, bobSpeed: '0.85s', exitType: 'janky', msSinceLastSpawn: 18000, hint: 'bow down.', description: 'by his decree, all other shrimp are lesser than he! he doesn\'t write the rules, he just makes them.', sprite: 'assets/shrimp-emperor.png', isSecret: false, unlocked: false, viewed: false },
  { id: 'fishershrimp', name: 'the ferryshrimp', rarityLabel: 'secret', rarityImg: 'assets/ui-rarity-secret.png', cursor: 'assets/cursor-fisher.png', weight: 0, hint: 'hark! he floats among the waves! hark!', description: 'this guy looks familiar.', sprite: 'assets/shrimp-fisher.png', isSecret: true, unlocked: false, viewed: false },
  { id: 'bubblemancer', name: 'grand lord bubelle', rarityLabel: 'secret', rarityImg: 'assets/ui-rarity-secret.png', cursor: 'assets/cursor-bubblemancer.png', weight: 0, hint: 'summoned by a bubble\'s pop, a ritual granted', description: 'if you incite his wrath, he will cast a spell of shrimpification unto you. that wouldn\'t be so bad, actually. maybe you should incite his wrath', sprite: 'assets/shrimp-bubblemancer.png', isSecret: true, unlocked: false, viewed: false },
  { id: 'golden_shrimp', name: '20 karat shrimp', rarityLabel: 'secret', rarityImg: 'assets/ui-rarity-secret.png', cursor: 'assets/cursor-golden.png', weight: 0, hint: 'let him out! please! oh my god let him out!', description: 'this guy is worth at least 20 karats of gold. i looked it up in my big book of golden shrimp facts.', sprite: 'assets/shrimp-golden.png', isSecret: true, unlocked: false, viewed: false }
];

SHRIMP_SPECIES.forEach(s => registerSingleImageForBoil(s.sprite));

const fisherSpecies = SHRIMP_SPECIES.find(s => s.id === 'fishershrimp');
const bubblemancerSpecies = SHRIMP_SPECIES.find(s => s.id === 'bubblemancer');
const goldenSpecies = SHRIMP_SPECIES.find(s => s.id === 'golden_shrimp');
const cabinShrimpEl = document.getElementById('cabin-fishershrimp');
setBoilImageSrc(cabinShrimpEl, fisherSpecies.sprite);

const grimoireModal = document.getElementById('grimoire-modal');
const openGrimoireBtn = document.getElementById('open-grimoire-btn');
const grimoireBtnMedal = document.getElementById('grimoire-btn-medal');
const closeGrimoireBtn = document.getElementById('close-grimoire-btn');
const grimoireBadge = document.getElementById('grimoire-badge');
const grimoireGrid = document.getElementById('grimoire-grid');
const grimoireSubmenuWrap = document.getElementById('grimoire-submenu-wrap');
const submenuSparkleLayer = document.getElementById('submenu-sparkle-layer');
const goldenMedalBanner = document.getElementById('golden-medal-banner');
const discoveredCountEl = document.getElementById('discovered-count');
const totalSpeciesCountEl = document.getElementById('total-species-count');

let sparkleInterval = null;
totalSpeciesCountEl.textContent = SHRIMP_SPECIES.length;

function updateNotificationBadge() {
  const unviewedCount = SHRIMP_SPECIES.filter(s => s.unlocked && !s.viewed).length;
  if (unviewedCount > 0) {
    grimoireBadge.textContent = unviewedCount;
    grimoireBadge.classList.remove('hidden');
  } else {
    grimoireBadge.classList.add('hidden');
  }
}

function spawnSubmenuSparkle() {
  if (grimoireModal.classList.contains('hidden') || document.hidden) return;
  const sparkle = document.createElement('img');
  sparkle.src = SPARKLE_STAR_URI;
  sparkle.className = 'submenu-sparkle';
  const size = Math.random() * 12 + 18;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;
  sparkle.style.left = `${Math.random() * 94 + 2}%`;
  sparkle.style.top = `${Math.random() * 92 + 4}%`;
  submenuSparkleLayer.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 1300);
}

function checkCompletionEffects() {
  const isAllUnlocked = SHRIMP_SPECIES.every(s => s.unlocked);
  if (isAllUnlocked) {
    goldenMedalBanner.classList.remove('hidden');
    grimoireBtnMedal.classList.remove('hidden');
    openGrimoireBtn.classList.add('completed-glow');
    grimoireSubmenuWrap.classList.add('all-unlocked');
    if (!sparkleInterval) {
      for (let i = 0; i < 4; i++) setTimeout(spawnSubmenuSparkle, i * 140);
      sparkleInterval = setInterval(spawnSubmenuSparkle, 240);
    }
  }
}

function unlockSpecies(species, clickX, clickY) {
  updateShrimpCursor(species.cursor);
  if (!species.unlocked) {
    species.unlocked = true;
    species.viewed = false;
    updateNotificationBadge();
    checkCompletionEffects();
    const unlockedCount = SHRIMP_SPECIES.filter(s => s.unlocked).length;
    if (unlockedCount === SHRIMP_SPECIES.length) {
      showDiscoveryToast(clickX, clickY, `every shrimp discovered! shrimp it up!`, 'magic');
    } else {
      showDiscoveryToast(clickX, clickY, `discovered: ${species.name}!`, 'new');
    }
  } else {
    showDiscoveryToast(clickX, clickY, `${species.name}`, 'known');
  }
}

function renderGrimoireEntries() {
  grimoireGrid.innerHTML = '';
  discoveredCountEl.textContent = SHRIMP_SPECIES.filter(s => s.unlocked).length;

  SHRIMP_SPECIES.forEach(species => {
    const card = document.createElement('div');
    card.className = `grimoire-entry ${species.unlocked ? 'unlocked' : 'locked'}`;
    const newTagHTML = (species.unlocked && !species.viewed) ? `<div class="new-entry-tag">new!</div>` : '';
    const rarityTagHTML = `<div class="rarity-tag" style="background-image: url('${species.rarityImg}');">${species.rarityLabel}</div>`;

    card.innerHTML = `
      ${rarityTagHTML}
      ${newTagHTML}
      <div class="entry-img-box">
        <img src="${species.sprite}" alt="${species.unlocked ? species.name : 'unknown shrimp'}" />
      </div>
      <h3>${species.unlocked ? species.name : '???'}</h3>
      <p>${species.unlocked ? species.description : `<em>hint:</em> ${species.hint}`}</p>
    `;
    grimoireGrid.appendChild(card);
    if (species.unlocked) species.viewed = true;
  });
  checkCompletionEffects();
}

openGrimoireBtn.addEventListener('click', () => {
  renderGrimoireEntries();
  grimoireModal.classList.remove('hidden');
  updateNotificationBadge();
});
closeGrimoireBtn.addEventListener('click', () => grimoireModal.classList.add('hidden'));
grimoireModal.addEventListener('click', (e) => {
  if (e.target === grimoireModal) grimoireModal.classList.add('hidden');
});

function showDiscoveryToast(x, y, text, mode = 'new') {
  const toast = document.createElement('div');
  toast.className = `discovery-toast ${mode === 'known' ? 'already-known' : ''} ${mode === 'magic' ? 'magic-summon' : ''}`;
  toast.textContent = text;
  toast.style.left = `${x}px`;
  toast.style.top = `${y}px`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1900);
}

const boatTrigger = document.getElementById('boat-trigger');
let fisherPeekTimeout = null;
boatTrigger.addEventListener('pointerdown', (e) => {
  cabinShrimpEl.classList.add('peek-out');
  unlockSpecies(fisherSpecies, e.clientX, e.clientY);
  if (fisherPeekTimeout) clearTimeout(fisherPeekTimeout);
  fisherPeekTimeout = setTimeout(() => cabinShrimpEl.classList.remove('peek-out'), 3200);
});

const chestTrigger = document.getElementById('treasure-chest-trigger');
let chestBusy = false;
chestTrigger.addEventListener('pointerdown', (e) => {
  unlockSpecies(goldenSpecies, e.clientX, e.clientY);
  if (chestBusy) return;
  chestBusy = true;
  setBoilImageSrc(chestSpriteEl, chestOpenPath);

  const goldenEl = document.createElement('img');
  goldenEl.className = 'spawned-golden-shrimp';
  setBoilImageSrc(goldenEl, goldenSpecies.sprite);
  goldenEl.style.transform = 'translateX(0px) translateY(10px) scale(0.3)';
  goldenEl.style.opacity = '0';
  chestTrigger.appendChild(goldenEl);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      goldenEl.style.opacity = '1';
      goldenEl.style.transform = 'translateX(85px) translateY(-15px) scale(1.05) rotate(-4deg)';
    });
  });

  setTimeout(() => {
    goldenEl.style.transition = 'transform 2.0s cubic-bezier(0.4, 0, 1, 1), opacity 2.0s ease';
    goldenEl.style.transform = 'translateX(65vw) translateY(-10px) scale(1)';
    goldenEl.style.opacity = '0';
  }, 750);

  setTimeout(() => {
    setBoilImageSrc(chestSpriteEl, chestClosedPath);
    goldenEl.remove();
    chestBusy = false;
  }, 2800);
});

const bubbleLayer = document.getElementById('bubble-layer');
const waterlineWavesEl = document.getElementById('waterline-waves');
let bubblesPopped = 0;

function spawnWizardSmokeAndSparkles(x, y) {
  const fxContainer = document.createElement('div');
  fxContainer.className = 'wizard-poof-fx';
  fxContainer.style.left = `${x}px`;
  fxContainer.style.top = `${y}px`;

  const smokeConfigs = [
    { tx: '-28px', ty: '-14px', size: 52, delay: '0s',    dur: '0.62s' },
    { tx: '26px',  ty: '-8px',  size: 46, delay: '0.06s', dur: '0.78s' },
    { tx: '0px',   ty: '16px',  size: 56, delay: '0.11s', dur: '0.92s' }
  ];
  smokeConfigs.forEach(cfg => {
    const puff = document.createElement('img');
    puff.src = BUBBLEMANCER_POOF_BUBBLE_URI;
    puff.className = 'smoke-puff';
    puff.style.width = `${cfg.size}px`;
    puff.style.height = `${cfg.size}px`;
    puff.style.setProperty('--tx', cfg.tx);
    puff.style.setProperty('--ty', cfg.ty);
    puff.style.setProperty('--delay', cfg.delay);
    puff.style.setProperty('--dur', cfg.dur);
    fxContainer.appendChild(puff);
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 + 0.3;
    const dist = 42 + i * 8;
    const star = document.createElement('img');
    star.src = SPARKLE_STAR_URI;
    star.className = 'poof-sparkle';
    star.style.setProperty('--sx', `${Math.cos(angle) * dist}px`);
    star.style.setProperty('--sy', `${Math.sin(angle) * dist}px`);
    star.style.setProperty('--delay', `${i * 0.045}s`);
    star.style.setProperty('--dur', `${0.6 + i * 0.08}s`);
    fxContainer.appendChild(star);
  }
  document.body.appendChild(fxContainer);
  setTimeout(() => fxContainer.remove(), 1150);
}

function summonBubblemancer() {
  showDiscoveryToast(window.innerWidth / 2, window.innerHeight * 0.35, 'the grand lord has appeared!', 'magic');

  const wrapper = document.createElement('div');
  wrapper.classList.add('shrimp-wrapper', 'bubblemancer-aura', 'swim-right');
  wrapper.title = 'there he is! (click to unlock!)';
  wrapper.style.width = '186px';
  wrapper.style.top = '45vh';
  wrapper.style.animationDuration = '14s';

  const img = document.createElement('img');
  img.classList.add('shrimp-sprite');
  setBoilImageSrc(img, bubblemancerSpecies.sprite);
  wrapper.appendChild(img);
  shrimpFrontLayer.appendChild(wrapper);

  wrapper.addEventListener('pointerdown', (e) => {
    unlockSpecies(bubblemancerSpecies, e.clientX, e.clientY);
    const rect = wrapper.getBoundingClientRect();
    spawnWizardSmokeAndSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

    wrapper.classList.remove('swim-right');
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.top = `${rect.top}px`;
    wrapper.classList.add('exit-bubblemancer');
    setTimeout(() => wrapper.remove(), 450);
  });

  wrapper.addEventListener('animationend', (e) => { if (e.target === wrapper) wrapper.remove(); });
}

function popBubbleElement(bubble, countTowardPlayer = false) {
  if (bubble.classList.contains('popped')) return;
  const rect = bubble.getBoundingClientRect();
  bubble.style.animation = 'none';
  bubble.style.bottom = 'auto';
  bubble.style.top = `${rect.top}px`;
  bubble.style.left = `${rect.left}px`;
  bubble.classList.add('popped');
  bubble.innerHTML = '';

  const burstImg = document.createElement('img');
  burstImg.src = BUBBLE_POP_FRAME_URI;
  burstImg.className = 'pop-burst-img';
  bubble.appendChild(burstImg);

  if (countTowardPlayer) {
    bubblesPopped++;
    if (bubblesPopped > 0 && bubblesPopped % 10 === 0) {
      summonBubblemancer();
    }
  }
  setTimeout(() => bubble.remove(), 150);
}

function spawnBubble() {
  if (document.hidden) return;
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  const size = Math.random() * 40 + 28;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${Math.random() * 92 + 2}vw`;

  const intactImg = document.createElement('img');
  intactImg.src = BUBBLE_INTACT_URI;
  intactImg.className = 'bubble-intact-img boil-fallback';
  bubble.appendChild(intactImg);

  const duration = Math.random() * 7 + 6;
  bubble.style.animationDuration = `${duration}s`;

  bubble.addEventListener('pointerdown', () => popBubbleElement(bubble, true));
  bubbleLayer.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentElement && !bubble.classList.contains('popped')) bubble.remove();
  }, duration * 1000);
}

setInterval(() => {
  if (document.hidden) return;
  const surfaceY = 162 - window.scrollY;
  if (surfaceY <= 0) return;
  document.querySelectorAll('.bubble:not(.popped)').forEach(b => {
    if (b.getBoundingClientRect().top <= surfaceY) {
      popBubbleElement(b, false);
    }
  });
}, 90);

setInterval(spawnBubble, 550);
for (let i = 0; i < 8; i++) setTimeout(spawnBubble, i * 180);

const shrimpBackLayer = document.getElementById('shrimp-layer-back');
const shrimpFrontLayer = document.getElementById('shrimp-layer-front');
const seaFloorEl = document.getElementById('sea-floor');
const WILD_SHRIMP_POOL = SHRIMP_SPECIES.filter(s => !s.isSecret);
const COMMON_STARTER_POOL = WILD_SHRIMP_POOL.filter(s => s.rarityLabel === 'common');
const TOTAL_WILD_WEIGHT = WILD_SHRIMP_POOL.reduce((sum, s) => sum + s.weight, 0);
const SPAWN_INTERVAL_MS = 1500;
const MAX_DROUGHT_MS = 60000;

function pickWeightedWildShrimp(onlyCommon = false) {
  if (onlyCommon) {
    const picked = COMMON_STARTER_POOL[Math.floor(Math.random() * COMMON_STARTER_POOL.length)];
    picked.msSinceLastSpawn = 0;
    return picked;
  }
  WILD_SHRIMP_POOL.forEach(s => { s.msSinceLastSpawn += SPAWN_INTERVAL_MS; });

  let mostOverdueSpecies = null;
  for (const s of WILD_SHRIMP_POOL) {
    if (s.msSinceLastSpawn >= MAX_DROUGHT_MS && (!mostOverdueSpecies || s.msSinceLastSpawn > mostOverdueSpecies.msSinceLastSpawn)) {
      mostOverdueSpecies = s;
    }
  }
  if (mostOverdueSpecies) {
    mostOverdueSpecies.msSinceLastSpawn = 0;
    return mostOverdueSpecies;
  }

  let roll = Math.random() * TOTAL_WILD_WEIGHT;
  for (const species of WILD_SHRIMP_POOL) {
    if (roll < species.weight) {
      species.msSinceLastSpawn = 0;
      return species;
    }
    roll -= species.weight;
  }
  WILD_SHRIMP_POOL[0].msSinceLastSpawn = 0;
  return WILD_SHRIMP_POOL[0];
}

function spawnShrimp(startImmediatelyInsideScreen = false) {
  if (document.hidden && !startImmediatelyInsideScreen) return;

  const species = pickWeightedWildShrimp(startImmediatelyInsideScreen);
  const wrapper = document.createElement('div');
  wrapper.classList.add('shrimp-wrapper');
  wrapper.style.setProperty('--bob-speed', species.bobSpeed || '0.7s');
  wrapper.title = species.unlocked ? `${species.name} (${species.rarityLabel})` : '??? (click to discover!)';

  const img = document.createElement('img');
  img.classList.add('shrimp-sprite');
  setBoilImageSrc(img, species.sprite);
  wrapper.appendChild(img);

  const isBackground = Math.random() > 0.55;
  const size = isBackground ? (Math.random() * 42 + 90) : (Math.random() * 60 + 138);
  wrapper.style.width = `${size}px`;

  if (isBackground) {
    wrapper.style.opacity = '0.75';
    shrimpBackLayer.appendChild(wrapper);
  } else {
    shrimpFrontLayer.appendChild(wrapper);
  }

  const waveRect = waterlineWavesEl.getBoundingClientRect();
  const footerRect = seaFloorEl.getBoundingClientRect();
  const minTopPx = Math.max(window.innerHeight * 0.22, waveRect.bottom + 20);
  const maxTopPx = Math.min(window.innerHeight * 0.76, footerRect.top - 135);
  const safeMaxTopPx = Math.max(minTopPx + 40, maxTopPx);
  wrapper.style.top = `${minTopPx + Math.random() * (safeMaxTopPx - minTopPx)}px`;

  const swimRight = Math.random() > 0.5;
  const baseDuration = species.swimDuration || 9.0;
  const duration = isBackground ? baseDuration * 1.25 : baseDuration;
  const scaleX = swimRight ? 1 : -1;

  wrapper.classList.add(swimRight ? 'swim-right' : 'swim-left');
  wrapper.style.animationDuration = `${duration}s`;

  if (startImmediatelyInsideScreen) {
    wrapper.style.animationDelay = `-${(Math.random() * 0.65 + 0.15) * duration}s`;
  }

  wrapper.addEventListener('pointerdown', (e) => {
    unlockSpecies(species, e.clientX, e.clientY);

    const rect = wrapper.getBoundingClientRect();
    wrapper.classList.remove('swim-right', 'swim-left');
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.top = `${rect.top}px`;
    wrapper.style.transform = `scaleX(${scaleX})`;
    wrapper.style.setProperty('--dir', scaleX);

    if (species.exitType === 'ghost') {
      wrapper.classList.add('exit-ghost');
      setTimeout(() => wrapper.remove(), 800);
    } else if (species.exitType === 'janky') {
      wrapper.classList.add('exit-janky');
      setTimeout(() => wrapper.remove(), 1300);
    } else if (species.exitType === 'sine') {
      wrapper.classList.add('exit-sine');
      setTimeout(() => wrapper.remove(), 1350);
    } else {
      wrapper.classList.add('exit-common');
      setTimeout(() => wrapper.remove(), 1900);
    }
  });

  wrapper.addEventListener('animationend', (e) => { if (e.target === wrapper) wrapper.remove(); });
}

for (let i = 0; i < 4; i++) spawnShrimp(true);
setInterval(() => spawnShrimp(false), SPAWN_INTERVAL_MS);

if (!window.CSS || !CSS.supports('animation-timeline', 'scroll(root)')) {
  const farCoral = document.getElementById('bg-parallax-far');
  const midCoral = document.getElementById('bg-parallax-mid');
  const nearCoral = document.getElementById('bg-parallax-near');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        farCoral.style.transform = `translate3d(0, ${-y * 0.08}px, 0)`;
        midCoral.style.transform = `translate3d(0, ${-y * 0.22}px, 0)`;
        nearCoral.style.transform = `translate3d(0, ${-y * 0.36}px, 0)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

let scrollAnimId = null;

function smoothLerpScrollTo(targetEl, topPadding = 36) {
  if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
  const targetY = Math.max(0, targetEl.getBoundingClientRect().top + window.scrollY - topPadding);

  function step() {
    const currentY = window.scrollY;
    const diff = targetY - currentY;
    if (Math.abs(diff) < 1.5) {
      window.scrollTo(0, targetY);
      scrollAnimId = null;
      return;
    }
    window.scrollTo(0, currentY + diff * 0.14);
    scrollAnimId = requestAnimationFrame(step);
  }
  scrollAnimId = requestAnimationFrame(step);
}

window.addEventListener('wheel', () => { if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; } }, { passive: true });
window.addEventListener('touchstart', () => { if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; } }, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      smoothLerpScrollTo(target, 36);
    }
  });
});