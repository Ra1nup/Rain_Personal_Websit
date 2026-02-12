import React from "react";
import { BackgroundBeamsWithCollision } from "./ui/background-beams-with-collision";

export function BackgroundBeamsWithCollisionDemo() {
  return (
    <BackgroundBeamsWithCollision>
      <h2
        style={{
          fontSize: "clamp(2rem, 8vw, 6rem)",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          backgroundImage: "linear-gradient(135deg, #0071e3 0%, #bf5af2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
          padding: "0 1rem",
          textAlign: "center",
          lineHeight: 1.2,
          paddingBottom: "0.2em",
        }}
        className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center font-sans tracking-tight dark:bg-[linear-gradient(135deg,#2997ff_0%,#d488ff_100%)] dark:bg-clip-text dark:text-transparent"
      >
        Welcome to my portfolio.
      </h2>
    </BackgroundBeamsWithCollision>
  );
}
