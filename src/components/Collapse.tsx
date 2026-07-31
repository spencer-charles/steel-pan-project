"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CollapseProps {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Expand/collapse driven purely by a CSS grid-template-rows transition
 * (0fr → 1fr). Unlike a JS height animation there's no requestAnimationFrame
 * dependency, so the content still reaches its open state even when animations
 * never run — a backgrounded tab, reduced-motion, or a throttled browser.
 *
 * Collapsed content stays mounted, so it's marked inert to keep it out of the
 * tab order and away from screen readers.
 */
export function Collapse({ open, children, className }: CollapseProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className
      )}
    >
      <div className="overflow-hidden min-h-0" inert={!open}>
        {children}
      </div>
    </div>
  );
}
