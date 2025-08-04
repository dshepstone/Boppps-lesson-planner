// File: src/Utils/initialContent.js

import { generateId } from './contentUtils';

// We export a function to ensure generateId() creates new, unique IDs every time it's called.
export const getInitialSections = () => {
    return [
        {
            id: 'overview',
            title: 'Session Overview',
            type: 'content',
            blocks: [
                {
                    id: generateId(),
                    type: 'text',
                    content: 'Welcome to this week\'s lesson. This session covers the main learning objectives and key concepts that students will explore and master.'
                },
                {
                    id: generateId(),
                    type: 'info-box',
                    content: '<h3>This Week\'s Focus</h3><p>By the end of this session, students will understand:</p><ul><li>Key concept 1: Fundamental principles</li><li>Key concept 2: Practical applications</li><li>Key concept 3: Real-world connections</li><li>Key concept 4: Assessment criteria</li></ul><p><strong>Goal:</strong> Students will demonstrate understanding through practical application and reflection.</p>'
                }
            ]
        },
        {
            id: 'bridge-in',
            title: 'Bridge-In',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>Connecting to Previous Learning</h3>'
                },
                {
                    id: generateId(),
                    type: 'text',
                    content: 'This bridge-in activity connects today\'s lesson with what students already know. Use this space to create connections, ask engaging questions, or provide a thought-provoking scenario.'
                },
                {
                    id: generateId(),
                    type: 'exercise-box',
                    content: '<h4>Opening Activity</h4><p>Consider this question/scenario/problem...</p><ul><li>Discussion point 1</li><li>Discussion point 2</li><li>Discussion point 3</li></ul>'
                }
            ]
        },
        {
            id: 'outcomes',
            title: 'Learning Outcomes',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'text',
                    content: 'By the end of today\'s session, you will be able to:'
                },
                {
                    id: generateId(),
                    type: 'list',
                    content: '<ul><li>Learning outcome 1: Demonstrate understanding of...</li><li>Learning outcome 2: Apply knowledge to...</li><li>Learning outcome 3: Analyze and evaluate...</li><li>Learning outcome 4: Create and synthesize...</li></ul>'
                }
            ]
        },
        {
            id: 'pre-assessment',
            title: 'Pre-Assessment',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>What Do You Already Know?</h3>'
                },
                {
                    id: generateId(),
                    type: 'text',
                    content: 'Before we dive into new content, let\'s assess your current understanding:'
                }
            ]
        },
        {
            id: 'participatory-learning',
            title: 'Participatory Learning',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>Main Learning Activities</h3>'
                },
                {
                    id: generateId(),
                    type: 'text',
                    content: 'This is the core content delivery section. Include your main concepts, demonstrations, activities, and student interactions.'
                }
            ]
        },
        {
            id: 'post-assessment',
            title: 'Post-Assessment',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>Check Your Understanding</h3>'
                },
                {
                    id: generateId(),
                    type: 'text',
                    content: 'Let\'s verify that you\'ve achieved today\'s learning outcomes:'
                }
            ]
        },
        {
            id: 'summary',
            title: 'Summary & Next Steps',
            type: 'boppps',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>Key Takeaways</h3>'
                },
                {
                    id: generateId(),
                    type: 'list',
                    content: '<ul><li>Main concept 1: Summary of key learning</li><li>Main concept 2: Important connections made</li><li>Main concept 3: Skills developed</li><li>Main concept 4: Applications to remember</li></ul>'
                }
            ]
        },
        {
            id: 'resources',
            title: 'Resources & Materials',
            type: 'content',
            blocks: [
                {
                    id: generateId(),
                    type: 'heading',
                    content: '<h3>Required Readings</h3>'
                },
                {
                    id: generateId(),
                    type: 'list',
                    content: '<ul><li>Textbook Chapter X: [Chapter title and pages]</li><li>Article: [Author, Title, Source]</li><li>Online Resource: [Description and URL]</li></ul>'
                }
            ]
        }
    ];
};