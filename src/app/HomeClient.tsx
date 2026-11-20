"use client";

import "./home/landing.css";
import Hero from "./home/Hero";
import Journeys from "./home/Journeys";
import Join from "./home/Join";
import StageReel from "./home/StageReel";
import Timeline from "./home/Timeline";

export default function HomeClient({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="ld">
      <Hero />
      <StageReel />
      <Timeline />
      <Journeys signedIn={signedIn} />
      <Join signedIn={signedIn} />
    </div>
  );
}
