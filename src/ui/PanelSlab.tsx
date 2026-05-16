import { useModelStore } from "@/store/useModelStore";
import { CheckboxField, NumberField, Section, SelectField } from "./Field";

const CONCRETE = ["C25", "C30", "C35", "C40", "C45", "C50"] as const;
const REBAR = ["HPB300", "HRB400", "HRB500", "HRBF400", "HRBF500"] as const;
const SEISMIC = ["非抗震", "一级", "二级", "三级", "四级"] as const;

export function PanelSlab() {
  const p = useModelStore((s) => s.slab);
  const u = useModelStore((s) => s.updateSlab);
  return (
    <>
      <Section title="尺寸 Dimensions" icon="straighten">
        <NumberField label="Lx" value={p.Lx} onChange={(v) => u({ Lx: v })} step={100} unit="mm" />
        <NumberField label="Ly" value={p.Lz} onChange={(v) => u({ Lz: v })} step={100} unit="mm" />
        <NumberField label="厚度" value={p.thickness} onChange={(v) => u({ thickness: v })} step={10} unit="mm" />
        <NumberField label="保护层" value={p.cover} onChange={(v) => u({ cover: v })} unit="mm" />
        <NumberField label="支座宽" value={p.supportWidth} onChange={(v) => u({ supportWidth: v })} unit="mm" />
      </Section>
      <Section title="底筋 X 向" icon="east">
        <NumberField label="直径" value={p.bottomXDiameter} onChange={(v) => u({ bottomXDiameter: v })} unit="mm" />
        <NumberField label="间距" value={p.bottomXSpacing} onChange={(v) => u({ bottomXSpacing: v })} unit="mm" />
        <SelectField label="级别" value={p.bottomXGrade} options={REBAR} onChange={(v) => u({ bottomXGrade: v })} />
      </Section>
      <Section title="底筋 Y 向" icon="north">
        <NumberField label="直径" value={p.bottomZDiameter} onChange={(v) => u({ bottomZDiameter: v })} unit="mm" />
        <NumberField label="间距" value={p.bottomZSpacing} onChange={(v) => u({ bottomZSpacing: v })} unit="mm" />
        <SelectField label="级别" value={p.bottomZGrade} options={REBAR} onChange={(v) => u({ bottomZGrade: v })} />
      </Section>
      <Section title="面筋 Top Layer" icon="layers">
        <CheckboxField label="启用面筋" value={p.topLayer} onChange={(v) => u({ topLayer: v })} />
        <NumberField label="X 直径" value={p.topXDiameter} onChange={(v) => u({ topXDiameter: v })} unit="mm" />
        <NumberField label="X 间距" value={p.topXSpacing} onChange={(v) => u({ topXSpacing: v })} unit="mm" />
        <NumberField label="Y 直径" value={p.topZDiameter} onChange={(v) => u({ topZDiameter: v })} unit="mm" />
        <NumberField label="Y 间距" value={p.topZSpacing} onChange={(v) => u({ topZSpacing: v })} unit="mm" />
      </Section>
      <Section title="材料 Material" icon="science">
        <SelectField label="混凝土" value={p.concrete} options={CONCRETE} onChange={(v) => u({ concrete: v })} />
        <SelectField label="抗震等级" value={p.seismic} options={SEISMIC} onChange={(v) => u({ seismic: v })} />
      </Section>
    </>
  );
}
