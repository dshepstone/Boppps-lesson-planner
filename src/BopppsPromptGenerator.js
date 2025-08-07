import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import {
  Download,
  Copy,
  Wand2,
  FileText,
  Save,
  Upload,
  RefreshCw,
  Info,
  Plus,
  Trash2,
  Type,
  Palette,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code
} from 'lucide-react';

// Enhanced Rich Text Editor Component
// Enhanced Rich Text Editor Component - Fixed Version
// Enhanced Rich Text Editor Component - Fixed Version
const EnhancedRichTextEditor = ({ content, onChange, placeholder, className = "" }) => {
  const [htmlContent, setHtmlContent] = useState(content || '');
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we're adding separately to avoid duplicates
        link: false,          // We're adding Link separately
      }),
      // Underline extension is included with StarterKit; avoid registering twice
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== htmlContent) {
      setHtmlContent(content || '');
      editor.commands.setContent(content || '');
    }
  }, [content, editor, htmlContent]);

  // Prevent drag events from bubbling up from the editor
  const handleMouseDown = (e) => {
    // Don't prevent mousedown completely, just stop it from bubbling
    // This allows text selection while preventing parent drag
    e.stopPropagation();
  };

  const handleDragStart = (e) => {
    // Prevent any drag start events from the editor area
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrag = (e) => {
    // Prevent drag events from bubbling
    e.stopPropagation();
  };

  const handleDragOver = (e) => {
    // Prevent dragover events from bubbling
    e.stopPropagation();
  };

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const toggleHighlight = () => editor.chain().focus().toggleHighlight().run();

  const setTextAlign = (alignment) => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div
      ref={editorRef}
      className={`border border-gray-300 rounded-lg bg-white ${className}`}
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragOver={handleDragOver}
    >
      {editor && (
        <>
          {/* Toolbar */}
          <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg">
            <div className="flex flex-wrap items-center gap-1">
              {/* Text Formatting */}
              <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                <button
                  onClick={toggleBold}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Bold"
                >
                  <Type className="h-4 w-4 font-bold" />
                </button>
                <button
                  onClick={toggleItalic}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Italic"
                >
                  <Type className="h-4 w-4 italic" />
                </button>
                <button
                  onClick={toggleUnderline}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Underline"
                >
                  <Type className="h-4 w-4 underline" />
                </button>
                <button
                  onClick={toggleStrike}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Strikethrough"
                >
                  <Type className="h-4 w-4 line-through" />
                </button>
                <button
                  onClick={toggleCode}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('code') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Code"
                >
                  <Code className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleHighlight}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('highlight') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Highlight"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center border-r border-gray-300 pr-2 mr-2">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Align Center"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTextAlign('justify')}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
                  type="button"
                  title="Justify"
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>

              {/* Links and Tables */}
              <div className="flex items-center">
                <button
                  onClick={editor.isActive('link') ? removeLink : addLink}
                  className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
                  type="button"
                  title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={addTable}
                  className="p-2 rounded hover:bg-gray-200"
                  type="button"
                  title="Insert Table"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor Content with drag prevention */}
          <div
            onMouseDown={handleMouseDown}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragOver={handleDragOver}
            style={{
              // Ensure text is selectable
              userSelect: 'text',
              WebkitUserSelect: 'text',
              MozUserSelect: 'text',
              msUserSelect: 'text'
            }}
          >
            <EditorContent
              editor={editor}
              className="rich-editor-content prose prose-sm max-w-none p-4 min-h-[120px] focus:outline-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

const BopppsPromptGenerator = ({ onLoadTemplate }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    lessonTopic: '',
    courseName: '',
    duration: '75',
    targetAudience: '',
    prerequisiteKnowledge: '',
    materialsRequired: '',
    bridgeIn: '',
    objectives: '',
    preAssessment: '',
    mainActivities: [
      { duration: '15', facilitatorActivity: '', learnerActivity: '', materials: '' }
    ],
    postAssessment: '',
    summary: '',
    reflections: '',
    additionalNotes: ''
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [generatedJson, setGeneratedJson] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateActivity = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      mainActivities: prev.mainActivities.map((activity, i) =>
        i === index ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      mainActivities: [...prev.mainActivities, {
        duration: '15',
        facilitatorActivity: '',
        learnerActivity: '',
        materials: ''
      }]
    }));
  };

  const removeActivity = (index) => {
    if (formData.mainActivities.length > 1) {
      setFormData(prev => ({
        ...prev,
        mainActivities: prev.mainActivities.filter((_, i) => i !== index)
      }));
    }
  };

  const generateAIPrompt = () => {
    const totalDuration = formData.mainActivities.reduce((sum, activity) => sum + parseInt(activity.duration || 0), 0);
    const currentDate = new Date();
    const weekDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];

    const prompt = `Create a comprehensive, professional BOPPPS lesson plan that matches the quality and depth of industry-standard educational content. This must be detailed, engaging, student-facing material suitable for ${formData.targetAudience || 'students'}.

**CRITICAL REQUIREMENTS:**
- Generate content that is comprehensive, professional, and immediately usable
- Include specific, actionable activities with detailed instructions
- Use professional terminology appropriate to the subject matter
- Create engaging, student-centered content with clear pedagogical purpose
- Include assessment criteria, materials lists, and professional development connections
- Format all content using proper HTML tags for rich presentation
- Ensure content is suitable for direct student consumption

**LESSON SPECIFICATIONS:**
- **Course:** ${formData.courseName || '[Course Name]'}
- **Topic:** ${formData.lessonTopic || '[Lesson Topic]'}
- **Duration:** ${formData.duration} minutes total (${Math.floor(formData.duration / 60) > 0 ? Math.floor(formData.duration / 60) + ' hours ' : ''}${formData.duration % 60} minutes)
- **Target Audience:** ${formData.targetAudience || '[Define target audience]'}
- **Prerequisites:** ${formData.prerequisiteKnowledge || '[Define prerequisite knowledge]'}
- **Learning Context:** Professional educational environment with access to modern technology

**PEDAGOGICAL FRAMEWORK DETAILS:**

**BRIDGE-IN (Opening - 10-15 minutes):**
${formData.bridgeIn || 'Create an innovative, engaging opening that immediately captures student attention and connects to their prior knowledge. Include interactive elements.'}

**Requirements for Bridge-In:**
- Include a specific interactive activity (polls, games, demonstrations, real-world examples)
- Connect explicitly to students' prior knowledge and experiences
- Set clear expectations for the session
- Use engaging, professional language that builds excitement
- Include specific timing and materials needed
- Consider technology integration (Mentimeter, Kahoot, demonstration tools)
- Provide fallback options if technology fails

**LEARNING OBJECTIVES (Student-Facing):**
${formData.objectives || 'Create clear, measurable, student-friendly learning objectives using action verbs and specific performance criteria.'}

**Requirements for Objectives:**
- Use action verbs from Bloom's Taxonomy (analyze, create, evaluate, apply, etc.)
- Include specific performance criteria students can self-assess
- Connect to course learning outcomes (CLOs) and unit learning outcomes (ULOs)
- Include professional practice objectives where applicable
- Make objectives meaningful to students' career goals
- Format as clear, numbered outcomes with sub-objectives

**PRE-ASSESSMENT (Knowledge Check - 5-10 minutes):**
${formData.preAssessment || 'Design engaging pre-assessment activities that reveal prior knowledge without intimidating students.'}

**Requirements for Pre-Assessment:**
- Include multiple assessment methods (think-pair-share, quick polls, reflection questions)
- Make it non-threatening and confidence-building
- Provide instructor guidance on interpreting results
- Include differentiation strategies based on results
- Connect to the day's learning objectives
- Include specific questions and expected responses

**MAIN CONTENT & ACTIVITIES (${totalDuration} minutes total):**
Create detailed, sequential learning activities that build knowledge progressively:

${formData.mainActivities.map((activity, index) => `
**Activity ${index + 1}: [Create Compelling Activity Title] (${activity.duration} minutes)**

**Facilitator Actions:**
${activity.facilitatorActivity || `Define detailed instructor activities including:
- Specific content to cover with key talking points
- Teaching methods and pedagogical approaches
- Questions to ask students for engagement
- Common misconceptions to address
- Technology or tools to use
- Transition strategies to next activity`}

**Student Activities:**
${activity.learnerActivity || `Define specific student engagement including:
- Individual work with clear instructions
- Collaborative activities with defined roles
- Hands-on practice with step-by-step guidance
- Discussion questions and prompts
- Assessment criteria and success indicators
- Reflection and connection activities`}

**Materials & Resources:**
${activity.materials || `List all required materials including:
- Technology requirements (software, hardware, accounts)
- Physical materials (handouts, supplies, tools)
- Digital resources (videos, websites, simulations)
- Reference materials and documentation
- Backup options for technical difficulties`}

**Assessment Integration:**
- Formative assessment checkpoints
- Peer feedback opportunities
- Self-assessment rubrics
- Progress indicators for students
`).join('')}

**Requirements for Main Activities:**
- Include multiple learning modalities (visual, auditory, kinesthetic)
- Provide clear step-by-step instructions students can follow
- Include professional industry context and real-world applications
- Add interactive elements every 10-15 minutes
- Include specific examples and case studies
- Provide differentiation for various skill levels
- Include troubleshooting guides for common issues
- Add opportunities for peer collaboration and feedback

**POST-ASSESSMENT (Learning Verification - 10-15 minutes):**
${formData.postAssessment || 'Create comprehensive post-assessment that validates learning and provides meaningful feedback.'}

**Requirements for Post-Assessment:**
- Multiple assessment methods (practical demonstrations, peer reviews, self-reflection)
- Clear rubrics and success criteria
- Immediate feedback mechanisms
- Connection to learning objectives
- Preparation for next session or assignment
- Student self-assessment opportunities
- Instructor feedback guidelines

**SUMMARY & NEXT STEPS (5-10 minutes):**
${formData.summary || 'Create meaningful closure that reinforces learning and motivates continued engagement.'}

**Requirements for Summary:**
- Key takeaways formatted for easy reference
- Connections to upcoming lessons and assignments
- Professional development implications
- Student reflection prompts
- Clear next steps and preparation requirements
- Resource recommendations for further learning

**COMPREHENSIVE MATERIALS LIST:**
${formData.materialsRequired || 'Create detailed materials list organized by category.'}

**Organize materials by:**
- Technology requirements (software versions, system requirements, account access)
- Physical materials (quantities, suppliers, alternatives)
- Digital resources (URLs, download links, backup options)
- Reference materials (textbook pages, articles, video links)
- Assessment tools (rubrics, checklists, peer review forms)

**PROFESSIONAL DEVELOPMENT CONTEXT:**
Include connections to:
- Industry standards and best practices
- Professional certifications and career pathways
- Real-world applications and case studies
- Current trends and emerging technologies
- Professional organizations and networking opportunities

**ADDITIONAL CONSIDERATIONS:**
${formData.additionalNotes || 'Include comprehensive planning considerations for successful lesson delivery.'}

**Address:**
- Accessibility accommodations and inclusive design
- Technology troubleshooting and backup plans
- Timing flexibility and pacing adjustments
- Differentiation strategies for diverse learners
- Assessment accommodations
- Cultural sensitivity and diverse perspectives
- Safety considerations (if applicable)

**REFLECTION & IMPROVEMENT:**
${formData.reflections || 'Provide structured reflection framework for continuous improvement.'}

**Include:**
- Post-lesson reflection prompts for instructor
- Student feedback collection methods
- Lesson effectiveness assessment criteria
- Improvement strategies for next delivery
- Professional development opportunities

**CRITICAL OUTPUT FORMAT REQUIREMENT:**

Your response MUST be formatted as a complete JSON object following this EXACT structure. Do not include any text before or after the JSON. Replace ALL placeholder content with detailed, professional, subject-specific content:

{
  "version": "2.0.0",
  "timestamp": "${new Date().toISOString()}",
  "courseTopic": "${formData.lessonTopic || '[Course Topic]'} - Week 1",
  "instructorName": "Instructor: [Your Name]",
  "instructorEmail": "[email]@institution.edu",
  "footerCourseInfo": "${formData.courseName || '[Course Name]'}",
  "footerInstitution": "[Institution Name]",
  "footerCopyright": "© ${new Date().getFullYear()} All Rights Reserved",
  "week": "1",
  "date": "${weekDate}",
  "sections": {
    "overview": [
      {
        "type": "text",
        "content": "[Create comprehensive session overview that professionally introduces the topic, explains its importance, and builds student excitement. Include professional context and real-world relevance.]"
      },
      {
        "type": "info-box",
        "content": "<h3>This Week's Learning Focus</h3><p>By the end of today's session, you will:</p><ul><li><strong>[Action Verb]</strong> [specific, measurable outcome]</li><li><strong>[Action Verb]</strong> [specific, measurable outcome]</li><li><strong>[Action Verb]</strong> [specific, measurable outcome]</li><li><strong>[Action Verb]</strong> [specific, measurable outcome]</li><li><strong>[Action Verb]</strong> [specific, measurable outcome]</li></ul><p><strong>Goal:</strong> [Overall session goal that connects to course objectives and professional development]</p>"
      },
      {
        "type": "text",
        "content": "<strong>Today's Schedule:</strong><br/>• [Activity 1] ([time] min)<br/>• [Activity 2] ([time] min)<br/>• [Activity 3] ([time] min)<br/>• Break ([time] min)<br/>• [Activity 4] ([time] min)<br/>• [Activity 5] ([time] min)<br/>• Summary & Next Steps ([time] min)"
      }
    ],
    "bridge-in": [
      {
        "type": "heading",
        "content": "<h3>[Create engaging, specific bridge-in title that reflects the opening activity]</h3>"
      },
      {
        "type": "text",
        "content": "[Create compelling introduction that explains the bridge-in activity and its purpose]"
      },
      {
        "type": "exercise-box",
        "content": "<h4>[Specific Interactive Activity Name]</h4><p><strong>[Technology/Method]:</strong> [Specific instructions]<br/><strong>[Platform/Access]:</strong> [Specific details]</p><p><strong>Questions we'll explore together:</strong></p><ul><li>[Specific, engaging question relevant to topic]</li><li>[Specific, engaging question relevant to topic]</li><li>[Specific, engaging question relevant to topic]</li><li>[Specific, engaging question relevant to topic]</li><li>[Specific, engaging question relevant to topic]</li></ul><p><em>Note: [Pedagogical purpose and benefit to students]</em></p>"
      },
      {
        "type": "text",
        "content": "<strong>Discussion Starter:</strong> [Create thought-provoking discussion prompt that connects to the day's learning objectives and students' experiences]"
      }
    ],
    "outcomes": [
      {
        "type": "text",
        "content": "By the end of today's session, you will be able to:"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>CLO [#]:</strong> [Specific course learning outcome with action verb and measurable criteria]</li><li><strong>ULO [#.#]:</strong> [Specific unit learning outcome]</li><li><strong>ULO [#.#]:</strong> [Specific unit learning outcome]</li><li><strong>ULO [#.#]:</strong> [Specific unit learning outcome]</li><li><strong>ULO [#.#]:</strong> [Specific unit learning outcome]</li><li><strong>Professional Practice:</strong> [Professional skill or competency to be developed]</li></ul>"
      }
    ],
    "pre-assessment": [
      {
        "type": "heading",
        "content": "<h3>[Create specific, non-intimidating pre-assessment title]</h3>"
      },
      {
        "type": "text",
        "content": "[Create encouraging introduction that explains the purpose and reduces anxiety]"
      },
      {
        "type": "exercise-box",
        "content": "<h4>[Specific Pre-Assessment Activity Name]</h4><p><strong>Step 1 ([time] min):</strong> [Specific individual activity instructions]:</p><ul><li>[Specific question related to topic]</li><li>[Specific question related to topic]</li><li>[Specific question related to topic]</li></ul><p><strong>Step 2 ([time] min):</strong> [Specific collaborative activity instructions]</p><p><strong>Step 3 ([time] min):</strong> [Specific sharing and discussion instructions]</p>"
      }
    ],
    "participatory-learning": [
      {
        "type": "heading",
        "content": "<h3>Part 1: [Specific Content Section Title] ([duration] min)</h3>"
      },
      {
        "type": "text",
        "content": "[Create detailed introduction to the main content section with professional context]"
      },
      {
        "type": "info-box",
        "content": "<h4>[Specific Topic/Concept Title]</h4><ul><li>[Detailed explanation of key concept with examples]</li><li>[Detailed explanation of key concept with examples]</li><li>[Detailed explanation of key concept with examples]</li><li>[Detailed explanation of key concept with examples]</li></ul><p><strong>[Professional Context Title]:</strong> [Real-world application and industry relevance]</p>"
      },
      {
        "type": "text",
        "content": "[Additional detailed content sections with headings, subheadings, and comprehensive explanations]"
      },
      {
        "type": "exercise-box",
        "content": "<h4>[Specific Hands-On Activity Title]</h4><p><strong>Step 1: [Action Title]</strong></p><ul><li>[Detailed step-by-step instruction]</li><li>[Detailed step-by-step instruction]</li><li>[Detailed step-by-step instruction]</li></ul><p><em>[Include video reference if applicable]: [INSERT VIDEO: Descriptive title]</em></p>"
      },
      {
        "type": "info-box",
        "content": "<h4>[Essential Concepts/Tools Title]</h4><p><strong>[Category Title]:</strong></p><ul><li><strong>[Specific Tool/Concept]:</strong> [Detailed explanation and application]</li><li><strong>[Specific Tool/Concept]:</strong> [Detailed explanation and application]</li><li><strong>[Specific Tool/Concept]:</strong> [Detailed explanation and application]</li></ul><p><strong>[Application Context]:</strong></p><ul><li><strong>[Context Title]:</strong> [Specific professional application]</li><li><strong>[Context Title]:</strong> [Specific professional application]</li></ul>"
      }
    ],
    "post-assessment": [
      {
        "type": "heading",
        "content": "<h3>[Specific Assessment Activity Title]</h3>"
      },
      {
        "type": "text",
        "content": "[Create clear instructions that connect assessment to learning objectives]"
      },
      {
        "type": "exercise-box",
        "content": "<h4>[Specific Assessment Method]</h4><p><strong>Question 1:</strong> [Specific question that tests understanding]</p><ul><li>a) [Specific option]</li><li>b) [Specific option]</li><li>c) [Specific option]</li><li>d) [Specific option]</li></ul><p>[Additional assessment questions with clear criteria and expectations]</p><p><em>[Answer key or success criteria]: [Specific feedback]</em></p>"
      },
      {
        "type": "exercise-box",
        "content": "<h4>[Practical Assessment Component]</h4><p><strong>[Assessment Activity] ([time] minutes):</strong></p><ol><li>[Specific assessment task]</li><li>[Specific assessment criteria]</li><li>[Specific feedback mechanism]</li></ol><ul><li>[Success criteria 1]</li><li>[Success criteria 2]</li><li>[Success criteria 3]</li></ul><p><em>Remember: [Professional context and importance]</em></p>"
      }
    ],
    "summary": [
      {
        "type": "heading",
        "content": "<h3>Today's Key Takeaways</h3>"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>[Key Concept 1]:</strong> [Specific summary with application]</li><li><strong>[Key Concept 2]:</strong> [Specific summary with application]</li><li><strong>[Key Concept 3]:</strong> [Specific summary with application]</li><li><strong>[Key Concept 4]:</strong> [Specific summary with application]</li><li><strong>[Professional Practices]:</strong> [Summary of professional skills developed]</li></ul>"
      },
      {
        "type": "heading",
        "content": "<h3>Next Week: [Specific Topic Title]</h3>"
      },
      {
        "type": "text",
        "content": "[Create specific preview of next session with clear connections to today's learning]"
      },
      {
        "type": "info-box",
        "content": "<h4>For Next Class:</h4><ul><li><strong>Complete:</strong> [Specific assignment or task]</li><li><strong>Read:</strong> [Specific reading assignment with page numbers]</li><li><strong>Observe:</strong> [Specific observation or research task]</li><li><strong>Prepare:</strong> [Specific preparation requirement]</li><li><strong>Bring:</strong> [Specific materials needed]</li></ul><p><em>[Motivational message connecting to professional development]</em></p>"
      },
      {
        "type": "exercise-box",
        "content": "<h4>Professional Development Challenge</h4><p>[Create specific professional development activity or reflection that extends learning beyond the classroom]</p><ul><li>[Specific professional task or observation]</li><li>[Specific professional task or observation]</li><li>[Specific professional task or observation]</li></ul><p>[Preview of next class discussion or sharing]</p>"
      }
    ],
    "resources": [
      {
        "type": "heading",
        "content": "<h3>Required Reading</h3>"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>[Textbook Title] ([Edition])</strong> by [Author]<ul><li>Pages [##-##]: [Specific chapter/section title]</li><li>Pages [##-##]: [Specific chapter/section title]</li><li>Pages [##-##]: [Specific chapter/section title with importance note]</li></ul></li><li><strong>[Additional Resource Title]</strong> by [Author]<ul><li>Pages [##-##]: [Specific section with relevance note]</li><li>Pages [##-##]: [Specific section with application note]</li></ul></li></ul>"
      },
      {
        "type": "heading",
        "content": "<h3>Software Resources</h3>"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>[Software Name] Documentation:</strong><ul><li><a href='[URL]' target='_blank'>[Specific Guide Title]</a></li><li><a href='[URL]' target='_blank'>[Specific Reference Title]</a></li><li><a href='[URL]' target='_blank'>[Specific Tutorial Title]</a></li></ul></li><li><strong>[Platform Name] Setup & Tutorials:</strong><ul><li>[Access instructions via course portal]</li><li><a href='[URL]' target='_blank'>[Specific Tutorial Series Title]</a> - [Importance note]</li><li>[Additional tutorial information]</li></ul></li></ul>"
      },
      {
        "type": "heading",
        "content": "<h3>Additional Learning Materials</h3>"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>[Resource Category]:</strong><ul><li>\"[Specific Resource Title]\" by [Creator]</li><li>\"[Specific Resource Title]\" by [Creator]</li><li>\"[Specific Resource Title]\" by [Creator]</li><li>\"[Specific Resource Title]\" - [Description]</li></ul></li><li><strong>Reference Materials:</strong><ul><li>[Specific reference material with location]</li><li>[Specific template or guide]</li><li>[Specific professional example]</li><li>[Specific calculation or formula reference]</li></ul></li><li><strong>Professional Examples:</strong><ul><li>[Specific professional example with source]</li><li>[Specific case study or application]</li><li>[Specific before/after or comparative study]</li><li>[Specific industry standard or best practice]</li></ul></li></ul>"
      },
      {
        "type": "heading",
        "content": "<h3>Course Support Resources</h3>"
      },
      {
        "type": "list",
        "content": "<ul><li><strong>Technical Support:</strong><ul><li>[Software] installation guide and troubleshooting</li><li>Campus computer lab access and hours</li><li>IT support contact for software issues</li></ul></li><li><strong>Academic Support:</strong><ul><li>Instructor office hours: [Insert specific times]</li><li>Peer tutoring program signup</li><li>[Subject] lab supervised practice sessions</li></ul></li><li><strong>Professional Development:</strong><ul><li>Industry guest speaker schedule</li><li>Student [subject] showcase dates</li><li>Portfolio development resources</li></ul></li></ul>"
      }
    ]
  }
}

**QUALITY STANDARDS:**
- All content must be immediately usable by students
- Include specific examples, not generic placeholders
- Professional terminology appropriate to the subject matter
- Clear step-by-step instructions for all activities
- Comprehensive resource lists with specific citations
- Assessment criteria and success indicators
- Professional development connections throughout
- Engaging, student-centered language that builds confidence
- Technical accuracy and current industry relevance
- Inclusive and accessible design principles

**FINAL INSTRUCTION:** Generate comprehensive, professional content that replaces ALL placeholder text with detailed, subject-specific material that an instructor could use immediately without further editing.`;

    setGeneratedPrompt(prompt);
    setShowPrompt(true);
  };

  const generateJsonStructure = () => {
    const jsonStructure = {
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      courseTopic: `${formData.lessonTopic || "Lesson Topic"} - Week 1`,
      instructorName: "Instructor: [Your Name]",
      instructorEmail: "[instructor]@institution.edu",
      footerCourseInfo: formData.courseName || "Course Name",
      footerInstitution: "[Institution Name]",
      footerCopyright: `© ${new Date().getFullYear()} All Rights Reserved`,
      week: "1",
      date: new Date().toISOString().split('T')[0],
      sections: {
        overview: [
          {
            type: "heading",
            content: "Session Overview"
          },
          {
            type: "text",
            content: `<strong>Welcome to ${formData.lessonTopic || "this lesson"}!</strong><br/>This session covers the foundational concepts and practical applications you'll need to master.`
          },
          {
            type: "info-box",
            content: `<h3>Lesson Information</h3><p><strong>Duration:</strong> ${formData.duration} minutes</p><p><strong>Target Audience:</strong> ${formData.targetAudience || "Students"}</p><p><strong>Prerequisites:</strong> ${formData.prerequisiteKnowledge || "None specified"}</p>`
          }
        ],
        "bridge-in": [
          {
            type: "heading",
            content: "Opening Activity"
          },
          {
            type: "text",
            content: formData.bridgeIn || "Engaging opening activity that connects to prior knowledge and captures student interest."
          }
        ],
        outcomes: [
          {
            type: "text",
            content: "By the end of today's session, you will be able to:"
          },
          {
            type: "list",
            content: formData.objectives || "<ul><li>Understand key concepts</li><li>Apply learned principles</li><li>Demonstrate practical skills</li></ul>"
          }
        ],
        "pre-assessment": [
          {
            type: "heading",
            content: "What Do You Know?"
          },
          {
            type: "text",
            content: formData.preAssessment || "Let's assess your current understanding before we begin."
          }
        ],
        "participatory-learning": [
          {
            type: "heading",
            content: `Main Learning Activities (${formData.duration} min total)`
          },
          {
            type: "text",
            content: "Today's session includes several hands-on activities designed to help you master the key concepts."
          },
          ...formData.mainActivities.map((activity, index) => ({
            type: "info-box",
            content: `<h4>Activity ${index + 1} (${activity.duration} minutes)</h4><p><strong>Facilitator:</strong> ${activity.facilitatorActivity || 'Facilitator activities will be defined here'}</p><p><strong>Learners:</strong> ${activity.learnerActivity || 'Student activities will be defined here'}</p><p><strong>Materials:</strong> ${activity.materials || 'Required materials will be listed here'}</p>`
          }))
        ],
        "post-assessment": [
          {
            type: "heading",
            content: "Check Your Understanding"
          },
          {
            type: "text",
            content: formData.postAssessment || "Let's verify that you've achieved the learning objectives."
          }
        ],
        summary: [
          {
            type: "heading",
            content: "Key Takeaways"
          },
          {
            type: "text",
            content: formData.summary || "Summary of key learning points and next steps."
          }
        ],
        resources: [
          {
            type: "heading",
            content: "Required Materials"
          },
          {
            type: "text",
            content: formData.materialsRequired || "List of all required materials and resources."
          },
          {
            type: "heading",
            content: "Additional Notes"
          },
          {
            type: "text",
            content: formData.additionalNotes || "Additional considerations and notes for this lesson."
          }
        ]
      }
    };

    setGeneratedJson(JSON.stringify(jsonStructure, null, 2));
    setShowJson(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const downloadPrompt = () => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.lessonTopic || 'lesson'}-ai-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.lessonTopic || 'lesson'}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadJsonToTemplate = () => {
    if (generatedJson && onLoadTemplate) {
      try {
        const jsonData = JSON.parse(generatedJson);
        onLoadTemplate(jsonData);
      } catch (error) {
        alert('Error parsing JSON. Please check the format.');
      }
    }
  };

  const saveFormData = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.lessonTopic || 'lesson'}-form-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFormData = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setFormData(data);
        } catch (error) {
          alert('Error loading file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetForm = () => {
    setFormData({
      lessonTopic: '',
      courseName: '',
      duration: '75',
      targetAudience: '',
      prerequisiteKnowledge: '',
      materialsRequired: '',
      bridgeIn: '',
      objectives: '',
      preAssessment: '',
      mainActivities: [
        { duration: '15', facilitatorActivity: '', learnerActivity: '', materials: '' }
      ],
      postAssessment: '',
      summary: '',
      reflections: '',
      additionalNotes: ''
    });
    setGeneratedPrompt('');
    setGeneratedJson('');
    setShowPrompt(false);
    setShowJson(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              BOPPPS Lesson Plan AI Prompt Generator
            </h1>
            <p className="text-gray-600">
              Fill out the form below to generate AI prompts and JSON templates for your lesson planning
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveFormData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Form
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Upload className="mr-2 h-4 w-4" />
              Load Form
            </button>
            <button
              onClick={resetForm}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={loadFormData}
            className="hidden"
          />
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Basic Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Topic *
                </label>
                <input
                  type="text"
                  value={formData.lessonTopic}
                  onChange={(e) => updateFormData('lessonTopic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Introduction to Data Structures"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => updateFormData('courseName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Computer Science 101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="15"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => updateFormData('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., First-year computer science students"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisite Knowledge
              </label>
              <EnhancedRichTextEditor
                content={formData.prerequisiteKnowledge}
                onChange={(value) => updateFormData('prerequisiteKnowledge', value)}
                placeholder="What should students know before this lesson?"
              />
            </div>
          </section>

          {/* BOPPPS Structure */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              BOPPPS Framework
            </h2>

            {/* Bridge-In */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600 font-semibold">B</span>ridge-In (Opening Activity)
              </label>
              <EnhancedRichTextEditor
                content={formData.bridgeIn}
                onChange={(value) => updateFormData('bridgeIn', value)}
                placeholder="How will you capture attention and connect to prior knowledge?"
              />
            </div>

            {/* Objectives */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600 font-semibold">O</span>bjectives (Learning Outcomes)
              </label>
              <EnhancedRichTextEditor
                content={formData.objectives}
                onChange={(value) => updateFormData('objectives', value)}
                placeholder="What will students be able to do after this lesson? Use action verbs."
              />
            </div>

            {/* Pre-Assessment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600 font-semibold">P</span>re-Assessment
              </label>
              <EnhancedRichTextEditor
                content={formData.preAssessment}
                onChange={(value) => updateFormData('preAssessment', value)}
                placeholder="How will you assess what students already know?"
              />
            </div>

            {/* Main Activities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="text-blue-600 font-semibold">P</span>resentation/Practice/Participation (Main Activities)
                </label>
                <button
                  onClick={addActivity}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Activity
                </button>
              </div>

              {formData.mainActivities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Activity {index + 1}</h4>
                    {formData.mainActivities.length > 1 && (
                      <button
                        onClick={() => removeActivity(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={activity.duration}
                        onChange={(e) => updateActivity(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="5"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facilitator Activity
                      </label>
                      <EnhancedRichTextEditor
                        content={activity.facilitatorActivity}
                        onChange={(value) => updateActivity(index, 'facilitatorActivity', value)}
                        placeholder="What will the instructor do during this time?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learner Activity
                      </label>
                      <EnhancedRichTextEditor
                        content={activity.learnerActivity}
                        onChange={(value) => updateActivity(index, 'learnerActivity', value)}
                        placeholder="What will students do? How will they participate?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials Required
                      </label>
                      <EnhancedRichTextEditor
                        content={activity.materials}
                        onChange={(value) => updateActivity(index, 'materials', value)}
                        placeholder="What materials, tools, or technology are needed?"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Post-Assessment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600 font-semibold">P</span>ost-Assessment
              </label>
              <EnhancedRichTextEditor
                content={formData.postAssessment}
                onChange={(value) => updateFormData('postAssessment', value)}
                placeholder="How will you verify that learning objectives were met?"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-blue-600 font-semibold">S</span>ummary & Next Steps
              </label>
              <EnhancedRichTextEditor
                content={formData.summary}
                onChange={(value) => updateFormData('summary', value)}
                placeholder="How will you summarize key points and preview what's next?"
              />
            </div>
          </section>

          {/* Additional Information */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Additional Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Required (Overall)
              </label>
              <EnhancedRichTextEditor
                content={formData.materialsRequired}
                onChange={(value) => updateFormData('materialsRequired', value)}
                placeholder="List all materials, technology, and resources needed for the entire lesson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reflections on the Lesson
              </label>
              <EnhancedRichTextEditor
                content={formData.reflections}
                onChange={(value) => updateFormData('reflections', value)}
                placeholder="Reflection questions for both instructor and students"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <EnhancedRichTextEditor
                content={formData.additionalNotes}
                onChange={(value) => updateFormData('additionalNotes', value)}
                placeholder="Any special considerations, accommodations, or additional notes"
              />
            </div>
          </section>

          {/* Generate Buttons */}
          <section className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={generateAIPrompt}
              className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Generate AI Prompt
            </button>
            <button
              onClick={generateJsonStructure}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FileText className="mr-2 h-5 w-5" />
              Generate JSON Template
            </button>
          </section>
        </div>

        {/* Generated Prompt */}
        {showPrompt && generatedPrompt && (
          <section className="mt-8 p-6 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-purple-800">Generated AI Prompt</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedPrompt)}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={downloadPrompt}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedPrompt}</pre>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>How to use:</strong> Copy this prompt and paste it into Claude AI, ChatGPT, or your preferred AI assistant.
                  The AI will generate detailed lesson content in the requested JSON format that you can then load into the Lesson Template.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Generated JSON */}
        {showJson && generatedJson && (
          <section className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-blue-800">Generated JSON Template</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedJson)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </button>
                {onLoadTemplate && (
                  <button
                    onClick={loadJsonToTemplate}
                    className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Upload className="mr-1 h-4 w-4" />
                    Load to Template
                  </button>
                )}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedJson}</pre>
            </div>
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <strong>Template Ready:</strong> This JSON structure is pre-populated with your form data and ready to be enhanced by AI.
                  You can download it, modify it, or load it directly into the Lesson Template.
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BopppsPromptGenerator;