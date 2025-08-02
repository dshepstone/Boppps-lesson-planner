# Lecture Template System

A modern, interactive React application for creating professional educational content using the BOPPPS (Bridge-in, Outcomes, Pre-assessment, Participatory learning, Post-assessment, Summary) methodology.

## Features

### 🎯 Educational Framework
- Complete BOPPPS methodology implementation
- Structured learning content organization
- Professional academic presentation

### 🛠️ Content Management
- **Rich Text Editor** with HTML mode toggle
- **Multiple Content Types**: Text, headings, lists, info boxes, exercise boxes, warning boxes
- **Media Support**: Videos (YouTube, Vimeo, Panopto), images, galleries, audio
- **Interactive Elements**: Card layouts, drag-and-drop reordering
- **Real-time Editing** with visual feedback

### 💼 Professional Features
- **Export Options**: PDF and locked HTML versions
- **Save/Load**: JSON format for content persistence
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Print Optimization**: Clean printing layouts
- **Modern UI**: Professional color scheme and typography

### 🎨 Modern Interface
- Clean, professional design
- Smooth animations and transitions
- Intuitive drag-and-drop interface
- Contextual editing controls
- Real-time save indicators

## Quick Start

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

## Project Structure

```
lecture-template-system/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── App.js              # Main application component
│   ├── index.js            # React entry point
│   └── index.css           # Global styles with Tailwind
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md              # This file
```

## Usage

### Getting Started
1. **Toggle Edit Mode**: Click the settings icon (⚙️) to open the control panel
2. **Enable Editing**: Click "Edit Mode" to start creating content
3. **Add Content**: Use the + buttons or control panel to add different content types
4. **Edit Content**: Click the edit icon (✏️) on any content block
5. **Save Your Work**: Use "Save Content" to download your lecture as JSON

### Content Types

- **📝 Text**: Basic paragraphs and formatted text
- **📋 Lists**: Bulleted and numbered lists
- **ℹ️ Info Boxes**: Highlighted information sections
- **💡 Exercise Boxes**: Interactive learning activities
- **⚠️ Warning Boxes**: Important notes and cautions
- **🎥 Videos**: Embedded videos from multiple platforms
- **🖼️ Images**: Single images with captions and citations
- **🖼️ Galleries**: Multiple images in grid layouts
- **🎵 Audio**: Audio files with descriptions
- **🃏 Cards**: Organized information in card layouts

### BOPPPS Sections

1. **Bridge-In**: Connect to previous learning
2. **Learning Outcomes**: Define what students will achieve
3. **Pre-Assessment**: Gauge existing knowledge
4. **Participatory Learning**: Main content delivery
5. **Post-Assessment**: Verify learning objectives
6. **Summary**: Consolidate key takeaways

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (irreversible)

## Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files ready for deployment.

## Deployment

The built application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the build folder
- **GitHub Pages**: Use the built files
- **AWS S3**: Upload to S3 bucket with static hosting

## Technology Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Create React App** - Zero-configuration build setup

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Roadmap

- [ ] Advanced video annotations
- [ ] Collaborative editing
- [ ] Theme customization
- [ ] LMS integration (Canvas, Blackboard, Moodle)
- [ ] Advanced analytics
- [ ] Mobile app version

---

**Built with ❤️ for educators and learners everywhere.**