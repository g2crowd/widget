import subject from '../src/selectorBuilder';

describe('selectorBuilder', function () {
  it('should set namespace with attr', function () {
    expect(subject({ attr: 'foo' })).toEqual('[foo]');
  });

  it('should set namespace with data', function () {
    expect(subject({ data: 'foo-widget' })).toEqual('[data-foo-widget]');
  });

  it('should set namespace with attr and data', function () {
    expect(subject({ attr: 'foo', data: 'foo-widget' })).toEqual('[foo],[data-foo-widget]');
  });
});
