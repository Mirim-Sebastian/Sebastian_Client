import { type CSSProperties, useEffect, useRef, useState } from "react";
import {
  FishImage,
  FishLabel,
  FishSpeechBubble,
  FishWrapper,
  Ocean,
  OceanBubble,
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

interface Bubble {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  peakOpacity: number;
}

const BUBBLE_COUNT = 18;

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

export default function OceanScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [bubbles] = useState<Bubble[]>(generateBubbles);
  const [activeFishId, setActiveFishId] = useState<number | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000");

    socketRef.current.onopen = () => {
      console.log("Ocean connected");
    };

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const fish = msg.data ?? msg;

      const newFish: Fish = {
        id: Date.now(),
        name: fish.name,
        image: fish.image,
        message: typeof fish.message === "string" ? fish.message.trim() : "",
        x: 5 + Math.random() * 80,
        y: 10 + Math.random() * 70,
        speed: 0.08 + Math.random() * 0.12,
        direction: Math.random() < 0.5 ? 1 : -1,
        verticalVelocity: (Math.random() - 0.5) * 0.08,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.05 + Math.random() * 0.08,
        scale: 140 + Math.random() * 30,
      };

      setFishList((prev) => [...prev, newFish]);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFishList((prev) =>
        prev.map((fish) => {
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
        })
      );
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
