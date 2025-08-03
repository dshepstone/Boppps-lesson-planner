# BOPPPS Lesson Template System with AI Prompt Generator

A comprehensive React application for creating professional educational content using the BOPPPS (Bridge-in, Outcomes, Pre-assessment, Participatory learning, Post-assessment, Summary) methodology, now featuring an AI prompt generator for streamlined lesson planning.

## 🆕 New Features

### 🤖 AI Prompt Generator
- **Structured Input Forms**: Comprehensive form for all BOPPPS components
- **Rich Text Editing**: TipTap editor integration for detailed content creation
- **AI Prompt Generation**: Creates detailed prompts for Claude AI, ChatGPT, and other AI platforms
- **JSON Template Generation**: Produces ready-to-load lesson templates
- **Save/Load Form Data**: Preserve your planning inputs for future use

### 🗂️ Tab Navigation System
- **Dual Interface**: Switch between AI Prompt Generator and Lesson Template
- **Seamless Integration**: Direct loading of AI-generated content into the lesson template
- **Persistent State**: Maintains your work across tab switches

## 📋 Features Overview

### 🎯 Educational Framework
- Complete BOPPPS methodology implementation
- Structured learning content organization
- Professional academic presentation
- AI-assisted lesson planning workflow

### 🛠️ Content Management
- **Rich Text Editor** with HTML mode toggle
- **Multiple Content Types**: Text, headings, lists, info boxes, exercise boxes, warning boxes
- **Media Support**: Videos (YouTube, Vimeo, Panopto), images, galleries, audio
- **Interactive Elements**: Card layouts, drag-and-drop reordering
- **Real-time Editing** with visual feedback

### 🤖 AI Integration
- **Comprehensive Form Builder**: Input all lesson planning elements
- **Multiple Activities Support**: Define facilitator/learner activities with materials
- **Smart Prompt Generation**: Creates detailed AI prompts for lesson content creation
- **JSON Export/Import**: Direct integration with lesson template system
- **Form Data Persistence**: Save and reload your planning inputs

### 💼 Professional Features
- **Export Options**: PDF and locked HTML versions
- **Save/Load**: JSON format for content persistence
- **Auto-save**: Automatic backup of your work
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Print Optimization**: Clean printing layouts

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lecture-template-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
lecture-template-system/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── MainApp.js              # Main application with tab navigation
│   ├── TabNavigation.js        # Tab navigation component
│   ├── BopppsPromptGenerator.js # AI prompt generator interface
│   ├── LessonTemplate.js       # Lesson template editor (updated App.js)
│   ├── index.js                # React entry point (updated)
│   └── index.css               # Global styles with Tailwind
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 📖 Usage Guide

### 1. AI Prompt Generator Tab

#### Getting Started
1. **Navigate to AI Prompt Generator**: Click the "AI Prompt Generator" tab
2. **Fill Basic Information**: 
   - Lesson Topic (required)
   - Course Name
   - Duration in minutes
   - Target Audience
   - Prerequisite Knowledge

#### BOPPPS Framework Input
3. **Bridge-In**: Describe your opening activity to engage students
4. **Objectives**: Define clear, measurable learning outcomes
5. **Pre-Assessment**: Plan activities to assess prior knowledge
6. **Main Activities**: 
   - Add multiple activities with the "+ Add Activity" button
   - Define duration, facilitator activities, learner activities, and materials for each
   - Remove activities with the trash icon
7. **Post-Assessment**: Plan verification of learning achievement
8. **Summary**: Outline key takeaways and next steps

#### Additional Planning
9. **Materials Required**: List all necessary resources
10. **Reflections**: Add reflection questions and notes
11. **Additional Notes**: Include special considerations

#### Generating Content
12. **Generate AI Prompt**: Creates a comprehensive prompt for AI platforms
13. **Generate JSON Template**: Creates a pre-populated lesson structure
14. **Save/Load Forms**: Preserve your planning work
15. **Copy/Download**: Export prompts and templates

### 2. Lesson Template Tab

#### Working with AI-Generated Content
1. **Direct Loading**: Use "Load to Template" button from generated JSON
2. **Manual Import**: Use "Load JSON" in the lesson template
3. **Edit and Enhance**: Modify AI-generated content using the rich text editor

#### Traditional Workflow
1. **Toggle Edit Mode**: Click "Edit Mode" to start creating content
2. **Add Content**: Use the + buttons or control panel to add different content types
3. **Edit Content**: Click the edit icon (✏️) on any content block
4. **Save Work**: Export as JSON or rely on auto-save functionality

## 🤖 AI Integration Workflow

### Step 1: Plan Your Lesson
Use the AI Prompt Generator to thoroughly plan your lesson:
- Input all basic information and learning objectives
- Define multiple activities with specific roles and materials
- Add assessment strategies and reflection components

### Step 2: Generate AI Content
1. **Generate AI Prompt**: Click "Generate AI Prompt" to create a comprehensive prompt
2. **Copy to AI Platform**: Copy the prompt to Claude AI, ChatGPT, or your preferred AI
3. **Request JSON Output**: Ask the AI to provide the response in the specified JSON format

### Step 3: Import and Refine
1. **Load Generated Content**: Import the AI-generated JSON into the Lesson Template
2. **Review and Edit**: Use the rich text editor to refine and customize content
3. **Add Media and Interactivity**: Enhance with videos, images, and interactive elements

### Step 4: Finalize and Export
1. **Preview**: Use Preview mode to see the final presentation
2. **Export**: Save as JSON for future editing or export as PDF/HTML for distribution

## 🎯 AI Prompt Best Practices

### Effective Prompt Generation
- **Be Specific**: Provide detailed information in all form fields
- **Define Clear Objectives**: Use action verbs for learning outcomes
- **Plan Multiple Activities**: Include various engagement strategies
- **Consider Your Audience**: Tailor activities to student needs and level

### Working with AI Responses
- **Review Thoroughly**: AI-generated content should be reviewed and customized
- **Add Personal Touch**: Include your teaching style and specific examples
- **Verify Accuracy**: Ensure all content is factually correct and appropriate
- **Enhance with Media**: Add relevant videos, images, and interactive elements

## 🔧 Technical Features

### Rich Text Editor Capabilities
- **Formatting**: Bold, italic, underline, colors, highlights
- **Structure**: Headings, lists, tables, text alignment
- **Links**: Hyperlinks with automatic styling
- **HTML Mode**: Direct HTML editing when needed
- **Responsive**: Works on all device sizes

### Auto-Save System
- **Automatic Backup**: Saves work every 2 seconds
- **Recovery Option**: Prompts to recover unsaved changes
- **Timestamps**: Shows last save time
- **Cross-Tab Persistence**: Maintains state across navigation

### Export/Import Options
- **JSON Format**: Complete lesson data preservation
- **Form Data**: Save and reload planning inputs
- **AI Prompts**: Export prompts as text files
- **Template Loading**: Direct import into lesson editor

## 🎨 Content Types Supported

### Text Elements
- **Rich Text Blocks**: Full formatting capabilities
- **Headings**: Multiple levels with automatic styling
- **Lists**: Bulleted and numbered lists
- **Info Boxes**: Highlighted information sections
- **Warning Boxes**: Important notices and alerts

### Media Elements
- **Videos**: YouTube, Vimeo, Panopto integration
- **Images**: Upload and URL-based images
- **Audio**: Embedded audio players
- **Galleries**: Multiple image displays

### Interactive Elements
- **Exercise Boxes**: Structured activity sections
- **Tables**: Sortable and formatted data
- **Card Layouts**: Flexible content organization
- **Drag and Drop**: Reorderable content blocks

## 🔒 Data Management

### Local Storage
- **Auto-Save**: Automatic local backup every 2 seconds
- **Form Persistence**: Save planning inputs between sessions
- **Recovery System**: Restore unsaved changes on reload

### Export Options
- **JSON Format**: Complete lesson data with metadata
- **Text Files**: AI prompts for external use
- **Cross-Platform**: Compatible with various AI platforms

## 🆘 Troubleshooting

### Common Issues

**AI Prompt Not Generating**
- Ensure required fields (Lesson Topic) are filled
- Check that at least one activity is defined
- Verify rich text fields have content

**JSON Import Fails**
- Validate JSON format using online validators
- Ensure the JSON matches the expected structure
- Check for special characters or encoding issues

**Content Not Saving**
- Check browser local storage permissions
- Ensure stable internet connection for cloud features
- Try refreshing the page and recovering auto-saved data

**Rich Text Editor Issues**
- Clear browser cache and reload
- Ensure JavaScript is enabled
- Try switching between Visual and HTML modes

### Getting Help
- Check the browser console for error messages
- Verify all dependencies are properly installed
- Review the project structure for missing files

## 🔮 Future Enhancements

### Planned Features
- **Advanced AI Integration**: Direct API connections to AI services
- **Collaboration Tools**: Real-time multi-user editing
- **Template Library**: Pre-built lesson templates
- **Assessment Builder**: Integrated quiz and test creation
- **Analytics Dashboard**: Lesson effectiveness tracking

### Customization Options
- **Themes**: Multiple visual themes and color schemes
- **Institution Branding**: Custom logos and styling
- **Content Templates**: Reusable content blocks
- **Advanced Exports**: PowerPoint and Google Slides integration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please open an issue in the project repository.

---

**Happy Teaching!** 🎓