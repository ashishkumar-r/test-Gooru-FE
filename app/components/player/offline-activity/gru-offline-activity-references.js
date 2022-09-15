import Ember from 'ember';
import { setDownloadPathForReference } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['offline-activity-player', 'gru-offline-activity-references'],

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    let references = this.get('offlineActivity.references');
    setDownloadPathForReference(references);
  }
});
