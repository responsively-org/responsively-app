import {describe, expect, it} from 'vitest';
import reducer, {selectRuler, selectRulerEnabled, setRuler} from './index';
import type {RootState} from '../..';

const coordinates = {
  deltaX: 0,
  deltaY: 0,
  scrollX: 0,
  scrollY: 0,
  innerHeight: 800,
  innerWidth: 400,
};

describe('ruler slice', () => {
  it('starts empty', () => {
    expect(reducer(undefined, {type: '@@INIT'})).toEqual({});
  });

  it('setRuler stores state per resolution', () => {
    const state = reducer(
      undefined,
      setRuler({
        resolution: '390x844',
        rulerState: {isRulerEnabled: true, rulerCoordinates: coordinates},
      })
    );
    expect(state['390x844'].isRulerEnabled).toBe(true);
  });

  it('selectors resolve per resolution with safe fallbacks', () => {
    const rulers = {
      '390x844': {isRulerEnabled: true, rulerCoordinates: coordinates},
    };
    const rootState = {rulers} as unknown as RootState;
    expect(selectRuler(rootState)('390x844')?.isRulerEnabled).toBe(true);
    expect(selectRuler(rootState)('999x999')).toBeUndefined();
    expect(selectRuler(rootState)(undefined)).toBeUndefined();
    expect(selectRulerEnabled(rootState)('390x844')).toBe(true);
    expect(selectRulerEnabled(rootState)('999x999')).toBe(false);
  });
});
