interface UpgradeMeterProps {
  /** Fill from 0 to 1. */
  ratio: number;
  label: string;
}

/** The 6px balance meter under the prompt's headline. */
const UpgradeMeter = ({ ratio, label }: UpgradeMeterProps) => {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className="h-1.5 w-full overflow-hidden rounded-full bg-border"
    >
      <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
    </div>
  );
};

export default UpgradeMeter;
