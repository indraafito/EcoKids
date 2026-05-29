import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { scanHistory, studentActivities } from "@/drizzle/schema";
import { z } from "zod";

const scanSchema = z.object({
  imageUrl: z.string().url(),
  wasteType: z.string(),
  wasteName: z.string(),
  confidence: z.number().min(0).max(100).optional(),
  explanation: z.string().optional(),
  recommendation: z.string().optional(),
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
  const validation = scanSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Data tidak valid', 
      details: validation.error.format() 
    });
  }

  const { imageUrl, wasteType, wasteName, confidence, explanation, recommendation } = validation.data;

  try {
    // 2. Insert scan history
    const scanResult = await db.insert(scanHistory).values({
      userId: session.user.id,
      imageUrl,
      wasteType,
      wasteName,
      confidence: confidence ? Math.round(confidence) : 0,
      explanation: explanation || '',
      recommendation: recommendation || '',
    }).returning({ id: scanHistory.id, scannedAt: scanHistory.scannedAt });

    // 3. Insert student activity
    const activityMetadata = JSON.stringify({
      wasteName,
      wasteType,
      confidence: confidence ? Math.round(confidence) : 0
    });

    await db.insert(studentActivities).values({
      userId: session.user.id,
      activityType: 'scan',
      metadata: activityMetadata,
    });

    return res.status(201).json({
      id: scanResult[0].id,
      scannedAt: scanResult[0].scannedAt,
    });

  } catch (error) {
    console.error('Scan history saving error:', error);
    return res.status(500).json({ error: 'Gagal menyimpan riwayat scan' });
  }
}
