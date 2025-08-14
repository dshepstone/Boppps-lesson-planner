import React, { useState } from 'react';
// src/WorksheetModule.js
// Plain-JS modal helpers + lightweight in-app renderer for Worksheet blocks.
// Exports:
//   - renderWorksheetModalContent(containerEl, data?)
//   - handleWorksheetModalSave(containerEl)
//   - WorksheetComponent (React)  -> shows a simple preview in-page
//
// Notes:
// - No TypeScript, no ReactDOM usage. We only set containerEl.innerHTML.
// - This avoids "container.appendChild is not a function" errors in React modals.

/** Render simple modal UI for creating/editing a worksheet.
 *  @param {HTMLElement} containerEl - Host element your modal provides.
 *  @param {object} data - Optional existing worksheet data.
 */
export function renderWorksheetModalContent(containerEl, data = {}) {
  if (!containerEl) return;

  const doc = containerEl.ownerDocument || document;
  const esc = (v) => (v == null ? '' : String(v).replace(/[&<>"]/g, (m) => ({
    '&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;'
  }[m])));

  const html = `
    <div class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="ws-title" class="block text-sm font-medium text-gray-700">Worksheet title</label>
          <input id="ws-title" type="text"
                 class="mt-1 block w-full rounded border border-gray-300 p-2"
                 placeholder="Worksheet"
                 value="${esc(data.title) || 'Worksheet'}" />
        </div>
        <div>
          <label for="ws-points" class="block text-sm font-medium text-gray-700">Total points (optional)</label>
          <input id="ws-points" type="number" min="0"
                 class="mt-1 block w-full rounded border border-gray-300 p-2"
                 placeholder="e.g., 20"
                 value="${esc(data.totalPoints || '')}" />
        </div>
      </div>

      <div>
        <label for="ws-desc" class="block text-sm font-medium text-gray-700">Description / Instructions</label>
        <textarea id="ws-desc" rows="3"
                  class="mt-1 block w-full rounded border border-gray-300 p-2"
                  placeholder="What should students do?">${esc(data.description || '')}</textarea>
      </div>

      <div class="p-3 rounded bg-gray-50 border border-gray-200 text-sm text-gray-700">
        <strong>Heads-up:</strong> This modal is a lightweight shell so you can add a
        Worksheet block. Question details can be edited later in the block UI.
      </div>
    </div>
  `;

  // Only write innerHTML; some modal hosts pass non-DOM container objects.
  if (typeof containerEl.innerHTML === 'string') {
    containerEl.innerHTML = html;
  }

  // Provide a getter so Save can read the draft back out.
  containerEl._getWorksheetDraft = function () {
    const titleEl = doc.getElementById('ws-title');
    const descEl  = doc.getElementById('ws-desc');
    const ptsEl   = doc.getElementById('ws-points');
    return {
      type: 'worksheet',
      title: titleEl ? titleEl.value.trim() || 'Worksheet' : 'Worksheet',
      description: descEl ? descEl.value.trim() : '',
      totalPoints: ptsEl && ptsEl.value !== '' ? Number(ptsEl.value) : undefined,
      questions: Array.isArray(data.questions) ? data.questions : []
    };
  };
}

/** Called by the modal's Save button. Returns the worksheet block payload. */
export function handleWorksheetModalSave(containerEl) {
  if (containerEl && typeof containerEl._getWorksheetDraft === 'function') {
    return containerEl._getWorksheetDraft();
  }
  return null;
}

/** Simple in-app renderer (React) so the worksheet block shows in the page. */
export function WorksheetComponent({ worksheet, isEditMode }) {
  const data = worksheet || { title: 'Worksheet', description: '', questions: [] };
  const total = (Array.isArray(data.questions) ? data.questions : [])
    .filter(q => q && q.type !== 'instructions')
    .reduce((sum, q) => sum + (q.points || 0), 0);

  const containerId = `worksheet-${data.id || 'temp'}`;

  return (
    <div id={containerId} className="my-6 p-4 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{data.title || 'Worksheet'}</h3>
        {!isEditMode && (
          <button
            type="button"
            onClick={() => (window.printWorksheet ? window.printWorksheet(containerId) : window.print())}
            className="no-print worksheet-print-button inline-flex items-center px-3 py-1.5 rounded bg-slate-700 text-white text-sm hover:bg-slate-800"
            aria-label="Print worksheet"
          >
            Print Worksheet Only
          </button>
        )}
      </div>
      {data.description && (
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{data.description}</p>
      )}
      <div className="text-sm text-gray-500 mb-2">{total ? `Total Points: ${total}` : ''}</div>

      {Array.isArray(data.questions) && data.questions.length > 0 ? (
        <ol className="space-y-4 list-decimal ml-6">
          {data.questions.map((q, i) => (
            <li key={q?.id || i} className="pl-2">
              <p className="font-medium">{q?.question || q?.title || 'Question'}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-sm text-gray-500">
          No questions yet. Use the worksheet editor to add items.
        </div>
      )}
    </div>
  );
}

export default WorksheetComponent;



// --- React WorksheetBuilder + processor additions ---
// These are additive exports to work with ContentModal's import:
//   import { WorksheetBuilder, processWorksheetData } from './WorksheetModule';

// Normalize a single question into the export-friendly shape used by exportUtils.js
export const normalizeQuestion = (q) => {
  const base = {
    type: q.type || 'short-answer',
    title: q.title || '',
    points: Number.isFinite(q.points) ? q.points : (q.points ? Number(q.points) : 0),
    content: q.content || ''
  };
  switch (base.type) {
    case 'mcq':
      return {
        ...base,
        options: Array.isArray(q.options) ? q.options.filter(Boolean) : [],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : -1
      };
    case 'true-false':
      return { ...base, correct: typeof q.correct === 'boolean' ? q.correct : null };
    case 'fill-blank':
    case 'short-answer':
    case 'long-answer':
    case 'instructions':
    default:
      return base;
  }
};

// Turn the formData coming from ContentModal into a worksheet block payload
export const processWorksheetData = (formData) => {
  const questions = Array.isArray(formData.worksheetQuestions) ? formData.worksheetQuestions : [];
  return {
    type: 'worksheet',
    title: formData.worksheetTitle || 'Worksheet',
    description: formData.worksheetDescription || '',
    totalPoints: formData.worksheetTotalPoints ? Number(formData.worksheetTotalPoints) : undefined,
    questions: questions.map(normalizeQuestion)
  };
};

const TYPE_OPTIONS = [
  { value: 'instructions', label: 'Instructions' },
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True / False' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'long-answer', label: 'Long Answer' },
  { value: 'fill-blank', label: 'Fill in the Blank' }
];

const defaultQuestion = (type='short-answer') => {
  const base = { type, title: '', points: 0, content: '' };
  if (type === 'mcq') return { ...base, options: [''], correctIndex: -1 };
  if (type === 'true-false') return { ...base, correct: null };
  return base;
};

/** Lightweight React builder for worksheets used inside the React modal. */
export const WorksheetBuilder = ({ formData, setFormData }) => {
  const [newType, setNewType] = useState('instructions');

  const qList = Array.isArray(formData.worksheetQuestions) ? formData.worksheetQuestions : [];

  const update = (patch) => setFormData({ ...formData, ...patch });

  const addQuestion = () => {
    const next = [...qList, defaultQuestion(newType)];
    update({ worksheetQuestions: next });
  };
  const removeQuestion = (idx) => {
    const next = qList.filter((_, i) => i !== idx);
    update({ worksheetQuestions: next });
  };
  const updateQuestion = (idx, patch) => {
    const next = qList.map((q, i) => (i === idx ? { ...q, ...patch } : q));
    update({ worksheetQuestions: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Worksheet Title</label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={formData.worksheetTitle || ''}
            onChange={(e) => update({ worksheetTitle: e.target.value })}
            placeholder="e.g., Timing & Spacing Checkpoint"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Points (optional)</label>
          <input
            type="number"
            min="0"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={formData.worksheetTotalPoints || ''}
            onChange={(e) => update({ worksheetTotalPoints: e.target.value })}
            placeholder="e.g., 20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
        <textarea
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={formData.worksheetDescription || ''}
          onChange={(e) => update({ worksheetDescription: e.target.value })}
          placeholder="Brief directions for students…"
        />
      </div>

      {/* Questions */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <select
            className="p-2 border border-gray-300 rounded-lg"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
            onClick={addQuestion}
          >
            Add Question
          </button>
        </div>

        {qList.length === 0 && (
          <p className="text-sm text-gray-500">No questions yet. Choose a type and click “Add Question”.</p>
        )}

        <div className="space-y-4">
          {qList.map((q, idx) => (
            <div key={idx} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Q{idx + 1} — {TYPE_OPTIONS.find(t => t.value === q.type)?.label || q.type}</span>
                <button
                  type="button"
                  className="text-red-600 text-sm"
                  onClick={() => removeQuestion(idx)}
                >
                  Remove
                </button>
              </div>

              {/* Common fields */}
              {q.type !== 'instructions' && (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Title / Prompt</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                    value={q.title || ''}
                    onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                    placeholder="Question prompt…"
                  />
                  <label className="block text-xs text-gray-600 mb-1">Points</label>
                  <input
                    type="number"
                    min="0"
                    className="w-32 p-2 border border-gray-300 rounded-lg mb-2"
                    value={q.points ?? 0}
                    onChange={(e) => updateQuestion(idx, { points: Number(e.target.value || 0) })}
                  />
                </>
              )}

              {/* Type-specific */}
              {q.type === 'instructions' && (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Title</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                    value={q.title || ''}
                    onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                    placeholder="Section or instructions heading…"
                  />
                  <label className="block text-xs text-gray-600 mb-1">Content</label>
                  <textarea
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={q.content || ''}
                    onChange={(e) => updateQuestion(idx, { content: e.target.value })}
                    placeholder="Guidance for students…"
                  />
                </>
              )}

              {q.type === 'mcq' && (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Options</label>
                  {(Array.isArray(q.options) ? q.options : ['']).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 mb-2">
                      <input
                        className="flex-1 p-2 border border-gray-300 rounded-lg"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...(q.options || [])];
                          opts[oi] = e.target.value;
                          updateQuestion(idx, { options: opts });
                        }}
                        placeholder={`Option ${oi + 1}`}
                      />
                      <button
                        type="button"
                        className="px-2 py-1 text-sm border rounded"
                        onClick={() => {
                          const opts = [...(q.options || [])];
                          opts.splice(oi, 1);
                          updateQuestion(idx, { options: opts });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="px-2 py-1 text-sm border rounded mb-2"
                    onClick={() => updateQuestion(idx, { options: [...(q.options || []), ''] })}
                  >
                    Add Option
                  </button>

                  <label className="block text-xs text-gray-600 mb-1">Correct Option</label>
                  <select
                    className="p-2 border border-gray-300 rounded-lg"
                    value={typeof q.correctIndex === 'number' ? q.correctIndex : -1}
                    onChange={(e) => updateQuestion(idx, { correctIndex: Number(e.target.value) })}
                  >
                    <option value={-1}>— none —</option>
                    {(q.options || []).map((_, oi) => (
                      <option key={oi} value={oi}>{`Option ${oi + 1}`}</option>
                    ))}
                  </select>
                </>
              )}

              {q.type === 'true-false' && (
                <>
                  <label className="block text-xs text-gray-600 mb-1">Correct Answer</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        checked={q.correct === true}
                        onChange={() => updateQuestion(idx, { correct: true })}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="radio"
                        checked={q.correct === false}
                        onChange={() => updateQuestion(idx, { correct: false })}
                      />
                      False
                    </label>
                  </div>
                  <label className="block text-xs text-gray-600 mt-2 mb-1">Optional prompt</label>
                  <input
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={q.title || ''}
                    onChange={(e) => updateQuestion(idx, { title: e.target.value })}
                    placeholder="e.g., Is the following statement true or false…"
                  />
                </>
              )}

              {(q.type === 'short-answer' || q.type === 'long-answer' || q.type === 'fill-blank') && (
                <>
                  <label className="block text-xs text-gray-600 mb-1">
                    {q.type === 'fill-blank' ? 'Sentence with blanks (use "_____")' : 'Prompt'}
                  </label>
                  <textarea
                    rows={q.type === 'long-answer' ? 4 : 2}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={q.content || ''}
                    onChange={(e) => updateQuestion(idx, { content: e.target.value })}
                    placeholder={
                      q.type === 'fill-blank'
                        ? 'e.g., The principle of ____ controls how far apart drawings are spaced.'
                        : 'Your question prompt…'
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
