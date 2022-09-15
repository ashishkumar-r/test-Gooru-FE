/* eslint require-jsdoc: 0 */
import Ember from 'ember';
import { moduleFor } from 'ember-qunit';
import Pretender from 'pretender';

export default function(name, moduleName, options = {}) {
  moduleFor(name, moduleName, {
    needs: options.needs,
    beforeEach() {
      /**
       * Most of GooruWeb services uses the session service, if you need to mock
       * the session service differently you can do it by registering again in your test
       * beforeEach method
       */
      this.register('service:session', Ember.Service.extend({}));
      this.register('service:i18n', Ember.Service.extend({}));
      this.register('service:firebaseApp', Ember.Service.extend({}));
      this.register('service:quizzes/collection', Ember.Service.extend({}));
      //Starting the pretender
      this.pretender = new Pretender();

      if (options.beforeEach) {
        options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      //Stopping the pretender
      this.pretender.shutdown();

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  });
}
