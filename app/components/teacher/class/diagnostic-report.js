import Ember from 'ember';
import { formatDate, getGradeColor } from 'gooru-web/utils/utils';
import { download } from 'gooru-web/utils/csv';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // ----------------------------------------------------------------------
  // Attributes

  classNames: ['diagnostic-report'],

  // ---------------------------------------------------------------------------
  // Dependencies

  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  i18n: Ember.inject.service(),

  reportService: Ember.inject.service('api-sdk/report'),

  assessmentService: Ember.inject.service('api-sdk/assessment'),

  session: Ember.inject.service('session'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -----------------------------------------------------------------------
  // Properties

  currentClass: null,

  classId: Ember.computed.alias('currentClass.id'),

  diagnosticList: Ember.A(),

  activeItem: null,

  studentLists: Ember.computed('activeItem', function() {
    return this.get('activeItem.students');
  }),

  summaryData: Ember.A([]),

  isShowPortfolioActivityReport: false,

  reportActivityId: null,

  activeStudent: null,

  reportActivityIds: Ember.A(),

  diagnosticTimespent: 0,

  isDomainList: true,

  isShowRegularAssessment: false,
  isViewCompetency: false,
  isShowQuestionReport: false,

  // -----------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.loadData();
  },
  didRender() {
    const component = this;
    component.$('[data-toggle="popover"]').popover({
      trigger: 'hover'
    });
  },

  // ------------------------------------------------------------------------
  // Actions

  actions: {
    onToggle(container) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_EXPAND
      );
      this.$(`.${container}`).slideToggle();
    },
    onClickCompetencies() {
      this.set('isViewCompetency', true);
    },
    onClickStudent() {
      this.set('isViewCompetency', false);
    },
    onCsvDownload(container) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_DOWNLOAD_CSV
      );
      if (container === 'byDomain') {
        const dataParam = {
          classId: this.get('classId')
        };
        if (this.get('isViewCompetency')) {
          this.getDiagnosticAssessment(dataParam).then(allDomain => {
            if (allDomain && allDomain.domains.length) {
              let header = [
                'Domain',
                'Competencies',
                'No.of students answered correctly',
                'Percentage answered correctly'
              ];
              let CSVData = [header];
              let bodyContainer = [];
              allDomain.domains.map(domain => {
                domain.competencies.filter((competency, index) => {
                  const domainName = index === 0 ? domain.domain_name : null;
                  bodyContainer = [
                    domainName,
                    competency.code,
                    competency.students.length,
                    competency.percentage
                  ];
                  CSVData.push(bodyContainer);
                });
              });
              setTimeout(() => {
                if (CSVData) {
                  download(
                    `${this.get('currentClass.title')}_view_competency`,
                    CSVData
                  );
                }
              }, 5000);
            }
          });
        } else {
          const dashboardService = this.get('dashboardService');
          dashboardService.getAllDomain(this.get('classId')).then(allDomain => {
            let CSVData = [];
            if (allDomain.domains.length) {
              allDomain.domains.map(domain => {
                let header = ['Class Name', this.get('currentClass.title')];
                CSVData.push(header);
                let allDomain = [
                  null,
                  `${domain.domain_code} - ${domain.domain_name}`
                ];
                CSVData.push(allDomain);
                if (domain.questions) {
                  let allCompetency = domain.questions.map(item => {
                    return `${item.competency.code} - ${item.competency.name}`;
                  });
                  allCompetency.unshift(null);
                  CSVData.push(allCompetency);
                }
                if (domain.questions) {
                  let allquestion = domain.questions.map(item => {
                    return `${item.sequence_id} - ${item.question_title}`;
                  });
                  allquestion.unshift(null);
                  CSVData.push(allquestion);
                }
                if (domain.questions) {
                  let allOption = domain.questions.map(item => {
                    const optionsData = item.options.map(option => {
                      return option.answer_text;
                    });
                    return optionsData;
                  });
                  allOption.unshift(null);
                  CSVData.push(allOption);
                }
                if (domain.questions) {
                  let allStatus = domain.questions.map(item => {
                    const optionsResult = item.options.find(opt => {
                      return opt.is_correct === 1;
                    });
                    return optionsResult.answer_text;
                  });
                  allStatus.unshift(null);
                  CSVData.push(allStatus);
                }
                let studentResponse = {};
                if (domain.questions) {
                  domain.questions.map(item => {
                    if (item.students) {
                      item.students.map(student => {
                        if (!studentResponse[student.id]) {
                          studentResponse[student.id] = [
                            `${student.last_name} ${student.first_name}`
                          ];
                        }
                        studentResponse[student.id].push(
                          student.responses[0].attempt_status
                        );
                      });
                    }
                  });
                  if (Object.values(studentResponse)) {
                    Object.values(studentResponse).map(stuRes => {
                      let count = stuRes.filter(item => {
                        return item === 'correct';
                      });
                      stuRes.push(
                        `${Math.round(
                          (count.length / domain.questions.length) * 100
                        )}%`
                      );
                    });
                  }
                  CSVData = CSVData.concat(Object.values(studentResponse));
                }
                if (domain.questions) {
                  const individualPercentage = domain.questions.map(
                    question => {
                      let cumulative = [];
                      if (question.students) {
                        question.students.map(student => {
                          if (
                            student.responses[0].attempt_status === 'correct'
                          ) {
                            cumulative.push(
                              student.responses[0].attempt_status
                            );
                          }
                        });
                      }
                      question.percentage = `${Math.round(
                        (cumulative.length / question.students.length) * 100
                      )}%`;
                      return question.percentage;
                    }
                  );
                  individualPercentage.unshift('Cumulative');
                  CSVData.push(individualPercentage);
                }
              });
              setTimeout(() => {
                if (CSVData) {
                  download(
                    `${this.get('currentClass.title')}_view_student`,
                    CSVData
                  );
                }
              }, 5000);
            }
          });
        }
      } else {
        let header = ['Class Name', null, null, null, 'Lo content', null, null];
        let CSVData = [header];
        if (this.get('activeAssessmentItem')) {
          if (this.get('activeAssessmentItem').students) {
            this.get('activeAssessmentItem').students.map(studentData => {
              const studentName = `${studentData.first_name}${studentData.last_name}`;
              header.push(studentName);
            });
          }
          header.push('Cumulative');
          let val;
          let percentageColumn = ['Cumulative', null, null, null, null, null];
          if (this.get('activeAssessmentItem').questions) {
            this.get('activeAssessmentItem').questions.filter((item, index) => {
              let totalCount = 0;
              let correctAnsCount = 0;
              val = [
                this.get('currentClass.title'),
                `${index + 1} - ${item.domain.code} - ${item.domain.name}`,
                `${item.competency.code} - ${item.competency.name}`,
                `${item.sequence_id} - ${item.question_title}`
              ];
              let loContent;
              if (item.loCode && item.loName) {
                loContent = `${item.loCode} - ${item.loName}`;
              } else {
                loContent = '-';
              }
              val.push(loContent);

              const optionsData = item.options.map(option => {
                return option.answer_text;
              });
              val.push(optionsData);
              const optionsResult = item.options.find(opt => {
                return opt.is_correct === 1;
              });
              val.push(optionsResult.answer_text);
              if (this.get('activeAssessmentItem').students) {
                this.get('activeAssessmentItem').students.map(studentData => {
                  let studentQst = studentData.questions.find(qst => {
                    return qst.question_id === item.question_id;
                  });
                  val.push(
                    studentQst && studentQst.status ? studentQst.status : '-'
                  );
                  if (studentQst) {
                    totalCount++;
                    if (studentQst.status === 'correct') {
                      correctAnsCount++;
                    }
                  }
                });
              }
              const questionPercentage = `${Math.round(
                (correctAnsCount / totalCount) * 100
              )}%`;
              val.push(questionPercentage);
              CSVData.push(val);
            });
          }

          if (this.get('activeAssessmentItem').students) {
            this.get('activeAssessmentItem').students.map(studentData => {
              const crtCount = studentData.questions.filter(data => {
                return data.status === 'correct';
              });
              const count = `${Math.round(
                (crtCount.length /
                  this.get('activeAssessmentItem').questions.length) *
                  100
              )}%`;
              percentageColumn.push(count);
            });
          }
          CSVData.push(percentageColumn);

          setTimeout(() => {
            let [row] = CSVData;
            const downloadData = row.map((value, column) =>
              CSVData.map(row => row[column])
            );
            if (downloadData) {
              download(
                `${this.get('currentClass.title')}_assessment`,
                downloadData
              );
            }
          }, 5000);
        }
      }
    },
    onPdfDownload() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_DOWNLOAD_PDF
      );
      window.print();
      document.title = this.get('currentClass').title;
    },
    selectItem(type) {
      if (type === 'domain') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_DOMAIN
        );
      } else if (type === 'assessment') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_ASSESSMENT
        );
      }

      const isselectItem = type === 'domain';
      this.set('isDomainList', isselectItem);
    },
    onSelectDiagnostic(item) {
      this.set('activeItem', item);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_SELLECTED_DOMAIN
      );
      const dataParam = {
        classId: this.get('classId'),
        domain: item.code,
        contentSource: 'domain-diagnostic'
      };
      this.getDiagnosticAssessment(dataParam).then(assessment => {
        if (assessment && assessment.domains.length) {
          assessment.domains.map(domain => {
            this.set('competencyList', domain);
          });
        }
      });
    },
    onSelectAssessment(item) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_SELLECTED_ASSESSMENT
      );
      this.set('activeAssessmentItem', item);
    },

    onGoBack() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BACK
      );
      this.sendAction('onGoBack');
    },

    onSearchStudent() {
      const terms = event.target.value;
      this.searchStudentList(terms);
    },

    onSeeResponse(student) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_SEE_RESPONSE
      );
      this.set('activeStudent', student);
      this.fetchSummaryData(student);
    },
    openPullUp() {
      let component = this;
      component.$().animate(
        {
          top: '10%'
        },
        400
      );
    },
    onClosePullUp() {
      let component = this;
      component.set('isShowQuestionReport', false);
      component.closePullUp(true);
    },
    openQuestionReport(question) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_QUESTION);
      let studentData = component
        .get('activeAssessmentItem.students')
        .map(student => {
          const studentQuestion = student.questions.find(qsn => {
            return qsn.question_id === question.question_id;
          });
          return studentQuestion;
        });
      let correctAns = studentData.filter(content => {
        return content.status === 'correct';
      });
      let wrongAns = studentData.filter(content => {
        return content.status === 'incorrect';
      });
      const correctAnswerUserPrecentage = Math.round(
        (correctAns.length / studentData.length) * 100
      );
      const wrongAnswerUserPrecentage = Math.round(
        (wrongAns.length / studentData.length) * 100
      );
      let params = {
        classId: component.get('classId'),
        courseId: component.get('currentClass.courseId'),
        class: component.get('currentClass'),
        selectedQuestion: question,
        contents: studentData,
        classMembers: this.get('currentClass.members'),
        correctPercentage: correctAnswerUserPrecentage,
        wrongPercentage: wrongAnswerUserPrecentage
      };
      component.set('studentQuestionReportContextData', params);
      this.set('isShowQuestionReport', true);
    },

    onDownload() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_DATA_BY_DIAGNOATIC_BY_DOWNLOAD
      );
    }
  },

  // ---------------------------------------------------------------------
  // Methods
  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  },
  getDiagnosticAssessment(dataParam) {
    const component = this;
    const dashboardService = component.get('dashboardService');
    return dashboardService.getDiagnosticAssessment(dataParam).then(assList => {
      if (assList && assList.domains.length) {
        this.set('isDataNotAvailable', false);
        assList.domains.map(domain => {
          domain.competencies.map(list => {
            const percentage = `${Math.round(
              (list.students.length / list.total_students) * 100
            )}`;
            list.percentage = `${percentage}%`;
            list.percentageColor = getGradeColor(percentage);
            if (list.students.length < 3) {
              list.listTotal = 0;
            } else {
              list.listTotal = list.students.length - 2;
            }
            let student = list.students.map((student, index) => {
              if (index > 1) {
                return `${student.first_name}${student.last_name}`;
              }
            });
            const stu = student.filter(stu => {
              if (stu !== undefined) {
                return stu;
              }
            });
            list.studName = stu.length ? stu.join(',') : null;
          });
        });
        return assList;
      } else {
        this.set('isDataNotAvailable', true);
      }
    });
  },

  loadData() {
    const component = this;
    const dashboardService = component.get('dashboardService');
    const classId = component.get('classId');
    const currentClass = component.get('currentClass');
    const preference = currentClass.get('preference') || {};
    let params = {
      classId,
      from: formatDate(currentClass.get('startDate'), 'YYYY-MM-DD'),
      to: moment().format('YYYY-MM-DD')
    };
    dashboardService
      .fetchDiagnasticStats(params, preference.framework)
      .then(diagnosticList => {
        component.set('diagnosticList', diagnosticList);
        const activeItem = diagnosticList.get(0);
        component.set('activeItem', activeItem);
        let allDiagnosticCompetency = [];
        diagnosticList.map(diagDomain => {
          if (diagDomain.students) {
            diagDomain.students.map(student => {
              allDiagnosticCompetency.push(student);
            });
          }
        });
        component.set('allDiagnosticCompetency', allDiagnosticCompetency);
        if (activeItem) {
          const dataParam = {
            classId: classId,
            domain: component.get('activeItem').code,
            contentSource: 'domain-diagnostic'
          };
          component.getDiagnosticAssessment(dataParam).then(assessment => {
            if (assessment && assessment.domains.length) {
              assessment.domains.map(domain => {
                component.set('competencyList', domain);
              });
            }
          });
        }
        const data = {
          classId: classId
        };
        component.getDiagnosticAssessment(data).then(allDomain => {
          let allCompetency = [];
          if (allDomain && allDomain.domains) {
            allDomain.domains.map(domain => {
              domain.competencies.map(competency => {
                allCompetency.push(competency);
              });
            });
          }
          this.set('allCompetency', allCompetency);
        });
      });

    dashboardService
      .fetchAssessment(classId, preference.framework)
      .then(assessmentList => {
        if (assessmentList.length) {
          this.set('isShowRegularAssessment', true);
        }
        const diagData = assessmentList.length ? assessmentList : [];
        component.set('assessmentList', diagData);
        component.set('activeAssessmentItem', diagData.get(0));
      });
  },

  searchStudentList(terms) {
    const component = this;
    let convertText = text => (text ? text.toLowerCase() : text);
    const studentList = component.get('activeItem.students');
    const filteredStudent = Ember.copy(studentList).filter(student => {
      return (
        convertText(student.lastName).startsWith(convertText(terms)) ||
        convertText(student.firstName).startsWith(convertText(terms))
      );
    });
    component.set('studentLists', filteredStudent);
  },

  fetchSummaryData(student) {
    const component = this;
    const classId = component.get('classId');
    const activeItem = component.get('activeItem');
    const reportService = component.get('reportService');
    const params = {
      classId,
      userId: student.id,
      domainCode: activeItem.code,
      contentSource: 'coursemap'
    };
    reportService.fetchDiagnosticSummaryData(params).then(summaryData => {
      if (summaryData.length) {
        let reportActivityId = summaryData[0].collectionId;
        let reportActivityIds = summaryData.mapBy('collectionId').uniq();
        const totalTimespent = summaryData.reduce(
          (total, item) => total + item.timespent,
          0
        );
        component.set('diagnosticTimespent', totalTimespent);
        component.set('reportActivityIds', reportActivityIds);
        component.set('reportActivityId', reportActivityId);
        component.set('summaryData', summaryData);
        component.set('isShowPortfolioActivityReport', true);
      }
    });
  }
});
