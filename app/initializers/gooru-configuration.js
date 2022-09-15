import Env from 'gooru-web/config/environment';

/**
 * Initialize gooru config
 */
export function initialize(application) {
  const configurationService = application.__container__.lookup(
    'service:configuration'
  );
  const quizzesConfigurationService = application.__container__.lookup(
    'service:quizzes/configuration'
  );
  // Wait until all of the following promises are resolved
  application.deferReadiness();

  const awProps = Env.APP.awProps; //application widget properties
  const configBaseUrl = awProps ? awProps.appRootPath : undefined;
  configurationService.loadConfiguration(configBaseUrl).then(function() {
    //Setting quizzes-addon properties
    quizzesConfigurationService.mergeConfiguration(
      configurationService.get('configuration.quizzes-addon')
    );
    // Continue the Application boot process, allowing other Initializers to run
    application.advanceReadiness();
  });
}

export default {
  name: 'gooru-configuration',
  after: 'quizzes-configuration',
  initialize: initialize
};
