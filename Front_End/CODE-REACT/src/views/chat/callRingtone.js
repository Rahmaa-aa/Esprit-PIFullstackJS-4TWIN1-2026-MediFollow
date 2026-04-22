/**
 * Sonneries d’appel : fichier MP3 en boucle (public/sounds/messenger-call.mp3).
 * Entrant et sortant utilisent le même extrait (style Messenger).
 */

function ringtoneSrc() {
    const base = import.meta.env.BASE_URL || "/";
    return base.endsWith("/") ? `${base}sounds/messenger-call.mp3` : `${base}/sounds/messenger-call.mp3`;
}

/**
 * @param {boolean} _isVideo — conservé pour l’API ; même son pour vocal et vidéo
 * @returns {() => void}
 */
function startMp3Loop(_isVideo) {
    const audio = new Audio(ringtoneSrc());
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.92;

    const run = async () => {
        try {
            await audio.play();
        } catch {
            /* politique autoplay du navigateur */
        }
    };
    run();

    return () => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
    };
}

/**
 * Sonnerie appel entrant.
 * @param {boolean} isVideo
 * @returns {() => void}
 */
export function startIncomingRingtone(isVideo) {
    return startMp3Loop(isVideo);
}

/**
 * Tonalité d’attente côté appelant.
 * @param {boolean} isVideo
 * @returns {() => void}
 */
export function startOutgoingRingback(isVideo) {
    return startMp3Loop(isVideo);
}
