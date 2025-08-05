// ===== FILE 4: utils/exportUtils.js =====
// COPY EVERYTHING BELOW INTO exportUtils.js:

import { generateImageCitation, generateVideoCitation, generateAudioCitation } from './contentUtils';
import { CARD_STYLES, IMAGE_SIZES, GALLERY_COLUMNS } from './constants';

// Helper to embed external images as data URIs for portable exports
const fetchImageAsDataUrl = async (src) => {
    try {
        const response = await fetch(src);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to embed image:', src, error);
        return src;
    }
};

export const embedImagesInSections = async (sections) => {
    return Promise.all(
        sections.map(async (section) => ({
            ...section,
            blocks: await Promise.all(
                section.blocks.map(async (block) => {
                    if (block.type === 'image' && block.src && !block.src.startsWith('data:')) {
                        return { ...block, src: await fetchImageAsDataUrl(block.src) };
                    }
                    if (block.type === 'gallery' && Array.isArray(block.items)) {
                        const items = await Promise.all(
                            block.items.map(async (item) => {
                                if (item.src && !item.src.startsWith('data:')) {
                                    return { ...item, src: await fetchImageAsDataUrl(item.src) };
                                }
                                return item;
                            })
                        );
                        return { ...block, items };
                    }
                    return block;
                })
            ),
        }))
    );
};

// Content Block to HTML Conversion
export const blockToHtml = (block) => {
    switch (block.type) {
        case 'text':
        case 'heading':
        case 'list':
            return `<div class="my-4 rich-editor-content">${block.content}</div>`;
        case 'headline':
            return `<div class="headline-preview">${block.content}</div>`;

        case 'info-box':
        case 'exercise-box':
        case 'warning-box':
            const boxConfig = {
                'info-box': { bg: 'bg-blue-50', border: 'border-l-4 border-blue-400' },
                'exercise-box': { bg: 'bg-emerald-50', border: 'border-l-4 border-emerald-400' },
                'warning-box': { bg: 'bg-amber-50', border: 'border-l-4 border-amber-400' }
            }[block.type];

            return `
        <div class="my-6 p-4 rounded-lg ${boxConfig.bg} ${boxConfig.border}">
          <div class="rich-editor-content">${block.content}</div>
        </div>
      `;

        case 'video':
            const videoCitation = generateVideoCitation(
                block.videoTitle,
                block.videoCreator,
                block.videoSource,
                block.videoDate
            );

            return `
        <div class="my-6 text-center">
          <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            ${getVideoEmbedHtml(block.src, block.platform)}
          </div>
          ${block.description ? `<div class="text-gray-600 italic mb-4 text-sm">${block.description}</div>` : ''}
          ${videoCitation ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${videoCitation}</div>` : ''}
        </div>
      `;

        case 'image':
            const sizeClass = IMAGE_SIZES[block.size]?.class || 'max-w-md';
            const imageCitation = generateImageCitation(
                block.imageTitle,
                block.imageAuthor,
                block.imageSource,
                block.imageDate
            );

            return `
        <div class="my-6 text-center">
          <img src="${block.src}" alt="${block.alt}" class="${sizeClass} h-auto rounded-xl shadow-lg mx-auto" />
          ${block.caption ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${block.caption}</div>` : ''}
          ${imageCitation ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-2 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${imageCitation}</div>` : ''}
        </div>
      `;

        case 'gallery':
            const gridClass = GALLERY_COLUMNS[block.columns]?.class || 'grid-cols-1 sm:grid-cols-2';
            const itemsHtml = block.items.map((item) => {
                const itemCitation = generateImageCitation(
                    item.imageTitle,
                    item.imageAuthor,
                    item.imageSource,
                    item.imageDate
                );

                return `
          <div class="group flex flex-col">
            <div class="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
              <img src="${item.src}" alt="${item.alt}" class="max-w-full h-auto object-contain self-center rounded-lg shadow-md" />
            </div>
            ${item.caption ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-2 rounded-lg text-sm text-gray-600">${item.caption}</div>` : ''}
            ${itemCitation ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-1 rounded-lg text-sm text-gray-600">${itemCitation}</div>` : ''}
          </div>
        `;
            }).join('');

            return `<div class="my-6"><div class="grid ${gridClass} gap-4">${itemsHtml}</div></div>`;

        case 'audio':
            const audioCitation = generateAudioCitation(
                block.audioTitle,
                block.audioCreator,
                block.audioSourceInfo,
                block.audioDateInfo
            );

            return `
        <div class="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
          ${block.description ? `<div class="text-gray-600 italic mb-4 text-sm">${block.description}</div>` : ''}
          <audio controls src="${block.src}" class="w-full"></audio>
          ${audioCitation ? `<div class="bg-white border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${audioCitation}</div>` : ''}
        </div>
      `;

        case 'cards':
            const layoutClass = CARD_STYLES[block.layout]?.class || 'grid-cols-1 md:grid-cols-2';
            const cardStyleConfig = CARD_STYLES[block.style] || CARD_STYLES.info;

            const cardItemsHtml = block.items.map(item => `
        <div class="p-6 rounded-xl border-l-4 ${cardStyleConfig.bg} ${cardStyleConfig.border} shadow-sm hover:shadow-md transition-shadow">
          <h4 class="font-semibold mb-3 ${cardStyleConfig.accent}">${item.title}</h4>
          <div class="text-gray-700 prose prose-sm max-w-none">${item.content}</div>
        </div>
      `).join('');

            return `
        <div class="my-6">
          <div class="grid ${layoutClass} gap-4">
            ${cardItemsHtml}
          </div>
        </div>
      `;

        default:
            return `<div>Unsupported content type: ${block.type}</div>`;
    }
};

// Video Embed HTML Generation
export const getVideoEmbedHtml = (src, platform) => {
    switch (platform) {
        case 'youtube':
            return `<iframe width="100%" height="100%" src="${src}" frameborder="0" allowfullscreen></iframe>`;
        case 'vimeo':
            return `<iframe width="100%" height="100%" src="${src}" frameborder="0" allowfullscreen></iframe>`;
        case 'panopto':
            return `<iframe width="100%" height="100%" src="${src}" frameborder="0" allowfullscreen></iframe>`;
        default:
            return `<video controls width="100%" height="100%" src="${src}"></video>`;
    }
};

// Generate complete HTML export
export const generateCompleteHtml = async (sections, headerData, displayDate, logoHtml) => {
    const processedSections = await embedImagesInSections(sections);
    const headerHtml = `
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="flex items-start justify-between space-x-6">
          <div class="flex flex-col items-center md:items-start space-y-3">
            <p class="text-lg text-gray-600">${displayDate}</p>
            ${logoHtml ? `<div class="flex items-center space-x-3">${logoHtml}<div><h1 class="text-3xl font-bold text-gray-900">${headerData.courseTopic}</h1></div></div>` : `<h1 class="text-3xl font-bold text-gray-900">${headerData.courseTopic}</h1>`}
            <p class="text-sm text-gray-500">Instructor: ${headerData.instructorName} | ${headerData.instructorEmail}</p>
          </div>
        </div>
      </div>
    </header>
  `;

    const sectionsHtml = processedSections.map(section => {
        const sectionBlocksHtml = section.blocks.map(block => blockToHtml(block)).join('');
        return `
      <section class="mb-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">${section.title}</h2>
        ${sectionBlocksHtml}
      </section>
    `;
    }).join('');

    const footerHtml = `
    <footer class="bg-gray-50 border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <p class="text-sm text-gray-600">${headerData.footerCourseInfo} | ${headerData.footerInstitution}</p>
        <p class="text-xs text-gray-500 mt-2">${headerData.footerCopyright}</p>
      </div>
    </footer>
  `;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerData.courseTopic} - ${displayDate}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12pt; line-height: 1.4; }
          h1 { font-size: 18pt; }
          h2 { font-size: 16pt; }
          h3 { font-size: 14pt; }
        }
      </style>
    </head>
    <body class="bg-white">
      ${headerHtml}
      <main class="max-w-7xl mx-auto px-6 py-8">
        ${sectionsHtml}
      </main>
      ${footerHtml}
    </body>
    </html>
  `;
};

// ===== END OF exportUtils.js =====