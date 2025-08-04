// ===== FILE 2: utils/constants.js =====
// COPY EVERYTHING BELOW INTO constants.js:

export const CONTENT_TYPES = {
    TEXT: 'text',
    HEADING: 'heading',
    LIST: 'list',
    INFO_BOX: 'info-box',
    EXERCISE_BOX: 'exercise-box',
    WARNING_BOX: 'warning-box',
    VIDEO: 'video',
    IMAGE: 'image',
    AUDIO: 'audio',
    CARDS: 'cards',
    GALLERY: 'gallery',
    TABLE: 'table'
};

export const BOPPPS_SECTIONS = [
    {
        id: 'bridge-in',
        title: 'Bridge-In',
        type: 'boppps',
        description: 'Connect to previous learning'
    },
    {
        id: 'outcomes',
        title: 'Learning Outcomes',
        type: 'boppps',
        description: 'Define what students will achieve'
    },
    {
        id: 'pre-assessment',
        title: 'Pre-Assessment',
        type: 'boppps',
        description: 'Gauge existing knowledge'
    },
    {
        id: 'participatory-learning',
        title: 'Participatory Learning',
        type: 'boppps',
        description: 'Main content delivery'
    },
    {
        id: 'post-assessment',
        title: 'Post-Assessment',
        type: 'boppps',
        description: 'Verify learning objectives'
    },
    {
        id: 'summary',
        title: 'Summary & Next Steps',
        type: 'boppps',
        description: 'Consolidate key takeaways'
    },
    {
        id: 'resources',
        title: 'Resources & Materials',
        type: 'content',
        description: 'Additional materials and references'
    }
];

export const VIDEO_PLATFORMS = {
    YOUTUBE: 'youtube',
    VIMEO: 'vimeo',
    PANOPTO: 'panopto'
};

export const CARD_LAYOUTS = {
    '2x1': { label: '2x1 Grid', class: 'grid-cols-1 md:grid-cols-2' },
    '2x2': { label: '2x2 Grid', class: 'grid-cols-1 md:grid-cols-2' },
    '3x1': { label: '3x1 Grid', class: 'grid-cols-1 md:grid-cols-3' },
    '1x3': { label: '1x3 Vertical', class: 'grid-cols-1' }
};

export const CARD_STYLES = {
    info: {
        bg: 'bg-slate-50',
        border: 'border-l-slate-400',
        accent: 'text-slate-700',
        label: 'Info Style'
    },
    exercise: {
        bg: 'bg-emerald-50',
        border: 'border-l-emerald-400',
        accent: 'text-emerald-700',
        label: 'Exercise Style'
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-l-amber-400',
        accent: 'text-amber-700',
        label: 'Warning Style'
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-l-green-400',
        accent: 'text-green-700',
        label: 'Success Style'
    }
};

export const BOX_CONFIGS = {
    'info-box': {
        bg: 'bg-blue-50',
        border: 'border-l-4 border-blue-400',
        icon: 'AlertCircle',
        iconColor: 'text-blue-500',
        label: 'Info Box'
    },
    'exercise-box': {
        bg: 'bg-emerald-50',
        border: 'border-l-4 border-emerald-400',
        icon: 'CheckCircle',
        iconColor: 'text-emerald-500',
        label: 'Exercise Box'
    },
    'warning-box': {
        bg: 'bg-amber-50',
        border: 'border-l-4 border-amber-400',
        icon: 'AlertTriangle',
        iconColor: 'text-amber-500',
        label: 'Warning Box'
    }
};

export const IMAGE_SIZES = {
    small: { label: 'Small', class: 'max-w-xs' },
    medium: { label: 'Medium', class: 'max-w-md' },
    large: { label: 'Large', class: 'max-w-2xl' },
    full: { label: 'Full Width', class: 'w-full' }
};

export const GALLERY_COLUMNS = {
    '2': { label: '2 Columns', class: 'grid-cols-1 sm:grid-cols-2' },
    '3': { label: '3 Columns', class: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' },
    '4': { label: '4 Columns', class: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' }
};

// Auto-save Configuration
export const AUTO_SAVE_CONFIG = {
    INTERVAL: 2000, // 2 seconds
    STORAGE_PREFIX: 'lecture-template-autosave-',
    MAX_HISTORY: 10
};

// ===== END OF constants.js =====