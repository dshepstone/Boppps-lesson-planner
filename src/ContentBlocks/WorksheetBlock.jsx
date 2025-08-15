// src/ContentBlocks/WorksheetBlock.jsx
// Independent ContentBlock for rendering a Worksheet block.
// Drops in alongside your other ContentBlocks.
//
// Usage in your central renderer (example):
//   import WorksheetBlock from './ContentBlocks/WorksheetBlock';
//   // inside switch(block.type):
//   case 'worksheet':
//     return (
//       <WorksheetBlock
//         block={block}
//         isEditMode={isEditMode}
//         onBlockUpdate={onBlockUpdate}
//         onSaveBlock={onSaveBlock}
//         isStudentView={false}
//       />
//     );
//
// Notes:
// - onBlockUpdate(updated) should replace the current block with `updated` in your section state
// - onSaveBlock(updated) is optional; if provided, it will be called after Save in the editor
// - isStudentView=false renders the read-only preview when edit mode is off
// - Styling relies on the worksheet rules you added to LessonTemplate.css

import React, { memo } from 'react';
import { WorksheetComponent } from '../WorksheetModule';

const noop = () => {};

const WorksheetBlock = memo(function WorksheetBlock({
  block,
  isEditMode = false,
  onBlockUpdate = noop,
  onSaveBlock = noop,
  isStudentView = false,
  onImportJson = noop,
}) {
  if (!block) return null;

  return (
    <div className="worksheet-block-wrapper my-6">
      <WorksheetComponent
        worksheet={block}
        isEditMode={isEditMode}
        onUpdate={(updated) => onBlockUpdate({ ...block, ...updated })}
        onSave={(updated) => onSaveBlock({ ...block, ...updated })}
        isStudentView={isStudentView}
      />

      {isEditMode && (
        <>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              📝 <strong>Worksheet Block:</strong> Students can fill out and print this worksheet.
              Use the editor above to add questions, set points, and tweak options.
            </p>
          </div>
          <div className="no-print mt-3">
            <label className="text-sm font-medium block mb-2">Import Worksheet JSON</label>
            <input type="file" accept="application/json" onChange={onImportJson(block.id)} />
            <p className="text-xs text-gray-500 mt-1">Choose a .json file that follows the worksheet schema.</p>
          </div>
        </>
      )}
    </div>
  );
});

export default WorksheetBlock;
