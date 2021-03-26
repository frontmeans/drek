import { Drek__NS } from './drek.ns';

describe('Drek__NS', () => {
  it('has Drek URL', () => {
    expect(Drek__NS.url).toBe('https://frontmeans.github.io/ns/drek');
  });
  it('has `drek` namespace alias', () => {
    expect(Drek__NS.alias).toBe('drek');
  });
});
