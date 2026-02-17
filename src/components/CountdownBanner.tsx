"use client";

import React, { useEffect, useMemo, useState } from "react";

type ISODateString = string;

type CountdownBannerProps = {
  startDateISO: ISODateString;
  endDateISO: ISODateString;

  /** Logo зураг (e.g. "/vnl-logo.png" эсвэл Cloudinary URL) */
  logoSrc?: string;
  logoAlt?: string;

  /** Тэмцээний нэр */
  title?: string; // default: "VNL 2026"

  /** Байршлын жижиг текст */
  locationText?: string; // default: "Олон байршил"

  /** Хугацаа өнгөрсөн үед ямар текст харуулах */
  liveText?: string; // default: "ТЭМЦЭЭН ЭХЭЛСЭН"
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
};

const pad2 = (n: number): string => String(n).padStart(2, "0");

const calcTimeLeft = (targetMs: number, nowMs: number): TimeLeft => {
  const diff = targetMs - nowMs;
  const isStarted = diff <= 0;

  const safe = diff < 0 ? 0 : diff;

  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);

  return { days, hours, minutes, seconds, isStarted };
};

const formatRangeMN = (
  startISO: ISODateString,
  endISO: ISODateString,
): string => {
  const s = new Date(startISO);
  const e = new Date(endISO);

  const sm = s.getMonth() + 1;
  const sd = s.getDate();
  return `${sm} сарын ${sd}-нд эхэлнэ`;
};

function Mini({ value }: { value: string }) {
  return (
    <div className="px-2 py-1 rounded-md bg-white/10 border border-white/10 text-white text-xs font-bold tabular-nums">
      {value}
    </div>
  );
}

function Colon() {
  return <span className="text-white/40 text-xs">:</span>;
}

export default function CountdownBanner({
  startDateISO,
  endDateISO,
  logoSrc = "/vnlLOGO.svg",
  logoAlt = "VNL",
  title = "VNL 2026",
  liveText = "ТЭМЦЭЭН ЭХЭЛСЭН",
}: CountdownBannerProps) {
  const startMs = useMemo(
    () => new Date(startDateISO).getTime(),
    [startDateISO],
  );

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(startMs, Date.now()),
  );

  useEffect(() => {
    const tick = () => setTimeLeft(calcTimeLeft(startMs, Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startMs]);

  const rangeText = useMemo(
    () => formatRangeMN(startDateISO, endDateISO),
    [startDateISO, endDateISO],
  );

  return (
    <div className="w-full rounded-xl border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 px-4 py-2.5 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={logoSrc} alt={logoAlt} className="w-6 h-6 object-contain" />

        <div className="min-w-0 leading-tight">
          <div className="text-white text-sm font-semibold whitespace-normal line-clamp-2">
            Үндэстнүүдийн лиг эхлэхэд
            <span className="text-lime-400 font-extrabold ml-1">
              {timeLeft.days}
            </span>{" "}
            хоног
          </div>

          <div className="text-[11px] text-white/50">{rangeText}</div>
        </div>
      </div>

      {/* RIGHT countdown */}
      {!timeLeft.isStarted && (
        <div className="flex flex-col items-end gap-0.5 font-mono shrink-0">
          {/* numbers */}
          <div className="flex items-center gap-1.5">
            <Mini value={pad2(timeLeft.hours)} />
            <Colon />
            <Mini value={pad2(timeLeft.minutes)} />
            <Colon />
            <Mini value={pad2(timeLeft.seconds)} />
          </div>

          {/* labels */}
          <div className="flex items-center gap-[30px] pr-[2px] text-[10px] text-white/50 font-semibold">
            <span>цаг</span>
            <span>мин</span>
            <span>сек</span>
          </div>
        </div>
      )}
    </div>
  );
}
