import { motion } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

export function InputRange(props: {
  max: number;
  min: number;
  value: number;
  title: string;
  className?: string;
  icon?: ReactNode;
  onChange: (val: number) => void;
}) {
  const [value, setValue] = useState(props.value || props.min);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  return (
    <>
      <span
        className={`relative flex h-6.5 overflow-hidden rounded-full bg-white/5 w-48 ${props.className}`}>
        <span className=" absolute left-1 h-6.5 grid place-items-center pointer-events-none">
          {props.icon}
        </span>
        <motion.div
          className="size-6.5 relative"
          animate={{
            marginLeft: `calc(${
              ((value - props.min) / (props.max - props.min)) * 100
            }% - ${
              ((value - props.min) / (props.max - props.min)) *
              (document.getElementById("rangeThumbehe")?.clientWidth ?? 20)
            }px)`,
          }}
          transition={{
            type: "tween",
            duration: isDragging ? 0 : 0.2,
          }}>
          <div className="w-[100vw] rounded-full h-6.5 absolute right-0 bg-primary" />
          <div
            id="rangeThumbehe"
            className="bg-white shadow-left size-6 rounded-full absolute top-0.25 right-0.25"
          />
        </motion.div>
        <input
          className="size-full opacity-0 absolute inset-0 bg-black"
          type="range"
          value={value}
          onMouseDown={() => {
            // start a timer: if mouse is held for 200ms, consider it a drag
            const timer = setTimeout(() => {
              setIsDragging(true);
            }, 200);
            // when mouse is released, clear timer and reset dragging state
            const onMouseUp = () => {
              clearTimeout(timer);
              setIsDragging(false);
              document.removeEventListener("mouseup", onMouseUp);
            };
            document.addEventListener("mouseup", onMouseUp);
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.valueAsNumber;
            setValue(newValue);
            props.onChange(newValue);
          }}
          name=""
          min={props.min}
          max={props.max}
          id=""
          title={props.title}
        />
      </span>
    </>
  );
}
