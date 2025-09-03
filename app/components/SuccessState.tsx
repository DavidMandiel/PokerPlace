"use client";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface SuccessStateProps {
  message: string;
  onComplete: () => void;
  duration?: number;
}

export default function SuccessState({ message, onComplete, duration = 3000 }: SuccessStateProps) {
  const [countdown, setCountdown] = useState(duration / 1000);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-emerald-mint/20 text-center max-w-sm mx-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-glow mb-2">Success!</h2>
        <p className="text-emerald-mintSoft mb-4">{message}</p>
        
        <div className="text-sm text-emerald-mintSoft">
          Redirecting in {countdown} seconds...
        </div>
      </div>
    </div>
  );
}










