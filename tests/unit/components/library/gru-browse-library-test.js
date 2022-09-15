import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'library/gru-browse-library',
  'Unit | Component | library/gru browse library',
  {
    unit: true,
    needs: ['service:i18n']
  }
);

test('options', function(assert) {
  let component = this.subject();
  component.set('options', [
    {
      name: 'featured-courses',
      text: 'Featured Courses'
    }
  ]);

  assert.equal(
    component.get('options')[0].name,
    'featured-courses',
    'First option incorrect'
  );
});
