// ===== FILE 1: utils/contentUtils.js =====
// COPY EVERYTHING BELOW (INCLUDING COMMENTS) INTO contentUtils.js:

// ID Generation
export const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// Video URL Processing
export const extractVideoId = (url, platform) => {
    if (!url) return null;
    switch (platform) {
        case 'youtube':
            const youtubeRegExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const youtubeMatch = url.match(youtubeRegExp);
            return youtubeMatch ? youtubeMatch[1] : null;
        case 'vimeo':
            const vimeoRegExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
            const vimeoMatch = url.match(vimeoRegExp);
            return vimeoMatch ? vimeoMatch[1] : null;
        case 'panopto':
            const panoptoRegExp = /\/Viewer\.aspx\?id=([a-f0-9-]+)/i;
            const panoptoMatch = url.match(panoptoRegExp);
            return panoptoMatch ? panoptoMatch[1] : null;
        default:
            return null;
    }
};

// Citation Generation Functions
export const generateImageCitation = (title, author, source, date) => {
    if (!title && !author && !source && !date) return '';

    const parts = [];
    if (author) parts.push(author);
    if (title) parts.push(`<em>${title}</em>`);
    if (source) parts.push(source);
    if (date) parts.push(`(${date})`);

    return parts.join(', ');
};

export const generateVideoCitation = (title, creator, source, date) => {
    if (!title && !creator && !source && !date) return '';

    const parts = [];
    if (creator) parts.push(creator);
    if (title) parts.push(`<em>${title}</em>`);
    if (source) parts.push(source);
    if (date) parts.push(`(${date})`);

    return parts.join(', ');
};

export const generateAudioCitation = (title, creator, source, date) => {
    if (!title && !creator && !source && !date) return '';

    const parts = [];
    if (creator) parts.push(creator);
    if (title) parts.push(`<em>${title}</em>`);
    if (source) parts.push(source);
    if (date) parts.push(`(${date})`);

    return parts.join(', ');
};

// Content Processing Utilities
export const htmlToText = (html) => {
    if (!html) return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Convert lists to plain text with bullet points
    const listItems = temp.querySelectorAll('li');
    listItems.forEach(li => {
        li.innerHTML = '• ' + li.innerHTML;
    });

    // Remove HTML tags but preserve line breaks
    return temp.textContent || temp.innerText || '';
};

// Time Formatting
export const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// File Size Formatting
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Content Validation
export const validateContent = (type, content) => {
    switch (type) {
        case 'video':
            return content.src && content.platform;
        case 'image':
            return content.src && content.alt;
        case 'audio':
            return content.src;
        case 'cards':
            return content.items && content.items.length > 0;
        case 'gallery':
            return content.items && content.items.length > 0;
        case 'table':
            return content.rows && content.rows.length > 0;
        default:
            return content.content || content.src;
    }
};

// ===== END OF contentUtils.js =====