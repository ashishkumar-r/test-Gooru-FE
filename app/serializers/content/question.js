import Ember from 'ember';
import { cleanFilename, serializeEtlSec } from 'gooru-web/utils/utils';
import QuestionModel from 'gooru-web/models/content/question';
import AnswerModel from 'gooru-web/models/content/answer';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import RubricSerializer from 'gooru-web/serializers/rubric/rubric';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Serializer to support the Question CRUD operations for API 3.0
 *
 * @typedef {Object} QuestionSerializer
 */
export default Ember.Object.extend(TenantSettingsMixin, {
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
   * Serialize a Question object into a JSON representation required by the Create Question endpoint
   *
   * @param questionModel The Question model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeCreateQuestion: function(questionModel) {
    const serializer = this;
    const format = QuestionModel.serializeQuestionType(
      questionModel.get('type')
    );
    const answers = questionModel.get('answers');
    let hints = questionModel.get('hints');
    var serializedQuestion = {
      title: questionModel.get('title'),
      description: questionModel.get('description'),
      content_subformat: format,
      visible_on_profile: questionModel.get('isVisibleOnProfile'),
      primary_language: questionModel.get('primaryLanguage'),
      metadata: questionModel.get('metadata') || {}
    };

    if (
      questionModel.type === 'MA' ||
      questionModel.type === 'FIB' ||
      questionModel.type === 'HS_TXT' ||
      questionModel.type === 'SERP_IB' ||
      questionModel.type === 'SERP_EA' ||
      questionModel.type === 'SERP_VT' ||
      questionModel.type === 'SERP_CS' ||
      questionModel.type === 'SERP_SD' ||
      questionModel.type === 'SERP_SO' ||
      questionModel.type === 'SERP_CL' ||
      questionModel.type === 'SERP_IVSA' ||
      questionModel.type === 'HS_IMG' ||
      questionModel.type === 'HT_RO' ||
      questionModel.type === 'MTF'
    ) {
      serializedQuestion.player_metadata = {
        isPartialEnable: true
      };
    }
    let questionEvidenceVisibility = this.get('questionEvidenceVisibility');
    if (questionEvidenceVisibility) {
      let contentSubformat = format;
      let contentSubformatKeyCheck =
        contentSubformat in questionEvidenceVisibility;
      let contentSubformatCheck = questionEvidenceVisibility[contentSubformat];
      if (contentSubformatCheck === true || !contentSubformatKeyCheck) {
        if (serializedQuestion.player_metadata) {
          serializedQuestion.player_metadata.isEvidenceEnabled = true;
        } else {
          serializedQuestion.player_metadata = {
            isEvidenceEnabled: true
          };
        }
      }
    } else {
      if (serializedQuestion.player_metadata) {
        serializedQuestion.player_metadata.isEvidenceEnabled = true;
      } else {
        serializedQuestion.player_metadata = {
          isEvidenceEnabled: true
        };
      }
    }

    serializedQuestion.metadata.audience = questionModel.get('audience')
      ? questionModel.get('audience')
      : [];
    serializedQuestion.metadata.depth_of_knowledge = questionModel.get(
      'depthOfknowledge'
    )
      ? questionModel.get('depthOfknowledge')
      : [];

    if (questionModel.get('questionText')) {
      serializedQuestion.player_metadata = {
        additional_attributes: {
          chooseone_question_text: questionModel.get('questionText')
        }
      };
    }

    serializedQuestion.hint_explanation_detail = {
      exemplar: questionModel.get('hintExplanationDetail') || '',
      exemplar_docs: questionModel.get('exemplar_docs') || []
    };

    if (
      questionModel.get('isScientificFIB') ||
      questionModel.get('isScientificFreeRes')
    ) {
      serializedQuestion.hint_explanation_detail = serializer.serializerHintsAnswer(
        hints
      );
    }

    if (
      questionModel.get('isScientificFIB') ||
      questionModel.get('isScientificFreeRes')
    ) {
      serializedQuestion.answer =
        answers && answers.length
          ? answers.map(function(answer) {
            return serializer.serializerScientificAnswer(
              answer,
              questionModel.get('isScientificFIB')
            );
          })
          : null;
    } else if (questionModel.get('type') === 'SERP_IB') {
      serializedQuestion.answer = serializer.serializeBaseWordAnswer(answers);
    } else if (questionModel.get('type') === 'SERP_AFC') {
      serializedQuestion.answer = null;
    } else {
      serializedQuestion.answer =
        answers && answers.length
          ? answers.map(function(answer, index) {
            return serializer.serializerAnswer(
              answer,
              index + 1,
              questionModel.get('isHotSpotImage')
            );
          })
          : null;
    }
    if (questionModel.get('author_etl_secs')) {
      serializedQuestion.author_etl_secs =
        questionModel.get('author_etl_secs') === '0'
          ? null
          : questionModel.get('author_etl_secs');
    }
    return serializedQuestion;
  },

  serializeBaseWordAnswer(payload) {
    let result = [];
    payload.forEach(item => {
      let correctAns = item.correctAnswer
        ? item.correctAnswer.map(ans => JSON.stringify(ans))
        : [];
      let answer = {
        answer_text: item.text,
        answer_type: item.type,
        base_words: item.baseWords,
        is_correct: item.isCorrect || false,
        correct_answer: correctAns
      };
      result.push(answer);
    });
    return result;
  },

  serializeClassicAnswer(payload) {
    let result = [];
    payload.forEach(item => {
      let answer = {
        answer_text: item.text,
        answer_type: item.type,
        is_correct: item.isCorrect || false,
        correct_answer: item.correctAnswer,
        text_image: item.textImage,
        additional_letters: item.additionalLetters
      };
      result.push(answer);
    });
    return result;
  },

  /**
   * @function serilaizeSortingAnswer help to serialize the sorting question type answer object
   */
  serilaizeSortingAnswer(payload) {
    let result = [];
    payload.forEach(item => {
      let answer = {
        answer_text: item.text,
        answer_type: item.type,
        is_correct: item.isCorrect || false,
        sequence: item.sequence
      };
      answer.correct_answer = [JSON.stringify(answer)];
      result.push(answer);
    });
    return result;
  },

  /**
   * Serialize a Question object into a JSON representation required by the Update Question endpoint
   *
   * @param questionModel The Question model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateQuestion: function(questionModel) {
    const serializer = this;
    let answers = questionModel.get('answers');
    let hints = questionModel.get('hints');
    let maxScore = questionModel.get('maxScore');
    let serializedQuestion = {
      title: questionModel.get('title'),
      //'content_subformat': QuestionModel.serializeQuestionType(questionModel.get("type")), // This is not supported on the back end yet
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(questionModel.get('standards')),
      visible_on_profile: questionModel.get('isVisibleOnProfile'),
      metadata: questionModel.get('metadata') || {},
      primary_language: questionModel.get('primaryLanguage'),
      max_score: parseInt(maxScore),
      description: questionModel.get('description')
    };

    if (
      questionModel.type === 'MA' ||
      questionModel.type === 'FIB' ||
      questionModel.type === 'HS_TXT' ||
      questionModel.type === 'SERP_IB' ||
      questionModel.type === 'SERP_EA' ||
      questionModel.type === 'SERP_VT' ||
      questionModel.type === 'SERP_CS' ||
      questionModel.type === 'SERP_SD' ||
      questionModel.type === 'SERP_SO' ||
      questionModel.type === 'SERP_CL' ||
      questionModel.type === 'SERP_IVSA' ||
      questionModel.type === 'HS_IMG' ||
      questionModel.type === 'HT_RO' ||
      questionModel.type === 'MTF'
    ) {
      serializedQuestion.player_metadata = {
        isPartialEnable: questionModel.get('isPartialEnable')
      };
    }

    let questionEvidenceVisibility = this.get('questionEvidenceVisibility');
    if (questionEvidenceVisibility) {
      let contentSubformat = questionModel.content_subformat;
      let contentSubformatKeyCheck =
        contentSubformat in questionEvidenceVisibility;
      let contentSubformatCheck = questionEvidenceVisibility[contentSubformat];

      if (contentSubformatCheck === true || !contentSubformatKeyCheck) {
        if (serializedQuestion.player_metadata) {
          serializedQuestion.player_metadata.isEvidenceEnabled = questionModel.get(
            'isEvidenceEnabled'
          );
        } else {
          serializedQuestion.player_metadata = Ember.Object.create(
            questionModel.get('playerMetadata')
          );
          serializedQuestion.player_metadata.set(
            'isEvidenceEnabled',
            questionModel.get('isEvidenceEnabled')
          );
        }
      }
    } else {
      if (serializedQuestion.player_metadata) {
        serializedQuestion.player_metadata.isEvidenceEnabled = questionModel.get(
          'isEvidenceEnabled'
        );
      } else {
        serializedQuestion.player_metadata = Ember.Object.create(
          questionModel.get('playerMetadata')
        );
        serializedQuestion.player_metadata.set(
          'isEvidenceEnabled',
          questionModel.get('isEvidenceEnabled')
        );
      }
    }

    let thumbnail = questionModel.get('thumbnail');
    serializedQuestion.thumbnail =
      cleanFilename(thumbnail, this.get('session.cdnUrls')) || null;
    let narration = questionModel.get('narration');
    if (narration) {
      serializedQuestion.narration = narration;
    }

    let description = questionModel.get('text');
    if (description) {
      serializedQuestion.description = description ? description : '';
    }
    if (questionModel.get('thumbnailAltText')) {
      serializedQuestion.metadata.thumbnailAltText = questionModel.get(
        'thumbnailAltText'
      );
    }
    serializedQuestion.metadata.audience = questionModel.get('audience')
      ? questionModel.get('audience')
      : [];
    serializedQuestion.metadata.depth_of_knowledge = questionModel.get(
      'depthOfknowledge'
    )
      ? questionModel.get('depthOfknowledge')
      : [];
    if (questionModel.get('questionText')) {
      serializedQuestion.player_metadata = {
        additional_attributes: {
          chooseone_question_text: questionModel.get('questionText')
        }
      };
    }

    if (questionModel.get('softText') || questionModel.get('hardText')) {
      let playerMetadata = serializedQuestion.player_metadata
        ? serializedQuestion.player_metadata
        : {};
      let additionalAttributes = playerMetadata.additional_attributes
        ? playerMetadata.additional_attributes
        : {};
      serializedQuestion.player_metadata = {
        additional_attributes: Object.assign({}, additionalAttributes, {
          soft_text: questionModel.get('softText')
            ? questionModel.get('softText')
            : 'Soft "a"',
          hard_text: questionModel.get('hardText')
            ? questionModel.get('hardText')
            : 'Hard "A"'
        })
      };
    }

    serializedQuestion.hint_explanation_detail = {
      exemplar: questionModel.get('hintExplanationDetail') || '',
      exemplar_docs: questionModel.get('exemplar_docs') || []
    };

    if (
      questionModel.get('isScientificFIB') ||
      questionModel.get('isScientificFreeRes')
    ) {
      serializedQuestion.hint_explanation_detail = serializer.serializerHintsAnswer(
        hints
      );
    }

    if (
      questionModel.get('isScientificFIB') ||
      questionModel.get('isScientificFreeRes')
    ) {
      serializedQuestion.answer =
        answers && answers.length
          ? answers.map(function(answer) {
            return serializer.serializerScientificAnswer(
              answer,
              questionModel.get('isScientificFIB')
            );
          })
          : null;
    } else if (
      questionModel.get('type') === 'SERP_IB' ||
      questionModel.get('type') === 'SERP_VT' ||
      questionModel.get('type') === 'SERP_CS' ||
      questionModel.get('type') === 'SERP_SD' ||
      questionModel.get('type') === 'SERP_IVSA'
    ) {
      serializedQuestion.answer = serializer.serializeBaseWordAnswer(answers);
    } else if (questionModel.type === 'SERP_CL') {
      serializedQuestion.answer = serializer.serializeClassicAnswer(answers);
    } else if (questionModel.get('isSorting')) {
      serializedQuestion.answer =
        answers && answers.length
          ? serializer.serilaizeSortingAnswer(answers)
          : null;
    } else if (questionModel.get('isLikertScale')) {
      serializedQuestion.answer =
        answers && answers.length
          ? serializer.serilaizeLikertScale(answers)
          : null;
    } else if (questionModel.get('isMatchTheFollowing')) {
      serializedQuestion.answer =
        answers && answers.length
          ? serializer.serilaizeMatchtheFollowing(answers)
          : null;
    } else {
      serializedQuestion.answer =
        answers && answers.length
          ? answers.map(function(answer, index) {
            return serializer.serializerAnswer(
              answer,
              index + 1,
              questionModel.get('isHotSpotImage')
            );
          })
          : null;
    }
    if (questionModel.get('author_etl_secs')) {
      serializedQuestion.author_etl_secs = questionModel.get('author_etl_secs');
    }
    return serializedQuestion;
  },

  /**
   * Serialize the question title
   *
   * @param title
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateQuestionTitle: function(title) {
    let serializedQuestion = {
      title: title
    };
    return serializedQuestion;
  },

  serilaizeLikertScale(answers) {
    const answersList = [];
    answers.forEach(item => {
      const answer = {
        scale_point: item.scalePoint,
        scale_point_labels: item.scalePointLabels.map(scale => {
          return {
            level_point: scale.levelPoint,
            level_name: scale.levelName
          };
        }),
        items: item.items.map(content => content.label),
        ui_display_guide: {
          ui_presentation: item.uiDisplayGuide.uiPresentation,
          rating_type: item.uiDisplayGuide.ratingType
        }
      };
      answersList.push(answer);
    });
    return answersList;
  },

  serilaizeMatchtheFollowing(answers) {
    const answersList = [];
    answers.map(function(item, index) {
      const answer = {
        sequence: index + 1,
        left_value: item.leftValue,
        right_value: item.rightValue,
        left_value_format: item.leftValueFormat,
        right_value_format: item.rightValueFormat,
        right_val_shuffle_order: item.rightValShuffleOrder
      };
      answersList.push(answer);
    });
    return answersList;
  },

  /**
   * Serialize an Answer model object into a JSON representation required by the Update Question endpoint
   *
   * @param answerModel - the Answer model to be serialized
   * @param sequenceNumber - the answer's sequence number
   * @returns {Object}
   */
  serializerAnswer: function(answerModel, sequenceNumber, isHotSpotImage) {
    var serializedAnswer = {
      sequence: sequenceNumber,
      is_correct: answerModel.get('isCorrect') ? 1 : 0,
      answer_text: isHotSpotImage
        ? cleanFilename(answerModel.get('text'), this.get('session.cdnUrls'))
        : answerModel.get('text'),
      answer_type: answerModel.get('type')
    };
    if (answerModel.get('highlightType')) {
      serializedAnswer.highlight_type = answerModel.get('highlightType');
    }
    if (answerModel.get('audioUrl') != null) {
      serializedAnswer.answer_audio_filename = answerModel.get('audioUrl');
    }
    if (answerModel.get('correctAnswer').length > 0) {
      serializedAnswer.correct_answer = answerModel.get('correctAnswer');
    }
    if (answerModel.get('struggles')) {
      serializedAnswer.struggles = this.serializeStruggleList(
        answerModel.get('struggles')
      );
    }
    return serializedAnswer;
  },

  serializeStruggleList(params) {
    let result = [];
    params &&
      params.forEach(item => {
        let struggle = {
          manifestCompCode: item.manifestCompCode,
          manifestDisplayCode: item.manifestDisplayCode,
          originCompCode: item.originCompCode,
          originDisplayCode: item.originDisplayCode,
          struggleCode: item.struggleCode,
          struggleDesc: item.struggleDesc,
          struggleDisplayText: item.struggleDisplayText,
          subjectCode: item.subjectCode
        };
        result.push(struggle);
      });
    return result;
  },

  serializerScientificAnswer: function(answerModel, isScientificFIB) {
    var serializedAnswer = {
      answer_category: answerModel.get('answer_category'),
      answer_type: answerModel.get('answer_type')
    };
    if (isScientificFIB) {
      serializedAnswer.correct_answer = answerModel.get('correct_answer');
      serializedAnswer.answer_text = answerModel.get('answer_text');
    }
    return serializedAnswer;
  },

  serializerHintsAnswer: function(items) {
    let serializedAnswer = {};
    items.map(function(item) {
      let ansCategory = item.get('answer_category');
      let hints = item.get('hints');
      serializedAnswer[`${ansCategory}_explanation`] = hints;
    });
    return serializedAnswer;
  },
  /**
   * Normalize the question data into a Question object
   * @param questionData
   * @param index optional index value, corresponds to the assessment or collection index
   * @returns {Question}
   */
  normalizeReadQuestion: function(questionData, index) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const format = QuestionModel.normalizeQuestionType(
      questionData.content_subformat
    );
    const standards = questionData.taxonomy || {};
    const metadata = questionData.metadata || {};
    const etlSeconds = serializeEtlSec(questionData.author_etl_secs);

    const subQuestions = questionData.subQuestions || null;

    const playerMetadata = questionData.player_metadata
      ? questionData.player_metadata
      : {};

    const additionalAttributes = playerMetadata
      ? playerMetadata.additional_attributes
      : null;
    const standard = serializer
      .get('taxonomySerializer')
      .normalizeTaxonomyObject(standards);
    let max_score;
    if (questionData && questionData.teacherRubric) {
      max_score = questionData.teacherRubric.max_score;
    } else if (questionData && questionData.studentRubric) {
      max_score = questionData.studentRubric.max_score;
    } else {
      max_score = questionData.max_score;
    }
    const question = QuestionModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        id: questionData.id,
        title: questionData.title,
        narration: questionData.narration,
        answerDetails: questionData.answerDetails,
        hint: questionData.hints,
        type: format,
        content_format: questionData.content_format,
        content_subformat: questionData.content_subformat,
        thumbnail: questionData.thumbnail
          ? basePath + questionData.thumbnail
          : null,
        text: questionData.description,
        publishStatus: questionData.publish_status,
        owner: questionData.creator_id,
        creator: questionData.original_creator_id,
        standards: standard,
        hints: null, //TODO
        explanation: null, //TODO
        isVisibleOnProfile:
          typeof questionData.visible_on_profile !== 'undefined'
            ? questionData.visible_on_profile
            : true,
        primaryLanguage: questionData.primary_language || 1,
        order: questionData.sequence_id || index + 1,
        metadata: metadata,
        audience:
          metadata.audience && metadata.audience.length > 0
            ? metadata.audience
            : [],
        depthOfknowledge:
          metadata.depth_of_knowledge && metadata.depth_of_knowledge.length > 0
            ? metadata.depth_of_knowledge
            : [],
        thumbnailAltText: metadata.thumbnailAltText || null,
        courseId: questionData.course_id,
        unitId: questionData.unit_id,
        lessonId: questionData.lesson_id,
        collectionId: questionData.collection_id,
        maxScore: max_score || 1,
        hintExplanationDetail: questionData.hint_explanation_detail
          ? questionData.hint_explanation_detail.exemplar
          : null,
        exemplarDocs: questionData.hint_explanation_detail
          ? questionData.hint_explanation_detail.exemplar_docs
          : [],
        author_etl_secs: questionData.author_etl_secs,
        questionHrs: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
        questionMins:
          etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
        questionText: additionalAttributes
          ? additionalAttributes.chooseone_question_text
          : null,
        playerMetadata: playerMetadata,
        isPartialEnable:
          questionData.playerMetadata &&
          questionData.playerMetadata.isPartialEnable
            ? questionData.playerMetadata.isPartialEnable
            : true,

        isEvidenceEnabled:
          questionData.playerMetadata &&
          questionData.playerMetadata.isEvidenceEnabled
            ? questionData.playerMetadata.isEvidenceEnabled
            : true,
        feedbackComment: questionData.feedback_comment
          ? questionData.feedback_comment
          : null,
        taxonomy: standard.get('firstObject')
      }
    );

    if (subQuestions) {
      const subQuestionsList = subQuestions.map((item, index) =>
        serializer.normalizeReadQuestion(item, index)
      );
      question.set('subQuestions', subQuestionsList.sortBy('order'));
    }

    if (
      additionalAttributes &&
      (additionalAttributes.soft_text || additionalAttributes.hard_text)
    ) {
      question.set('softText', additionalAttributes.soft_text);
      question.set('hardText', additionalAttributes.hard_text);
    }
    let answers = serializer.normalizeAnswerArray(questionData.answer, format);
    if (question.get('isHotSpotImage')) {
      answers.forEach(function(answer) {
        //adding the basepath for HS Image
        answer.set('text', basePath + answer.get('text'));
      });
    }
    if (
      question.get('type') === 'SERP_IB' ||
      question.get('type') === 'SERP_VT' ||
      question.get('type') === 'SERP_CS' ||
      question.get('type') === 'SERP_SD' ||
      question.get('type') === 'SERP_IVSA'
    ) {
      answers.forEach(function(answer) {
        answer.set(
          'correctAnswer',
          answer.correctAnswer.map(item =>
            Ember.typeOf(item) === 'string' ? JSON.parse(item) : item
          )
        );
      });
    }
    if (question.get('isLikertScale')) {
      answers.forEach(function(answer) {
        const items = answer.items.map(item => {
          return Ember.Object.create({
            label: item
          });
        });
        answer.set('items', Ember.A(items));
      });
    }

    question.set('answers', answers);

    if (question.get('isLegacyFIB')) {
      //this logic support old FIB question format, it is necessary only for the editor
      question.updateLegacyFIBText();
    }

    if (
      question.get('isOpenEnded') ||
      question.get('isScientificFIB') ||
      question.get('isScientificFreeRes') ||
      question.get('isSerpSayOutLoud') ||
      question.get('isSerpEncoding') ||
      question.get('isSerpDecoding') ||
      question.get('isSerpUnderline') ||
      question.get('isSerpWPM')
    ) {
      question.set(
        'rubric',
        serializer
          .get('rubricSerializer')
          .normalizeRubric(questionData.rubric, [])
      );
    }

    if (
      question.get('isScientificFIB') ||
      question.get('isScientificFreeRes')
    ) {
      question.answerDetails = questionData.answer;
      question.hints =
        questionData.hint_explanation_detail &&
        !questionData.hint_explanation_detail.exemplar &&
        !questionData.hint_explanation_detail.exemplar_docs
          ? questionData.hint_explanation_detail
          : null;
    }
    return question;
  },
  /**
   * Normalize an array of answers
   *
   * @param answerArray array of answers coming from the endpoint
   * @returns {AnswerModel[]}
   */
  normalizeAnswerArray: function(answerArray, format) {
    const serializer = this;
    let result = Ember.A([]);
    if (answerArray && Ember.isArray(answerArray)) {
      result = answerArray.map(function(answerData) {
        return serializer.normalizeAnswer(answerData, format);
      });
    }
    return result;
  },

  /**
   * Serialize reorder assessment
   * @param {string[]} questionIds
   */
  serializeReorderQuestions: function(questionIds) {
    const values = questionIds.map(function(id, index) {
      return { id: id, sequence_id: index + 1 };
    });

    return {
      order: values
    };
  },

  /**
   * Normalize a single answer into a Answer object
   *
   * @param answerData Answer data
   * @returns {Answer}
   */
  normalizeAnswer: function(answerData, format) {
    const id =
      format !== 'MA'
        ? window.btoa(encodeURIComponent(answerData.answer_text))
        : `answer_${answerData.sequence}`;
    let answerObject = AnswerModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        id: id,
        sequence: answerData.sequence,
        isCorrect:
          answerData.is_correct === 1 || answerData.is_correct === true,
        text: answerData.answer_text,
        type: answerData.answer_type,
        struggles: answerData.struggles ? Ember.A(answerData.struggles) : null,
        highlightType: answerData.highlight_type,
        audioUrl: answerData.answer_audio_filename,
        correctAnswer: answerData.correct_answer || Ember.A([]),
        textImage: answerData.text_image || null,
        additionalLetters: answerData.additional_letters || Ember.A([]),
        ...this.normalizeLikertScaleAnswer(answerData)
      }
    );
    if (format === 'MTF') {
      Object.assign(
        answerObject,
        this.normalizeMatchtheFolloingAnswerArray(answerData)
      );
    }
    return answerObject;
  },

  normalizeLikertScaleAnswer(answerData) {
    const displayGuide = answerData.ui_display_guide;
    const uiDisplayGuide = {
      uiPresentation: displayGuide ? displayGuide.ui_presentation : null,
      ratingType: displayGuide ? displayGuide.rating_type : null
    };
    const scalePoint = answerData.scale_point || null;
    let scalePointLabels =
      (answerData.scale_point_labels &&
        answerData.scale_point_labels.map(item => {
          return Ember.Object.create({
            levelName: item.level_name,
            levelPoint: item.level_point ? parseInt(item.level_point) : 0
          });
        })) ||
      [];
    const items = answerData.items || null;
    if (scalePointLabels) {
      scalePointLabels = scalePointLabels.sort(
        (a, b) => a.levelPoint - b.levelPoint
      );
    }
    return {
      scalePoint,
      scalePointLabels,
      items,
      uiDisplayGuide
    };
  },

  normalizeMatchtheFolloingAnswerArray(answerData) {
    return {
      leftValue: answerData.left_value,
      rightValue: answerData.right_value,
      leftValueFormat: answerData.left_value_format,
      rightValueFormat: answerData.right_value_format,
      rightValShuffleOrder: answerData.right_val_shuffle_order,
      isCorrect: true
    };
  }
});
