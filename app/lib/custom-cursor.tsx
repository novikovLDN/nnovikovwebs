"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);
  const visible = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
        if (ringRef.current) ringRef.current.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visible.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest("a, button, [role='button'], .card, .tag, input, textarea");
      hovering.current = isInteractive;
      dotRef.current?.classList.toggle("hovering", isInteractive);
      ringRef.current?.classList.toggle("hovering", isInteractive);
    };

    let rafId: number;
    let running = true;
    const animate = () => {
      if (!running) return;
      dotPos.current.x += (mouse.current.x - dotPos.current.x) * 0.18;
      dotPos.current.y += (mouse.current.y - dotPos.current.y) * 0.18;
      ringPos.current.x += (mouse.current.x - ringPos.current.x) * 0.08;
      ringPos.current.y += (mouse.current.y - ringPos.current.y) * 0.08;

      if (dotRef.current) {
        const dw = hovering.current ? 7 : 4;
        dotRef.current.style.transform = `translate3d(${dotPos.current.x - dw}px, ${dotPos.current.y - dw}px, 0)`;
      }
      if (ringRef.current) {
        const rw = hovering.current ? 30 : 20;
        ringRef.current.style.transform = `translate3d(${ringPos.current.x - rw}px, ${ringPos.current.y - rw}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    rafId = requestAnimationFrame(animate);

    return () => {
      running = false;
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} />
    </>
  );
}
