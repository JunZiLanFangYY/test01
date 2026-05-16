import { useBeamStore } from '../store/useBeamStore';
import type { ConcreteGrade, SeismicLevel, SteelGrade } from '../types';

const concreteGrades: ConcreteGrade[] = ['C25', 'C30', 'C35', 'C40', 'C45', 'C50'];
const steelGrades: SteelGrade[] = ['HPB300', 'HRB400', 'HRB500'];
const seismicLevels: SeismicLevel[] = ['一级', '二级', '三级', '四级', '非抗震'];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex items-center justify-between gap-2 py-1 text-sm">
      <span className="text-slate-300 shrink-0">
        {label}
        {hint && <span className="ml-1 text-xs text-slate-500">({hint})</span>}
      </span>
      <div className="flex-1 max-w-[60%]">{children}</div>
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      className="w-full rounded bg-slate-800 px-2 py-1 text-right tabular-nums outline-none ring-1 ring-slate-700 focus:ring-sky-500"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!Number.isNaN(v)) onChange(v);
      }}
    />
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
}) {
  return (
    <select
      className="w-full rounded bg-slate-800 px-2 py-1 outline-none ring-1 ring-slate-700 focus:ring-sky-500"
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group rounded-md bg-slate-800/40 ring-1 ring-slate-700">
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-slate-200">
        {title}
      </summary>
      <div className="px-3 pb-3 pt-1 space-y-1">{children}</div>
    </details>
  );
}

export default function ParamPanel() {
  const {
    params,
    setSection,
    setParams,
    setTopThrough,
    setBottomThrough,
    setStirrup,
    setSpanCount,
    setSpanLn,
    reset,
  } = useBeamStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-base font-semibold">参数面板</h2>
        <button
          className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
          onClick={reset}
        >
          重置
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <Group title="几何 / 跨数">
          <Field label="跨数 n">
            <NumberInput
              value={params.spans.length}
              onChange={(v) => setSpanCount(Math.max(1, Math.min(8, Math.round(v))))}
              min={1}
              max={8}
            />
          </Field>
          {params.spans.map((sp, i) => (
            <Field key={i} label={`第 ${i + 1} 跨净跨 Ln`} hint="mm">
              <NumberInput
                value={sp.Ln}
                step={100}
                min={1000}
                onChange={(v) => setSpanLn(i, v)}
              />
            </Field>
          ))}
          <Field label="支座宽 hc" hint="mm">
            <NumberInput
              value={params.supportWidth}
              step={50}
              min={200}
              onChange={(v) => setParams({ supportWidth: v })}
            />
          </Field>
          <Field label="截面宽 b" hint="mm">
            <NumberInput
              value={params.section.b}
              step={50}
              min={150}
              onChange={(v) => setSection({ b: v })}
            />
          </Field>
          <Field label="截面高 h" hint="mm">
            <NumberInput
              value={params.section.h}
              step={50}
              min={250}
              onChange={(v) => setSection({ h: v })}
            />
          </Field>
          <Field label="保护层 c" hint="mm">
            <NumberInput
              value={params.cover}
              step={5}
              min={15}
              max={50}
              onChange={(v) => setParams({ cover: v })}
            />
          </Field>
        </Group>

        <Group title="材料 / 抗震">
          <Field label="混凝土等级">
            <Select
              value={params.concreteGrade}
              onChange={(v) => setParams({ concreteGrade: v })}
              options={concreteGrades}
            />
          </Field>
          <Field label="抗震等级">
            <Select
              value={params.seismicLevel}
              onChange={(v) => setParams({ seismicLevel: v })}
              options={seismicLevels}
            />
          </Field>
        </Group>

        <Group title="上部通长筋">
          <Field label="根数">
            <NumberInput
              value={params.topThrough.count}
              min={2}
              max={10}
              onChange={(v) => setTopThrough({ count: Math.max(2, Math.round(v)) })}
            />
          </Field>
          <Field label="直径 d" hint="mm">
            <NumberInput
              value={params.topThrough.diameter}
              step={1}
              min={12}
              max={32}
              onChange={(v) => setTopThrough({ diameter: v })}
            />
          </Field>
          <Field label="等级">
            <Select
              value={params.topThrough.grade}
              onChange={(v) => setTopThrough({ grade: v })}
              options={steelGrades}
            />
          </Field>
        </Group>

        <Group title="下部通长筋">
          <Field label="根数">
            <NumberInput
              value={params.bottomThrough.count}
              min={2}
              max={10}
              onChange={(v) => setBottomThrough({ count: Math.max(2, Math.round(v)) })}
            />
          </Field>
          <Field label="直径 d" hint="mm">
            <NumberInput
              value={params.bottomThrough.diameter}
              step={1}
              min={12}
              max={32}
              onChange={(v) => setBottomThrough({ diameter: v })}
            />
          </Field>
          <Field label="等级">
            <Select
              value={params.bottomThrough.grade}
              onChange={(v) => setBottomThrough({ grade: v })}
              options={steelGrades}
            />
          </Field>
        </Group>

        <Group title="箍筋（M4 接入加密区）">
          <Field label="肢数">
            <NumberInput
              value={params.stirrup.legs}
              min={2}
              max={6}
              onChange={(v) => setStirrup({ legs: Math.max(2, Math.round(v)) })}
            />
          </Field>
          <Field label="直径 d" hint="mm">
            <NumberInput
              value={params.stirrup.diameter}
              min={6}
              max={14}
              onChange={(v) => setStirrup({ diameter: v })}
            />
          </Field>
          <Field label="加密间距" hint="mm">
            <NumberInput
              value={params.stirrup.sDense}
              step={10}
              min={50}
              onChange={(v) => setStirrup({ sDense: v })}
            />
          </Field>
          <Field label="非加密间距" hint="mm">
            <NumberInput
              value={params.stirrup.sNormal}
              step={10}
              min={100}
              onChange={(v) => setStirrup({ sNormal: v })}
            />
          </Field>
        </Group>
      </div>
    </div>
  );
}
