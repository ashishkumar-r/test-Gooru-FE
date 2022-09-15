import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'proficiency/subject-item-list',
  'Integration | Component | proficiency/subject item list',
  {
    integration: true
  }
);

test('Subject Item List Layout', function(assert) {
  var $component = this.$();
  var taxonomySubjects = Ember.A([
    {
      id: 'K12.SC',
      title: 'Science'
    },
    {
      id: 'K12.MA',
      title: 'Maths'
    }
  ]);
  this.set('taxonomySubjects', taxonomySubjects);
  this.render(
    hbs`{{proficiency/subject-item-list taxonomySubjects=taxonomySubjects}}`
  );
  T.exists(assert, $component.find('.list-item'), 'Missing subject list item');
});
