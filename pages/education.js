import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EcoMascot from "../components/ui/EcoMascot";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { educationData } from "../data/educationData";
import {
  Award, ArrowRight, ArrowLeft,
  CheckCircle, XCircle, Timer,
  PlayCircle, Trophy, Cloud, Trees,
  Map as MapIcon, Star, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

function EducationQuizPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();

  // State Manajemen Modul
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'read' | 'quiz' | 'result'
  const [completedModules, setCompletedModules] = useState([]);
  
  // State Kuis
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Progres
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/student/progress');
        if (res.ok) {
          const data = await res.json();
          setCompletedModules(data.completedModules || []);
        }
      } catch (err) {
        console.error("Gagal mengambil progres:", err);
      }
    };
    if (session) fetchProgress();
  }, [session]);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (viewMode === 'quiz' && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleSelectOption(null); // Time's up
    }
    return () => clearInterval(timer);
  }, [viewMode, isAnswered, timeLeft]);

  // Pilih Modul
  const handleSelectModule = (module, isLocked) => {
    if (isLocked) {
      addToast({ message: 'Selesaikan misi sebelumnya untuk membuka misi ini!', type: 'warning' });
      return;
    }
    setSelectedModule(module);
    setViewMode('read');
    window.scrollTo(0, 0);
  };

  // Mulai Kuis dari Bacaan
  const startQuiz = () => {
    setViewMode('quiz');
    setCurrentIdx(0);
    setScore(0);
    setAnswers([]);
    setIsAnswered(false);
    setSelectedIdx(null);
    setTimeLeft(20);
    window.scrollTo(0, 0);
  };

  // Pilih Jawaban
  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setSelectedIdx(idx);
    
    const currentQuestion = selectedModule.questions[currentIdx];
    const isCorrect = idx === currentQuestion.correctIndex;
    
    if (isCorrect) {
      // Skor dasar 100 + bonus waktu (maks 100)
      const timeBonus = Math.floor(timeLeft * 2);
      setScore((prev) => prev + 100 + timeBonus);
    }
    
    setAnswers((prev) => [...prev, {
      questionIdx: currentIdx,
      selectedIdx: idx,
      isCorrect,
      timeLeft
    }]);
  };

  // Lanjut ke soal berikutnya atau hasil
  const nextStep = () => {
    if (currentIdx < selectedModule.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedIdx(null);
      setTimeLeft(20);
    } else {
      finishQuiz();
    }
  };

  // Selesai Kuis
  const finishQuiz = async () => {
    setViewMode('result');
    if (score >= 800) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#40D9E3', '#77D774', '#C9F26D'],
        zIndex: 999
      });
    }

    // Simpan skor ke API
    setIsSaving(true);
    try {
      const res = await fetch('/api/quiz-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.min(score, 1000), // Hard cap 1000
          totalQuestions: selectedModule.questions.length,
          correctAnswers: answers.filter(a => a.isCorrect).length,
          moduleTitle: selectedModule.title
        }),
      });
      
      if (!res.ok) throw new Error('Gagal menyimpan skor');
      addToast({ message: 'Skor kuis berhasil disimpan!', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ message: 'Gagal menyimpan skor, tapi petualanganmu tetap hebat!', type: 'warning' });
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDERING COMPONENTS ---

  // 1. Peta Petualangan (Adventure Map)
  if (viewMode === 'list') {
    return (
      <div className="space-y-12 animate-fade-in pb-32 overflow-hidden relative">
        <Head><title>Peta Misi | Smart EcoKids</title></Head>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 opacity-20 animate-float">
          <Cloud className="w-20 h-20 text-primary" />
        </div>
        <div className="absolute top-40 right-20 opacity-10 animate-float" style={{ animationDelay: '2s' }}>
          <Cloud className="w-32 h-32 text-primary" />
        </div>
        <div className="absolute bottom-20 left-1/4 opacity-10 animate-float" style={{ animationDelay: '4s' }}>
          <Trees className="w-24 h-24 text-primary-green" />
        </div>
        <div className="absolute top-1/2 right-10 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
          <Trees className="w-20 h-20 text-primary-green" />
        </div>

        <div className="text-center space-y-3 relative z-10 pt-10">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/40 shadow-sm mb-2">
            <MapIcon className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-nunito font-black text-primary uppercase tracking-[0.2em]">Peta Petualangan Eco</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-nunito font-black text-primary-dark">Misi Penyelamat Bumi</h2>
          <p className="text-lg font-nunito font-semibold text-primary-dark/60 max-w-xl mx-auto">
            Selesaikan setiap misi untuk membuka petualangan baru dan kumpulkan lencana pahlawanmu!
          </p>
        </div>

        {/* Adventure Path Layout */}
        <div className="relative max-w-4xl mx-auto pt-10 px-4">
          
          {/* Visual Path (SVG Curve) */}
          <svg className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none" viewBox="0 0 800 1200" fill="none" preserveAspectRatio="none">
            <path 
              d="M400,50 C600,150 700,250 400,400 C100,550 200,750 400,900 C600,1050 500,1150 400,1200" 
              stroke="var(--color-primary)" 
              strokeWidth="40" 
              strokeLinecap="round" 
              strokeDasharray="20 40"
            />
          </svg>

          <div className="flex flex-col gap-24 relative">
            {educationData.map((module, idx) => {
              const isCompleted = completedModules.includes(module.id);
              const isLocked = idx > 0 && !completedModules.includes(educationData[idx-1].id);
              const isCurrent = !isCompleted && !isLocked;
              
              // Alternating alignment for zigzag effect
              const alignmentClass = idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse';
              const translateX = idx % 2 === 0 ? 'md:translate-x-[-15%]' : 'md:translate-x-[15%]';

              return (
                <div key={module.id} className={`flex flex-col items-center gap-6 ${alignmentClass} ${translateX} transition-all duration-500`}>
                  
                  {/* Node Button */}
                  <div className="relative group">
                    {/* Pulsing ring for current mission */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-primary-teal animate-ping opacity-20" />
                    )}
                    
                    <button
                      onClick={() => handleSelectModule(module, isLocked)}
                      disabled={isLocked}
                      className={`
                        w-24 h-24 sm:w-28 sm:h-28 rounded-[35px] flex items-center justify-center transition-all duration-300 relative z-10 shadow-xl
                        ${isCompleted ? 'bg-linear-to-tr from-primary-green to-primary scale-100' : ''}
                        ${isCurrent ? 'bg-linear-to-tr from-primary-teal to-primary scale-110 ring-4 ring-white/50' : ''}
                        ${isLocked ? 'bg-gray-200 grayscale cursor-not-allowed opacity-80' : 'cursor-pointer hover:scale-105 active:scale-95'}
                      `}
                    >
                      {isCompleted ? (
                        <div className="flex flex-col items-center gap-1">
                          <Trophy className="w-8 h-8 text-white" />
                          <div className="flex gap-0.5">
                            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                          </div>
                        </div>
                      ) : isLocked ? (
                        <Lock className="w-8 h-8 text-gray-400" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <PlayCircle className="w-10 h-10 text-white" />
                          <span className="text-white font-nunito font-black text-xs">MULAI</span>
                        </div>
                      )}
                    </button>
                    
                    {/* Badge Number */}
                    <div className={`
                      absolute -top-3 -right-3 w-10 h-10 rounded-2xl flex items-center justify-center font-nunito font-black text-lg border-2 border-white shadow-lg z-20
                      ${isLocked ? 'bg-gray-300 text-gray-500' : 'bg-white text-primary-dark'}
                    `}>
                      {idx + 1}
                    </div>
                  </div>

                  {/* Module Info Card (Visible on hover or if current) */}
                  <div className={`
                    max-w-xs text-center md:text-left space-y-2 p-6 rounded-[32px] border transition-all duration-500
                    ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}
                    ${isCurrent ? 'bg-white shadow-2xl shadow-primary/10 border-primary-teal/30 scale-105' : 'bg-white/40 border-white/40'}
                  `}>
                    <h3 className="text-xl font-nunito font-black text-primary-dark">
                      {module.title}
                    </h3>
                    <p className="text-sm font-nunito font-semibold text-primary-dark/50 line-clamp-2">
                      {module.description}
                    </p>
                    {isCompleted && (
                      <div className="inline-flex items-center gap-1 text-primary font-nunito font-black text-xs uppercase tracking-wider">
                        <CheckCircle className="w-4 h-4" /> Selesai
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Final Finish Line */}
          <div className="flex flex-col items-center gap-6 mt-32">
            <div className="w-32 h-32 rounded-[45px] bg-linear-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-nunito font-black text-primary-dark">Puncak Pahlawan Bumi</h4>
              <p className="text-primary-dark/40 font-nunito font-bold">Selesaikan semua misi untuk tamat!</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 2. Baca Materi
  if (viewMode === 'read') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <Head><title>{selectedModule.title} | Smart EcoKids</title></Head>
        
        <Button variant="ghost" onClick={() => setViewMode('list')} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar
        </Button>

        <Card className="p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-4">
            <Badge color="organic">MODUL {educationData.indexOf(selectedModule) + 1}</Badge>
            <h2 className="text-4xl font-nunito font-black text-primary-dark">{selectedModule.title}</h2>
          </div>

          <div className="prose prose-lg max-w-none font-nunito font-semibold text-primary-dark/70 leading-relaxed 
            prose-headings:text-primary-dark prose-headings:font-black prose-h3:text-2xl prose-h3:mt-8
            prose-p:mb-4 prose-li:mb-2 prose-strong:text-primary">
            <div dangerouslySetInnerHTML={{ __html: selectedModule.content.replace(/\n/g, '<br/>').replace(/### (.*)/g, '<h3 class="text-2xl font-black text-primary-dark mt-8 mb-4">$1</h3>').replace(/\*\* (.*?) \*\*/g, '<strong>$1</strong>') }} />
          </div>

          <div className="pt-8 border-t border-gray-100 text-center">
            <div className="mb-6 flex flex-col items-center">
              <EcoMascot size={100} className="mb-4" />
              <p className="font-nunito font-black text-primary-dark">Sudah paham materinya? Yuk, uji pengetahuanmu!</p>
            </div>
            <Button variant="primary" onClick={startQuiz} className="px-12 py-5 text-xl shadow-2xl shadow-primary/30 group">
              Mulai Kuis Misi <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Tampilan Kuis
  if (viewMode === 'quiz') {
    const currentQuestion = selectedModule.questions[currentIdx];
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Head><title>Kuis: {selectedModule.title}</title></Head>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-nunito font-black text-primary uppercase tracking-widest">SOAL {currentIdx + 1}/10</span>
            <h3 className="text-lg font-nunito font-black text-primary-dark truncate max-w-[200px]">{selectedModule.title}</h3>
          </div>
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50">
            <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
            <span className={`font-nunito font-black text-lg ${timeLeft <= 5 ? 'text-rose-500' : 'text-primary-dark'}`}>{timeLeft}s</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden border border-white/50 shadow-inner">
          <div 
            className="h-full bg-linear-to-r from-primary-teal to-primary transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
          />
        </div>

        <Card className="p-8 space-y-8">
          <h2 className="text-2xl font-nunito font-black text-primary-dark leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedIdx === idx;
              const isCorrect = idx === currentQuestion.correctIndex;
              
              let style = "bg-white/50 border-white/50 hover:bg-white hover:shadow-md text-primary-dark";
              if (isAnswered) {
                if (isCorrect) style = "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm";
                else if (isSelected) style = "bg-rose-50 border-rose-300 text-rose-700";
                else style = "bg-gray-50/50 border-gray-100 text-gray-400 opacity-60";
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-5 rounded-3xl border text-left font-nunito font-extrabold text-lg transition-all duration-300 flex justify-between items-center group
                    ${style} ${!isAnswered && 'active:scale-95'}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="space-y-6 animate-fade-in pt-4">
              <div className="p-5 bg-primary-teal/5 rounded-3xl border border-primary-teal/20 space-y-2">
                <p className="text-xs font-nunito font-black text-primary uppercase tracking-wider">Tahukah Kamu?</p>
                <p className="font-nunito font-semibold text-primary-dark/80 leading-relaxed">{currentQuestion.explanation}</p>
              </div>
              <Button onClick={nextStep} variant="primary" className="w-full py-5 text-xl group">
                {currentIdx === 9 ? 'Lihat Hasil Akhir' : 'Lanjut Soal Berikutnya'} 
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // 4. Hasil Kuis
  if (viewMode === 'result') {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const isSuccess = correctCount >= 7;

    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-fade-in">
        <Head><title>Hasil Misi: {selectedModule.title}</title></Head>
        
        <Card className="p-12 space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-linear-to-tr from-primary-teal to-primary-lime blur-3xl opacity-20 -z-10 animate-pulse" />
            {isSuccess ? <Award className="w-32 h-32 text-primary mx-auto" /> : <EcoMascot size={130} />}
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-nunito font-black text-primary-dark">
              {isSuccess ? 'Misi Selesai!' : 'Coba Lagi, Pahlawan!'}
            </h2>
            <p className="text-lg font-nunito font-semibold text-primary-dark/50">
              Kamu berhasil menyelesaikan modul <strong>{selectedModule.title}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/50 rounded-3xl border border-white/50 shadow-sm">
              <p className="text-xs font-nunito font-black text-primary uppercase tracking-widest mb-1">SKOR AKHIR</p>
              <p className="text-4xl font-nunito font-black text-primary-dark">{score}</p>
            </div>
            <div className="p-6 bg-white/50 rounded-3xl border border-white/50 shadow-sm">
              <p className="text-xs font-nunito font-black text-primary uppercase tracking-widest mb-1">BENAR</p>
              <p className="text-4xl font-nunito font-black text-primary-dark">{correctCount}/10</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button variant="primary" onClick={() => setViewMode('list')} className="w-full py-5 text-xl shadow-xl">
              Kembali ke Daftar Misi
            </Button>
            <Button variant="secondary" onClick={() => handleSelectModule(selectedModule)} className="w-full py-5 text-xl bg-transparent border-none">
              Baca Ulang Materi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
}

export default withAuth(EducationQuizPage, { requiredRole: "siswa" });
