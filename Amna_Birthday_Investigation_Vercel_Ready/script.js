/* The Curious Case of Amna — entirely fictional birthday investigation. */
(() => {
  'use strict';

  const scenes = ['intro', 'suspect', 'charges', 'evidence', 'interrogation', 'verdict', 'birthday'];
  const labels = ['FILE SEALED', 'SUSPECT FOUND', 'CHARGES FILED', 'EVIDENCE FOUND', 'INTERROGATION', 'VERDICT ISSUED', 'CASE CLOSED'];
  const sections = Object.fromEntries(scenes.map(id => [id, document.getElementById(`scene-${id}`)]));
  const progressFill = document.getElementById('progressFill');
  const progressTrack = document.getElementById('progressTrack');
  const progressLabel = document.getElementById('progressLabel');
  const soundToggle = document.getElementById('soundToggle');
  const soundText = document.getElementById('soundText');
  const toastEl = document.getElementById('toast');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentScene = 'intro';
  let soundEnabled = false;
  let audioContext = null;
  let toastTimeout = null;

  function chirp(kind = 'tap') {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContext) audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const notes = kind === 'success' ? [523, 659, 784] : kind === 'stamp' ? [220, 174] : [440];
      notes.forEach((freq, idx) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const at = now + idx * (kind === 'success' ? .12 : .055);
        oscillator.type = kind === 'stamp' ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(freq, at);
        gain.gain.setValueAtTime(.0001, at);
        gain.gain.exponentialRampToValueAtTime(.055, at + .012);
        gain.gain.exponentialRampToValueAtTime(.0001, at + .16);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(at);
        oscillator.stop(at + .18);
      });
    } catch (_) { /* Audio is only an optional enhancement. */ }
  }

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.setAttribute('aria-pressed', String(soundEnabled));
    soundToggle.setAttribute('aria-label', soundEnabled ? 'Turn sound effects off' : 'Turn sound effects on');
    soundToggle.title = soundEnabled ? 'Sound effects are on' : 'Sound effects are off';
    soundText.textContent = soundEnabled ? 'SOUND ON' : 'SOUND OFF';
    chirp('success');
  });

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toastEl.classList.remove('visible'), 2400);
  }

  function goTo(id, options = {}) {
    if (!sections[id]) return;
    const { history = true, play = true } = options;
    Object.entries(sections).forEach(([key, scene]) => {
      const show = key === id;
      scene.hidden = !show;
      scene.classList.toggle('active', show);
    });
    currentScene = id;
    const index = scenes.indexOf(id);
    const percent = Math.round((index / (scenes.length - 1)) * 100);
    progressFill.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));
    progressLabel.textContent = labels[index];
    if (history) window.history.pushState({ scene: id }, '', `#${id}`);
    if (play) chirp(id === 'birthday' ? 'success' : 'tap');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (id === 'birthday') launchConfetti();
    if (id === 'interrogation') renderQuestion();
  }

  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => goTo(button.dataset.go));
  });

  // Let the phone's browser Back button navigate previous screens too.
  window.history.replaceState({ scene: 'intro' }, '', window.location.pathname + window.location.search);
  window.addEventListener('popstate', event => {
    goTo(event.state?.scene && sections[event.state.scene] ? event.state.scene : 'intro', { history: false, play: false });
  });

  // Fingerprint press-and-hold (touch, mouse and keyboard), with an accessible Skip option.
  const fingerprintBtn = document.getElementById('fingerprintBtn');
  const scanStatus = document.getElementById('scanStatus');
  const scanDuration = 1250;
  let scanFrame = null;
  let scanStart = 0;
  let isScanning = false;
  let scanFinished = false;

  function finishScan() {
    if (scanFinished) return;
    scanFinished = true;
    isScanning = false;
    cancelAnimationFrame(scanFrame);
    fingerprintBtn.classList.remove('is-pressing');
    fingerprintBtn.style.setProperty('--scan-progress', '100%');
    scanStatus.textContent = '✓ IDENTITY VERIFIED. VERY SUSPICIOUS.';
    chirp('success');
    window.setTimeout(() => { if (currentScene === 'suspect') goTo('charges'); }, 550);
  }
  function scanStep(time) {
    if (!isScanning) return;
    if (!scanStart) scanStart = time;
    const progress = Math.min(100, ((time - scanStart) / scanDuration) * 100);
    fingerprintBtn.style.setProperty('--scan-progress', `${progress}%`);
    scanStatus.textContent = `SCANNING... ${Math.round(progress)}%`;
    if (progress >= 100) finishScan();
    else scanFrame = requestAnimationFrame(scanStep);
  }
  function beginScan(event) {
    if (scanFinished || isScanning) return;
    if (event && event.type === 'keydown' && ![' ', 'Enter'].includes(event.key)) return;
    if (event?.type === 'keydown') event.preventDefault();
    isScanning = true;
    scanStart = 0;
    fingerprintBtn.classList.add('is-pressing');
    scanFrame = requestAnimationFrame(scanStep);
  }
  function cancelScan() {
    if (!isScanning) return;
    isScanning = false;
    cancelAnimationFrame(scanFrame);
    scanFrame = null;
    fingerprintBtn.classList.remove('is-pressing');
    fingerprintBtn.style.setProperty('--scan-progress', '0%');
    scanStatus.textContent = 'HOLD A LITTLE LONGER TO VERIFY...';
  }
  fingerprintBtn.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    beginScan(event);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(name => fingerprintBtn.addEventListener(name, cancelScan));
  fingerprintBtn.addEventListener('keydown', beginScan);
  fingerprintBtn.addEventListener('keyup', cancelScan);
  fingerprintBtn.addEventListener('contextmenu', event => event.preventDefault());

  // A swipeable stack of fictional birthday charges.
  const charges = [
    { icon: '🎂', section: 'SECTION 001 • BIRTHDAY LAW', title: 'Unauthorized<br>Leveling Up', description: 'Suspect has grown another year older without submitting the required paperwork.', sentence: 'One extra slice of cake.' },
    { icon: '👑', section: 'SECTION 002 • MAIN CHARACTER ACT', title: 'Excessive<br>Main Character Energy', description: 'Repeatedly caught acting like the star of her own story. The audacity is impressive.', sentence: 'A mandatory birthday crown.' },
    { icon: '💬', section: 'SECTION 003 • CONVERSATION CODE', title: 'Suspiciously<br>Good Company', description: 'Multiple witnesses report that hanging out with the suspect makes the time fly by.', sentence: 'More fun hangouts. Effective immediately.' },
    { icon: '✨', section: 'SECTION 004 • PUBLIC HAPPINESS ACT', title: 'Spreading<br>Unlicensed Joy', description: 'Accused of making people smile without a happiness distribution permit.', sentence: 'A whole year of good things.' }
  ];
  let chargeIndex = 0;
  const chargeCard = document.getElementById('chargeCard');
  const chargeDots = document.getElementById('chargeDots');
  const prevCharge = document.getElementById('chargePrev');
  const nextCharge = document.getElementById('chargeNext');
  let touchStartX = null;
  function renderCharge() {
    const charge = charges[chargeIndex];
    document.getElementById('chargeCount').textContent = `CHARGE ${String(chargeIndex + 1).padStart(2, '0')} OF 04`;
    document.getElementById('chargeIcon').textContent = charge.icon;
    document.querySelector('.charge-tag').textContent = charge.section;
    document.getElementById('chargeTitle').innerHTML = charge.title;
    document.getElementById('chargeDescription').textContent = charge.description;
    document.getElementById('chargeSentence').textContent = charge.sentence;
    prevCharge.disabled = chargeIndex === 0;
    nextCharge.disabled = chargeIndex === charges.length - 1;
    chargeDots.replaceChildren(...charges.map((_, index) => {
      const dot = document.createElement('span');
      dot.className = `charge-dot${index === chargeIndex ? ' active' : ''}`;
      return dot;
    }));
    chargeCard.classList.remove('swap');
    void chargeCard.offsetWidth;
    chargeCard.classList.add('swap');
  }
  function moveCharge(offset) {
    const target = Math.min(charges.length - 1, Math.max(0, chargeIndex + offset));
    if (target === chargeIndex) return;
    chargeIndex = target;
    chirp('tap');
    renderCharge();
  }
  prevCharge.addEventListener('click', () => moveCharge(-1));
  nextCharge.addEventListener('click', () => moveCharge(1));
  chargeCard.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  chargeCard.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 45) moveCharge(dx < 0 ? 1 : -1);
    touchStartX = null;
  }, { passive: true });
  chargeCard.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveCharge(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  renderCharge();

  // Evidence cards declassify independently.
  const openedEvidence = new Set();
  document.querySelectorAll('[data-evidence]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.evidence;
      const open = card.classList.toggle('open');
      card.setAttribute('aria-expanded', String(open));
      if (open) openedEvidence.add(id);
      document.getElementById('evidenceCount').textContent = `${openedEvidence.size} / 4 OPENED`;
      chirp(open ? 'stamp' : 'tap');
      if (openedEvidence.size === 4 && open) showToast('All exhibits declassified. Impressive detective work.');
    });
  });

  // Funny interrogation answers. No network, storage, or data collection.
  const questions = [
    {
      question: 'Do you acknowledge that another birthday has occurred?',
      options: ['I demand a lawyer. 😤', 'Allegedly... 👀'],
      responses: ['Your lawyer says happy birthday. Case continues.', 'That sounds exactly like something a birthday girl would say.']
    },
    {
      question: 'How do you explain being such a main character?',
      options: ['Pure coincidence. 💅', 'It comes naturally. ✨'],
      responses: ['An unlikely explanation. We will allow it.', 'A bold confession. The court respects the confidence.']
    },
    {
      question: 'Will you accept cake as part of your sentence?',
      options: ['Only if it tastes amazing. 🍰', 'Gladly, Your Honor. 🎂'],
      responses: ['Reasonable terms. The court approves the cake request.', 'Excellent. Your cooperation has been noted.']
    }
  ];
  let questionIndex = 0;
  let selectedAnswer = null;
  const answerOptions = document.getElementById('answerOptions');
  const detectiveResponse = document.getElementById('detectiveResponse');
  const interviewNext = document.getElementById('interviewNext');
  const questionCounter = document.getElementById('questionCounter');
  function renderQuestion() {
    const question = questions[questionIndex];
    selectedAnswer = null;
    document.getElementById('interviewQuestion').textContent = question.question;
    questionCounter.textContent = `${String(questionIndex + 1).padStart(2, '0')} / 03`;
    detectiveResponse.hidden = true;
    interviewNext.disabled = true;
    interviewNext.innerHTML = 'SELECT YOUR ANSWER FIRST <span aria-hidden="true">↗</span>';
    answerOptions.replaceChildren(...question.options.map((answer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-option';
      const marker = document.createElement('span');
      marker.textContent = String.fromCharCode(65 + index);
      button.append(marker, document.createTextNode(answer));
      button.addEventListener('click', () => selectAnswer(index));
      return button;
    }));
  }
  function selectAnswer(index) {
    selectedAnswer = index;
    [...answerOptions.children].forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('detectiveText').textContent = questions[questionIndex].responses[index];
    detectiveResponse.hidden = false;
    interviewNext.disabled = false;
    interviewNext.innerHTML = `${questionIndex === questions.length - 1 ? 'SUBMIT TESTIMONY' : 'NEXT QUESTION'} <span aria-hidden="true">↗</span>`;
    chirp('tap');
  }
  interviewNext.addEventListener('click', () => {
    if (selectedAnswer === null) return;
    if (questionIndex === questions.length - 1) goTo('verdict');
    else { questionIndex += 1; renderQuestion(); chirp('tap'); }
  });
  renderQuestion();

  // Birthday reveal, confetti, letter, and sharing.
  const birthdayLetter = document.getElementById('birthdayLetter');
  const envelopeButton = document.getElementById('envelopeButton');
  envelopeButton.addEventListener('click', () => {
    const open = envelopeButton.classList.toggle('open');
    envelopeButton.setAttribute('aria-expanded', String(open));
    birthdayLetter.hidden = !open;
    envelopeButton.querySelector('.envelope-caption').textContent = open ? 'TAP TO CLOSE LETTER' : 'TAP TO OPEN YOUR LETTER';
    chirp(open ? 'success' : 'tap');
    if (open) {
      launchConfetti(28);
      window.setTimeout(() => birthdayLetter.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'nearest' }), 220);
    }
  });
  function launchConfetti(count = 70) {
    if (reducedMotion) return;
    const layer = document.getElementById('confettiLayer');
    const colors = ['#a5474d', '#dba7a6', '#e2bb78', '#fff0dc', '#b88391', '#8d6f4b'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--duration', `${2.7 + Math.random() * 2.6}s`);
      piece.style.setProperty('--drift', `${Math.random() * 220 - 110}px`);
      piece.style.setProperty('--spin', `${Math.random() * 1100 - 550}deg`);
      piece.style.animationDelay = `${Math.random() * .7}s`;
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      layer.appendChild(piece);
    }
  }
  document.getElementById('replayButton').addEventListener('click', () => {
    questionIndex = 0;
    chargeIndex = 0;
    scanFinished = false;
    cancelScan();
    fingerprintBtn.style.setProperty('--scan-progress', '0%');
    scanStatus.textContent = 'WAITING FOR FINGERPRINT...';
    birthdayLetter.hidden = true;
    envelopeButton.classList.remove('open');
    envelopeButton.setAttribute('aria-expanded', 'false');
    envelopeButton.querySelector('.envelope-caption').textContent = 'TAP TO OPEN YOUR LETTER';
    renderCharge();
    renderQuestion();
    openedEvidence.clear();
    document.querySelectorAll('[data-evidence]').forEach(card => {
      card.classList.remove('open');
      card.setAttribute('aria-expanded', 'false');
    });
    document.getElementById('evidenceCount').textContent = '0 / 4 OPENED';
    goTo('intro');
  });
  document.getElementById('shareButton').addEventListener('click', async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Curious Case of Amna', text: 'You have been summoned to a classified birthday investigation. 🔎', url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast('Case file link copied!');
      } else {
        showToast('Copy the link from your browser to share!');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('You can share this page from your browser.');
    }
  });
})();
