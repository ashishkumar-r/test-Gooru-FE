import Ember from 'ember';
import {
  isExistInArray
} from 'gooru-web/utils/utils';

export default Ember.Helper.extend({
  destroy() {
    if (this.teardown) {
      this.teardown();
    }
    this._super(...arguments);
  },
  setupRecompute(array) {
    if (this.teardown) {
      this.teardown();
    }
    array.addObserver('[]', this, this.recompute);
    this.teardown = () => {
      array.removeObserver('[]', this, this.recompute);
    };
  },
  compute([array, property, key]) {
    this.setupRecompute(array);
    return isExistInArray(array, property, key);
  }
});
