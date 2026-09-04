import { Input } from "@/components/ui/input";

/** A labelled dollars field with a $ prefix; the value is the dollar string the user types. */
const MoneyInput = ({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) => (
  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
    <label htmlFor={id} className="text-[13px] font-medium">
      {label}
    </label>
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="pl-7"
      />
    </div>
  </div>
);

export default MoneyInput;
