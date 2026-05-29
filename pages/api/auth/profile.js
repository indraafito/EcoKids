import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const { fullName, schoolName, avatarUrl } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ error: 'Nama lengkap tidak boleh kosong' });
  }

  try {
    await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        schoolName: schoolName ? schoolName.trim() : null,
        avatarUrl: avatarUrl || null,
      })
      .where(eq(users.id, session.user.id));

    return res.status(200).json({ message: 'Profil berhasil diperbarui' });
  } catch (error) {
    console.error('Profile update API error:', error);
    return res.status(500).json({ error: 'Gagal memperbarui profil' });
  }
}
