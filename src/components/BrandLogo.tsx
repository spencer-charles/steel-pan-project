"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl"
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <h1 className={cn(
          "font-black tracking-tighter text-primary uppercase leading-[0.8]",
          sizeClasses[size]
        )}>
          Sonic<br />Horizon
        </h1>
        <div className={cn(
          "bg-primary-container rounded-full absolute -right-2 top-0",
          size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-4 h-4"
        )} />
      </div>
      <div className={cn(
        "h-1 bg-primary/20 mt-2 rounded-full",
        size === "sm" ? "w-8" : size === "md" ? "w-12" : "w-32"
      )} />
    </div>
  );
}
