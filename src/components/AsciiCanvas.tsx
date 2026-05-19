"use client";

import React, { useEffect, useRef } from "react";

const ASCII_TEXT = `██████╗ ██╗      ██████╗  ██████╗
██╔══██╗██║     ██╔═══██╗██╔════╝
██████╔╝██║     ██║   ██║██║     
██╔══██╗██║     ██║   ██║██║     
██████╔╝███████╗╚██████╔╝╚██████╗
╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝`;

export const AsciiCanvas = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawnRef = useRef(false);

  useEffect(() => {
    if (drawnRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lines = ASCII_TEXT.split("\n");
    const charWidth = 10;
    const charHeight = 20;
    
    // Scale for high DPI
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = lines[0].length * charWidth;
    const logicalHeight = lines.length * charHeight;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    
    ctx.scale(dpr, dpr);
    
    // Clear and set background transparency
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    
    // Set text style
    ctx.font = "18px 'Courier New', Courier, monospace";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Draw with a subtle glow
    ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "white";

    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        ctx.fillText(line[x], x * charWidth, y * charHeight);
      }
    });

    // Add a second pass for sharpness without glow
    ctx.shadowBlur = 0;
    lines.forEach((line, y) => {
      for (let x = 0; x < line.length; x++) {
        ctx.fillText(line[x], x * charWidth, y * charHeight);
      }
    });

    drawnRef.current = true;
  }, []);

  return (
    <div className="relative flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="opacity-90 grayscale contrast-125 border-none outline-none block" 
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
});

AsciiCanvas.displayName = "AsciiCanvas";
