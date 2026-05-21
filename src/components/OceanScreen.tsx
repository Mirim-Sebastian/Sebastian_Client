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

const BUBBLE_COUNT = 18;
const SHARK_SPEED = 1.2;
const SHARK_EAT_DIST = 13;
const SHARK_MOUTH_DIST = 20;
const SHARK_Y_OFFSET = -12;
const SHARK_SIZE = 480;

const FISH_SIZE_MAP: Record<string, number> = {
  small: 200,
  medium: 250,
  large: 300,
};

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
  data: { name: string; image: string; message: string; size?: string; _id?: string; id?: string },
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
    direction: isNew ? (fromRight ? -1 : 1) : (Math.random() < 0.5 ? 1 : -1),
    verticalVelocity: (Math.random() - 0.5) * 0.08,
    wavePhase: Math.random() * Math.PI * 2,
    waveSpeed: 0.05 + Math.random() * 0.08,
    scale: FISH_SIZE_MAP[data.size ?? "medium"] ?? 250,
    entering: isNew,
  };
}

function moveFish(fish: Fish): Fish {
  if (fish.dragging) return fish;
  let newDirection = fish.direction;
  const speed = fish.speed;
  let newX = fish.x + speed * newDirection;
  let newVerticalVelocity = fish.verticalVelocity;
  let newWaveSpeed = fish.waveSpeed;
  const newWavePhase = fish.wavePhase + fish.waveSpeed;

  const entering = fish.entering && (newX < 2 || newX > 92);
  if (!entering) {
    if (newX > 92) { newX = 92; newDirection = -1; }
    if (newX < 2)  { newX = 2;  newDirection = 1;  }
  }

  if (Math.random() < 0.018) {
    newVerticalVelocity = (Math.random() - 0.5) * 0.12;
    newWaveSpeed = 0.035 + Math.random() * 0.1;
  }

  const waveY =
    Math.sin(newWavePhase) * 0.06 +
    Math.sin(newWavePhase * 0.43 + fish.id) * 0.04;
  let newY = fish.y + waveY + newVerticalVelocity;

  if (newY > 84) { newY = 84; newVerticalVelocity = -Math.abs(newVerticalVelocity || 0.05); }
  if (newY < 8)  { newY = 8;  newVerticalVelocity =  Math.abs(newVerticalVelocity || 0.05); }

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

export default function OceanScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const fishListRef = useRef<Fish[]>([]);
  const sharkRef = useRef<Shark | null>(null);
  const oceanRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    fishId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    active: boolean;
    longPressTimer: number | null;
  } | null>(null);

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [shark, setShark] = useState<Shark | null>(null);
  const [bubbles] = useState<Bubble[]>(generateBubbles);
  const [activeFishId, setActiveFishId] = useState<number | null>(null);
  const [clickBubbles, setClickBubbles] = useState<ClickBubbleData[]>([]);

  const handleOceanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const count = 3 + Math.floor(Math.random() * 2);
    const newBubbles: ClickBubbleData[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      offsetX: (Math.random() - 0.5) * 32,
      size: 5 + Math.random() * 11,
      drift: (Math.random() - 0.5) * 52,
      duration: 0.8 + Math.random() * 0.7,
      delay: Math.random() * 0.18,
    }));

    setClickBubbles((prev) => [...prev, ...newBubbles]);

    const maxMs = Math.max(...newBubbles.map((b) => (b.duration + b.delay) * 1000));
    setTimeout(() => {
      const ids = new Set(newBubbles.map((b) => b.id));
      setClickBubbles((prev) => prev.filter((b) => !ids.has(b.id)));
    }, maxMs + 100);
  };

  useEffect(() => {
    getFishes()
      .then((fishes) => {
        const loaded = fishes.map((f, i) => makeFish(f, i));
        fishListRef.current = loaded;
        setFishList(loaded);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      const ws = new WebSocket("ws://localhost:8000");
      ws.onopen = () => console.log("[WS] Ocean connected");
      ws.onerror = (e) => console.error("[WS] error", e);
      ws.onclose = (e) => {
        console.warn("[WS] closed", e.code);
        if (!unmounted) setTimeout(connect, 2000);
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        const fish = msg.data ?? msg;
        const newFish = makeFish(fish, Date.now(), true);
        fishListRef.current = [...fishListRef.current, newFish];
        setFishList([...fishListRef.current]);
      };
      socketRef.current = ws;
    };

    connect();

    return () => {
      unmounted = true;
      socketRef.current?.close();
    };
  }, []);

  // 물고기 + 상어 애니메이션 루프
  useEffect(() => {
    const interval = setInterval(() => {
      let newFish = fishListRef.current.map(moveFish);
      const currentShark = sharkRef.current;

      if (currentShark) {
        let { x, y, direction, exitDir, phase, targetId, mouthOpen } = currentShark;

        if (phase === "chase" && targetId !== null) {
          const target = newFish.find((f) => f.id === targetId);
          if (target) {
            const dx = target.x - x;
            const dy = (target.y + SHARK_Y_OFFSET) - y;
            const dist = Math.hypot(dx, dy);
            mouthOpen = dist < SHARK_MOUTH_DIST;
            if (dist < SHARK_EAT_DIST) {
              const eaten = newFish.find((f) => f.id === targetId);
              console.log("[shark] eating:", eaten?.name, "| dbId:", eaten?.dbId);
              if (eaten?.dbId) {
                deleteFish(eaten.dbId)
                  .then(() => console.log("[deleteFish] OK:", eaten.dbId))
                  .catch((e) => console.error("[deleteFish] FAIL:", e));
              } else {
                console.warn("[shark] no dbId", eaten);
              }
              newFish = newFish.filter((f) => f.id !== targetId);
              phase = "exit";
              targetId = null;
              mouthOpen = false;
              x += exitDir * SHARK_SPEED;
            } else {
              x += (dx / dist) * SHARK_SPEED;
              y += (dy / dist) * SHARK_SPEED;
              direction = dx > 0 ? 1 : -1;
            }
          } else {
            phase = "exit";
            targetId = null;
            mouthOpen = false;
          }
        } else if (phase === "exit") {
          mouthOpen = false;
          x += exitDir * SHARK_SPEED;
        }

        if (x > 130 || x < -30) {
          sharkRef.current = null;
          setShark(null);
        } else {
          const updated: Shark = { x, y, direction, exitDir, phase, targetId, mouthOpen };
          sharkRef.current = updated;
          setShark(updated);
        }
      }

      fishListRef.current = newFish;
      setFishList(newFish);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeFishId === null) return;
    const timeout = window.setTimeout(() => {
      setActiveFishId((currentId) =>
        currentId === activeFishId ? null : currentId,
      );
    }, 3000);
    return () => window.clearTimeout(timeout);
  }, [activeFishId]);

  // 상어 강제 소환 (디버그용)
  const spawnShark = () => {
    if (sharkRef.current) return;
    const fish = fishListRef.current;
    if (fish.length === 0) return;
    const target = fish[Math.floor(Math.random() * fish.length)];
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
    setShark(newShark);
  };

  return (
    <Ocean onClick={handleOceanClick} ref={oceanRef}>
      {fishList.map((fish) => (
        <FishWrapper
          key={fish.id}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const timer = window.setTimeout(() => {
              const drag = dragStateRef.current;
              if (!drag) return;
              const rect = oceanRef.current?.getBoundingClientRect();
              const cur = fishListRef.current.find((f) => f.id === drag.fishId);
              if (rect && cur) {
                drag.offsetX = ((drag.startX - rect.left) / rect.width) * 100 - cur.x;
                drag.offsetY = ((drag.startY - rect.top) / rect.height) * 100 - cur.y;
              }
              drag.active = true;
              fishListRef.current = fishListRef.current.map((f) =>
                f.id === drag.fishId ? { ...f, dragging: true } : f
              );
              setFishList([...fishListRef.current]);
            }, 150);
            dragStateRef.current = {
              fishId: fish.id,
              startX: e.clientX,
              startY: e.clientY,
              offsetX: 0,
              offsetY: 0,
              active: false,
              longPressTimer: timer,
            };
          }}
          onPointerMove={(e) => {
            const drag = dragStateRef.current;
            if (!drag || drag.fishId !== fish.id) return;
            if (!drag.active) {
              if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 35) {
                if (drag.longPressTimer !== null) window.clearTimeout(drag.longPressTimer);
                drag.longPressTimer = null;
              }
              return;
            }
            const rect = oceanRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = ((e.clientX - rect.left) / rect.width) * 100 - drag.offsetX;
            const y = ((e.clientY - rect.top) / rect.height) * 100 - drag.offsetY;
            fishListRef.current = fishListRef.current.map((f) =>
              f.id === fish.id
                ? { ...f, x: Math.max(2, Math.min(92, x)), y: Math.max(8, Math.min(84, y)) }
                : f
            );
            setFishList([...fishListRef.current]);
          }}
          onPointerUp={() => {
            const drag = dragStateRef.current;
            if (!drag || drag.fishId !== fish.id) return;
            if (drag.longPressTimer !== null) window.clearTimeout(drag.longPressTimer);
            fishListRef.current = fishListRef.current.map((f) =>
              f.id === fish.id ? { ...f, dragging: false } : f
            );
            if (!drag.active && fish.message) setActiveFishId(fish.id);
            dragStateRef.current = null;
            setFishList([...fishListRef.current]);
          }}
          style={{
            left: `${fish.x}%`,
            top: `${fish.y}%`,
            width: `${fish.scale}px`,
            "--fish-direction": -fish.direction,
            "--fish-anim-duration": `${1.1 + (fish.wavePhase % 1) * 0.8}s`,
            cursor: fish.dragging ? "grabbing" : "grab",
            transition: fish.dragging ? "none" : undefined,
          } as CSSProperties}
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
          style={{
            left: `${shark.x}%`,
            top: `${shark.y}%`,
            width: `${SHARK_SIZE}px`,
            transform: `scaleX(${-shark.direction})`,
          } as CSSProperties}
        >
          <SharkImage
            src={shark.phase === "chase" && shark.mouthOpen ? eatSharkImg : sharkImg}
            alt="상어"
          />
        </SharkWrapper>
      )}

      {/* TEST BUTTON - 나중에 삭제 */}
      <button
        onClick={spawnShark}
        style={{ position: "fixed", bottom: 16, right: 16, zIndex: 99, padding: "8px 16px" }}
      >
        🦈 상어 호출
      </button>

      {clickBubbles.map((cb) => (
        <ClickBubble
          key={cb.id}
          style={{
            left: `calc(${cb.x}% + ${cb.offsetX}px)`,
            top: `${cb.y}%`,
            "--cb-size": `${cb.size}px`,
            "--cb-drift": `${cb.drift}px`,
            "--cb-duration": `${cb.duration}s`,
            "--cb-delay": `${cb.delay}s`,
          } as CSSProperties}
        />
      ))}

      {bubbles.map((b) => (
        <OceanBubble
          key={b.id}
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            "--bubble-peak": b.peakOpacity,
          } as CSSProperties}
        />
      ))}
    </Ocean>
  );
}