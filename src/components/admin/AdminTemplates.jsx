import React, { useState, useEffect, useRef } from 'react';
import { BASE_URL } from '../../config';

const FONT_OPTIONS = [
  { id: 'Pinyon Script', label: 'Calligraphy (Pinyon Script)', family: "'Pinyon Script', cursive", defaultSize: 42 },
  { id: 'Great Vibes', label: 'Royal Cursive (Great Vibes)', family: "'Great Vibes', cursive", defaultSize: 40 },
  { id: 'Cinzel', label: 'Formal Roman (Cinzel)', family: "'Cinzel', serif", defaultSize: 32 },
  { id: 'Playfair Display', label: 'Classic Serif (Playfair Display)', family: "'Playfair Display', serif", defaultSize: 34 },
  { id: 'Inter', label: 'Clean Modern (Inter Sans)', family: "'Inter', sans-serif", defaultSize: 30 }
];

const AdminTemplates = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testStudentName, setTestStudentName] = useState('Sundram Shukla');
  const [toastMessage, setToastMessage] = useState('');

  // Config state
  const [config, setConfig] = useState({
    bgImageBase64: '',
    // Name configuration
    namePositionX: 50, // %
    namePositionY: 50, // %
    nameFontSize: 40,  // px
    nameFontFamily: 'Pinyon Script',
    nameColor: '#1e293b',
    nameFontWeight: 'bold',
    nameUnderline: false,
    nameLetterSpacing: '0px',
    
    // Optional Date
    showDate: false,
    datePositionX: 25,
    datePositionY: 80,
    dateFontSize: 13,
    dateColor: '#475569',
    
    // Optional Cert ID
    showCertId: false,
    certIdPositionX: 75,
    certIdPositionY: 80,
    certIdFontSize: 13,
    certIdColor: '#475569',
    
    // Optional Course Title
    showCourseTitle: false,
    courseTitlePositionX: 50,
    courseTitlePositionY: 62,
    courseTitleFontSize: 18,
    courseTitleColor: '#047857'
  });

  const previewRef = useRef(null);
  const isDraggingName = useRef(false);

  // Fetch list of courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
        const data = await res.json();
        if (data.success && data.data) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setSelectedCourseId(data.data[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  // Load configuration for selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    const cached = localStorage.getItem(`certificate_template_${selectedCourseId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setConfig(prev => ({
          ...prev,
          ...parsed,
          namePositionX: parsed.namePositionX ?? 50,
          namePositionY: parsed.namePositionY ?? 50,
          nameFontSize: parsed.nameFontSize ?? 40,
          nameFontFamily: parsed.nameFontFamily || 'Pinyon Script',
          nameColor: parsed.nameColor || '#1e293b',
          nameFontWeight: parsed.nameFontWeight || 'bold',
          nameUnderline: parsed.nameUnderline || false,
          bgImageBase64: parsed.bgImageBase64 || ''
        }));
      } catch (e) {
        console.error("Failed to parse cached config", e);
      }
    } else {
      // Default reset
      setConfig({
        bgImageBase64: '',
        namePositionX: 50,
        namePositionY: 50,
        nameFontSize: 40,
        nameFontFamily: 'Pinyon Script',
        nameColor: '#1e293b',
        nameFontWeight: 'bold',
        nameUnderline: false,
        nameLetterSpacing: '0px',
        showDate: false,
        datePositionX: 25,
        datePositionY: 80,
        dateFontSize: 13,
        dateColor: '#475569',
        showCertId: false,
        certIdPositionX: 75,
        certIdPositionY: 80,
        certIdFontSize: 13,
        certIdColor: '#475569',
        showCourseTitle: false,
        courseTitlePositionX: 50,
        courseTitlePositionY: 62,
        courseTitleFontSize: 18,
        courseTitleColor: '#047857'
      });
    }
  }, [selectedCourseId]);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Image Upload Handler
  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file (PNG, JPG, JPEG, WEBP)");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, bgImageBase64: reader.result }));
        showNotification("Certificate template uploaded! Drag or adjust the student name position.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setConfig(prev => ({ ...prev, bgImageBase64: '' }));
    showNotification("Template image removed.");
  };

  // Save template configuration
  const handleSaveTemplate = () => {
    if (!selectedCourseId) {
      alert("Please select a target course first!");
      return;
    }
    setIsLoading(true);
    try {
      localStorage.setItem(`certificate_template_${selectedCourseId}`, JSON.stringify(config));
      showNotification("✅ Certificate Template saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save template configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply to all courses
  const handleApplyToAllCourses = () => {
    if (courses.length === 0) return;
    if (window.confirm("Do you want to apply this certificate template to ALL courses?")) {
      courses.forEach(c => {
        localStorage.setItem(`certificate_template_${c.id}`, JSON.stringify(config));
      });
      // also save default
      localStorage.setItem('certificate_template_default', JSON.stringify(config));
      showNotification("✅ Template copied to all courses successfully!");
    }
  };

  // Dragging support on preview
  const handlePreviewMouseDown = (e) => {
    if (!previewRef.current) return;
    isDraggingName.current = true;
    updatePositionFromPointer(e.clientX, e.clientY);
  };

  const handlePreviewMouseMove = (e) => {
    if (!isDraggingName.current) return;
    updatePositionFromPointer(e.clientX, e.clientY);
  };

  const handlePreviewMouseUp = () => {
    isDraggingName.current = false;
  };

  const updatePositionFromPointer = (clientX, clientY) => {
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.round(Math.max(5, Math.min(95, rawX)));
    const clampedY = Math.round(Math.max(5, Math.min(95, rawY)));
    
    setConfig(prev => ({
      ...prev,
      namePositionX: clampedX,
      namePositionY: clampedY
    }));
  };

  const currentCourse = courses.find(c => c.id.toString() === selectedCourseId);

  return (
    <div className="p-4 md:p-6 text-left space-y-6">
      {/* Google Fonts import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Great+Vibes&family=Inter:wght@400;600;700;800&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📜</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">Certificate Template Manager</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Upload your official pre-designed certificate template. The student's name will be dynamically printed in place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleApplyToAllCourses}
            type="button"
            className="px-4 py-2.5 rounded-xl border border-purple-200 text-[#7c3aed] bg-purple-50 hover:bg-purple-100 font-semibold text-xs transition-colors flex items-center gap-1.5"
            title="Apply this certificate background and name style to all existing courses"
          >
            <span>📋</span> Copy to All Courses
          </button>
          <button
            onClick={handleSaveTemplate}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span>💾</span> {isLoading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-500 text-white font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-sm animate-fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-white hover:text-emerald-100 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Controls Form */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Target Course Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <label className="block text-sm font-bold text-slate-700">Target Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full border-2 border-slate-200 p-3 rounded-xl font-semibold text-slate-700 focus:border-[#7c3aed] focus:outline-none bg-slate-50 text-sm"
            >
              {courses.length === 0 ? (
                <option value="">Loading courses...</option>
              ) : (
                courses.map(c => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.title}
                  </option>
                ))
              )}
            </select>
            <p className="text-xs text-slate-400">Each course can have its own certificate background or share one.</p>
          </div>

          {/* Template Image Upload Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">Certificate Template Image</label>
              {config.bgImageBase64 && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Template Uploaded
                </span>
              )}
            </div>

            <div className="border-2 border-dashed border-slate-300 hover:border-purple-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="templateUploadInput"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="templateUploadInput"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl shadow-inner">
                  🖼️
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {config.bgImageBase64 ? 'Replace Certificate Image' : 'Upload Designed Certificate Template'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WEBP (Recommended A4 Landscape)</p>
                </div>
                <span className="mt-1 px-4 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-purple-700 hover:bg-purple-50 shadow-sm">
                  Choose File
                </span>
              </label>
            </div>

            {config.bgImageBase64 && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full text-xs text-rose-500 font-bold hover:text-rose-700 p-2 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
              >
                <span>🗑️</span> Remove Uploaded Image (Use Default Blank Template)
              </button>
            )}
          </div>

          {/* Student Name Appearance & Position Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>✍️</span> Student Name Styling & Position
              </h3>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                Interactive
              </span>
            </div>

            {/* Test Student Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Preview Student Name</label>
              <input
                type="text"
                value={testStudentName}
                onChange={(e) => setTestStudentName(e.target.value)}
                placeholder="Enter sample name to preview..."
                className="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-semibold text-slate-800 focus:border-[#7c3aed] focus:outline-none"
              />
            </div>

            {/* Font Family Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Font Family</label>
              <select
                value={config.nameFontFamily}
                onChange={(e) => {
                  const opt = FONT_OPTIONS.find(f => f.id === e.target.value);
                  setConfig(prev => ({
                    ...prev,
                    nameFontFamily: e.target.value,
                    nameFontSize: opt ? opt.defaultSize : prev.nameFontSize
                  }));
                }}
                className="w-full border border-slate-200 p-2.5 rounded-lg text-sm font-semibold text-slate-700 focus:border-[#7c3aed] focus:outline-none bg-white"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Font Size</label>
                  <span className="text-xs font-bold text-purple-600">{config.nameFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="64"
                  value={config.nameFontSize}
                  onChange={(e) => setConfig({ ...config, nameFontSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-[#7c3aed] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.nameColor}
                    onChange={(e) => setConfig({ ...config, nameColor: e.target.value })}
                    className="w-10 h-8 rounded border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.nameColor}
                    onChange={(e) => setConfig({ ...config, nameColor: e.target.value })}
                    className="w-full border border-slate-200 p-1.5 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Vertical Position Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">Vertical Position (Top to Bottom)</label>
                <span className="text-xs font-bold text-purple-600">{config.namePositionY}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={config.namePositionY}
                onChange={(e) => setConfig({ ...config, namePositionY: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Top (10%)</span>
                <span>Center (50%)</span>
                <span>Bottom (90%)</span>
              </div>
            </div>

            {/* Horizontal Position Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-600">Horizontal Alignment (Left to Right)</label>
                <span className="text-xs font-bold text-purple-600">{config.namePositionX}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={config.namePositionX}
                onChange={(e) => setConfig({ ...config, namePositionX: parseInt(e.target.value, 10) })}
                className="w-full accent-[#7c3aed] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Left (10%)</span>
                <span>Center (50%)</span>
                <span>Right (90%)</span>
              </div>
            </div>

            {/* Style Toggles */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, nameFontWeight: prev.nameFontWeight === 'bold' ? 'normal' : 'bold' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  config.nameFontWeight === 'bold'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bold
              </button>

              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, nameUnderline: !prev.nameUnderline }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  config.nameUnderline
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Underline
              </button>

              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, namePositionX: 50, namePositionY: 50 }))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors ml-auto"
                title="Reset name position to center"
              >
                Reset Position
              </button>
            </div>
          </div>

          {/* Optional Extra Dynamic Fields Accordion */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Optional Dynamic Fields</h4>
            
            {/* Show Date Toggle */}
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showDate}
                    onChange={(e) => setConfig({ ...config, showDate: e.target.checked })}
                    className="accent-[#7c3aed] w-4 h-4 rounded cursor-pointer"
                  />
                  Print Issue Date
                </label>
                {config.showDate && <span className="text-[10px] text-purple-600 font-bold">Y: {config.datePositionY}%</span>}
              </div>

              {config.showDate && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Date Top Position (%)</label>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={config.datePositionY}
                      onChange={(e) => setConfig({ ...config, datePositionY: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Date Left Position (%)</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={config.datePositionX}
                      onChange={(e) => setConfig({ ...config, datePositionX: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Show Certificate ID Toggle */}
            <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showCertId}
                    onChange={(e) => setConfig({ ...config, showCertId: e.target.checked })}
                    className="accent-[#7c3aed] w-4 h-4 rounded cursor-pointer"
                  />
                  Print Certificate / Roll No.
                </label>
                {config.showCertId && <span className="text-[10px] text-purple-600 font-bold">Y: {config.certIdPositionY}%</span>}
              </div>

              {config.showCertId && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Cert ID Top Position (%)</label>
                    <input
                      type="range"
                      min="10"
                      max="95"
                      value={config.certIdPositionY}
                      onChange={(e) => setConfig({ ...config, certIdPositionY: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Cert ID Left Position (%)</label>
                    <input
                      type="range"
                      min="5"
                      max="95"
                      value={config.certIdPositionX}
                      onChange={(e) => setConfig({ ...config, certIdPositionX: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Live Preview Canvas */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>👁️</span> Real-Time Certificate Preview
              </h3>
              <p className="text-xs text-slate-400">Drag or click on the template below to reposition the student's name.</p>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 self-start">
              X: {config.namePositionX}% | Y: {config.namePositionY}%
            </div>
          </div>

          {/* Certificate Canvas Area */}
          <div
            ref={previewRef}
            onMouseDown={handlePreviewMouseDown}
            onMouseMove={handlePreviewMouseMove}
            onMouseUp={handlePreviewMouseUp}
            className="relative w-full aspect-[4/3] md:aspect-[1.414/1] rounded-xl overflow-hidden border-2 border-slate-300 shadow-lg cursor-crosshair select-none bg-slate-100 flex items-center justify-center"
            style={{
              backgroundImage: config.bgImageBase64 ? `url(${config.bgImageBase64})` : 'none',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* If no image uploaded, show sample border & watermark */}
            {!config.bgImageBase64 && (
              <div className="absolute inset-0 p-6 flex flex-col justify-between border-8 border-amber-400 bg-amber-50/20 text-center pointer-events-none">
                <div className="border-2 border-dashed border-slate-400 p-4 rounded h-full flex flex-col justify-between">
                  <div>
                    <div className="text-3xl mb-1">⚜️</div>
                    <h2 className="text-lg md:text-xl font-bold font-serif text-slate-800 tracking-wider">
                      THE BHARAT SCOUTS & GUIDES
                    </h2>
                    <p className="text-[10px] md:text-xs font-bold text-amber-700 uppercase tracking-widest">
                      Uttar Pradesh State Headquarters
                    </p>
                    <p className="text-[10px] italic text-slate-500 mt-2">
                      (Upload your template on the left to replace this background)
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Official Training & Examination Certificate
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Student Name */}
            <div
              style={{
                position: 'absolute',
                left: `${config.namePositionX}%`,
                top: `${config.namePositionY}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: config.nameFontFamily,
                fontSize: `${config.nameFontSize}px`,
                color: config.nameColor,
                fontWeight: config.nameFontWeight,
                textDecoration: config.nameUnderline ? 'underline' : 'none',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 10
              }}
              className="drop-shadow-sm transition-transform"
            >
              {testStudentName || 'Student Name'}
            </div>

            {/* Optional Date */}
            {config.showDate && (
              <div
                style={{
                  position: 'absolute',
                  left: `${config.datePositionX}%`,
                  top: `${config.datePositionY}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${config.dateFontSize}px`,
                  color: config.dateColor,
                  fontWeight: 600,
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              >
                Date: {new Date().toLocaleDateString('en-GB')}
              </div>
            )}

            {/* Optional Cert ID */}
            {config.showCertId && (
              <div
                style={{
                  position: 'absolute',
                  left: `${config.certIdPositionX}%`,
                  top: `${config.certIdPositionY}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${config.certIdFontSize}px`,
                  color: config.certIdColor,
                  fontWeight: 600,
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              >
                Certificate No: BSGUP-{selectedCourseId || '101'}-2026
              </div>
            )}

            {/* Optional Course Title */}
            {config.showCourseTitle && (
              <div
                style={{
                  position: 'absolute',
                  left: `${config.courseTitlePositionX}%`,
                  top: `${config.courseTitlePositionY}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${config.courseTitleFontSize}px`,
                  color: config.courseTitleColor,
                  fontWeight: 700,
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              >
                {currentCourse ? currentCourse.title : 'First Aid & Survival Skills'}
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-base">💡</span>
              <span>
                <strong>Tip:</strong> Click anywhere on the certificate preview above or use the sliders on the left to set the exact position for student names.
              </span>
            </div>
            <button
              onClick={handleSaveTemplate}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white font-bold hover:bg-[#6d28d9] shrink-0"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminTemplates;
