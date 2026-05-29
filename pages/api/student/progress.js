import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizScores } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { educationData } from "@/data/educationData";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  try {
    // Ambil semua skor kuis user ini
    const scores = await db
      .select({
        moduleTitle: quizScores.moduleTitle,
        score: quizScores.score,
      })
      .from(quizScores)
      .where(eq(quizScores.userId, session.user.id));

    // Petakan judul modul ke ID modul
    const completedModules = educationData
      .filter(module => scores.some(s => s.moduleTitle === module.title && s.score >= 700))
      .map(module => module.id);

    return res.status(200).json({ completedModules });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return res.status(500).json({ error: 'Gagal mengambil progres belajar' });
  }
}
