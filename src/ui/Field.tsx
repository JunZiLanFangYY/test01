import { Icon } from "./Icon";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}

export function NumberField({ label, value, onChange, step = 1, min, max, unit }: NumberFieldProps) {
  return (
    <label className="flex items-center justify-between gap-2 px-2 py-1.5 bg-surface-container hover:bg-surface-container-high transition-colors">
      <span className="flex-1 truncate text-body-md text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
          className="tabular w-20 rounded-sm border border-outline-variant/30 bg-surface-dim px-2 py-1 text-right text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {unit && <span className="w-8 text-right text-label-sm uppercase text-on-surface-variant">{unit}</span>}
      </div>
    </label>
  );
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
  return (
    <label className="flex items-center justify-between gap-2 px-2 py-1.5 bg-surface-container hover:bg-surface-container-high transition-colors">
      <span className="flex-1 truncate text-body-md text-on-surface-variant">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-28 rounded-sm border border-outline-variant/30 bg-surface-dim px-2 py-1 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CheckboxField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 px-2 py-1.5 bg-surface-container hover:bg-surface-container-high transition-colors">
      <span className="flex-1 truncate text-body-md text-on-surface-variant">{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-primary"
      />
    </label>
  );
}

export function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1 text-label-sm uppercase tracking-wider text-on-surface-variant">
        {icon && <Icon name={icon} size={14} />}
        <span>{title}</span>
      </h4>
      <div className="overflow-hidden rounded border border-outline-variant/20 divide-y divide-outline-variant/10">
        {children}
      </div>
    </div>
  );
}
