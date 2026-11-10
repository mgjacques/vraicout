import { applyCode, exportCode, readCode, readKept } from './data-transfer';

describe('data transfer', () => {
  beforeEach(() => localStorage.clear());
  afterAll(() => localStorage.clear());

  it('exports nothing when nothing is kept', () => {
    localStorage.setItem('other-site', 'x');
    expect(exportCode()).toBe('');
  });

  it('carries every kept value, accents included, but not the password check', () => {
    localStorage.setItem('vraicout.split', '{"v":1,"data":{"names":["Zoé","Éloi"]}}');
    localStorage.setItem('vraicout.theme', 'dark');
    localStorage.setItem('vraicout.access', '{"v":1,"data":"hash"}');
    localStorage.setItem('other-site', 'x');

    const code = exportCode();
    expect(code).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(readCode(code)).toEqual({
      split: '{"v":1,"data":{"names":["Zoé","Éloi"]}}',
      theme: 'dark',
    });
  });

  it('reads a code back after copying adds line breaks or spaces around it', () => {
    localStorage.setItem('vraicout.theme', 'dark');
    const code = exportCode();
    const wrapped = `  ${code.slice(0, 10)}\n${code.slice(10)}  `;
    expect(readCode(wrapped)).toEqual({ theme: 'dark' });
  });

  it('refuses what this site did not make', () => {
    const encode = (value: unknown) => btoa(JSON.stringify(value));
    expect(readCode('')).toBeNull();
    expect(readCode('pas un code')).toBeNull();
    expect(readCode(btoa('pas du JSON'))).toBeNull();
    expect(readCode(encode({ app: 'autre', v: 1, keys: { theme: 'dark' } }))).toBeNull();
    expect(readCode(encode({ app: 'vraicout', v: 2, keys: { theme: 'dark' } }))).toBeNull();
    expect(readCode(encode({ app: 'vraicout', v: 1, keys: { theme: 3 } }))).toBeNull();
    expect(readCode(encode({ app: 'vraicout', v: 1, keys: [] }))).toBeNull();
    expect(readCode(encode({ app: 'vraicout', v: 1, keys: {} }))).toBeNull();
    expect(readCode(encode({ app: 'vraicout', v: 1, keys: { access: 'x' } }))).toBeNull();
  });

  it('replaces what is kept, and leaves the password check and other sites alone', () => {
    localStorage.setItem('vraicout.fees', 'old');
    localStorage.setItem('vraicout.theme', 'light');
    localStorage.setItem('vraicout.access', 'hash');
    localStorage.setItem('other-site', 'x');

    expect(applyCode({ theme: 'dark', split: 'new' })).toBe(true);

    expect(readKept()).toEqual({ theme: 'dark', split: 'new' });
    expect(localStorage.getItem('vraicout.access')).toBe('hash');
    expect(localStorage.getItem('other-site')).toBe('x');
  });

  it('gives back exactly what was exported, from one browser to another', () => {
    localStorage.setItem('vraicout.fees', '{"v":1,"data":{"amount":1000}}');
    localStorage.setItem('vraicout.print./frais', '{"v":1,"data":["chart"]}');
    const before = readKept();
    const code = exportCode();
    localStorage.clear();

    applyCode(readCode(code)!);
    expect(readKept()).toEqual(before);
  });
});
