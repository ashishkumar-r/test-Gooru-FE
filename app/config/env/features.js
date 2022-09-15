/**
 Default application features setup
 @see services/configuration.js
 */
export default {
  features: {
    header: {
      enabled: true
    },
    collections: {
      player: {
        showReactionBar: true,
        showReportLink: true,
        showBackLink: true,
        showRemix: true,
        showCollectionName: true,
        showCollectionAuthor: true,
        showResourceNumber: true,
        showQuestionFeedback: undefined,
        allowProfileNavigation: true
      }
    }
  }
};
