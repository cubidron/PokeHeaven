import React from "react";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const spinnerStyle: React.CSSProperties = {
  color: "var(--c1)",
  boxSizing: "border-box",
  width: "44px",
  height: "44px",
  padding: "3px",
  overflow: "visible",
};

const circleStyle: React.CSSProperties = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "12px",
  strokeLinecap: "round",
  transformOrigin: "center",
  strokeDasharray: "0 314.159%", // Initial value to hide the circle
  strokeDashoffset: "0%", // Initial value to hide the circle
};

const Spinner: React.FC<SpinnerProps> = ({ className, ...props }) => {
  return (
    <svg {...props} style={spinnerStyle} className={`spinner ${className}`}>
      <circle cx="50%" cy="50%" r="50%" style={circleStyle}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-90;810"
          keyTimes="0;1"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0%;0%;-157.080%"
          calcMode="spline"
          keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0"
          keyTimes="0;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0% 314.159%;157.080% 157.080%;0% 314.159%"
          calcMode="spline"
          keySplines="0.61, 1, 0.88, 1; 0.12, 0, 0.39, 0"
          keyTimes="0;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export default React.memo(Spinner);
