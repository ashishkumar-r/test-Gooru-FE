import Ember from 'ember';
import ContentEditMixin from 'gooru-web/mixins/content/edit';
import {
  QUESTION_CONFIG,
  QUESTION_TYPES,
  BASE_WORDS_QUESTIONS
} from 'gooru-web/config/question';
import {
  CONTENT_TYPES,
  EDUCATION_CATEGORY,
  RUBRIC_OFF_OPTIONS,
  SERP_ENCODING_QUESTION_TYPE,
  SERP_PREFIX,
  SCIENTIFIC_TYPES
} from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import ScientificFillInTheBlank from 'gooru-web/utils/question/scientific-fill-in-the-blank';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';
import {
  replaceMathExpression,
  removeHtmlTags,
  etlSecCalculation
} from 'gooru-web/utils/utils';
import Rubric from 'gooru-web/models/rubric/rubric';
import {
  getCategoryCodeFromSubjectId,
  getSubjectId,
  getGutCodeFromSubjectId
} from 'gooru-web/utils/taxonomy';
import Question from 'gooru-web/models/content/question';
import Answer from 'gooru-web/models/content/answer';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
export default Ember.Component.extend(
  ContentEditMixin,
  ModalMixin,
  ConfigurationMixin,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:notifications
     */
    notifications: Ember.inject.service(),

    /**
     * @requires service:api-sdk/question
     */
    questionService: Ember.inject.service('api-sdk/question'),

    /**
     * @requires service:api-sdk/profile
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @requires service:api-sdk/media
     */
    mediaService: Ember.inject.service('api-sdk/media'),
    /**
     * @type {SessionService} Service to retrieve session information
     */
    session: Ember.inject.service('session'),

    /**
     * @requires service:i18n
     */
    i18n: Ember.inject.service(),

    /**
     * @property {Service} rubric service
     */
    rubricService: Ember.inject.service('api-sdk/rubric'),

    userId: Ember.computed.alias('session.userId'),

    strugglingCompetencyService: Ember.inject.service(
      'api-sdk/struggling-competency'
    ),
    /**
     * @property {CollectionService} Collection service API SDK
     */
    collectionService: Ember.inject.service('api-sdk/collection'),

    /**
     * @property {AssessmentService} Assessment service API SDK
     */
    assessmentService: Ember.inject.service('api-sdk/assessment'),

    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['content', 'questions', 'gru-questions-edit'],

    tagName: 'article',

    paramsData: Ember.computed(function() {
      let params = {};
      let isPreviewReferrer = this.get('isPreviewReferrer');
      if (isPreviewReferrer) {
        params.isPreviewReferrer = true;
      }
      return params;
    }),

    answerDetails: Ember.computed('question', function() {
      const component = this;
      if (
        component.get('question.isScientificFIB') &&
        component.get('question.answerDetails')
      ) {
        let answerResult = component.get('question.answerDetails');
        return answerResult.map(function(choice) {
          let data = Ember.Object.create({
            answer_text: choice.answer_text,
            answer_category: choice.answer_category,
            answer_type: 'text',
            correct_answer: ''
          });
          if (
            choice.answer_text.indexOf('[]') !== -1 &&
            choice.correct_answer.length > 0
          ) {
            let answerText = choice.answer_text.split('[]');
            let correctAnswer = choice.correct_answer;
            let values = '';
            answerText.forEach(function(item, index) {
              if (correctAnswer[index]) {
                values += `${item}[${correctAnswer[index]}]`;
              }
            });

            data.set('answer_text', values);
          }

          return data;
        });
      } else {
        let array = Ember.A(Object.values(SCIENTIFIC_TYPES));
        return array.map(function(choice) {
          let data = Ember.Object.create({
            answer_text: '',
            answer_type: 'text',
            correct_answer: '',
            answer_category: choice
          });

          return data;
        });
      }
    }),

    hintExplanationDetail: Ember.computed('question', function() {
      let hintDetails = this.get('question.hints');
      let hintData = Object.values(SCIENTIFIC_TYPES);
      let hintList = Ember.A([]);
      if (!Array.isArray(hintDetails)) {
        hintData.map(function(choice) {
          let data = Ember.Object.create({
            answer_category: choice,
            hints: hintDetails ? hintDetails[`${choice}_explanation`] : ''
          });
          hintList.pushObject(data);
        });
      } else {
        hintList = hintDetails;
      }
      return hintList;
    }),

    answerFreeResDetails: Ember.computed('question', function() {
      if (this.get('question.answerDetails')) {
        return this.get('question.answerDetails');
      } else {
        let array = Ember.A(Object.values(SCIENTIFIC_TYPES));
        return array.map(function(choice) {
          let data = Ember.Object.create({
            answer_type: 'text',
            answer_category: choice
          });
          return data;
        });
      }
    }),
    isExemplarView: false,

    /**
     * @property {Boolean} isSERPType
     */
    isSERPType: false,
    /**
     * @property {Boolean} isPause
     */
    isPause: false,
    /*
     * Hold the audio details
     */
    audioRecorder: null,
    /**
     * DidInsertElement ember event
     */
    isExemplaravail: false,

    isLoader: false,

    isAudioUploadFail: false,

    isStruggleUpdate: false,

    editingContent: null,

    showPartialScore: true,

    isPartialScore: false,

    readActivity: null,

    linkedContentError: false,

    linkedSequenceError: false,

    disableExemplar: Ember.computed('question', function() {
      let question = this.get('question');
      let types = ['SERP_VT', 'SERP_CS', 'SERP_IB'];
      return types.indexOf(question.type) !== -1;
    }),

    isCheckedOption: Ember.computed(function() {
      const checkedValue = this.get('defaultReadCheckActivity').find(item => {
        return item.checked === true;
      });
      return checkedValue.id === 1
        ? this.get('i18n').t('common.second')
        : this.get('i18n').t('common.first');
    }),

    defaultReadCheckActivity: Ember.computed(function() {
      const defaultReadCheckActivity = [
        {
          type: 'radio',
          checked: false,
          name: 'radio',
          value: this.get('i18n').t('common.first-read'),
          id: 1
        },
        {
          type: 'radio',
          checked: false,
          name: 'radio',
          value: this.get('i18n').t('common.second-read'),
          id: 2
        }
      ];
      if (
        this.get('tempQuestion') &&
        this.get('tempQuestion').metadata &&
        this.get('tempQuestion').metadata.linked_content &&
        this.get('tempQuestion').metadata.linked_content.read_sequence_id
      ) {
        defaultReadCheckActivity.map(item => {
          if (
            item.id ===
            this.get('tempQuestion').metadata.linked_content.read_sequence_id
          ) {
            item.checked = true;
          }
        });
      }
      if (this.get('tempQuestion') && this.get('tempQuestion').metadata) {
        if (!this.get('tempQuestion').metadata.linked_content) {
          defaultReadCheckActivity[0].checked = true;
        }
        const linkedContent = {
          read_sequence_id: defaultReadCheckActivity[0].id
        };
        const linked_content = Ember.Object.create(linkedContent);
        this.get('tempQuestion').metadata = {
          linked_content: linked_content
        };
      }
      return defaultReadCheckActivity;
    }),

    didRender() {
      const component = this;
      /**
       * method used to listen the events from iframe.
       **/
      function receiveMessage(event) {
        if (event.data === 'loading_completed') {
          component.set('isLoading', false);
        }
      }

      window.addEventListener('message', receiveMessage, false);
    },

    didInsertElement: function() {
      if (
        this.get('question').get('type') &&
        this.get('question')
          .get('type')
          .includes(SERP_PREFIX)
      ) {
        this.set('isSERPType', true);
      }
      if (
        this.get('question').get('type') === 'MA' ||
        this.get('question').get('type') === 'FIB' ||
        this.get('question').get('type') === 'HS_TXT' ||
        this.get('question').get('type') === 'SERP_IB' ||
        this.get('question').get('type') === 'SERP_EA' ||
        this.get('question').get('type') === 'SERP_VT' ||
        this.get('question').get('type') === 'SERP_CS' ||
        this.get('question').get('type') === 'SERP_SD' ||
        this.get('question').get('type') === 'SERP_SO' ||
        this.get('question').get('type') === 'SERP_CL' ||
        this.get('question').get('type') === 'SERP_IVSA' ||
        this.get('question').get('type') === 'HS_IMG' ||
        this.get('question').get('type') === 'HT_RO' ||
        this.get('question').get('type') === 'MTF'
      ) {
        this.set('isPartialScore', true);
      }

      let questionEvidenceVisibility = this.get('questionEvidenceVisibility');
      if (questionEvidenceVisibility) {
        let contentSubformat = this.get('question').get('content_subformat');
        let contentSubformatKeyCheck =
          contentSubformat in questionEvidenceVisibility;
        let contentSubformatCheck =
          questionEvidenceVisibility[contentSubformat];
        this.set('contentSubformatKeyCheck', contentSubformatKeyCheck);
        this.set('contentSubformatCheck', contentSubformatCheck);
      }

      this.scrollToFirstEditor();
      if (
        this.get('question').courseId &&
        this.get('question').type === 'SERP_WPM'
      ) {
        this.fetchReadactivity(this.get('question').courseId);
      }
    },
    fetchReadactivity(courseId) {
      let component = this;
      let sourceQuestionId = null;
      if (
        component.get('question') &&
        component.get('question').metadata &&
        component.get('question').metadata.linked_content &&
        component.get('question').metadata.linked_content.linked_content_id
      ) {
        sourceQuestionId = component.get('question').metadata.linked_content
          .linked_content_id;
      }
      component
        .get('questionService')
        .fetchReadactivity(courseId, sourceQuestionId)
        .then(function(readActivity) {
          if (readActivity.linked_question) {
            component.set('selectReadActivity', readActivity.linked_question);
          }
          if (readActivity.related_questions.length) {
            const readActivityQst = readActivity.related_questions.filter(
              item => {
                return item.question_id !== component.get('question').id;
              }
            );
            component.set('readActivity', readActivityQst);
          } else {
            component.set('readActivity', readActivity.related_questions);
          }
        });
    },
    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * Edit Content
       */

      onShowPartialScore: function(isChecked) {
        if (isChecked) {
          this.set('tempQuestion.isPartialEnable', isChecked);
          this.set('showPartialScore', isChecked);
        } else {
          this.set('tempQuestion.isPartialEnable', isChecked);
          this.set('showPartialScore', isChecked);
        }
      },

      onShowEvidence: function(isChecked) {
        if (isChecked) {
          this.set('tempQuestion.isEvidenceEnabled', isChecked);
        } else {
          this.set('tempQuestion.isEvidenceEnabled', isChecked);
        }
      },

      selectReadActivity: function(activityItem) {
        this.get('tempQuestion').set(
          'linked_content_id',
          activityItem.question_id
        );
        if (this.get('linkedContentError')) {
          this.set('linkedContentError', false);
        }
        this.set('selectReadActivity', activityItem);
        if (
          this.get('tempQuestion').metadata &&
          this.get('tempQuestion').metadata.linked_content
        ) {
          this.get('tempQuestion').metadata.linked_content.linked_content_id =
            activityItem.question_id;
        } else {
          const linkedContent = {
            linked_content_id: activityItem.question_id
          };
          const linked_content = Ember.Object.create(linkedContent);
          this.get('tempQuestion').metadata = {
            linked_content: linked_content
          };
        }
      },

      selectReadOption: function(item) {
        const isCheckedOption =
          item.id === 1
            ? this.get('i18n').t('common.second')
            : this.get('i18n').t('common.first');
        this.set('isCheckedOption', isCheckedOption);
        this.get('defaultReadCheckActivity').map(activity => {
          if (activity.id === item.id) {
            if (activity.checked) {
              Ember.set(activity, 'checked', false);
              delete this.get('tempQuestion').metadata.linked_content
                .read_sequence_id;
            } else {
              this.get('tempQuestion').set('read_sequence_id', item.id);
              if (
                this.get('tempQuestion').metadata &&
                this.get('tempQuestion').metadata.linked_content
              ) {
                this.get(
                  'tempQuestion'
                ).metadata.linked_content.read_sequence_id = item.id;
              } else {
                const linkedContent = {
                  read_sequence_id: item.id
                };
                const linked_content = Ember.Object.create(linkedContent);
                this.get('tempQuestion').metadata = {
                  linked_content: linked_content
                };
              }
              Ember.set(activity, 'checked', true);
            }
          } else {
            Ember.set(activity, 'checked', false);
          }
        });
        if (this.get('linkedSequenceError')) {
          this.set('linkedSequenceError', false);
        }
      },

      exemplarView: function() {
        this.set('isExemplarView', !this.isExemplarView);
      },
      editContent: function() {
        var component = this;
        var questionForEditing = this.get('question').copy();
        var tempQuestion = this.get('tempQuestion');
        var tempData;
        if (tempQuestion) {
          tempData = Question.create(
            Ember.getOwner(component).ownerInjection(),
            {
              ...tempQuestion,
              ...questionForEditing
            }
          );
        }
        this.set(
          'tempQuestion',
          tempData ? tempData.copy() : questionForEditing
        );
        this.set('isEditing', true);
        this.set('rubricError', false);
        this.set('isScientificEdit', true);
      },
      /**
       * Send request to publish a question
       */
      sendRequest: function() {
        this.set('wasRequestSent', true);
      },

      /**
       * Edit rubric questions to pass backUrl to backbutton.
       */
      rubricQuestionEdit: function() {
        let queryParams = {
          backUrl: this.get('router.url')
        };
        this.get('router').transitionTo(
          'content.rubric.edit',
          this.get('rubric.id'),
          {
            queryParams
          }
        );
      },

      /**
       * Select question type
       */
      selectType: function(type) {
        this.set('tempQuestion.type', type);
      },
      /**
       * Save Content
       */
      updateContentBuilder: function() {
        if (this.get('isCreateQuestion')) {
          this.createQuestion();
          return;
        }
        this.set('isStruggleUpdate', false);
        this.saveNewContent();
        this.set('isBuilderEditing', false);
      },
      /**
       * Save Content
       */
      updateContent: function() {
        if (this.get('isCreateQuestion')) {
          this.createQuestion();
          return;
        }
        this.set('isStruggleUpdate', true);
        this.saveNewContent();
      },
      /**
       * Enable edit content builder
       */
      editBuilderContent: function() {
        var component = this;
        var questionForEditing = this.get('question').copy();
        if (
          (questionForEditing.get('isScientificFIB') ||
            questionForEditing.get('isScientificFreeRes') ||
            questionForEditing.get('isOpenEnded') ||
            questionForEditing.get('isSerpSayOutLoud') ||
            questionForEditing.get('isSerpEncoding') ||
            questionForEditing.get('isSerpDecoding') ||
            questionForEditing.get('isSerpUnderline') ||
            questionForEditing.get('isSerpWPM')) &&
          !questionForEditing.get('rubric')
        ) {
          let rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
            increment: 0.5,
            maxScore: 1
          });
          questionForEditing.set('rubric', rubric);
        }
        var tempQuestion = this.get('tempQuestion');
        var tempData;
        if (tempQuestion) {
          tempData = Question.create(
            Ember.getOwner(component).ownerInjection(),
            {
              ...questionForEditing,
              ...tempQuestion
            }
          );
        }
        this.set(
          'tempQuestion',
          tempData ? tempData.copy() : questionForEditing
        );
        this.set('isBuilderEditing', true);
        this.set('editImagePicker', false);
        this.set('showAdvancedEditor', false);
        this.scrollToFirstEditor();
      },
      /**
       * Disable edit content builder
       */
      cancelBuilderEdit: function() {
        this.set('isBuilderEditing', false);
        let questionForEditing = this.get('question').copy();
        this.set('tempQuestion', questionForEditing);
        this.set('editImagePicker', false);
        this.set('isExemplarView', false);
        this.set('isAudioUploadFail', false);
        this.get('references').map(firstResult => {
          let textType = '';
          let questionType = this.get('question').type;
          if (questionType === QUESTION_TYPES.sayOutLoud) {
            textType = firstResult.audio_text;
          } else if (questionType === QUESTION_TYPES.decodingAssessment) {
            if (firstResult) {
              textType = firstResult.audio_text;
              if (firstResult.blob) {
                this.get('references').removeObject(firstResult);
              }
            }
          } else if (questionType === QUESTION_TYPES.identifyDigraph) {
            textType = firstResult.answer_text;
            if (firstResult.correct_answer[0].audio) {
              this.get('references').removeObject(firstResult);
            }
          } else {
            textType = firstResult.answer_text;
          }
          var removeText = this.get('question').answers.findBy(
            'text',
            textType
          );
          if (!removeText) {
            this.get('references').removeObject(firstResult);
          }
        });
      },
      /**
       * Save Content
       */
      publishToProfile: function() {
        var questionForEditing = this.get('question').copy();
        this.set('tempQuestion', questionForEditing);
        this.saveNewContent();
      },
      /**
       * Delete Question
       */
      deleteQuestion: function() {
        const myId = this.get('session.userId');
        const collection = this.get('collection');
        var model = {
          content: this.get('question'),
          deleteMethod: function() {
            return this.get('questionService').deleteQuestion(
              this.get('question.id'),
              collection
            );
          }.bind(this),
          type: CONTENT_TYPES.QUESTION,
          redirect: {
            route: 'library-search',
            params: {
              profileId: myId,
              type: 'my-content'
            }
          }
        };

        this.actions.showModal.call(
          this,
          'content.modals.gru-delete-question',
          model,
          null,
          null,
          null,
          false
        );
      },

      addToCollection: function() {
        const component = this;
        if (component.get('session.isAnonymous')) {
          component.send('showModal', 'content.modals.gru-login-prompt');
        } else {
          component
            .get('profileService')
            .readAssessments(component.get('session.userId'))
            .then(function(assessments) {
              return component
                .get('profileService')
                .readCollections(component.get('session.userId'))
                .then(function(collections) {
                  return {
                    content: component.get('question'),
                    collections,
                    assessments
                  };
                });
            })
            .then(model =>
              this.send(
                'showModal',
                'content.modals.gru-add-to-collection',
                model,
                null,
                'add-to'
              )
            );
        }
      },

      selectSubject: function(subject) {
        this.set('selectedSubject', subject);
      },

      selectCategory: function(category) {
        let component = this;
        var standardLabel = category === EDUCATION_CATEGORY.value;
        component.set('standardLabel', !standardLabel);
        if (category === component.get('selectedCategory')) {
          component.set('selectedCategory', null);
        } else {
          component.set('selectedCategory', category);
        }
        component.set('selectedSubject', null);
      },

      /**
       * Remove tag data from the taxonomy list in tempUnit
       */
      removeTag: function(taxonomyTag) {
        var editedQuestion = this.get('tempQuestion');
        let answerDetail = editedQuestion.get('answers');
        let struggle = answerDetail.findBy('struggles');
        if (editedQuestion.type === 'MC' && struggle) {
          this.set('isStruggles', true);
          this.set('removeTaxonomy', taxonomyTag);
          return;
        }
        var tagData = taxonomyTag.get('data');
        this.get('tempQuestion.standards').removeObject(tagData);
      },

      onClosePullUp() {
        this.set('isStruggles', false);
      },

      removePopup() {
        var editedQuestion = this.get('tempQuestion');
        let answerDetail = editedQuestion.get('answers');
        var tagData = this.get('removeTaxonomy').get('data');
        answerDetail = answerDetail.map(item => {
          let fmComp = tagData.id.split('.');
          fmComp.shift();
          if (item.struggles && item.struggles.length) {
            item.set(
              'struggles',
              item.struggles.filter(
                item => item.manifestCompCode !== fmComp.join('.')
              )
            );
          }
          return item;
        });
        this.set('tempQuestion.answers', answerDetail);
        this.get('tempQuestion.standards').removeObject(tagData);
        this.set('isStruggles', false);
      },

      openTaxonomyModal: function() {
        this.openTaxonomyModal();
      },

      toggleImagePicker: function() {
        this.set('editImagePicker', true);
      },

      onShowAdvancedEditor: function(isChecked) {
        if (isChecked) {
          this.set('showAdvancedEditor', true);
        }
      },

      focusQuestionTextEditor: function() {
        this.scrollToFirstEditor();
      },

      /**
       * Action after selecting an option for maximum points
       */
      onMaxScoreChange: function(newValue) {
        this.set('tempQuestion.rubric.maxScore', parseInt(newValue));
      },

      /**
       * Action after selecting an option for increment
       */
      onIncrementChange: function(newValue) {
        this.set('tempQuestion.rubric.increment', parseFloat(newValue));
      },

      /**
       * Updates rubric to display the information of the associated rubric
       */
      updateAssociatedRubric: function(rubric) {
        this.set('question.rubric', rubric);

        let tempQuestion = this.get('tempQuestion');
        tempQuestion.set('rubric', rubric.copy());
      },

      /**
       * Disassociates the rubric from the question
       */
      removeRubric: function(associatedRubricId) {
        let component = this;
        let tempQuestion = component.get('tempQuestion');
        let rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
          increment: 0.5,
          maxScore: 1
        });

        component
          .get('rubricService')
          .deleteRubric(associatedRubricId)
          .then(function() {
            component.set('question.rubric', null);
            tempQuestion.set('rubric', rubric);

            component.setProperties({
              isEditing: true,
              isBuilderEditing: true,
              editImagePicker: false
            });
          });
      },

      /**
       * Show modal with rubrics to choose one and associate it to the question
       */
      showAddRubricModal: function() {
        let component = this;
        const userId = component.get('session.userId');
        return component
          .get('rubricService')
          .getUserRubrics(userId)
          .then(function(rubrics) {
            return {
              questionId: component.get('tempQuestion.id'),
              userId,
              rubrics,
              callback: {
                success: function(rubricAssociated) {
                  component.send('updateAssociatedRubric', rubricAssociated);
                }
              }
            };
          })
          .then(model =>
            component.send(
              'showModal',
              'content.modals.gru-add-rubric-to-question',
              model,
              null,
              null
            )
          );
      },

      //Action triggered when click on back
      onClickBack() {
        window.history.back();
      },

      onRecord(seq) {
        const component = this;
        const recorderInstances = component.get('recorderInstances');
        const recorderInstance = recorderInstances[seq];
        if (recorderInstance && recorderInstance.isRecording) {
          recorderInstance.stop().then(audio => {
            component
              .$(`.audio-recorder.exemplar-${seq}`)
              .removeClass('recording')
              .addClass('enable');
            const reference = component.get('references')[seq];
            Ember.set(reference, 'audio_url', audio.audioUrl);
            Ember.set(reference, 'blob', audio.audioBlob);
            Ember.set(
              reference,
              'duration',
              (window.performance.now() - recorderInstance.startTime) / 1000
            );
            component.get('references').splice(seq, 1, reference);
            recorderInstance.isRecording = false;
          });
        } else {
          component.recordAudio().then(recorder => {
            component
              .$(`.audio-recorder.exemplar-${seq}`)
              .removeClass('enable')
              .addClass('recording');
            recorder.startTime = window.performance.now();
            recorder.isRecording = true;
            recorderInstances[seq] = recorder;
            recorder.start();
          });
        }
        component.set('recorderInstances', recorderInstances);
      },

      onPlayAudio(seq) {
        const component = this;
        let _audio = component.get('audioRecorder');
        let url = component.get('references')[seq].audio_url;
        if (
          !_audio ||
          component.get('answerIndex') !== seq ||
          component.get('playerUrl') !== url
        ) {
          _audio = new Audio(url);
          component.set('answerIndex', seq);
          component.set('playerUrl', url);
        }
        component.set('audioRecorder', _audio);
        _audio.play();
        component.set('isPause', true);
        _audio.ontimeupdate = function() {
          const duration =
            _audio.duration === Infinity
              ? component.get('references')[seq].duration || _audio.duration
              : _audio.duration;
          component
            .$(
              `.decoding-exemplar .exemplar-${seq} .excercise-exemplar .audio-player .audio-progress .progress-filling`
            )
            .css('width', `${(_audio.currentTime / duration) * 100}%`);
        };
        _audio.addEventListener('ended', () => {
          component.set('isPause', false);
        });
      },

      //Action triggered when pause audio
      onPauseAudio() {
        const component = this;
        const audio = component.get('audioRecorder');
        audio.pause();
        component.set('isPause', false);
      },

      onAddExemplar() {
        var text = '';
        if (this.get('tempQuestion.answers').length > 0) {
          for (
            let index = 0;
            index < this.get('tempQuestion.answers').length;
            index++
          ) {
            const result = this.get('tempQuestion.answers')[index];
            var data = this.get('references').findBy('audio_text', result.text);
            if (!data) {
              text = this.get('tempQuestion.answers')[index].text;
              break;
            }
          }
        }
        if (text) {
          this.get('references').pushObject({
            audio_url: null,
            audio_text: removeHtmlTags(text)
          });
        }
      },

      onRemoveExemplar(seq) {
        this.get('references').removeObject(this.get('references')[seq]);
        if (!this.get('references').length) {
          this.set('isAudioUploadFail', false);
        }
      },

      toggleSuggestion() {
        const component = this;
        Ember.run.later(function() {
          if (component.get('showSuggestion')) {
            component.set('showSuggestion', false);
          }
        }, 500);
      },

      inputTyping(text) {
        const component = this;
        let tagList = component.get('tagList');
        let isExist = tagList.find(element => element === text);
        let suggestionList = Ember.A([]);
        const labelText = component.get('i18n').t('common.new-label').string;
        if (!isExist && text) {
          component
            .get('questionService')
            .getTags(text, 10, 0)
            .then(function(tag) {
              if (tag && tag.length) {
                tag.map(item => {
                  let data = Ember.Object.create({
                    name: item,
                    displayName: item
                  });
                  suggestionList.pushObject(data);
                });
              }
              let dataItem = Ember.Object.create({
                name: text,
                displayName: `${text} (${labelText})`
              });
              suggestionList.pushObject(dataItem);
              component.set('suggestionList', suggestionList);
              component.set('showSuggestion', true);
            });
        }
      },

      addTag(tag) {
        const component = this;
        let tagList = component.get('tagList');
        let isExist = tagList.find(element => element === tag);
        if (!isExist && tag) {
          tagList.pushObject(tag);
          let metadata = component.get('tempQuestion.metadata');
          metadata.tags = tagList;
        }
        component.set('tagValue', null);
        component.set('showSuggestion', false);
      },

      removeTagAtIndex(index) {
        const component = this;
        let tagList = component.get('tagList');
        tagList.removeAt(index);
        let metadata = component.get('tempQuestion.metadata');
        metadata.tags = tagList;
      },

      updateLevel: function(level) {
        this.set('question.metadata.difficulty_level', level);
        this.set('tempQuestion.metadata.difficulty_level', level);
        this.set('selectedLevel', level);
      }
    },

    // -------------------------------------------------------------------------
    // Events

    init: function() {
      this._super(...arguments);
      if (this.get('isBuilderEditing')) {
        let questionForEditing = this.get('question').copy();
        if (
          (questionForEditing.get('isScientificFIB') ||
            questionForEditing.get('isScientificFreeRes') ||
            questionForEditing.get('isOpenEnded') ||
            questionForEditing.get('isSerpSayOutLoud') ||
            questionForEditing.get('isSerpEncoding') ||
            questionForEditing.get('isSerpDecoding') ||
            questionForEditing.get('isSerpUnderline') ||
            questionForEditing.get('isSerpWPM')) &&
          !questionForEditing.get('rubric')
        ) {
          let rubric = Rubric.create(Ember.getOwner(this).ownerInjection(), {
            increment: 0.5,
            maxScore: 1
          });
          questionForEditing.set('rubric', rubric);
        }
        let audience = questionForEditing.audience || Ember.A([]);
        this.set('questionForEditing', 'audience', audience);
        this.set('tempQuestion', questionForEditing);
        this.set('isEditing', true);
        this.set('isScientificEdit', true);
      } else {
        let tempQ = this.get('tempQuestion');
        if (!tempQ) {
          let questionForEditing = this.get('question').copy();
          this.set('tempQuestion', questionForEditing);
          this.set('tempQuestion.audience', Ember.A([]));
        }
      }
      let tempQuestion = this.get('tempQuestion.metadata');
      this.set('tagList', []);
      if (tempQuestion && tempQuestion.tags && tempQuestion.tags.length) {
        let tagList = this.get('tagList');
        tempQuestion.tags.forEach(item => {
          tagList.pushObject(item);
        });
      }

      const isDefaultlevel =
        this.get('question') &&
        this.get('question.metadata') &&
        this.get('question.metadata.difficulty_level')
          ? this.get('question.metadata.difficulty_level')
          : null;
      this.set(
        'selectedLevel',
        isDefaultlevel && isDefaultlevel !== null ? isDefaultlevel : null
      );
    },

    willDestroyElement() {
      this.set('recorderInstances', Ember.A([]));
    },

    // -------------------------------------------------------------------------
    // Properties
    isSerpDaQuestion: Ember.computed('question.type', function() {
      return this.get('question.type').includes('SERP_DA');
    }),

    recorderInstances: Ember.A([]),

    /**
     * Question model as instantiated by the route. This is the model used when not editing
     * or after any question changes have been saved.
     * @property {Question}
     */
    question: null,
    /**
     * Copy of the question model used for editing.
     * @property {Question}
     */
    tempQuestion: null,
    /**
     * Request pending approval
     * // TODO: Change this to a computed property of a question property
     * @property {Boolean}
     */
    isRequestApproved: false,

    isStruggles: false,

    removeTaxonomy: null,

    tagList: [],

    tagValue: null,

    showSuggestion: false,

    suggestionList: Ember.A([]),

    /**
     * Request to make the question searchable been sent?
     * // TODO: Change this to a computed property of a question property
     * @property {Boolean}
     */
    wasRequestSent: false,

    /**
     * Toggle Options for the Advanced Edit button
     * @property {Ember.Array}
     */
    switchOptions: Ember.A([
      Ember.Object.create({
        label: 'common.on',
        value: true
      }),
      Ember.Object.create({
        label: 'common.off',
        value: false
      })
    ]),

    /**
     * Options for maximum points
     * @property {Array}
     */
    maximumOptions: Ember.computed(function() {
      let options = [];
      for (let i = 1; i <= RUBRIC_OFF_OPTIONS.MAX_SCORE; i += 1) {
        options.push({
          id: i,
          name: i
        });
      }
      return options;
    }),

    /**
     * Options for increment
     * @property {Array}
     */
    incrementOptions: Ember.computed(function() {
      return RUBRIC_OFF_OPTIONS.INCREMENT;
    }),

    /**
     * @property{Array{}} questionTypes
     */
    questionTypes: Ember.computed(function() {
      let array = Ember.A(Object.keys(QUESTION_CONFIG));
      return array;
    }),

    /**
     * @property{Array{}} readingQuestionTypes
     */
    readingQuestionTypes: Ember.computed(function() {
      let question = [];
      let tempQuestion = this.get('tempQuestion');
      Object.keys(QUESTION_CONFIG).forEach(item => {
        if (QUESTION_CONFIG[item].isHiddenType) {
          question.push(item);
        }
      });
      return tempQuestion.type === 'basewordone'
        ? BASE_WORDS_QUESTIONS
        : question;
    }),

    /**
     * @property {Boolean} isBuilderEditing
     */
    isBuilderEditing: false,

    /**
     * @property {Boolean} Indicates if a correct answer is required
     */
    correctAnswerNotSelected: false,

    /**
     * @property {String} Error message to display below the description
     */
    descriptionError: null,

    /**
     * @property {Boolean} Indicates if a Hot spot answer has images
     */
    hasNoImages: false,

    createQuestiontype: null,

    /**
     * @property {Boolean} Rubric info to use
     */
    rubric: Ember.computed(
      'isBuilderEditing',
      'question.rubric',
      'tempQuestion.rubric',
      function() {
        return this.get('isBuilderEditing')
          ? this.get('tempQuestion.rubric')
          : this.get('question.rubric');
      }
    ),

    /**
     * i18n key for the standard/competency dropdown label
     * @property {string}
     */
    standardLabelKey: Ember.computed('standardLabel', function() {
      return this.get('standardLabel')
        ? 'common.standards'
        : 'common.competencies';
    }),

    /**
     * @property {boolean}
     */
    standardLabel: true,

    /**
     * @property {boolean}
     */
    standardDisabled: Ember.computed.not('selectedSubject'),

    /**
     * If the user wants to edit the image
     * @property {Boolean}
     */
    editImagePicker: false,

    /**
     * If the image picker should be shown
     * @property {Boolean}
     */
    showImagePicker: Ember.computed.or('editImagePicker', 'question.thumbnail'),

    selectedStruggle: Ember.A(),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    tags: Ember.computed('question.standards.[]', function() {
      return TaxonomyTag.getTaxonomyTags(this.get('question.standards'), false);
    }),

    /**
     * @property {TaxonomyTag[]} List of taxonomy tags
     */
    editableTags: Ember.computed('tempQuestion.standards.[]', function() {
      return TaxonomyTag.getTaxonomyTags(
        this.get('tempQuestion.standards'),
        false,
        true
      );
    }),

    /**
     * If the advanced editor should be shown
     * @property {Boolean}
     */
    showAdvancedEditor: false,

    /**
   * If the advanced edit button should be shown
   @property {Boolean}
   */
    showAdvancedEditButton: Ember.computed(
      'question',
      'isBuilderEditing',
      function() {
        return (
          this.get('question.supportAnswerChoices') &&
          this.get('isBuilderEditing')
        );
      }
    ),

    /**
     * If a rubric ON is not associated
     * @property {Boolean}
     */
    rubricError: false,

    /**
     * If a Exemplar is not associated for underline
     * @property {Boolean}
     */
    exemplarError: false,

    /**
     * If Value is not Underline
     * @property {Boolean}
     */
    emptyUnderline: false,

    /**
     * Help to handle create the new question type
     * @property {Boolean}
     */
    isCreateQuestion: false,

    /**
     * @type {String} the selected category
     */
    selectedCategory: Ember.computed('question', function() {
      let standard = this.get('question.standards.firstObject');
      let subjectId = standard ? getSubjectId(standard.get('id')) : null;
      return subjectId ? getCategoryCodeFromSubjectId(subjectId) : null;
    }),

    selectedSubject: Ember.computed('question', function() {
      let standard = this.get('question.standards.firstObject');
      if (standard) {
        standard.set(
          'subjectCode',
          getGutCodeFromSubjectId(getSubjectId(standard.get('id')))
        );
      }
      return standard ? standard : null;
    }),

    /**
     * Options for attachment
     * @property {Array}
     */
    references: Ember.computed(
      'question.exemplarDocs',
      'question.exemplar_docs',
      function() {
        return (
          this.get('question.exemplarDocs') ||
          this.get('question.exemplar_docs') ||
          Ember.A([])
        );
      }
    ),

    /**
     * Observer help to refresh subQuestions list
     */
    questionObserver: Ember.observer('question.subQuestions', function() {
      let tempQuestion = this.get('question').copy();
      if (tempQuestion.subQuestions) {
        this.set('tempQuestion.subQuestions', tempQuestion.subQuestions);
      }
    }),
    selectedLinkOut: Ember.computed('tempQuestion', function() {
      return this.get('tempQuestion') &&
        this.get('tempQuestion').metadata &&
        this.get('tempQuestion').metadata.linked_content
        ? this.get('tempQuestion').metadata.linked_content.read_sequence_id
        : null;
    }),

    compQuestionId: null,

    isH5PContent: Ember.computed('question', function() {
      return this.get('question.type') === 'H5P_DAD';
    }),

    /**
     * @property {String}
     */
    accessToken: Ember.computed.alias('session.token-api3'),

    contentURL: Ember.computed('isH5PContent', function() {
      if (this.get('isH5PContent')) {
        let accessToken = this.get('accessToken');
        let questionId = this.get('question.id');
        let questionType = this.get('question.content_subformat');
        let format = 'question';
        let contentURL = `${window.location.protocol}//${window.location.host}/tools/h5p/edit/${questionId}?accessToken=${accessToken}&contentType=${questionType}&format=${format}`;
        return contentURL;
      }
    }),

    isLoading: Ember.computed('contentURL', function() {
      return !!this.get('contentURL');
    }),

    // ----------------------------
    // Methods
    openTaxonomyModal: function() {
      var component = this;
      var standards = component.get('tempQuestion.standards') || [];
      var subject = component.get('selectedSubject');
      var subjectStandards = TaxonomyTagData.filterBySubject(
        subject,
        standards
      );
      var model = {
        selected: subjectStandards,
        shortcuts: null, // TODO: TBD
        subject: subject,
        standardLabel: component.get('standardLabel'),
        callback: {
          success: function(selectedTags) {
            var dataTags = selectedTags.map(function(taxonomyTag) {
              return taxonomyTag.get('data');
            });
            const standards = Ember.A(dataTags);
            component.set('tempQuestion.standards', standards);
            component.set(
              'tempQuestion.standards',
              component.get('tempQuestion.standards').uniqBy('code')
            );
          }
        }
      };

      this.actions.showModal.call(
        this,
        'taxonomy.modals.gru-standard-picker',
        model,
        null,
        'gru-standard-picker'
      );
    },

    /**
     * Save new question content
     */
    saveNewContent: function(enableEditing = false) {
      const component = this;
      var editedQuestion = this.get('tempQuestion');
      const etlHrs = editedQuestion.get('questionHrs');
      const etlMins = editedQuestion.get('questionMins');
      etlSecCalculation(editedQuestion, etlHrs, etlMins);
      var hintExplanationDetail = component.get('hintExplanationDetail');
      editedQuestion.set('exemplar_docs', this.get('references'));
      var questionForValidate = editedQuestion.copy();
      var answersForValidate = questionForValidate.get('answers');
      editedQuestion.set('text', replaceMathExpression(editedQuestion.text));
      var promiseArray = [];
      var answersPromise = null;
      if (editedQuestion.get('isFIB')) {
        editedQuestion.set(
          'answers',
          FillInTheBlank.getQuestionAnswers(editedQuestion)
        );
        component.updateQuestion(editedQuestion, component, enableEditing);
      } else if (editedQuestion.get('isOpenEnded')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          component.updateQuestion(editedQuestion, component, enableEditing);
        }
      } else if (editedQuestion.get('isScientificFIB')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          var answerDetails = component.get('answerDetails');
          editedQuestion.set('answerDetails', answerDetails);
          let parsedAnswers = ScientificFillInTheBlank.getQuestionAnswers(
            answerDetails
          );
          parsedAnswers = parsedAnswers.map(parseAnswer => {
            return Answer.create(
              Ember.getOwner(this).ownerInjection(),
              parseAnswer
            );
          });
          editedQuestion.set('answers', parsedAnswers);

          editedQuestion.set('hints', hintExplanationDetail);
          component.updateQuestion(editedQuestion, component, enableEditing);
        }
      } else if (editedQuestion.get('isScientificFreeRes')) {
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
        } else {
          var freeResDetails = component.get('answerFreeResDetails');
          editedQuestion.set('answerDetails', answerDetails);
          let answerData = freeResDetails.map(function(data) {
            let values = Ember.Object.create({
              answer_category: data.answer_category,
              answer_type: data.answer_type,
              sequence: 0
            });
            return values;
          });
          editedQuestion.set('answers', answerData);
          editedQuestion.set('hints', hintExplanationDetail);
          component.updateQuestion(editedQuestion, component, enableEditing);
        }
      } else if (editedQuestion.get('type') === SERP_ENCODING_QUESTION_TYPE) {
        component.set('isAudioUploadFail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        let result = editedQuestion
          .get('answers')
          .filter(data => data.isRecorded);
        let promiseArray = result.map(data => {
          var typeOfAudio = typeof data.audio;
          if (typeOfAudio !== 'string' && !component.set('isAudioUploadFail')) {
            return new Promise(resolve => {
              return component.uploadSelectedFile(data).then(
                () => {
                  resolve();
                },
                function() {
                  component.set('isAudioUploadFail', true);
                  return;
                }
              );
            });
          }
        });
        if (!component.set('isAudioUploadFail')) {
          Promise.all(promiseArray).then(function() {
            component.updateQuestion(editedQuestion, component, enableEditing);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else if (
        editedQuestion.get('type') === QUESTION_TYPES.decodingAssessment
      ) {
        component.set('isAudioUploadFail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        const qExemplars = [];
        let audioUrlPromises = component
          .get('references')
          .map((serpExemplar, seq) => {
            if (serpExemplar) {
              return new Promise(resolve => {
                if (serpExemplar.blob && !component.get('isAudioUploadFail')) {
                  return component
                    .get('mediaService')
                    .uploadContentFile(serpExemplar.blob, true)
                    .then(fileUrl => {
                      if (fileUrl) {
                        qExemplars.push({
                          audio_url: fileUrl,
                          audio_text: serpExemplar.audio_text
                        });
                        Ember.set(serpExemplar, 'audio_url', fileUrl);
                        return resolve(serpExemplar);
                      } else {
                        component.set('isAudioUploadFail', true);
                        return;
                      }
                    });
                } else {
                  qExemplars.push({
                    audio_url: serpExemplar.audio_url,
                    audio_text:
                      serpExemplar.audio_text ||
                      editedQuestion.get('answers')[seq].text
                  });
                  return resolve(serpExemplar);
                }
              });
            }
          });
        if (!component.get('isAudioUploadFail')) {
          Promise.all(audioUrlPromises).then(() => {
            let exemplarResult = [];
            if (qExemplars.length) {
              editedQuestion.answers.map(data => {
                var value = qExemplars.findBy('audio_text', data.text);
                if (value) {
                  exemplarResult.push(value);
                }
              });
            }
            editedQuestion.set('exemplar_docs', exemplarResult);
            component.updateQuestion(editedQuestion, component, enableEditing);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else if (editedQuestion.get('type') === QUESTION_TYPES.sayOutLoud) {
        component.set('isExemplaravail', false);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        for (
          let index = 0;
          index < editedQuestion.get('exemplar_docs').length;
          index++
        ) {
          const element = editedQuestion.get('exemplar_docs')[index];
          if (!element.audio_url) {
            component.set('isExemplaravail', true);
            break;
          }
        }
        if (component.get('isExemplaravail')) {
          return;
        }
        if (!component.get('isAudioUploadFail')) {
          component.updateQuestion(editedQuestion, component, enableEditing);
          component.set('isAudioUploadFail', false);
          component.set('isExemplaravail', false);
        } else {
          return;
        }
      } else if (
        editedQuestion.get('type') === QUESTION_TYPES.identifyDigraph
      ) {
        component.set('isAudioUploadFail', false);
        component.set('isLoader', true);
        if (
          editedQuestion.get('rubric.rubricOn') &&
          !editedQuestion.get('rubric.title')
        ) {
          component.set('rubricError', true);
          return;
        }
        let audioUrlPromises = [];
        var Exemplaranswer = [];
        var exemplarLength = component.get('references').length;
        if (
          !exemplarLength ||
          exemplarLength !== editedQuestion.answers.length
        ) {
          component.set('exemplarError', true);
          return;
        }
        for (
          let index = 0;
          index < editedQuestion.get('answers').length;
          index++
        ) {
          const element = editedQuestion.get('answers')[index];
          if (!element.correctAnswer.length) {
            component.set('emptyUnderline', true);
            break;
          }
        }
        if (component.get('emptyUnderline')) {
          return null;
        }

        component.get('references').map(underLineAns => {
          let correctanswer = [];
          Exemplaranswer.push({
            answer_text: underLineAns.answer_text,
            correct_answer: correctanswer
          });
          underLineAns = Ember.Object.create(underLineAns);
          return underLineAns.correct_answer.map(answerlist => {
            if (answerlist.isRecorded && !component.set('isAudioUploadFail')) {
              audioUrlPromises.push(
                new Promise(resolve => {
                  return component
                    .get('mediaService')
                    .uploadContentFile(answerlist.audio.audioBlob, true)
                    .then(fileUrl => {
                      if (fileUrl) {
                        correctanswer.push({
                          audio_file_url: fileUrl,
                          text: answerlist.text,
                          seq: answerlist.seq
                        });
                        return resolve(underLineAns);
                      } else {
                        component.set('isAudioUploadFail', true);
                        return;
                      }
                    });
                })
              );
            } else {
              correctanswer.push({
                audio_file_url: answerlist.audio_file_url,
                text: answerlist.text,
                seq: answerlist.seq
              });
            }
          });
        });
        if (!component.get('isAudioUploadFail')) {
          Promise.all(audioUrlPromises).then(() => {
            component.set('isLoader', false);
            Exemplaranswer.map(result => {
              result.correct_answer = result.correct_answer.sortBy('seq');
            });
            editedQuestion.set('exemplar_docs', Exemplaranswer);
            component.updateQuestion(editedQuestion, component, enableEditing);
            component.set('isAudioUploadFail', false);
          });
        } else {
          return;
        }
      } else {
        if (editedQuestion.get('type') === QUESTION_TYPES.wordsPerMinute) {
          if (
            editedQuestion.get('rubric.rubricOn') &&
            !editedQuestion.get('rubric.title')
          ) {
            component.set('rubricError', true);
            return;
          }

          if (
            editedQuestion &&
            editedQuestion.metadata &&
            editedQuestion.metadata.linked_content
          ) {
            if (
              editedQuestion.metadata.linked_content.linked_content_id &&
              !editedQuestion.metadata.linked_content.read_sequence_id
            ) {
              component.set('linkedSequenceError', true);
              return;
            }
            if (
              !editedQuestion.metadata.linked_content.linked_content_id &&
              editedQuestion.metadata.linked_content.read_sequence_id
            ) {
              component.set('linkedContentError', true);
              return;
            }
          }
          if (editedQuestion && editedQuestion.metadata) {
            if (!editedQuestion.metadata.linked_content) {
              component.set('linkedContentError', true);
              return;
            }
          }
        }

        if (
          editedQuestion.get('answers') &&
          editedQuestion.get('type') !== 'SERP_AFC'
        ) {
          if (this.get('showAdvancedEditButton')) {
            for (var i = 0; i < editedQuestion.get('answers').length; i++) {
              var answer = editedQuestion.get('answers')[i];
              answer.set('text', replaceMathExpression(answer.get('text')));
            }
          }
          if (editedQuestion.get('isHotSpotImage')) {
            this.hasImages(editedQuestion.get('answers'));
            promiseArray = editedQuestion
              .get('answers')
              .map(component.getAnswerSaveImagePromise.bind(component));
            answersPromise = Ember.RSVP.Promise.all(promiseArray).then(function(
              values
            ) {
              component.updateQuestion(
                editedQuestion,
                component,
                enableEditing
              );
              for (var i = 0; i < editedQuestion.get('answers').length; i++) {
                editedQuestion.get('answers')[i].set('text', values[i]);
              }
              return Ember.RSVP.Promise.all(
                answersForValidate.map(component.getAnswerValidatePromise)
              );
            });
          } else if (editedQuestion.get('isClassic')) {
            answersPromise = component.parseClassicImages(
              editedQuestion.get('answers')
            );
          } else if (
            editedQuestion.get('type') === QUESTION_TYPES.matchTheFollowing
          ) {
            answersPromise = component.parseMatchTheFollowingImages(
              editedQuestion.get('answers')
            );
          } else {
            promiseArray = answersForValidate.map(
              component.getAnswerValidatePromise
            );
            answersPromise = Ember.RSVP.Promise.all(promiseArray);
          }
          answersPromise.then(function(values) {
            if (component.validateAnswers(values, editedQuestion)) {
              component.updateQuestion(
                editedQuestion,
                component,
                enableEditing
              );
            }
          });
        } else {
          component.updateQuestion(editedQuestion, component, enableEditing);
        }
      }
      this.set('isExemplarView', false);
    },

    struggleAnswers(selectedStruggle) {
      return new Ember.RSVP.Promise(resolve => {
        const component = this;
        let params = {
          struggles: selectedStruggle
        };
        return component
          .get('strugglingCompetencyService')
          .fetchCheckedAnswerStuggling(params)
          .then(
            () => {
              this.set('selectedStruggle', Ember.A([]));
              resolve({});
            },
            () => {
              this.set('selectedStruggle', Ember.A([]));
              resolve({});
            }
          );
      });
    },

    updateQuestion: function(editedQuestion, component, enableEditing) {
      let question = component.get('question');
      const collection = component.get('collection');
      editedQuestion.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          let imageIdPromise = new Ember.RSVP.resolve(
            editedQuestion.get('thumbnail')
          );
          if (
            editedQuestion.get('thumbnail') &&
            editedQuestion.get('thumbnail') !== question.get('thumbnail')
          ) {
            imageIdPromise = component
              .get('mediaService')
              .uploadContentFile(editedQuestion.get('thumbnail'));
          }
          var defaultTitle = component.get('i18n').t('common.new-question')
            .string;
          var defaultText = component.get('i18n').t('common.new-question-text')
            .string;
          var editedQuestionTitle = editedQuestion.title;
          var editedQuestionText = editedQuestion.text;

          if (
            editedQuestionTitle === defaultTitle &&
            editedQuestionText !== defaultText &&
            editedQuestionText !== ''
          ) {
            editedQuestionText = $.trim(editedQuestionText);
            //Replace answer placeholder in the question title from [answer] into ____
            var newTitle = editedQuestionText
              .replace(/\[[^\]]+\]/g, '____')
              .substr(0, 50);

            editedQuestion.set('title', newTitle);
          }
          imageIdPromise.then(function(imageId) {
            editedQuestion.set('thumbnail', imageId);
            component
              .get('questionService')
              .updateQuestion(editedQuestion.id, editedQuestion, collection)
              .then(function() {
                let strugglesAnswers = component.get('selectedStruggle');
                if (editedQuestion.type === 'MC' && strugglesAnswers.length) {
                  component.struggleAnswers(strugglesAnswers);
                }
                if (editedQuestion.get('isScientificFreeRes')) {
                  editedQuestion.set('answers', Ember.A([]));
                }
                if (question.metadata && question.metadata.linked_content) {
                  if (
                    question.metadata.linked_content.linked_content_id !==
                    editedQuestion.metadata.linked_content.linked_content_id
                  ) {
                    component
                      .get('questionService')
                      .readQuestion(
                        question.metadata.linked_content.linked_content_id
                      )
                      .then(function(updatequestionData) {
                        delete updatequestionData.metadata.linked_content;
                        component
                          .get('questionService')
                          .updateQuestion(
                            updatequestionData.id,
                            updatequestionData
                          );
                      });
                  }
                }
                component.setProperties({
                  question: editedQuestion,
                  isEditing: false,
                  isBuilderEditing: enableEditing,
                  editImagePicker: false
                });
                question.merge(editedQuestion, [
                  'title',
                  'standards',
                  'audience',
                  'depthOfknowledge',
                  'thumbnail',
                  'primaryLanguage',
                  'maxScore',
                  'metadata'
                ]);
                if (
                  (editedQuestion.get('isScientificFIB') ||
                    editedQuestion.get('isScientificFreeRes') ||
                    editedQuestion.get('isOpenEnded') ||
                    editedQuestion.get('isSerpSayOutLoud') ||
                    editedQuestion.get('isSerpEncoding') ||
                    editedQuestion.get('isSerpDecoding') ||
                    editedQuestion.get('isSerpUnderline') ||
                    editedQuestion.get('isSerpWPM')) &&
                  !editedQuestion.get('rubric.rubricOn') &&
                  editedQuestion.get('rubric')
                ) {
                  editedQuestion.get('rubric').setProperties({
                    title: null,
                    maxScore: editedQuestion.get('rubric.maxScore')
                      ? editedQuestion.get('rubric.maxScore')
                      : 1,
                    increment: editedQuestion.get('rubric.increment')
                      ? editedQuestion.get('rubric.increment')
                      : 0.5
                  });
                }
                if (
                  editedQuestion.linked_content_id ||
                  editedQuestion.read_sequence_id
                ) {
                  component
                    .get('questionService')
                    .readQuestion(
                      component.get('selectReadActivity').question_id
                    )
                    .then(function(questionData) {
                      let readSequenceId =
                        component.get('tempQuestion.read_sequence_id') === 2
                          ? 1
                          : 2;
                      if (
                        questionData.metadata &&
                        questionData.metadata.linked_content
                      ) {
                        questionData.metadata.linked_content.linked_content_id = component.get(
                          'question'
                        ).id;

                        questionData.metadata.linked_content.read_sequence_id = readSequenceId;
                      } else {
                        const linkedContent = {
                          linked_content_id: component.get('question').id,
                          read_sequence_id: readSequenceId
                        };
                        const linked_content = Ember.Object.create(
                          linkedContent
                        );
                        questionData.metadata = {
                          linked_content: linked_content
                        };
                      }
                      component
                        .get('questionService')
                        .updateQuestion(questionData.id, questionData)
                        .then(function() {
                          component.fetchReadactivity(
                            component.get('question').courseId
                          );
                        });
                    });
                }
                if (!question.get('rubric')) {
                  question.set('rubric', editedQuestion.get('rubric'));
                } else {
                  question
                    .get('rubric')
                    .merge(editedQuestion.get('rubric'), [
                      'maxScore',
                      'increment',
                      'scoring',
                      'rubricOn',
                      'title'
                    ]);
                }
              })
              .catch(function(error) {
                var message = component
                  .get('i18n')
                  .t('common.errors.question-not-updated').string;
                component.get('notifications').error(message);
                Ember.Logger.error(error);
              });
          });
        }
        component.set('didValidate', true);
      });
    },

    /**
     * Check that validate promises are not returning false
     */
    validateAnswers: function(promiseValues, question) {
      var valid = true;
      promiseValues.find(function(promise) {
        if (promise === false) {
          valid = false;
        }
      });
      return valid && this.isCorrectAnswerSelected(question);
    },

    /**
     * Check if an answer is selected as correct
     */
    isCorrectAnswerSelected: function(question) {
      if (
        question.get('answers').length > 0 &&
        question.get('type') !== 'MA' &&
        question.get('type') !== 'SERP_MC'
      ) {
        let correctAnswers = question.get('answers').filter(function(answer) {
          return answer.get('isCorrect');
        });
        if (correctAnswers.length > 0) {
          this.set('correctAnswerNotSelected', false);
        } else {
          this.set('correctAnswerNotSelected', true);
          return false;
        }
      }
      return true;
    },

    /**
     * Returns upload image promises
     */
    getAnswerSaveImagePromise: function(answer) {
      if (answer.get('text') && typeof answer.get('text').name === 'string') {
        return this.get('mediaService').uploadContentFile(answer.get('text'));
      } else {
        return answer.get('text');
      }
    },

    /**
     * Returns validate answer promises
     */
    getAnswerValidatePromise: function(answer) {
      if (answer.get('text')) {
        if (answer.get('text').length > 0) {
          answer.set('text', removeHtmlTags(answer.text));
        }
      }
      return answer.validate().then(function({ validations }) {
        return validations.get('isValid');
      });
    },

    /**
     * Check if an hs-answer has image
     */
    hasImages: function(answers) {
      if (answers.length > 0) {
        let answerImages = answers.filter(function(answer) {
          return answer.get('text') === null;
        });
        if (answerImages.length > 0) {
          this.set('hasNoImages', true);
        } else {
          this.set('hasNoImages', false);
          return false;
        }
      }
      return true;
    },

    /**
     * @function parseClassicImages help to parse classic images
     */
    parseClassicImages(answers) {
      return new Ember.RSVP.Promise(resolve => {
        let answerPromise = answers.map(answer => {
          if (answer.textImage && typeof answer.textImage !== 'string') {
            return this.get('mediaService').uploadContentFile(answer.textImage);
          }
          return answer.textImage;
        });
        Ember.RSVP.Promise.all(answerPromise).then(answerList => {
          let updateAnswer = answers.map((item, index) => {
            item.set('textImage', answerList[index]);
            return item;
          });
          Ember.RSVP.Promise.all(updateAnswer).then(() => {
            resolve(answers);
          });
        });
      });
    },

    parseMatchTheFollowingImages(answers) {
      return new Ember.RSVP.Promise(resolve => {
        let answerPromise = answers.map(answer => {
          const promiseFn = answerText => {
            return typeof answerText !== 'string'
              ? this.get('mediaService').uploadContentFile(answerText)
              : answerText;
          };
          return Ember.RSVP.hash({
            leftValue: promiseFn(answer.leftValue),
            rightValue: promiseFn(answer.rightValue)
          });
        });
        Ember.RSVP.Promise.all(answerPromise).then(answerList => {
          let updateAnswer = answers.map((item, index) => {
            item.set('leftValue', answerList[index].leftValue);
            item.set('rightValue', answerList[index].rightValue);
            return item;
          });
          Ember.RSVP.Promise.all(updateAnswer).then(() => {
            resolve(answers);
          });
        });
      });
    },

    /**
     * scroll to first editor of the page, when it has several editor answers
     */
    scrollToFirstEditor: function() {
      var component = this;
      Ember.run.later(function() {
        var editorID = '#builder .gru-rich-text-editor:eq(0) .rich-editor';
        var editor = component.$(editorID);
        if (editor && editor.length > 0) {
          editor[0].focus();
        }
      }, 100);
    },

    uploadSelectedFile(element) {
      const component = this;
      return element.audio.then(instance => {
        let fileToUpload = instance.audioBlob;
        let fileIdPromise = new Ember.RSVP.resolve(fileToUpload);
        if (fileToUpload) {
          fileIdPromise = component
            .get('mediaService')
            .uploadContentFile(fileToUpload, true);
        }
        fileIdPromise.then(filename => {
          element.set('audioUrl', filename);
          element.set('isRecorded', false);
        });
        return fileIdPromise;
      });
    },

    createQuestion() {
      let component = this;
      let question = this.get('tempQuestion');
      const compQuestionId = component.get('compQuestionId');
      let collectionId = this.get('collection.id');
      let isCollection = this.get('isCollection');
      let questionId;
      if (question.type.indexOf('baseword') !== -1) {
        let subType = question.get('type');
        question.set('type', 'SERP_IB');
        let answers = {
          text: '',
          type: subType,
          baseWords: [],
          correctAnswer: [],
          isCorrect: true
        };
        question.set(
          'answers',
          Ember.A([
            Answer.create(Ember.getOwner(component).ownerInjection(), answers)
          ])
        );
      }
      component
        .get('questionService')
        .createQuestion(question)
        .then(function(newQuestion) {
          questionId = newQuestion.get('id');
          if (collectionId || compQuestionId) {
            let service =
              isCollection && isCollection !== 'false'
                ? component.get('collectionService')
                : component.get('assessmentService');
            service = compQuestionId
              ? component.get('questionService')
              : service;
            return service.addQuestion(
              compQuestionId ? compQuestionId : collectionId,
              questionId
            );
          } else {
            return Ember.RSVP.Promise.resolve(true);
          }
        })
        .then(() => {
          if (collectionId) {
            const queryParams = {
              queryParams: {
                editingContent: compQuestionId ? compQuestionId : questionId
              }
            };
            if (compQuestionId) {
              queryParams.queryParams.editingSubContent = questionId;
            }
            if (isCollection && isCollection !== 'false') {
              component
                .get('router')
                .transitionTo(
                  'content.collections.edit',
                  collectionId,
                  queryParams
                );
            } else {
              component
                .get('router')
                .transitionTo(
                  'content.assessments.edit',
                  collectionId,
                  queryParams
                );
            }
          } else {
            const queryParams = {
              queryParams: {
                editing: true
              }
            };

            if (compQuestionId) {
              queryParams.queryParams.editingContent = questionId;
            }

            component
              .get('router')
              .transitionTo(
                'content.questions.edit',
                compQuestionId ? compQuestionId : questionId,
                queryParams
              );
          }
        });
    },

    recordAudio() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return navigator.mediaDevices
          .getUserMedia({
            audio: true
          })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            mediaRecorder.addEventListener('dataavailable', event => {
              audioChunks.push(event.data);
            });

            const start = () => mediaRecorder.start();

            const state = mediaRecorder.state;

            const stop = () =>
              new Promise(resolve => {
                mediaRecorder.addEventListener('stop', () => {
                  const audioBlob = new Blob(audioChunks, {
                    type: 'audio/mp3'
                  });
                  const audioUrl = URL.createObjectURL(audioBlob);
                  const audio = new Audio(audioUrl);
                  const play = () => audio.play();
                  resolve({
                    audioBlob,
                    audioUrl,
                    play
                  });
                });

                mediaRecorder.stop();
              });
            return {
              start,
              stop,
              state
            };
          });
      } else {
        return null;
      }
    }
  }
);
