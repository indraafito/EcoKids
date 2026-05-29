import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { studentActivities } from "@/drizzle/schema";

const allowedActivityTypes = new Set(['game', 'guide']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const { activityType, metadata = {} } = req.body;
  if (!allowedActivityTypes.has(activityType)) {
    return res.status(400).json({ error: 'Jenis aktivitas tidak valid' });
  }

  try {
    const activity = await db.insert(studentActivities).values({
      userId: session.user.id,
      activityType,
      metadata: JSON.stringify(metadata),
    }).returning({ id: studentActivities.id, createdAt: studentActivities.createdAt });

    return res.status(201).json(activity[0]);
  } catch (error) {
    console.error('Activity saving error:', error);
    return res.status(500).json({ error: 'Gagal menyimpan aktivitas' });
  }
}
