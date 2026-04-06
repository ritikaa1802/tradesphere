"use client";

import { PlayCircle } from "lucide-react";
import { useMemo } from "react";

type CardItem = {
  id: number;
  title: string;
  language: string;
  subtitle: string;
  videoTitle: string;
  videoUrl: string;
  accent: string;
  glow: string;
  bg: string;
};

const cardData: CardItem[] = [
  {
    id: 1,
    title: "Mind over Markets",
    language: "English",
    subtitle: "Behavioral edge for disciplined execution",
    videoTitle: "Paper Trading Basics For Beginners",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+for+beginners+stock+market+english",
    accent: "#b7f58e",
    glow: "rgba(183,245,142,0.35)",
    bg: "linear-gradient(150deg, #202812 0%, #11150f 55%, #121212 100%)",
  },
  {
    id: 2,
    title: "Market ki Baat",
    language: "Hindi",
    subtitle: "Daily market psychology decoded",
    videoTitle: "Paper Trading Sikhne Ka Full Guide",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+for+beginners+hindi+stock+market",
    accent: "#34f5c5",
    glow: "rgba(52,245,197,0.35)",
    bg: "linear-gradient(150deg, #03120f 0%, #07090f 60%, #11151f 100%)",
  },
  {
    id: 3,
    title: "நேர்மையான டிரேடிங்",
    language: "Tamil",
    subtitle: "Calm setups and risk-first entries",
    videoTitle: "Paper Trading Tutorial In Tamil",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+tamil+stock+market+tutorial",
    accent: "#f4a4dc",
    glow: "rgba(244,164,220,0.35)",
    bg: "linear-gradient(145deg, #190d19 0%, #0f1021 62%, #111325 100%)",
  },
  {
    id: 4,
    title: "मार्केट शिस्त",
    language: "Marathi",
    subtitle: "Consistency patterns that actually scale",
    videoTitle: "Paper Trading In Marathi",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+marathi+stock+market",
    accent: "#bbf58f",
    glow: "rgba(187,245,143,0.35)",
    bg: "linear-gradient(145deg, #131f11 0%, #09111a 62%, #10131c 100%)",
  },
  {
    id: 5,
    title: "भावना से बढ़कर नियम",
    language: "Hindi",
    subtitle: "Turn impulse into process",
    videoTitle: "Risk Management + Paper Trading",
    videoUrl: "https://www.youtube.com/results?search_query=risk+management+paper+trading+hindi",
    accent: "#d5d5d5",
    glow: "rgba(213,213,213,0.3)",
    bg: "linear-gradient(145deg, #171717 0%, #0e1118 62%, #10131b 100%)",
  },
  {
    id: 6,
    title: "తెలుగు ట్రేడింగ్",
    language: "Telugu",
    subtitle: "Precision entries, disciplined exits",
    videoTitle: "Paper Trading Tutorial In Telugu",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+telugu+stock+market+tutorial",
    accent: "#d9b4ff",
    glow: "rgba(217,180,255,0.35)",
    bg: "linear-gradient(145deg, #1a1220 0%, #121122 62%, #121420 100%)",
  },
  {
    id: 7,
    title: "বাংলা মার্কেট ফ্রেম",
    language: "Bengali",
    subtitle: "Price action with emotional clarity",
    videoTitle: "Paper Trading Guide In Bengali",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+bengali+stock+market",
    accent: "#93e7ff",
    glow: "rgba(147,231,255,0.35)",
    bg: "linear-gradient(145deg, #0f1a23 0%, #0d121d 62%, #10131d 100%)",
  },
  {
    id: 8,
    title: "ગુજરાતી ટ્રેડ શિસ્ત",
    language: "Gujarati",
    subtitle: "Systematic discipline for retail traders",
    videoTitle: "Paper Trading In Gujarati",
    videoUrl: "https://www.youtube.com/results?search_query=paper+trading+gujarati+stock+market",
    accent: "#ffc59a",
    glow: "rgba(255,197,154,0.35)",
    bg: "linear-gradient(145deg, #20150d 0%, #11121a 62%, #14151c 100%)",
  },
];

export default function LanguageVideoCards() {
  const items = useMemo(() => [...cardData, ...cardData], []);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 0%, rgba(37,99,235,0.16), rgba(5,9,18,0) 70%), linear-gradient(180deg, rgba(5,9,18,0.86), rgba(5,9,18,0.98))",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-5xl">
            Finance simplified, in your language
          </h2>
          <a
            href="https://www.youtube.com/results?search_query=learn+stock+market+paper+trading+for+beginners"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-lg font-semibold text-slate-100 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-red-400/60 hover:bg-red-500/10"
            style={{ boxShadow: "0 0 20px rgba(239,68,68,0.16)" }}
          >
            <PlayCircle size={21} className="text-red-500" />
            Watch
          </a>
        </div>

        <div className="relative [perspective:1600px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050912] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050912] to-transparent" />

          <div className="video-track flex w-max items-center gap-6 py-4 will-change-transform hover:[animation-play-state:paused]">
            {items.map((card, index) => (
              <article
                key={`${card.id}-${index}`}
                className="group relative h-[420px] w-[270px] shrink-0 overflow-hidden rounded-[28px] border border-white/10 p-5"
                style={{
                  background: card.bg,
                  boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 0 24px ${card.glow}`,
                  transform: `rotateY(${index % 2 === 0 ? -7 : 7}deg) translateZ(${8 + (index % 4) * 3}px)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 35% 18%, ${card.glow}, rgba(0,0,0,0) 55%)`,
                  }}
                />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <p className="mb-2 text-sm font-medium uppercase tracking-[0.22em] text-slate-400">
                      {card.language}
                    </p>
                    <h3 className="text-[2.1rem] font-bold leading-[1.02]" style={{ color: card.accent }}>
                      {card.title}
                    </h3>
                    <p className="mt-4 max-w-[18ch] text-sm leading-relaxed text-slate-300/85">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/15 bg-black/30 px-4 py-5 backdrop-blur-xl">
                    <div
                      className="absolute -bottom-7 right-0 h-24 w-24 rounded-full blur-2xl"
                      style={{ background: card.glow }}
                    />
                    <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      TradeSphere Originals
                    </p>
                    <p className="relative mt-2 text-sm font-medium text-slate-100">{card.videoTitle}</p>
                    <a
                      href={card.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition-all duration-300 hover:scale-105 hover:border-red-300 hover:bg-red-500/20"
                    >
                      <PlayCircle size={14} className="text-red-400" />
                      Watch Lesson
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .video-track {
          animation: marquee3d 42s linear infinite;
        }

        @keyframes marquee3d {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 1024px) {
          .video-track {
            animation-duration: 32s;
          }
        }
      `}</style>
    </section>
  );
}
