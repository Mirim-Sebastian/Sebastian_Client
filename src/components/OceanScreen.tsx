import { type CSSProperties, useEffect, useRef, useState } from "react";
import type React from "react";
import { deleteFish, getFishes } from "../api/fish";
import sharkImg from "../assets/images/shark.png";
import eatSharkImg from "../assets/images/eat_shark.png";
import {
  ClickBubble,
  FishImage,
  FishLabel,
  FishSpeechBubble,
  FishWrapper,
  Ocean,
  OceanBubble,
  SharkImage,
  SharkWrapper,
} from "./OceanScreen.styles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fish {
  id: number;
  dbId: string | null;
  name: string;
  image: string;
  message: string;
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  verticalVelocity: number;
  wavePhase: number;
  waveSpeed: number;
  scale: number;
  entering: boolean;
  dragging?: boolean;
}

interface Shark {
  x: number;
  y: number;
  targetId: number | null;
  direction: 1 | -1;
  exitDir: 1 | -1;
  phase: "chase" | "exit";
  mouthOpen: boolean;
}

interface Bubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  peakOpacity: number;
}

interface ClickBubbleData {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
}

interface DragState {
  fishId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  active: boolean;
  longPressTimer: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BUBBLE_COUNT = 18;
const SHARK_SPEED = 1.2;
const SHARK_EAT_DIST = 13;
const SHARK_MOUTH_DIST = 20;
const SHARK_Y_OFFSET = -12;
const SHARK_SIZE = 480;
const MAX_FISH = 250;
const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8000";

const FISH_SIZE_MAP: Record<string, number> = {
  small: 200,
  medium: 250,
  large: 300,
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function generateBubbles(): Bubble[] {
  return Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 3 + Math.random() * 12,
    duration: 12 + Math.random() * 11,
    delay: -(Math.random() * 15),
    peakOpacity: 0.18 + Math.random() * 0.35,
  }));
}

function makeFish(
  data: {
    name: string;
    image: string;
    message: string;
    size?: string;
    _id?: string;
    id?: string;
  },
  id: number,
  isNew = false,
): Fish {
  const fromRight = Math.random() < 0.5;
  return {
    id,
    dbId: data._id ?? (typeof data.id === "string" ? data.id : null),
    name: data.name,
    image: data.image,
    message: typeof data.message === "string" ? data.message.trim() : "",
    x: isNew ? (fromRight ? 104 : -22) : 5 + Math.random() * 80,
    y: 10 + Math.random() * 70,
    speed: 0.08 + Math.random() * 0.12,
    direction: isNew ? (fromRight ? -1 : 1) : Math.random() < 0.5 ? 1 : -1,
    verticalVelocity: (Math.random() - 0.5) * 0.08,
    wavePhase: Math.random() * Math.PI * 2,
    waveSpeed: 0.05 + Math.random() * 0.08,
    scale: FISH_SIZE_MAP[data.size ?? "medium"] ?? 250,
    entering: isNew,
  };
}

function moveFish(fish: Fish, t: number): Fish {
  if (fish.dragging) return fish;

  let newDirection = fish.direction;
  let newX = fish.x + fish.speed * newDirection * t;
  let newVerticalVelocity = fish.verticalVelocity;
  let newWaveSpeed = fish.waveSpeed;
  const newWavePhase = fish.wavePhase + fish.waveSpeed * t;

  const entering = fish.entering && (newX < 2 || newX > 92);
  if (!entering) {
    if (newX > 92) {
      newX = 92;
      newDirection = -1;
    }
    if (newX < 2) {
      newX = 2;
      newDirection = 1;
    }
  }

  if (Math.random() < 0.018 * t) {
    newVerticalVelocity = (Math.random() - 0.5) * 0.12;
    newWaveSpeed = 0.035 + Math.random() * 0.1;
  }

  const waveY =
    Math.sin(newWavePhase) * 0.06 +
    Math.sin(newWavePhase * 0.43 + fish.id) * 0.04;
  let newY = fish.y + (waveY + newVerticalVelocity) * t;

  if (newY > 84) {
    newY = 84;
    newVerticalVelocity = -Math.abs(newVerticalVelocity || 0.05);
  }
  if (newY < 8) {
    newY = 8;
    newVerticalVelocity = Math.abs(newVerticalVelocity || 0.05);
  }

  return {
    ...fish,
    x: newX,
    y: newY,
    direction: newDirection,
    verticalVelocity: newVerticalVelocity,
    wavePhase: newWavePhase,
    waveSpeed: newWaveSpeed,
    entering,
  };
}

function tickShark(
  shark: Shark,
  fish: Fish[],
  t: number,
  onEat: (eaten: Fish) => void,
): { next: Shark | null; fish: Fish[] } {
  let { x, y, direction, phase, targetId, mouthOpen } = shark;
  const { exitDir } = shark;
  let nextFish = fish;

  if (phase === "chase" && targetId !== null) {
    const target = fish.find((f) => f.id === targetId);
    if (target) {
      const dx = target.x - x;
      const dy = target.y + SHARK_Y_OFFSET - y;
      const dist = Math.hypot(dx, dy);
      mouthOpen = dist < SHARK_MOUTH_DIST;
      if (dist < SHARK_EAT_DIST) {
        onEat(target);
        nextFish = fish.filter((f) => f.id !== targetId);
        phase = "exit";
        targetId = null;
        mouthOpen = false;
        x += exitDir * SHARK_SPEED * t;
      } else {
        x += (dx / dist) * SHARK_SPEED * t;
        y += (dy / dist) * SHARK_SPEED * t;
        direction = dx > 0 ? 1 : -1;
      }
    } else {
      phase = "exit";
      targetId = null;
      mouthOpen = false;
    }
  } else if (phase === "exit") {
    mouthOpen = false;
    x += exitDir * SHARK_SPEED * t;
  }

  if (x > 130 || x < -30) return { next: null, fish: nextFish };
  return {
    next: { x, y, direction, exitDir, phase, targetId, mouthOpen },
    fish: nextFish,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OceanScreen() {
  const socketRef    = useRef<WebSocket | null>(null);
  const fishListRef  = useRef<Fish[]>([]);
  const sharkRef     = useRef<Shark | null>(null);
  const oceanRef     = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const fishDomRefs  = useRef<Map<number, HTMLDivElement>>(new Map());
  const sharkDomRef  = useRef<HTMLDivElement | null>(null);
  const sharkImgRef  = useRef<HTMLImageElement | null>(null);
  const prevMouthRef = useRef<boolean>(false);

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [shark, setShark] = useState<Shark | null>(null);
  const [bubbles] = useState<Bubble[]>(generateBubbles);
  const [activeFishId, setActiveFishId] = useState<number | null>(null);
  const [clickBubbles, setClickBubbles] = useState<ClickBubbleData[]>([]);

  // ─── Drag ──────────────────────────────────────────────────────────────────

  const activateDrag = (fishId: number) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const rect = oceanRef.current?.getBoundingClientRect();
    const cur = fishListRef.current.find((f) => f.id === fishId);
    if (rect && cur) {
      drag.offsetX = ((drag.startX - rect.left) / rect.width) * 100 - cur.x;
      drag.offsetY = ((drag.startY - rect.top) / rect.height) * 100 - cur.y;
    }
    drag.active = true;
    const el = fishDomRefs.current.get(fishId);
    if (el) {
      el.style.cursor = "grabbing";
      el.style.transition = "none";
    }
    const idx = fishListRef.current.findIndex((f) => f.id === fishId);
    if (idx !== -1)
      fishListRef.current[idx] = {
        ...fishListRef.current[idx],
        dragging: true,
      };
  };

  const handlePointerDown = (fishId: number, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const timer = window.setTimeout(() => activateDrag(fishId), 150);
    dragStateRef.current = {
      fishId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
      active: false,
      longPressTimer: timer,
    };
  };

  const handlePointerMove = (fishId: number, e: React.PointerEvent) => {
    const drag = dragStateRef.current;
    if (!drag || drag.fishId !== fishId) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 35) {
        if (drag.longPressTimer !== null)
          window.clearTimeout(drag.longPressTimer);
        drag.longPressTimer = null;
      }
      return;
    }
    const rect = oceanRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(
      2,
      Math.min(92, ((e.clientX - rect.left) / rect.width) * 100 - drag.offsetX),
    );
    const y = Math.max(
      8,
      Math.min(84, ((e.clientY - rect.top) / rect.height) * 100 - drag.offsetY),
    );
    const idx = fishListRef.current.findIndex((f) => f.id === fishId);
    if (idx !== -1)
      fishListRef.current[idx] = { ...fishListRef.current[idx], x, y };
    const el = fishDomRefs.current.get(fishId);
    if (el) {
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
    }
  };

  const handlePointerUp = (fishId: number, message: string) => {
    const drag = dragStateRef.current;
    if (!drag || drag.fishId !== fishId) return;
    if (drag.longPressTimer !== null) window.clearTimeout(drag.longPressTimer);
    const el = fishDomRefs.current.get(fishId);
    if (el) {
      el.style.cursor = "grab";
      el.style.transition = "";
    }
    const idx = fishListRef.current.findIndex((f) => f.id === fishId);
    if (idx !== -1)
      fishListRef.current[idx] = {
        ...fishListRef.current[idx],
        dragging: false,
      };
    if (!drag.active && message) setActiveFishId(fishId);
    dragStateRef.current = null;
  };

  // ─── Click bubbles ─────────────────────────────────────────────────────────

  const handleOceanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const count = 3 + Math.floor(Math.random() * 2);
    const newBubbles: ClickBubbleData[] = Array.from(
      { length: count },
      (_, i) => ({
        id: Date.now() + i,
        x,
        y,
        offsetX: (Math.random() - 0.5) * 32,
        size: 5 + Math.random() * 11,
        drift: (Math.random() - 0.5) * 52,
        duration: 0.8 + Math.random() * 0.7,
        delay: Math.random() * 0.18,
      }),
    );
    setClickBubbles((prev) => [...prev, ...newBubbles]);
    const maxMs = Math.max(
      ...newBubbles.map((b) => (b.duration + b.delay) * 1000),
    );
    setTimeout(() => {
      const ids = new Set(newBubbles.map((b) => b.id));
      setClickBubbles((prev) => prev.filter((b) => !ids.has(b.id)));
    }, maxMs + 100);
  };

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = new Audio("/바다bgm2(잔잔발랄).mp3");
    audio.loop = true;
    audio.volume = 0.4;
    audio.play().catch(() => {});
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    getFishes()
      .then((fishes) => {
        const loaded = fishes.slice(-MAX_FISH).map((f, i) => makeFish(f, i));
        fishListRef.current = loaded;
        setFishList(loaded);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let unmounted = false;
    const connect = () => {
      if (unmounted) return;
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => console.log("[WS] connected");
      ws.onerror = (e) => console.error("[WS] error", e);
      ws.onclose = (e) => {
        console.warn("[WS] closed", e.code);
        if (!unmounted) setTimeout(connect, 2000);
      };
      ws.onmessage = (event: MessageEvent<string>) => {
        const msg = JSON.parse(event.data) as { data?: Parameters<typeof makeFish>[0] };
        const newFish = makeFish(msg.data ?? (msg as unknown as Parameters<typeof makeFish>[0]), Date.now(), true);
        let next = [...fishListRef.current, newFish];
        if (next.length > MAX_FISH) next = next.slice(next.length - MAX_FISH);
        fishListRef.current = next;
        setFishList(next);
      };
      socketRef.current = ws;
    };
    connect();
    return () => {
      unmounted = true;
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    let rafId: number;
    let lastTime = 0;

    const tick = (now: number) => {
      // First frame uses 50ms (original tick rate); subsequent frames use real delta
      const delta = lastTime === 0 ? 50 : Math.min(now - lastTime, 100);
      lastTime = now;
      const t = delta / 50; // normalize: t=1 at original 50ms, t≈0.33 at 60fps

      // Read ocean size once per tick — before any DOM writes, so no forced reflow
      const oceanEl = oceanRef.current;
      if (!oceanEl) { rafId = requestAnimationFrame(tick); return; }
      const ow = oceanEl.offsetWidth;
      const oh = oceanEl.offsetHeight;

      let fish = fishListRef.current.map((f) => moveFish(f, t));
      const currentShark = sharkRef.current;

      if (currentShark) {
        const result = tickShark(currentShark, fish, t, (eaten) => {
          if (eaten.dbId) deleteFish(eaten.dbId).catch(console.error);
        });
        fish = result.fish;
        sharkRef.current = result.next;

        if (result.next) {
          if (sharkDomRef.current) {
            sharkDomRef.current.style.transform = `translate(${result.next.x / 100 * ow}px, ${result.next.y / 100 * oh}px) scaleX(${-result.next.direction})`;
          }
          if (result.next.mouthOpen !== prevMouthRef.current) {
            prevMouthRef.current = result.next.mouthOpen;
            if (sharkImgRef.current) {
              sharkImgRef.current.src =
                result.next.phase === "chase" && result.next.mouthOpen
                  ? eatSharkImg
                  : sharkImg;
            }
          }
        } else {
          setShark(null);
        }
      }

      for (const f of fish) {
        const el = fishDomRefs.current.get(f.id);
        if (el && !f.dragging) {
          el.style.left = `${f.x}%`;
          el.style.top = `${f.y}%`;
          el.style.setProperty("--fish-direction", String(-f.direction));
        }
      }

      const removed = fishListRef.current.length !== fish.length;
      fishListRef.current = fish;
      if (removed) setFishList([...fish]);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (activeFishId === null) return;
    const t = window.setTimeout(
      () => setActiveFishId((id) => (id === activeFishId ? null : id)),
      3000,
    );
    return () => window.clearTimeout(t);
  }, [activeFishId]);

  // ─── Debug ─────────────────────────────────────────────────────────────────

  const spawnShark = () => {
    if (sharkRef.current || fishListRef.current.length === 0) return;
    const target =
      fishListRef.current[
        Math.floor(Math.random() * fishListRef.current.length)
      ];
    const fromRight = Math.random() < 0.5;
    const newShark: Shark = {
      x: fromRight ? 130 : -30,
      y: target.y,
      targetId: target.id,
      direction: fromRight ? -1 : 1,
      exitDir: fromRight ? -1 : 1,
      phase: "chase",
      mouthOpen: false,
    };
    sharkRef.current = newShark;
    prevMouthRef.current = false;
    setShark(newShark); // triggers React to mount SharkWrapper, then DOM updates take over
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Ocean onClick={handleOceanClick} ref={oceanRef}>
      {fishList.map((fish) => (
        <FishWrapper
          key={fish.id}
          ref={(el: HTMLDivElement | null) => {
            if (el) {
              fishDomRefs.current.set(fish.id, el);
              // fishListRef.current has the latest position/direction;
              // fish (from fishList state) is a stale snapshot that only updates
              // when a fish is added/removed — NOT when direction changes mid-swim.
              const cur = fishListRef.current.find((f) => f.id === fish.id) ?? fish;
              el.style.left = `${cur.x}%`;
              el.style.top = `${cur.y}%`;
              el.style.setProperty("--fish-direction", String(-cur.direction));
              el.style.setProperty(
                "--fish-anim-duration",
                `${1.1 + (fish.wavePhase % 1) * 0.8}s`,
              );
            } else {
              fishDomRefs.current.delete(fish.id);
            }
          }}
          onPointerDown={(e) => handlePointerDown(fish.id, e)}
          onPointerMove={(e) => handlePointerMove(fish.id, e)}
          onPointerUp={() => handlePointerUp(fish.id, fish.message)}
          style={{ width: `${fish.scale}px` } as CSSProperties}
        >
          {activeFishId === fish.id && (
            <FishSpeechBubble>{fish.message}</FishSpeechBubble>
          )}
          <FishImage src={fish.image} alt={fish.name} />
          <FishLabel>{fish.name}</FishLabel>
        </FishWrapper>
      ))}

      {shark && (
        <SharkWrapper
          ref={sharkDomRef}
          style={
            {
              width: `${SHARK_SIZE}px`,
              // Initial position on first mount; rAF loop takes over immediately after
              transform: `translate(${shark.x / 100 * window.innerWidth}px, ${shark.y / 100 * window.innerHeight}px) scaleX(${-shark.direction})`,
            } as CSSProperties
          }
        >
          <SharkImage
            ref={sharkImgRef}
            src={
              shark.phase === "chase" && shark.mouthOpen
                ? eatSharkImg
                : sharkImg
            }
            alt="상어"
          />
        </SharkWrapper>
      )}

      {/* TEST BUTTON - 나중에 삭제 */}
      <button
        onClick={spawnShark}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 99,
          padding: "8px 16px",
        }}
      >
        🦈 상어 호출
      </button>

      {clickBubbles.map((cb) => (
        <ClickBubble
          key={cb.id}
          style={
            {
              left: `calc(${cb.x}% + ${cb.offsetX}px)`,
              top: `${cb.y}%`,
              "--cb-size": `${cb.size}px`,
              "--cb-drift": `${cb.drift}px`,
              "--cb-duration": `${cb.duration}s`,
              "--cb-delay": `${cb.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      {bubbles.map((b) => (
        <OceanBubble
          key={b.id}
          style={
            {
              left: `${b.left}%`,
              width: `${b.size}px`,
              height: `${b.size}px`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              "--bubble-peak": b.peakOpacity,
            } as CSSProperties
          }
        />
      ))}
    </Ocean>
  );
}
