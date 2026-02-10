import React, { useState, useEffect, useMemo } from 'react';
import { Check, Clock, Bell, BellOff, Sun, Moon, Coffee, BookOpen } from 'lucide-react';

const App = () => {
  const [now, setNow] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('serenity_tasks_v3');
    const today = new Date().toDateString();
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed.date === today ? parsed.tasks : [];
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- Exact Timetable Data ---
  const routines = {
    college: [
      { time: '06:00', label: 'Wake up', category: 'Morning' },
      { time: '06:10', label: 'Jog / exercise', category: 'Morning' },
      { time: '06:40', label: 'Fresh up', category: 'Morning' },
      { time: '07:10', label: 'Study / revise', category: 'Focus' },
      { time: '08:00', label: 'Breakfast (PG mess)', category: 'Fuel' },
      { time: '08:30', label: 'College (with commute)', category: 'College' },
      { time: '15:00', label: 'Snack + relax (short nap)', category: 'Rest' },
      { time: '15:30', label: 'Study / assignments', category: 'Focus' },
      { time: '17:30', label: 'Gym / walk / sports', category: 'Physical' },
      { time: '18:30', label: 'Skill building', category: 'Growth' },
      { time: '19:30', label: 'Free phone/reels', category: 'Chill' },
      { time: '20:00', label: 'Dinner (PG mess)', category: 'Fuel' },
      { time: '20:30', label: 'Deep work / revision', category: 'Focus' },
      { time: '21:30', label: 'Chill (phone, music)', category: 'Chill' },
      { time: '22:00', label: 'Wind down', category: 'Night' },
      { time: '22:30', label: 'Sleep', category: 'Night' },
    ],
    off: [
      { time: '06:00', label: 'Wake up', category: 'Morning' },
      { time: '06:10', label: 'Jog / exercise (longer)', category: 'Morning' },
      { time: '07:00', label: 'Focus study', category: 'Focus' },
      { time: '08:00', label: 'Breakfast (PG mess)', category: 'Fuel' },
      { time: '08:30', label: 'Deep work block', category: 'Focus' },
      { time: '11:30', label: 'Chill break', category: 'Chill' },
      { time: '12:00', label: 'Productive hobby', category: 'Growth' },
      { time: '13:30', label: 'Lunch', category: 'Fuel' },
      { time: '14:00', label: 'Nap or light reading', category: 'Rest' },
      { time: '15:00', label: 'Study / revision', category: 'Focus' },
      { time: '17:30', label: 'Sports / gym / walk', category: 'Physical' },
      { time: '18:30', label: 'Side project / skill', category: 'Growth' },
      { time: '19:30', label: 'Chill / reels', category: 'Chill' },
      { time: '20:00', label: 'Dinner', category: 'Fuel' },
      { time: '20:30', label: 'Review week', category: 'Night' },
      { time: '22:00', label: 'Wind down', category: 'Night' },
      { time: '22:30', label: 'Sleep', category: 'Night' },
    ]
  };

  const currentDayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const isOffDay = currentDayName === 'Sunday' || currentDayName === 'Monday';
  const schedule = isOffDay ? routines.off : routines.college;

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      if (d.getSeconds() === 0) {
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const match = schedule.find(t => t.time === timeStr);
        if (match && soundEnabled) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + 1.5);
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [schedule, soundEnabled]);

  useEffect(() => {
    localStorage.setItem('serenity_tasks_v3', JSON.stringify({
      date: new Date().toDateString(),
      tasks: completedTasks
    }));
  }, [completedTasks]);

  const activeIndex = useMemo(() => {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    let idx = -1;
    schedule.forEach((t, i) => {
      const [h, m] = t.time.split(':').map(Number);
      if (nowMins >= (h * 60 + m)) idx = i;
    });
    return idx;
  }, [now, schedule]);

  const toggleTask = (time) => {
    setCompletedTasks(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#4A453E] font-serif p-4 pb-24 selection:bg-[#E5DFD3]">
      {/* Soft Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#E8E1D5] blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-[#DFE5D5] blur-[100px] rounded-full opacity-40" />
      </div>

      <div className="relative max-w-lg mx-auto">
        {/* Header: Clean & Elegant */}
        <header className="pt-12 pb-10 px-4 flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-xs font-sans font-bold tracking-[0.3em] uppercase text-[#9E9585]">
              {currentDayName} • {isOffDay ? 'Rest' : 'Active'}
            </h2>
            <h1 className="text-5xl font-light text-[#2D2A26] tracking-tight leading-none mb-1">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h1>
            <p className="text-sm italic text-[#9E9585]">
              {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-12 h-12 rounded-full border border-[#E5DFD3] flex items-center justify-center text-[#9E9585] hover:bg-white hover:shadow-sm transition-all"
          >
            {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </header>

        {/* The "Journal" Page */}
        <div className="bg-white/70 backdrop-blur-sm rounded-[2.5rem] p-6 shadow-xl shadow-[#2D2A26]/5 border border-white/50">
          <div className="space-y-2">
            {schedule.map((item, index) => {
              const isCompleted = completedTasks.includes(item.time);
              const isActive = activeIndex === index;

              return (
                <div 
                  key={item.time}
                  onClick={() => toggleTask(item.time)}
                  className={`group relative flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 cursor-pointer ${
                    isActive ? 'bg-[#FDFCFB] shadow-md ring-1 ring-[#E5DFD3]' : 'hover:bg-[#FDFCFB]/50'
                  }`}
                >
                  {/* Visual Timeline Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#8C9B82] rounded-r-full" />
                  )}

                  {/* Checkbox Icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-[#8C9B82] border-[#8C9B82] text-white' 
                      : isActive 
                        ? 'border-[#8C9B82] text-[#8C9B82]' 
                        : 'border-[#E5DFD3] text-transparent'
                  }`}>
                    <Check size={16} strokeWidth={4} />
                  </div>

                  {/* Task Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`text-base font-sans font-medium transition-all ${
                        isCompleted ? 'text-[#9E9585] line-through' : 'text-[#4A453E]'
                      }`}>
                        {item.label}
                      </h3>
                      <span className={`text-[10px] font-sans font-bold tracking-tighter ${
                        isActive ? 'text-[#8C9B82]' : 'text-[#9E9585]'
                      }`}>
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[10px] font-sans uppercase tracking-widest text-[#B5AE9F] mt-0.5">
                      {item.category}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Progress Floating Pill */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xs px-4">
          <div className="bg-[#2D2A26] text-white rounded-full py-4 px-8 shadow-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-sans font-bold tracking-[0.2em] text-[#9E9585] uppercase">Execution</span>
              <span className="text-sm font-sans">{Math.round((completedTasks.length / schedule.length) * 100)}% Complete</span>
            </div>
            <div className="w-12 h-12 relative flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#3D3933" strokeWidth="4" />
                <circle 
                  cx="24" cy="24" r="20" fill="none" stroke="#8C9B82" strokeWidth="4" 
                  strokeDasharray={125.6} 
                  strokeDashoffset={125.6 - (125.6 * (completedTasks.length / schedule.length))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={14} className="text-[#8C9B82]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:italic&family=Inter:wght@400;500;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        h1 { font-family: 'Instrument Serif', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
};

export default App;


