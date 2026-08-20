import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";

export default function Hero3DCanvas() {
    const [isDark, setIsDark] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
        const checkTheme = () => {
            const isDarkMode = document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        };

        checkTheme();

        const observer = new MutationObserver(() => {
            checkTheme();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
            {/* 多点流体氛围渐变：白天模式色彩更饱满明快，黑夜模式幽深 */}
            <div
                className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${
                    isDark
                        ? "bg-[radial-gradient(ellipse_55%_45%_at_18%_25%,rgba(29,78,216,0.18),transparent_65%),radial-gradient(ellipse_50%_45%_at_82%_75%,rgba(109,40,217,0.15),transparent_65%),radial-gradient(ellipse_45%_40%_at_85%_22%,rgba(30,64,175,0.12),transparent_60%)]"
                        : "bg-[radial-gradient(ellipse_55%_45%_at_18%_25%,rgba(59,130,246,0.22),transparent_65%),radial-gradient(ellipse_50%_45%_at_82%_75%,rgba(168,85,247,0.18),transparent_65%),radial-gradient(ellipse_45%_40%_at_85%_22%,rgba(14,165,233,0.18),transparent_60%),radial-gradient(ellipse_40%_35%_at_15%_80%,rgba(99,102,241,0.14),transparent_55%)]"
                }`}
            />

            <Canvas
                camera={{ position: [0, 0, 8.5], fov: 50 }}
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            >
                <ParticleField isDark={isDark} />
            </Canvas>
        </div>
    );
}
