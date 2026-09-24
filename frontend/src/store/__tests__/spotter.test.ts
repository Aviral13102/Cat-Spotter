import { describe, it, expect } from 'vitest';
import { useSpotterStore } from '../spotter';

describe('useSpotterStore', () => {
  it('handles ws messages', () => {
    const store = useSpotterStore.getState();
    expect(store.connection).toBe('disconnected');
    store.handleWsMessage({
      type: 'sim.state',
      seq: 1,
      ts: '',
      payload: { playing: true, speed: 2, sim_time: '12:00', window_index: 1, elapsed_s: 10 }
    });
    
    const nextState = useSpotterStore.getState();
    expect(nextState.sim.playing).toBe(true);
    expect(nextState.sim.speed).toBe(2);
  });
});
