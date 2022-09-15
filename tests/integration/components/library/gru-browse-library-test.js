import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'library/gru-browse-library',
  'Integration | Component | library/gru browse library',
  {
    integration: true
  }
);

test('Browse Library Test', function(assert) {
  let courses = [
    {
      id: 12345,
      title: 'Course title',
      unitCount: 3,
      thumbnailUrl: 'url-image.jpg',
      subjectName: null
    },
    {
      id: 12345,
      title: 'Course title',
      unitCount: 3,
      thumbnailUrl: 'url-image.jpg',
      subjectName: null
    }
  ];
  this.set('courses', courses);
  this.render(hbs`{{library/gru-browse-library courses=courses}}`);
  const $component = this.$();
  assert.equal(
    $component.find('.gru-standard-card').length,
    2,
    'Should appear 2 cards'
  );
});
