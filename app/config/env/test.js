/*
 Test Environment configuration properties
 */
export default {
  appRootPath: '/', //default is root
  endpoint: {
    url: 'http://localhost:7357',
    secureUrl: 'http://localhost:7357',
    tenantUrl: 'http://s3-us-west-1.amazonaws.com/nile-tenants/dev'
  },

  realTime: {
    webServiceUrl: 'https://localhost:7357',
    webServiceUri: '/nucleus/realtime',
    webSocketUrl: 'https://localhost:7357',
    webSocketUri: '/ws/realtime'
  },

  teams: {
    url: 'http://teams-qa.gooru.org'
  },

  player: {
    resources: {
      pdf: {
        googleDriveEnable: false,
        googleDriveUrl: 'https://docs.google.com/gview?url='
      }
    }
  },

  themes: {
    bergen: {
      player: {
        narration: {
          highlightColor: '#C1E7D9'
        }
      }
    }
  },

  'quizzes-addon': {
    endpoint: {
      url: 'http://localhost:7357',
      secureUrl: 'http://localhost:7357',
      providerUrl: 'http://localhost:7357'
    },

    realTime: {
      webServiceUrl: 'https://localhost:7357',
      webServiceUri: '/nucleus/realtime',
      webSocketUrl: 'realtimeURL',
      webSocketUri: '/realtimeURI'
    }
  },

  exploreFeaturedCourses: {
    firstCourseId: '1d91657f-694b-43dc-9306-bca17b107c7d',
    secondCourseId: '3def51be-bd91-48fd-b747-9c86339b571a',
    thirdCourseId: 'd9b7c359-adff-486d-a2cf-bbbbc66c2ba5',
    fourthCourseId: '781c3e76-a382-4652-86ae-079b92f57a9d'
  },

  languageSetting: {
    defaultLang: 'en',
    showDropMenu: true
  },

  researcher: {
    redirectURL: 'http://localhost:7357',
    userIds: [
      '95a744e1-631e-4642-875d-8b07a5e3b421',
      'df956d5f-b7b2-43ae-98a1-c90a12eacaf9'
    ]
  },

  userAlert: {
    message: null
  },

  demoClass: {
    code: 'FZRC834',
    id: '002b0b27-1b51-4343-a51f-76fae80534f8'
  },

  GRU_FEATURE_FLAG: {
    searchFilter: true,
    i2dFlow: false,
    enableCollectionLiveLearning: true,
    isLessonPlanShow: true,
    isShowSecondaryClass: false,
    isShowFeaturedCourses: false,
    isShowGuardianInvite: false,
    isShowH5PCreation: false
  },

  GUEST_TEACHER_ACCOUNT: 'TXJGZWVueToxMjM0NQ==',
  GUEST_STUDENT_ACCOUNT: 'dGxhd3JlbmNlOjEyMzQ1',
  ADMIN_GUEST_ROOT_PATH: 'https://admin.gooru.org/guest'
};
