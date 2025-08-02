import React, { useState } from 'react';
import { Upload, Eye, Download, Trash2, Save, AlertTriangle, Settings, Image, FileText, X } from 'lucide-react';
import { useLogo } from './LogoContext';

const SchoolLogoSettings = ({ onClose }) => {
  const { 
    logo, 
    logoName, 
    logoSize, 
    saveStatus, 
    saveLogo, 
    removeLogo, 
    getLogoHtml 
  } = useLogo();

  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tempLogo, setTempLogo] = useState(null);
  const [tempLogoName, setTempLogoName] = useState('');
  const [tempLogoSize, setTempLogoSize] = useState(0);

  const handleFileUpload = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Logo = e.target.result;
      setTempLogo(base64Logo);
      setTempLogoName(file.name);
      setTempLogoSize(file.size);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const handleSave = () => {
    if (!tempLogo) {
      alert('Please select a logo first');
      return;
    }

    const success = saveLogo(tempLogo, tempLogoName, tempLogoSize);
    if (success) {
      setTempLogo(null);
      setTempLogoName('');
      setTempLogoSize(0);
    } else {
      alert('Error saving logo. Please try again.');
    }
  };

  const handleRemove = () => {
    if (window.confirm('Are you sure you want to remove the school logo?')) {
      removeLogo();
      setTempLogo(null);
      setTempLogoName('');
      setTempLogoSize(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Sample HTML export preview
  const getExportPreview = () => {
    const currentDate = new Date().toLocaleDateString('en-CA');
    const currentTime = new Date().toLocaleTimeString('en-CA');
    const logoToUse = tempLogo || logo;
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Lecture Template Preview</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f8fafc; }
    .header { text-align: center; margin-bottom: 30px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .logo { max-height: 80px; margin-bottom: 10px; }
    .course-title { color: #1e40af; margin: 10px 0; font-size: 28px; font-weight: bold; }
    .meta { color: #666; font-size: 14px; margin: 5px 0; }
    .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; }
    .section-title { color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 15px; }
  </style>
</head>
<body>
  <div class="header">
    ${logoToUse ? `<img src="${logoToUse}" alt="School Logo" class="logo" />` : ''}
    <h1 class="course-title">📚 Course Topic - Week 1</h1>
    <div class="meta">
      Instructor: Your Name | email@institution.edu<br>
      Generated: ${currentDate} | ${currentTime}
    </div>
  </div>
  
  <div class="content">
    <h2 class="section-title">Session Overview</h2>
    <p>Welcome to this week's lesson. This session covers the main learning objectives and key concepts that students will explore and master.</p>
  </div>
</body>
</html>`;
  };

  const displayLogo = tempLogo || logo;
  const displayName = tempLogoName || logoName;
  const displaySize = tempLogoSize || logoSize;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-auto w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-slate-600" />
            <h2 className="text-xl font-semibold text-gray-900">School Logo Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Upload your school or institution logo to be included in all HTML exports and PDF documents.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Logo
              </h3>

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-slate-500 bg-slate-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
              >
                <Image className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your logo here, or{' '}
                  <label className="text-slate-600 hover:text-slate-700 cursor-pointer font-medium">
                    browse files
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supported: PNG, JPG, SVG, GIF (Max 5MB)
                </p>
              </div>

              {/* File Info */}
              {displayLogo && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">{displayName}</p>
                      <p className="text-sm text-green-700">Size: {formatFileSize(displaySize)}</p>
                    </div>
                    <div className="flex gap-2">
                      {tempLogo && (
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                          Save
                        </button>
                      )}
                      <button
                        onClick={handleRemove}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Status */}
              {saveStatus && (
                <div className={`p-3 rounded-lg ${
                  saveStatus === 'saved' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {saveStatus === 'saved' 
                    ? '✅ Logo saved successfully! It will now appear in all exports.' 
                    : '🗑️ Logo removed successfully.'}
                </div>
              )}

              {/* Guidelines */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-amber-900 mb-2">Logo Guidelines</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Use high-resolution images for best quality</li>
                      <li>• Recommended size: 200-400px wide</li>
                      <li>• PNG format with transparent background works best</li>
                      <li>• Logo will be automatically resized to fit exports</li>
                      <li>• Stored in session only - will be cleared on restart</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Logo Preview
              </h3>

              {displayLogo ? (
                <div className="space-y-4">
                  {/* Current Logo Display */}
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <img 
                      src={displayLogo} 
                      alt="School Logo" 
                      className="max-h-20 max-w-full mx-auto object-contain"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      {tempLogo ? 'Preview (not saved)' : 'Current Logo'}
                    </p>
                  </div>

                  {/* Export Preview Button */}
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                  >
                    <FileText className="h-4 w-4" />
                    {showPreview ? 'Hide' : 'Show'} Export Preview
                  </button>

                  {/* Integration Status */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-2">Integration Status</h4>
                    <div className="space-y-2 text-sm text-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        HTML Lecture Exports
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        PDF Exports
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        Print Documents
                      </div>
                    </div>
                  </div>

                  {/* Download Sample */}
                  <button
                    onClick={() => {
                      const htmlContent = getExportPreview();
                      const blob = new Blob([htmlContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'sample_lecture_with_logo.html';
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    Download Sample
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No logo uploaded</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload a logo to see the preview
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Export Preview Modal */}
          {showPreview && displayLogo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Export Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div 
                    className="border border-gray-300 rounded-lg overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: getExportPreview() }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolLogoSettings;