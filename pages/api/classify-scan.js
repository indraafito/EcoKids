import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { classifyWasteImage } from "@/lib/wasteClassifier";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Tidak terautentikasi' });
  }

  const { imageUrl, fileName } = req.body;
  if (!imageUrl || !imageUrl.startsWith('https://res.cloudinary.com/')) {
    return res.status(400).json({ error: 'URL gambar Cloudinary tidak valid' });
  }

  try {
    const result = await classifyWasteImage({ imageUrl, fileName });
    return res.status(200).json(result);
  } catch (error) {
    console.error('Scan classification error:', error);
    return res.status(500).json({ error: 'Gagal menganalisis gambar dengan model AI' });
  }
}
