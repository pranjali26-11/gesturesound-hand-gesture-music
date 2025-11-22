export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";

export const FINGER_TIPS: Record<Finger, number> = {
  thumb: 4,
  index: 8,
  middle: 12,
  ring: 16,
  pinky: 20,
};

export const FINGER_PIPS: Record<Finger, number> = {
  thumb: 2,
  index: 6,
  middle: 10,
  ring: 14,
  pinky: 18,
};

/**
 * Checks if a specific finger is extended.
 * Note: For thumb, we check x-axis difference relative to wrist/MCP for simplicity in 2D,
 * but often checking if tip is 'above' MCP (lower y value) works for upright hands.
 * We'll use a simple Y-axis check for non-thumbs, and a specific check for thumbs.
 */
export function isFingerExtended(landmarks: NormalizedLandmark[], finger: Finger): boolean {
  const tip = landmarks[FINGER_TIPS[finger]];
  const pip = landmarks[FINGER_PIPS[finger]];

  // Thumb is tricky. A simple check is if the tip is farther from the base of the palm (wrist) than the IP joint.
  // Or we can just check if the tip x is "outside" the MCP x depending on handedness.
  // For a generic "upright hand" piano playing gesture:
  
  if (finger === "thumb") {
    // Simple check: is tip higher (lower y) than the MCP (joint 2)?
    // This works well for "high five" position.
    return tip.y < landmarks[2].y; 
  }

  // For other fingers, check if tip is higher (lower y) than the PIP joint
  return tip.y < pip.y;
}

export function getExtendedFingers(landmarks: NormalizedLandmark[]): Finger[] {
  const fingers: Finger[] = ["thumb", "index", "middle", "ring", "pinky"];
  return fingers.filter(finger => isFingerExtended(landmarks, finger));
}

export function countExtendedFingers(landmarks: NormalizedLandmark[]): number {
  let count = 0;
  const fingers: Finger[] = ["thumb", "index", "middle", "ring", "pinky"];
  
  for (const finger of fingers) {
    if (isFingerExtended(landmarks, finger)) {
      count++;
    }
  }
  return count;
}

export type DetectedGesture = "open_palm" | "fist" | "none";

export function detectGesture(landmarks: NormalizedLandmark[]): DetectedGesture {
  const extendedCount = countExtendedFingers(landmarks);
  
  if (extendedCount === 5) return "open_palm";
  if (extendedCount === 0) return "fist";
  
  return "none";
}