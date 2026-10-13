/**
 * ✨ Magic Face Studio — AI Augmented Reality & Motion Filter Engine
 * Powered by MediaPipe FaceMesh (468 landmarks), Web Audio API, and HTML5 Canvas.
 */

// ==================== DOM ELEMENTS ====================
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const loadingMessage = document.getElementById('loadingMessage');
const surpriseEffect = document.getElementById('surpriseEffect');
const surpriseIcon = document.getElementById('surpriseIcon');
const surpriseText = document.getElementById('surpriseText');
const lowLightBadge = document.getElementById('lowLightBadge');

// Telemetry
const fpsVal = document.getElementById('fpsVal');
const faceStatusPill = document.getElementById('faceStatusPill');
const faceDot = document.getElementById('faceDot');
const faceStatusText = document.getElementById('faceStatusText');
const lightIcon = document.getElementById('lightIcon');
const lightText = document.getElementById('lightText');

// Motion HUD
const movementHud = document.getElementById('movementHud');
const hudToggleBtn = document.getElementById('hudToggleBtn');
const mouthMeterFill = document.getElementById('mouthMeterFill');
const mouthMeterVal = document.getElementById('mouthMeterVal');
const browsMeterFill = document.getElementById('browsMeterFill');
const browsMeterVal = document.getElementById('browsMeterVal');
const smileMeterFill = document.getElementById('smileMeterFill');
const smileMeterVal = document.getElementById('smileMeterVal');
const tiltMeterFill = document.getElementById('tiltMeterFill');
const tiltMeterVal = document.getElementById('tiltMeterVal');

// Capture & Controls
const captureBtn = document.getElementById('captureBtn');
const timerSelect = document.getElementById('timerSelect');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const flipMirrorBtn = document.getElementById('flipMirrorBtn');
const flashOverlay = document.getElementById('flashOverlay');
const countdownOverlay = document.getElementById('countdownOverlay');

// Lighting & Stabilization
const stabilizerToggle = document.getElementById('stabilizerToggle');
const autoBoostToggle = document.getElementById('autoBoostToggle');
const lightPresetBtns = document.querySelectorAll('.light-preset-btn');
const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessVal = document.getElementById('brightnessVal');
const contrastSlider = document.getElementById('contrastSlider');
const contrastVal = document.getElementById('contrastVal');
const smoothingSlider = document.getElementById('smoothingSlider');
const smoothingVal = document.getElementById('smoothingVal');
const resetLightingBtn = document.getElementById('resetLightingBtn');

// Gallery & Modal
const galleryStrip = document.getElementById('galleryStrip');
const emptyGalleryMsg = document.getElementById('emptyGalleryMsg');
const galleryCount = document.getElementById('galleryCount');
const snapshotModal = document.getElementById('snapshotModal');
const snapshotImg = document.getElementById('snapshotImg');
const closeModalBtn = document.getElementById('closeModalBtn');
const downloadSnapshotBtn = document.getElementById('downloadSnapshotBtn');
const copySnapshotBtn = document.getElementById('copySnapshotBtn');
const retakeBtn = document.getElementById('retakeBtn');
const snapshotTimestamp = document.getElementById('snapshotTimestamp');
const snapshotFiltersUsed = document.getElementById('snapshotFiltersUsed');
const toastContainer = document.getElementById('toastContainer');

// Filter Hub & Combos
const filterSearch = document.getElementById('filterSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const singleModeBtn = document.getElementById('singleModeBtn');
const comboModeBtn = document.getElementById('comboModeBtn');
const comboPresetsBar = document.getElementById('comboPresetsBar');
const activeLayersContainer = document.getElementById('activeLayersContainer');
const activeLayersList = document.getElementById('activeLayersList');
const clearAllLayersBtn = document.getElementById('clearAllLayersBtn');
const categoryTabs = document.querySelectorAll('.cat-tab');
const filterCards = document.querySelectorAll('.filter-card');
const presetChips = document.querySelectorAll('.preset-chip');
const filterCountBadge = document.getElementById('filterCountBadge');

// ==================== STATE MANAGEMENT ====================
let isComboMode = false;
let activeFilters = new Set(['none']);
let isMirrored = true;
let soundEnabled = true;
let useStabilizer = true;
let autoLowLightBoost = true;
let currentLightPreset = 'normal';
let isCountdownRunning = false;
let capturedSnapshots = [];
let currentModalImageBlob = null;
let currentModalDataUrl = null;

// Animation & Performance
let time = 0;
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 0;
let faceDetected = false;
let rawLandmarks = null;
let smoothedLandmarks = null;

// Particle Systems for interactive reactions
const particles = [];
const fireParticles = [];
const steamParticles = [];
const celestialParticles = [];

// ==================== AUDIO SYNTHESIZER ====================
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
}

function playShutterSound() {
    if (!soundEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const now = audioCtx.currentTime;

        // Mechanical Shutter Click: dual click sound
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1400, now);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.04);
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.04);

        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(180, now + 0.06);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain2.gain.setValueAtTime(0.6, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.12);

        // Noise burst for mechanical sound
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2400;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noise.start(now + 0.04);
    } catch (e) {
        console.warn('Audio playback error:', e);
    }
}

// ==================== HELPER MATH ====================
function dist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// ==================== AI LANDMARK STABILIZER (EMA) ====================
function updateSmoothedLandmarks(currentPoints) {
    if (!currentPoints || currentPoints.length === 0) {
        smoothedLandmarks = null;
        return null;
    }

    if (!useStabilizer) {
        smoothedLandmarks = currentPoints;
        return currentPoints;
    }

    if (!smoothedLandmarks || smoothedLandmarks.length !== currentPoints.length) {
        smoothedLandmarks = currentPoints.map(p => ({ x: p.x, y: p.y, z: p.z || 0 }));
        return smoothedLandmarks;
    }

    const checkIdxs = [10, 152, 234, 454, 4, 13];
    let motionMag = 0;
    for (const idx of checkIdxs) {
        motionMag += dist(currentPoints[idx], smoothedLandmarks[idx]);
    }
    const avgMotion = motionMag / checkIdxs.length;

    const baseSmoothing = parseInt(smoothingSlider.value, 10) / 100;

    let alpha = baseSmoothing;
    if (avgMotion > 0.015) {
        alpha = Math.max(0.15, baseSmoothing * 0.4);
    } else if (avgMotion < 0.003) {
        alpha = Math.min(0.88, baseSmoothing * 1.3);
    }

    for (let i = 0; i < currentPoints.length; i++) {
        smoothedLandmarks[i].x = smoothedLandmarks[i].x * alpha + currentPoints[i].x * (1 - alpha);
        smoothedLandmarks[i].y = smoothedLandmarks[i].y * alpha + currentPoints[i].y * (1 - alpha);
        if (currentPoints[i].z !== undefined) {
            smoothedLandmarks[i].z = (smoothedLandmarks[i].z || 0) * alpha + (currentPoints[i].z || 0) * (1 - alpha);
        }
    }

    return smoothedLandmarks;
}

// ==================== FACIAL MOVEMENT & METRICS ANALYZER ====================
function computeMotionMetrics(lm, w, h) {
    if (!lm || lm.length < 468) return null;

    const forehead = lm[10];
    const chin = lm[152];
    const faceHeight = Math.hypot((chin.x - forehead.x) * w, (chin.y - forehead.y) * h) || 1;

    const leftCheek = lm[234];
    const rightCheek = lm[454];
    const faceWidth = Math.hypot((rightCheek.x - leftCheek.x) * w, (rightCheek.y - leftCheek.y) * h) || 1;

    // 1. Mouth opening metric
    const topLip = lm[13];
    const botLip = lm[14];
    const mouthGap = Math.hypot((botLip.x - topLip.x) * w, (botLip.y - topLip.y) * h);
    const mouthRatio = mouthGap / (faceHeight * 0.35);
    const isMouthOpen = mouthRatio > 0.28;

    // 2. Eyebrow raise metric
    const leftEye = lm[159];
    const leftBrow = lm[105];
    const rightEye = lm[386];
    const rightBrow = lm[334];
    const leftBrowDist = Math.hypot((leftBrow.x - leftEye.x) * w, (leftBrow.y - leftEye.y) * h);
    const rightBrowDist = Math.hypot((rightBrow.x - rightEye.x) * w, (rightBrow.y - rightEye.y) * h);
    const avgBrowDist = (leftBrowDist + rightBrowDist) / 2;
    const browRatio = (avgBrowDist - faceHeight * 0.11) / (faceHeight * 0.09);
    const isBrowsRaised = browRatio > 0.35;

    // 3. Smile metric
    const mouthL = lm[61];
    const mouthR = lm[291];
    const mouthWidth = Math.hypot((mouthR.x - mouthL.x) * w, (mouthR.y - mouthL.y) * h);
    const smileRatio = (mouthWidth - faceWidth * 0.38) / (faceWidth * 0.15);
    const isSmiling = smileRatio > 0.45;

    // 4. Head tilt metric
    const tiltAngle = Math.atan2((rightCheek.y - leftCheek.y) * h, (rightCheek.x - leftCheek.x) * w);
    const tiltDeg = Math.round(tiltAngle * (180 / Math.PI));
    const isTilted = Math.abs(tiltDeg) > 12;

    return {
        faceHeight,
        faceWidth,
        mouthGap,
        mouthRatio: Math.min(1.5, Math.max(0, mouthRatio)),
        isMouthOpen,
        browRatio: Math.min(1.5, Math.max(0, browRatio)),
        isBrowsRaised,
        smileRatio: Math.min(1.5, Math.max(0, smileRatio)),
        isSmiling,
        tiltAngle,
        tiltDeg,
        isTilted
    };
}

function updateHUD(metrics) {
    if (!metrics) {
        mouthMeterFill.style.width = '0%';
        mouthMeterVal.textContent = '0%';
        browsMeterFill.style.width = '0%';
        browsMeterVal.textContent = '0%';
        smileMeterFill.style.width = '0%';
        smileMeterVal.textContent = '0%';
        tiltMeterFill.style.width = '0%';
        tiltMeterVal.textContent = '0°';
        surpriseEffect.classList.add('surprise-hidden');
        return;
    }

    const mouthPct = Math.min(100, Math.round(metrics.mouthRatio * 100));
    mouthMeterFill.style.width = mouthPct + '%';
    mouthMeterVal.textContent = mouthPct + '%';

    const browsPct = Math.min(100, Math.round(Math.max(0, metrics.browRatio) * 100));
    browsMeterFill.style.width = browsPct + '%';
    browsMeterVal.textContent = browsPct + '%';

    const smilePct = Math.min(100, Math.round(Math.max(0, metrics.smileRatio) * 100));
    smileMeterFill.style.width = smilePct + '%';
    smileMeterVal.textContent = smilePct + '%';

    const absTilt = Math.min(45, Math.abs(metrics.tiltDeg));
    const tiltPct = Math.min(100, Math.round((absTilt / 45) * 100));
    tiltMeterFill.style.width = tiltPct + '%';
    tiltMeterVal.textContent = metrics.tiltDeg + '°';

    // Interactive dynamic banners
    let bannerText = "";
    let bannerIcon = "";

    if (activeFilters.has('dragon') && metrics.isMouthOpen) {
        bannerIcon = "🔥";
        bannerText = "DRAGON FIRE BREATHING!";
    } else if (activeFilters.has('celestial') && metrics.isBrowsRaised) {
        bannerIcon = "✨";
        bannerText = "DIVINE HALO SHOCKWAVE!";
    } else if (activeFilters.has('steampunk') && (metrics.isMouthOpen || metrics.isBrowsRaised)) {
        bannerIcon = "⚙️";
        bannerText = "STEAM PRESSURE RED-LINE!";
    } else if (activeFilters.has('cat') && metrics.isSmiling) {
        bannerIcon = "💖";
        bannerText = "PURRING WITH JOY!";
    } else if (activeFilters.has('party') && metrics.isMouthOpen) {
        bannerIcon = "🎉";
        bannerText = "CONFETTI EXPLOSION!";
    } else if (metrics.isMouthOpen) {
        bannerIcon = "😮";
        bannerText = "MOUTH OPEN DETECTED";
    } else if (metrics.isBrowsRaised) {
        bannerIcon = "🤯";
        bannerText = "BROWS RAISED DETECTED";
    } else if (metrics.isSmiling) {
        bannerIcon = "😊";
        bannerText = "SMILE DETECTED";
    } else if (metrics.isTilted) {
        bannerIcon = "🌀";
        bannerText = `HEAD TILT (${metrics.tiltDeg}°)`;
    }

    if (bannerText) {
        surpriseIcon.textContent = bannerIcon;
        surpriseText.textContent = bannerText;
        surpriseEffect.classList.remove('surprise-hidden');
    } else {
        surpriseEffect.classList.add('surprise-hidden');
    }
}

// ==================== LIGHTING ENGINE & SIMULATION ====================
let frameLuminance = 120;

function sampleLuminance() {
    if (!videoElement.videoWidth || frameCount % 15 !== 0) return;
    try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 16;
        offCanvas.height = 12;
        const ctx = offCanvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, 16, 12);
        const imgData = ctx.getImageData(0, 0, 16, 12).data;
        let total = 0;
        for (let i = 0; i < imgData.length; i += 4) {
            total += 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
        }
        frameLuminance = total / (imgData.length / 4);

        if (frameLuminance < 65) {
            lightIcon.textContent = "🌙";
            lightText.textContent = `Lighting: Dim (${Math.round(frameLuminance)})`;
            if (autoLowLightBoost) {
                lowLightBadge.classList.remove('hidden');
            } else {
                lowLightBadge.classList.add('hidden');
            }
        } else if (frameLuminance > 190) {
            lightIcon.textContent = "☀️";
            lightText.textContent = `Lighting: High (${Math.round(frameLuminance)})`;
            lowLightBadge.classList.add('hidden');
        } else {
            lightIcon.textContent = "🌤️";
            lightText.textContent = `Lighting: Good (${Math.round(frameLuminance)})`;
            lowLightBadge.classList.add('hidden');
        }
    } catch (e) {
        // ignore read errors
    }
}

function getActiveCanvasFilterString() {
    let b = parseInt(brightnessSlider.value, 10);
    let c = parseInt(contrastSlider.value, 10);

    if (autoLowLightBoost && frameLuminance < 70 && currentLightPreset === 'normal') {
        b = Math.min(200, Math.round(b * 1.35));
        c = Math.min(200, Math.round(c * 1.15));
    }

    let filterStr = `brightness(${b}%) contrast(${c}%)`;

    switch (currentLightPreset) {
        case 'dim':
            filterStr += ` brightness(55%) contrast(85%) saturate(80%)`;
            break;
        case 'backlight':
            filterStr += ` brightness(60%) contrast(170%) saturate(70%)`;
            break;
        case 'cyber':
            filterStr += ` hue-rotate(275deg) saturate(190%) contrast(125%)`;
            break;
        case 'candle':
            filterStr += ` sepia(70%) brightness(75%) contrast(115%) saturate(140%)`;
            break;
        default:
            break;
    }

    return filterStr;
}

// ==================== NEW CREATIVE FILTER 1: CELESTIAL HALO & STARDUST ====================
function drawCelestial(lm, w, h, metrics) {
    const forehead = lm[10];
    const faceH = metrics ? metrics.faceHeight : 150;
    const tilt = metrics ? metrics.tiltAngle : 0;
    const browBoost = metrics ? metrics.browRatio : 0;
    const isMouthOpen = metrics ? metrics.isMouthOpen : false;

    canvasCtx.save();

    // 1. Floating 3D Golden Halo
    const haloElevation = faceH * (0.35 + browBoost * 0.2);
    const haloX = forehead.x * w - Math.sin(tilt) * haloElevation;
    const haloY = forehead.y * h - Math.cos(tilt) * haloElevation;
    const haloRadiusX = faceH * 0.42;
    const haloRadiusY = haloRadiusX * 0.32;

    canvasCtx.translate(haloX, haloY);
    canvasCtx.rotate(tilt);

    const haloGlow = 25 + Math.sin(time * 0.1) * 8 + (browBoost > 0.3 ? 20 : 0);
    canvasCtx.shadowBlur = haloGlow;
    canvasCtx.shadowColor = 'rgba(255, 215, 0, 0.95)';

    canvasCtx.beginPath();
    canvasCtx.ellipse(0, 0, haloRadiusX, haloRadiusY, 0, 0, Math.PI * 2);
    const haloGrad = canvasCtx.createLinearGradient(-haloRadiusX, 0, haloRadiusX, 0);
    haloGrad.addColorStop(0, '#FFE082');
    haloGrad.addColorStop(0.5, '#FFF8E1');
    haloGrad.addColorStop(1, '#FFD54F');
    canvasCtx.strokeStyle = haloGrad;
    canvasCtx.lineWidth = 9;
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.ellipse(0, 0, haloRadiusX, haloRadiusY, 0, 0, Math.PI * 2);
    canvasCtx.strokeStyle = '#FFFFFF';
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();

    if (browBoost > 0.3) {
        const shockwaveSize = 1 + (time % 20) / 10;
        canvasCtx.beginPath();
        canvasCtx.ellipse(0, 0, haloRadiusX * shockwaveSize, haloRadiusY * shockwaveSize, 0, 0, Math.PI * 2);
        canvasCtx.strokeStyle = `rgba(255, 235, 59, ${1 - (time % 20) / 20})`;
        canvasCtx.lineWidth = 4;
        canvasCtx.stroke();
    }

    const starCount = 6;
    for (let i = 0; i < starCount; i++) {
        const starAngle = (time * 0.04) + (i * (Math.PI * 2) / starCount);
        const sx = Math.cos(starAngle) * haloRadiusX;
        const sy = Math.sin(starAngle) * haloRadiusY;

        canvasCtx.fillStyle = '#FFFDE7';
        canvasCtx.shadowColor = '#FFEB3B';
        canvasCtx.shadowBlur = 10;

        canvasCtx.beginPath();
        canvasCtx.moveTo(sx, sy - 6);
        canvasCtx.lineTo(sx + 4, sy);
        canvasCtx.lineTo(sx, sy + 6);
        canvasCtx.lineTo(sx - 4, sy);
        canvasCtx.closePath();
        canvasCtx.fill();
    }

    canvasCtx.restore();

    // 2. Celestial Forehead Rune
    const midForehead = lm[9];
    canvasCtx.save();
    canvasCtx.translate(midForehead.x * w, midForehead.y * h);
    canvasCtx.rotate(tilt);
    canvasCtx.shadowBlur = 15;
    canvasCtx.shadowColor = '#FFD700';

    canvasCtx.fillStyle = '#FFE082';
    for (let r = 0; r < 2; r++) {
        canvasCtx.rotate(Math.PI / 4);
        canvasCtx.fillRect(-3, -12, 6, 24);
    }
    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, 4, 0, Math.PI * 2);
    canvasCtx.fillStyle = '#FFFFFF';
    canvasCtx.fill();
    canvasCtx.restore();

    // 3. Starlight Tears & Cheeks
    const leftCheek = lm[205];
    const rightCheek = lm[425];
    [leftCheek, rightCheek].forEach(p => {
        canvasCtx.save();
        canvasCtx.translate(p.x * w, p.y * h);
        canvasCtx.fillStyle = 'rgba(255, 235, 59, 0.85)';
        canvasCtx.shadowBlur = 12;
        canvasCtx.shadowColor = '#FFD700';

        const twinkle = Math.sin(time * 0.15 + p.x * 10) * 2;
        canvasCtx.beginPath();
        canvasCtx.moveTo(0, -8 - twinkle);
        canvasCtx.lineTo(2, 0);
        canvasCtx.lineTo(0, 8 + twinkle);
        canvasCtx.lineTo(-2, 0);
        canvasCtx.closePath();
        canvasCtx.fill();

        canvasCtx.beginPath();
        canvasCtx.moveTo(-8 - twinkle, 0);
        canvasCtx.lineTo(0, 2);
        canvasCtx.lineTo(8 + twinkle, 0);
        canvasCtx.lineTo(0, -2);
        canvasCtx.closePath();
        canvasCtx.fill();
        canvasCtx.restore();
    });

    // 4. Starlight Beam on Mouth Open
    if (isMouthOpen) {
        const topLip = lm[13];
        const botLip = lm[14];
        const mx = ((topLip.x + botLip.x) / 2) * w;
        const my = ((topLip.y + botLip.y) / 2) * h;

        if (celestialParticles.length < 50) {
            celestialParticles.push({
                x: mx + (Math.random() - 0.5) * 20,
                y: my,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 4 - 2,
                size: Math.random() * 5 + 3,
                life: 1.0
            });
        }
    }

    for (let i = celestialParticles.length - 1; i >= 0; i--) {
        const cp = celestialParticles[i];
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.life -= 0.025;
        if (cp.life <= 0) {
            celestialParticles.splice(i, 1);
            continue;
        }

        canvasCtx.save();
        canvasCtx.shadowBlur = 10;
        canvasCtx.shadowColor = '#FFD700';
        canvasCtx.fillStyle = `rgba(255, 255, 200, ${cp.life})`;
        canvasCtx.beginPath();
        canvasCtx.arc(cp.x, cp.y, cp.size * cp.life, 0, Math.PI * 2);
        canvasCtx.fill();
        canvasCtx.restore();
    }
}

// ==================== NEW CREATIVE FILTER 2: DRAGON HORNS & FLAME ====================
function drawDragon(lm, w, h, metrics) {
    const leftTemple = lm[103];
    const rightTemple = lm[332];
    const faceH = metrics ? metrics.faceHeight : 150;
    const tilt = metrics ? metrics.tiltAngle : 0;
    const isMouthOpen = metrics ? metrics.isMouthOpen : false;
    const mouthRatio = metrics ? metrics.mouthRatio : 0;
    const isBrowsRaised = metrics ? metrics.isBrowsRaised : false;

    function drawHorn(rootX, rootY, direction) {
        canvasCtx.save();
        canvasCtx.translate(rootX, rootY);
        canvasCtx.rotate(tilt);

        const hornLength = faceH * 0.75;
        const hornWidth = faceH * 0.16;

        canvasCtx.beginPath();
        canvasCtx.moveTo(-hornWidth * 0.5 * direction, 0);

        const cp1x = -direction * hornWidth * 1.5;
        const cp1y = -hornLength * 0.45;
        const cp2x = -direction * hornLength * 0.5;
        const cp2y = -hornLength * 0.85;
        const tipX = -direction * hornLength * 0.35;
        const tipY = -hornLength;

        canvasCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tipX, tipY);

        const cp3x = -direction * hornLength * 0.2;
        const cp3y = -hornLength * 0.6;
        const cp4x = direction * hornWidth * 0.2;
        const cp4y = -hornLength * 0.25;

        canvasCtx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, hornWidth * 0.5 * direction, 0);
        canvasCtx.closePath();

        const hornGrad = canvasCtx.createLinearGradient(0, 0, tipX, tipY);
        hornGrad.addColorStop(0, '#1c0808');
        hornGrad.addColorStop(0.5, '#3b1010');
        hornGrad.addColorStop(0.85, '#ff4500');
        hornGrad.addColorStop(1, '#ffaa00');

        canvasCtx.fillStyle = hornGrad;
        canvasCtx.fill();

        canvasCtx.strokeStyle = '#ff3300';
        canvasCtx.lineWidth = 2.5;
        canvasCtx.shadowBlur = isBrowsRaised ? 25 : 12;
        canvasCtx.shadowColor = '#ff4500';
        canvasCtx.stroke();

        for (let r = 1; r <= 4; r++) {
            const t = r / 5;
            const rx = t * tipX * 0.7;
            const ry = -t * hornLength * 0.7;
            canvasCtx.beginPath();
            canvasCtx.ellipse(rx, ry, hornWidth * (1 - t * 0.5) * 0.5, 4, direction * 0.3, 0, Math.PI * 2);
            canvasCtx.strokeStyle = 'rgba(255, 140, 0, 0.75)';
            canvasCtx.lineWidth = 2;
            canvasCtx.stroke();
        }

        canvasCtx.beginPath();
        canvasCtx.arc(tipX, tipY, 6 + Math.sin(time * 0.2) * 2, 0, Math.PI * 2);
        canvasCtx.fillStyle = '#ffffaa';
        canvasCtx.shadowBlur = 18;
        canvasCtx.shadowColor = '#ff6600';
        canvasCtx.fill();

        canvasCtx.restore();
    }

    drawHorn(leftTemple.x * w, leftTemple.y * h, 1);
    drawHorn(rightTemple.x * w, rightTemple.y * h, -1);

    // Molten Dragon Eyes
    const leftEye = lm[159];
    const rightEye = lm[386];
    [leftEye, rightEye].forEach(eye => {
        canvasCtx.save();
        canvasCtx.translate(eye.x * w, eye.y * h);
        canvasCtx.shadowBlur = 18;
        canvasCtx.shadowColor = '#ff3300';

        canvasCtx.beginPath();
        canvasCtx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
        canvasCtx.fillStyle = 'rgba(255, 69, 0, 0.7)';
        canvasCtx.fill();

        canvasCtx.beginPath();
        canvasCtx.ellipse(0, 0, 3, 14, 0, 0, Math.PI * 2);
        canvasCtx.fillStyle = '#000000';
        canvasCtx.fill();
        canvasCtx.restore();
    });

    // Volcanic Scales on Cheeks
    const leftCheek = lm[205];
    const rightCheek = lm[425];
    [leftCheek, rightCheek].forEach((c, idx) => {
        canvasCtx.save();
        const dir = idx === 0 ? -1 : 1;
        canvasCtx.translate(c.x * w, c.y * h);
        canvasCtx.strokeStyle = 'rgba(255, 80, 0, 0.7)';
        canvasCtx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            canvasCtx.beginPath();
            canvasCtx.arc(dir * i * 8, i * 6, 8, 0, Math.PI);
            canvasCtx.stroke();
        }
        canvasCtx.restore();
    });

    // Fire Breathing Engine on Mouth Open
    if (isMouthOpen) {
        const topLip = lm[13];
        const botLip = lm[14];
        const mouthX = ((topLip.x + botLip.x) / 2) * w;
        const mouthY = ((topLip.y + botLip.y) / 2) * h;

        const countToSpawn = Math.min(10, Math.round(mouthRatio * 8) + 3);
        for (let i = 0; i < countToSpawn; i++) {
            fireParticles.push({
                x: mouthX + (Math.random() - 0.5) * 15,
                y: mouthY + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 8 + Math.sin(tilt) * 5,
                vy: Math.random() * 8 + 3,
                size: Math.random() * 14 + 10,
                maxLife: 30 + Math.random() * 20,
                life: 0,
                hue: Math.random() > 0.3 ? 30 : 0
            });
        }
    }

    for (let i = fireParticles.length - 1; i >= 0; i--) {
        const p = fireParticles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 1.03;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
            fireParticles.splice(i, 1);
            continue;
        }

        const alpha = 1 - progress;
        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        const flameGrad = canvasCtx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.size);
        if (progress < 0.3) {
            flameGrad.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
            flameGrad.addColorStop(0.6, `rgba(255, 160, 0, ${alpha * 0.8})`);
            flameGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
        } else if (progress < 0.7) {
            flameGrad.addColorStop(0, `rgba(255, 100, 0, ${alpha})`);
            flameGrad.addColorStop(0.7, `rgba(180, 20, 0, ${alpha * 0.6})`);
            flameGrad.addColorStop(1, `rgba(80, 0, 0, 0)`);
        } else {
            flameGrad.addColorStop(0, `rgba(60, 60, 60, ${alpha * 0.4})`);
            flameGrad.addColorStop(1, `rgba(20, 20, 20, 0)`);
        }

        canvasCtx.fillStyle = flameGrad;
        canvasCtx.shadowBlur = 15 * (1 - progress);
        canvasCtx.shadowColor = '#ff4500';
        canvasCtx.fill();
        canvasCtx.restore();
    }
}

// ==================== NEW CREATIVE FILTER 3: STEAMPUNK CHRONO-INVENTOR ====================
function drawSteampunk(lm, w, h, metrics) {
    const leftEyeCenter = lm[33];
    const forehead = lm[10];
    const faceH = metrics ? metrics.faceHeight : 150;
    const tilt = metrics ? metrics.tiltAngle : 0;
    const browBoost = metrics ? metrics.browRatio : 0;
    const mouthOpen = metrics ? metrics.isMouthOpen : false;

    // 1. Rotating Brass Chrono-Monocle
    const monocleX = leftEyeCenter.x * w;
    const monocleY = leftEyeCenter.y * h;
    const monocleRadius = faceH * 0.16;

    canvasCtx.save();
    canvasCtx.translate(monocleX, monocleY);
    canvasCtx.rotate(tilt);

    canvasCtx.beginPath();
    canvasCtx.moveTo(-monocleRadius, 0);
    canvasCtx.lineTo(-monocleRadius * 2.2, -monocleRadius * 0.3);
    canvasCtx.lineWidth = 6;
    canvasCtx.strokeStyle = '#4a2e18';
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, monocleRadius, 0, Math.PI * 2);
    const brassGrad = canvasCtx.createLinearGradient(-monocleRadius, -monocleRadius, monocleRadius, monocleRadius);
    brassGrad.addColorStop(0, '#ffd700');
    brassGrad.addColorStop(0.3, '#b8860b');
    brassGrad.addColorStop(0.7, '#8b6508');
    brassGrad.addColorStop(1, '#cd853f');
    canvasCtx.strokeStyle = brassGrad;
    canvasCtx.lineWidth = 9;
    canvasCtx.stroke();

    for (let i = 0; i < 8; i++) {
        const rivetAngle = (i * Math.PI) / 4;
        const rx = Math.cos(rivetAngle) * monocleRadius;
        const ry = Math.sin(rivetAngle) * monocleRadius;
        canvasCtx.beginPath();
        canvasCtx.arc(rx, ry, 2.5, 0, Math.PI * 2);
        canvasCtx.fillStyle = '#fff8dc';
        canvasCtx.fill();
    }

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, monocleRadius - 4, 0, Math.PI * 2);
    canvasCtx.fillStyle = 'rgba(255, 140, 0, 0.35)';
    canvasCtx.fill();

    const gearRadius = monocleRadius * 0.72;
    const gearTeeth = 10;
    const gearRotation = time * 0.04;

    canvasCtx.save();
    canvasCtx.rotate(gearRotation);
    canvasCtx.beginPath();
    for (let t = 0; t < gearTeeth * 2; t++) {
        const angle = (t * Math.PI) / gearTeeth;
        const r = t % 2 === 0 ? gearRadius : gearRadius - 5;
        const gx = Math.cos(angle) * r;
        const gy = Math.sin(angle) * r;
        if (t === 0) canvasCtx.moveTo(gx, gy);
        else canvasCtx.lineTo(gx, gy);
    }
    canvasCtx.closePath();
    canvasCtx.strokeStyle = '#daa520';
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.moveTo(-gearRadius * 0.6, 0); canvasCtx.lineTo(gearRadius * 0.6, 0);
    canvasCtx.moveTo(0, -gearRadius * 0.6); canvasCtx.lineTo(0, gearRadius * 0.6);
    canvasCtx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
    canvasCtx.lineWidth = 1.5;
    canvasCtx.stroke();
    canvasCtx.restore();

    canvasCtx.restore();

    // 2. Forehead Steam Pressure Gauge
    const gaugeX = forehead.x * w;
    const gaugeY = forehead.y * h - faceH * 0.12;
    const gaugeRadius = faceH * 0.12;

    canvasCtx.save();
    canvasCtx.translate(gaugeX, gaugeY);
    canvasCtx.rotate(tilt);

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, gaugeRadius, 0, Math.PI * 2);
    canvasCtx.fillStyle = '#2c1e11';
    canvasCtx.fill();
    canvasCtx.strokeStyle = '#cd853f';
    canvasCtx.lineWidth = 6;
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, gaugeRadius - 4, 0, Math.PI * 2);
    canvasCtx.fillStyle = '#fffae8';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, gaugeRadius - 8, Math.PI * 1.5, Math.PI * 2);
    canvasCtx.strokeStyle = '#dc2626';
    canvasCtx.lineWidth = 5;
    canvasCtx.stroke();

    canvasCtx.strokeStyle = '#333';
    canvasCtx.lineWidth = 1.5;
    for (let k = 0; k < 7; k++) {
        const kAngle = Math.PI * 0.75 + (k * Math.PI) / 4;
        canvasCtx.beginPath();
        canvasCtx.moveTo(Math.cos(kAngle) * (gaugeRadius - 12), Math.sin(kAngle) * (gaugeRadius - 12));
        canvasCtx.lineTo(Math.cos(kAngle) * (gaugeRadius - 6), Math.sin(kAngle) * (gaugeRadius - 6));
        canvasCtx.stroke();
    }

    let pressure = 0.25 + (browBoost * 0.7) + (mouthOpen ? 0.65 : 0);
    pressure = Math.min(1.0, Math.max(0.1, pressure));
    const needleAngle = Math.PI * 0.75 + pressure * (Math.PI * 1.5);

    canvasCtx.beginPath();
    canvasCtx.moveTo(0, 0);
    canvasCtx.lineTo(Math.cos(needleAngle) * (gaugeRadius - 6), Math.sin(needleAngle) * (gaugeRadius - 6));
    canvasCtx.strokeStyle = pressure > 0.75 ? '#ef4444' : '#111827';
    canvasCtx.lineWidth = 2.5;
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.arc(0, 0, 4, 0, Math.PI * 2);
    canvasCtx.fillStyle = '#b8860b';
    canvasCtx.fill();

    canvasCtx.restore();

    // 3. Steam Burst Effect when Pressure Spikes!
    if (pressure > 0.65) {
        if (steamParticles.length < 40) {
            for (let s = -1; s <= 1; s += 2) {
                steamParticles.push({
                    x: gaugeX + s * gaugeRadius,
                    y: gaugeY,
                    vx: s * (Math.random() * 4 + 2),
                    vy: -Math.random() * 4 - 2,
                    size: Math.random() * 8 + 6,
                    maxLife: 25,
                    life: 0
                });
            }
        }
    }

    for (let i = steamParticles.length - 1; i >= 0; i--) {
        const sp = steamParticles[i];
        sp.life++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.size *= 1.05;

        const progress = sp.life / sp.maxLife;
        if (progress >= 1) {
            steamParticles.splice(i, 1);
            continue;
        }

        const alpha = (1 - progress) * 0.55;
        canvasCtx.save();
        canvasCtx.beginPath();
        canvasCtx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        canvasCtx.fillStyle = `rgba(240, 240, 255, ${alpha})`;
        canvasCtx.fill();
        canvasCtx.restore();
    }
}

// ==================== EXISTING FILTERS ====================
function drawClown(landmarks, w, h, metrics) {
    const nose = landmarks[4];
    const leftCheek = landmarks[205];
    const rightCheek = landmarks[425];
    const topLip = landmarks[13];
    const bottomLip = landmarks[14];
    const forehead = landmarks[10];
    const isMouthOpen = metrics ? metrics.isMouthOpen : false;

    canvasCtx.beginPath();
    canvasCtx.ellipse(((topLip.x + bottomLip.x) / 2) * w, ((topLip.y + bottomLip.y) / 2) * h, 45, 35, 0, 0, 2 * Math.PI);
    canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.ellipse(((topLip.x + bottomLip.x) / 2) * w, ((topLip.y + bottomLip.y) / 2) * h, 28, isMouthOpen ? 18 : 12, 0, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#ff0033';
    canvasCtx.fill();

    const noseR = 26 + (metrics && metrics.isBrowsRaised ? 6 : 0);
    canvasCtx.beginPath();
    canvasCtx.arc(nose.x * w, nose.y * h, noseR, 0, 2 * Math.PI);
    let gradient = canvasCtx.createRadialGradient(nose.x * w - 6, nose.y * h - 6, 2, nose.x * w, nose.y * h, noseR);
    gradient.addColorStop(0, '#ff9999');
    gradient.addColorStop(0.7, '#ff0000');
    gradient.addColorStop(1, '#8B0000');
    canvasCtx.fillStyle = gradient;
    canvasCtx.fill();
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'darkred';
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.arc(leftCheek.x * w, leftCheek.y * h, 22, 0, 2 * Math.PI);
    canvasCtx.arc(rightCheek.x * w, rightCheek.y * h, 22, 0, 2 * Math.PI);
    canvasCtx.fillStyle = 'rgba(255, 20, 147, 0.7)';
    canvasCtx.fill();

    const hatBounce = Math.sin(time * 0.15) * 6;
    canvasCtx.beginPath();
    canvasCtx.moveTo(forehead.x * w - 35, forehead.y * h - 20);
    canvasCtx.lineTo(forehead.x * w + 35, forehead.y * h - 20);
    canvasCtx.lineTo(forehead.x * w, forehead.y * h - 110 + hatBounce);
    canvasCtx.fillStyle = '#1e90ff';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.arc(forehead.x * w, forehead.y * h - 110 + hatBounce, 16, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#ffd700';
    canvasCtx.fill();
}

function drawNeon(landmarks, w, h, metrics) {
    canvasCtx.save();
    const glowAmount = metrics && metrics.isBrowsRaised ? 30 : 15;
    canvasCtx.shadowBlur = glowAmount;
    const colors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00'];
    const color = colors[Math.floor((time / 10) % colors.length)];
    canvasCtx.shadowColor = color;
    drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: color, lineWidth: 1.5 });
    canvasCtx.restore();
}

function drawAlien(landmarks, w, h, metrics) {
    canvasCtx.save();
    canvasCtx.beginPath();
    for (let i = 0; i < FACEMESH_FACE_OVAL.length; i++) {
        const point = landmarks[FACEMESH_FACE_OVAL[i][0]];
        if (i === 0) canvasCtx.moveTo(point.x * w, point.y * h);
        else canvasCtx.lineTo(point.x * w, point.y * h);
    }
    canvasCtx.closePath();
    canvasCtx.fillStyle = 'rgba(50, 255, 50, 0.38)';
    canvasCtx.fill();

    const leftEye = landmarks[159];
    const rightEye = landmarks[386];
    const eyeSize = metrics && metrics.isBrowsRaised ? 40 : 32;

    const eyeGradL = canvasCtx.createRadialGradient(leftEye.x * w, leftEye.y * h, 5, leftEye.x * w, leftEye.y * h, eyeSize);
    eyeGradL.addColorStop(0, '#555');
    eyeGradL.addColorStop(1, '#000');

    const eyeGradR = canvasCtx.createRadialGradient(rightEye.x * w, rightEye.y * h, 5, rightEye.x * w, rightEye.y * h, eyeSize);
    eyeGradR.addColorStop(0, '#555');
    eyeGradR.addColorStop(1, '#000');

    canvasCtx.beginPath();
    canvasCtx.ellipse(leftEye.x * w - 5, leftEye.y * h + 10, eyeSize, eyeSize * 1.5, Math.PI / 5, 0, 2 * Math.PI);
    canvasCtx.fillStyle = eyeGradL;
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.ellipse(rightEye.x * w + 5, rightEye.y * h + 10, eyeSize, eyeSize * 1.5, -Math.PI / 5, 0, 2 * Math.PI);
    canvasCtx.fillStyle = eyeGradR;
    canvasCtx.fill();
    canvasCtx.restore();
}

function drawParty(landmarks, w, h, metrics) {
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const eyeDist = (rightEye.x - leftEye.x) * w;
    const gWidth = eyeDist * 2.5;
    const gHeight = gWidth * 0.45;
    const cX = ((leftEye.x + rightEye.x) / 2) * w;
    const cY = ((leftEye.y + rightEye.y) / 2) * h;
    const isMouthOpen = metrics ? metrics.isMouthOpen : false;

    canvasCtx.save();
    canvasCtx.translate(cX, cY);
    canvasCtx.rotate(Math.sin(time / 10) * 0.1);

    canvasCtx.beginPath();
    canvasCtx.roundRect(-gWidth / 2, -gHeight / 2, gWidth, gHeight, 20);
    canvasCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    canvasCtx.fill();
    canvasCtx.lineWidth = 8;
    canvasCtx.strokeStyle = 'hsl(' + (time * 5 % 360) + ', 100%, 50%)';
    canvasCtx.stroke();
    canvasCtx.restore();

    if (isMouthOpen && particles.length < 60) {
        const topLip = landmarks[13];
        particles.push({
            x: topLip.x * w,
            y: topLip.y * h,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 8 - 3,
            color: 'hsl(' + Math.floor(Math.random() * 360) + ', 100%, 50%)',
            size: Math.random() * 6 + 4,
            life: 1.0
        });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const cp = particles[i];
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.vy += 0.3;
        cp.life -= 0.02;
        if (cp.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        canvasCtx.save();
        canvasCtx.fillStyle = cp.color;
        canvasCtx.fillRect(cp.x, cp.y, cp.size, cp.size);
        canvasCtx.restore();
    }
}

function drawCyberpunk(landmarks, w, h, metrics) {
    const rightEye = landmarks[263];
    const leftEye = landmarks[33];
    const forehead = landmarks[10];
    const isBrowsRaised = metrics ? metrics.isBrowsRaised : false;

    canvasCtx.beginPath();
    canvasCtx.rect(leftEye.x * w - 30, leftEye.y * h - 15, 60, 30);
    canvasCtx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    canvasCtx.fill();
    canvasCtx.strokeStyle = '#00ffff';
    canvasCtx.lineWidth = 2;
    canvasCtx.stroke();

    canvasCtx.beginPath();
    canvasCtx.arc(rightEye.x * w, rightEye.y * h, isBrowsRaised ? 28 : 20, 0, 2 * Math.PI);
    canvasCtx.strokeStyle = '#ff003c';
    canvasCtx.lineWidth = 3;
    canvasCtx.setLineDash([10, 5]);
    canvasCtx.stroke();
    canvasCtx.setLineDash([]);

    canvasCtx.beginPath();
    canvasCtx.arc(rightEye.x * w, rightEye.y * h, 5, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#ff003c';
    canvasCtx.shadowBlur = 20;
    canvasCtx.shadowColor = '#ff003c';
    canvasCtx.fill();
    canvasCtx.shadowBlur = 0;

    canvasCtx.beginPath();
    canvasCtx.moveTo(landmarks[103].x * w, landmarks[103].y * h);
    canvasCtx.lineTo(landmarks[67].x * w, landmarks[67].y * h);
    canvasCtx.lineTo(landmarks[109].x * w, landmarks[109].y * h);
    canvasCtx.lineTo(landmarks[109].x * w - 20, landmarks[109].y * h + 20);
    canvasCtx.strokeStyle = '#fcee0a';
    canvasCtx.lineWidth = 3;
    canvasCtx.stroke();

    canvasCtx.fillStyle = '#00ff00';
    canvasCtx.font = "13px 'JetBrains Mono', Courier";
    const statusTxt = isBrowsRaised ? "ALERT: THREAT DETECTED" : "UPLINK SECURE";
    canvasCtx.fillText(statusTxt, forehead.x * w - 50, forehead.y * h - 10);
    canvasCtx.fillText(`CPU: ${(90 + Math.sin(time * 0.1) * 8).toFixed(0)}%`, forehead.x * w - 50, forehead.y * h + 8);
}

function drawCat(landmarks, w, h, metrics) {
    const nose = landmarks[4];
    const leftForehead = landmarks[54];
    const rightForehead = landmarks[284];
    const leftCheek = landmarks[205];
    const rightCheek = landmarks[425];
    const isSmiling = metrics ? metrics.isSmiling : false;

    canvasCtx.beginPath();
    canvasCtx.ellipse(nose.x * w, nose.y * h, 12, 8, 0, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#ff6699';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.moveTo(leftForehead.x * w, leftForehead.y * h);
    canvasCtx.lineTo(leftForehead.x * w - 25, leftForehead.y * h - 55);
    canvasCtx.lineTo(leftForehead.x * w + 25, leftForehead.y * h - 20);
    canvasCtx.fillStyle = '#333';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.moveTo(leftForehead.x * w, leftForehead.y * h);
    canvasCtx.lineTo(leftForehead.x * w - 12, leftForehead.y * h - 38);
    canvasCtx.lineTo(leftForehead.x * w + 12, leftForehead.y * h - 18);
    canvasCtx.fillStyle = 'pink';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.moveTo(rightForehead.x * w, rightForehead.y * h);
    canvasCtx.lineTo(rightForehead.x * w + 25, rightForehead.y * h - 55);
    canvasCtx.lineTo(rightForehead.x * w - 25, rightForehead.y * h - 20);
    canvasCtx.fillStyle = '#333';
    canvasCtx.fill();

    canvasCtx.beginPath();
    canvasCtx.moveTo(rightForehead.x * w, rightForehead.y * h);
    canvasCtx.lineTo(rightForehead.x * w + 12, rightForehead.y * h - 38);
    canvasCtx.lineTo(rightForehead.x * w - 12, rightForehead.y * h - 18);
    canvasCtx.fillStyle = 'pink';
    canvasCtx.fill();

    canvasCtx.strokeStyle = isSmiling ? '#ff69b4' : '#ffffff';
    canvasCtx.lineWidth = 3;
    canvasCtx.lineCap = 'round';

    canvasCtx.beginPath(); canvasCtx.moveTo(leftCheek.x * w, leftCheek.y * h); canvasCtx.lineTo(leftCheek.x * w - 50, leftCheek.y * h - 10); canvasCtx.stroke();
    canvasCtx.beginPath(); canvasCtx.moveTo(leftCheek.x * w, leftCheek.y * h + 10); canvasCtx.lineTo(leftCheek.x * w - 55, leftCheek.y * h + 10); canvasCtx.stroke();
    canvasCtx.beginPath(); canvasCtx.moveTo(leftCheek.x * w, leftCheek.y * h + 20); canvasCtx.lineTo(leftCheek.x * w - 50, leftCheek.y * h + 30); canvasCtx.stroke();

    canvasCtx.beginPath(); canvasCtx.moveTo(rightCheek.x * w, rightCheek.y * h); canvasCtx.lineTo(rightCheek.x * w + 50, rightCheek.y * h - 10); canvasCtx.stroke();
    canvasCtx.beginPath(); canvasCtx.moveTo(rightCheek.x * w, rightCheek.y * h + 10); canvasCtx.lineTo(rightCheek.x * w + 55, rightCheek.y * h + 10); canvasCtx.stroke();
    canvasCtx.beginPath(); canvasCtx.moveTo(rightCheek.x * w, rightCheek.y * h + 20); canvasCtx.lineTo(rightCheek.x * w + 50, rightCheek.y * h + 30); canvasCtx.stroke();
}

function drawBandit(landmarks, w, h) {
    const leftEyeOut = landmarks[33];
    const rightEyeOut = landmarks[263];
    const nose = landmarks[197];

    canvasCtx.beginPath();
    canvasCtx.moveTo(leftEyeOut.x * w - 25, leftEyeOut.y * h - 22);
    canvasCtx.lineTo(rightEyeOut.x * w + 25, rightEyeOut.y * h - 22);
    canvasCtx.lineTo(rightEyeOut.x * w + 35, rightEyeOut.y * h + 32);
    canvasCtx.lineTo(nose.x * w, nose.y * h + 12);
    canvasCtx.lineTo(leftEyeOut.x * w - 35, leftEyeOut.y * h + 32);
    canvasCtx.closePath();

    canvasCtx.fillStyle = 'rgba(15, 15, 15, 0.95)';
    canvasCtx.fill();
    canvasCtx.lineWidth = 4;
    canvasCtx.strokeStyle = 'black';
    canvasCtx.stroke();
}

function drawRobot(landmarks, w, h, metrics) {
    canvasCtx.save();
    canvasCtx.globalCompositeOperation = 'color-burn';
    canvasCtx.fillStyle = 'rgba(100, 150, 200, 0.5)';
    canvasCtx.beginPath();
    for (let i = 0; i < FACEMESH_FACE_OVAL.length; i++) {
        const p = landmarks[FACEMESH_FACE_OVAL[i][0]];
        if (i === 0) canvasCtx.moveTo(p.x * w, p.y * h);
        else canvasCtx.lineTo(p.x * w, p.y * h);
    }
    canvasCtx.fill();
    canvasCtx.globalCompositeOperation = 'source-over';

    drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, { color: '#88aaff', lineWidth: 0.5 });

    const forehead = landmarks[10];
    const isBrowsRaised = metrics ? metrics.isBrowsRaised : false;
    canvasCtx.beginPath();
    canvasCtx.arc(forehead.x * w, forehead.y * h, isBrowsRaised ? 18 : 12, 0, 2 * Math.PI);
    canvasCtx.fillStyle = '#00ffcc';
    canvasCtx.shadowBlur = isBrowsRaised ? 30 : 15;
    canvasCtx.shadowColor = '#00ffcc';
    canvasCtx.fill();

    canvasCtx.restore();
}

// ==================== FILTER COMBINATION DISPATCHER ====================
const FILTER_RENDER_ORDER = [
    'alien',
    'neon',
    'robot',
    'bandit',
    'cat',
    'clown',
    'cyberpunk',
    'steampunk',
    'party',
    'dragon',
    'celestial'
];

function applyFilters(lm, w, h, metrics) {
    if (!activeFilters || activeFilters.size === 0 || activeFilters.has('none')) {
        return;
    }

    for (const filterId of FILTER_RENDER_ORDER) {
        if (!activeFilters.has(filterId)) continue;

        canvasCtx.save();
        switch (filterId) {
            case 'celestial':
                drawCelestial(lm, w, h, metrics);
                break;
            case 'dragon':
                drawDragon(lm, w, h, metrics);
                break;
            case 'steampunk':
                drawSteampunk(lm, w, h, metrics);
                break;
            case 'clown':
                drawClown(lm, w, h, metrics);
                break;
            case 'neon':
                drawNeon(lm, w, h, metrics);
                break;
            case 'alien':
                drawAlien(lm, w, h, metrics);
                break;
            case 'party':
                drawParty(lm, w, h, metrics);
                break;
            case 'cyberpunk':
                drawCyberpunk(lm, w, h, metrics);
                break;
            case 'cat':
                drawCat(lm, w, h, metrics);
                break;
            case 'bandit':
                drawBandit(lm, w, h, metrics);
                break;
            case 'robot':
                drawRobot(lm, w, h, metrics);
                break;
        }
        canvasCtx.restore();
    }
}

// ==================== TOAST MESSAGES ====================
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
}

// ==================== CAPTURE & SCREENSHOT SYSTEM ====================
async function executeCapture() {
    playShutterSound();

    flashOverlay.classList.add('active');
    setTimeout(() => {
        flashOverlay.classList.remove('active');
    }, 120);

    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = canvasElement.width;
    snapCanvas.height = canvasElement.height;
    const sCtx = snapCanvas.getContext('2d');

    if (isMirrored) {
        sCtx.save();
        sCtx.translate(snapCanvas.width, 0);
        sCtx.scale(-1, 1);
        sCtx.drawImage(canvasElement, 0, 0);
        sCtx.restore();
    } else {
        sCtx.drawImage(canvasElement, 0, 0);
    }

    const dataUrl = snapCanvas.toDataURL('image/png');
    currentModalDataUrl = dataUrl;

    snapCanvas.toBlob(blob => {
        currentModalImageBlob = blob;
    }, 'image/png');

    const filterNames = Array.from(activeFilters).join(', ');
    const timestampStr = new Date().toLocaleTimeString();
    capturedSnapshots.unshift({
        url: dataUrl,
        timestamp: timestampStr,
        filters: filterNames
    });

    updateRecentGallery();

    snapshotImg.src = dataUrl;
    snapshotTimestamp.textContent = `Captured at ${timestampStr}`;
    snapshotFiltersUsed.textContent = `Active Filters: ${filterNames.toUpperCase()}`;
    snapshotModal.classList.remove('hidden');

    showToast("📸 Snapshot captured successfully!");
}

function handleCaptureClick() {
    if (isCountdownRunning) return;
    initAudio();

    const delaySeconds = parseInt(timerSelect.value, 10);
    if (delaySeconds === 0) {
        executeCapture();
        return;
    }

    isCountdownRunning = true;
    let count = delaySeconds;
    countdownOverlay.textContent = count;
    countdownOverlay.style.display = 'flex';

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownOverlay.textContent = count;
        } else {
            clearInterval(interval);
            countdownOverlay.style.display = 'none';
            isCountdownRunning = false;
            executeCapture();
        }
    }, 1000);
}

function updateRecentGallery() {
    galleryCount.textContent = capturedSnapshots.length;
    if (capturedSnapshots.length === 0) {
        emptyGalleryMsg.style.display = 'block';
        return;
    }
    emptyGalleryMsg.style.display = 'none';

    galleryStrip.innerHTML = '';
    capturedSnapshots.slice(0, 10).forEach((snap, idx) => {
        const thumb = document.createElement('img');
        thumb.src = snap.url;
        thumb.className = 'gallery-thumb';
        thumb.title = `Shot #${capturedSnapshots.length - idx} (${snap.filters}) - Click to open`;
        thumb.addEventListener('click', () => {
            currentModalDataUrl = snap.url;
            snapshotImg.src = snap.url;
            snapshotTimestamp.textContent = `Captured at ${snap.timestamp}`;
            snapshotFiltersUsed.textContent = `Active Filters: ${snap.filters.toUpperCase()}`;
            snapshotModal.classList.remove('hidden');
        });
        galleryStrip.appendChild(thumb);
    });
}

// Download Button
downloadSnapshotBtn.addEventListener('click', () => {
    if (!currentModalDataUrl) return;
    const a = document.createElement('a');
    a.href = currentModalDataUrl;
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `magic-filters-${dateStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("💾 Photo downloaded to your device!");
});

// Copy to Clipboard
copySnapshotBtn.addEventListener('click', async () => {
    try {
        if (!currentModalImageBlob) {
            const res = await fetch(currentModalDataUrl);
            currentModalImageBlob = await res.blob();
        }
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': currentModalImageBlob })
        ]);
        showToast("📋 Image copied to clipboard!");
    } catch (e) {
        console.warn('Clipboard write error:', e);
        showToast("⚠️ Could not write to clipboard (browser permission required)");
    }
});

// Modal close handlers
closeModalBtn.addEventListener('click', () => snapshotModal.classList.add('hidden'));
retakeBtn.addEventListener('click', () => snapshotModal.classList.add('hidden'));
snapshotModal.addEventListener('click', (e) => {
    if (e.target === snapshotModal) snapshotModal.classList.add('hidden');
});

// ==================== FILTER HUB & SELECTION MENU UI ====================
function updateActiveFilterUI() {
    filterCards.forEach(card => {
        const f = card.dataset.filter;
        if (activeFilters.has(f)) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    activeLayersList.innerHTML = '';
    if (isComboMode && activeFilters.size > 0 && !activeFilters.has('none')) {
        activeLayersContainer.classList.add('visible');
        activeFilters.forEach(f => {
            const card = document.querySelector(`.filter-card[data-filter="${f}"]`);
            const name = card ? card.querySelector('.card-name').textContent : f;
            const chip = document.createElement('div');
            chip.className = 'layer-chip';
            chip.innerHTML = `<span>${name}</span><button class="layer-chip-remove" data-filter="${f}">✕</button>`;
            activeLayersList.appendChild(chip);
        });

        activeLayersList.querySelectorAll('.layer-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const removeFilter = btn.dataset.filter;
                activeFilters.delete(removeFilter);
                if (activeFilters.size === 0) activeFilters.add('none');
                updateActiveFilterUI();
            });
        });
    } else {
        activeLayersContainer.classList.remove('visible');
    }
}

// Card Click handling
filterCards.forEach(card => {
    card.addEventListener('click', () => {
        const filter = card.dataset.filter;

        if (isComboMode) {
            if (filter === 'none') {
                activeFilters.clear();
                activeFilters.add('none');
            } else {
                activeFilters.delete('none');
                if (activeFilters.has(filter)) {
                    activeFilters.delete(filter);
                    if (activeFilters.size === 0) activeFilters.add('none');
                } else {
                    activeFilters.add(filter);
                }
            }
        } else {
            activeFilters.clear();
            activeFilters.add(filter);
        }

        updateActiveFilterUI();
    });
});

// Mode switch buttons
singleModeBtn.addEventListener('click', () => {
    isComboMode = false;
    singleModeBtn.classList.add('active');
    comboModeBtn.classList.remove('active');
    comboPresetsBar.classList.remove('visible');

    if (activeFilters.size > 1) {
        const first = Array.from(activeFilters).find(f => f !== 'none') || 'none';
        activeFilters.clear();
        activeFilters.add(first);
    }
    updateActiveFilterUI();
    showToast("Mode: Single Filter selection");
});

comboModeBtn.addEventListener('click', () => {
    isComboMode = true;
    comboModeBtn.classList.add('active');
    singleModeBtn.classList.remove('active');
    comboPresetsBar.classList.add('visible');
    updateActiveFilterUI();
    showToast("Mode: Multi-Layer Combo active (combine multiple filters!)");
});

// Combo Presets
presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const comboStr = chip.dataset.combo;
        const list = comboStr.split(',');
        activeFilters.clear();
        list.forEach(f => activeFilters.add(f));
        isComboMode = true;
        comboModeBtn.classList.add('active');
        singleModeBtn.classList.remove('active');
        comboPresetsBar.classList.add('visible');
        updateActiveFilterUI();
        showToast(`Applied preset: ${chip.textContent}`);
    });
});

// Clear all layers
clearAllLayersBtn.addEventListener('click', () => {
    activeFilters.clear();
    activeFilters.add('none');
    updateActiveFilterUI();
});

// Category filtering
categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.category;

        filterCards.forEach(card => {
            if (cat === 'all' || card.dataset.category === cat) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Search input
filterSearch.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (q) clearSearchBtn.classList.add('visible');
    else clearSearchBtn.classList.remove('visible');

    filterCards.forEach(card => {
        const name = card.querySelector('.card-name').textContent.toLowerCase();
        const desc = card.querySelector('.card-desc').textContent.toLowerCase();
        if (name.includes(q) || desc.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

clearSearchBtn.addEventListener('click', () => {
    filterSearch.value = '';
    clearSearchBtn.classList.remove('visible');
    filterCards.forEach(c => c.style.display = 'flex');
});

// Sound Toggle
soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.classList.toggle('active', soundEnabled);
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    showToast(`Sound: ${soundEnabled ? 'Enabled' : 'Muted'}`);
});

// Mirror Toggle
flipMirrorBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    canvasElement.classList.toggle('unmirrored', !isMirrored);
    showToast(`Mirror View: ${isMirrored ? 'Selfie Mirrored' : 'Standard'}`);
});

// HUD Toggle
hudToggleBtn.addEventListener('click', () => {
    movementHud.classList.toggle('minimized');
});

// Shutter Capture
captureBtn.addEventListener('click', handleCaptureClick);

// ==================== LIGHTING CONTROLS & STABILIZER EVENTS ====================
stabilizerToggle.addEventListener('change', (e) => {
    useStabilizer = e.target.checked;
    showToast(`AI Jitter Stabilizer: ${useStabilizer ? 'Enabled' : 'Disabled'}`);
});

autoBoostToggle.addEventListener('change', (e) => {
    autoLowLightBoost = e.target.checked;
    showToast(`Auto Low-Light Boost: ${autoLowLightBoost ? 'Enabled' : 'Disabled'}`);
});

lightPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        lightPresetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLightPreset = btn.dataset.light;
        showToast(`Environmental Lighting: ${btn.textContent}`);
    });
});

brightnessSlider.addEventListener('input', (e) => {
    brightnessVal.textContent = e.target.value + '%';
});

contrastSlider.addEventListener('input', (e) => {
    contrastVal.textContent = e.target.value + '%';
});

smoothingSlider.addEventListener('input', (e) => {
    smoothingVal.textContent = e.target.value + '%';
});

resetLightingBtn.addEventListener('click', () => {
    brightnessSlider.value = 100;
    brightnessVal.textContent = '100%';
    contrastSlider.value = 100;
    contrastVal.textContent = '100%';
    smoothingSlider.value = 65;
    smoothingVal.textContent = '65%';
    currentLightPreset = 'normal';
    lightPresetBtns.forEach(b => b.classList.toggle('active', b.dataset.light === 'normal'));
    showToast("Lighting and stabilizer settings reset to default");
});

// ==================== MEDIAPIPE FACE TRACKING CALLBACK ====================
function onFaceResults(results) {
    loadingMessage.style.display = 'none';

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faceDetected = true;
        rawLandmarks = results.multiFaceLandmarks[0];
        faceDot.className = 'pill-dot green';
        faceStatusText.textContent = 'Face Locked (468 pts)';
    } else {
        faceDetected = false;
        rawLandmarks = null;
        smoothedLandmarks = null;
        faceDot.className = 'pill-dot amber';
        faceStatusText.textContent = 'Searching face...';
        updateHUD(null);
    }
}

// ==================== MAIN RENDER LOOP ====================
function render() {
    time++;
    frameCount++;

    const now = performance.now();
    if (now - lastFrameTime >= 1000) {
        currentFps = Math.round((frameCount * 1000) / (now - lastFrameTime));
        fpsVal.textContent = currentFps;
        frameCount = 0;
        lastFrameTime = now;
    }

    sampleLuminance();

    if (!videoElement.videoWidth) {
        requestAnimationFrame(render);
        return;
    }

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const w = canvasElement.width;
    const h = canvasElement.height;

    canvasCtx.save();
    canvasCtx.filter = getActiveCanvasFilterString();
    canvasCtx.clearRect(0, 0, w, h);
    canvasCtx.drawImage(videoElement, 0, 0, w, h);
    canvasCtx.restore();

    if (faceDetected && rawLandmarks) {
        const lm = updateSmoothedLandmarks(rawLandmarks);

        if (lm) {
            const metrics = computeMotionMetrics(lm, w, h);
            updateHUD(metrics);
            applyFilters(lm, w, h, metrics);
        }
    } else {
        updateHUD(null);
    }

    requestAnimationFrame(render);
}

// ==================== INITIALIZATION ====================
const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onFaceResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

camera.start().catch(err => {
    console.error('Camera init error:', err);
    loadingMessage.innerHTML = `<span style="color:#ef4444;">⚠️ Camera Access Denied or Unavailable</span><br><small>Please allow camera permissions in your browser.</small>`;
});

render();
