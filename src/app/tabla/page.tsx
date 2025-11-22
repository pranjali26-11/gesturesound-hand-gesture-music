"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useHandTracking } from "@/hooks/useHandTracking";
import { soundEngine } from "@/lib/audio-engine";
import { detectGesture, DetectedGesture } from "@/lib/gesture-utils";

export default function TablaPage() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [leftGesture, setLeftGesture] = useState<DetectedGesture>("none");
  const [rightGesture, setRightGesture] = useState<DetectedGesture>("none");
  const [isMuted, setIsMuted] = useState(false);
  
  // To debounce or edge-detect gestures
  const lastLeftGesture = useRef<DetectedGesture>("none");
  const lastRightGesture = useRef<DetectedGesture>("none");

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

    let currentLeft: DetectedGesture = "none";
    let currentRight: DetectedGesture = "none";

    const mpDraw = (window as any);
    const drawConnectors = mpDraw.drawConnectors;
    const drawLandmarks = mpDraw.drawLandmarks;
    const HAND_CONNECTIONS = (window as any).HAND_CONNECTIONS;

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i]; // label is 'Left' or 'Right'
        
        if (drawConnectors && HAND_CONNECTIONS) {
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
            color: "#FF00FF",
            lineWidth: 5,
            });
        }
        if (drawLandmarks) {
            drawLandmarks(ctx, landmarks, {
            color: "#00FFFF",
            lineWidth: 2,
            });
        }

        const gesture = detectGesture(landmarks);
        
        // Note: MediaPipe 'Left' usually means it appears on left of screen (mirror mode usually flips this).
        // If mirror=true in Webcam, 'Left' hand label from MediaPipe is actually user's Right hand visually?
        // MediaPipe Hands outputs 'Left' for the person's left hand.
        // In mirrored video, the person's left hand appears on the left side of the screen? 
        // Actually, standard mirror: Left hand appears on left side.
        // Let's just trust the label or index.
        
        if (handedness.label === "Left") {
            currentLeft = gesture;
        } else {
            currentRight = gesture;
        }
      }
    }

    setLeftGesture(currentLeft);
    setRightGesture(currentRight);

    // Sound Logic - Trigger on "Change to Gesture"
    // Left Hand (Base): Open -> Dha (Bass+Rim), Fist -> Ke (Muted)
    // Right Hand (Treble): Open -> Na (Rim), Fist -> Tin (Muted)
    
    // Trigger Left
    if (currentLeft !== lastLeftGesture.current) {
        if (currentLeft === "open_palm") soundEngine.playTablaSound("dha");
        if (currentLeft === "fist") soundEngine.playTablaSound("ke");
        lastLeftGesture.current = currentLeft;
    }
    
    // Trigger Right
    if (currentRight !== lastRightGesture.current) {
        if (currentRight === "open_palm") soundEngine.playTablaSound("na");
        if (currentRight === "fist") soundEngine.playTablaSound("tin");
        lastRightGesture.current = currentRight;
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
        <Link href="/" className="text-2xl font-bold text-neon-pink">
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
            <h1 className="text-4xl font-bold text-neon-pink">Air Tabla</h1>
            <p className="text-muted-foreground">Left: Open=Dha, Fist=Ke | Right: Open=Na, Fist=Tin</p>
        </div>

        {/* Camera View */}
        <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden border-4 border-neon-pink shadow-[0_0_20px_rgba(var(--neon-pink),0.5)] bg-black">
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
                <div className="text-xs text-muted-foreground">Left Hand (Bayan)</div>
                <div className="text-xl font-mono font-bold text-neon-blue">
                    {leftGesture === "open_palm" && "DHA 🥁"}
                    {leftGesture === "fist" && "KE 👊"}
                    {leftGesture === "none" && "--"}
                </div>
             </div>
             
             <div className="absolute bottom-4 right-4 z-20 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-white/10 text-right">
                <div className="text-xs text-muted-foreground">Right Hand (Dayan)</div>
                <div className="text-xl font-mono font-bold text-neon-pink">
                    {rightGesture === "open_palm" && "NA 🔔"}
                    {rightGesture === "fist" && "TIN 👊"}
                    {rightGesture === "none" && "--"}
                </div>
             </div>
        </div>

        {/* Visual Tabla Representation */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-md">
            <div className={`aspect-square rounded-full border-4 flex items-center justify-center transition-all duration-100
                ${leftGesture !== "none" ? "border-neon-blue bg-neon-blue/20 scale-105" : "border-white/20 bg-transparent"}
            `}>
                <div className="text-center">
                    <div className="text-lg font-bold text-neon-blue">Bayan</div>
                    <div className="text-sm opacity-70">Bass</div>
                </div>
            </div>
            <div className={`aspect-square rounded-full border-4 flex items-center justify-center transition-all duration-100
                ${rightGesture !== "none" ? "border-neon-pink bg-neon-pink/20 scale-105" : "border-white/20 bg-transparent"}
            `}>
                <div className="text-center">
                    <div className="text-lg font-bold text-neon-pink">Dayan</div>
                    <div className="text-sm opacity-70">Treble</div>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}