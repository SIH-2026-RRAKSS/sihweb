import re

file_path = 'src/components/auth/LoginPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update imports
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect, useRef } from 'react';")
content = content.replace("import { motion } from 'framer-motion';", "import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';")

# Find the start of the return statement to inject hooks
hooks = """  // -- Dynamic Spring-Driven Mouse & Autonomous Idle Motion --
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 600);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 3 : 300);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const lastMouseMoveTime = useRef<number>(Date.now());
  const isUserMoving = useRef<boolean>(false);

  // Autonomous Lissajous Drift when mouse is idle
  useEffect(() => {
    let animId: number;
    let startTime = Date.now();
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;

    const animateIdleMotion = () => {
      const now = Date.now();
      if (now - lastMouseMoveTime.current > 2000) {
        isUserMoving.current = false;
      }

      if (!isUserMoving.current) {
        const elapsed = (now - startTime) / 1000;
        const autoX = width / 2 + Math.sin(elapsed * 0.4) * (width * 0.25) + Math.cos(elapsed * 0.2) * 80;
        const autoY = height / 2.5 + Math.cos(elapsed * 0.3) * (height * 0.2) + Math.sin(elapsed * 0.5) * 50;

        mouseX.set(autoX);
        mouseY.set(autoY);
      }

      animId = requestAnimationFrame(animateIdleMotion);
    };

    animId = requestAnimationFrame(animateIdleMotion);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    lastMouseMoveTime.current = Date.now();
    isUserMoving.current = true;
    mouseX.set(clientX);
    mouseY.set(clientY);
  };

  return (
"""
content = re.sub(r'\s*return\s*\(\s*', '\n' + hooks, content, count=1)

# Pattern to find the root div and the background soft pattern
pattern = r'<div className="min-h-screen[^>]*>.*?{/\*\s*Background Soft Pattern\s*\*/}.*?/>'

new_wrapper = """    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500/20 selection:text-orange-600 relative overflow-x-hidden flex flex-col justify-between items-center p-4 sm:p-6 select-none"
    >
      {/* -- HIGH-TECH CYBER GRID LINES & INTERACTIVE SPOTLIGHT -- */}
      
      {/* 1. Base Precision Cyber Grid Lines */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-45"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. Micro Dot Matrix Intersections */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-35"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.16) 1.2px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. DYNAMIC MOUSE-ILLUMINATED GRID BEAM (Grid lines glow directly around cursor) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 85, 0, 0.45) 1.5px, transparent 1.5px),
            linear-gradient(to bottom, rgba(255, 85, 0, 0.45) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
          WebkitMaskImage: useMotionTemplate`radial-gradient(320px circle at ${springX}px ${springY}px, black 20%, transparent 80%)`,
          maskImage: useMotionTemplate`radial-gradient(320px circle at ${springX}px ${springY}px, black 20%, transparent 80%)`,
        }}
      />

      {/* 4. Soft Moving Caustic Spotlight Beam */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(255, 85, 0, 0.12), rgba(56, 189, 248, 0.06) 45%, transparent 75%)`
        }}
      />"""

content = re.sub(pattern, new_wrapper, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Third patch successful!")
