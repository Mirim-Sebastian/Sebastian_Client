import { useEffect, useRef, useState } from "react";

interface Fish {
  id: number;
  name: string;
  image: string;
  x: number;
  y: number;
}

export default function OceanScreen() {
  const socketRef = useRef<WebSocket | null>(null);
  const [fishList, setFishList] = useState<Fish[]>([]);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8000");

    socketRef.current.onopen = () => {
      console.log("✅ Ocean 연결됨");
    };

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      const fish = msg.data ?? msg;

      const newFish = {
        id: Date.now(),
        name: fish.name,
        image: fish.image,
        x: Math.random() * 80,
        y: Math.random() * 70,
      };

      setFishList((prev) => [...prev, newFish]);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #4facfe, #00c6ff)",
      }}
    >
      {fishList.map((fish) => (
        <img
          key={fish.id}
          src={fish.image}
          alt={fish.name}
          style={{
            width: "120px",
            position: "absolute",
            left: `${fish.x}%`,
            top: `${fish.y}%`,
          }}
        />
      ))}
    </div>
  );
}