import Ember from 'ember';
import Resource from 'gooru-web/models/content/resource';
import Question from 'gooru-web/models/content/question';
import { moduleFor, test } from 'ember-qunit';

moduleFor('model:content/collection', 'Unit | Model | content/collection', {
  unit: true,
  needs: ['validator:presence']
});

test('number of resources is computed correctly', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Resource.create({
        title: 'Resource A'
      }),
      Resource.create({
        title: 'Resource B'
      }),
      Question.create({
        title: 'Question A'
      })
    ])
  });

  assert.equal(
    model.get('computedResourceCount'),
    2,
    'Computed resource count'
  );
});

test('number of questions is computed correctly', function(assert) {
  var model = this.subject({
    children: Ember.A([
      Question.create({
        title: 'Question A'
      }),
      Resource.create({
        title: 'Resource A'
      }),
      Question.create({
        title: 'Question B'
      })
    ])
  });

  assert.equal(
    model.get('computedQuestionCount'),
    2,
    'Computed question count'
  );
});
