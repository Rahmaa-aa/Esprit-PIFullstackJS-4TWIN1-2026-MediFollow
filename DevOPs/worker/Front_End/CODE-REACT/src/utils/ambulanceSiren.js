/**
 * Sirène type ambulance via Web Audio API (aucun fichier audio).
 * Peut échouer silencieusement si autoplay est bloqué avant interaction utilisateur.
 */

export function createAmbulanceSirenPlayer(options = {}) {
  const volume = typeof options.volume === "number" ? Math.min(0.45, Math.max(0, options.volume)) : 0.2;
  const wailHz = typeof options.wailHz === "number" ? options.wailHz : 2.4;

  let ctx = null;
  let osc = null;
  let gain = null;
  let rafId = null;
  let running = false;
  let t0 = 0;

  function start() {
    if (running) return;
    running = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        running = false;
        return;
      }
      ctx = new AC();
      gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.02, volume), ctx.currentTime + 0.12);
      gain.connect(ctx.destination);

      osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.connect(gain);
      osc.start(0);
      t0 = ctx.currentTime;

      const tick = () => {
        if (!running || !ctx || !osc) return;
        const elapsed = ctx.currentTime - t0;
        const wail = Math.sin(elapsed * Math.PI * 2 * wailHz);
        const freq = 620 + 420 * wail;
        osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.028);
        rafId = requestAnimationFrame(tick);
      };
      tick();

      ctx.resume().catch(() => {});
    } catch {
      running = false;
    }
  }

  function stop() {
    running = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    try {
      if (ctx && gain) {
        const now = ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.12);
      }
      const c = ctx;
      const o = osc;
      const g = gain;
      window.setTimeout(() => {
        try {
          if (o) {
            o.stop();
            o.disconnect();
          }
          if (g) g.disconnect();
          if (c && c.state !== "closed") void c.close();
        } catch {
          /* ignore */
        }
      }, 150);
    } catch {
      /* ignore */
    }
    ctx = null;
    osc = null;
    gain = null;
  }

  return { start, stop };
}
