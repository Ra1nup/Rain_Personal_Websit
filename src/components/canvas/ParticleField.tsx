import React, { useMemo, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface NebulaBackgroundProps {
    isDark?: boolean;
}

export function ParticleField({ isDark = true }: NebulaBackgroundProps) {
    const nebulaRef = useRef<THREE.Points>(null!);
    const starsRef = useRef<THREE.Points>(null!);
    const { viewport } = useThree();

    // 鼠标动力学追踪
    const mouse = useRef({
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
    });

    // ============================================================
    // 1. 无规则流体星云粒子系统 (Organic Multi-Cluster Fluid Nebula)
    // ============================================================
    const nebulaCount = 650;

    const {
        nebulaPositions,
        nebulaBasePositions,
        nebulaColors,
        nebulaParams,
        nebulaOffsets,
    } = useMemo(() => {
        const pos = new Float32Array(nebulaCount * 3);
        const basePos = new Float32Array(nebulaCount * 3);
        const col = new Float32Array(nebulaCount * 3);
        const params = new Float32Array(nebulaCount * 3); // [clusterIdx, speed, phase]
        const offsets = new Float32Array(nebulaCount * 3); // 3D 独特无规则扰动偏移

        // 黑夜模式色彩：深海电光蓝、皇家紫罗兰、暗夜青与电光紫
        const darkClusters = [
            { x: -4.5, y: 1.8, z: -2.0, colorStart: "#1d4ed8", colorEnd: "#6d28d9" }, // 左上
            { x: 4.2, y: -1.6, z: -1.8, colorStart: "#581c87", colorEnd: "#0284c7" }, // 右下
            { x: 4.6, y: 2.0, z: -2.5, colorStart: "#1e40af", colorEnd: "#7e22ce" },  // 右上
            { x: -4.0, y: -1.8, z: -2.2, colorStart: "#0369a1", colorEnd: "#3b82f6" }, // 左下
        ];

        // 白天模式色彩：高饱和明艳水彩蓝紫流体
        const lightClusters = [
            { x: -4.5, y: 1.8, z: -2.0, colorStart: "#2563eb", colorEnd: "#7c3aed" }, // 左上
            { x: 4.2, y: -1.6, z: -1.8, colorStart: "#8b5cf6", colorEnd: "#06b6d4" }, // 右下
            { x: 4.6, y: 2.0, z: -2.5, colorStart: "#0284c7", colorEnd: "#9333ea" },  // 右上
            { x: -4.0, y: -1.8, z: -2.2, colorStart: "#0ea5e9", colorEnd: "#4f46e5" }, // 左下
        ];

        const activeClusters = isDark ? darkClusters : lightClusters;

        for (let i = 0; i < nebulaCount; i++) {
            const i3 = i * 3;
            const clusterIdx = Math.floor(Math.random() * activeClusters.length);
            const cluster = activeClusters[clusterIdx];

            // 围绕星云核心扩散
            const spread = 2.6 + Math.random() * 2.8;
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.pow(Math.random(), 0.65) * spread;

            let x = cluster.x + Math.cos(angle) * dist * 1.5;
            let y = cluster.y + Math.sin(angle) * dist * 0.95;
            const z = cluster.z + (Math.random() - 0.5) * 2.4;

            // 柔和避开绝对中心文字区
            const centerDist = Math.sqrt(x * x + y * y);
            if (centerDist < 1.5) {
                const pushAngle = Math.atan2(y, x);
                x = Math.cos(pushAngle) * (1.5 + Math.random() * 0.6);
                y = Math.sin(pushAngle) * (1.5 + Math.random() * 0.6);
            }

            pos[i3] = x;
            pos[i3 + 1] = y;
            pos[i3 + 2] = z;

            basePos[i3] = x;
            basePos[i3 + 1] = y;
            basePos[i3 + 2] = z;

            // 色彩插值
            const t = Math.random();
            const colorA = new THREE.Color(cluster.colorStart);
            const colorB = new THREE.Color(cluster.colorEnd);
            const finalColor = colorA.lerp(colorB, t);

            col[i3] = finalColor.r;
            col[i3 + 1] = finalColor.g;
            col[i3 + 2] = finalColor.b;

            // 运动特征
            params[i3] = clusterIdx;
            params[i3 + 1] = 0.35 + Math.random() * 0.45; // 流速因子
            params[i3 + 2] = Math.random() * Math.PI * 2; // 随机相位

            // 独特的空间三维无规则扰动种子
            offsets[i3] = Math.random() * 100;
            offsets[i3 + 1] = Math.random() * 100;
            offsets[i3 + 2] = Math.random() * 100;
        }

        return {
            nebulaPositions: pos,
            nebulaBasePositions: basePos,
            nebulaColors: col,
            nebulaParams: params,
            nebulaOffsets: offsets,
        };
    }, [isDark]);

    // ============================================================
    // 2. 少量稀疏星光 (Sparse Starlight)
    // ============================================================
    const starCount = 50;

    const { starPositions, starColors, starPhases } = useMemo(() => {
        const sPos = new Float32Array(starCount * 3);
        const sCol = new Float32Array(starCount * 3);
        const sPhase = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            sPos[i3] = (Math.random() - 0.5) * 22;
            sPos[i3 + 1] = (Math.random() - 0.5) * 14;
            sPos[i3 + 2] = -1.5 - Math.random() * 3.0;

            const c = isDark ? new THREE.Color("#cbd5e1") : new THREE.Color("#2563eb");
            sCol[i3] = c.r;
            sCol[i3 + 1] = c.g;
            sCol[i3 + 2] = c.b;

            sPhase[i] = Math.random() * Math.PI * 2;
        }

        return { starPositions: sPos, starColors: sCol, starPhases: sPhase };
    }, [isDark]);

    // 监听鼠标
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            mouse.current.targetX = x * (viewport.width / 2);
            mouse.current.targetY = y * (viewport.height / 2);
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [viewport]);

    // 动态超柔高斯雾状纹理
    const nebulaTexture = useMemo(() => {
        if (typeof document === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.55)");
            gradient.addColorStop(0.25, "rgba(255, 255, 255, 0.35)");
            gradient.addColorStop(0.55, "rgba(255, 255, 255, 0.12)");
            gradient.addColorStop(0.85, "rgba(255, 255, 255, 0.02)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    const starTexture = useMemo(() => {
        if (typeof document === "undefined") return null;
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
            gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.4)");
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 32, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }, []);

    // ============================================================
    // 3. 灵动无规则流体运动演化 (Lively Organic Fluid Dynamics)
    // ============================================================
    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // 鼠标缓动追踪
        mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.04;
        mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.04;

        const mx = mouse.current.x;
        const my = mouse.current.y;

        if (nebulaRef.current) {
            const posAttr = nebulaRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const pos = posAttr.array as Float32Array;

            // 整个星云系统多轴流体自转与微倾斜 (提速至自然灵动的节奏)
            nebulaRef.current.rotation.y = Math.sin(t * 0.08) * 0.1 + Math.cos(t * 0.04) * 0.05;
            nebulaRef.current.rotation.x = Math.cos(t * 0.06) * 0.06;
            nebulaRef.current.rotation.z = Math.sin(t * 0.05) * 0.05;

            for (let i = 0; i < nebulaCount; i++) {
                const i3 = i * 3;
                const bx = nebulaBasePositions[i3];
                const by = nebulaBasePositions[i3 + 1];
                const bz = nebulaBasePositions[i3 + 2];

                const speed = nebulaParams[i3 + 1];
                const phase = nebulaParams[i3 + 2];

                const ox = nebulaOffsets[i3];
                const oy = nebulaOffsets[i3 + 1];
                const oz = nebulaOffsets[i3 + 2];

                // 提速后的非线性涡流流体时间项 (约提速 70%)
                const timeFactor = t * 0.32 * speed;

                // X 方向流体扰动（大尺度漂移 + 复合中尺度涡流）
                const curlX =
                    Math.sin(by * 0.35 + timeFactor + phase) * 1.5 +
                    Math.cos(bz * 0.25 - t * 0.12 + ox) * 0.9 +
                    Math.sin(t * 0.08 + bx * 0.2) * 0.6;

                // Y 方向流体扰动
                const curlY =
                    Math.cos(bx * 0.3 - timeFactor * 0.85 + phase) * 1.3 +
                    Math.sin(bz * 0.28 + t * 0.14 + oy) * 0.8 +
                    Math.cos(t * 0.1 + by * 0.2) * 0.5;

                // Z 方向景深起伏与呼吸
                const curlZ =
                    Math.sin((bx + by) * 0.25 + timeFactor * 0.7 + oz) * 0.9 +
                    Math.cos(t * 0.12 + phase) * 0.5;

                // 鼠标轻抚扰动 (Fluid Wind Drag)
                const currentCalculatedX = bx + curlX;
                const currentCalculatedY = by + curlY;
                const dx = currentCalculatedX - mx;
                const dy = currentCalculatedY - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const windRadius = 4.0;
                let windX = 0;
                let windY = 0;

                if (dist < windRadius && dist > 0.01) {
                    const force = Math.pow(1 - dist / windRadius, 2) * 0.8;
                    windX = (dx / dist) * force;
                    windY = (dy / dist) * force;
                }

                pos[i3] = currentCalculatedX + windX;
                pos[i3 + 1] = currentCalculatedY + windY;
                pos[i3 + 2] = bz + curlZ;
            }

            posAttr.needsUpdate = true;
        }

        // 零星微光跟随流体慢漂
        if (starsRef.current) {
            const posAttr = starsRef.current.geometry.attributes.position as THREE.BufferAttribute;
            const pos = posAttr.array as Float32Array;
            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const phase = starPhases[i];
                pos[i3] += Math.sin(t * 0.08 + phase) * 0.003;
                pos[i3 + 1] += Math.cos(t * 0.06 + phase) * 0.003;
            }
            posAttr.needsUpdate = true;
        }
    });

    return (
        <group>
            {/* 1. 缓慢无规则流动的雾状星云粒子 */}
            <points ref={nebulaRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[nebulaPositions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[nebulaColors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={isDark ? 5.2 : 5.8}
                    vertexColors
                    map={nebulaTexture || undefined}
                    transparent
                    opacity={isDark ? 0.26 : 0.42}
                    blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
                    depthWrite={false}
                    sizeAttenuation
                />
            </points>

            {/* 2. 少量星光点缀 */}
            <points ref={starsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[starPositions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[starColors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={isDark ? 0.08 : 0.09}
                    vertexColors
                    map={starTexture || undefined}
                    transparent
                    opacity={isDark ? 0.5 : 0.4}
                    blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
                    depthWrite={false}
                    sizeAttenuation
                />
            </points>
        </group>
    );
}
