import { useModelStore } from "@/store/useModelStore";
import { CheckboxField, NumberField, Section, SelectField } from "./Field";

const CONCRETE = ["C25", "C30", "C35", "C40", "C45", "C50"] as const;
const REBAR = ["HPB300", "HRB400", "HRB500", "HRBF400", "HRBF500"] as const;
const SEISMIC = ["非抗震", "一级", "二级", "三级", "四级"] as const;

export function PanelColumn() {
  const p = useModelStore((s) => s.column);
  const u = useModelStore((s) => s.updateColumn);
  return (
    <>
      <Section title="截面 Section" icon="straighten">
        <NumberField label="b 宽" value={p.b} onChange={(v) => u({ b: v })} step={50} unit="mm" />
        <NumberField label="h 高" value={p.h} onChange={(v) => u({ h: v })} step={50} unit="mm" />
        <NumberField label="净高 Hn" value={p.Hn} onChange={(v) => u({ Hn: v })} step={100} unit="mm" />
        <NumberField label="保护层" value={p.cover} onChange={(v) => u({ cover: v })} unit="mm" />
      </Section>
      <Section title="纵筋 Longitudinal" icon="grid_4x4">
        <NumberField label="b 边根数" value={p.nx} onChange={(v) => u({ nx: Math.max(2, v | 0) })} />
        <NumberField label="h 边根数" value={p.nz} onChange={(v) => u({ nz: Math.max(2, v | 0) })} />
        <NumberField label="直径 d" value={p.longitudinalDiameter} onChange={(v) => u({ longitudinalDiameter: v })} unit="mm" />
        <SelectField label="级别" value={p.longitudinalGrade} options={REBAR} onChange={(v) => u({ longitudinalGrade: v })} />
      </Section>
      <Section title="箍筋 Stirrups" icon="crop_square">
        <NumberField label="直径" value={p.stirrupDiameter} onChange={(v) => u({ stirrupDiameter: v })} unit="mm" />
        <SelectField label="级别" value={p.stirrupGrade} options={REBAR} onChange={(v) => u({ stirrupGrade: v })} />
        <NumberField label="加密区间距" value={p.stirrupSpacingEnc} onChange={(v) => u({ stirrupSpacingEnc: v })} unit="mm" />
        <NumberField label="非加密间距" value={p.stirrupSpacing} onChange={(v) => u({ stirrupSpacing: v })} unit="mm" />
      </Section>
      <Section title="材料 Material" icon="science">
        <SelectField label="混凝土" value={p.concrete} options={CONCRETE} onChange={(v) => u({ concrete: v })} />
        <SelectField label="抗震等级" value={p.seismic} options={SEISMIC} onChange={(v) => u({ seismic: v })} />
        <CheckboxField label="首层 (柱根锚固)" value={p.isGroundFloor} onChange={(v) => u({ isGroundFloor: v })} />
      </Section>
    </>
  );
}
