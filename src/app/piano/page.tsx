"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useHandTracking } from "@/hooks/useHandTracking";
import { soundEngine, PIANO_NOTES } from "@/lib/audio-engine";
import { countExtendedFingers } from "@/lib/gesture-utils";

const NOTE_MAPPING = [
  { count: 0, note: null, label: "Silence" },
  { count: 1, note: PIANO_NOTES.C4, label: "C4" },
  { count: 2, note: PIANO_NOTES.D4, label: "D4" },
  { count: 3, note: PIANO_NOTES.E4, label: "E4" },
  { count: 4, note: PIANO_NOTES.F4, label: "F4" },
  { count: 5, note: PIANO_NOTES.G4, label: "G4" },
  { count: 6, note: PIANO_NOTES.A4, label: "A4" },
  { count: 7, note: PIANO_NOTES.B4, label: "B4" },
  { count: 8, note: PIANO_NOTES.C5, label: "C5" },
  { count: 9, note: PIANO_NOTES.D5, label: "D5" },
  { count: 10, note: PIANO_NOTES.E5, label: "E5" },
];

export default function PianoPage() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fingerCount, setFingerCount] = useState(0);
  const [currentNote, setCurrentNote] = useState<string>("Silence");
  const [isMuted, setIsMuted] = useState(false);
  const lastNoteRef = useRef<number | null>(null);

  const onResults = useCallback((results: any) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;

    if (!canvas || !video) return;

    const { width, height } = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(results.image, 0, 0, width, height);

    let totalFingers = 0;

    const mpDraw = (window as any);
    const drawConnectors = mpDraw.drawConnectors;
    const drawLandmarks = mpDraw.drawLandmarks;
    const HAND_CONNECTIONS = (window as any).HAND_CONNECTIONS;

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        if (drawConnectors && HAND_CONNECTIONS) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
            });
        }
        if (drawLandmarks) {
            drawLandmarks(ctx, landmarks, {
            color: "#FF0000",
            lineWidth: 2,
            });
        }
        totalFingers += countExtendedFingers(landmarks);
      }
    }
    
    // Cap at 10
    totalFingers = Math.min(totalFingers, 10);
    setFingerCount(totalFingers);

    // Trigger Sound
    const mapping = NOTE_MAPPING[totalFingers];
    if (mapping) {
        setCurrentNote(mapping.label);
        
        // Play sound only if note changed or re-trigger logic? 
        // For piano, let's play when the count changes to a new valid note
        if (mapping.note && mapping.note !== lastNoteRef.current) {
            soundEngine.playPianoNote(mapping.note);
            lastNoteRef.current = mapping.note;
        } else if (!mapping.note) {
            lastNoteRef.current = null;
        }
    }

    ctx.restore();
  }, []);

  const { loaded } = useHandTracking(webcamRef, canvasRef, onResults);

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    soundEngine.setMute(newState);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background text-foreground">
      {/* Header */}
      <header className="z-10 flex w-full items-center justify-between p-6 backdrop-blur-md bg-background/50 fixed top-0">
        <Link href="/" className="text-2xl font-bold text-neon-blue">
            GestureSound
        </Link>
        <div className="flex items-center gap-4">
            <Button variant={isMuted ? "destructive" : "outline"} onClick={toggleMute}>
                {isMuted ? "Unmute" : "Mute"}
            </Button>
            <Link href="/">
                <Button variant="ghost">Exit</Button>
            </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center w-full pt-24 pb-10 gap-8">
        
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-neon-purple">Air Piano</h1>
            <p className="text-muted-foreground">Show 1 finger for C4, 2 for D4... up to 10!</p>
        </div>

        {/* Camera View */}
        <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border-4 border-neon-blue shadow-[0_0_20px_rgba(var(--neon-blue),0.5)] bg-black">
             {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 z-20 bg-black/80 text-white">
                    <Camera className="w-12 h-12 animate-bounce" />
                    <p>Loading Camera & AI Model...</p>
                </div>
             )}
             
             <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                className="absolute inset-0 w-full h-full object-cover"
                videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
             />
             <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover z-10"
                width={640}
                height={480}
             />
             
             {/* HUD */}
             <div className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                <div className="text-xs text-muted-foreground">Fingers Detected</div>
                <div className="text-2xl font-mono font-bold text-neon-green">{fingerCount}</div>
             </div>
             
             <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-right">
                <div className="text-xs text-muted-foreground">Current Note</div>
                <div className="text-2xl font-mono font-bold text-neon-pink">{currentNote}</div>
             </div>
        </div>
        
        {/* Visual Piano Keys Representation (Optional Visualization) */}
        <div className="flex gap-1 h-24 w-full max-w-3xl justify-center px-4">
             {NOTE_MAPPING.slice(1).map((item, index) => (
                 <div 
                    key={item.label} 
                    className={`flex-1 rounded-b-lg transition-all duration-100 border border-white/20 flex items-end justify-center pb-2
                        ${item.label === currentNote ? "bg-neon-blue h-full shadow-[0_0_15px_var(--neon-blue)]" : "bg-card/50 h-20"}
                    `}
                 >
                    <span className="text-xs font-bold">{item.label}</span>
                 </div>
             ))}
        </div>

      </main>
    </div>
  );
}