import Ember from 'ember';
import ProfileModel from 'gooru-web/models/profile/profile';
import ClassesModel from 'gooru-web/models/content/classes';
import ClassModel from 'gooru-web/models/content/class';
import ClassContentVisibilityModel from 'gooru-web/models/content/class-content-visibility';
import ProfileSerializer from 'gooru-web/serializers/profile/profile';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer to support the Class CRUD operations for API 3.0
 *
 * @typedef {Object} ClassSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  init: function() {
    this._super(...arguments);
    this.set(
      'profileSerializer',
      ProfileSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  session: Ember.inject.service('session'),

  /**
   * Serialize a Class object into a JSON representation required by the Create Class endpoint
   *
   * @param classModel The Class model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeCreateClass: function(classModel) {
    var classData = this.serializeClass(classModel);
    return classData;
  },
  /**
   * Serialize a content visibility object into a JSON representation required by the Update content Visibility endpoint
   *
   * @param id The id of content to change
   * @param visibility Indicate if is visible = on/off
   *  @param type Content object type
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateContentVisibility: function(id, visibility, type) {
    let content;
    if (type === 'assessment') {
      content = {
        assessments: [
          {
            id: id,
            visible: visibility ? 'on' : 'off'
          }
        ]
      };
    } else if (type === 'collection') {
      content = {
        collections: [
          {
            id: id,
            visible: visibility ? 'on' : 'off'
          }
        ]
      };
    } else if (type === 'offline-activity') {
      content = {
        offline_activity: [
          {
            id: id,
            visible: visibility ? 'on' : 'off'
          }
        ]
      };
    } else if (type === 'unit') {
      content = {
        units: [
          {
            id: id,
            visible: visibility ? 'on' : 'off'
          }
        ]
      };
    } else {
      content = {
        lessons: [
          {
            id: id,
            visible: visibility ? 'on' : 'off'
          }
        ]
      };
    }
    return content;
  },
  /**
   * Serialize a Class object into a JSON representation required by the Update Class endpoint
   *
   * @param classModel The Class model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateClass: function(classModel) {
    var classData = this.serializeClass(classModel, true);
    classData.greeting = classModel.get('greeting');
    return classData;
  },

  serializeClass: function(classModel, update = false) {
    let setting = classModel.get('setting');
    let maValue = setting ? setting.mastery_applicable : null;
    let correctAns = setting ? setting.show_correct_answer : null;
    let tmpEvidence = setting ? setting.show_evidence : null;
    if (setting) {
      if (maValue !== undefined) {
        setting['mastery.applicable'] = maValue.toString();
        delete setting.mastery_applicable;
      } else if (correctAns !== undefined) {
        setting['show.correct.answer'] = correctAns;
        delete setting.show_correct_answer;
      } else if (tmpEvidence !== undefined) {
        setting['show.evidence'] = tmpEvidence;
        delete setting.show_evidence;
      }
    }

    let data = {
      title: classModel.get('title'),
      class_sharing: classModel.get('classSharing'),
      min_score: classModel.get('minScore') || 0,
      setting: setting || null
    };

    if (!update) {
      data.content_visibility =
        classModel.get('contentVisibility') || ClassModel.VISIBLE_ALL;
    }
    return data;
  },

  /**
   * Serialize a Class object into a JSON representation required by the Update Class endpoint
   *
   * @param classModel The Class model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateClassCoverImage: function(classModel) {
    var classData = this.serializeClassCoverImage(classModel);
    return classData;
  },

  serializeClassCoverImage: function(classModel) {
    let data = {
      cover_image: classModel.get('coverImage')
    };
    return data;
  },

  normalizeReadBulkClassDetails(classes) {
    const normalizedClassDetails = Ember.A([]);
    classes = classes ? classes.class_details : null;
    if (classes && classes.length) {
      classes.map(classData => {
        normalizedClassDetails.push(this.normalizeReadClassInfo(classData));
      });
    }
    return normalizedClassDetails;
  },

  /**
   * Normalize the Read Class info endpoint response
   *
   * @param payload is the endpoint response in JSON format
   * @param {Profile[]} teachers
   * @returns {ClassModel} a class model object
   */
  normalizeReadClassInfo: function(payload, teachers = null) {
    const creatorId = payload.creator_id;
    const collaborators = payload.collaborator || [];

    //when teachers are not provided is creates an onwers from creatorId
    const teachersWrapper = Ember.A(
      teachers || [
        ProfileModel.create({
          id: creatorId
        })
      ]
    );

    let defReadSetting = {
      mastery_applicable: false,
      show_correct_answer: true
    };
    let defReadSettingObj = Ember.Object.create(defReadSetting);
    const basePath = this.get('session.cdnUrls.content');
    const coverImage = payload.cover_image
      ? basePath + payload.cover_image
      : null;
    return ClassModel.create(Ember.getOwner(this).ownerInjection(), {
      id: payload.id,
      creatorId: payload.creator_id,
      owner: teachersWrapper.findBy('id', payload.creator_id),
      code: payload.code,
      title: payload.title,
      description: payload.description,
      courseId: payload.course_id,
      courseTitle: payload.course_title,
      greeting: payload.greeting,
      grade: Array.isArray(payload.grade)
        ? payload.grade.objectAt(0)
        : payload.grade,
      classSharing: payload.class_sharing,
      coverImage: coverImage,
      minScore: payload.min_score === 0 ? null : payload.min_score,
      startDate: payload.created_at,
      endDate: payload.end_date,
      creatorSystem: '',
      contentVisibility: payload.content_visibility || ClassModel.VISIBLE_NONE,
      isArchived: payload.is_archived,
      isPublic: payload.is_public,
      route0Applicable: payload.route0_applicable,
      forceCalculateILP: payload.force_calculate_ilp,
      gradeLowerBound: payload.grade_lower_bound,
      gradeCurrent: payload.grade_current,
      gradeUpperBound: payload.grade_upper_bound,
      primaryLanguage: payload.primary_language,
      roster_id: payload.roster_id,
      collaborators: collaborators.map(function(collaboratorId) {
        return ProfileModel.create({
          id: collaboratorId
        });
      }),
      courseVersion: payload.course_version,
      setting: payload.setting
        ? Ember.Object.create(payload.setting)
        : defReadSettingObj,
      preference: payload.preference
        ? Ember.Object.create(payload.preference)
        : null,
      milestoneViewApplicable: payload.milestone_view_applicable,
      memberCount: payload.member_count || 0
    });
  },

  /**
   * Normalize the response from class members endpoint
   * @param payload is the endpoint response in JSON format
   * @returns {ClassMembersModel} a class members model object
   */
  normalizeReadClassMembers: function(payload) {
    const serializer = this;
    return Ember.Object.create({
      owner: this.get('profileSerializer').normalizeReadProfile(
        payload.details.findBy('id', payload.owner[0])
      ),
      collaborators: serializer.filterCollaborators(payload),
      members: serializer.filterMembers(payload),
      memberGradeBounds: serializer.filterMembersGradeBounds(payload),
      details: payload.details,
      invitees: payload.invitees
    });
  },

  /**
   * Normalize the response from class members endpoint
   * @param payload is the endpoint response in JSON format
   * @returns {ClassMembersModel} a class members model object
   */
  normalizeReadClassContentVisibility: function(payload) {
    return ClassContentVisibilityModel.create({
      contentVisibility: payload.content_visibility,
      course: payload.course
    });
  },

  /**
   * Normalize the user classes endpoint response
   * @param payload The endpoint response in JSON format
   * @returns {Classes} a classes model object
   */
  normalizeClasses: function(payload) {
    const serializer = this;
    const teachers = serializer.normalizeTeachers(
      payload.teacher_details || []
    );
    return ClassesModel.create(Ember.getOwner(this).ownerInjection(), {
      ownerList: payload.owner,
      collaboratorList: payload.collaborator,
      memberList: payload.member,
      memberCount: payload.member_count,
      classes: (function() {
        let normalizedClasses = [];
        if (payload.classes && payload.classes.length) {
          payload.classes.forEach(function(theClass) {
            normalizedClasses.push(
              serializer.normalizeReadClassInfo(theClass, teachers)
            );
          });
        }
        return normalizedClasses;
      })()
    });
  },

  /**
   *
   * @param teachersData
   * @returns {Array}
   */
  normalizeTeachers: function(teachersData) {
    const profileSerializer = this.get('profileSerializer');
    return teachersData.map(function(teacherData) {
      return profileSerializer.normalizeReadProfile(teacherData);
    });
  },

  filterCollaborators: function(payload) {
    return this.filterElements(payload, 'collaborator');
  },

  filterMembers: function(payload) {
    return this.filterElements(payload, 'member');
  },

  filterMembersGradeBounds: function(payload) {
    const membersGradeBounds = payload.member_grade_bounds || [];
    return membersGradeBounds.map(function(memberGradeBounds) {
      return Ember.Object.create(memberGradeBounds);
    });
  },

  filterElements: function(payload, property) {
    const serializer = this;
    let elements = payload[property];
    if (Ember.isArray(elements) && elements.length > 0) {
      return elements
        .map(function(elementId) {
          return serializer
            .get('profileSerializer')
            .normalizeReadProfile(payload.details.findBy('id', elementId));
        })
        .compact();
    } else {
      return [];
    }
  },

  normalizeStudentList(studentList) {
    let listStudent = Ember.A([]);
    studentList.students.forEach(student => {
      listStudent.pushObject(Ember.Object.create(student));
    });
    return listStudent;
  },

  normalizeStudentStatusList(studentList) {
    let listStudent = Ember.A([]);
    Object.keys(studentList.users).map(key =>
      listStudent.pushObject({
        id: studentList.users[key] ? studentList.users[key].id : null,
        email: studentList.users[key] ? studentList.users[key].email : key,
        userName: studentList.users[key]
          ? studentList.users[key].username
          : null,
        firstName: studentList.users[key]
          ? studentList.users[key].first_name
          : null,
        lastName: studentList.users[key]
          ? studentList.users[key].last_name
          : null,
        status: !!studentList.users[key]
      })
    );
    return listStudent;
  }
});
