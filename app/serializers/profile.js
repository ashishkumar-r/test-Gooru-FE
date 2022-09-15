import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  normalizeSingleResponse: function(store, primaryModelClass, payload) {
    // TODO: Remove static values from followers and followings
    var profileModel = {
      data: {
        type: 'profile',
        id: payload.profileId,
        attributes: {
          profileId: payload.profileId,
          aboutMe: payload.aboutMe,
          followers: 736,
          followersList: [
            'ff90e7e2-7788-48fb-9ce2-7b6d7a828840',
            'df956d5f-b7b2-43ae-98a1-c90a12eacaf9'
          ],
          followersDetails: [],
          followings: 566,
          followingsList: ['df956d5f-b7b2-43ae-98a1-c90a12eacaf9'],
          followingsDetails: []
        },
        relationships: {
          user: {
            data: {
              type: 'user/user',
              id: payload.user.gooruUId
            }
          }
        }
      },
      included: [
        {
          type: 'user/user',
          id: payload.user.gooruUId,
          attributes: {
            firstName: payload.user.firstName,
            lastName: payload.user.lastName,
            avatarUrl: payload.user.profileImageUrl,
            username: payload.user.username,
            usernameDisplay: payload.user.usernameDisplay
          },
          relationships: {
            metadata: {
              data: {
                type: 'meta',
                id: `meta_${payload.user.gooruUId}`
              }
            }
          }
        },
        {
          type: 'meta',
          id: `meta_${payload.user.gooruUId}`,
          attributes: {
            isFeaturedUser: payload.user.meta.isFeaturedUser
          },
          relationships: {
            taxonomyPreference: {
              data: {
                type: 'taxonomy-preference',
                id: `taxonomy_${payload.user.gooruUId}`
              }
            }
          }
        },
        {
          type: 'taxonomy-preference',
          id: `taxonomy_${payload.user.gooruUId}`,
          attributes: {
            codeId: payload.user.meta.taxonomyPreference.codeId,
            code: payload.user.meta.taxonomyPreference.code
          }
        }
      ]
    };
    store.pushPayload(profileModel);

    return profileModel;
  }
});
