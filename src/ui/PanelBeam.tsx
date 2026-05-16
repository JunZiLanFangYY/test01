import { useModelStore } from "@/store/useModelStore";
import { CheckboxField, NumberField, Section, SelectField } from "./Field";

const CONCRETE = ["C25", "C30", "C35", "C40", "C45", "C50"] as const;
const REBAR = ["HPB300", "HRB400", "HRB500", "HRBF400", "HRBF500"] as const;
const SEISMIC = ["非抗震", "一级", "二级", "三级", "四级"] as const;
const SIDE_BAR_MODE = ["auto", "manual", "none"] as const;

export function PanelBeam() {
  const p = useModelStore((s) => s.beam);
  const u = useModelStore((s) => s.updateBeam);
  return (
    <>
      <Section title="截面 Section" icon="straighten">
        <NumberField label="b 宽" value={p.b} onChange={(v) => u({ b: v })} step={50} unit="mm" />
        <NumberField label="h 高" value={p.h} onChange={(v) => u({ h: v })} step={50} unit="mm" />
        <NumberField label="净跨 Ln" value={p.Ln} onChange={(v) => u({ Ln: v })} step={100} unit="mm" />
        <NumberField label="保护层" value={p.cover} onChange={(v) => u({ cover: v })} unit="mm" />
      </Section>
      <Section title="上部通长筋" icon="north">
        <NumberField label="根数" value={p.topCount} onChange={(v) => u({ topCount: Math.max(2, v | 0) })} />
        <NumberField label="直径" value={p.topDiameter} onChange={(v) => u({ topDiameter: v })} unit="mm" />
        <SelectField label="级别" value={p.topGrade} options={REBAR} onChange={(v) => u({ topGrade: v })} />
      </Section>
      <Section title="下部纵筋" icon="south">
        <NumberField label="根数" value={p.bottomCount} onChange={(v) => u({ bottomCount: Math.max(2, v | 0) })} />
        <NumberField label="直径" value={p.bottomDiameter} onChange={(v) => u({ bottomDiameter: v })} unit="mm" />
        <SelectField label="级别" value={p.bottomGrade} options={REBAR} onChange={(v) => u({ bottomGrade: v })} />
      </Section>
      <Section title="腰筋 Side Bars" icon="swap_horiz">
        <SelectField label="模式" value={p.sideBarMode} options={SIDE_BAR_MODE} onChange={(v) => u({ sideBarMode: v })} />
        <NumberField label="根数" value={p.sideBarCountPerSide} onChange={(v) => u({ sideBarCountPerSide: Math.max(0, v | 0) })} />
        <NumberField label="直径" value={p.sideBarDiameter} onChange={(v) => u({ sideBarDiameter: v })} unit="mm" />
        <SelectField label="级别" value={p.sideBarGrade} options={REBAR} onChange={(v) => u({ sideBarGrade: v })} />
        <CheckboxField label="生成拉筋" value={p.tieEnabled} onChange={(v) => u({ tieEnabled: v })} />
        <NumberField label="拉筋直径" value={p.tieDiameter ?? (p.b <= 350 ? 6 : 8)} onChange={(v) => u({ tieDiameter: v })} unit="mm" />
        <NumberField label="拉筋间距" value={p.tieSpacing ?? p.stirrupSpacing * 2} onChange={(v) => u({ tieSpacing: v })} unit="mm" />
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
      </Section>
    </>
  );
}
