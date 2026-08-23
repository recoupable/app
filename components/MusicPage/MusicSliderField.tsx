"use client";

import { Eraser } from "lucide-react";
import MusicFieldLabel from "./MusicFieldLabel";

export interface MusicSliderFieldProps {
  id: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  value: number;
  defaultValue: number;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}

/**
 * A labelled range input with a reset-to-default button, mirroring the fal
 * playground's Additional Settings controls.
 *
 * A native `input[type=range]` rather than a Radix slider: it is keyboard and
 * screen-reader accessible out of the box, and adding a dependency for one
 * control would not earn its weight.
 */
const MusicSliderField = ({
  id,
  label,
  hint,
  min,
  max,
  step,
  value,
  defaultValue,
  format,
  onChange,
}: MusicSliderFieldProps) => {
  const isDefault = value === defaultValue;

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <MusicFieldLabel htmlFor={id} label={label} hint={hint} />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground">
            {format ? format(value) : value}
          </span>
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            disabled={isDefault}
            aria-label={`Reset ${label} to default`}
            className="inline-flex items-center justify-center size-9 rounded-xl border hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <Eraser className="size-4" />
          </button>
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-foreground"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
};

export default MusicSliderField;
