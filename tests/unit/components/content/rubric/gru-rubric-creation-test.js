import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'content/rubric/gru-rubric-creation',
  'Unit | Component | content/rubric/gru rubric creation',
  {
    // Specify the other units that are required for this test
    needs: ['service:api-sdk/media'],
    unit: true
  }
);

test('addURL', function(assert) {
  let component = this.subject();
  component.set('rubric', {
    validate: () =>
      Ember.RSVP.resolve({
        validations: Ember.Object.create({ isValid: true })
      })
  });
  Ember.run(() => component.send('addURL', 'url'));
  assert.equal(component.get('resource.url'), 'url', 'Incorrect URL');
});

test('selectFile', function(assert) {
  let component = this.subject({
    rubric: Ember.Object.create({
      uploaded: true
    })
  });
  component.set('mediaService', {
    uploadContentFile: file => {
      assert.equal(file, 'file', 'Incorrect File');
      return Ember.RSVP.resolve('filename');
    }
  });
  Ember.run(() => component.send('selectFile', 'file'));
  assert.equal(component.get('resource.url'), 'filename', 'Incorrect URL');
  assert.equal(component.get('rubric.url'), 'filename', 'Incorrect rubric URL');
});
