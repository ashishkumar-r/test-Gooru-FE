/* import Ember from 'ember';
export default Ember.Test.registerAsyncHelper('moduleForComponent', function(app) { });
 */
/* eslint require-jsdoc: 0 */
import Ember from 'ember';
import { moduleFor } from 'ember-qunit';

//import { moduleForComponent } from 'ember-qunit';

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
      this.register('service:configuration', Ember.Service.extend({}));
      this.register('service:api-sdk/profile', Ember.Service.extend({}));
      this.register('service:api-sdk/analytics', Ember.Service.extend({}));
      this.register(
        'service:api-sdk/course-location',
        Ember.Service.extend({})
      );
      this.register('service:popover', Ember.Service.extend({}));
      this.register('service:api-sdk/lookup', Ember.Service.extend({}));
      this.register('service:api-sdk/authentication', Ember.Service.extend({}));

      this.register('service:api-sdk/session', Ember.Service.extend({}));
      this.register('service:api-sdk/class', Ember.Service.extend({}));
      this.register('service:api-sdk/performance', Ember.Service.extend({}));
      this.register('service:api-sdk/course', Ember.Service.extend({}));
      this.register('service:api-sdk/unit', Ember.Service.extend({}));
      this.register('service:api-sdk/navigate-map', Ember.Service.extend({}));
      this.register(
        'service:api-sdk/skyline-initial',
        Ember.Service.extend({})
      );
      this.register('service:api-sdk/competency', Ember.Service.extend({}));

      //Starting the pretender

      if (options.beforeEach) {
        options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      //Stopping the pretender

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  });
}
