import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'grading/gru-roster-header',
  'Integration | Component | grading/gru roster header',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.set('date', moment('1995-12-25'));
  this.render(hbs`
    {{grading/gru-roster-header
      currentResponse='name'
      timeSpent=6000
      submittedAt=date
    }}
  `);

  let $component = this.$();
  let $rosterButton = $component.find('.actions .btn');
  let $info = $component.find('.legend');
  let $submittedAt = $component.find('.submitted-at');
  let $currentResponse = $info.find('.current-response');
  let $timeSpent = $info.find('.time-spent');

  T.exists(assert, $rosterButton, 'Missing roster button');
  T.exists(assert, $info, 'Missing current user and time spent');
  T.exists(assert, $currentResponse, 'Missing current response');
  T.exists(assert, $timeSpent, 'Missing time spent');
  assert.ok(
    T.text($submittedAt).includes('12/25/95'),
    'Wrong text in submitted at'
  );
  assert.ok(
    T.text($currentResponse).includes('name'),
    'Wrong text in current response'
  );
  assert.ok(T.text($timeSpent).includes('6s'), 'Wrong text in time spent');
});
