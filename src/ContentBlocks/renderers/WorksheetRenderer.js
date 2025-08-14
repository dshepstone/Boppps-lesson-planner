import React, { memo } from 'react';
import { WorksheetComponent } from '../../WorksheetModule';

const WorksheetRenderer = memo(function WorksheetRenderer({
  block,
  isEditMode = false,
  onBlockUpdate = () => {},
  htmlModes,          // accepted to match commonProps signature; not used
  toggleHtmlMode,     // accepted to match commonProps signature; not used
}) {
  if (!block) return null;

  return (
    <div className="worksheet-block-wrapper my-6">
      <WorksheetComponent
        worksheet={block}
        isEditMode={isEditMode}
        onUpdate={(updated) => onBlockUpdate({ ...block, ...updated })}
        isStudentView={false}
      />
      {isEditMode && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            📝 <strong>Worksheet Block:</strong> Students can fill out and print this worksheet.
            Click Edit to modify questions and settings.
          </p>
        </div>
      )}
    </div>
  );
});

export default WorksheetRenderer;
