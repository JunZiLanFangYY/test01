import type { BeamParams } from '../../types';
import { anchorageLength } from './tables';

export interface EndAnchorage {
  /** 是否需要弯锚（直锚不够长） */
  bent: boolean;
  /** 直段水平长度 (mm)，从支座外边算起伸入支座的长度（含 0.4 laE 或全直锚 laE） */
  horizontalIntoSupport: number;
  /** 弯钩竖直段长度 (mm)，弯钩 15d；若不需要弯锚则为 0 */
  hookLength: number;
}

/**
 * 端支座锚固判定（22G101-1 端支座节点）：
 *  - 若支座宽 hc - cover ≥ laE，则直锚（直段 = laE）
 *  - 否则弯锚：直段 = max(0.4 laE, hc - cover)，弯钩 15d 竖向
 *
 * 中间支座：贯通即可，本函数不处理。
 */
export function endSupportAnchorage(args: {
  d: number;
  grade: BeamParams['topThrough']['grade'];
  concrete: BeamParams['concreteGrade'];
  seismic: BeamParams['seismicLevel'];
  /** 支座宽 hc */
  hc: number;
  cover: number;
}): EndAnchorage {
  const { d, grade, concrete, seismic, hc, cover } = args;
  const laE = anchorageLength({ grade, diameter: d, concrete, seismic });
  const available = hc - cover;
  if (available >= laE) {
    return { bent: false, horizontalIntoSupport: laE, hookLength: 0 };
  }
  return {
    bent: true,
    horizontalIntoSupport: Math.max(0.4 * laE, available),
    hookLength: 15 * d,
  };
}
