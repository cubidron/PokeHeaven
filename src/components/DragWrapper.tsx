import React, { useRef, ReactNode } from "react";

export default function DragWrapper({
  rootClass = "",
  children,
}: {
  rootClass?: string;
  children: ReactNode;
}) {
  const sliderRef = useRef<HTMLElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    const slider = sliderRef.current;
    if (!slider) return;

    slider.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    scrollLeft.current = slider.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !sliderRef.current) return;
    e.preventDefault();

    const x = e.clientX;
    const walk = (x - startX.current) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    sliderRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`${rootClass} w-full`}>
      {React.cloneElement(children as React.ReactElement, {
        ref: sliderRef,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        style: {
          cursor: isDragging.current ? "grabbing" : "grab",
          userSelect: "none",
        },
      })}
    </div>
  );
}
