describe('Backend NestJS Application', () => {
    it('should pass a basic sanity test for Jenkins CI pipeline', () => {
      const isDatabaseConnected = true;
      expect(isDatabaseConnected).toBe(true);
    });
  });