// File max size in MB
export const FILE_MAX_SIZE_IN_MB = 12;

export const RESOURCE_COMPONENT_MAP = {
  'video/youtube': 'player.resources.gru-youtube-resource',
  'resource/url': 'player.resources.gru-url-resource',
  handouts: 'player.resources.gru-pdf-resource',
  image: 'player.resources.gru-image-resource',
  'vimeo/video': 'player.resources.gru-vimeo-resource',
  'resource/html': 'player.resources.gru-html-resource'
};

export const I2D_SUPPORTED_IMAGE_TYPES = {
  validExtensions: '.jpg, .jpeg, .png',
  validTypes: ['image/png', 'image/jpg', 'image/jpeg']
};

export const UPLOADABLE_TYPES = [
  {
    value: 'image',
    validExtensions: '.jpg, .jpeg, .gif, .png',
    validType: 'image/*'
  },
  {
    value: 'text',
    validExtensions: '.pdf',
    validType: 'application/pdf'
  },
  {
    value: 'audio',
    validExtensions: '.mp3, .ogg, .m4a and .wav',
    validType: 'audio/*'
  },
  {
    value: 'video',
    validExtensions: '.mp4, .mov, .webm and .ogg',
    validType: 'video/*'
  }
];

export const VIDEO_RESOURCE_TYPE = 'video';

export const SUGGESTION_SCOPE_TYPE = {
  'class-activity': 'dca'
};

export const RESOURCE_TYPES = [
  'webpage',
  VIDEO_RESOURCE_TYPE,
  'interactive',
  'audio',
  'image',
  'text',
  'html'
];

export const DEFAULT_IMAGES = {
  USER_PROFILE: 'assets/gooru/profile.png',
  COURSE: 'assets/gooru/course-default.png',
  RUBRIC: 'assets/gooru/rubric-default.png',
  COLLECTION: 'assets/gooru/collection-default.png',
  ASSESSMENT: 'assets/gooru/assessment-default.png',
  REPORTICON: '/assets/gooru/shape.png',
  QUESTION_PLACEHOLDER_IMAGE: 'assets/gooru/question-placeholder-image.png',
  LOADER_IMAGE: '/assets/gooru/giphy.gif',
  OFFLINE_ACTIVITY: 'assets/gooru/offline-activity-default.png',
  CLASS_DEFAULT: 'assets/gooru/class-default.png',
  CLASS_DEFAULT_0: 'assets/gooru/class-image-1.png',
  CLASS_DEFAULT_1: 'assets/gooru/class-image-2.png',
  CLASS_DEFAULT_2: 'assets/gooru/class-image-3.png'
};

export const K12_CATEGORY = {
  value: 'k_12',
  apiCode: 'K12',
  label: 'common.categoryOptions.k12'
};
export const EDUCATION_CATEGORY = {
  value: 'higher_education',
  apiCode: 'HE',
  label: 'common.categoryOptions.higher-ed'
};
export const LEARNING_CATEGORY = {
  value: 'professional_learning',
  apiCode: 'PL',
  label: 'common.categoryOptions.professional-dev'
};

export const TAXONOMY_CATEGORIES = [
  K12_CATEGORY,
  EDUCATION_CATEGORY,
  LEARNING_CATEGORY
];

export const SUGGESTION_TYPE = {
  CA_TEACHER: 'ca.teacher',
  PROFICIENY_TEACHER: 'proficiency.teacher'
};

export const CONTENT_CATEGORIES = [K12_CATEGORY, EDUCATION_CATEGORY];

export const SEARCH_CATEGORIES = [K12_CATEGORY, EDUCATION_CATEGORY];

export const CONTENT_TYPES = {
  COLLECTION: 'collection',
  ASSESSMENT: 'assessment',
  EXTERNAL_ASSESSMENT: 'assessment-external',
  EXTERNAL_COLLECTION: 'collection-external',
  COURSE: 'course',
  UNIT: 'unit',
  LESSON: 'lesson',
  RESOURCE: 'resource',
  QUESTION: 'question',
  RUBRIC: 'rubric',
  OFFLINE_ACTIVITY: 'offline-activity',
  ACTIVITY: 'activity',
  OFFLINE_ACTIVITIES: 'offlineActivities',
  COLLECTIONS: 'collections',
  ASSESSMENTS: 'assessments',
  SIGNATURE_ASSESSMENTS: 'signatureAssessments',
  SIGNATURE_COLLECTIONS: 'signatureCollections'
};

export const ASSESSMENT_SUB_TYPES = {
  SIGNATURE_ASSESSMENT: 'signature_assessment',
  SIGNATURE_COLLECTION: 'signature_collection'
};

export const KEY_CODES = {
  DOWN: 40,
  ENTER: 13,
  ESCAPE: 27,
  LEFT: 37,
  RIGHT: 39,
  SPACE: 32,
  UP: 38
};
export const VIEW_LAYOUT_PICKER_OPTIONS = {
  LIST: 'list',
  THUMBNAILS: 'thumbnails'
};

export const EMOTION_VALUES = [
  {
    value: 5,
    unicode: '1f601'
  },
  {
    value: 4,
    unicode: '1f642'
  },
  {
    value: 3,
    unicode: '1f610'
  },
  {
    value: 2,
    unicode: '1f641'
  },
  {
    value: 1,
    unicode: '1f625'
  }
];

// I2D status values for the conversion
export const I2D_CONVERSION_STATUS = {
  CREATED: 0,
  SENT_FOR_CONVERSION: 1,
  RECEIVED_AFTER_CONVERSION: 2,
  READY_FOR_REVIEW: 3,
  REVIEWED: 4,
  ERROR_IN_CONVERSION: -1
};

// unicode values for the correct and incorrect svg files
export const FEEDBACK_EMOTION_VALUES = {
  CORRECT: '1f44d',
  INCORRECT: '1f44e'
};

export const SCORES = {
  REGULAR: 60,
  GOOD: 70,
  VERY_GOOD: 80,
  EXCELLENT: 90
};

export const GRADING_SCALE = [
  {
    LOWER_LIMIT: 0,
    COLOR: '#F46360',
    RANGE: '0-59'
  },
  {
    LOWER_LIMIT: 60,
    COLOR: '#ED8E36',
    RANGE: '60-69'
  },
  {
    LOWER_LIMIT: 70,
    COLOR: '#FABA36',
    RANGE: '70-79'
  },
  {
    LOWER_LIMIT: 80,
    COLOR: '#A8C99C',
    RANGE: '80-89'
  },
  {
    LOWER_LIMIT: 90,
    COLOR: '#4B9740',
    RANGE: '90-100'
  }
];

export const BARS_GRADING_SCALE = [
  {
    LOWER_LIMIT: 0,
    COLOR: '#D82100'
  },
  {
    LOWER_LIMIT: 60,
    COLOR: '#CF7400'
  },
  {
    LOWER_LIMIT: 70,
    COLOR: '#CC9700'
  },
  {
    LOWER_LIMIT: 80,
    COLOR: '#4B9740'
  },
  {
    LOWER_LIMIT: 90,
    COLOR: '#A8C99C'
  }
];

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher'
};
export const EMAIL_VALIDATION = {
  EMAIL: 'email address still not verified'
};

export const TEACHER_ROLES = ['researcher'];

export const CORRECT_COLOR = GRADING_SCALE[GRADING_SCALE.length - 1].COLOR; //green-400

export const INCORRECT_COLOR = GRADING_SCALE[0].COLOR; //red-400

export const ANONYMOUS_COLOR = '#0072BC'; //blue-400

export const OPEN_ENDED_COLOR = '#0072BC'; //blue-400

export const NO_ANSWER_COLOR = '#FFFFFF'; //white

export const STUDY_PLAYER_BAR_COLOR = '#0072BC'; //blue-400

export const COMPLETION_CLASS_BAR_COLOR = '#535e67'; //$dark-300

export const TIME_SPENT_CHART_COLOR = '#0072BC'; //blue-400

// Height of the application header in pixels
export const HEADER_HEIGHT = 50;

export const DROP_MENU_DISPLAY = false; //i18n dropmenu display status

export const REAL_TIME_CLIENT = {
  CONNECTION_ATTEMPT_DELAY: 3000,
  OUTGOING_HEARTBEAT: 5000,
  INCOMING_HEARTBEAT: 5000
};

export const ENTITY_TYPE = {
  CONTENT: 'content',
  USER: 'user'
};

export const NETWORK_TYPE = {
  FOLLOWING: 'followings',
  FOLLOWERS: 'followers'
};

export const COUNTRY_CODES = {
  US: 'US'
};

export const DEFAULT_PAGE_SIZE = 50;

export const DEFAULT_BOOKMARK_PAGE_SIZE = 19;

export const DEFAULT_SEARCH_PAGE_SIZE = 20;

export const DEFAULT_NOTIFICATION_PAGE_SIZE = 10;

export const TAXONOMY_LEVELS = {
  COURSE: 'course',
  DOMAIN: 'domain',
  STANDARD: 'standard',
  MICRO: 'micro-standard'
};

export const CENTURY_SKILLS_GROUPS = {
  KEY_COGNITIVE_SKILLS_AND_STRATEGIES: 'Key Cognitive Skills and Strategies',
  KEY_CONTENT_KNOWLEDGE: 'Key Content Knowledge',
  KEY_LEARNING_SKILLS_AND_TECHNIQUES: 'Key Learning Skills and Techniques'
};

export const CODE_TYPES = {
  STANDARD_CATEGORY: 'standard_level_0',
  STANDARD: 'standard_level_1',
  SUB_STANDARD: 'standard_level_2',
  LEARNING_TARGET_L0: 'learning_target_level_0',
  LEARNING_TARGET_L1: 'learning_target_level_1',
  LEARNING_TARGET_L2: 'learning_target_level_2'
};

export const MICRO_COMPETENCY_CODE_TYPES = [
  'learning_target_level_0',
  'learning_target_level_1',
  'learning_target_level_2'
];

export const GOORU_DEFAULT_STANDARD = 'GDF';

export const GOORU_DEFAULT_FRAMEWORK = 'GDT';

export const ASSESSMENT_SHOW_VALUES = {
  IMMEDIATE: 'immediate',
  SUMMARY: 'summary',
  NEVER: 'never'
};

export const MAX_ATTEMPTS = 10;

/* token expiration time in milliseconds */
export const TOKEN_EXPIRATION_TIME = 180000;

export const GOAL_STATUS = {
  NOT_STARTED: 'not_started',
  ACTIVE: 'activated',
  COMPLETED: 'completed',
  DROPPED: 'dropped'
};

export const RUBRIC_TYPE = {
  _1xN: '1xN',
  NxN: 'NxN'
};

export const RUBRIC_OFF_OPTIONS = {
  MAX_SCORE: 200,
  INCREMENT: [
    {
      id: 0.5,
      name: 0.5
    },
    {
      id: 1,
      name: 1
    }
  ]
};

export const PLAYER_EVENT_SOURCE = {
  COURSE_MAP: 'coursemap',
  DAILY_CLASS: 'dailyclassactivity',
  OFFLINE_CLASS: 'offline-activity',
  INDEPENDENT_ACTIVITY: 'ILActivity',
  RGO: 'rgo',
  DIAGNOSTIC: 'diagnostic',
  MASTER_COMPETENCY: 'competencyMastery',
  CLASS_ACTIVITY: 'class-activity',
  COLLECTION: 'collection',
  DOMAIN_DIAGNOSTIC: 'domain-diagnostic'
};

export const NOTIFICATION_PLAYER_EVENT_SOURCE = {
  'course-map': 'coursemap',
  'class-activity': 'dailyclassactivity',
  proficiency: 'competencyMastery'
};

export const DCA_CALENDAR_VIEWS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};
export const PROFILE_NAV_MENU_ITEMS = [
  'about',
  'content',
  'followers',
  'following',
  'proficiency',
  'preference',
  'universal-learner'
];

export const SUGGESTION_FILTER_BY_CONTENT_TYPES = [
  {
    format: 'collection',
    label: 'search-filter.collections'
  },
  {
    format: 'assessment',
    label: 'search-filter.assessments'
  }
];

export const SEARCH_FILTER_BY_CONTENT_TYPES = [
  {
    format: 'collection',
    label: 'search-filter.collections',
    apiKey: 'searchCollections',
    seqId: 1
  },
  {
    format: 'assessment',
    label: 'search-filter.assessments',
    apiKey: 'searchAssessments',
    seqId: 2
  },
  {
    format: 'offline-activity',
    label: 'common.offline-activity',
    apiKey: 'searchOfflineActivity',
    seqId: 3
  }
];

//Competency status
export const COMPETENCY_STATUS = [
  'Not Started',
  'In Progress',
  'Mastered (Inferred)',
  'Mastered (Asserted)',
  'Mastered (Earned)',
  'Mastered (Demonstrated)',
  'Not in Framework',
  'Mastered (External system)'
];

//notifciation timer
export const NOTIFICATION_SETTINGS = {
  polling_interval: 1 * 60 * 1000, // milliseconds = 10 mins
  page_size: 5
};

export const PLAYER_WINDOW_NAME = 'rgo_player';

export const DEFAULT_K12_SUBJECT = 'K12.MA';

export const CLASS_SKYLINE_INITIAL_DESTINATION = {
  courseMap: 'course-map',
  diagnosticPlay: 'diagnostic-play',
  showDirections: 'show-directions',
  ILPInProgress: 'ilp-in-progress',
  classSetupInComplete: 'class-setup-incomplete'
};

export const SCREEN_SIZES = {
  XS_SMALL: 380,
  EXTRA_SMALL: 480,
  SMALL: 768,
  MEDIUM: 992,
  LARGE: 1024
};

export const SEARCH_CONTEXT = {
  LIBRARY: 'library',
  GOORU_CATALOG: 'gooru-catalog',
  MY_CONTENT: 'my-content'
};

export const OA_TASK_SUBMISSION_TYPES = [
  {
    value: 'image',
    submissionType: 'uploaded',
    validExtensions: '.jpg, .jpeg, .gif, .png',
    icon: 'fa-file-image-o'
  },
  {
    value: 'pdf',
    submissionType: 'uploaded',
    validExtensions: '.pdf',
    icon: 'fa-file-pdf-o'
  },
  {
    value: 'presentation',
    submissionType: 'uploaded',
    validExtensions: '.ppt, .pptx',
    icon: 'fa-file-powerpoint-o'
  },
  {
    value: 'document',
    submissionType: 'uploaded',
    validExtensions: '.doc, .docx',
    icon: 'fa-file-word-o'
  },
  {
    value: 'others',
    submissionType: 'uploaded',
    validExtensions: '',
    icon: 'fa-file'
  },
  {
    value: 'url',
    submissionType: 'remote',
    validExtensions: '',
    icon: 'fa-link'
  }
];

export const PLAYER_EVENT_MESSAGE = {
  GRU_PUllUP_CLOSE: 'gru_pullup_close',
  GRU_LOADING_COMPLETED: 'gru_loading_completed',
  GRU_CALLBACK_SUCCESSFULLY: 'callback_successfully'
};

export const FEEDBACK_USER_CATEGORY = {
  teacher: 1,
  student: 2
};
export const FEEDBACK_RATING_TYPE = {
  QUANTITATIVE: 1,
  QUALITATIVE: 2,
  BOTH: 3
};

export const CLASS_ACTIVITIES_SEARCH_TABS = [
  {
    label: 'Course Map',
    id: 'course-map',
    sequence: 1
  },
  {
    label: 'Tenant Library',
    id: 'tenant-library',
    sequence: 2
  },
  {
    label: 'My Content',
    id: 'my-content',
    sequence: 4
  },
  {
    label: 'Gooru Catalog',
    id: 'gooru-catalog',
    sequence: 3
  }
];

export const COMPETENCY_MASTERY_SOURCE = [
  {
    source: 'ForceCalculateTrigger',
    locale: 'competency.mastery.source.forcecalculatetrigger'
  },
  {
    source: 'NWEA',
    locale: 'competench.mastery.source.nwea'
  },
  {
    source: 'Teacher-Asserted',
    locale: 'competench.mastery.source.teacher-asserted'
  }
];

export const PROFICIENCY_STAT_ITERATION_MAX_INTERVAL_TIME = 180000;
export const PROFICIENCY_STAT_ITERATION_INTERVAL_TIME = 2000;

export const ATC_CHART_FILTER = [
  {
    name: 'atc-filter.class-competency',
    tenantKey: 'class-competencies',
    filterItems: {
      fetchClassStats: true
    },
    filterKey: 'class'
  },
  {
    name: 'atc-filter.over-all-competency',
    tenantKey: 'overall-competencies',
    filterItems: {},
    filterKey: 'overall'
  }
];
export const PATH_TYPE = {
  ROUTE0: 'route0',
  UNIT0: 'unit0'
};

export const CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS = {
  defaultView: 'defaultView',
  scopeAndSequence: 'scopeAndSequence',
  defaultScopeAndSequence: 'defaultScopeAndSequence'
};

export const ANSWER_HEAD = {
  likert_scale_question: 'report.response-label',
  single_choice: 'report.answer-label',
  multiple_choice: 'report.answer-label',
  true_false: 'report.answer-label',
  extended_text: 'report.answer-label',
  text_entry: 'report.answer-label',
  multiple_choice_text: 'report.answer-label',
  multiple_choice_image: 'report.answer-label',
  drag_and_drop: 'report.answer-label',
  hot_text_word: 'report.answer-label',
  hot_text_sentence: 'report.answer-label',
  scientific_free_response: 'report.answer-label',
  scientific_fill_in_the_blank: 'report.answer-label',
  serp_encoding: 'report.answer-label',
  serp_decoding: 'report.answer-label',
  serp_say_out_loud: 'report.answer-label',
  serp_lang_identify_digraph: 'report.answer-label',
  serp_words_per_minute: 'report.answer-label',
  serp_silent_reading: 'report.answer-label',
  serp_phrase_cued_reading: 'report.answer-label',
  serp_lang_vowel_teams: 'report.answer-label',
  serp_lang_activities_for_comprehension: 'report.answer-label',
  serp_lang_identify_base_word: 'report.answer-label',
  serp_lang_counting_syllables_question: 'report.answer-label',
  serp_lang_syllable_division_question: 'report.answer-label',
  serp_classic_question: 'report.answer-label',
  serp_choose_one: 'report.answer-label',
  serp_pick_n_choose_question: 'report.answer-label',
  serp_sorting: 'report.answer-label',
  serp_multi_choice: 'report.answer-label',
  serp_identify_vowel_sound_activity_question: 'report.answer-label',
  serp_encoding_assessment: 'report.answer-label',
  serp_lang_counting_syllables: 'report.answer-label',
  serp_classic: 'report.answer-label',
  serp_lang_syllable_division: 'report.answer-label',
  serp_pick_n_choose: 'report.answer-label',
  match_the_following_question: 'report.answer-label',
  serp_decoding_assessment: 'report.answer-label',
  serp_lang_say_out_loud: 'report.answer-label',
  MC: 'report.answer-label',
  LS: 'report.response-label',
  MA: 'report.answer-label',
  HT_RO: 'report.answer-label',
  HT_HL: 'report.answer-label',
  'T/F': 'report.answer-label',
  FIB: 'report.answer-label',
  HS_IMG: 'report.answer-label',
  HS_TXT: 'report.answer-label',
  OE: 'report.answer-label',
  SE_FIB: 'report.answer-label',
  SE_FRQ: 'report.answer-label',
  SERP_EA: 'report.answer-label',
  SERP_DA: 'report.answer-label',
  SERP_SOL: 'report.answer-label',
  SERP_ID: 'report.answer-label',
  SERP_RQ: 'report.answer-label',
  SERP_WPM: 'report.answer-label',
  SERP_SR: 'report.answer-label',
  SERP_PCR: 'report.answer-label',
  SERP_AFC: 'report.answer-label',
  SERP_IB: 'report.answer-label',
  SERP_VT: 'report.answer-label',
  SERP_CS: 'report.answer-label',
  SERP_SD: 'report.answer-label',
  SERP_CL: 'report.answer-label',
  SERP_CO: 'report.answer-label',
  SERP_PNC: 'report.answer-label',
  SERP_SO: 'report.answer-label',
  SERP_MC: 'report.answer-label',
  SERP_IVSA: 'report.answer-label',
  H5P_DAD: 'report.answer-label',
  MTF: 'report.answer-label'
};

// While adding component make sure that key already exists in CLASS_ACTIVITIVES_ADDING_COMPONENT_KEYS
export const CLASS_ACTIVITIES_ADDING_KEY_WITH_COMPONENT_MAPPING = {
  defaultView: 'class.activities.gru-class-activities-default-adding-view',
  scopeAndSequence: 'class.activities.gru-class-activities-scope-and-sequence',
  defaultScopeAndSequence:
    'class.activities.gru-class-activities-default-scope-sequence'
};

export const SCOPE_AND_SEQUENCE_RESOURCE_TYPE = {
  TEACHERS: {
    name: 'teachers',
    'flt.audience': 'Teachers'
  },
  STUDENTS: {
    name: 'students',
    'flt.audience': 'All Students'
  }
};

export const ROUTE0_STATUS = {
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PENDING: 'pending'
};

export const COMPETENCY_STATUS_VALUE = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  INFERRED: 2,
  ASSERTED: 3,
  EARNED: 4,
  DEMONSTRATED: 5,
  REINFERRED: 6
};

export const GOORU_SHORT_NAME = 'gooru';
export const TEACHER = 'Teachers';
export const STUDENTS = 'All Students';

export const SCIENTIFIC_TYPES = {
  CLAIM: 'claim',
  EVIDENCE: 'evidence',
  REASON: 'reasoning'
};
export const SMP_STRING = 'Standards for Mathematical Practice';
export const SERP_ENCODING_QUESTION_TYPE = 'SERP_EA';
export const SERP_PREFIX = 'SERP';

export const SERP_TOOL_PATH = {
  JS: '/assets/libs/serp/serp-language-decode.min.js?v=5-1-32',
  CSS: '/assets/libs/serp/serp-language-decode.css?v=5-1-32'
};

export const CAST_AND_CATCH_SCRIPT_PATH =
  '/assets/libs/cast-and-catch/cast-and-catch-api.min.js';

export const CAST_EVENTS = {
  LOGIN: 'user.login',
  CA_PRESENT: 'class.activity.present',
  COLLECTION_BUILD: 'collection.build',
  COLLECTION_RECORD_MINI_LESSON: 'collection.record.mini.lesson',
  COLLECTION_PRESENT: 'collection.present'
};

export const DIAGNOSTIC_STATUS = {
  0: 'common.not_started',
  1: 'common.not-required',
  2: 'common.in-progress',
  3: 'common.completed',
  4: 'common.not-required',
  5: 'common.online-offline'
};
export const HOVERCAM_USER_OPTION = [
  'common.present',
  'common.build',
  'common.record-mini-lesson'
];

export const GO_LIVE_EVENT_MESSAGE = {
  CLOSE_GO_LIVE_PULLUP: 'close_go_live_pullup',
  EVENT_NAME: 'class_activity'
};
export const PROFILE_DROPDOWN = {
  'network.followers': 'profile.gru-navigation.followers',
  followers: 'profile.gru-navigation.followers',
  'network.following': 'profile.gru-navigation.following',
  following: 'profile.gru-navigation.following',
  about: 'profile.gru-navigation.about',
  'about-me': 'profile.gru-navigation.about-me',
  portfolio: 'profile.gru-navigation.portfolio',
  preference: 'profile.gru-navigation.preference.preference',
  proficiency: 'profile.gru-navigation.proficiency',
  profile: 'common.profile',
  'universal-learner': 'profile.gru-navigation.universal-learner'
};
export const PREFERENCE = [
  {
    name: 'Recently Updated',
    key: 'recently_updated'
  },
  {
    name: 'Alphabetical',
    key: 'alphabetical'
  }
];

export const CLASSREPORTS = [
  {
    name: 'Class Progress Report',
    key: 'class-progress-report'
  },
  {
    name: 'Domain Competency Report',
    key: 'domain-competency-report'
  },
  {
    name: 'Class Proficiency Report',
    key: 'class-proficiency-report'
  }
];

export const SUBJECT_CODE = 'K12.MA';
export const MEETING_TOOLS = {
  zoom: 'zoom',
  hangout: 'hangout'
};

export const MASTERY_COMPETENCY_SOURCE = {
  diagnostic: 'proficiency-diagnostic',
  ForceCalculateTrigger: 'proficiency-assertion',
  nwea: 'proficiency-nwea',
  lpcsMigration: 'lpcs-migration',
  domainDiagnostic: 'domain-diagnostic',
  dataLakeTools: 'datalake-tools',
  dataLakeToolDiagnostic: 'datalake-tool-diagnostic',
  dataLake: 'datalake'
};

export const DEFAULT_MATH_LEVEL_SEQ_COUNT = 2;

export const STUDENT_GUEST_TOP_CLASSES = [
  '2a67f142-bc80-4613-b5d4-27b94b7ea80d'
];

export const H5P_TOOL_RESOURCE_TYPES = [
  {
    name: 'Interactive Video',
    id: 'h5p_interactive_video',
    format: 'resource'
  },
  {
    name: 'Interactive Slide',
    id: 'h5p_interactive_slide',
    format: 'resource'
  },
  {
    name: 'Personality Quiz',
    id: 'h5p_interactive_personality_quiz',
    format: 'resource'
  },
  {
    name: 'Drag and Drop',
    id: 'h5p_drag_and_drop_resource',
    format: 'resource'
  }
];

export const H5P_TOOL_QUESTION_TYPES = [
  {
    name: 'Drag and Drop',
    id: 'h5p_drag_and_drop_question',
    format: 'question'
  }
];

export const EXTERNAL_PLAYER_ACTIONS = {
  START: 'start',
  COMPLETED: 'completed'
};

export const SCORM_PATH = '/assets/libs/scormAPI.min.js';

export const CONTENT_TYPE_ENUM = {
  course: 'courses',
  assessment: 'assessments',
  unit: 'units',
  lesson: 'lessons',
  collection: 'collections',
  resource: 'resources',
  question: 'questions'
};

export const TOUR_PAGES_ENUM = {
  studentHomeClasses: 'studentHomeClasses',
  studentHomeIndependentClass: 'studentHomeIndependentClass'
};

export const STUDENT_PROGRESS_COLOR = [
  '#d6caff',
  '#a184fac9',
  '#7a4bedb5',
  '#6627d7ad',
  '#5215b6d6'
];

export const DONUT_IMAGES = {
  USER_PROFILE: '/assets/gooru/profile.png',
  COMPETENCY_ICON: '/assets/gooru/competency-icon.png'
};

export const ANSWER_SCORE_TYPE_ENUM = {
  correct: 'correct',
  incorrect: 'incorrect',
  partiallyCorrect: 'partially-correct'
};

export const DIAGNOSTIC_LEVELS = {
  '-1': 'diagnostic.below-grade-level',
  '0': 'diagnostic.on-grade-level',
  '1': 'diagnostic.above-grade-level',
  '2': 'diagnostic-domain-highest'
};

export const DIAGNOSTIC_LESSON_SUGGESTION_EVENTS = {
  start: 'lesson-suggestion-start',
  served: 'lesson-suggestion-served'
};
export const DEPENDENT_LESSON_SUGGESTION_EVENTS = {
  start: 'dep-lesson-suggestion-start',
  served: 'dep-lesson-suggestion-served',
  source: 'dep-lesson-suggestion'
};

export const DEFAULT_THRESHOLD_VALUE = {
  wpm_lower_threshold_value: 30,
  wpm_higher_threshold_value: 70
};

export const CLASSROOM_PLAYER_EVENT_SOURCE = {
  CLASS_ACTIVITY: 'class-activities',
  LEARNING_JOURNEY: 'learning-journey'
};

export const EMAIL_TEMPLATE_NAME = {
  SIGNUP_MAIL: 'signup_invite_student'
};

export const WPM_FLAG_ICON = {
  Low: 'arrow_downward',
  High: 'arrow_upward',
  Medium: ''
};

export const SEL_STUDENT_REPORT_COLOR = ['#84b7dd', '#37424b'];

export const SEL_STUDENT_ACTIVITY_COLOR = ['#37424b', '#84b7dd'];

export const SIGNATURE_CONTENTS = {
  SIGNATURE_ASSESSMENT: 'signature-assessment',
  SIGNATURE_COLLECTION: 'signature-collection'
};

export const LIKERT_UI_TEMPLATES = [
  {
    name: 'likert-slider',
    component: 'gru-likert-slider',
    ratingType: 'slider'
  },
  {
    name: 'likert-selection',
    component: 'gru-likert-selection',
    ratingType: 'selection'
  },
  {
    name: 'likert-star-rating',
    component: 'gru-likert-star-rating',
    ratingType: 'star-rating'
  },
  {
    name: 'likert-smiley',
    component: 'gru-likert-smiley',
    ratingType: 'smiley'
  }
];

export const DIAGNOSTIC_CONTENT_SOURCE = {
  CA_DIAGNOSTIC: 'ca-diagnostic'
};
