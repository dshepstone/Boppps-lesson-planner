// ===== FILE 3: utils/validationUtils.js =====
// COPY EVERYTHING BELOW INTO validationUtils.js:

export const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' };
    }

    if (file.size > maxSize) {
        return { isValid: false, error: 'Image file size must be less than 10MB' };
    }

    return { isValid: true };
};

export const validateAudioFile = (file) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
        return { isValid: false, error: 'Please select a valid audio file (MP3, WAV, OGG, or M4A)' };
    }

    if (file.size > maxSize) {
        return { isValid: false, error: 'Audio file size must be less than 50MB' };
    }

    return { isValid: true };
};

export const validateVideoUrl = (url, platform) => {
    if (!url) return { isValid: false, error: 'Please enter a video URL' };

    const patterns = {
        youtube: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        vimeo: /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i,
        panopto: /\/Viewer\.aspx\?id=([a-f0-9-]+)/i
    };

    if (!patterns[platform] || !patterns[platform].test(url)) {
        return { isValid: false, error: `Please enter a valid ${platform} URL` };
    }

    return { isValid: true };
};

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateFormData = (type, data) => {
    const errors = {};

    switch (type) {
        case 'video':
            if (!data.videoPlatform) errors.platform = 'Please select a platform';
            if (!data.videoUrl) errors.url = 'Please enter a video URL';
            break;

        case 'image':
            if (!data.imageFile && !data.imageUrl) {
                errors.source = 'Please select an image file or enter a URL';
            }
            if (!data.image_alt) errors.alt = 'Please enter alt text for accessibility';
            break;

        case 'audio':
            if (!data.audioFile && !data.audioUrl) {
                errors.source = 'Please select an audio file or enter a URL';
            }
            break;

        case 'cards':
            if (!data.cardItems || data.cardItems.length === 0) {
                errors.items = 'Please add at least one card';
            } else {
                data.cardItems.forEach((item, index) => {
                    if (!item.title) errors[`card_${index}_title`] = 'Card title is required';
                    if (!item.content) errors[`card_${index}_content`] = 'Card content is required';
                });
            }
            break;

        case 'gallery':
            if (!data.imageFiles || data.imageFiles.length === 0) {
                errors.images = 'Please select at least one image';
            }
            break;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ===== END OF validationUtils.js =====