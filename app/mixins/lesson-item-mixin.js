import Ember from 'ember';
import sha1 from 'sha1';

export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  session: Ember.inject.service('session'),

  collectionService: Ember.inject.service('api-sdk/collection'),

  assessmentService: Ember.inject.service('api-sdk/assessment'),

  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  generateLuUrl: function(content) {
    const controller = this;
    if (
      content.get('format') === 'assessment-external' ||
      content.get('format') === 'collection-external'
    ) {
      let itemType = content.get('format');
      let resource =
        itemType === 'collection-external'
          ? this.get('collectionService').readExternalCollection(
            content.get('id')
          )
          : this.get('assessmentService').readExternalAssessment(
            content.get('id')
          );
      return Ember.RSVP.hash({
        externalResource: resource
      }).then(({ externalResource }) => {
        if (externalResource.learningToolId) {
          controller
            .get('learningToolService')
            .getLearningToolInformation(externalResource.learningToolId)
            .then(response => {
              let collectionId = content.get('id');
              let collectionType = content.get('format');
              let contentURL = content.get('url');
              let userId =
                controller.get('userId') || controller.get('session.userId');
              let toolConfig = response.toolConfig;
              let additionalParams = toolConfig.additional_query_params;
              let key = toolConfig.key;
              let username = additionalParams
                ? additionalParams.username
                : 'goorupartner';
              let params = new URL(contentURL).searchParams;
              let lessionId = params.get('lesson_id');
              let token = sha1(userId + lessionId + key);
              let host = window.location.host;
              let callbackURL = `${host}/player-external-collection/${collectionId}/${collectionType}`;
              let addtionalParams = `&token=${token}&student_id=${userId}&username=${username}&subdomain=${callbackURL}&high_score=100`;
              let url = contentURL + addtionalParams;
              content.set('url', url);
            });
        }
      });
    }
  }
});
