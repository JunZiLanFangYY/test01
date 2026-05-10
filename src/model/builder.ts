import type { BeamModel, BeamParams, RebarLine, StirrupSet } from '../types';
import { denseZoneLength, placeAllStirrups, splitSpanIntoStirrupRanges } from '../codes/22g101/stirrup';
import { endSupportAnchorage } from '../codes/22g101/anchorage';

/**
 * 由用户参数构建中性数据模型 BeamModel。
 *
 * 坐标约定（毫米）：
 *  - 梁轴沿 +X 方向
 *  - 截面 b 对应 Z 方向
 *  - 截面 h 对应 Y 方向（向上为 +Y）
 *  - 起点 X=0 在最左支座外边
 *
 * M3 起步：
 *  - 上部通长筋：跨越全长（暂不画弯锚，M5 完善锚固）
 *  - 下部通长筋：跨越全长
 *  - 钢筋在保护层 + 箍筋直径 + 自身半径 处定位
 */
export function buildBeamModel(params: BeamParams): BeamModel {
  const n = params.spans.length;
  const hc = params.supportWidth;
  const totalLength = params.spans.reduce((s, sp) => s + sp.Ln, 0) + (n + 1) * hc;

  // 支座中心 X
  const supportCenters: number[] = [];
  let cursor = hc / 2;
  supportCenters.push(cursor);
  for (let i = 0; i < n; i++) {
    cursor += hc / 2 + params.spans[i].Ln + hc / 2;
    supportCenters.push(cursor);
  }

  const rebars: RebarLine[] = [];
  rebars.push(...buildLongitudinal(params, totalLength, 'top'));
  rebars.push(...buildLongitudinal(params, totalLength, 'bottom'));
  rebars.push(...buildSupportNegativeBars(params, supportCenters));

  const stirrups = buildStirrups(params, hc);

  return {
    totalLength,
    section: params.section,
    supportCenters,
    rebars,
    stirrups,
    params,
  };
}

/**
 * 计算箍筋集合：
 *  - 每跨净跨范围 = [上一支座右边沿, 下一支座左边沿]
 *  - 加密区长度按抗震等级 + 截面高度
 */
function buildStirrups(params: BeamParams, hc: number): StirrupSet {
  const Ldense = denseZoneLength(params.seismicLevel, params.section.h);

  // 各跨净跨边界 X
  const spanRanges: { spanX0: number; spanX1: number }[] = [];
  let cursor = hc; // 第一支座的右边沿
  for (const sp of params.spans) {
    const x0 = cursor;
    const x1 = cursor + sp.Ln;
    spanRanges.push({ spanX0: x0, spanX1: x1 });
    cursor = x1 + hc;
  }

  const positions = placeAllStirrups({
    spans: spanRanges,
    Ldense,
    sDense: params.stirrup.sDense,
    sNormal: params.stirrup.sNormal,
  });

  // 标记每根箍筋是否在加密区
  const isDense = positions.map((x) => {
    for (const sr of spanRanges) {
      if (x < sr.spanX0 || x > sr.spanX1) continue;
      const ranges = splitSpanIntoStirrupRanges({
        spanX0: sr.spanX0,
        spanX1: sr.spanX1,
        Ldense,
        sDense: params.stirrup.sDense,
        sNormal: params.stirrup.sNormal,
      });
      const r = ranges.find((rr) => x >= rr.x0 - 1 && x <= rr.x1 + 1);
      return r ? r.isDense : true;
    }
    return false;
  });

  return {
    width: params.section.b - 2 * params.cover,
    height: params.section.h - 2 * params.cover,
    diameter: params.stirrup.diameter,
    grade: params.stirrup.grade,
    positions,
    isDense,
  };
}

/**
 * 生成上部或下部通长筋。在截面横向（Z）均匀分布。
 * 端部按 22G101 端支座节点：直锚（hc-c ≥ laE）或弯锚（直段 + 15d 弯钩）。
 */
function buildLongitudinal(
  params: BeamParams,
  totalLength: number,
  side: 'top' | 'bottom'
): RebarLine[] {
  const spec = side === 'top' ? params.topThrough : params.bottomThrough;
  const { b, h } = params.section;
  const c = params.cover;
  const ds = params.stirrup.diameter;
  const d = spec.diameter;
  const hc = params.supportWidth;

  const insetZ = c + ds + d / 2;
  const insetY = c + ds + d / 2;

  const usableW = b - 2 * insetZ;
  const positionsZ: number[] =
    spec.count === 1
      ? [0]
      : Array.from({ length: spec.count }, (_, i) => -usableW / 2 + (usableW * i) / (spec.count - 1));

  const y = side === 'top' ? h / 2 - insetY : -h / 2 + insetY;
  const role = side === 'top' ? 'topThrough' : 'bottomThrough';

  // 端部锚固
  const anc = endSupportAnchorage({
    d,
    grade: spec.grade,
    concrete: params.concreteGrade,
    seismic: params.seismicLevel,
    hc,
    cover: c,
  });

  // 起点（左支座）：从支座外边内侧 cover 进入
  const xLeftEdge = c;
  const xLeftEnter = xLeftEdge + anc.horizontalIntoSupport;
  // 终点（右支座）：对称
  const xRightEdge = totalLength - c;
  const xRightEnter = xRightEdge - anc.horizontalIntoSupport;

  // 弯钩竖直方向：上部筋向下弯（朝梁内），下部筋向上弯
  const hookSign = side === 'top' ? -1 : 1;
  const hookY = y + hookSign * anc.hookLength;

  return positionsZ.map((z, i) => {
    const points: [number, number, number][] = anc.bent
      ? [
          [xLeftEdge, hookY, z], // 左侧弯钩末端
          [xLeftEdge, y, z],     // 左侧弯折点
          [xLeftEnter, y, z],    // 进入梁内（直段终点）
          [xRightEnter, y, z],   // 直段
          [xRightEdge, y, z],    // 右侧弯折点
          [xRightEdge, hookY, z],// 右侧弯钩末端
        ]
      : [
          [xLeftEdge, y, z],
          [xRightEdge, y, z],
        ];

    return {
      id: `${role}-${i}`,
      role,
      diameter: d,
      grade: spec.grade,
      points,
    };
  });
}

/**
 * 支座负筋：每个支座（含中间支座）按 Ln/3（第一排）伸出。
 * MVP：仅生成第一排，与上部通长筋同 y。中间支座两侧伸出 max(Ln_left, Ln_right)/3。
 * 数量与上部通长筋相同位置错开（暂置于通长筋之间）。
 *
 * 注：若上部通长筋 ≥ 2 根，本函数生成额外 2 根支座负筋（位于截面 z 中部），便于"错筋"展示。
 */
function buildSupportNegativeBars(
  params: BeamParams,
  supportCenters: number[]
): RebarLine[] {
  const { b, h } = params.section;
  const c = params.cover;
  const ds = params.stirrup.diameter;
  const d = params.topThrough.diameter; // 简化：与上部通长筋同直径
  const insetY = c + ds + d / 2;
  const insetZ = c + ds + d / 2;
  const y = h / 2 - insetY;

  // 在通长筋两根之间各加 1 根负筋（z=0 附近 2 根）
  const positionsZ = [-d, d]; // 简单两根分布

  const result: RebarLine[] = [];
  const Lns = params.spans.map((s) => s.Ln);

  supportCenters.forEach((xc, idx) => {
    // 左右伸出长度 = max(Ln_左, Ln_右)/3
    const Lleft = idx === 0 ? 0 : Lns[idx - 1];
    const Lright = idx === supportCenters.length - 1 ? 0 : Lns[idx];
    const ext = Math.max(Lleft, Lright) / 3;
    if (ext < 100) return;

    const xL = xc - ext;
    const xR = xc + ext;

    positionsZ.forEach((z, k) => {
      // 限制 z 在保护层内
      const zClamped = Math.max(-(b / 2 - insetZ), Math.min(b / 2 - insetZ, z));
      result.push({
        id: `negSup1-${idx}-${k}`,
        role: 'supportNegative1',
        diameter: d,
        grade: params.topThrough.grade,
        points: [
          [xL, y, zClamped],
          [xR, y, zClamped],
        ],
      });
    });
  });

  return result;
}
