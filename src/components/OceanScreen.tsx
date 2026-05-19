import { type CSSProperties, useEffect, useRef, useState } from "react";
import { getFishes } from "../api/fish";
import sharkImg from "../assets/images/shark.png";
import eatSharkImg from "../assets/images/eat_shark.png";
import {
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
  data: { name: string; image: string; message: string; size?: string },
  id: number,
): Fish {
  return {
    id,
    name: data.name,
    image: data.image,
    message: typeof data.message === "string" ? data.message.trim() : "",
    x: 5 + Math.random() * 80,
    y: 10 + Math.random() * 70,
    speed: 0.08 + Math.random() * 0.12,
    direction: Math.random() < 0.5 ? 1 : -1,
    verticalVelocity: (Math.random() - 0.5) * 0.08,
    wavePhase: Math.random() * Math.PI * 2,
    waveSpeed: 0.05 + Math.random() * 0.08,
    scale: FISH_SIZE_MAP[data.size ?? "medium"] ?? 250,
  };
}

function moveFish(fish: Fish): Fish {
  let newDirection = fish.direction;
  let newX = fish.x + fish.speed * newDirection;
  let newVerticalVelocity = fish.verticalVelocity;
  let newWaveSpeed = fish.waveSpeed;
  const newWavePhase = fish.wavePhase + fish.waveSpeed;

  if (newX > 92) { newX = 92; newDirection = -1; }
  if (newX < 2)  { newX = 2;  newDirection = 1;  }

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
  };
}

export default function OceanScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const fishListRef = useRef<Fish[]>([]);
  const sharkRef = useRef<Shark | null>(null);
  const nextThresholdRef = useRef(10);

  const [fishList, setFishList] = useState<Fish[]>([]);
  const [shark, setShark] = useState<Shark | null>(null);
  const [bubbles] = useState<Bubble[]>(generateBubbles);
  const [activeFishId, setActiveFishId] = useState<number | null>(null);

  useEffect(() => {
    getFishes()
      .then((fishes) => {
        const loaded = fishes.map((f, i) => makeFish(f, i));
        fishListRef.current = loaded;
        setFishList(loaded);
        // 다음 임계값을 현재 수의 다음 10단위로 설정
        if (loaded.length > 0) {
          nextThresholdRef.current = Math.floor(loaded.length / 10) * 10 + 10;
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000");
    socketRef.current.onopen = () => console.log("Ocean connected");
    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const fish = msg.data ?? msg;
      const newFish = makeFish(fish, Date.now());
      fishListRef.current = [...fishListRef.current, newFish];
      setFishList([...fishListRef.current]);
    };
    return () => socketRef.current?.close();
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

      // 상어 등장 조건 체크
      if (
        !sharkRef.current &&
        newFish.length >= nextThresholdRef.current &&
        newFish.length > 0
      ) {
        const target = newFish[Math.floor(Math.random() * newFish.length)];
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
        nextThresholdRef.current += 10;
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
    <Ocean>
      {fishList.map((fish) => (
        <FishWrapper
          key={fish.id}
          onPointerDown={() => {
            if (!fish.message) return;
            setActiveFishId(fish.id);
          }}
          style={{
            left: `${fish.x}%`,
            top: `${fish.y}%`,
            width: `${fish.scale}px`,
            "--fish-direction": -fish.direction,
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