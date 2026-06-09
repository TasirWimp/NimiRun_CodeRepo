import { describe, expect, it } from 'vitest';

import { getInitialGameSize } from '../../src/ui/gameViewport.js';

describe('getInitialGameSize', () => {
  it('uses the desktop game size outside phone portrait', () => {
    expect(getInitialGameSize({ innerWidth: 1280, innerHeight: 720 })).toEqual({
      width: 1024,
      height: 768,
    });
  });

  it('uses the viewport-sized portrait game surface for phones', () => {
    expect(getInitialGameSize({ innerWidth: 390, innerHeight: 844 })).toEqual({
      width: 390,
      height: 844,
    });
  });

  it('treats high-density Mini App WebViews as phone portrait', () => {
    expect(getInitialGameSize({ innerWidth: 980, innerHeight: 1800 })).toEqual({
      width: 430,
      height: 790,
    });
  });

  it('clamps unusual phone portrait sizes into the supported range', () => {
    expect(getInitialGameSize({ innerWidth: 320, innerHeight: 1000 })).toEqual({
      width: 360,
      height: 932,
    });
  });
});
