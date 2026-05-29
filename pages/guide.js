import Head from 'next/head';
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EcoMascot from "../components/ui/EcoMascot";
import { Package, Sprout, Leaf, Scissors } from 'lucide-react';

function GuidePage() {
  const diyProjects = [
    {
      title: 'Celengan Lucu Botol Bekas',
      category: 'inorganic',
      material: 'Botol plastik bekas, kertas warna, lem, gunting.',
      icon: Package,
      steps: [
        'Bersihkan botol plastik bekas minuman lalu keringkan.',
        'Lubangi bagian tengah botol memanjang untuk tempat koin uang masuk (minta bantuan orang dewasa).',
        'Hias sekeliling botol menggunakan kertas warna agar membentuk pola hewan kesukaanmu.',
        'Celengan daur ulang lucumu siap digunakan!',
      ],
    },
    {
      title: 'Pot Tanaman Hias Koran Bekas',
      category: 'organic',
      material: 'Koran bekas, air hangat, lem kayu, kuas, cat warna.',
      icon: Sprout,
      steps: [
        'Robek kertas koran bekas menjadi serpihan kecil.',
        'Rendam kertas dalam air hangat semalaman agar menjadi bubur kertas halus.',
        'Peras airnya, lalu campurkan bubur kertas dengan lem kayu secukupnya.',
        'Tempelkan adonan bubur koran memutari cetakan gelas atau mangkuk, lalu keringkan selama 2 hari.',
        'Lepas dari cetakan, cat pot koranmu dengan warna-warni cantik!',
      ],
    },
    {
      title: 'Kompos Dapur Mini Ceria',
      category: 'organic',
      material: 'Sisa potongan sayuran dapur, tanah humus, wadah pot berlubang.',
      icon: Leaf,
      steps: [
        'Kumpulkan sisa kupasan wortel, kol, kentang, dan kulit buah dari dapur.',
        'Siapkan pot plastik berlubang, lapisi dasarnya dengan tanah setebal 5 cm.',
        'Masukkan sisa potongan sayuran di atas tanah, lalu lapisi kembali dengan tanah.',
        'Aduk sedikit seminggu sekali. Dalam 4 minggu, sampah berubah menjadi kompos subur!',
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Panduan DIY | Smart EcoKids</title>
      </Head>

      <div className="space-y-6 select-none animate-fade-in">
        <div>
          <h2 className="text-3xl font-nunito font-extrabold text-primary-dark">
            Panduan Kreatif DIY
          </h2>
          <p className="text-sm font-nunito font-bold text-primary">
            Ubah sampah menjadi kerajinan seru bernilai guna dengan petunjuk praktis ramah anak.
          </p>
        </div>

        <Card className="p-6 bg-linear-to-r from-primary-bg to-primary-green/20 border-3 border-primary-bg flex items-center gap-5">
          <EcoMascot size={75} className="animate-float" />
          <div className="space-y-1">
            <h3 className="font-nunito font-extrabold text-lg text-primary-dark">Upcycling (Daur Ulang Kreatif)</h3>
            <p className="text-xs font-sans font-semibold text-primary-dark/80 leading-relaxed">
              Tahukah kamu? Upcycling adalah cara asyik mendaur ulang barang bekas di rumah menjadi hiasan atau benda baru bernilai tinggi! Ayo kita coba proyek seru di bawah ini.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diyProjects.map((project) => {
            const ProjectIcon = project.icon;

            return (
              <Card key={project.title} className="p-6 flex flex-col justify-between space-y-4 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <ProjectIcon className="w-8 h-8 text-primary" />
                    <Badge color={project.category === 'organic' ? 'organic' : 'inorganic'}>
                      {project.category === 'organic' ? 'Organik' : 'Anorganik'}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-nunito font-bold text-primary-dark leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-[11px] font-sans font-semibold text-gray-500 bg-primary-bg/20 p-2.5 rounded-xl border border-primary-bg/50 inline-flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Bahan: {project.material}</span>
                  </p>

                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-xs font-nunito font-extrabold text-primary-dark block">Langkah Pembuatan:</span>
                    <ol className="space-y-1.5 text-xs text-gray-600 font-sans font-medium list-decimal pl-4.5 leading-relaxed">
                      {project.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default withAuth(GuidePage, { requiredRole: "siswa" });
