'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Clock, Tag } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d;
  });

  useEffect(() => {
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const fmt = (n) => String(n).padStart(2, '0');
  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full bg-secondary py-14">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Tag className="h-6 w-6 text-white" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Special Offer Zone</h2>
        </div>
        <p className="text-white/90 mb-8 text-lg">Get up to 50% off on selected items. Limited time offer!</p>

        <div className="flex justify-center items-end gap-3 sm:gap-4 mb-8">
          {units.map((unit, i) => (
            <div key={unit.label} className="flex items-end gap-3 sm:gap-4">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg border border-white/30">
                  {fmt(unit.value)}
                </div>
                <p className="text-white/80 text-xs sm:text-sm mt-2 font-medium">{unit.label}</p>
              </div>
              {i < units.length - 1 && (
                <span className="text-2xl sm:text-3xl font-bold text-white/70 pb-6">:</span>
              )}
            </div>
          ))}
        </div>

        {isExpired && (
          <div className="mb-6 p-4 bg-white/10 border border-white/20 rounded-lg inline-flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Offer has expired!</span>
          </div>
        )}

        <a href="/offers" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105">
          <span>View All Offers</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
