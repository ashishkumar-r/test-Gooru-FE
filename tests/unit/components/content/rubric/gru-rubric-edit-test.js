import { moduleForComponent, test } from 'ember-qunit';
import RubricModel from 'gooru-web/models/rubric/rubric';

moduleForComponent(
  'content/rubric/gru-rubric-edit',
  'Unit | Component | content/rubric/gru rubric edit',
  {
    unit: true,
    needs: [
      'service:session',
      'service:i18n',
      'service:notifications',
      'service:api-sdk/media',
      'service:api-sdk/rubric'
    ]
  }
);

test('setFeedBack', function(assert) {
  let component = this.subject({
    rubric: RubricModel.create({})
  });
  assert.equal(
    component.get('rubric.requiresFeedback'),
    true,
    'Feedback should be required'
  );
  component.send('setFeedBack');
  assert.equal(
    component.get('rubric.requiresFeedback'),
    false,
    'Feedback should not be required'
  );
});

test('addNewCategory', function(assert) {
  let component = this.subject();
  assert.equal(
    component.get('categories.length'),
    0,
    'Should not have categories'
  );
  component.send('addNewCategory');
  assert.equal(component.get('categories.length'), 1, 'Should have 1 category');
});
