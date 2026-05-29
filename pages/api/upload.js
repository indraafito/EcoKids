import formidable from 'formidable';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // max 5MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(400).json({ error: 'Gagal memproses file' });
    }
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ error: 'Tidak ada file yang dikirim' });
    }

    try {
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'smart-ecokids',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, crop: 'limit' }],
      });
      return res.status(200).json({ url: result.secure_url, publicId: result.public_id });
    } catch (uploadError) {
      console.error("Cloudinary error:", uploadError);
      return res.status(500).json({ error: 'Gagal mengunggah ke Cloudinary' });
    }
  });
}
