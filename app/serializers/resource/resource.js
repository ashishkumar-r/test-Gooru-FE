import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
  getBaseResourceModel: function() {
    return {
      type: 'resource/resource',
      id: null,
      attributes: {},
      relationships: {
        answers: { data: [] }
      }
    };
  },

  getExtendedResourceModel: function() {
    return {
      data: this.getBaseResourceModel(),
      included: []
    };
  },

  normalizeSingleResponse: function(store, primaryModelClass, payload) {
    var resourceModel = this.getExtendedResourceModel();
    resourceModel.data.id = payload.gooruOid;
    return resourceModel;
  },

  normalizeResource: function(payload) {
    // If payload contains a resource element then it corresponds to a Search resource
    if (this.isSearchResultResource(payload)) {
      return this.normalizeResourceForSearch(payload);
    } else {
      var model = this.normalizeDefaultResource(payload);

      if (this.isQuestionResource(payload)) {
        model = this.normalizeQuestionResource(payload, model);
      }

      return model;
    }
  },

  normalizeDefaultResource: function(payload) {
    var model = this.getBaseResourceModel();
    model.id = payload.gooruOid;
    model.attributes.resourceType = payload.resourceType.name;
    model.attributes.resourceFormat = payload.resourceFormat.value;
    model.attributes.title = payload.title;
    model.attributes.description = payload.description;
    model.attributes.thumbnail = null;
    model.attributes.assetUri = payload.assetURI;
    model.attributes.folder = payload.folder;
    model.attributes.mediaUrl = payload.thumbnails
      ? payload.thumbnails.url
      : null;
    model.attributes.url = payload.url;
    model.attributes.narration = payload.narration;
    model.attributes.order = payload.itemSequence;
    model.attributes.owner = {
      username: payload.user.username,
      userId: payload.user.gooruUId,
      avatarUrl: payload.user.profileImageUrl
    };
    //some extra resource options here
    model.attributes.options = {
      hotTextType: payload.hlType,
      start: payload.start ? payload.start : '00:00:00',
      stop: payload.stop ? payload.stop : '00:00:00'
    };
    return model;
  },

  normalizeResourceForSearch: function(payload) {
    var model = this.getBaseResourceModel();
    model.id = payload.collectionItemId;
    model.attributes.resourceType = payload.resource.resourceType.name;
    model.attributes.resourceFormat = payload.resource.resourceFormat.value;
    model.attributes.title = payload.resource.title;
    model.attributes.description = payload.resource.title;
    model.attributes.thumbnail = payload.resource.thumbnails
      ? payload.resource.thumbnails.url
      : null;
    model.attributes.assetUri = payload.resource.assetURI;
    model.attributes.folder = payload.resource.folder;
    model.attributes.url = payload.resource.url;
    model.attributes.mediaUrl = null;
    model.attributes.narration = null;
    model.attributes.order = 0;
    model.attributes.owner = payload.resource.creator_id;
    //some extra resource options here
    model.attributes.options = {
      hotTextType: payload.resource.hlType,
      start: payload.resource.start ? payload.resource.start : '00:00:00',
      stop: payload.resource.stop ? payload.resource.stop : '00:00:00'
    };
    return model;
  },

  normalizeQuestionResource: function(payload, model) {
    model.attributes.questionType = payload.typeName;
    model.attributes.text = payload.questionText;
    model.attributes.hints = Ember.copy(payload.hints, true);
    model.attributes.explanation = payload.explanation;
    return model;
  },

  normalizeQuestionAnswers: function(answerItems, resource, model) {
    var answerRelationships = resource.relationships.answers.data;
    for (var i = 0; i < answerItems.length; i++) {
      var answerItem = answerItems[i];
      var answerModel = {
        type: 'resource/answer',
        id: `${resource.id}_${answerItem.sequence}`,
        attributes: {
          text: answerItem.answerText,
          answerType: answerItem.answerType,
          order: answerItem.sequence,
          isCorrect: answerItem.isCorrect
        }
      };
      model.included.push(answerModel);

      var answerRelationship = {
        type: answerModel.type,
        id: answerModel.id
      };
      answerRelationships.push(answerRelationship);
    }
  },

  isSearchResultResource: function(payload) {
    return payload.resource;
  },

  isQuestionResource: function(payload) {
    return (
      payload.resourceFormat && payload.resourceFormat.value === 'question'
    );
  }
});
