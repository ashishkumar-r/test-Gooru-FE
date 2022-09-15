import Ember from 'ember';
import utils from 'gooru-web/utils/utils';
import Env from '../config/environment';
const ConfigEvent = Env.events || {};

/**
 * Create the array of objects necessary for the API call
 * @param event
 */
export function savePlayerEvent(event, session) {
  const apiKey = ConfigEvent.eventAPIKey;

  var url = `${ConfigEvent.playerEventEndpoint}?apiKey=${apiKey}`;
  var eventData = [
    {
      eventId: utils.generateUUID(),
      eventName: event.eventName,
      session: {
        apiKey: apiKey,
        sessionToken: session.get('token')
      },
      startTime: event.startTime,
      endTime: event.endTime,
      user: {
        gooruUId: session.get('userId')
      },
      context: {
        contentGooruId: event.contentGooruId,
        type: event.type
      },
      version: {
        logApi: ConfigEvent.apiVersion
      },
      metrics: '{}',
      payLoadObject: event.payLoadObject
    }
  ];

  return Ember.$
    .ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(eventData),
      contentType: 'application/json;charset=utf-8',
      dataType: 'json'
    })
    .then(
      function(response) {
        return response;
      },
      function(error) {
        return error.responseText;
      }
    );
}

/**
 * Doc
 * @param event
 * @param session
 */
function startPlayerEvent(event, session) {
  if (event !== undefined) {
    event.type = 'start';
    event.payLoadObject = {
      questionType: event.questionType,
      attemptStatus: event.attemptStatus,
      answerObject: []
    };
  }
  savePlayerEvent(event, session);
}

/**
 * Sets the type and the payload format for the stop event before send the data
 * @param event
 * @param session
 */
function stopPlayerEvent(event, session) {
  if (event !== undefined) {
    event.type = 'stop';
    event.payLoadObject = {
      questionType: event.questionType,
      attemptStatus: event.attemptStatus,
      answerObject: event.answerObject
    };
  }
  savePlayerEvent(event, session);
}

/**
 * Start Question event
 * Sets some necessary data that the server requires for this specific event
 * @param question
 * @param session
 */
export function startQuestion(question, session) {
  var event = {
    eventName: 'resource.play',
    startTime: moment().unix(),
    endTime: null,
    contentGooruId: question.id,
    questionType: question.questionType,
    attemptStatus: null,
    answerObject: []
  };
  startPlayerEvent(event, session);
}

/**
 * Converts the answer in the correct format
 * @param event
 * @param session
 */
function convertAnswer(answer) {
  return {
    text: answer.text,
    status: answer.status,
    order: answer.order,
    answerId: answer.answerId,
    timeStamp: moment().unix(),
    skip: answer.skip
  };
}

/**
 * Stop Question event
 * Sets some necessary data that the server requires for this specific event
 * @param question
 * @param isAnswerCorrect
 * @param answer
 * @param session
 */
export function stopQuestion(question, isAnswerCorrect, answer, session) {
  var event = {
    eventName: 'resource.play',
    startTime: null,
    endTime: moment().unix(),
    contentGooruId: question.id,
    questionType: question.questionType,
    attemptStatus: isAnswerCorrect ? 'correct' : 'incorrect',
    answerObject: [convertAnswer(answer)]
  };
  stopPlayerEvent(event, session);
}
