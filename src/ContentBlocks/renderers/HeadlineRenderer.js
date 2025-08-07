import React from 'react';
import HeadlineEditor from '../../HeadlineEditor';

const HeadlineRenderer = ({ block, isEditMode, onBlockUpdate }) => {
    return isEditMode ? (
        <HeadlineEditor
            content={block.content}
            onChange={(content) => onBlockUpdate({ ...block, content })}
        />
    ) : (
        <div className="headline-preview" dangerouslySetInnerHTML={{ __html: block.content }} />
    );
};

export default HeadlineRenderer;
