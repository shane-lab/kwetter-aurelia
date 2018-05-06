import {App} from '../../src/app';

describe('app', () => {
  const app = new App;
  beforeEach(() => {
    app.authService = null;
  });

  it('injected services', () => {
    expect(app.authService).toBeDefined();
  });
});
