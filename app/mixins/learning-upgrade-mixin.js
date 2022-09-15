import Ember from 'ember';
import sha1 from 'sha1';

export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Session} current session
   */
  session: Ember.inject.service('session'),
  /**
   * @property {learningToolService}
   */
  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  // -------------------------------------------------------------------------
  // Methods

  GenerateLUContentURL(collection, toolDetails) {
    let content = collection;
    let contentURL = content.get('url');
    let userId = this.get('session.userId');
    let toolConfig = toolDetails.toolConfig;
    let additionalParams = toolConfig.additional_query_params;
    let key = toolConfig.key;
    let username = additionalParams
      ? additionalParams.username
      : 'goorupartner';
    let params = new URL(contentURL).searchParams;
    let lessionId = params.get('lesson_id');
    let token = sha1(userId + lessionId + key);
    let addtionalParams = `&token=${token}&student_id=${userId}&username=${username}`;
    let url = contentURL + addtionalParams;
    content.set('url', url);
  }
});
