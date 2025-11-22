"use client";

import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export const useHandTracking = (
  webcamRef: React.RefObject<Webcam | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  onResultsCallback: (results: any) => void
) => {
  const [camera, setCamera] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if MediaPipe is loaded
    const mpHands = (window as any).Hands;
    const mpCamera = (window as any).Camera;

    if (!mpHands || !mpCamera) {
      console.log("Waiting for MediaPipe to load...");
      const timer = setInterval(() => {
        if ((window as any).Hands && (window as any).Camera) {
             clearInterval(timer);
             // Trigger re-run
             setLoaded((prev) => !prev); 
        }
      }, 500);
      return () => clearInterval(timer);
    }
    
    if (loaded) return; // Already initialized? Actually we rely on the effect to init.

    console.log("Initializing MediaPipe Hands");
    const hands = new mpHands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResultsCallback);

    if (webcamRef.current && webcamRef.current.video) {
      const cam = new mpCamera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current?.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480,
      });
      
      cam.start()
        .then(() => {
            setLoaded(true);
            console.log("Camera started");
        })
        .catch((err: any) => console.error("Camera start error:", err));
        
      setCamera(cam);
    }

    return () => {
        // Cleanup
    };
  }, [webcamRef, canvasRef, onResultsCallback, loaded]); // Added loaded to retry init

  return { loaded, camera };
};