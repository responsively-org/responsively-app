import reducer, {selectEventMirroringEnabled, setEventMirroring} from './index';
import type {RootState} from '../..';

describe('event mirroring preferences', () => {
  it('defaults to mirroring and keeps per-device settings across unrelated changes', () => {
    const initial = reducer(undefined, {type: '@@INIT'});
    expect(selectEventMirroringEnabled({eventMirroring: initial} as RootState, 'phone')).toBe(true);
    const state = reducer(
      initial,
      setEventMirroring({deviceIds: ['phone', 'tablet'], enabled: false})
    );
    const changed = reducer(state, setEventMirroring({deviceIds: ['tablet'], enabled: true}));
    expect(selectEventMirroringEnabled({eventMirroring: changed} as RootState, 'phone')).toBe(
      false
    );
    expect(selectEventMirroringEnabled({eventMirroring: changed} as RootState, 'tablet')).toBe(
      true
    );
    expect(selectEventMirroringEnabled({eventMirroring: changed} as RootState, 'desktop')).toBe(
      true
    );
  });
});
