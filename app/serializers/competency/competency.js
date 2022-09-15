import Ember from 'ember';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer for Competency endpoints
 *
 * @typedef {Object} CompetencySerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Normalized data of user competencies
   * @return {Object}
   */
  normalizeUserCompetencies: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.competencyList);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalized data of user performance competency collections
   * @return {Object}
   */
  normalizeUserPerformanceCompetencyCollections: function(response) {
    let resultSet = Ember.A();
    if (response) {
      response = Ember.A(response.collections);
      response.forEach(data => {
        let result = Ember.Object.create(data);
        resultSet.pushObject(result);
      });
    }
    return resultSet;
  },

  /**
   * Normalized data of  competency matrix coordinates
   * @return {Object}
   */
  normalizeCompetencyMatrixCoordinates: function(response) {
    let resultSet = Ember.Object.create(response);
    Object.keys(response).forEach(key => {
      let result = Ember.A();
      resultSet.get(key).forEach(data => {
        result.pushObject(Ember.Object.create(data));
      });
      resultSet.set(key, result);
    });
    return resultSet;
  },

  /**
   * Normalized data of user course competency matrix
   * @return {Object}
   */
  normalizeCompetencyMatrixCourse: function(response) {
    let resultSet = Ember.A();
    let courses = Ember.A();
    if (response.userCompetencyMatrix) {
      let userCourseCompetencyMatrix = Ember.A(response.userCompetencyMatrix);
      userCourseCompetencyMatrix.forEach(courseData => {
        let course = Ember.Object.create(courseData);
        let competencies = course.get('competencies');
        let competencySet = Ember.A();
        competencies.forEach(data => {
          let competency = Ember.Object.create(data);
          competencySet.pushObject(competency);
        });
        course.set('competencies', competencySet);
        courses.pushObject(course);
      });
    }
    resultSet = {
      courses: courses,
      lastUpdated: response.lastUpdated || null
    };
    return resultSet;
  },
  /**
   * Normalized data of signature content competencies
   * @return {Object}
   */
  normalizeSignatureCompetencies: function(response) {
    return response;
  },

  /**
   * Normalized data of user  domain competency matrix
   * @return {Object}
   */
  normalizeCompetencyMatrixDomain: function(response) {
    let resultSet = Ember.A();
    let domains = Ember.A();
    let lastUpdated = null;
    if (response && response.userCompetencyMatrix) {
      let userCompetencyMatrix = Ember.A(response.userCompetencyMatrix);
      lastUpdated = response.lastUpdated || response.createdAt;
      userCompetencyMatrix.forEach(domainData => {
        let domain = Ember.Object.create(domainData);
        let competencies = domain.get('competencies');
        let competencySet = Ember.A();
        competencies.forEach(data => {
          competencySet.pushObject(Ember.Object.create(data));
        });
        domain.set('competencies', competencySet);
        domains.pushObject(domain);
      });
    }
    resultSet = {
      domains,
      lastUpdated
    };
    return resultSet;
  },

  /**
   * Normalized data of competency matrix
   * @return {Object}
   */
  normalizeCompetencyMatrix: function(response) {
    let resultSet = Ember.A();
    if (response.userCompetencyMatrix) {
      let userCompetencyMatrix = Ember.A(response.userCompetencyMatrix);
      userCompetencyMatrix.forEach(courseData => {
        let course = Ember.Object.create(courseData);
        let domains = course.get('domains');
        let domainSet = Ember.A();
        domains.forEach(domainData => {
          let domain = Ember.Object.create(domainData);
          let competencies = domain.get('competencies');
          let competencySet = Ember.A();
          competencies.forEach(competencyData => {
            let competency = Ember.Object.create(competencyData);
            competencySet.pushObject(competency);
          });
          domain.set('competencies', competencySet);
          domainSet.pushObject(domain);
        });
        course.set('domains', domainSet);
        resultSet.pushObject(course);
      });
    }
    return resultSet;
  },

  /**
   * Normalized data of domain ompetency matrix
   * @return {Object}
   */
  normalizeDomainTopicMatrix(response) {
    const context = Ember.Object.create({
      ...response.context
    });
    let domainCompetencies = [];
    let students = [];
    if (response.domainCompetencies) {
      domainCompetencies = this.normalizeDomainTopicCompetencyMatrix(
        Ember.A(response.domainCompetencies),
        false
      );
    }
    if (response.students) {
      const studentList = Ember.A(response.students);
      students = studentList.map(student => {
        const userCompetencyMatrix = this.normalizeDomainTopicCompetencyMatrix(
          Ember.A(student.userCompetencyMatrix),
          true
        );
        return Ember.Object.create({
          id: student.id,
          userCompetencyMatrix
        });
      });
    }
    return Ember.Object.create({
      context,
      domainCompetencies,
      students
    });
  },

  /**
   * Normalized data of domain, topic, competency matrix
   * @return {Array}
   */
  normalizeDomainTopicCompetencyMatrix(domainCompetencies, isStudentMatrix) {
    let payload = Ember.A();
    domainCompetencies.forEach(domainCompetency => {
      const domain = Ember.Object.create({});
      const domainTopics = domainCompetency.topics || [];
      let competencySet = Ember.A();
      domainTopics.forEach(domainTopic => {
        const topic = Ember.Object.create(domainTopic);
        const competencies = topic.get('competencies');
        competencies.forEach(competencyData => {
          let competency;
          if (isStudentMatrix) {
            competency = Ember.Object.create({});
            const competencyKey = Object.keys(competencyData);
            const competencyCode = competencyKey[0];
            competency.set('competencyCode', competencyCode);
            competency.set('competencyStatus', competencyData[competencyCode]);
          } else {
            competency = Ember.Object.create(competencyData);
          }
          competency.set('topicCode', topic.get('topicCode'));
          competency.set('topicName', topic.get('topicName'));
          competency.set('topicSeq', topic.get('topicSeq'));
          competencySet.pushObject(competency);
        });
        domain.set('competencies', competencySet);
      });
      domain.set('domainCode', domainCompetency.domainCode);
      domain.set('domainName', domainCompetency.domainName);
      domain.set('domainSeq', domainCompetency.domainSeq);
      payload.push(domain);
    });
    return payload;
  },

  /**
   * @function normalizeDomainsCompletionReport
   */
  normalizeDomainsCompletionReport(payload) {
    const serializer = this;
    let normalizedCompletionReportData = Ember.Object.create({
      membersCount: 0,
      domainsData: Ember.A([])
    });
    if (payload) {
      let normalizedDomainsCompletionData = Ember.A([]);
      let domainsCompletionData = payload.domains || payload.dmns;
      domainsCompletionData.map(domainCompletionData => {
        let domainCompletionDomainInfo =
          domainCompletionData.domain || domainCompletionData.d;
        let domainData = Ember.Object.create({
          completionPercentage:
            domainCompletionData.average_completions ||
            domainCompletionData.avg ||
            0,
          domainCode:
            domainCompletionDomainInfo.tx_domain_code ||
            domainCompletionDomainInfo.dc,
          domainName:
            domainCompletionDomainInfo.tx_domain_name ||
            domainCompletionDomainInfo.dn,
          domainSeq:
            domainCompletionDomainInfo.tx_domain_seq ||
            domainCompletionDomainInfo.seq,
          competenciesData: serializer.serializeCompetencyCompletionData(
            domainCompletionData.competencies || domainCompletionData.tx
          )
        });
        normalizedDomainsCompletionData.pushObject(domainData);
      });
      normalizedCompletionReportData.set(
        'membersCount',
        payload.member_count || payload.cmc
      );
      normalizedCompletionReportData.set(
        'domainsData',
        normalizedDomainsCompletionData
      );
    }
    return normalizedCompletionReportData;
  },

  /**
   * @function normalizeCompetencyCompletionReport
   */
  serializeCompetencyCompletionData(competenciesData) {
    let normalizedCompetencyCompletionReport = Ember.A([]);
    if (competenciesData) {
      competenciesData.map(competencyCompletionData => {
        let competencyData = Ember.Object.create({
          competencyCode:
            competencyCompletionData.tx_comp_code ||
            competencyCompletionData.gc,
          competencyName:
            competencyCompletionData.tx_comp_name ||
            competencyCompletionData.nm,
          competencyDesc:
            competencyCompletionData.tx_comp_desc ||
            competencyCompletionData.ds,
          completionPercentage:
            competencyCompletionData.completions ||
            competencyCompletionData.pc ||
            0
        });
        normalizedCompetencyCompletionReport.pushObject(competencyData);
      });
    }
    return normalizedCompetencyCompletionReport;
  },

  /**
   * @function normalizeUsersCompetencyPerformanceSummary
   */
  normalizeUsersCompetencyPerformanceSummary(payload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    let normalizedUsersCompetencyPerformanceSummary = Ember.A([]);
    let usersPerformanceSummaryList =
      (payload && (payload.users || payload.us)) || Ember.A([]);
    if (usersPerformanceSummaryList) {
      usersPerformanceSummaryList.map(userPerformanceSummary => {
        let userData = userPerformanceSummary.user || userPerformanceSummary.u;
        let userThumbnail = userData.thumbnail || userData.th;
        let thumbnail = userThumbnail
          ? basePath + userThumbnail
          : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
        let userPerformanceData = Ember.Object.create({
          id: userData.id,
          firstName: userData.first_name || userData.fn,
          lastName: userData.last_name || userData.ln,
          thumbnail,
          status:
            userPerformanceSummary.status || userPerformanceSummary.st || 0
        });
        normalizedUsersCompetencyPerformanceSummary.pushObject(
          userPerformanceData
        );
      });
    }
    return normalizedUsersCompetencyPerformanceSummary;
  },

  /**
   * Normalized data of Competency Completion Stats for Classes
   * @return {Object}
   */
  normalizeCompetencyCompletionStats: function(response) {
    let resultSet = Ember.A();
    if (response && Ember.isArray(response.competencyStats)) {
      response = Ember.A(response.competencyStats);
      response.forEach(data => {
        let result = Ember.Object.create(data);
        resultSet.pushObject(result);
      });
    }
    return resultSet;
  },

  /**
   * @function normalizeStudentCompetencySummary
   * Method to normalize student competency summary data
   */
  normalizeStudentCompetencySummary(response) {
    let studentCompetencySummary = null;
    if (response && response.competencyStats) {
      response = response.competencyStats;
      studentCompetencySummary = Ember.Object.create({
        completedCompetencies: response.completedCompetencies,
        grade: response.grade,
        gradeId: response.grade,
        inprogressCompetencies: response.inprogressCompetencies,
        percentCompletion: response.percentCompletion,
        percentScore: response.percentScore,
        totalCompetencies: response.totalCompetencies,
        notstartedCompetencies:
          response.totalCompetencies -
          (response.completedCompetencies + response.inprogressCompetencies)
      });
    }
    return studentCompetencySummary;
  },

  // TODO serialize has to be updated
  serializeDomainTopicCompetency(response) {
    return response.userCompetencyMatrix;
  },

  // TODO serialize has to be updated
  serializeDomainTopicMetadata(response) {
    return response;
  },

  /**
   * @function serializeClassCompetencyReport
   * @param {Object} payload
   */
  serializeClassCompetencyReport(payload) {
    if (payload && payload.students) {
      const dtcInfo = payload.domainCompetencies;
      const serializedReport = Ember.Object.create({
        context: payload.context,
        students: Ember.A([]),
        domainCompetencies: this.normalizeDomainCompetencies(dtcInfo)
      });
      payload.students.map(student => {
        const studentData = Ember.Object.create({
          id: student.id
        });
        const userCompetencyMatrix = Ember.A([]);

        student.userCompetencyMatrix.map(stuCompMatrix => {
          let domainList = dtcInfo.findBy(
            'domainCode',
            stuCompMatrix.domainCode
          );
          if (domainList) {
            let { topics, ...domainData } = domainList;
            domainData.topics = Ember.A([]);
            // TODO old layouts use domain.competencies, need to update and deprecate it
            domainData.competencies = Ember.A([]);
            domainData = Ember.Object.create(domainData);
            stuCompMatrix.topics.sortBy('topicSeq').map(stuTopic => {
              let topicList = topics.findBy('topicCode', stuTopic.topicCode);
              if (topicList) {
                let { competencies, ...topicData } = topics.findBy(
                  'topicCode',
                  stuTopic.topicCode
                );
                topicData.competencies = Ember.A([]);
                topicData = Ember.Object.create(topicData);
                stuTopic.competencies.sortBy('competencySeq').map(stuComp => {
                  let competencyList = competencies.findBy(
                    'competencyCode',
                    Object.keys(stuComp)[0]
                  );
                  if (competencyList) {
                    const competencyData = Ember.Object.create(competencyList);
                    competencyData.setProperties({
                      topicCode: topicData.topicCode,
                      topicSeq: topicData.topicSeq,
                      topicName: topicData.topicName,
                      domainCode: domainData.domainCode,
                      domainName: domainData.domainName,
                      domainSeq: domainData.domainSeq,
                      competencyStatus:
                        stuComp[competencyData.get('competencyCode')]
                    });
                    topicData.get('competencies').pushObject(competencyData);
                  }
                });
                topicData.set(
                  'competencies',
                  topicData.get('competencies').sortBy('competencySeq')
                );
                domainData
                  .get('topics')
                  .pushObject(Ember.Object.create(topicData));
                domainData.set(
                  'competencies',
                  domainData
                    .get('competencies')
                    .concat(topicData.get('competencies'))
                );
              }
            });

            userCompetencyMatrix.pushObject(Ember.Object.create(domainData));
          }
        });
        studentData.set(
          'userCompetencyMatrix',
          userCompetencyMatrix.sortBy('domainSeq')
        );
        serializedReport.get('students').pushObject(studentData);
      });
      return serializedReport;
    }
    return null;
  },

  normalizeCompetencyStudents(payload) {
    let competency = payload.data ? payload.data : {};
    return Ember.Object.create({
      competencyCode: competency.competency_code,
      displayCode: competency.display_code,
      title: competency.title,
      students: this.normalizeStudentsList(competency.students),
      description: competency.description
        ? competency.description
        : competency.title
    });
  },

  normalizeStudentsList(students) {
    let studentsList = students ? students : [];
    let results = Ember.A();
    const basePath = this.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    studentsList.forEach(student => {
      let studentObj = Ember.Object.create({
        userId: student.user_id,
        firstName: student.first_name,
        lastName: student.last_name,
        thumbnailUrl: student.thumbnail
          ? basePath + student.thumbnail
          : appRootPath + DEFAULT_IMAGES.USER_PROFILE,
        status: student.status,
        score: student.score,
        suggestions: student.suggestions
      });
      results.pushObject(studentObj);
    });
    return results;
  },

  /**
   * @function normalizeDomainCompetencies
   * @param {Array} domainCompetencies
   */
  normalizeDomainCompetencies(domainCompetencies) {
    return domainCompetencies.map(domainCompetency => {
      let { topics, ...domain } = domainCompetency;
      domain = Ember.Object.create(domain);
      domain.set('competencies', Ember.A([]));
      domain.set('topics', Ember.A([]));
      topics.map(domainTopic => {
        let { competencies, ...topic } = domainTopic;
        topic = Ember.Object.create(topic);
        topic.set('competencies', Ember.A([]));
        competencies.map(competencyData => {
          let competency;
          competency = Ember.Object.create(competencyData);
          competency.set('topicCode', topic.get('topicCode'));
          competency.set('topicName', topic.get('topicName'));
          competency.set('topicSeq', topic.get('topicSeq'));
          competency.set('domainName', domain.get('domainName'));
          competency.set('domainCode', domain.get('domainCode'));
          competency.set('domainSeq', domain.get('domainSeq'));

          topic.get('competencies').pushObject(competency);
        });
        topic.set(
          'competencies',
          topic.get('competencies').sortBy('competencySeq')
        );
        domain.set(
          'competencies',
          domain.get('competencies').concat(topic.get('competencies'))
        );
        domain.get('topics').pushObject(topic);
      });
      // domain.set('competencies', domain.get('competencies').sortBy('competencySeq'));
      return domain;
    });
  },

  normalizeCompetency(payload) {
    let competencyStatus = Ember.A();
    let payloadData = payload.competencyStatus ? payload.competencyStatus : [];
    if (payloadData.length) {
      competencyStatus = Ember.A(
        payloadData.map(item => Ember.Object.create(item))
      );
    }
    return competencyStatus;
  },

  normalizeLJCompetency(payload) {
    let competencies = payload.competencies ? payload.competencies : [];
    return competencies;
  }
});
