/*
 Development Environment configuration properties
 */
export default {
  appRootPath: '/', //default is root
  endpoint: {
    url: '',
    secureUrl: '',
    tenantUrl: 'http://s3-us-west-1.amazonaws.com/nile-tenants/dev' //Deprecated
  },
  realTime: {
    webServiceUrl: '',
    webServiceUri: '/',
    webSocketUrl: 'https://rt-stag.gooru.org',
    webSocketUri: '/ws/quizzes-realtime'
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
      url: '',
      secureUrl: '',
      providerUrl: ''
    },
    realTime: {
      webServiceUrl: '',
      webServiceUri: '/',
      webSocketUrl: 'https://rt-stag.gooru.org',
      webSocketUri: '/ws/quizzes-realtime'
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
    redirectURL: 'http://research-dev.gooru.org',
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
    isShowSecondaryClass: true,
    isShowFeaturedCourses: false,
    isShowGuardianInvite: true,
    isGuestDemoTenant: true,
    isShowH5PCreation: false,
    isShowCAVideoConference: true,
    isShowAppSwitcher: true,
    disabledUnit0: true,
    sendSignupInviteMail: false
  },
  FILE_UPLOAD: {
    MAX_SIZE_IN_MB: 12
  },
  DEMO_TENANT_AUTH: {
    clientId: '811b024d-57a5-4931-92eb-0d514cbffe34',
    clientKey: 'XFR/JsGbaYkOqkQ3oSQT4NC6Pc4='
  },
  GUEST_TEACHER_ACCOUNT: 'Ym1ndWVzdDpnb29ydTEyMw==',
  GUEST_STUDENT_ACCOUNT: 'bWpvaG5zb25AZ29vcnUub3JnOjEyMzQ1',
  TENANT_URL: 'https://tl.stage.gooru.org/',
  TENANT_DOMAIN_NAME: 'tl-stage.gooru.org',
  ADMIN_GUEST_ROOT_PATH: 'https://missioncontrol.stage.gooru.org/guest',
  OAUTH_LOGIN_LANUCH_URL:
    'https://beta.gooru.org/api/nucleus-auth-idp/v1/oauth2',
  SHOW_DEMO_CLASS: false,
  SHOW_PARTIAL_SCORE: false,
  APP_VERSION: '6.0.1',
  TENANT_SIGNUP_URL: 'https://schools.stage.gooru.org/',
  REDIRECT_ENDPOINT: 'https://stage.gooru.org',
  LANGUAGE: [
    {
      en: 'English',
      langCode: 'en',
      id: 'en',
      isActive: true
    },
    {
      sp: 'Español',
      langCode: 'es',
      id: 'sp',
      isActive: true
    },
    {
      ar: 'عربى',
      langCode: 'ar',
      id: 'ar',
      isActive: true
    },
    {
      mr: 'मराठी',
      langCode: 'mr',
      id: 'mr',
      isActive: true
    },
    {
      kn: 'ಕನ್ನಡ',
      langCode: 'kn',
      id: 'kn',
      isActive: true
    },
    {
      hi: 'हिंदी',
      langCode: 'hi',
      id: 'hi',
      isActive: true
    },
    {
      as: 'অসমীয়া',
      langCode: 'as',
      id: 'as',
      isActive: true
    },
    {
      bn: 'বাংলা',
      langCode: 'bn',
      id: 'bn',
      isActive: true
    },
    {
      gu: 'ગુજરાતી',
      langCode: 'gu',
      id: 'gu',
      isActive: true
    },
    {
      ml: 'മല്യാലം',
      langCode: 'ml',
      id: 'ml',
      isActive: true
    },
    {
      or: ' ଓଡ଼ିଆ',
      langCode: 'or',
      id: 'or',
      isActive: true
    },
    {
      pa: 'ਪੰਜਾਬੀ',
      langCode: 'pa',
      id: 'pa',
      isActive: true
    },
    {
      ta: 'தமிழ்',
      langCode: 'ta',
      id: 'ta',
      isActive: true
    },
    {
      te: 'తెలుగు',
      langCode: 'te',
      id: 'te',
      isActive: true
    },
    {
      ch: '中文',
      langCode: 'zh',
      id: 'ch',
      isActive: true
    },
    {
      af: 'Afrikaans',
      langCode: 'af',
      id: 'af',
      isActive: true
    }
  ],
  visibility_content_types: {
    learning_skills: {
      serp_encoding_assessment_question: true,
      serp_decoding_assessment_question: true,
      serp_lang_say_out_loud_question: true,
      serp_lang_identify_digraph_question: true,
      serp_reading_passage: true,
      serp_lang_activities_for_comprehension_question: true,
      serp_lang_identify_base_word_question: true,
      serp_lang_vowel_teams_question: false,
      serp_lang_counting_syllables_question: false,
      serp_lang_syllable_division_question: false,
      serp_classic_question: true,
      serp_choose_one_question: false,
      serp_pick_n_choose_question: true,
      serp_sorting_question: true,
      serp_multi_choice_question: false,
      serp_identify_vowel_sound_activity_question: true
    },
    interactive_resources: {
      h5p_interactive_video: true,
      h5p_interactive_slide: true,
      h5p_interactive_personality_quiz: true,
      h5p_drag_and_drop_question: true,
      h5p_drag_and_drop_resource: true
    },

    other_questions: {
      multiple_choice_question: true,
      multiple_answer_question: true,
      hot_text_reorder_question: true,
      hot_text_highlight_question: true,
      true_false_question: true,
      fill_in_the_blank_question: true,
      hot_spot_image_question: true,
      hot_spot_text_question: true,
      open_ended_question: true,
      scientific_fill_in_the_blank_question: true,
      scientific_free_response_question: true,
      likert_scale_question: false
    },

    other_resources: {
      webpage: true,
      video: true,
      interactive: true,
      audio: true,
      image: true,
      text: true,
      interactive_video: true,
      interactive_slide: true
    }
  }
};
