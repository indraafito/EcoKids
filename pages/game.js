import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EcoMascot from "../components/ui/EcoMascot";
import { gameItems } from "../data/gameItems";
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import * as Lucide from 'lucide-react';

// 1. Draggable Waste Card
function DraggableWasteCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.05 : 1})`,
    zIndex: 50,
  } : undefined;

  // Dynamically resolve lucide icon name
  const IconComponent = Lucide[item.icon] || Lucide.HelpCircle;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-full max-w-sm mx-auto p-6 bg-white border-3 border-primary-bg rounded-2xl shadow-[0_6px_0_0_var(--color-primary-bg)] cursor-grab active:cursor-grabbing text-center space-y-4 select-none touch-none transition-all hover:scale-102
        ${isDragging ? 'opacity-90 border-primary' : ''}`}
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-primary-bg/20 border-2 border-primary-bg flex items-center justify-center text-primary">
        <IconComponent className="w-10 h-10" />
      </div>
      <div>
        <h3 className="text-2xl font-nunito font-extrabold text-primary-dark">{item.name}</h3>
        <p className="text-xs font-sans font-medium text-primary-dark/65 mt-2 bg-primary-bg/10 p-2.5 rounded-xl border border-primary-bg/50">
          Petunjuk: {item.hint}
        </p>
      </div>
      <p className="text-[10px] font-nunito font-extrabold text-primary uppercase tracking-widest animate-pulse">
        Tarik sampah ini ke tong yang benar!
      </p>
    </div>
  );
}

// 2. Droppable Bin
function DroppableBin({ id, name, color, activeColor, icon: BinIcon }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-3xl p-6 border-4 flex flex-col items-center justify-center text-center transition-all duration-300 aspect-square w-full select-none
        ${isOver 
          ? `${activeColor} border-white scale-105 shadow-xl` 
          : `${color} border-white/60 shadow-md`
        }`}
    >
      <BinIcon className={`w-14 h-14 mb-3 ${isOver ? 'animate-bounce' : ''}`} />
      <h4 className="font-nunito font-black text-xl tracking-wide uppercase">
        {name}
      </h4>
      <p className="text-[10px] font-sans font-semibold opacity-75 mt-1.5 leading-tight">
        {isOver ? 'Lepaskan di sini!' : 'Jatuhkan ke sini'}
      </p>
    </div>
  );
}

// 3. Main Game Component
function WasteSortingGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [itemsList, setItemsList] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctSorts, setCorrectSorts] = useState(0);

  // Sound/Vib feedback states
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

  // Initialize/Shuffle Game Items
  const startGame = () => {
    const shuffled = [...gameItems].sort(() => Math.random() - 0.5);
    setItemsList(shuffled);
    setCurrentItemIndex(0);
    setScore(0);
    setCorrectSorts(0);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsPlaying(true);
    setFeedback(null);
  };

  const saveGameActivity = useCallback(async () => {
    try {
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType: 'game',
          metadata: {
            score,
            correctSorts,
            totalItems: gameItems.length,
          },
        }),
      });
    } catch (e) {
      console.error(e);
    }
  }, [score, correctSorts]);

  const endGame = useCallback(() => {
    setIsGameOver(true);
    saveGameActivity();
  }, [saveGameActivity]);

  // Game Timer Countdown
  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, endGame]);

  // Drag End Handling
  const handleDragEnd = (event) => {
    const { over } = event;
    if (!over) return;

    const currentItem = itemsList[currentItemIndex];
    const dropTargetBin = over.id; // 'organic' | 'inorganic'

    const isCorrect = currentItem.category === dropTargetBin;

    if (isCorrect) {
      setScore((prev) => prev + 10);
      setCorrectSorts((prev) => prev + 1);
      setFeedback('correct');
    } else {
      setScore((prev) => Math.max(0, prev - 5));
      setFeedback('wrong');
    }

    // Hide feedback after 0.5s and slide next item
    setTimeout(() => {
      setFeedback(null);
      if (currentItemIndex + 1 < itemsList.length) {
        setCurrentItemIndex((prev) => prev + 1);
      } else {
        // Shuffled list exhausted, loop them back
        const shuffled = [...gameItems].sort(() => Math.random() - 0.5);
        setItemsList(shuffled);
        setCurrentItemIndex(0);
      }
    }, 600);
  };

  // Grade evaluator
  const getLetterGrade = (finalScore) => {
    if (finalScore >= 120) return { grade: 'A', name: 'Pahlawan Bumi Lestari', color: 'text-emerald-500' };
    if (finalScore >= 80) return { grade: 'B', name: 'Penolong Lingkungan', color: 'text-sky-500' };
    if (finalScore >= 40) return { grade: 'C', name: 'Sahabat Belajar Eco', color: 'text-amber-500' };
    return { grade: 'D', name: 'Pemula Peduli Hijau', color: 'text-rose-500' };
  };

  const currentItem = itemsList[currentItemIndex];

  return (
    <>
      <Head>
        <title>Game Sortir Sampah | Smart EcoKids</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6 select-none">
        
        {/* Game Info Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-nunito font-extrabold text-primary-dark">
              Game Sortir Eco
            </h2>
            <p className="text-sm font-nunito font-bold text-primary">
              Pilah sampah secepat mungkin ke wadah yang benar!
            </p>
          </div>
          {isPlaying && !isGameOver && (
            <div className="flex gap-4">
              <div className="bg-white border-2 border-primary-bg px-4 py-2 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] font-nunito font-extrabold text-primary-dark/60 uppercase tracking-widest block">Skor</span>
                <span className="text-xl font-nunito font-black text-primary">{score}</span>
              </div>
              <div className="bg-white border-2 border-rose-100 px-4 py-2 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] font-nunito font-extrabold text-rose-700/60 uppercase tracking-widest block">Waktu</span>
                <span className={`text-xl font-nunito font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-rose-500'}`}>{timeLeft}s</span>
              </div>
            </div>
          )}
        </div>

        {/* Start Game screen */}
        {!isPlaying && !isGameOver && (
          <Card className="p-8 text-center bg-white border-3 border-primary-bg space-y-6 max-w-lg mx-auto py-12">
            <div className="animate-float flex justify-center">
              <EcoMascot size={130} />
            </div>
            <h3 className="text-2xl font-nunito font-extrabold text-primary-dark">
              Mari Bantu Eco Memilah Sampah!
            </h3>
            <p className="text-sm font-sans font-medium text-gray-500 leading-relaxed max-w-sm mx-auto">
              Tarik sampah organik dan anorganik ke tong yang tepat. Dapatkan +10 poin untuk jawaban benar, dan -5 poin untuk jawaban yang salah. Waktumu hanya 60 detik!
            </p>
            <Button onClick={startGame} variant="primary" className="px-10 py-4 text-xl">
              Mulai Bermain!
            </Button>
          </Card>
        )}

        {/* Active Game screen */}
        {isPlaying && !isGameOver && currentItem && (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6">
              
              {/* Left Bin: Organic */}
              <DroppableBin
                id="organic"
                name="Organik"
                color="bg-primary-green text-white border-primary-dark/20"
                activeColor="bg-primary-bg text-primary-dark border-primary-green"
                icon={Lucide.TreeDeciduous}
              />

              {/* Middle: Draggable Waste Card */}
              <div className="flex justify-center items-center h-80 relative">
                
                {/* Correct/Wrong feedback graphics overlay */}
                {feedback === 'correct' && (
                  <div className="absolute z-50 animate-bounce flex flex-col items-center gap-1">
                    <Lucide.CheckCircle className="w-16 h-16 text-emerald-500 bg-white rounded-full p-2 border-2 border-emerald-500 shadow-md" />
                    <span className="text-xl font-nunito font-black text-emerald-500 bg-white px-3 py-1 rounded-full border border-emerald-300">+10 Poin</span>
                  </div>
                )}
                {feedback === 'wrong' && (
                  <div className="absolute z-50 animate-bounce flex flex-col items-center gap-1">
                    <Lucide.AlertCircle className="w-16 h-16 text-rose-500 bg-white rounded-full p-2 border-2 border-rose-500 shadow-md" />
                    <span className="text-xl font-nunito font-black text-rose-500 bg-white px-3 py-1 rounded-full border border-rose-300">-5 Poin</span>
                  </div>
                )}

                {!feedback && (
                  <DraggableWasteCard item={currentItem} />
                )}
              </div>

              {/* Right Bin: Inorganic */}
              <DroppableBin
                id="inorganic"
                name="Anorganik"
                color="bg-primary text-white border-primary-dark/20"
                activeColor="bg-primary-bg text-primary-dark border-primary"
                icon={Lucide.Trash2}
              />

            </div>
          </DndContext>
        )}

        {/* Game Over screen */}
        {isGameOver && (
          <Card className="p-8 text-center bg-white border-3 border-primary-bg space-y-6 max-w-lg mx-auto py-12">
            <div className="flex justify-center">
              <EcoMascot size={120} />
            </div>
            <div>
              <span className="text-xs font-nunito font-black text-primary uppercase tracking-widest block mb-1">
                Game Selesai!
              </span>
              <h3 className="text-3xl font-nunito font-black text-primary-dark">
                Skor Akhirmu: <span className="text-primary">{score}</span>
              </h3>
            </div>

            {/* Letter Grade result */}
            <div className="bg-primary-bg/20 rounded-3xl p-5 border-2 border-primary-bg">
              <p className="text-[10px] font-sans font-bold text-gray-400 uppercase tracking-widest">
                Predikat Pahlawan
              </p>
              <p className={`text-5xl font-nunito font-black mt-2 ${getLetterGrade(score).color}`}>
                Grade {getLetterGrade(score).grade}
              </p>
              <p className="font-nunito font-bold text-base text-primary-dark/85 mt-2">
                {getLetterGrade(score).name}
              </p>
              <p className="text-xs text-gray-500 font-sans mt-3">
                Kamu berhasil memilah <span className="font-bold text-primary-green">{correctSorts}</span> sampah dengan benar dalam 60 detik!
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={startGame} variant="primary" className="flex-1">
                Main Lagi!
              </Button>
              <Link href="/dashboard/student" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Kembali Ke Beranda
                </Button>
              </Link>
            </div>
          </Card>
        )}

      </div>
    </>
  );
}

// Disable SSR for drag and drop mouse events
const WasteSortingGameNoSSR = dynamic(() => Promise.resolve(WasteSortingGame), {
  ssr: false
});

export default withAuth(WasteSortingGameNoSSR, { requiredRole: "siswa" });
