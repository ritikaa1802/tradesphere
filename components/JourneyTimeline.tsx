"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  BrainCircuit,
  LineChart,
  LogOut,
  Target,
  UserPlus,
} from "lucide-react";

const journeySteps = [
  {
    id: "start",
    number: "01",
    title: "Sign Up",
    subtitle: "Get Capitol",
    desc: "Create an account instantly and get ₹1,00,000 in virtual funds to start your journey.",
    icon: UserPlus,
    accent: "#3b82f6", // Blue
  },
  {
    id: "trade",
    number: "02",
    title: "Trade",
    subtitle: "Real Markets",
    desc: "Execute strategies using live NSE & BSE price feeds, fully simulated without risk.",
    icon: LineChart,
    accent: "#06b6d4", // Cyan
  },
  {
    id: "mistake",
    number: "03",
    title: "Mistakes",
    subtitle: "Risk Detected",
    desc: "The AI engine silently monitors executions for FOMO, panic selling, and over-leverage.",
    icon: Target,
    accent: "#ec4899", // Pink
  },
  {
    id: "insight",
    number: "04",
    title: "Insight",
    subtitle: "AI Coaching",
    desc: "Receive weekly deep-dive reports analyzing your emotional patterns vs actual performance.",
    icon: BrainCircuit,
    accent: "#8b5cf6", // Purple
  },
  {
    id: "growth",
    number: "05",
    title: "Growth",
    subtitle: "Edge Built",
    desc: "Deploy refined logic in skill-based competitions to prove consistency and build discipline.",
    icon: LogOut, // Actually, let's use a better icon for Growth. "Trophy" or "TrendingUp" which we don't have imported from Lucide here. Let's use Target or Activity. Wait, I will import Trophy.
    accent: "#10b981", // Emerald
  },
];

export default function JourneyTimeline() {
  const [activeStep, setActiveStep] = useState<string>("mistake"); // Default middle active

  return (
    <section className="bg-[#030712] py-24 sm:py-32 border-t border-[#1e293b]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-3xl font-light tracking-tight text-white sm:text-5xl">
            The Journey to <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Consistency</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto">
            A continuous loop of execution, detection, and refinement. Track your evolution from beginner to skilled trader.
          </p>
        </div>

        {/* ── Desktop Horizontal Timeline ── */}
        <div className="hidden lg:block relative w-full h-[400px]">
          {/* Main timeline connecting track */}
          <div className="absolute top-12 left-0 right-0 h-[2px] bg-[#1e293b] z-0" />
          
          <div className="flex h-full gap-4 w-full relative z-10 pt-20">
            {journeySteps.map((step, idx) => {
              const isActive = activeStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  layout
                  onMouseEnter={() => setActiveStep(step.id)}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className={`relative flex flex-col h-full rounded-2xl border transition-colors duration-500 cursor-pointer overflow-hidden ${
                    isActive ? "flex-[3] border-[#334155] bg-[#0a0f1a]" : "flex-[1] border-transparent bg-transparent hover:bg-[#0a0f1a]/50"
                  }`}
                  style={{
                    boxShadow: isActive ? `0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)` : "none"
                  }}
                >
                  {/* Timeline Node Connector (The dot on the line) */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="h-4 w-[2px] bg-[#1e293b] mb-1" />
                    <div 
                      className={`h-4 w-4 rounded-full border-2 transition-all duration-300 ${isActive ? "scale-125" : "scale-100"}`}
                      style={{ 
                        borderColor: isActive ? step.accent : "#334155",
                        backgroundColor: isActive ? "#030712" : "#030712",
                        boxShadow: isActive ? `0 0 15px ${step.accent}` : "none"
                      }}
                    />
                  </div>

                  <div className="flex flex-col h-full p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-auto">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#030712] border border-[#1e293b] transition-colors"
                        style={{ borderColor: isActive ? step.accent : "#1e293b" }}>
                        <step.icon size={20} style={{ color: isActive ? step.accent : "#64748b" }} />
                      </div>
                      
                      {/* Only show full header text when active or mid-transition, but keep layout stable */}
                      <motion.div 
                        initial={false}
                        animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -10 }}
                        className="flex flex-col whitespace-nowrap"
                      >
                        <span className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">{step.number}</span>
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                      </motion.div>
                    </div>

                    {/* Description block (bottom anchored) */}
                    <motion.div
                      initial={false}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      className="mt-8"
                    >
                      <h4 className="text-sm font-semibold text-white mb-2" style={{ color: step.accent }}>{step.subtitle}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                        {step.desc}
                      </p>
                    </motion.div>

                    {/* Gradient highlight on active */}
                    <div 
                      className={`absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-10' : ''}`}
                      style={{ background: `radial-gradient(circle at bottom right, ${step.accent}, transparent 70%)` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile Vertical Timeline ── */}
        <div className="lg:hidden relative border-l-2 border-[#1e293b] ml-4 pl-8 py-4 space-y-12">
          {journeySteps.map((step) => {
             const isActive = activeStep === step.id;

             return (
               <div 
                  key={`mob-${step.id}`}
                  onClick={() => setActiveStep(step.id)}
                  className="relative cursor-pointer group"
               >
                 {/* Timeline Node */}
                 <div 
                    className="absolute -left-[41px] top-4 h-4 w-4 rounded-full border-2 bg-[#030712] transition-colors duration-300"
                    style={{ 
                      borderColor: isActive ? step.accent : "#334155",
                      boxShadow: isActive ? `0 0 15px ${step.accent}` : "none"
                    }}
                 />

                 <div className={`rounded-2xl border transition-all duration-300 p-6 ${isActive ? 'bg-[#0a0f1a] border-[#334155]' : 'bg-transparent border-transparent'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#030712] border transition-colors"
                          style={{ borderColor: isActive ? step.accent : "#1e293b" }}>
                        <step.icon size={18} style={{ color: isActive ? step.accent : "#64748b" }} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#64748b] uppercase">{step.number}</span>
                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <h4 className="text-sm font-semibold mb-1" style={{ color: step.accent }}>{step.subtitle}</h4>
                      <p className="text-sm text-slate-400">
                        {step.desc}
                      </p>
                    </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </section>
  );
}
