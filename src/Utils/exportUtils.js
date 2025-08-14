
// src/Utils/exportUtils.js
// Adds input-enabled worksheet export + Print button with print-friendly CSS.

import { generateImageCitation, generateVideoCitation, generateAudioCitation } from './contentUtils';
import { CARD_STYLES, IMAGE_SIZES, GALLERY_COLUMNS } from './constants';

/* ---------------- Image inlining ---------------- */
export const fetchImageAsDataUrl = async (src) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Failed to embed image:', src, err);
    return src;
  }
};

const embedHtmlImages = async (html) => {
  if (!html) return html;
  const container = document.createElement('div');
  container.innerHTML = html;
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(images.map(async (img) => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('data:')) {
      img.setAttribute('src', await fetchImageAsDataUrl(src));
    }
  }));
  return container.innerHTML;
};

export const embedImagesInSections = async (sections) => {
  return Promise.all(sections.map(async (section) => ({
    ...section,
    blocks: await Promise.all((section.blocks || []).map(async (block) => {
      const b = { ...block };
      if (b.content) b.content = await embedHtmlImages(b.content);
      if (b.type === 'image' && b.src && !b.src.startsWith('data:')) {
        b.src = await fetchImageAsDataUrl(b.src);
      }
      if (Array.isArray(b.items)) {
        b.items = await Promise.all(b.items.map(async (item) => {
          const it = { ...item };
          if (it.src && !it.src.startsWith('data:')) it.src = await fetchImageAsDataUrl(it.src);
          if (it.content) it.content = await embedHtmlImages(it.content);
          return it;
        }));
      }
      return b;
    }))
  })));
};

/* ---------------- Blocks -> HTML ---------------- */
export const blockToHtml = (block) => {
  switch (block.type) {
    case 'text':
    case 'heading':
    case 'list':
      return `<div class="my-4 rich-editor-content">${block.content || ''}</div>`;

    case 'headline':
      return `<div class="headline-preview">${block.content || ''}</div>`;

    case 'html':
      return `<div class="html-block-preview rich-editor-content">${block.content || ''}</div>`;

    case 'info-box':
    case 'exercise-box':
    case 'warning-box': {
      const box = {
        'info-box':       { bg: 'bg-blue-50',    border: 'border-l-4 border-blue-400'    },
        'exercise-box':   { bg: 'bg-emerald-50', border: 'border-l-4 border-emerald-400' },
        'warning-box':    { bg: 'bg-amber-50',   border: 'border-l-4 border-amber-400'   },
      }[block.type];
      return `<div class="my-6 p-4 rounded-lg ${box.bg} ${box.border}">
        <div class="rich-editor-content">${block.content || ''}</div>
      </div>`;
    }

    case 'video': {
      const cite = generateVideoCitation(block.videoTitle, block.videoCreator, block.videoSource, block.videoDate);
      return `<div class="my-6 text-center">
        <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          ${getVideoEmbedHtml(block.src, block.platform)}
        </div>
        ${block.description ? `<div class="text-gray-600 italic mb-4 text-sm">${block.description}</div>` : ''}
        ${cite ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${cite}</div>` : ''}
      </div>`;
    }

    case 'image': {
      const sizeClass = (IMAGE_SIZES && IMAGE_SIZES[block.size]?.class) || 'max-w-md';
      const cite = generateImageCitation(block.imageTitle, block.imageAuthor, block.imageSource, block.imageDate);
      return `<div class="my-6 text-center">
        <img src="${block.src || ''}" alt="${block.alt || ''}" class="${sizeClass} h-auto rounded-xl shadow-lg mx-auto" />
        ${block.caption ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${block.caption}</div>` : ''}
        ${cite ? `<div class="bg-gray-50 border border-gray-200 p-3 mt-2 rounded-lg text-sm text-gray-600 text-left max-w-2xl mx-auto">${cite}</div>` : ''}
      </div>`;
    }

    case 'gallery': {
      const grid = (GALLERY_COLUMNS && GALLERY_COLUMNS[block.columns]?.class) || 'grid-cols-1 sm:grid-cols-2';
      const items = (block.items || []).map((it) => {
        const cite = generateImageCitation(it.imageTitle, it.imageAuthor, it.imageSource, it.imageDate);
        return `<div class="group flex flex-col">
          <div class="flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
            <img src="${it.src || ''}" alt="${it.alt || ''}" class="max-w-full h-auto object-contain self-center rounded-lg shadow-md" />
          </div>
          ${it.caption ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-2 rounded-lg text-sm text-gray-600">${it.caption}</div>` : ''}
          ${cite ? `<div class="bg-gray-50 border border-gray-200 p-2 mt-1 rounded-lg text-sm text-gray-600">${cite}</div>` : ''}
        </div>`;
      }).join('');
      return `<div class="my-6"><div class="grid ${grid} gap-4">${items}</div></div>`;
    }

    case 'audio': {
      const cite = generateAudioCitation(block.audioTitle, block.audioCreator, block.audioSourceInfo, block.audioDateInfo);
      return `<div class="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
        ${block.description ? `<div class="text-gray-600 italic mb-4 text-sm">${block.description}</div>` : ''}
        <audio controls src="${block.src || ''}" class="w-full"></audio>
        ${cite ? `<div class="bg-white border border-gray-200 p-3 mt-3 rounded-lg text-sm text-gray-600">${cite}</div>` : ''}
      </div>`;
    }

    case 'cards': {
      const layoutClass = CARD_STYLES?.[block.layout]?.class || 'grid-cols-1 md:grid-cols-2';
      const style = CARD_STYLES?.[block.style] || { bg: 'bg-slate-50', border: 'border-l-slate-400', accent: 'text-slate-700' };
      const items = (block.items || []).map((item) => `
        <div class="p-6 rounded-xl border-l-4 ${style.bg} ${style.border} shadow-sm">
          <h4 class="font-semibold mb-3 ${style.accent}">${item.title || ''}</h4>
          <div class="text-gray-700 card-content">${item.content || ''}</div>
        </div>`).join('');
      return `<div class="my-6"><div class="grid ${layoutClass} gap-4">${items}</div></div>`;
    }

    /* ---------- WORKSHEET (inputs + print) ---------- */
    case 'worksheet': {
      const totalPoints = (block.questions || [])
        .filter(q => q.type !== 'instructions')
        .reduce((sum, q) => sum + (q.points || 0), 0);

      const qHtml = (block.questions || []).map((q, idx) => {
        const n = idx + 1;
        switch (q.type) {
          case 'instructions':
            return `<div class="worksheet-instructions mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="font-semibold text-blue-900 mb-2">${q.title || 'Instructions'}</h3>
              <div class="text-blue-800 whitespace-pre-wrap">${q.content || ''}</div>
            </div>`;

          case 'multiple_choice':
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1">
                  <p class="font-medium mb-3">${q.question || ''}</p>
                  <div class="ml-4">
                    ${(q.options || []).map((opt, i) => `
                      <label class="flex items-center gap-2 block mb-2">
                        <input type="radio" name="q${q.id || n}" value="${i}" class="print-checkbox">
                        <span>${String.fromCharCode(65 + i)}. ${opt}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;

          case 'true_false':
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1">
                  <p class="font-medium mb-3">${q.question || ''}</p>
                  <div class="ml-4 flex gap-6">
                    <label class="flex items-center gap-2"><input type="radio" name="q${q.id || n}" value="true" class="print-checkbox"> True</label>
                    <label class="flex items-center gap-2"><input type="radio" name="q${q.id || n}" value="false" class="print-checkbox"> False</label>
                  </div>
                </div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;

          case 'short_answer':
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1">
                  <p class="font-medium mb-2">${q.question || ''}</p>
                  <input type="text" class="ml-4 w-full border border-gray-300 rounded p-2"
                         maxlength="${q.maxLength || 200}" placeholder="Your answer" />
                </div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;

          case 'long_answer':
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1">
                  <p class="font-medium mb-2">${q.question || ''}</p>
                  <textarea class="ml-4 w-full border border-gray-300 rounded p-3" rows="${q.rows || 6}" placeholder="Write your response..."></textarea>
                  <div class="text-xs text-gray-500 ml-4 mt-1">Suggested minimum: ${q.minWords || 0} words</div>
                </div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;

          case 'fill_blank': {
            const parts = String(q.question || '').split('_____');
            const filled = parts.map((part, i) => i < parts.length - 1
              ? `${part}<input type="text" class="inline-block border-b border-gray-400 mx-1 px-1 min-w-[120px]" />`
              : part).join('');
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1"><p class="mb-2">${filled}</p></div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;
          }

          default:
            return `<div class="worksheet-question mb-6">
              <div class="flex items-start gap-3">
                <span class="font-bold">${n}.</span>
                <div class="flex-1">
                  <p class="font-medium mb-2">${q.question || q.title || 'Question'}</p>
                  <input type="text" class="ml-4 w-full border border-gray-300 rounded p-2" placeholder="Your answer" />
                </div>
                <span class="text-sm text-gray-500">(${q.points || 0} pts)</span>
              </div>
            </div>`;
        }
      }).join('');

      return `
        <style>
          @media print {
            .no-print { display: none !important; }
            input, textarea { border: 1px solid #000 !important; }
          }
          .print-header input { border: 1px solid #cbd5e1; padding: 6px 8px; border-radius: 6px; }
          .print-checkbox { transform: scale(1.05); }
        </style>

        <div class="my-6 p-4 border border-gray-200 rounded-lg bg-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">${block.title || 'Worksheet'}</h3>
            <button class="no-print inline-flex items-center px-3 py-1.5 rounded bg-slate-700 text-white text-sm"
                    onclick="window.print()">Print Worksheet</button>
          </div>

          <div class="print-header grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div><label class="text-xs text-gray-500 block mb-1">Name</label><input type="text" class="w-full" /></div>
            <div><label class="text-xs text-gray-500 block mb-1">Student ID</label><input type="text" class="w-full" /></div>
            <div><label class="text-xs text-gray-500 block mb-1">Date</label><input type="text" class="w-full" /></div>
          </div>

          ${block.description ? `<p class="text-gray-700 mb-4 whitespace-pre-wrap">${block.description}</p>` : ''}
          ${qHtml}
          <div class="mt-4 text-sm text-gray-600">${totalPoints ? `Total Points: <strong>${totalPoints}</strong>` : ''}</div>
        </div>
      `;
    }

    default:
      return `<div>Unsupported content type: ${block.type}</div>`;
  }
};

export const getVideoEmbedHtml = (src, platform) => {
  if (!src) return '';
  return `<iframe width="100%" height="100%" src="${src}" frameborder="0" allowfullscreen></iframe>`;
};

/* ---------------- Page wrapper ---------------- */
export const generateCompleteHtml = async (sections, headerData, displayDate, logoHtml) => {
  // Optional: inline logo image if present
  let embeddedLogo = logoHtml;
  if (logoHtml) {
    const m = logoHtml.match(/src="([^"]+)"/i);
    if (m) {
      try {
        const dataUrl = await fetchImageAsDataUrl(m[1]);
        embeddedLogo = logoHtml.replace(m[1], dataUrl);
      } catch {
        embeddedLogo = logoHtml;
      }
    }
  }

  const title = headerData?.courseTitle || 'Lesson Export';
  const sub = displayDate ? `<div style="color:#6b7280">${displayDate}</div>` : '';

  const style = `
    <style>
      body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111827;}
      .container{max-width:900px;margin:0 auto;padding:24px;}
      .rich-editor-content ul{padding-left:1.25rem;}
      .headline-preview h1,h2,h3{margin:0;}
      .print-btn{cursor:pointer}
      @media print{ .no-print{display:none !important;} }
    </style>`;

  const header = `
    <header class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
      <div>${embeddedLogo || ''}</div>
      <button class="print-btn" onclick="window.print()" style="padding:8px 12px;border-radius:8px;background:#1d4ed8;color:#fff;border:none">Print</button>
    </header>`;

  const sectionHtml = (sections || []).map(section => {
    const blocksHtml = (section.blocks || []).map(blockToHtml).join('');
    return `<section class="my-8">
      <h2 style="font-weight:700;font-size:20px;margin-bottom:8px">${section.title || ''}</h2>
      ${blocksHtml}
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>${title}</title>
      ${style}
    </head>
    <body>
      <div class="container">
        ${header}
        <h1 style="font-size:28px;font-weight:800;margin:0">${title}</h1>
        ${sub}
        ${sectionHtml}
      </div>
    </body>
  </html>`;
};
