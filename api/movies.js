// api/movies.js — Vercel Serverless Function
// Liste les films depuis Google Drive + enrichit avec les métadonnées TMDB

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY; // gratuit sur themoviedb.org
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID; // ID du dossier Drive principal

export default async function handler(req, res) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*'
  );
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Liste les fichiers vidéo dans le dossier Drive
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files` +
        `?q='${DRIVE_FOLDER_ID}'+in+parents+and+mimeType+contains+'video/'` +
        `&fields=files(id,name,size,mimeType,modifiedTime)` +
        `&orderBy=name&pageSize=100` +
        `&key=${GOOGLE_API_KEY}`
    );

    if (!driveRes.ok) throw new Error('Erreur Drive API');
    const { files } = await driveRes.json();

    // 2. Pour chaque fichier, enrichit avec TMDB
    const movies = await Promise.all(
      files.map(async (file) => {
        const title = cleanTitle(file.name);
        const tmdb = await fetchTMDB(title);
        return {
          id: file.id, // = fileId pour le stream
          driveFileId: file.id,
          title: tmdb?.title || title,
          originalTitle: tmdb?.original_title || title,
          year: tmdb?.release_date?.slice(0, 4) || '?',
          description: tmdb?.overview || 'Aucune description disponible.',
          poster: tmdb?.poster_path
            ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
            : null,
          backdrop: tmdb?.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${tmdb.backdrop_path}`
            : null,
          rating: tmdb?.vote_average
            ? Math.round(tmdb.vote_average * 10) / 10
            : null,
          genres: tmdb?.genre_ids || [],
          fileSize: file.size,
          mimeType: file.mimeType,
          addedAt: file.modifiedTime,
        };
      })
    );

    res.status(200).json({ movies, total: movies.length });
  } catch (err) {
    console.error('Movies API error:', err);
    res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
}

// Nettoie le nom de fichier pour la recherche TMDB
// "Dune.Part.Two.2024.1080p.mkv" → "Dune Part Two"
function cleanTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // enlève l'extension
    .replace(/\./g, ' ') // points → espaces
    .replace(/\b(19|20)\d{2}\b.*$/, '') // enlève l'année et tout ce qui suit
    .replace(
      /\b(720p|1080p|4k|hdtv|bluray|webrip|x264|x265|hevc|avc)\b.*/gi,
      ''
    )
    .trim();
}

// Cherche les infos du film sur TMDB
async function fetchTMDB(title) {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie` +
        `?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          title
        )}&language=fr-FR`
    );
    const data = await res.json();
    return data.results?.[0] || null;
  } catch {
    return null;
  }
}
