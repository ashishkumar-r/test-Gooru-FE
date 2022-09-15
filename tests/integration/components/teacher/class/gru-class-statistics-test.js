import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'teacher/class/gru-class-statistics',
  'Integration | Component | teacher/class/gru class statistics',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Layout with performance summary', function(assert) {
  assert.expect(7);

  const classMock = Ember.Object.create({
    id: '1',
    name: 'Class A1',
    performanceSummary: {
      classId: '1',
      score: 90,
      timeSpent: 349659,
      completedPercentage: 3
    }
  });

  this.set('class', classMock);
  this.render(hbs`{{teacher/class/gru-class-statistics class=class}}`);
  const $statistics = this.$(); //component dom element

  const $titleContainer = $statistics.find('.title-statistics');
  const $performanceContainer = $statistics.find('.performance');
  const $completionContainer = $statistics.find('.completion');
  const $timeSpentContainer = $statistics.find('.time-spent');

  T.exists(assert, $titleContainer, 'Missing class statistics title');
  T.exists(
    assert,
    $performanceContainer,
    'Missing class performance container'
  );
  T.exists(assert, $completionContainer, 'Missing class completion container');
  T.exists(assert, $timeSpentContainer, 'Missing class time spent container');

  assert.equal(
    $performanceContainer
      .find('span')
      .text()
      .trim(),
    '90%',
    'Performance incorrect'
  );
  assert.equal(
    $completionContainer
      .find('span')
      .text()
      .trim(),
    '3%',
    'Completion incorrect'
  );
  assert.equal(
    $timeSpentContainer
      .find('span')
      .text()
      .trim(),
    '5m 49s',
    'Time Spent incorrect'
  );
});

test('Layout without performance summary', function(assert) {
  assert.expect(7);

  const classMock = Ember.Object.create({
    id: '1',
    name: 'Class A1'
  });

  this.set('class', classMock);
  this.render(hbs`{{teacher/class/gru-class-statistics class=class}}`);
  const $statistics = this.$(); //component dom element

  const $titleContainer = $statistics.find('.title-statistics');
  const $performanceContainer = $statistics.find('.performance');
  const $completionContainer = $statistics.find('.completion');
  const $timeSpentContainer = $statistics.find('.time-spent');

  T.exists(assert, $titleContainer, 'Missing class statistics title');
  T.exists(
    assert,
    $performanceContainer,
    'Missing class performance container'
  );
  T.exists(assert, $completionContainer, 'Missing class completion container');
  T.exists(assert, $timeSpentContainer, 'Missing class time spent container');

  assert.equal(
    $performanceContainer
      .find('span')
      .text()
      .trim(),
    '--',
    'Performance should not be visible'
  );
  assert.equal(
    $completionContainer
      .find('span')
      .text()
      .trim(),
    '--',
    'Completion should not be visible'
  );
  assert.equal(
    $timeSpentContainer
      .find('span')
      .text()
      .trim(),
    '--',
    'Time Spent should not be visible'
  );
});
