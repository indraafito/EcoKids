import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Format email tidak valid').max(255),
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').max(100),
  role: z.enum(['siswa', 'guru']),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
  schoolName: z.string().max(100).optional().nullable(),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  // 1. Validasi Input dengan Zod
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    const errorMsg = validation.error.errors[0].message;
    return res.status(400).json({ error: errorMsg });
  }

  const { email, password, fullName, role, schoolName } = validation.data;

  try {
    // 2. Cek Email Terdaftar
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()));
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    // 3. Hash Password & Insert
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName.trim(),
      role,
      schoolName: schoolName ? schoolName.trim() : null,
    }).returning({ id: users.id });

    return res.status(201).json({ 
      message: 'Akun berhasil dibuat', 
      userId: result[0].id 
    });

  } catch (error) {
    console.error('Registration API error:', error);
    return res.status(500).json({ error: 'Gagal membuat akun, coba lagi nanti' });
  }
}
