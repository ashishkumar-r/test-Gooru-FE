import Ember from 'ember';
import ProfileModel from 'gooru-web/models/profile/profile';
import Env from 'gooru-web/config/environment';
import ResourceModel from 'gooru-web/models/content/resource';
import AssessmentModel from 'gooru-web/models/content/assessment';
import QuestionModel from 'gooru-web/models/content/question';
import CollectionModel from 'gooru-web/models/content/collection';
import { NETWORK_TYPE, DEFAULT_IMAGES } from 'gooru-web/config/config';
import {
  cleanFilename,
  nullIfEmpty,
  isSwitchedLearner
} from 'gooru-web/utils/utils';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import RubricSerializer from 'gooru-web/serializers/rubric/rubric';

/**
 * Serializer to support the Profile CRUD operations for API 3.0
 *
 * @typedef {Object} ProfileSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  /**
   * @property {RubricSerializer} rubricSerializer
   */
  rubricSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'rubricSerializer',
      RubricSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize a Profile object into a JSON representation required by the Create Profile endpoint
   * @param profileData the profile object
   * @returns {Object} returns a JSON Object
   */
  serializeCreateProfile: function(profileData) {
    return {
      first_name: profileData.get('firstName'),
      last_name: profileData.get('lastName'),
      username: profileData.get('username'),
      email: profileData.get('email'),
      password: profileData.get('password'),
      birth_date: `01/01/${profileData.get('dateOfBirth')}`,
      tenant_id: profileData.get('tenantId'),
      use_learning_data: profileData.get('useLearnData')
    };
  },

  /**
   * Serialize a Profile object into a JSON representation required by the Update Profile endpoint
   * @param profile
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateProfile: function(profile) {
    let state = profile.get('state');
    let schoolDistrict = profile.get('schoolDistrict');
    var profileObject = {
      first_name: profile.get('firstName') || undefined,
      last_name: profile.get('lastName') || undefined,
      roster_global_userid: nullIfEmpty(profile.get('studentId')),
      user_category: profile.get('role'),
      username: profile.get('username') || undefined,
      country: profile.get('country'),
      about: nullIfEmpty(profile.get('aboutMe')),
      country_id: profile.get('countryId'),
      state_id: nullIfEmpty(profile.get('stateId')),
      school_district_id: nullIfEmpty(profile.get('schoolDistrictId')),
      thumbnail: cleanFilename(
        profile.get('avatarUrl'),
        this.get('session.cdnUrls')
      ),
      use_learning_data: profile.get('use_learning_data')
    };

    profileObject.state = state ? state : null;

    if (schoolDistrict) {
      profileObject.school_district = schoolDistrict;
    }

    if (profile.info) {
      profileObject.info = profile.info;
    }

    return profileObject;
  },

  normalizeCreateProfile: function(payload) {
    return {
      token: Env['API-3.0']['user-token-api-2.0'],
      'token-api3': payload.access_token,
      user: {
        username: payload.username,
        gooruUId: payload.user_id,
        isNew: true,
        avatarUrl: DEFAULT_IMAGES.USER_PROFILE
      },
      isAnonymous: false
    };
  },

  /**
   * Normalize the Read Profile endpoint response
   * @param payload is the endpoint response in JSON format
   * @returns {ProfileModel} a profile model object
   */
  normalizeReadProfile: function(payload) {
    const serializer = this;
    if (payload) {
      const basePath = serializer.get('session.cdnUrls.user');
      const appRootPath = this.get('appRootPath'); //configuration appRootPath
      const thumbnailUrl = payload.thumbnail
        ? basePath + payload.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      const isShowData = !(
        payload.show_proficiency === false &&
        payload.show_score === false &&
        payload.show_timespent === false
      );

      if (isSwitchedLearner(payload.id)) {
        payload.user_category = 'student';
      }
      let fullName = `${
        payload.last_name ? payload.last_name.concat(',') : ''
      } ${payload.first_name}`;

      return ProfileModel.create(Ember.getOwner(this).ownerInjection(), {
        id: payload.id,
        firstName: payload.first_name,
        lastName: payload.last_name,
        username: payload.username,
        email: payload.email,
        gender: payload.gender,
        grades: payload.grade,
        dateOfBirth: payload.birth_date,
        role: payload.user_category,
        createdAt: payload.created_at,
        lastUpdate: payload.updated_at,
        countryId: payload.country_id,
        country: payload.country,
        stateId: payload.state_id,
        state: payload.state,
        studentId: payload.roster_global_userid,
        schoolDistrictId: payload.school_district_id,
        schoolDistrict: payload.school_district,
        schoolId: payload.school_id || null,
        aboutMe: payload.about,
        avatarUrl: thumbnailUrl,
        rosterId: payload.roster_id,
        referenceId: payload.reference_id || null,
        followers: payload.followers,
        followings: payload.followings,
        isFollowing: !!payload.isFollowing,
        fullName: fullName,
        isActive:
          payload.is_active && payload.is_active !== 'undefined'
            ? payload.is_active
            : null,
        profileBaselineDone: payload.profile_baseline_done,
        loginType: payload.login_type,
        diagAsmtState: payload.diag_asmt_state,
        use_learning_data: payload.use_learning_data,
        deletionTriggerDate: payload.deletion_trigger_date,
        isShowLearnerData: isShowData,
        tenantName: payload.tenant_name || null,
        universalProfileStatus: payload.status,
        show_email: payload.show_email,
        googleClassUserId: payload.google_class_user_id,
        enableForcePasswordChange: payload.enable_force_password_change,
        info: payload.info ? payload.info : null
      });
    }
  },

  normalizeUserProfile: function(payload) {
    let userProfiles = payload.users ? payload.users : [];
    let results = Ember.A([]);
    userProfiles.forEach(item => {
      results.push(this.normalizeReadProfile(item));
    });
    return results;
  },

  /**
   * Normalize the resources
   * @param payload
   * @returns {Resource[]}
   */
  normalizeReadResources: function(payload) {
    const resources = payload.resources || [];
    const serializer = this;
    const owners = serializer.normalizeOwners(payload.owner_details || []);

    return resources.map(function(resourceData) {
      return serializer.normalizeResource(resourceData, owners);
    });
  },

  /**
   * Normalize the questions
   * @param payload
   * @returns {Question[]}
   */
  normalizeReadQuestions: function(payload) {
    const questions = payload.questions || [];
    const serializer = this;
    const owners = serializer.normalizeOwners(payload.owner_details || []);

    return questions.map(function(questionData) {
      return serializer.normalizeQuestion(questionData, owners);
    });
  },

  /**
   * Normalize the collections
   * @param payload
   * @returns {Collection[]}
   */
  normalizeReadCollections: function(payload) {
    const collections = payload.collections || [];
    const serializer = this;
    const owners = serializer.normalizeOwners(payload.owner_details || []);

    return collections.map(function(collectionData) {
      return serializer.normalizeCollection(collectionData, owners);
    });
  },

  /**
   * Normalize the assessments
   * @param payload
   * @returns {Assessment[]}
   */
  normalizeReadAssessments: function(payload) {
    const assessments = payload.assessments || [];
    const serializer = this;
    const owners = serializer.normalizeOwners(payload.owner_details || []);

    return assessments.map(function(assessmentData) {
      return serializer.normalizeAssessment(assessmentData, owners);
    });
  },

  /**
   * Normalize the rubrics
   * @param payload
   * @returns {Rubric[]}
   */
  normalizeReadRubrics: function(payload) {
    const rubrics = payload.rubrics || [];
    const serializer = this;
    const owners = serializer.normalizeOwners(payload.owner_details || []);
    return rubrics.map(function(rubricData) {
      return serializer
        .get('rubricSerializer')
        .normalizeRubric(rubricData, owners);
    });
  },

  /**
   * Normalize the Offline Activities
   * @param payload
   * @returns {Rubric[]}
   */
  normalizeReadOfflineActivities: function(payload) {
    const serializer = this;
    const offlineActivities = payload.offline_activities || [];
    const owners = serializer.normalizeOwners(payload.owner_details || []);
    return offlineActivities.map(offlineActivity => {
      return serializer.normalizeOfflineActivity(offlineActivity, owners);
    });
  },

  /**
   * Normalizes a resource
   * @param {Object} resourceData
   * @param {[]} owners
   * @returns {Resource}
   */
  normalizeResource: function(resourceData, owners) {
    const serializer = this;
    const format = ResourceModel.normalizeResourceFormat(
      resourceData.content_subformat
    );
    const standards = resourceData.taxonomy || [];
    const creatorId = resourceData.creator_id;
    const filteredOwners = Ember.A(owners).filterBy('id', creatorId);
    return ResourceModel.create(Ember.getOwner(this).ownerInjection(), {
      id: resourceData.id,
      title: resourceData.title,
      description: resourceData.description,
      url: resourceData.url,
      format: format,
      publishStatus: resourceData.publish_status,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(standards),
      owner: filteredOwners.get('length')
        ? filteredOwners.get('firstObject')
        : null,
      isVisibleOnProfile:
        typeof resourceData.visible_on_profile !== 'undefined'
          ? resourceData.visible_on_profile
          : true,
      type: resourceData.content_subformat
    });
  },

  /**
   * Normalizes a question
   * @param {Object} questionData
   * @param {[]} owners
   * @returns {Question}
   */
  normalizeQuestion: function(questionData, owners) {
    const serializer = this;
    const creatorId = questionData.creator_id;
    const filteredOwners = Ember.A(owners).filterBy('id', creatorId);
    const standards = questionData.taxonomy || [];
    const format = QuestionModel.normalizeQuestionType(
      questionData.content_subformat
    );
    return QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: questionData.id,
      title: questionData.title,
      text: questionData.description,
      format: questionData.content_format,
      type: format,
      publishStatus: questionData.publish_status,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(standards),
      owner: filteredOwners.get('length')
        ? filteredOwners.get('firstObject')
        : null,
      isVisibleOnProfile:
        typeof questionData.visible_on_profile !== 'undefined'
          ? questionData.visible_on_profile
          : true
    });
  },

  /**
   * Normalizes a collection
   * @param {Object} collectionData
   * @param {[]} owners
   * @returns {Collection}
   */
  normalizeCollection: function(collectionData, owners) {
    const serializer = this;
    const ownerId = collectionData.owner_id;
    const filteredOwners = Ember.A(owners).filterBy('id', ownerId);
    const standards = serializer
      .get('taxonomySerializer')
      .normalizeTaxonomyObject(collectionData.taxonomy || []);
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = collectionData.thumbnail
      ? basePath + collectionData.thumbnail
      : appRootPath + DEFAULT_IMAGES.COLLECTION;

    return CollectionModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: collectionData.id,
      title: collectionData.title,
      standards: standards,
      thumbnailUrl: thumbnailUrl,
      publishStatus: collectionData.publish_status,
      learningObjectives: collectionData.learning_objective,
      originalCreatorId: collectionData.original_creator_id,
      resourceCount: collectionData.resource_count,
      questionCount: collectionData.question_count,
      remixCount: collectionData.remix_count, //TODO missing on API
      course: collectionData.course ? collectionData.course.title : null,
      courseId: collectionData.course ? collectionData.course.id : null,
      isVisibleOnProfile:
        typeof collectionData.visible_on_profile !== 'undefined'
          ? collectionData.visible_on_profile
          : true,
      owner: filteredOwners.get('length')
        ? filteredOwners.get('firstObject')
        : null,
      format: collectionData.format || null
    });
  },

  /**
   * Normalizes a assessment
   * @param {Object} assessmentData
   * @param {[]} owners
   * @returns {Assessment}
   */
  normalizeAssessment: function(assessmentData, owners) {
    const serializer = this;
    const ownerId = assessmentData.owner_id;
    const filteredOwners = Ember.A(owners).filterBy('id', ownerId);
    const standards = serializer
      .get('taxonomySerializer')
      .normalizeTaxonomyObject(assessmentData.taxonomy || []);
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = assessmentData.thumbnail
      ? basePath + assessmentData.thumbnail
      : appRootPath + DEFAULT_IMAGES.ASSESSMENT;

    return AssessmentModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: assessmentData.id,
      title: assessmentData.title,
      thumbnailUrl: thumbnailUrl,
      standards: standards,
      publishStatus: assessmentData.publish_status,
      originalCreatorId: assessmentData.original_creator_id,
      learningObjectives: assessmentData.learning_objective,
      questionCount: assessmentData.question_count,
      remixCount: assessmentData.remix_count, //TODO missing on API
      course: assessmentData.course ? assessmentData.course.title : null,
      courseId: assessmentData.course ? assessmentData.course.id : null,
      isVisibleOnProfile:
        typeof assessmentData.visible_on_profile !== 'undefined'
          ? assessmentData.visible_on_profile
          : true,
      owner: filteredOwners.get('length')
        ? filteredOwners.get('firstObject')
        : null,
      format: assessmentData.format,
      url: assessmentData.url
    });
  },

  /**
   * Normalizes a offline activity
   * @param {Object} offlineActivityData
   * @param {[]} owners
   * @returns {Assessment}
   */
  normalizeOfflineActivity: function(offlineActivityData, owners) {
    const serializer = this;
    const ownerId = offlineActivityData.owner_id;
    const filteredOwners = Ember.A(owners).filterBy('id', ownerId);
    const standards = serializer
      .get('taxonomySerializer')
      .normalizeTaxonomyObject(offlineActivityData.taxonomy || []);
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = offlineActivityData.thumbnail
      ? basePath + offlineActivityData.thumbnail
      : appRootPath + DEFAULT_IMAGES.OFFLINE_ACTIVITY;

    return Ember.Object.create({
      id: offlineActivityData.id,
      title: offlineActivityData.title,
      thumbnailUrl: thumbnailUrl,
      standards: standards,
      durationHours: offlineActivityData.duration_hours,
      exemplar: offlineActivityData.exemplar,
      format: offlineActivityData.format,
      collectionType: offlineActivityData.format,
      learningObjectives: offlineActivityData.learning_objective,
      maxScore: offlineActivityData.max_score,
      publishedStatus: offlineActivityData.publish_status,
      reference: offlineActivityData.reference,
      taskCount: offlineActivityData.task_count,
      isVisibleOnProfile: offlineActivityData.visible_on_profile,
      ownerId: offlineActivityData.owner_id,
      originalCreatorId: offlineActivityData.original_creator_id,
      owner: filteredOwners.get('length')
        ? filteredOwners.get('firstObject')
        : null
    });
  },

  /**
   * Normalizes owners
   * @param payload
   * @returns {Content/User}
   */
  normalizeOwners: function(payload) {
    const serializer = this;
    return payload.map(function(ownerData) {
      return serializer.normalizeReadProfile(ownerData);
    });
  },

  /**
   * Normalize the network details list
   * @param payload
   * @returns {Collection[]}
   */
  normalizeReadNetwork: function(payload, type) {
    const serializer = this;
    const details = payload.details || [];
    const following = payload.followings || [];

    return details.map(function(networkData) {
      return serializer.normalizeNetworkDetail(networkData, type, following);
    });
  },

  normalizeNetworkDetail: function(networkData, type, following) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = networkData.thumbnail
      ? basePath + networkData.thumbnail
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;

    return ProfileModel.create(Ember.getOwner(this).ownerInjection(), {
      id: networkData.id,
      firstName: networkData.first_name,
      lastName: networkData.last_name,
      avatarUrl: thumbnailUrl,
      country: networkData.country,
      schoolDistrict: networkData.school_district,
      followers: networkData.followers_count,
      followings: networkData.followings_count,
      isFollowing:
        type === NETWORK_TYPE.FOLLOWERS
          ? following.indexOf(networkData.id) > -1
          : true
    });
  },

  /**
   * Normalizes multiple profile items information
   * @param { users: [] } payload
   * @returns {ProfileModel[]}
   */
  normalizeReadMultipleProfiles: function(payload) {
    const serializer = this;
    let profiles = Ember.A([]);
    if (payload.users) {
      profiles = payload.users.map(function(userPayload) {
        return serializer.normalizeReadProfile(userPayload);
      });
    }
    return profiles;
  },

  /**
   * Serialize a guardian object into a JSON representation required by the invite guardian endpoint
   * @param guardianInfoData the guardian object
   * @returns {Object} returns a JSON Object
   */
  serializeGuardianData: function(guardianInfoData) {
    return {
      first_name: guardianInfoData.get('firstName'),
      last_name: guardianInfoData.get('lastName'),
      email: guardianInfoData.get('email'),
      relationship_id: guardianInfoData.get('relationshipId')
    };
  },

  consolidateProfile: function(payload) {
    let users = payload.users ? payload.users : [];
    let results = Ember.A();
    users.forEach(item => {
      const basePath = this.get('session.cdnUrls.user');
      const appRootPath = this.get('appRootPath'); //configuration appRootPath
      const thumbnailUrl = item.thumbnail
        ? basePath + item.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      const originatorThumbnailUrl = item.originator_thumbnail
        ? basePath + item.originator_thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      let user = Ember.Object.create({
        id: item.id,
        username: item.username,
        firstName: item.first_name,
        lastName: item.last_name,
        thumbnail: thumbnailUrl,
        email: item.email,
        tenantName: item.tenant_name,
        code: item.code,
        mode: item.mode,
        status: item.status,
        fullName: `${item.last_name}, ${item.first_name}`,
        originatorEmail: item.originator_email,
        originatorFirstName: item.originator_first_name,
        originatorId: item.originator_id,
        originatorLastName: item.originator_last_name,
        originatorUsername: item.originator_username,
        originatorFullName: `${item.originator_last_name}, ${item.originator_first_name}`,
        originatorThumbnail: originatorThumbnailUrl
      });
      results.push(user);
    });
    return results;
  }
});
