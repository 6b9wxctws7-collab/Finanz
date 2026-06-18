"use client";

import { useEffect, useRef, useState } from "react";
import { Gamepad2, RotateCcw, Trophy } from "lucide-react";
import { Button, Card } from "./ui/primitives";

// Spielfeld-Maße (in px). Höhe fix, Breite wird gemessen.
const H = 420;
const BASKET_W = 64;
const ITEM = 34;
const GROUND = H - 64; // obere Kante der Wallet

const MONEY = ["💶", "💵", "🪙"];
const BEARS = ["📉", "🐻"];
const HIGHSCORE_KEY = "etfmaxxing.game.highscore.v1";

type Status = "idle" | "playing" | "over";
type Item = {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: "money" | "bear";
  emoji: string;
};

interface GameState {
  score: number;
  lives: number;
  items: Item[];
  basketX: number;
  width: number;
  lastSpawn: number;
  lastTime: number;
  nextId: number;
  raf: number;
  flash: number; // Zeitstempel des letzten Treffers (für rotes Aufblitzen)
}

export function EtfGame() {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const g = useRef<GameState>({
    score: 0,
    lives: 3,
    items: [],
    basketX: 0,
    width: 0,
    lastSpawn: 0,
    lastTime: 0,
    nextId: 1,
    raf: 0,
    flash: 0,
  });

  const [status, setStatus] = useState<Status>("idle");
  const [, setTick] = useState(0);
  const [highscore, setHighscore] = useState(0);

  // Highscore laden + Spielfeldbreite messen.
  useEffect(() => {
    try {
      setHighscore(Number(localStorage.getItem(HIGHSCORE_KEY)) || 0);
    } catch {
      /* ignore */
    }
    const measure = () => {
      if (areaRef.current) g.current.width = areaRef.current.clientWidth;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Tastatursteuerung während des Spiels.
  useEffect(() => {
    if (status !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      const st = g.current;
      const w = st.width || 320;
      if (e.key === "ArrowLeft") st.basketX = Math.max(0, st.basketX - 32);
      if (e.key === "ArrowRight") st.basketX = Math.min(w - BASKET_W, st.basketX + 32);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status]);

  function spawn(now: number) {
    const st = g.current;
    const isBear = Math.random() < 0.26;
    const emoji = isBear
      ? BEARS[Math.floor(Math.random() * BEARS.length)]
      : MONEY[Math.floor(Math.random() * MONEY.length)];
    const x = Math.random() * Math.max(1, st.width - ITEM);
    const vy = (150 + st.score * 1.1) * (0.85 + Math.random() * 0.4);
    st.items.push({ id: st.nextId++, x, y: -ITEM, vy, type: isBear ? "bear" : "money", emoji });
  }

  function loop(now: number) {
    const st = g.current;
    const dt = Math.min(50, now - st.lastTime) / 1000;
    st.lastTime = now;

    // Spawnen – Frequenz steigt mit dem Score.
    const spawnEvery = Math.max(360, 950 - st.score * 3.5);
    if (now - st.lastSpawn > spawnEvery) {
      st.lastSpawn = now;
      spawn(now);
    }

    // Bewegen + Kollisionen / Aufräumen.
    const bx = st.basketX;
    st.items = st.items.filter((it) => {
      it.y += it.vy * dt;
      const inCatchZone = it.y + ITEM >= GROUND && it.y < GROUND + 36;
      if (inCatchZone && it.x + ITEM > bx && it.x < bx + BASKET_W) {
        if (it.type === "money") {
          st.score += 10;
        } else {
          st.lives -= 1;
          st.flash = now;
        }
        return false;
      }
      return it.y <= H + 20;
    });

    if (st.lives <= 0) {
      endGame();
      return;
    }
    setTick((t) => t + 1);
    st.raf = requestAnimationFrame(loop);
  }

  function start() {
    const st = g.current;
    st.score = 0;
    st.lives = 3;
    st.items = [];
    st.width = areaRef.current?.clientWidth ?? 320;
    st.basketX = st.width / 2 - BASKET_W / 2;
    st.lastTime = performance.now();
    st.lastSpawn = performance.now();
    st.nextId = 1;
    st.flash = 0;
    setStatus("playing");
    cancelAnimationFrame(st.raf);
    st.raf = requestAnimationFrame(loop);
  }

  function endGame() {
    const st = g.current;
    cancelAnimationFrame(st.raf);
    setStatus("over");
    if (st.score > highscore) {
      setHighscore(st.score);
      try {
        localStorage.setItem(HIGHSCORE_KEY, String(st.score));
      } catch {
        /* ignore */
      }
    }
  }

  // Aufräumen beim Verlassen.
  useEffect(() => () => cancelAnimationFrame(g.current.raf), []);

  function onPointerMove(e: React.PointerEvent) {
    if (status !== "playing") return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - BASKET_W / 2;
    g.current.basketX = Math.max(0, Math.min(rect.width - BASKET_W, x));
  }

  const st = g.current;
  const recentlyHit = status === "playing" && performance.now() - st.flash < 220;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-ink-900">
          <Gamepad2 className="h-6 w-6 text-fuchsia-600" /> ETF Catcher
        </h2>
        <p className="text-sm text-ink-500">
          Fang das Geld 💶, weiche dem Bärenmarkt 🐻 aus. Diamond Hands halten! 💎
        </p>
      </div>

      <Card className="mx-auto max-w-xl overflow-hidden">
        {/* HUD */}
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-2.5 text-sm">
          <span className="font-semibold text-ink-900">
            Depotwert: <span className="tabular-nums text-emerald-600">{st.score} €</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <Trophy className="h-3.5 w-3.5 text-amber-500" /> Best: {highscore} €
          </span>
          <span className="tabular-nums" aria-label="Leben">
            {"💎".repeat(Math.max(0, st.lives))}
            {"🩶".repeat(Math.max(0, 3 - st.lives))}
          </span>
        </div>

        {/* Spielfeld */}
        <div
          ref={areaRef}
          onPointerMove={onPointerMove}
          className={
            "relative touch-none select-none overflow-hidden bg-gradient-to-b from-brand-50 to-emerald-50 transition-colors " +
            (recentlyHit ? "bg-red-100" : "")
          }
          style={{ height: H }}
        >
          {/* fallende Items */}
          {status === "playing" &&
            st.items.map((it) => (
              <span
                key={it.id}
                className="absolute"
                style={{ left: it.x, top: it.y, fontSize: ITEM, lineHeight: 1 }}
              >
                {it.emoji}
              </span>
            ))}

          {/* Wallet / Korb */}
          {status === "playing" && (
            <span
              className="absolute"
              style={{ left: st.basketX, top: GROUND, fontSize: BASKET_W * 0.8, lineHeight: 1 }}
            >
              🧺
            </span>
          )}

          {/* Start- / Game-Over-Overlay */}
          {status !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 px-6 text-center backdrop-blur-sm">
              {status === "over" ? (
                <>
                  <div className="animate-pop-in text-4xl">{st.score >= highscore && st.score > 0 ? "🏆" : "📉"}</div>
                  <h3 className="text-xl font-bold text-ink-900">
                    {st.score >= highscore && st.score > 0 ? "Neuer Highscore! Boomer-Status." : "Paper Hands!"}
                  </h3>
                  <p className="text-sm text-ink-600">
                    Dein Depotwert: <strong className="text-emerald-600">{st.score} €</strong>
                  </p>
                  <Button variant="primary" onClick={start} className="mt-1">
                    <RotateCcw className="h-4 w-4" /> Nochmal zocken
                  </Button>
                </>
              ) : (
                <>
                  <div className="animate-float text-4xl">🤑</div>
                  <h3 className="text-xl font-bold text-ink-900">Bereit zum Maxxen?</h3>
                  <p className="max-w-xs text-sm text-ink-600">
                    Bewege den Korb mit <strong>Maus/Finger</strong> oder den{" "}
                    <strong>Pfeiltasten</strong>. Geld = grün, Bär = aua.
                  </p>
                  <Button variant="primary" onClick={start} className="mt-1">
                    <Gamepad2 className="h-4 w-4" /> Start
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      <p className="text-center text-[11px] text-ink-400">
        Nur zum Spaß – hat null mit echten Renditen zu tun. (Aber Diamond Hands schaden nie.)
      </p>
    </div>
  );
}
