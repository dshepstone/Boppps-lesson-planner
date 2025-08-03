import React, { useState } from 'react';
import TabNavigation from './TabNavigation';
import BopppsPromptGenerator from './BopppsPromptGenerator';
import LessonTemplate from './LessonTemplate'; // This would be your existing App.js renamed

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('prompt-generator');
  const [templateData, setTemplateData] = useState(null);

  const handleLoadTemplate = (data) => {
    setTemplateData(data);
    setActiveTab('lesson-template');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <div className="content">
        {activeTab === 'prompt-generator' && (
          <BopppsPromptGenerator onLoadTemplate={handleLoadTemplate} />
        )}
        
        {activeTab === 'lesson-template' && (
          <LessonTemplate initialData={templateData} />
        )}
      </div>
    </div>
  );
};

export default MainApp;