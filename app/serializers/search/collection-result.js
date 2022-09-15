import DS from 'ember-data';
import ResourceSerializer from '../resource/resource';

export default DS.JSONAPISerializer.extend({
  normalizeResponse: function(store, primaryModelClass, payload) {
    const serializer = this;
    var collectionModel = {
      data: {
        id: '_none_',
        type: 'search/collection-result',
        attributes: {
          totalHitCount: payload.totalHitCount
        },
        relationships: {
          collections: { data: [] }
        }
      },
      included: []
    };
    serializer.normalizeCollections(
      payload.searchResults,
      collectionModel.data.relationships.collections.data,
      collectionModel
    );
    store.pushPayload(collectionModel);

    return collectionModel;
  },

  normalizeCollections: function(
    searchResults,
    relationshipItems,
    collectionModel
  ) {
    const serializer = this;
    for (var i = 0; i < searchResults.length; i++) {
      var result = searchResults[i];
      var collectionRelationship = {
        type: 'collection/collection',
        id: result.id
      };
      relationshipItems.push(collectionRelationship);

      var collection = {
        type: 'collection/collection',
        id: result.id,
        attributes: {
          collectionType: result.collectionType,
          title: result.title,
          remixes: result.scollectionRemixCount
            ? result.scollectionRemixCount
            : 0,
          views: result.viewCount ? result.viewCount : 0,
          imageUrl: result.thumbnails ? result.thumbnails.url : '',
          url: '',
          author: result.creatornameDisplay,
          authorId: result.creatorId,
          avatarUrl: `http://profile-images.goorulearning.org.s3.amazonaws.com/${result.creatorId}.png`,
          profilePageUrl: `http://www.goorulearning.org/#profilepage&id=${result.creatorId}&user=${result.creatornameDisplay}`,
          description: result.description,
          resourceCount: result.resourceCount ? result.resourceCount : 0,
          questionCount: result.questionCount ? result.questionCount : 0,
          hasTeam: result.libraryNames.length > 0,
          libraries: serializer.getLibraries(result.libraryNames)
        },
        relationships: {
          resources: { data: [] },
          standards: { data: [] }
        }
      };
      serializer.normalizeCollectionResources(
        result.collectionItems,
        collection.relationships.resources.data,
        collectionModel
      );
      serializer.normalizeCollectionStandards(
        JSON.parse(result.taxonomyDataSet),
        collection.relationships.standards.data,
        collectionModel
      );
      collectionModel.included.push(collection);
    }
  },

  normalizeCollectionResources: function(
    collectionItems,
    relationshipItems,
    collectionModel
  ) {
    for (var i = 0; i < collectionItems.length; i++) {
      var collectionItem = collectionItems[i];
      var resource = ResourceSerializer.create().normalizeResource(
        collectionItem
      );
      collectionModel.included.push(resource);
      var resourceRelationship = {
        type: resource.type,
        id: resource.id
      };
      relationshipItems.push(resourceRelationship);
    }
  },

  normalizeCollectionStandards: function(
    taxonomyDataSet,
    relationshipItems,
    collectionModel
  ) {
    for (var i = 0; i < taxonomyDataSet.curriculum.curriculumCode.length; i++) {
      var standardCode = taxonomyDataSet.curriculum.curriculumCode[i];
      var standardDesc = taxonomyDataSet.curriculum.curriculumDesc[i];
      var standard = {
        type: 'search/standard',
        id: standardCode,
        attributes: {
          name: standardCode,
          description: standardDesc
        }
      };
      collectionModel.included.push(standard);
      var standardRelationship = {
        type: standard.type,
        id: standard.id
      };
      relationshipItems.push(standardRelationship);
    }
  },

  getLibraries: function(libraryNames) {
    var libraries = '';
    for (var i = 0; i < libraryNames.length; i++) {
      libraries += `<p>${libraryNames[i]}</p>`;
    }
    return libraries;
  }
});
