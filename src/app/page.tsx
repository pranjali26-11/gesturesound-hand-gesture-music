import Link from "next/link";
import { Music, Drum, Hand, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-neon-blue/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-neon-pink/10 blur-3xl"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8 max-w-4xl w-full">
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neon-purple via-neon-pink to-neon-blue opacity-75 blur transition duration-1000 group-hover:opacity-100 animate-pulse"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-card border border-border/50 shadow-2xl">
              <Hand className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-neon-blue">
            GestureSound
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            Transform your hand movements into beautiful music using AI-powered gesture recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/piano" className="group relative w-full">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple opacity-50 blur transition duration-500 group-hover:opacity-100"></div>
            <div className="relative flex h-64 flex-col items-center justify-center gap-4 rounded-xl bg-card p-8 transition-all duration-300 hover:bg-card/80 border border-border/50">
              <div className="rounded-full bg-secondary p-4 group-hover:scale-110 transition-transform duration-300">
                <Music className="h-12 w-12 text-neon-blue" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Piano</h2>
                <p className="text-muted-foreground mt-2">Control pitch with finger gestures</p>
              </div>
            </div>
          </Link>

          <Link href="/tabla" className="group relative w-full">
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple opacity-50 blur transition duration-500 group-hover:opacity-100"></div>
            <div className="relative flex h-64 flex-col items-center justify-center gap-4 rounded-xl bg-card p-8 transition-all duration-300 hover:bg-card/80 border border-border/50">
              <div className="rounded-full bg-secondary p-4 group-hover:scale-110 transition-transform duration-300">
                <Drum className="h-12 w-12 text-neon-pink" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Tabla</h2>
                <p className="text-muted-foreground mt-2">Trigger beats with palm strikes</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span>Powered by MediaPipe & Howler.js</span>
        </div>
      </div>
    </div>
  );
}