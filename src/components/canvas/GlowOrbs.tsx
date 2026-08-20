import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

interface GlowOrbsProps {
    isDark?: boolean;
}

export function GlowOrbs({ isDark = true }: GlowOrbsProps) {
    const orb1Ref = useRef<THREE.Mesh>(null!);
    const orb2Ref = useRef<THREE.Mesh>(null!);
    const orb3Ref = useRef<THREE.Mesh>(null!);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (orb1Ref.current) {
            orb1Ref.current.position.x = Math.sin(t * 0.3) * 3 - 4;
            orb1Ref.current.position.y = Math.cos(t * 0.4) * 1.5 + 0.5;
        }
        if (orb2Ref.current) {
            orb2Ref.current.position.x = Math.cos(t * 0.25) * 3.5 + 4;
            orb2Ref.current.position.y = Math.sin(t * 0.35) * 1.2 - 0.5;
        }
        if (orb3Ref.current) {
            orb3Ref.current.position.x = Math.sin(t * 0.2) * 2;
            orb3Ref.current.position.y = Math.cos(t * 0.2) * 1.8 - 1;
        }
    });

    return (
        <group>
            {/* 蓝色光晕球 */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
                <mesh ref={orb1Ref} position={[-4, 1, -3]}>
                    <sphereGeometry args={[2.5, 32, 32]} />
                    <meshBasicMaterial
                        color={isDark ? "#0071e3" : "#38bdf8"}
                        transparent
                        opacity={isDark ? 0.12 : 0.06}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </Float>

            {/* 紫色霓虹光晕球 */}
            <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.8}>
                <mesh ref={orb2Ref} position={[4, -1, -4]}>
                    <sphereGeometry args={[3, 32, 32]} />
                    <meshBasicMaterial
                        color={isDark ? "#bf5af2" : "#a855f7"}
                        transparent
                        opacity={isDark ? 0.1 : 0.05}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </Float>

            {/* 青色微光球 */}
            <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.2}>
                <mesh ref={orb3Ref} position={[0, -1.5, -2]}>
                    <sphereGeometry args={[2.2, 32, 32]} />
                    <meshBasicMaterial
                        color={isDark ? "#00f2fe" : "#0ea5e9"}
                        transparent
                        opacity={isDark ? 0.08 : 0.04}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>
            </Float>
        </group>
    );
}
