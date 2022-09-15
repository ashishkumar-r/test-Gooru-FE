import Ember from 'ember';

import PerformanceSerializer from './performance';
import Utils from 'gooru-web/utils/utils';

/**
 * Serializer for Class Performance model
 *
 * @typedef {Object} ClassPerformanceSerializer
 */
export default PerformanceSerializer.extend({
  /**
   * Normalizes the response for the QueryRecord method
   * @param store
   * @param primaryModelClass
   * @param payload
   * @returns {Performance|Performance[]} returns a Class Performance object or Performance array
   */
  normalizeQueryRecordResponse: function(store, primaryModelClass, payload) {
    const serializer = this;
    let lenVal = 0;
    if (payload.content !== undefined) {
      lenVal = payload.content.length;
    }
    const hasResults = lenVal > 0;
    var model = {
      data: {
        id: Utils.generateUUID(),
        type: 'performance/class-performance',
        relationships: {
          studentPerformanceData: { data: [] }
        }
      },
      included: []
    };
    if (hasResults) {
      const results = payload.content;
      Ember.$.each(results, function(index, result) {
        if (result.userUid === undefined) {
          result.userUid = result.userId;
        }
        model.data.relationships.studentPerformanceData.data.push(
          serializer.normalizeStudentPerformanceId(result.userUid)
        );
        serializer.normalizeStudentPerformanceAttributes(
          result.usageData,
          result.userUid,
          model
        );
      });
    }

    return model;
  },

  /**
   * Normalizes the response for student performance
   * @param userId
   * @returns {id: userId |type} returns an object
   */
  normalizeStudentPerformanceId: function(userId) {
    return {
      id: userId,
      type: 'performance/student-performance'
    };
  },

  /**
   * Normalizes the response for user
   * @param userId
   * @returns {id: userId|type} returns an object
   */
  normalizeUserId: function(userId) {
    return {
      id: userId,
      type: 'user/user'
    };
  },

  /**
   * Normalizes the response for user
   * @param payload
   * @param userId
   * @param classPerformanceModel
   * @returns
   */
  normalizeStudentPerformanceAttributes: function(
    payload,
    userId,
    classPerformanceModel
  ) {
    var serializer = this;
    var studentPerformanceModel = {
      id: userId,
      type: 'performance/student-performance',
      relationships: {
        user: { data: {} },
        performanceData: { data: [] }
      }
    };
    Ember.$.each(payload, function(index, performance) {
      //Adding performance id and type in performanceData of studentPerformanceModel
      studentPerformanceModel.relationships.performanceData.data.push(
        serializer.normalizePerformanceId(performance, userId)
      );

      //Adding performance model in included, it could be more than one for each user
      classPerformanceModel.included.push(
        serializer.normalizePerformanceAttributes(performance, userId)
      );
    });

    //Adding user id and type in relationships - user -data
    studentPerformanceModel.relationships.user.data = serializer.normalizeUserId(
      userId
    );

    //Adding studentPerformance in included
    classPerformanceModel.included.push(studentPerformanceModel);

    //Adding the user model in included
    classPerformanceModel.included.push(serializer.normalizeUserId(userId));
  }
});
