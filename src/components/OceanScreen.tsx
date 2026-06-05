import { type CSSProperties, useEffect, useRef, useState } from "react";
import type React from "react";
import { deleteFish, getFishes } from "../api/fish";
import sharkImg from "../assets/images/shark.png";
import eatSharkImg from "../assets/images/eat_shark.png";
import bgOceanUrl from "../assets/images/bg_ocean.jpg";
import {
  ClickBubble,
  FishImage,
  FishLabel,
  FishSpeechBubble,
  FishWrapper,
  MagnifierGlint,
  MagnifierHandle,
  MagnifierOuter,
  MagnifierRing,
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
  yPhase: number;
  scale: number;
  entering: boolean;
  dragging?: boolean;
  protected?: boolean;
}

interface Shark {
  x: number;
  y: number;
  targetId: number | null;
  direction: 1 | -1;
  exitDir: 1 | -1;
  phase: "chase" | "exit";
  mouthOpen: boolean;
  eatenCount: number;
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
const BUBBLE_SOUND_PATHS = ["/bubble1.mp3", "/bubble2.mp3"] as const;
const LENS_R = 130;
const LENS_DIAM = LENS_R * 2;
const ZOOM = 2.5;
const SHARK_SPEED = 1.2;
const SHARK_EAT_DIST = 13;
const SHARK_MOUTH_DIST = 20;
const SHARK_Y_OFFSET = -12;
const SHARK_SIZE = 360;
const MAX_FISH = 250;
const WS_URL =
  (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8000";

const FISH_SIZE_MAP: Record<string, number> = {
  small: 130,
  medium: 170,
  large: 220,
};

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

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
  isProtected = false,
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
    yPhase: Math.random() * Math.PI * 2,
    scale: FISH_SIZE_MAP[data.size ?? "medium"] ?? 250,
    entering: isNew,
    protected: isProtected,
  };
}

function moveFish(fish: Fish, t: number, ow: number, oh: number): Fish {
  if (fish.dragging) return fish;

  // 물고기 크기를 퍼센트로 환산해 경계를 대칭으로 계산
  const fishWPct = ow > 0 ? (fish.scale / ow) * 100 : 15;
  const fishHPct = oh > 0 ? ((fish.scale * 0.55) / oh) * 100 : 10;
  const xMin = -fishWPct * 0.3;
  const xMax = 100 - fishWPct * 0.7;
  const yMin = -fishHPct * 0.3;
  const yMax = 100 - fishHPct * 1.2;

  let newDirection = fish.direction;
  let newX = fish.x + fish.speed * newDirection * t;
  const newWaveSpeed = fish.waveSpeed;
  const newWavePhase = fish.wavePhase + fish.waveSpeed * t;

  const entering = fish.entering && (newX < 5 || newX > 95);
  if (!entering) {
    if (newX > xMax) {
      newX = xMax;
      newDirection = -1;
    }
    if (newX < xMin) {
      newX = xMin;
      newDirection = 1;
    }
  }

  // 모든 물고기 동일 주기(yPhase)로 규칙적인 수직 이동
  const Y_SPEED = 0.022; // 전 물고기 공통 수직 주기
  const newYPhase = fish.yPhase + Y_SPEED * t;
  const waveY = Math.sin(newYPhase) * 0.22;
  let newY = fish.y + waveY * t;

  const newVerticalVelocity = waveY;

  if (newY > yMax) newY = yMax;
  if (newY < yMin) newY = yMin;

  return {
    ...fish,
    x: newX,
    y: newY,
    direction: newDirection,
    verticalVelocity: newVerticalVelocity,
    wavePhase: newWavePhase,
    waveSpeed: newWaveSpeed,
    yPhase: newYPhase,
    entering,
  };
}

function resolveCollisions(fish: Fish[], ow: number, oh: number): Fish[] {
  if (fish.length < 2) return fish;
  let result = fish;

  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      const a = result[i];
      const b = result[j];
      if (a.dragging || b.dragging || a.entering || b.entering) continue;

      const awPct = ow > 0 ? (a.scale / ow) * 100 : 15;
      const bwPct = ow > 0 ? (b.scale / ow) * 100 : 15;
      const ahPct = oh > 0 ? ((a.scale * 0.55) / oh) * 100 : 8;
      const bhPct = oh > 0 ? ((b.scale * 0.55) / oh) * 100 : 8;

      const dx = b.x + bwPct * 0.5 - (a.x + awPct * 0.5);
      const dy = b.y + bhPct * 0.5 - (a.y + ahPct * 0.5);

      // AABB: x·y 각각 겹치는지 확인
      if (
        Math.abs(dx) < (awPct + bwPct) * 0.5 &&
        Math.abs(dy) < (ahPct + bhPct) * 0.65
      ) {
        const relVx = a.speed * a.direction - b.speed * b.direction;
        const aVy = Math.sin(a.yPhase) * 0.22;
        const bVy = Math.sin(b.yPhase) * 0.22;
        const relVy = aVy - bVy;

        const bounceX = relVx * dx > 0;
        const bounceY = relVy * dy > 0;

        if (bounceX || bounceY) {
          if (result === fish) result = [...fish];
          result[i] = {
            ...result[i],
            direction: bounceX ? (-a.direction as 1 | -1) : a.direction,
            yPhase: bounceY ? a.yPhase + Math.PI : a.yPhase,
          };
          result[j] = {
            ...result[j],
            direction: bounceX ? (-b.direction as 1 | -1) : b.direction,
            yPhase: bounceY ? b.yPhase + Math.PI : b.yPhase,
          };
        }
      }
    }
  }
  return result;
}

function tickShark(
  shark: Shark,
  fish: Fish[],
  t: number,
  onEat: (eaten: Fish) => void,
): { next: Shark | null; fish: Fish[] } {
  let { x, y, direction, phase, targetId, mouthOpen } = shark;
  const { exitDir } = shark;
  let eatenCount = shark.eatenCount;
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
        eatenCount += 1;
        mouthOpen = false;
        const nextTargets = nextFish.filter((f) => !f.protected);
        if (eatenCount < 5 && nextTargets.length > 0) {
          const next =
            nextTargets[Math.floor(Math.random() * nextTargets.length)];
          targetId = next.id;
        } else {
          phase = "exit";
          targetId = null;
          x += exitDir * SHARK_SPEED * t;
        }
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
    next: { x, y, direction, exitDir, phase, targetId, mouthOpen, eatenCount },
    fish: nextFish,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OceanScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const fishListRef = useRef<Fish[]>([]);
  const sharkRef = useRef<Shark | null>(null);
  const sharkThresholdRef = useRef(0);
  const oceanRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const fishDomRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const sharkDomRef = useRef<HTMLDivElement | null>(null);
  const sharkImgRef = useRef<HTMLImageElement | null>(null);
  const prevMouthRef = useRef<boolean>(false);

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [shark, setShark] = useState<Shark | null>(null);
  const [bubbles] = useState<Bubble[]>(generateBubbles);
  const [activeFishIds, setActiveFishIds] = useState<Set<number>>(new Set());
  const [clickBubbles, setClickBubbles] = useState<ClickBubbleData[]>([]);

  const LENS_HOME = { x: window.innerWidth - 0, y: window.innerHeight - 20 };
  const lensPosRef = useRef({ ...LENS_HOME });
  const lensHomeRef = useRef({ ...LENS_HOME });
  const lensGrabRef = useRef<{ ox: number; oy: number } | null>(null);
  const snapAnimRef = useRef<{
    startPos: { x: number; y: number };
    startTime: number;
  } | null>(null); // startTime=-1 means "set on first tick"
  const lensDomRef = useRef<HTMLDivElement | null>(null);
  const lensCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const fishImgCache = useRef<Map<number, HTMLImageElement>>(new Map());

  const topFishElRef = useRef<HTMLDivElement | null>(null);

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
      // 이전 최상단 물고기 z-index 초기화 후 현재 물고기를 최상단으로
      if (topFishElRef.current && topFishElRef.current !== el) {
        topFishElRef.current.style.zIndex = "";
      }
      el.style.zIndex = "10";
      topFishElRef.current = el;
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
    const fish = fishListRef.current.find((f) => f.id === fishId);
    const fishWPct =
      rect.width > 0 ? ((fish?.scale ?? 250) / rect.width) * 100 : 15;
    const fishHPct =
      rect.height > 0
        ? (((fish?.scale ?? 250) * 0.55) / rect.height) * 100
        : 10;
    const xMin = -fishWPct * 0.3;
    const xMax = 100 - fishWPct * 0.7;
    const yMin = -fishHPct * 0.3;
    const yMax = 100 - fishHPct * 1.2;
    const x = Math.max(
      xMin,
      Math.min(
        xMax,
        ((e.clientX - rect.left) / rect.width) * 100 - drag.offsetX,
      ),
    );
    const y = Math.max(
      yMin,
      Math.min(
        yMax,
        ((e.clientY - rect.top) / rect.height) * 100 - drag.offsetY,
      ),
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
    if (!drag.active && message) {
      setActiveFishIds((prev) => new Set(prev).add(fishId));
      window.setTimeout(() => {
        setActiveFishIds((prev) => {
          const next = new Set(prev);
          next.delete(fishId);
          return next;
        });
      }, 3000);
    }
    dragStateRef.current = null;
  };

  // ─── Magnifier drag ────────────────────────────────────────────────────────

  const handleLensPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
    snapAnimRef.current = null; // 스냅백 중이면 취소
    const rect = e.currentTarget.getBoundingClientRect();
    lensGrabRef.current = {
      ox: e.clientX - rect.left - LENS_R,
      oy: e.clientY - rect.top - LENS_R,
    };
  };

  const handleLensPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!lensGrabRef.current) return;
    const oceanRect = oceanRef.current?.getBoundingClientRect();
    if (!oceanRect) return;
    const nx = e.clientX - oceanRect.left - lensGrabRef.current.ox;
    const ny = e.clientY - oceanRect.top - lensGrabRef.current.oy;
    lensPosRef.current = { x: nx, y: ny };
    if (lensDomRef.current) {
      lensDomRef.current.style.left = `${nx - LENS_R}px`;
      lensDomRef.current.style.top = `${ny - LENS_R}px`;
    }
  };

  const handleLensPointerUp = () => {
    lensGrabRef.current = null;
    snapAnimRef.current = {
      startPos: { ...lensPosRef.current },
      startTime: -1,
    };
  };

  // ─── Click bubbles ─────────────────────────────────────────────────────────

  const playRandomBubbleSound = () => {
    const src =
      BUBBLE_SOUND_PATHS[Math.floor(Math.random() * BUBBLE_SOUND_PATHS.length)];
    const audio = new Audio(src);
    audio.volume = 0.7;
    audio.play().catch(() => {});
  };

  const handleOceanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    playRandomBubbleSound();
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
    const img = new Image();
    img.src = bgOceanUrl;
    bgImgRef.current = img;
  }, []);

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
        const loaded = fishes
          .slice(-MAX_FISH)
          .map((f, i) => makeFish(f, i, false, true));
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
        const msg = JSON.parse(event.data) as {
          type?: string;
          data?: Parameters<typeof makeFish>[0];
        };

        if (msg.type === "SPAWN_SHARK") {
          if (!sharkRef.current) {
            const targets = fishListRef.current.filter((f) => !f.protected);
            if (targets.length > 0) {
              const target =
                targets[Math.floor(Math.random() * targets.length)];
              const fromRight = Math.random() < 0.5;
              sharkRef.current = {
                x: fromRight ? 130 : -30,
                y: target.y,
                targetId: target.id,
                direction: fromRight ? -1 : 1,
                exitDir: fromRight ? -1 : 1,
                phase: "chase",
                mouthOpen: false,
                eatenCount: 0,
              };
              prevMouthRef.current = false;
              setShark(sharkRef.current);
            }
          }
          return;
        }

        const newFish = makeFish(
          msg.data ?? (msg as unknown as Parameters<typeof makeFish>[0]),
          Date.now(),
          true,
        );
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
      if (!oceanEl) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const ow = oceanEl.offsetWidth;
      const oh = oceanEl.offsetHeight;

      let fish = fishListRef.current.map((f) => moveFish(f, t, ow, oh));
      fish = resolveCollisions(fish, ow, oh);
      const currentShark = sharkRef.current;

      if (currentShark) {
        const result = tickShark(currentShark, fish, t, (eaten) => {
          if (eaten.dbId && !eaten.protected)
            deleteFish(eaten.dbId).catch(console.error);
        });
        fish = result.fish;
        sharkRef.current = result.next;

        if (result.next) {
          if (sharkDomRef.current) {
            sharkDomRef.current.style.transform = `translate(${(result.next.x / 100) * ow}px, ${(result.next.y / 100) * oh}px) scaleX(${-result.next.direction})`;
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

      // ── Magnifier snap-back ──
      if (snapAnimRef.current && !lensGrabRef.current) {
        const SNAP_MS = 480;
        if (snapAnimRef.current.startTime < 0)
          snapAnimRef.current.startTime = now;
        const { startPos, startTime } = snapAnimRef.current;
        const tRaw = Math.min((now - startTime) / SNAP_MS, 1);
        const ease = easeOutBack(tRaw);
        const home = lensHomeRef.current;
        const sx = startPos.x + (home.x - startPos.x) * ease;
        const sy = startPos.y + (home.y - startPos.y) * ease;
        lensPosRef.current = { x: sx, y: sy };
        if (lensDomRef.current) {
          lensDomRef.current.style.left = `${sx - LENS_R}px`;
          lensDomRef.current.style.top = `${sy - LENS_R}px`;
        }
        if (tRaw >= 1) {
          snapAnimRef.current = null;
          lensPosRef.current = { ...home };
        }
      }

      // ── Magnifier canvas ──
      const canvas = lensCanvasRef.current;
      if (canvas && ow > 0 && oh > 0) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const { x: lx, y: ly } = lensPosRef.current;
          const srcW = LENS_DIAM / ZOOM;
          const srcH = LENS_DIAM / ZOOM;
          const srcX = lx - srcW / 2;
          const srcY = ly - srcH / 2;

          ctx.fillStyle = "#1a4a6e";
          ctx.fillRect(0, 0, LENS_DIAM, LENS_DIAM);

          const bgImg = bgImgRef.current;
          if (bgImg?.complete && bgImg.naturalWidth > 0) {
            const cs = Math.max(
              ow / bgImg.naturalWidth,
              oh / bgImg.naturalHeight,
            );
            const bx = (ow - bgImg.naturalWidth * cs) / 2;
            const by = (oh - bgImg.naturalHeight * cs) / 2;
            ctx.drawImage(
              bgImg,
              (srcX - bx) / cs,
              (srcY - by) / cs,
              srcW / cs,
              srcH / cs,
              0,
              0,
              LENS_DIAM,
              LENS_DIAM,
            );
          }

          const cache = fishImgCache.current;
          for (const f of fish) {
            const fxPx = (f.x / 100) * ow;
            const fyPx = (f.y / 100) * oh;
            if (
              Math.abs(fxPx - lx) > srcW / 2 + f.scale ||
              Math.abs(fyPx - ly) > srcH / 2 + f.scale * 0.6
            )
              continue;

            let fi = cache.get(f.id);
            if (!fi) {
              fi = new Image();
              fi.src = f.image;
              cache.set(f.id, fi);
            }
            if (!fi.complete || fi.naturalWidth === 0) continue;

            const cx = (fxPx - srcX) * ZOOM;
            const cy = (fyPx - srcY) * ZOOM;
            const cw = f.scale * ZOOM;
            const ch = cw * (fi.naturalHeight / fi.naturalWidth);

            ctx.save();
            ctx.translate(cx + cw / 2, cy);
            ctx.scale(f.direction === 1 ? -1 : 1, 1);
            ctx.drawImage(fi, -cw / 2, 0, cw, ch);
            ctx.restore();

            ctx.save();
            ctx.font = "bold 22px sans-serif";
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 6;
            ctx.fillText(f.name, cx + cw / 2, cy + ch + 24);
            ctx.restore();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ─── Debug ─────────────────────────────────────────────────────────────────

  const spawnShark = () => {
    if (sharkRef.current) return;
    const targets = fishListRef.current.filter((f) => !f.protected);
    if (targets.length === 0) return;
    const target = targets[Math.floor(Math.random() * targets.length)];
    const fromRight = Math.random() < 0.5;
    const newShark: Shark = {
      x: fromRight ? 130 : -30,
      y: target.y,
      targetId: target.id,
      direction: fromRight ? -1 : 1,
      exitDir: fromRight ? -1 : 1,
      phase: "chase",
      mouthOpen: false,
      eatenCount: 0,
    };
    sharkRef.current = newShark;
    prevMouthRef.current = false;
    setShark(newShark);
  };

  // 물고기가 30의 배수를 새로 넘을 때마다 상어 소환
  useEffect(() => {
    const count = fishList.length;
    const threshold = Math.floor(count / 30) * 30;
    if (
      threshold > 0 &&
      threshold > sharkThresholdRef.current &&
      !sharkRef.current
    ) {
      sharkThresholdRef.current = threshold;
      spawnShark();
    }
  }, [fishList.length]); // spawnShark는 ref만 사용해 안정적

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
              const cur =
                fishListRef.current.find((f) => f.id === fish.id) ?? fish;
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
          {activeFishIds.has(fish.id) && (
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
              transform: `translate(${(shark.x / 100) * window.innerWidth}px, ${(shark.y / 100) * window.innerHeight}px) scaleX(${-shark.direction})`,
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

      <MagnifierOuter
        ref={(el) => {
          lensDomRef.current = el;
          if (el) {
            el.style.left = `${lensPosRef.current.x - LENS_R}px`;
            el.style.top = `${lensPosRef.current.y - LENS_R}px`;
          }
        }}
        onPointerDown={handleLensPointerDown}
        onPointerMove={handleLensPointerMove}
        onPointerUp={handleLensPointerUp}
      >
        <MagnifierRing>
          <canvas ref={lensCanvasRef} width={LENS_DIAM} height={LENS_DIAM} />
          <MagnifierGlint />
        </MagnifierRing>
        <MagnifierHandle />
      </MagnifierOuter>

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
