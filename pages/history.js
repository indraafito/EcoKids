import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { db } from "../lib/db";
import { scanHistory } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import EcoMascot from "../components/ui/EcoMascot";
import { Search, Filter, Calendar } from 'lucide-react';

function HistoryPage({ initialScans }) {
  const [scans, setScans] = useState(initialScans);
  const [filter, setFilter] = useState('all'); // 'all' | 'organic' | 'inorganic'
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredScans = scans.filter((scan) => {
    const matchesFilter = filter === 'all' || scan.wasteType === filter;
    const matchesSearch = scan.wasteName.toLowerCase().includes(search.toLowerCase()) ||
                          scan.explanation.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const displayedScans = filteredScans.slice(0, visibleCount);

  return (
    <>
      <Head>
        <title>Riwayat Scan | Smart EcoKids</title>
      </Head>

      <div className="space-y-6 select-none">
        
        {/* Title */}
        <div>
          <h2 className="text-3xl font-nunito font-extrabold text-primary-dark">
            Riwayat Scan Sampah
          </h2>
          <p className="text-sm font-nunito font-bold text-primary">
            Lihat kembali semua sampah yang berhasil kamu pilah dan temukan kembali fakta menariknya.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Input
              id="search-history"
              placeholder="Cari nama sampah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2.5 rounded-full font-nunito font-bold text-sm border-2 transition-all cursor-pointer
                ${filter === 'all'
                  ? 'bg-primary-bg border-primary-hover text-primary-dark'
                  : 'bg-white border-primary-bg/50 text-gray-400 hover:bg-primary-bg/20'
                }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('organic')}
              className={`px-5 py-2.5 rounded-full font-nunito font-bold text-sm border-2 transition-all cursor-pointer
                ${filter === 'organic'
                  ? 'bg-primary-hover border-primary-green text-white shadow-md'
                  : 'bg-white border-primary-bg/50 text-gray-400 hover:bg-primary-bg/20'
                }`}
            >
              Organik
            </button>
            <button
              onClick={() => setFilter('inorganic')}
              className={`px-5 py-2.5 rounded-full font-nunito font-bold text-sm border-2 transition-all cursor-pointer
                ${filter === 'inorganic'
                  ? 'bg-primary border-primary-dark/30 text-white shadow-md'
                  : 'bg-white border-primary-bg/50 text-gray-400 hover:bg-primary-bg/20'
                }`}
            >
              Anorganik
            </button>
          </div>
        </div>

        {/* Scans Grid */}
        {displayedScans.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center bg-white">
            <div className="animate-float mb-4">
              <EcoMascot size={110} />
            </div>
            <h3 className="text-xl font-nunito font-extrabold text-primary-dark/80">
              Tidak Ada Sampah Ditemukan 🔍
            </h3>
            <p className="text-sm font-sans font-medium text-gray-400 max-w-sm mt-1 mb-6">
              Cobalah sesuaikan pencarian atau mulai scan pertama sampahmu hari ini!
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedScans.map((scan) => (
              <Card key={scan.id} className="p-4 flex flex-col space-y-4 bg-white">
                
                {/* Photo frame */}
                <div className="w-full h-44 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src={scan.imageUrl}
                    alt={scan.wasteName}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge color={scan.wasteType === 'organic' ? 'organic' : 'inorganic'}>
                      {scan.wasteType === 'organic' ? 'Organik' : 'Anorganik'}
                    </Badge>
                  </div>
                </div>

                {/* Body Details */}
                <div className="space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-nunito font-bold text-primary-dark truncate">
                      {scan.wasteName}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(scan.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="font-extrabold text-primary">
                        Kecocokan: {scan.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-sans mt-3 line-clamp-3">
                      {scan.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Trigger */}
        {filteredScans.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <Button onClick={handleLoadMore} variant="secondary">
              Muat Lebih Banyak 🔄
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default withAuth(HistoryPage, { requiredRole: "siswa" });

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user || session.user.role !== 'siswa') {
    return { props: { initialScans: [] } };
  }

  try {
    const records = await db
      .select()
      .from(scanHistory)
      .where(eq(scanHistory.userId, session.user.id))
      .orderBy(desc(scanHistory.scannedAt));

    const recordsSerialized = records.map(r => ({
      ...r,
      scannedAt: r.scannedAt.toISOString(),
    }));

    return {
      props: {
        initialScans: recordsSerialized,
      }
    };
  } catch (error) {
    console.error("history query error:", error);
    return {
      props: {
        initialScans: [],
      }
    };
  }
}
