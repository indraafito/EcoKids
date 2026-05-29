const wasteKnowledge = {
  organic: {
    names: [
      'sisa makanan',
      'kulit buah',
      'daun kering',
      'sayuran',
      'cangkang telur',
      'ampas kopi',
      'tulang kecil',
      'ranting',
    ],
    explanation:
      'Sampah ini termasuk organik karena berasal dari makhluk hidup dan dapat terurai secara alami menjadi kompos.',
    recommendation:
      'Pisahkan dari plastik atau logam, lalu kumpulkan di wadah kompos. Jika basah, tiriskan dahulu agar tidak cepat berbau.',
  },
  inorganic: {
    names: [
      'botol plastik',
      'gelas plastik',
      'kaleng',
      'kardus',
      'kertas',
      'botol kaca',
      'kantong plastik',
      'styrofoam',
      'kemasan makanan',
    ],
    explanation:
      'Sampah ini termasuk anorganik karena berasal dari bahan buatan atau mineral yang sulit terurai secara alami.',
    recommendation:
      'Bersihkan dari sisa makanan atau minuman, keringkan, lalu kumpulkan untuk bank sampah atau daur ulang.',
  },
};

function clampConfidence(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 70;
  return Math.min(98, Math.max(55, parsed));
}

function normalizeWasteType(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('organik') || normalized === 'organic') return 'organic';
  if (normalized.includes('anorganik') || normalized === 'inorganic') return 'inorganic';
  return null;
}

function buildResult({ wasteName, wasteType, confidence, explanation, recommendation, source }) {
  const safeType = normalizeWasteType(wasteType) || 'inorganic';
  const defaults = wasteKnowledge[safeType];

  return {
    wasteName: wasteName?.trim() || (safeType === 'organic' ? 'Sampah Organik' : 'Sampah Anorganik'),
    wasteType: safeType,
    confidence: clampConfidence(confidence),
    explanation: explanation?.trim() || defaults.explanation,
    recommendation: recommendation?.trim() || defaults.recommendation,
    source,
  };
}

function extractJson(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export function classifyByFilename(fileName = '') {
  const normalized = fileName.toLowerCase();

  for (const [wasteType, config] of Object.entries(wasteKnowledge)) {
    const match = config.names.find((name) => normalized.includes(name.replace(/\s+/g, '-')) || normalized.includes(name));
    if (match) {
      return buildResult({
        wasteName: match.replace(/\b\w/g, (char) => char.toUpperCase()),
        wasteType,
        confidence: 68,
        source: 'filename-fallback',
      });
    }
  }

  return buildResult({
    wasteName: 'Objek Sampah',
    wasteType: 'inorganic',
    confidence: 55,
    explanation:
      'Model visual belum aktif, sehingga hasil ini adalah estimasi aman. Banyak sampah rumah tangga dari foto upload termasuk kemasan anorganik.',
    recommendation:
      'Periksa objek secara manual. Jika berasal dari sisa makanan atau tumbuhan, masukkan ke organik; jika plastik, kertas, logam, kaca, atau kemasan, masukkan ke anorganik.',
    source: 'safe-fallback',
  });
}

export async function classifyWasteImage({ imageUrl, fileName }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return classifyByFilename(fileName);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error('Gagal mengambil gambar untuk dianalisis');
  }

  const mimeType = imageResponse.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  const prompt = `
Kamu adalah model klasifikasi sampah untuk aplikasi edukasi anak Indonesia.
Analisis gambar dan tentukan objek sampah utama.
Pilih wasteType hanya salah satu: "organic" atau "inorganic".
Organic: sisa makanan, daun, buah, sayur, ranting, ampas kopi, cangkang telur.
Inorganic: plastik, kertas, kardus, logam, kaca, kaleng, styrofoam, baterai, kemasan.
Jawab hanya JSON valid dengan bentuk:
{
  "wasteName": "nama sampah spesifik dalam Bahasa Indonesia",
  "wasteType": "organic atau inorganic",
  "confidence": 0-100,
  "explanation": "alasan singkat ramah anak",
  "recommendation": "saran pemilahan atau daur ulang praktis"
}
Jika gambar tidak jelas, turunkan confidence dan jelaskan agar pengguna foto ulang.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Model klasifikasi gagal: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') || '';
  const parsed = extractJson(text);

  if (!parsed) {
    throw new Error('Model tidak mengembalikan JSON valid');
  }

  return buildResult({ ...parsed, source: 'gemini-vision' });
}
