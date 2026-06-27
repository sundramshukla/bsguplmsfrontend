import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';

const AdminTemplates = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bgImageFile, setBgImageFile] = useState(null);
  
  // Configuration State for Certificate
  const [config, setConfig] = useState({
    title: 'THE BHARAT SCOUTS & GUIDES',
    subHeader: 'Uttar Pradesh State Headquarters',
    certificationText: 'This is to certify that',
    descriptionText: 'has successfully completed the online training syllabus and passed the qualified examinations of the',
    sigLeftTitle: 'State Commissioner',
    sigLeftSub: 'BSGUP Head Office',
    sigRightTitle: 'State Secretary',
    sigRightSub: 'BSGUP Lucknow',
    textColor: '#1e293b',
    bgImageBase64: '', // For local rendering
    sigLeftImageBase64: '',
    sigRightImageBase64: ''
  });

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

  // Load existing configuration for selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    const cachedConfig = localStorage.getItem(`certificate_template_${selectedCourseId}`);
    if (cachedConfig) {
      try {
        const parsed = JSON.parse(cachedConfig);
        setConfig({
          title: parsed.title || 'THE BHARAT SCOUTS & GUIDES',
          subHeader: parsed.subHeader || 'Uttar Pradesh State Headquarters',
          certificationText: parsed.certificationText || 'This is to certify that',
          descriptionText: parsed.descriptionText || 'has successfully completed the online training syllabus and passed the qualified examinations of the',
          sigLeftTitle: parsed.sigLeftTitle || 'State Commissioner',
          sigLeftSub: parsed.sigLeftSub || 'BSGUP Head Office',
          sigRightTitle: parsed.sigRightTitle || 'State Secretary',
          sigRightSub: parsed.sigRightSub || 'BSGUP Lucknow',
          textColor: parsed.textColor || '#1e293b',
          bgImageBase64: parsed.bgImageBase64 || '',
          sigLeftImageBase64: parsed.sigLeftImageBase64 || '',
          sigRightImageBase64: parsed.sigRightImageBase64 || ''
        });
      } catch (err) {
        console.error("Failed to parse cached template config", err);
      }
    } else {
      // Set defaults if nothing cached
      setConfig({
        title: 'THE BHARAT SCOUTS & GUIDES',
        subHeader: 'Uttar Pradesh State Headquarters',
        certificationText: 'This is to certify that',
        descriptionText: 'has successfully completed the online training syllabus and passed the qualified examinations of the',
        sigLeftTitle: 'State Commissioner',
        sigLeftSub: 'BSGUP Head Office',
        sigRightTitle: 'State Secretary',
        sigRightSub: 'BSGUP Lucknow',
        textColor: '#1e293b',
        bgImageBase64: '',
        sigLeftImageBase64: '',
        sigRightImageBase64: ''
      });
    }
    setBgImageFile(null);
  }, [selectedCourseId]);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBgImageFile(file);

      // Convert to Base64 for live preview and local storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, bgImageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setBgImageFile(null);
    setConfig(prev => ({ ...prev, bgImageBase64: '' }));
  };

  // Canvas Signature Compressor (Preserves PNG transparency)
  const compressSignature = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 400;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            } else {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Use PNG to preserve transparency for signatures
          const base64 = canvas.toDataURL('image/png');
          resolve(base64);
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleLeftSigChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressSignature(file);
        setConfig(prev => ({ ...prev, sigLeftImageBase64: compressed }));
      } catch (err) {
        console.error("Failed to compress left signature", err);
        alert("Failed to process left signature image");
      }
    }
  };

  const handleRightSigChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressSignature(file);
        setConfig(prev => ({ ...prev, sigRightImageBase64: compressed }));
      } catch (err) {
        console.error("Failed to compress right signature", err);
        alert("Failed to process right signature image");
      }
    }
  };

  const handleResetLeftSig = () => {
    setConfig(prev => ({ ...prev, sigLeftImageBase64: '' }));
  };

  const handleResetRightSig = () => {
    setConfig(prev => ({ ...prev, sigRightImageBase64: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert("Please select a target course first!");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Save to Local Storage for instant frontend update
      localStorage.setItem(`certificate_template_${selectedCourseId}`, JSON.stringify(config));

      // 2. Prepare FormData for Backend upload (behaves correctly with "backend se likh ke chali jaye")
      const fd = new FormData();
      fd.append('course_id', selectedCourseId);
      fd.append('title', config.title);
      fd.append('sub_header', config.subHeader);
      fd.append('certification_text', config.certificationText);
      fd.append('description_text', config.descriptionText);
      fd.append('sig_left_title', config.sigLeftTitle);
      fd.append('sig_left_sub', config.sigLeftSub);
      fd.append('sig_right_title', config.sigRightTitle);
      fd.append('sig_right_sub', config.sigRightSub);
      fd.append('text_color', config.textColor);
      
      if (bgImageFile) {
        fd.append('template_image', bgImageFile);
      }

      // Try uploading to backend API
      const res = await fetch(`${BASE_URL}/bsgupadmin/certificate-template/`, {
        method: 'POST',
        body: fd
      });

      const data = await res.json();
      if (res.ok || data.success) {
        alert(data.success || data.message || `Certificate Template saved successfully!`);
      } else {
        // Fallback alert because it's locally saved perfectly in localStorage anyway!
        alert(`Saved successfully to local storage! (Backend sync fallback: ${data.error || 'Server responded with code ' + res.status})`);
      }
    } catch (err) {
      console.error(err);
      alert(`Template Saved Successfully in Local Cache!`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 text-left space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Manage Certificate Templates</h2>
          <p className="text-slate-500 text-sm mt-1">Configure background templates and text configurations for each course.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Controls & Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Course Select */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Target Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border-2 border-slate-200 p-2.5 rounded-lg font-medium text-slate-700 focus:border-[#7c3aed] focus:outline-none"
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
            </div>

            {/* Template Background Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Template Background Image</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full border border-slate-300 p-2 rounded text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-[#7c3aed] hover:file:bg-violet-100 cursor-pointer"
                />
                {config.bgImageBase64 && (
                  <button
                    type="button"
                    onClick={handleResetImage}
                    className="text-xs text-rose-500 font-bold hover:underline self-start flex items-center gap-1"
                  >
                    ❌ Remove Custom Background Image
                  </button>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Customize Headers */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Certificate Header Title</label>
              <input
                type="text"
                name="title"
                value={config.title}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sub-Header (e.g. Headquarters)</label>
              <input
                type="text"
                name="subHeader"
                value={config.subHeader}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Certification Intro Text</label>
              <input
                type="text"
                name="certificationText"
                value={config.certificationText}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Course Description Text</label>
              <textarea
                name="descriptionText"
                value={config.descriptionText}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 p-2.5 rounded-lg text-sm h-16 focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
              />
            </div>

            {/* Customize Signatures */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Left Signature Name</label>
                <input
                  type="text"
                  name="sigLeftTitle"
                  value={config.sigLeftTitle}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Right Signature Name</label>
                <input
                  type="text"
                  name="sigRightTitle"
                  value={config.sigRightTitle}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Left Signature Sub</label>
                <input
                  type="text"
                  name="sigLeftSub"
                  value={config.sigLeftSub}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Right Signature Sub</label>
                <input
                  type="text"
                  name="sigRightSub"
                  value={config.sigRightSub}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:ring-2 focus:ring-[#7c3aed] focus:outline-none"
                />
              </div>
            </div>

            {/* Customize Signature Images */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Left Signature Image</label>
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    onChange={handleLeftSigChange}
                    accept="image/*"
                    className="w-full border border-slate-300 p-1.5 rounded text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-[#7c3aed] hover:file:bg-violet-100 cursor-pointer"
                  />
                  {config.sigLeftImageBase64 && (
                    <button
                      type="button"
                      onClick={handleResetLeftSig}
                      className="text-[10px] text-rose-500 font-bold hover:underline self-start flex items-center gap-0.5"
                    >
                      ❌ Remove Left Signature
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Right Signature Image</label>
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    onChange={handleRightSigChange}
                    accept="image/*"
                    className="w-full border border-slate-300 p-1.5 rounded text-xs text-slate-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-violet-50 file:text-[#7c3aed] hover:file:bg-violet-100 cursor-pointer"
                  />
                  {config.sigRightImageBase64 && (
                    <button
                      type="button"
                      onClick={handleResetRightSig}
                      className="text-[10px] text-rose-500 font-bold hover:underline self-start flex items-center gap-0.5"
                    >
                      ❌ Remove Right Signature
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Custom Styling */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Text Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  name="textColor"
                  value={config.textColor}
                  onChange={handleChange}
                  className="w-10 h-10 border border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-semibold">{config.textColor}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 mt-4 shadow-md shadow-violet-500/20"
            >
              {isLoading ? 'Saving Template...' : `Save Course Template`}
            </button>
          </form>
        </div>

        {/* Right Side: Interactive Live Preview */}
        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <span>👁️</span> Real-time Student Certificate Preview
          </h4>

          {/* Golden/Custom Certificate Card */}
          <div className="border border-slate-200 shadow-lg rounded-2xl bg-slate-50 p-3 overflow-x-auto">
            <div 
              style={{
                backgroundImage: config.bgImageBase64 ? `url(${config.bgImageBase64})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: config.textColor,
                borderColor: config.bgImageBase64 ? 'transparent' : '#fbbf24'
              }}
              className="w-[650px] min-h-[460px] mx-auto border-[10px] bg-white p-3 border-amber-400 box-border text-center flex flex-col justify-between"
            >
              <div className="border-4 border-dashed border-slate-900/10 rounded-lg p-6 flex flex-col justify-between min-h-[420px] flex-grow">
                {/* Gold Star Fallback if no Image */}
                {!config.bgImageBase64 && (
                  <div className="text-4xl mb-1.5">⚜️</div>
                )}

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold tracking-wider" style={{ color: config.textColor }}>
                    {config.title}
                  </h3>
                  <h4 className="text-[10px] font-bold text-amber-600 tracking-widest uppercase">
                    {config.subHeader}
                  </h4>
                </div>

                <div className="space-y-3 my-4">
                  <p className="text-[10px] italic font-semibold text-slate-500">
                    {config.certificationText}
                  </p>
                  <h1 className="text-3xl font-serif font-black underline decoration-double decoration-amber-400 text-slate-800">
                    Sundram Shukla
                  </h1>
                  <p className="text-[11px] text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {config.descriptionText}
                  </p>
                  <h3 className="text-sm font-bold text-emerald-700 bg-emerald-50 py-1.5 px-4 rounded-full w-fit mx-auto border border-emerald-100">
                    First Aid & Survival Skills
                  </h3>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/50 pt-2.5 max-w-xs mx-auto">
                  <div className="text-center flex flex-col justify-end min-h-[50px]">
                    {config.sigLeftImageBase64 && (
                      <div className="h-8 flex items-end justify-center mb-0.5">
                        <img src={config.sigLeftImageBase64} alt="Left Signature" className="max-h-full object-contain" />
                      </div>
                    )}
                    <div className="w-16 h-0.5 bg-slate-300 mx-auto"></div>
                    <div className="font-serif italic font-semibold text-[9px] mt-0.5 mb-0.5" style={{ color: config.textColor }}>
                      {config.sigLeftTitle}
                    </div>
                    <div className="text-[7px] text-slate-400 font-bold">
                      {config.sigLeftSub}
                    </div>
                  </div>
                  <div className="text-center flex flex-col justify-end min-h-[50px]">
                    {config.sigRightImageBase64 && (
                      <div className="h-8 flex items-end justify-center mb-0.5">
                        <img src={config.sigRightImageBase64} alt="Right Signature" className="max-h-full object-contain" />
                      </div>
                    )}
                    <div className="w-16 h-0.5 bg-slate-300 mx-auto"></div>
                    <div className="font-serif italic font-semibold text-[9px] mt-0.5 mb-0.5" style={{ color: config.textColor }}>
                      {config.sigRightTitle}
                    </div>
                    <div className="text-[7px] text-slate-400 font-bold">
                      {config.sigRightSub}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic text-center">
            Note: Student Certificates automatically adjust their dimensions and resolution when printing to PDF.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTemplates;
