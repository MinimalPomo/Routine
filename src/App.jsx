import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Check, Bell } from 'lucide-react';

const App = () => {
  const [now, setNow] = useState(new Date());
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem('serenity_tasks_v3');
    const today = new Date().toDateString();
    const parsed = saved ? JSON.parse(saved) : {};
    return parsed.date === today ? parsed.tasks : [];
  });
  const [permissionStatus, setPermissionStatus] = useState('default');
  const lastNotifiedTime = useRef(null);

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

  const triggerAlarm = (task) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 1.5);
    } catch (e) {}

    if (Notification.permission === 'granted') {
      new Notification(`Routine: ${task.label}`, { 
        body: `It's ${task.time}. Time for your ${task.category} session.`,
        silent: false 
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNow(d);
      const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      if (lastNotifiedTime.current !== timeStr) {
        const match = schedule.find(t => t.time === timeStr);
        if (match) { 
          triggerAlarm(match); 
          lastNotifiedTime.current = timeStr; 
        }
      }
    }, 1000);
    if ("Notification" in window) setPermissionStatus(Notification.permission);
    return () => clearInterval(timer);
  }, [schedule]);

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

  const completionPct = (completedTasks.length / schedule.length) || 0;

  const toggleTask = (time) => {
    setCompletedTasks(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#4A453E] font-sans p-4 pb-12 selection:bg-[#E5DFD3]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#E8E1D5] blur-[120px] rounded-full opacity-60" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] bg-[#DFE5D5] blur-[100px] rounded-full opacity-40" />
      </div>

      <div className="relative max-w-lg mx-auto">
        <header className="pt-12 pb-10 px-2 flex justify-between items-end">
          <div className="flex flex-col">
            <h2 className="text-[12px] font-bold tracking-[0.4em] uppercase text-[#9E9585] mb-2 pl-0.5">
              {currentDayName}
            </h2>
            <h1 className="text-6xl font-light text-[#2D2A26] tracking-tighter leading-[0.85] clock-font">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h1>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <div className="flex items-center gap-4 bg-white/50 border border-white/80 py-3 px-5 rounded-[2.2rem] backdrop-blur-md shadow-sm">
              <div className="text-right">
                <span className="block text-[10px] font-bold tracking-widest text-[#9E9585] uppercase leading-none mb-1.5">Progress</span>
                <span className="text-base font-bold text-[#2D2A26] tabular-nums leading-none">
                  {completedTasks.length}/{schedule.length}
                </span>
              </div>
              <div className="w-12 h-12 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 scale-110">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E5DFD3" strokeWidth="2.5" />
                  <circle 
                    cx="24" cy="24" r="20" fill="none" stroke="#8C9B82" strokeWidth="2.5" 
                    strokeDasharray={125.6} 
                    strokeDashoffset={125.6 - (125.6 * completionPct)}
                    className="transition-all duration-1000 ease-in-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={14} className="text-[#8C9B82]" />
                </div>
              </div>
            </div>

            {permissionStatus !== 'granted' && (
              <button 
                onClick={() => Notification.requestPermission().then(setPermissionStatus)}
                className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-amber-700 bg-amber-50/80 px-4 py-2 rounded-full border border-amber-100/50 hover:bg-amber-100 transition-all active:scale-95"
              >
                <Bell size={10} /> Sync Alarms
              </button>
            )}
          </div>
        </header>

        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 shadow-2xl shadow-[#2D2A26]/5 border border-white/80">
          <div className="space-y-2">
            {schedule.map((item, index) => {
              const isCompleted = completedTasks.includes(item.time);
              const isActive = activeIndex === index;

              return (
                <div 
                  key={item.time}
                  onClick={() => toggleTask(item.time)}
                  className={`group relative flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-300 cursor-pointer ${
                    isActive ? 'bg-white shadow-md ring-1 ring-[#E5DFD3]/50 scale-[1.01]' : 'hover:bg-white/40'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#8C9B82] rounded-r-full" />
                  )}

                  <div className={`flex-shrink-0 w-9 h-9 rounded-2xl border-[1.5px] flex items-center justify-center transition-all duration-500 ${
                    isCompleted 
                      ? 'bg-[#8C9B82] border-[#8C9B82] text-white' 
                      : isActive 
                        ? 'border-[#8C9B82] text-[#8C9B82] bg-[#8C9B82]/5' 
                        : 'border-[#E5DFD3] text-transparent'
                  }`}>
                    <Check size={18} strokeWidth={3} className={isCompleted ? 'scale-100' : 'scale-0'} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className={`text-[15px] font-semibold tracking-tight transition-all duration-500 ${
                        isCompleted ? 'text-[#9E9585] line-through' : 'text-[#4A453E]'
                      }`}>
                        {item.label}
                      </h3>
                      <span className={`text-[10px] font-bold tracking-tight tabular-nums ${
                        isActive ? 'text-[#8C9B82]' : 'text-[#9E9585]'
                      }`}>
                        {item.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#B5AE9F]">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        .clock-font { font-family: 'Instrument Serif', serif; }
        .scale-0 { transform: scale(0); }
        .scale-100 { transform: scale(1); }
      `}} />
    </div>
  );
};

export default App;

                
