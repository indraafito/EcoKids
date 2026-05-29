import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { quizScores, studentActivities } from "@/drizzle/schema";
import { z } from "zod";

const quizScoreSchema = z.object({
  score: z.number().min(0).max(1000),
  totalQuestions: z.number().min(1),
  correctAnswers: z.number().min(0),
  timeTaken: z.number().min(0).max(600).optional(),
  moduleTitle: z.string().optional(),
}).refine(data => data.correctAnswers <= data.totalQuestions, {
  message: "Jawaban benar tidak boleh melebihi total pertanyaan",
  path: ["correctAnswers"],
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  // 1. Validasi Input dengan Zod
  const validation = quizScoreSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Data tidak valid', 
      details: validation.error.format() 
    });
  }

  const { score, totalQuestions, correctAnswers, timeTaken, moduleTitle } = validation.data;

  try {
    // 2. Simpan ke database
    const scoreResult = await db.insert(quizScores).values({
      userId: session.user.id,
      moduleTitle: moduleTitle ?? null,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken: timeTaken ?? null,
    }).returning({ id: quizScores.id, completedAt: quizScores.completedAt });

    // 3. Simpan aktivitas murid
    const activityMetadata = JSON.stringify({
      score,
      correctAnswers,
      totalQuestions,
      moduleTitle,
    });

    await db.insert(studentActivities).values({
      userId: session.user.id,
      activityType: 'quiz',
      metadata: activityMetadata,
    });

    return res.status(201).json({
      id: scoreResult[0].id,
      completedAt: scoreResult[0].completedAt,
    });

  } catch (error) {
    console.error('Quiz score saving error:', error);
    return res.status(500).json({ error: 'Gagal menyimpan skor kuis' });
  }
}
