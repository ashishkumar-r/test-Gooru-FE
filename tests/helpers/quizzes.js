import Ember from 'ember';

/**
 * Register all quizzes services
 */
export function registerQuizzesServices(container) {
  container.register('service:quizzes/configuration', Ember.Service.extend({}));
  container.inject.service('quizzes/configuration');
  container.register(
    'service:quizzes/collection',
    Ember.Service.extend({
      notifyCollectionChange: function() {
        return;
      }
    })
  );
  container.inject.service('quizzes/collection');
}
