import { useState, useEffect, useRef } from 'react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// En prod ces appels passent par /api/movies et /api/stream (Vercel)
// Ici on simule avec des données mock + une vidéo de démo
const USE_MOCK = false; // passe à false une fois Vercel + Drive configurés
const API_BASE = ''; // ex: "https://ton-projet.vercel.app"

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_MOVIES = [
  {
    id: '1',
    driveFileId: '1abc',
    title: 'Dune: Part Two',
    year: '2024',
    rating: 8.5,
    genres: ['Sci-Fi', 'Aventure'],
    description:
      "Paul Atréides s'unit aux Fremen pour mener la guerre contre les conspirateurs.",
    poster:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1400&h=700&fit=crop&q=80',
    featured: true,
  },
  {
    id: '2',
    driveFileId: '2abc',
    title: 'Oppenheimer',
    year: '2023',
    rating: 8.9,
    genres: ['Drame', 'Histoire'],
    description:
      "L'histoire du père de la bombe atomique et du projet Manhattan.",
    poster:
      'https://images.unsplash.com/photo-1518281361980-b26bfd556770?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1518281361980-b26bfd556770?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '3',
    driveFileId: '3abc',
    title: 'Poor Things',
    year: '2023',
    rating: 8.1,
    genres: ['Fantasy', 'Comédie'],
    description: 'Une jeune femme ressuscitée part à la découverte du monde.',
    poster:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '4',
    driveFileId: '4abc',
    title: 'Past Lives',
    year: '2023',
    rating: 7.9,
    genres: ['Romance', 'Drame'],
    description:
      "Deux amis d'enfance coréens se retrouvent des décennies plus tard.",
    poster:
      'https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1518895312237-a9e23508077d?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '5',
    driveFileId: '5abc',
    title: 'Alien: Romulus',
    year: '2024',
    rating: 7.3,
    genres: ['Horreur', 'Sci-Fi'],
    description:
      'Des jeunes colonisateurs affrontent la forme de vie la plus terrifiante.',
    poster:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '6',
    driveFileId: '6abc',
    title: 'Challengers',
    year: '2024',
    rating: 7.6,
    genres: ['Sport', 'Romance'],
    description:
      "Une rivalité explosive entre deux tennismen et la femme qu'ils aiment.",
    poster:
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '7',
    driveFileId: '7abc',
    title: 'Civil War',
    year: '2024',
    rating: 7.2,
    genres: ['Action', 'Guerre'],
    description:
      'Des journalistes traversent une Amérique en pleine guerre civile.',
    poster:
      'https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1494059980473-813e73ee784b?w=1400&h=700&fit=crop&q=80',
  },
  {
    id: '8',
    driveFileId: '8abc',
    title: 'Killers of the Flower Moon',
    year: '2023',
    rating: 7.6,
    genres: ['Crime', 'Drame'],
    description:
      'Des membres Osage assassinés après la découverte de pétrole sur leurs terres.',
    poster:
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&h=600&fit=crop&q=80',
    backdrop:
      'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1400&h=700&fit=crop&q=80',
  },
];

const MOCK_USERS = [
  { uid: 'admin-001', name: 'Toi', code: 'admin2024', role: 'admin' },
  { uid: 'u-001', name: 'Lucas', code: 'lucas42', role: 'user' },
  { uid: 'u-002', name: 'Sarah', code: 'sarah88', role: 'user' },
];

const DEMO_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const ALL_GENRES = [
  'Tous',
  'Action',
  'Sci-Fi',
  'Drame',
  'Horreur',
  'Romance',
  'Thriller',
  'Fantasy',
  'Crime',
  'Aventure',
  'Guerre',
  'Sport',
  'Histoire',
  'Comédie',
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = Math.floor(s % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

function getStreamUrl(driveFileId, token) {
  if (USE_MOCK) return DEMO_VIDEO;
  return `${API_BASE}/api/stream?fileId=${driveFileId}`;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  input[type=range] { -webkit-appearance:none; background:transparent; cursor:pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; background:#fff; margin-top:-5px; }
  input[type=range]::-webkit-slider-runnable-track { height:3px; border-radius:2px; background:rgba(255,255,255,0.2); }
`;

const S = {
  btn: (v = 'red') => ({
    padding: '11px 24px',
    border: 'none',
    borderRadius: '7px',
    cursor: 'pointer',
    fontFamily: "'DM Sans',sans-serif",
    fontWeight: 700,
    fontSize: '15px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background:
      v === 'red'
        ? '#e50914'
        : v === 'white'
        ? '#fff'
        : v === 'ghost'
        ? 'rgba(255,255,255,0.12)'
        : 'transparent',
    color: v === 'white' ? '#000' : '#fff',
  }),
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '6px',
    flexShrink: 0,
  },
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setErr('');
    await new Promise((r) => setTimeout(r, 500));
    const user = MOCK_USERS.find((u) => u.code === code.trim().toLowerCase());
    if (!user) {
      setErr('Code invalide.');
      setBusy(false);
      return;
    }
    onLogin(user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundImage:
          'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(229,9,20,0.13) 0%, transparent 60%)',
      }}
    >
      <style>{css}</style>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              color: '#e50914',
              fontSize: '54px',
              fontFamily: "'Bebas Neue',cursive",
              letterSpacing: '6px',
              lineHeight: 1,
            }}
          >
            CINÉ
          </div>
          <div
            style={{
              color: '#333',
              fontSize: '18px',
              fontFamily: "'Bebas Neue',cursive",
              letterSpacing: '8px',
            }}
          >
            CLOUD
          </div>
        </div>
        <div
          style={{
            background: '#181818',
            borderRadius: '14px',
            padding: '36px 32px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h2 style={{ color: '#fff', fontSize: '20px', marginBottom: '6px' }}>
            Accès privé
          </h2>
          <p
            style={{
              color: '#555',
              fontSize: '14px',
              marginBottom: '26px',
              lineHeight: 1.6,
            }}
          >
            Entre ton code personnel pour accéder à la bibliothèque.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Ton code d'accès"
            style={{
              width: '100%',
              padding: '13px 14px',
              background: '#242424',
              border: `1px solid ${err ? '#e50914' : '#333'}`,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              marginBottom: '10px',
              fontFamily: "'DM Sans',sans-serif",
              letterSpacing: '2px',
            }}
          />
          {err && (
            <div
              style={{
                color: '#ff6b6b',
                fontSize: '13px',
                marginBottom: '12px',
              }}
            >
              ⚠️ {err}
            </div>
          )}
          <button
            onClick={submit}
            disabled={busy || !code.trim()}
            style={{
              ...S.btn('red'),
              width: '100%',
              justifyContent: 'center',
              fontFamily: "'Bebas Neue',cursive",
              letterSpacing: '2px',
              fontSize: '17px',
              opacity: busy || !code.trim() ? 0.55 : 1,
            }}
          >
            {busy ? 'Vérification...' : '▶ ENTRER'}
          </button>
          <p
            style={{
              color: '#2a2a2a',
              fontSize: '12px',
              textAlign: 'center',
              marginTop: '18px',
            }}
          >
            Codes démo : <span style={{ color: '#e50914' }}>admin2024</span> /{' '}
            <span style={{ color: '#555' }}>lucas42</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER ───────────────────────────────────────────────────────────────────
function Player({ movie, token, onClose }) {
  const vRef = useRef(null);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fs, setFs] = useState(false);
  const [show, setShow] = useState(true);
  const [buf, setBuf] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [sub, setSub] = useState('off');
  const [menu, setMenu] = useState(null);
  const [casting, setCasting] = useState(false);
  const [toast, setToast] = useState('');

  const streamUrl = getStreamUrl(movie.driveFileId, token);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const resetTimer = () => {
    setShow(true);
    clearTimeout(timerRef.current);
    if (playing) timerRef.current = setTimeout(() => setShow(false), 3000);
  };

  useEffect(() => {
    resetTimer();
  }, [playing]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  useEffect(() => {
    const v = vRef.current;
    if (!v) return;
    const onTime = () => setCur(v.currentTime);
    const onDur = () => setDur(v.duration);
    const onProg = () => {
      if (v.buffered.length > 0)
        setBuf((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    };
    const onEnded = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onDur);
    v.addEventListener('progress', onProg);
    v.addEventListener('ended', onEnded);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onDur);
      v.removeEventListener('progress', onProg);
      v.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const f = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);

  useEffect(() => {
    const k = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === 'ArrowRight') skip(10);
      if (e.code === 'ArrowLeft') skip(-10);
      if (e.code === 'KeyF') toggleFs();
      if (e.code === 'KeyM') toggleMute();
      if (e.code === 'Escape') {
        setMenu(null);
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [playing, vol]);

  const togglePlay = () => {
    const v = vRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  const skip = (s) => {
    const v = vRef.current;
    if (v) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + s));
  };
  const toggleMute = () => {
    const v = vRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  };
  const toggleFs = () => {
    const el = wrapRef.current;
    !document.fullscreenElement
      ? el.requestFullscreen?.()
      : document.exitFullscreen?.();
  };
  const changeVol = (val) => {
    setVol(val);
    if (vRef.current) vRef.current.volume = val;
    setMuted(val === 0);
  };
  const seekTo = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    if (vRef.current)
      vRef.current.currentTime = ((e.clientX - r.left) / r.width) * dur;
  };
  const changeSpeed = (val) => {
    setSpeed(val);
    if (vRef.current) vRef.current.playbackRate = val;
    setMenu(null);
  };
  const handleCast = () => {
    try {
      if (window.cast) {
        const ctx = cast.framework.CastContext.getInstance();
        ctx.requestSession().then(() => {
          setCasting(true);
          vRef.current?.pause();
          setPlaying(false);
          showToast('📺 Diffusion Chromecast démarrée');
        });
      } else {
        showToast('📡 Chromecast non détecté — même réseau Wi-Fi requis');
      }
    } catch {
      showToast('📡 Chromecast non disponible sur ce navigateur');
    }
  };

  const progress = dur ? (cur / dur) * 100 : 0;
  const speedItems = [
    [0.5, '0.5×'],
    [0.75, '0.75×'],
    [1, 'Normal'],
    [1.25, '1.25×'],
    [1.5, '1.5×'],
    [2, '2×'],
  ];
  const qualityItems = [
    ['4K', '4K'],
    ['1080p', '1080p'],
    ['720p', '720p'],
  ];
  const subItems = [
    ['off', 'Désactivé'],
    ['fr', 'Français'],
    ['en', 'English'],
    ['es', 'Español'],
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* Cast SDK */}
      <script
        src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
        async
      />

      <div
        ref={wrapRef}
        onMouseMove={resetTimer}
        onClick={() => {
          togglePlay();
          resetTimer();
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: show ? 'default' : 'none',
        }}
      >
        <video
          ref={vRef}
          src={streamUrl}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          x-webkit-airplay="allow"
          playsInline
          webkit-playsinline="true"
        />

        {/* Casting overlay */}
        {casting && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '56px' }}>📺</div>
            <p
              style={{
                color: '#fff',
                fontSize: '22px',
                fontFamily: "'Bebas Neue',cursive",
                letterSpacing: '2px',
              }}
            >
              Diffusion en cours
            </p>
            <p style={{ color: '#888', fontSize: '14px' }}>{movie.title}</p>
            <button
              onClick={() => setCasting(false)}
              style={{ ...S.btn('ghost'), marginTop: '8px' }}
            >
              Arrêter
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.9)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.1)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            {toast}
          </div>
        )}

        {/* Controls overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: show ? 1 : 0,
            transition: 'opacity 0.35s',
            background:
              'linear-gradient(transparent 45%, rgba(0,0,0,0.88) 100%)',
          }}
        >
          {/* Top bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'all',
              background: 'linear-gradient(rgba(0,0,0,0.75),transparent)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={onClose}
                style={{
                  ...S.iconBtn,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '50%',
                  fontSize: '18px',
                }}
              >
                ←
              </button>
              <div>
                <div
                  style={{
                    color: '#fff',
                    fontSize: '18px',
                    fontFamily: "'Bebas Neue',cursive",
                    letterSpacing: '2px',
                  }}
                >
                  {movie.title}
                </div>
                <div style={{ color: '#888', fontSize: '12px' }}>
                  {movie.year}
                </div>
              </div>
            </div>
            <div
              style={{
                color: '#e50914',
                fontFamily: "'Bebas Neue',cursive",
                fontSize: '16px',
                letterSpacing: '3px',
              }}
            >
              CINÉ<span style={{ color: '#fff' }}>CLOUD</span>
            </div>
          </div>

          {/* Center pause icon */}
          {!playing && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: 'rgba(229,9,20,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                pointerEvents: 'none',
              }}
            >
              ▶
            </div>
          )}

          {/* Bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0 18px 14px',
              pointerEvents: 'all',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress */}
            <div
              style={{
                position: 'relative',
                marginBottom: '10px',
                padding: '6px 0',
                cursor: 'pointer',
              }}
              onClick={seekTo}
            >
              <div
                style={{
                  height: '3px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '2px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${buf}%`,
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                  }}
                />
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: '#e50914',
                    borderRadius: '2px',
                    position: 'relative',
                    transition: 'width 0.1s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '13px',
                      height: '13px',
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Left */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <button
                  onClick={() => skip(-10)}
                  style={S.iconBtn}
                  title="Reculer 10s (←)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="22"
                    height="22"
                  >
                    <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                    <text
                      x="7"
                      y="16"
                      fontSize="5.5"
                      fill="white"
                      fontWeight="bold"
                    >
                      10
                    </text>
                  </svg>
                </button>
                <button
                  onClick={togglePlay}
                  style={{ ...S.iconBtn, width: '46px', height: '46px' }}
                  title="Lecture/Pause (Espace)"
                >
                  {playing ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="26"
                      height="26"
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="26"
                      height="26"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => skip(10)}
                  style={S.iconBtn}
                  title="Avancer 10s (→)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="22"
                    height="22"
                  >
                    <path d="M12.01 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                    <text
                      x="7"
                      y="16"
                      fontSize="5.5"
                      fill="white"
                      fontWeight="bold"
                    >
                      10
                    </text>
                  </svg>
                </button>
                <button onClick={toggleMute} style={S.iconBtn} title="Muet (M)">
                  {muted || vol === 0 ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={muted ? 0 : vol}
                  onChange={(e) => changeVol(parseFloat(e.target.value))}
                  style={{ width: '75px', accentColor: '#e50914' }}
                />
                <span
                  style={{
                    color: '#ccc',
                    fontSize: '13px',
                    marginLeft: '10px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {fmtTime(cur)} / {fmtTime(dur)}
                </span>
              </div>

              {/* Right */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                {/* Cast */}
                <button
                  onClick={handleCast}
                  style={{ ...S.iconBtn, color: casting ? '#e50914' : '#fff' }}
                  title="Chromecast / AirPlay"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="20"
                    height="20"
                  >
                    <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3C1.9 3 1 3.9 1 5v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                  </svg>
                </button>

                {/* Subtitles */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenu(menu === 'sub' ? null : 'sub')}
                    style={{
                      ...S.iconBtn,
                      color: sub !== 'off' ? '#e50914' : '#fff',
                    }}
                    title="Sous-titres"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-6 8H6v-2h8v2zm4-4H6V6h12v2z" />
                    </svg>
                  </button>
                  {menu === 'sub' && (
                    <PopMenu
                      title="Sous-titres"
                      items={subItems}
                      sel={sub}
                      onSel={(v) => {
                        setSub(v);
                        setMenu(null);
                      }}
                    />
                  )}
                </div>

                {/* Quality */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenu(menu === 'q' ? null : 'q')}
                    style={{
                      ...S.iconBtn,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#e50914',
                      minWidth: '46px',
                    }}
                  >
                    {quality}
                  </button>
                  {menu === 'q' && (
                    <PopMenu
                      title="Qualité"
                      items={qualityItems}
                      sel={quality}
                      onSel={(v) => {
                        setQuality(v);
                        setMenu(null);
                      }}
                    />
                  )}
                </div>

                {/* Speed */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setMenu(menu === 'sp' ? null : 'sp')}
                    style={{
                      ...S.iconBtn,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: speed !== 1 ? '#e50914' : '#fff',
                      minWidth: '40px',
                    }}
                  >
                    {speed === 1 ? '1×' : `${speed}×`}
                  </button>
                  {menu === 'sp' && (
                    <PopMenu
                      title="Vitesse"
                      items={speedItems}
                      sel={speed}
                      onSel={changeSpeed}
                    />
                  )}
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFs}
                  style={S.iconBtn}
                  title="Plein écran (F)"
                >
                  {fs ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="20"
                      height="20"
                    >
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PopMenu({ title, items, sel, onSel }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 10px)',
        right: 0,
        background: 'rgba(18,18,18,0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        minWidth: '170px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          padding: '9px 14px',
          fontSize: '10px',
          color: '#666',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {items.map(([val, label]) => (
        <div
          key={val}
          onClick={() => onSel(val)}
          style={{
            padding: '10px 14px',
            fontSize: '14px',
            cursor: 'pointer',
            color: sel === val ? '#e50914' : '#ddd',
            background: sel === val ? 'rgba(229,9,20,0.08)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              sel === val ? 'rgba(229,9,20,0.12)' : 'rgba(255,255,255,0.05)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              sel === val ? 'rgba(229,9,20,0.08)' : 'transparent')
          }
        >
          <span>{label}</span>
          {sel === val && <span style={{ fontSize: '12px' }}>✓</span>}
        </div>
      ))}
    </div>
  );
}

// ─── MOVIE CARD ───────────────────────────────────────────────────────────────
function MovieCard({ movie, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(movie)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: '155px',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        transform: hov ? 'scale(1.06) translateY(-4px)' : 'scale(1)',
        transition:
          'transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.28s',
        boxShadow: hov
          ? '0 20px 50px rgba(0,0,0,0.85)'
          : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <img
        src={
          movie.poster ||
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop'
        }
        alt={movie.title}
        style={{
          width: '155px',
          height: '233px',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent,rgba(0,0,0,0.96))',
          padding: '28px 10px 10px',
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.25s',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: 700,
            fontFamily: "'Bebas Neue',cursive",
            letterSpacing: '0.5px',
          }}
        >
          {movie.title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '4px',
          }}
        >
          <span style={{ color: '#aaa', fontSize: '11px' }}>{movie.year}</span>
          {movie.rating && (
            <span
              style={{ color: '#f5c518', fontSize: '12px', fontWeight: 700 }}
            >
              ★ {movie.rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MOVIE MODAL ──────────────────────────────────────────────────────────────
function MovieModal({ movie, onClose, onPlay }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#181818',
          borderRadius: '14px',
          overflow: 'hidden',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            style={{
              width: '100%',
              height: '320px',
              objectFit: 'cover',
              filter: 'brightness(0.55)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(transparent 35%,#181818 100%)',
            }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <div style={{ position: 'absolute', bottom: '18px', left: '22px' }}>
            <h2
              style={{
                color: '#fff',
                fontSize: '34px',
                fontFamily: "'Bebas Neue',cursive",
                letterSpacing: '2px',
              }}
            >
              {movie.title}
            </h2>
          </div>
        </div>
        <div style={{ padding: '0 22px 30px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            {movie.rating && (
              <span style={{ color: '#f5c518', fontWeight: 700 }}>
                ★ {movie.rating}
              </span>
            )}
            <span
              style={{ color: '#46d369', fontWeight: 700, fontSize: '13px' }}
            >
              ● HD
            </span>
            <span style={{ color: '#aaa', fontSize: '13px' }}>
              {movie.year}
            </span>
          </div>
          {movie.genres?.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}
            >
              {movie.genres.map((g) => (
                <span
                  key={g}
                  style={{
                    border: '1px solid #444',
                    color: '#ccc',
                    fontSize: '12px',
                    padding: '3px 10px',
                    borderRadius: '4px',
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
          <p
            style={{
              color: '#ccc',
              fontSize: '14px',
              lineHeight: 1.7,
              marginBottom: '24px',
            }}
          >
            {movie.description}
          </p>
          <button
            onClick={() => onPlay(movie)}
            style={{
              ...S.btn('red'),
              width: '100%',
              justifyContent: 'center',
              fontFamily: "'Bebas Neue',cursive",
              letterSpacing: '2px',
              fontSize: '17px',
            }}
          >
            ▶ LANCER LA LECTURE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CATALOGUE ────────────────────────────────────────────────────────────────
function Catalogue({ user, onLogout, movies, loading }) {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('Tous');
  const [selMovie, setSelMovie] = useState(null);
  const [playMovie, setPlayMovie] = useState(null);
  const [navBg, setNavBg] = useState(false);
  const [sfocus, setSfocus] = useState(false);

  useEffect(() => {
    const s = () => setNavBg(window.scrollY > 80);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  const featured = movies.find((m) => m.featured) || movies[0];
  const filtered = movies.filter((m) => {
    const ms = m.title.toLowerCase().includes(search.toLowerCase());
    const mg = genre === 'Tous' || m.genres?.includes(genre);
    return ms && mg;
  });

  const rows = [
    { title: '▶ Ajouts récents', items: movies.slice(0, 7) },
    {
      title: '★ Les mieux notés',
      items: [...movies]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 7),
    },
    {
      title: '🎬 Sci-Fi & Aventure',
      items: movies.filter((m) =>
        m.genres?.some((g) => ['Sci-Fi', 'Aventure'].includes(g))
      ),
    },
    {
      title: '🎭 Drames & Romance',
      items: movies.filter((m) =>
        m.genres?.some((g) => ['Drame', 'Romance'].includes(g))
      ),
    },
  ].filter((r) => r.items.length > 0);

  if (playMovie)
    return (
      <Player
        movie={playMovie}
        token={user.uid}
        onClose={() => setPlayMovie(null)}
      />
    );

  return (
    <div
      style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* NAV */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: '60px',
          padding: '0 5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            navBg || sfocus
              ? 'rgba(10,10,10,0.97)'
              : 'linear-gradient(rgba(0,0,0,0.8),transparent)',
          backdropFilter: navBg || sfocus ? 'blur(12px)' : 'none',
          borderBottom: navBg ? '1px solid rgba(255,255,255,0.05)' : 'none',
          transition: 'all 0.3s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <span
            style={{
              color: '#e50914',
              fontFamily: "'Bebas Neue',cursive",
              fontSize: '26px',
              letterSpacing: '4px',
            }}
          >
            CINÉ<span style={{ color: '#fff' }}>CLOUD</span>
          </span>
          <div style={{ display: 'flex', gap: '18px' }}>
            {['Accueil', 'Films', 'Récents'].map((t) => (
              <span
                key={t}
                style={{
                  color: '#aaa',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#fff')}
                onMouseLeave={(e) => (e.target.style.color = '#aaa')}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: sfocus ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: sfocus ? '1px solid #444' : '1px solid transparent',
              borderRadius: '6px',
              padding: '6px 10px',
              transition: 'all 0.25s',
            }}
          >
            <span style={{ color: '#888', fontSize: '14px' }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSfocus(true)}
              onBlur={() => setSfocus(false)}
              placeholder="Rechercher..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                width: sfocus ? '150px' : '80px',
                transition: 'width 0.3s',
                fontFamily: "'DM Sans',sans-serif",
              }}
            />
          </div>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#e50914',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
            }}
            title="Déconnexion"
            onClick={onLogout}
          >
            {user.name[0].toUpperCase()}
          </div>
        </div>
      </nav>

      {/* HERO */}
      {!search && genre === 'Tous' && featured && (
        <div
          style={{ position: 'relative', height: '88vh', overflow: 'hidden' }}
        >
          <img
            src={featured.backdrop || featured.poster}
            alt={featured.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.45)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to right,rgba(0,0,0,0.88) 38%,transparent 75%), linear-gradient(to top,rgba(0,0,0,0.85) 12%,transparent 45%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '18%',
              left: '5%',
              maxWidth: '480px',
            }}
          >
            <div
              style={{
                color: '#e50914',
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '3px',
                marginBottom: '12px',
              }}
            >
              ⬥ À LA UNE
            </div>
            <h1
              style={{
                color: '#fff',
                fontSize: 'clamp(36px,5vw,62px)',
                fontFamily: "'Bebas Neue',cursive",
                letterSpacing: '2px',
                margin: '0 0 14px',
                lineHeight: 1,
              }}
            >
              {featured.title}
            </h1>
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              {featured.rating && (
                <span style={{ color: '#f5c518', fontWeight: 700 }}>
                  ★ {featured.rating}
                </span>
              )}
              <span style={{ color: '#aaa', fontSize: '13px' }}>
                {featured.year}
              </span>
            </div>
            <p
              style={{
                color: '#ccc',
                fontSize: '15px',
                lineHeight: 1.6,
                marginBottom: '22px',
              }}
            >
              {featured.description}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setPlayMovie(featured)}
                style={{
                  ...S.btn('white'),
                  fontFamily: "'Bebas Neue',cursive",
                  letterSpacing: '1px',
                  fontSize: '16px',
                }}
              >
                ▶ Lecture
              </button>
              <button
                onClick={() => setSelMovie(featured)}
                style={{
                  ...S.btn('ghost'),
                  fontFamily: "'Bebas Neue',cursive",
                  letterSpacing: '1px',
                  fontSize: '16px',
                }}
              >
                ⓘ Plus d'infos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GENRE PILLS */}
      <div
        style={{
          padding: !search && genre === 'Tous' ? '0 5% 24px' : '80px 5% 24px',
          marginTop: !search && genre === 'Tous' ? '-60px' : '0',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ALL_GENRES.filter(
            (g) => g === 'Tous' || movies.some((m) => m.genres?.includes(g))
          ).map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              style={{
                padding: '6px 14px',
                borderRadius: '18px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                fontFamily: "'DM Sans',sans-serif",
                background: genre === g ? '#e50914' : 'rgba(255,255,255,0.09)',
                color: '#fff',
                transition: 'all 0.2s',
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <p>Chargement du catalogue depuis Google Drive...</p>
        </div>
      )}

      {/* SEARCH RESULTS */}
      {(search || genre !== 'Tous') && !loading && (
        <div style={{ padding: '0 5% 40px' }}>
          <p
            style={{
              color: '#666',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            {filtered.length} film{filtered.length > 1 ? 's' : ''} trouvé
            {filtered.length > 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {filtered.map((m) => (
              <MovieCard key={m.id} movie={m} onClick={setSelMovie} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div
              style={{ textAlign: 'center', padding: '60px', color: '#444' }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎬</div>
              <p>
                Aucun film trouvé pour "
                <strong style={{ color: '#666' }}>{search}</strong>"
              </p>
            </div>
          )}
        </div>
      )}

      {/* ROWS */}
      {!search &&
        genre === 'Tous' &&
        !loading &&
        rows.map((row) => (
          <div key={row.title} style={{ marginBottom: '36px' }}>
            <h2
              style={{
                color: '#e5e5e5',
                fontSize: '19px',
                fontWeight: 700,
                fontFamily: "'Bebas Neue',cursive",
                letterSpacing: '2px',
                marginBottom: '12px',
                paddingLeft: '5%',
              }}
            >
              {row.title}
            </h2>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingLeft: '5%',
                paddingRight: '5%',
                paddingBottom: '10px',
                scrollbarWidth: 'none',
              }}
            >
              {row.items.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={setSelMovie} />
              ))}
            </div>
          </div>
        ))}

      {/* MODALS */}
      {selMovie && (
        <MovieModal
          movie={selMovie}
          onClose={() => setSelMovie(null)}
          onPlay={(m) => {
            setSelMovie(null);
            setPlayMovie(m);
          }}
        />
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function CineCloud() {
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState(MOCK_MOVIES);
  const [loading, setLoading] = useState(false);

  // Quand un vrai utilisateur est connecté, charge le vrai catalogue
  useEffect(() => {
    if (!user || USE_MOCK) return;
    setLoading(true);
    fetch(`${API_BASE}/api/movies`, {
      headers: { Authorization: `Bearer ${user.uid}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setMovies(data.movies);
        setLoading(false);
      })
      .catch(() => {
        setMovies(MOCK_MOVIES);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <Login onLogin={setUser} />;
  return (
    <Catalogue
      user={user}
      onLogout={() => setUser(null)}
      movies={movies}
      loading={loading}
    />
  );
}
