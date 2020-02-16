import { UniversalDemoPage } from './app.po';

describe('angular-ssr-csr App', () => {
  let page: UniversalDemoPage;

  beforeEach(() => {
    page = new UniversalDemoPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
