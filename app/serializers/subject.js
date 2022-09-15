import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  normalizeFindAllResponse(store, primaryModelClass, payload) {
    var subjectModel = {
      data: payload.map(attrs => {
        return {
          id: attrs.libraryId,
          type: 'subject',
          attributes: attrs
        };
      })
    };
    store.pushPayload(subjectModel);

    return subjectModel;
  }
});
