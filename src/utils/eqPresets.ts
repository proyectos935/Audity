import { Sliders, Sparkles, Mic, Wind, Sun, VolumeX, Disc, Radio, Bot, Phone, Ghost, Smile, Repeat, Megaphone, Waves, Volume2 } from 'lucide-react';

export interface EQPreset {
  id: string;
  name: string;
  group: 'utiles' | 'divertidos' | 'ninguno';
  subtitle: string;
  description: string;
  iconName: string;
  badge: string;
}

export const EQ_PRESETS: EQPreset[] = [
  {
    id: 'none',
    name: 'Sin Efectos (EQ Plano)',
    group: 'ninguno',
    subtitle: 'Audio Original',
    description: 'Respuesta plana sin alteraciones de ecualización ni efectos.',
    iconName: 'Sliders',
    badge: 'NORMAL'
  },
  // 🛠️ GRUPO 1: LOS ÚTILES
  {
    id: 'podcast_cleaner',
    name: 'Limpiador de Voces (Podcast)',
    group: 'utiles',
    subtitle: 'Claridad Cristalina',
    description: 'Realza las frecuencias medias de la voz y atenúa los extremos para que se entienda con claridad cristalina.',
    iconName: 'Mic',
    badge: 'VOZ / PODCAST'
  },
  {
    id: 'low_cut',
    name: 'Corte de Graves (Anti-viento / Low-Cut)',
    group: 'utiles',
    subtitle: 'Filtro ~100Hz',
    description: 'Elimina el zumbido de fondo de los micrófonos baratos, golpes de aire o vibraciones graves.',
    iconName: 'Wind',
    badge: 'ANTI-RUIDO'
  },
  {
    id: 'high_boost',
    name: 'Claridad y Brillo (High-Boost)',
    group: 'utiles',
    subtitle: 'Presencia & Aire',
    description: 'Da un toque de aire y presencia a voces que suenan muy apagadas o grabadas con mala acústica.',
    iconName: 'Sun',
    badge: 'BRILLO'
  },
  {
    id: 'de_hisser',
    name: 'Reducción de Siseo (Anti-ruido agudo)',
    group: 'utiles',
    subtitle: 'Low-Pass ~5.5kHz',
    description: 'Corta las frecuencias muy altas donde vive el ruido eléctrico o estático de fondo.',
    iconName: 'VolumeX',
    badge: 'ANTI-SISEO'
  },
  {
    id: 'bass_boost',
    name: 'Mejorador de Bajos (Bass Boost)',
    group: 'utiles',
    subtitle: 'Cuerpo & Profundidad',
    description: 'Da cuerpo y profundidad a la música o a voces que necesitan sonar más imponentes y cercanas.',
    iconName: 'Disc',
    badge: 'BASS'
  },
  {
    id: 'compressor',
    name: 'Compresor / Normalizador Rápido',
    group: 'utiles',
    subtitle: 'Dinámica Controlada',
    description: 'Empareja los picos de volumen para que las partes bajitas de la voz se escuchen bien sin que exploten los gritos.',
    iconName: 'Volume2',
    badge: 'COMPRESOR'
  },
  {
    id: 'am_radio',
    name: 'Radio AM Clásica',
    group: 'utiles',
    subtitle: 'Transmisor Vintage',
    description: 'Estrecha el rango de frecuencias y añade un toque de distorsión sutil para simular una locución de radio antigua.',
    iconName: 'Radio',
    badge: 'VINTAGE'
  },

  // 🤪 GRUPO 2: LOS DIVERTIDOS
  {
    id: 'robot',
    name: 'Voz de Robot (Metálico)',
    group: 'divertidos',
    subtitle: 'Modulación Anular',
    description: 'Filtro de paso banda muy cerrado combinado con una modulación rápida para dar ese timbre robótico clásico.',
    iconName: 'Bot',
    badge: 'ROBOT'
  },
  {
    id: 'telephone',
    name: 'Teléfono / Walkie-Talkie',
    group: 'divertidos',
    subtitle: 'Band-Pass 400-3400Hz',
    description: 'Simula una llamada telefónica real cortando los extremos graves y agudos del espectro de audio.',
    iconName: 'Phone',
    badge: 'LLAMADA'
  },
  {
    id: 'monster',
    name: 'Monstruo / Gigante (Graves profundos)',
    group: 'divertidos',
    subtitle: 'Tono Grave (-6 Semitones)',
    description: 'Desplaza el tono hacia abajo y realza los subgraves para sonar aterrador o imponente.',
    iconName: 'Ghost',
    badge: 'GRAVE'
  },
  {
    id: 'chipmunk',
    name: 'Ardilla / Alien (Agudo rápido)',
    group: 'divertidos',
    subtitle: 'Tono Agudo (+7 Semitones)',
    description: 'Eleva el tono drásticamente hacia los agudos imitando el clásico efecto de helio o ardillas.',
    iconName: 'Smile',
    badge: 'AGUDO'
  },
  {
    id: 'echo_cave',
    name: 'Eco / Cueva (Delay simple)',
    group: 'divertidos',
    subtitle: 'Delay 350ms + Feedback',
    description: 'Repite el audio varias veces con un fundido decreciente simulando que hablas dentro de un espacio vacío y grande.',
    iconName: 'Echo',
    badge: 'ECO'
  },
  {
    id: 'megaphone',
    name: 'Megáfono / Manifestación',
    group: 'divertidos',
    subtitle: 'Saturación & Altavoz',
    description: 'Aplica una compresión agresiva y una ligera saturación para simular el sonido rasposo y fuerte de un altavoz de mano.',
    iconName: 'Megaphone',
    badge: 'ALTAVOZ'
  },
  {
    id: 'underwater',
    name: 'Efecto Submarino / Debajo del agua',
    group: 'divertidos',
    subtitle: 'Low-Pass 350Hz Ahogado',
    description: 'Un filtro de paso bajo muy cerrado que ahoga todo el sonido, como si estuvieras escuchando desde el fondo de una piscina.',
    iconName: 'Waves',
    badge: 'SUBMARINO'
  },
  {
    id: 'reverb',
    name: 'Eco Reverberante (Reverb simulada)',
    group: 'divertidos',
    subtitle: 'Espacialidad Difusa',
    description: 'Añade espacialidad difusa para que la voz suene como si estuviera rebotando en las paredes de una habitación vacía.',
    iconName: 'Sparkles',
    badge: 'REVERB'
  }
];

/**
 * Builds and connects Web Audio Nodes for a given preset ID.
 * Returns the final output node of the FX chain, plus any detune in cents.
 */
export function applyEQPresetNodes(
  ctx: BaseAudioContext,
  inputNode: AudioNode,
  presetId: string
): { outputNode: AudioNode; detuneCents?: number } {
  if (!presetId || presetId === 'none') {
    return { outputNode: inputNode, detuneCents: 0 };
  }

  try {
    switch (presetId) {
      // 1. Limpiador de Voces (Podcast)
      case 'podcast_cleaner': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 100;
        hp.Q.value = 0.7;

        const mid = ctx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 2500;
        mid.gain.value = 4.5;
        mid.Q.value = 1.2;

        const hs = ctx.createBiquadFilter();
        hs.type = 'highshelf';
        hs.frequency.value = 9000;
        hs.gain.value = -4;

        inputNode.connect(hp);
        hp.connect(mid);
        mid.connect(hs);

        return { outputNode: hs, detuneCents: 0 };
      }

      // 2. Corte de Graves (Anti-viento / Low-Cut)
      case 'low_cut': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 110;
        hp.Q.value = 1.0;

        inputNode.connect(hp);
        return { outputNode: hp, detuneCents: 0 };
      }

      // 3. Claridad y Brillo (High-Boost)
      case 'high_boost': {
        const hs = ctx.createBiquadFilter();
        hs.type = 'highshelf';
        hs.frequency.value = 3500;
        hs.gain.value = 6;

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 6000;
        peak.gain.value = 3;
        peak.Q.value = 1.0;

        inputNode.connect(hs);
        hs.connect(peak);

        return { outputNode: peak, detuneCents: 0 };
      }

      // 4. Reducción de Siseo (Anti-ruido agudo)
      case 'de_hisser': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 5200;
        lp.Q.value = 1.0;

        inputNode.connect(lp);
        return { outputNode: lp, detuneCents: 0 };
      }

      // 5. Mejorador de Bajos (Bass Boost)
      case 'bass_boost': {
        const ls = ctx.createBiquadFilter();
        ls.type = 'lowshelf';
        ls.frequency.value = 120;
        ls.gain.value = 7.5;

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 80;
        peak.gain.value = 4;
        peak.Q.value = 1.0;

        inputNode.connect(ls);
        ls.connect(peak);

        return { outputNode: peak, detuneCents: 0 };
      }

      // 6. Compresor / Normalizador Rápido
      case 'compressor': {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -24;
        comp.knee.value = 30;
        comp.ratio.value = 12;
        comp.attack.value = 0.003;
        comp.release.value = 0.25;

        const makeupGain = ctx.createGain();
        makeupGain.gain.value = 1.4;

        inputNode.connect(comp);
        comp.connect(makeupGain);

        return { outputNode: makeupGain, detuneCents: 0 };
      }

      // 7. Radio AM Clásica
      case 'am_radio': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 380;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2800;

        const wave = ctx.createWaveShaper();
        const n = 256;
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const x = (i * 2) / n - 1;
          curve[i] = Math.tanh(x * 2.5);
        }
        wave.curve = curve;

        inputNode.connect(hp);
        hp.connect(lp);
        lp.connect(wave);

        return { outputNode: wave, detuneCents: 0 };
      }

      // 8. Voz de Robot (Metálico)
      case 'robot': {
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1100;
        bp.Q.value = 3.5;

        const ringGain = ctx.createGain();
        ringGain.gain.value = 0.8;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 55; // 55Hz modulation
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = 0.8;
        osc.connect(oscGain);
        oscGain.connect(ringGain.gain);

        try {
          osc.start();
        } catch {}

        inputNode.connect(bp);
        bp.connect(ringGain);

        return { outputNode: ringGain, detuneCents: 0 };
      }

      // 9. Teléfono / Walkie-Talkie
      case 'telephone': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 400;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 3200;

        const peak = ctx.createBiquadFilter();
        peak.type = 'peaking';
        peak.frequency.value = 1600;
        peak.gain.value = 6;
        peak.Q.value = 2.0;

        inputNode.connect(hp);
        hp.connect(lp);
        lp.connect(peak);

        return { outputNode: peak, detuneCents: 0 };
      }

      // 10. Monstruo / Gigante (Graves profundos)
      case 'monster': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 850;

        const ls = ctx.createBiquadFilter();
        ls.type = 'lowshelf';
        ls.frequency.value = 100;
        ls.gain.value = 8;

        inputNode.connect(lp);
        lp.connect(ls);

        return { outputNode: ls, detuneCents: -600 }; // -6 semitones
      }

      // 11. Ardilla / Alien (Agudo rápido)
      case 'chipmunk': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 750;

        const hs = ctx.createBiquadFilter();
        hs.type = 'highshelf';
        hs.frequency.value = 3500;
        hs.gain.value = 5;

        inputNode.connect(hp);
        hp.connect(hs);

        return { outputNode: hs, detuneCents: 700 }; // +7 semitones
      }

      // 12. Eco / Cueva (Delay simple)
      case 'echo_cave': {
        const dry = ctx.createGain();
        dry.gain.value = 0.8;

        const delay = ctx.createDelay();
        delay.delayTime.value = 0.35; // 350ms delay

        const feedback = ctx.createGain();
        feedback.gain.value = 0.45;

        const damp = ctx.createBiquadFilter();
        damp.type = 'lowpass';
        damp.frequency.value = 2200;

        const output = ctx.createGain();

        inputNode.connect(dry);
        dry.connect(output);

        inputNode.connect(delay);
        delay.connect(damp);
        damp.connect(output);
        damp.connect(feedback);
        feedback.connect(delay);

        return { outputNode: output, detuneCents: 0 };
      }

      // 13. Megáfono / Manifestación
      case 'megaphone': {
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 500;

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2600;

        const wave = ctx.createWaveShaper();
        const n = 256;
        const curve = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          const x = (i * 2) / n - 1;
          curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.6);
        }
        wave.curve = curve;

        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.ratio.value = 16;

        inputNode.connect(hp);
        hp.connect(lp);
        lp.connect(wave);
        wave.connect(comp);

        return { outputNode: comp, detuneCents: 0 };
      }

      // 14. Efecto Submarino / Debajo del agua
      case 'underwater': {
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 350;
        lp.Q.value = 2.5;

        const gain = ctx.createGain();
        gain.gain.value = 1.3;

        inputNode.connect(lp);
        lp.connect(gain);

        return { outputNode: gain, detuneCents: 0 };
      }

      // 15. Eco Reverberante (Reverb simulada)
      case 'reverb': {
        const dry = ctx.createGain();
        dry.gain.value = 0.7;

        const output = ctx.createGain();
        inputNode.connect(dry);
        dry.connect(output);

        // Create 4 multi-tap delays for diffuse reverberation
        const delayTimes = [0.03, 0.05, 0.08, 0.12];
        const gains = [0.4, 0.3, 0.2, 0.15];

        delayTimes.forEach((dt, idx) => {
          const d = ctx.createDelay();
          d.delayTime.value = dt;

          const g = ctx.createGain();
          g.gain.value = gains[idx];

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 3000;

          inputNode.connect(d);
          d.connect(filter);
          filter.connect(g);
          g.connect(output);
        });

        return { outputNode: output, detuneCents: 0 };
      }

      default:
        return { outputNode: inputNode, detuneCents: 0 };
    }
  } catch (err) {
    console.warn('Error applying EQ preset:', err);
    return { outputNode: inputNode, detuneCents: 0 };
  }
}
