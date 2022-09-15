import Ember from 'ember';
import ResourceModel from './resource';

export default ResourceModel.extend({
  questionType: null,
  text: null,
  hints: null,
  explanation: null,
  answers: Ember.A()
});
