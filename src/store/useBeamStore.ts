import { create } from 'zustand';
import type { BeamParams, ViewSettings } from '../types';

interface BeamStore {
  params: BeamParams;
  view: ViewSettings;
  setParams: (patch: Partial<BeamParams>) => void;
  setSection: (patch: Partial<BeamParams['section']>) => void;
  setTopThrough: (patch: Partial<BeamParams['topThrough']>) => void;
  setBottomThrough: (patch: Partial<BeamParams['bottomThrough']>) => void;
  setStirrup: (patch: Partial<BeamParams['stirrup']>) => void;
  setSpanCount: (n: number) => void;
  setSpanLn: (i: number, Ln: number) => void;
  setView: (patch: Partial<ViewSettings>) => void;
  reset: () => void;
}

const defaultParams: BeamParams = {
  section: { b: 300, h: 600 },
  spans: [{ Ln: 6000 }, { Ln: 6000 }],
  supportWidth: 600,
  cover: 25,
  concreteGrade: 'C30',
  seismicLevel: '二级',
  topThrough: { count: 2, diameter: 25, grade: 'HRB400' },
  bottomThrough: { count: 4, diameter: 22, grade: 'HRB400' },
  stirrup: { legs: 4, diameter: 10, grade: 'HRB400', sDense: 100, sNormal: 200 },
};

const defaultView: ViewSettings = {
  concreteOpacity: 0.35,
  showRebar: true,
  wireframe: false,
};

export const useBeamStore = create<BeamStore>((set) => ({
  params: defaultParams,
  view: defaultView,
  setParams: (patch) => set((s) => ({ params: { ...s.params, ...patch } })),
  setSection: (patch) =>
    set((s) => ({ params: { ...s.params, section: { ...s.params.section, ...patch } } })),
  setTopThrough: (patch) =>
    set((s) => ({ params: { ...s.params, topThrough: { ...s.params.topThrough, ...patch } } })),
  setBottomThrough: (patch) =>
    set((s) => ({
      params: { ...s.params, bottomThrough: { ...s.params.bottomThrough, ...patch } },
    })),
  setStirrup: (patch) =>
    set((s) => ({ params: { ...s.params, stirrup: { ...s.params.stirrup, ...patch } } })),
  setSpanCount: (n) =>
    set((s) => {
      const spans = [...s.params.spans];
      while (spans.length < n) spans.push({ Ln: 6000 });
      while (spans.length > n) spans.pop();
      return { params: { ...s.params, spans } };
    }),
  setSpanLn: (i, Ln) =>
    set((s) => {
      const spans = s.params.spans.map((sp, idx) => (idx === i ? { Ln } : sp));
      return { params: { ...s.params, spans } };
    }),
  setView: (patch) => set((s) => ({ view: { ...s.view, ...patch } })),
  reset: () => set({ params: defaultParams, view: defaultView }),
}));
