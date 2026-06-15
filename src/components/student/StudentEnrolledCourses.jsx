import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config';
import { fetchQuizForCourse, getCourseQuizId } from '../../utils/quizUtils';
import { getEnrolledCourseIds } from '../../utils/enrollmentUtils';
import {
  processCourseEnrollment,
  navigateToPaymentResult,
  appendLocalPaymentHistory
} from '../../utils/paymentUtils';
import Loader from '../Loader';

const YouTubePlayer = ({ url, title, courseId, partNum, onVideoEnd }) => {
  const playerRef = React.useRef(null);
  const ytPlayerRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [playerReady, setPlayerReady] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [showControls, setShowControls] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const maxTimeWatchedRef = React.useRef(0);

  const userId = localStorage.getItem('userId') || 'guest';
  const progressKey = `videoTime_${userId}_${courseId}_${partNum}`;
  const completedKey = `videoCompleted_${userId}_${courseId}_${partNum}`;

  const embedUrl = React.useMemo(() => {
    if (!url) return '';
    if (url.includes('/embed/')) {
      const base = url.split('?')[0];
      return `${base}?enablejsapi=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&fs=0`;
    }
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&fs=0`;
    }
    return url;
  }, [url]);

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const element = containerRef.current;
    if (!element) return;

    const requestMethod = element.requestFullscreen || 
                          element.webkitRequestFullscreen || 
                          element.mozRequestFullScreen || 
                          element.msRequestFullscreen;

    if (requestMethod) {
      if (!document.fullscreenElement && 
          !document.webkitFullscreenElement && 
          !document.mozFullScreenElement && 
          !document.msFullscreenElement) {
        requestMethod.call(element).catch((err) => {
          console.error("Fullscreen request failed, falling back to pseudo-fullscreen", err);
          setIsFullscreen(true);
        });
      } else {
        const exitMethod = document.exitFullscreen || 
                           document.webkitExitFullscreen || 
                           document.mozCancelFullScreen || 
                           document.msExitFullscreen;
        if (exitMethod) {
          exitMethod.call(document);
        }
      }
    } else {
      setIsFullscreen(!isFullscreen);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = !!(document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement);
      setIsFullscreen(isNativeFull);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let ytPlayer = null;
    let timer = null;

    const initPlayer = () => {
      if (window.YT && window.YT.Player && playerRef.current) {
        try {
          ytPlayer = new window.YT.Player(playerRef.current, {
            events: {
              'onReady': (event) => {
                setPlayerReady(true);
                ytPlayerRef.current = event.target;
                
                const dur = event.target.getDuration();
                setDuration(dur);
                
                const videoCompleted = localStorage.getItem(completedKey) === 'true';
                const savedTime = parseFloat(localStorage.getItem(progressKey) || '0');
                
                const shouldReset = videoCompleted || (dur > 0 && savedTime >= dur - 5);
                
                if (shouldReset) {
                  event.target.seekTo(0, true);
                  localStorage.setItem(progressKey, '0');
                  maxTimeWatchedRef.current = 0;
                  setCurrentTime(0);
                } else if (savedTime > 0) {
                  event.target.seekTo(savedTime, true);
                  maxTimeWatchedRef.current = savedTime;
                  setCurrentTime(savedTime);
                } else {
                  maxTimeWatchedRef.current = 0;
                  setCurrentTime(0);
                }
                
                timer = setInterval(() => {
                  if (event.target && typeof event.target.getCurrentTime === 'function' && typeof event.target.getPlayerState === 'function') {
                    const state = event.target.getPlayerState();
                    if (state === 1) { // PLAYING state
                      const currTime = event.target.getCurrentTime();
                      setCurrentTime(currTime);
                      const isCurrentlyCompleted = localStorage.getItem(completedKey) === 'true';
                      
                      if (!isCurrentlyCompleted && currTime > maxTimeWatchedRef.current + 2.5) {
                        event.target.seekTo(maxTimeWatchedRef.current, true);
                        setCurrentTime(maxTimeWatchedRef.current);
                      } else {
                        if (currTime > maxTimeWatchedRef.current) {
                          maxTimeWatchedRef.current = currTime;
                          localStorage.setItem(progressKey, currTime.toString());
                        }
                      }
                    }
                  }
                }, 400);
              },
              'onStateChange': (event) => {
                const playerState = event.data;
                setIsPlaying(playerState === 1);
                
                if (playerState === 0) { // 0 represents ENDED
                  localStorage.setItem(completedKey, 'true');
                  if (typeof onVideoEnd === 'function') {
                    onVideoEnd();
                  }
                }
              }
            }
          });
        } catch (e) {
          console.error("YT Player init error:", e);
        }
      } else {
        setTimeout(initPlayer, 100);
      }
    };

    const timeout = setTimeout(initPlayer, 500);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
      if (ytPlayer && typeof ytPlayer.destroy === 'function') {
        try {
          ytPlayer.destroy();
        } catch(e) {}
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      ytPlayerRef.current = null;
      maxTimeWatchedRef.current = 0;
    };
  }, [embedUrl, progressKey, completedKey]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (ytPlayerRef.current && playerReady) {
      const state = ytPlayerRef.current.getPlayerState();
      if (state === 1) { // playing
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e) => {
    const seekToTime = parseFloat(e.target.value);
    if (ytPlayerRef.current && playerReady) {
      const isCurrentlyCompleted = localStorage.getItem(completedKey) === 'true';
      if (!isCurrentlyCompleted && seekToTime > maxTimeWatchedRef.current) {
        return;
      }
      ytPlayerRef.current.seekTo(seekToTime, true);
      setCurrentTime(seekToTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-950 border border-slate-200 shadow-inner overflow-hidden group transition-all duration-200 ${
        isFullscreen 
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-none flex items-center justify-center' 
          : 'relative w-full aspect-video rounded-xl'
      }`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Content Wrapper to maintain aspect ratio in fullscreen */}
      <div className={`relative w-full aspect-video ${isFullscreen ? 'max-w-full max-h-full' : 'h-full'}`}>
        {/* Embedded Iframe Container with crop styling */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {embedUrl ? (
            <iframe 
              ref={playerRef}
              src={embedUrl} 
              title={title}
              style={{
                position: 'absolute',
                top: '-45px',
                left: 0,
                width: '100%',
                height: 'calc(100% + 90px)',
                border: 'none',
                pointerEvents: 'none'
              }}
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold">No Video Configured</div>
          )}
        </div>

        {/* Click overlay to play/pause */}
        <div 
          onClick={togglePlay}
          className="absolute inset-0 cursor-pointer z-10 flex items-center justify-center"
        >
          {!isPlaying && playerReady && (
            <div className="w-16 h-16 bg-black/60 hover:bg-emerald-600/90 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110 active:scale-95 duration-200">
              <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Custom Glassmorphic Controls Bar */}
        {playerReady && (
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-white/10 px-4 py-3 z-20 flex items-center gap-3 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay}
              className="text-white hover:text-emerald-400 transition-colors focus:outline-none shrink-0"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Progress Bar / Scrubber */}
            <div className="relative flex-grow flex items-center h-2 group/slider">
              <input 
                type="range" 
                min={0} 
                max={duration || 100} 
                value={currentTime} 
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 outline-none"
              />
            </div>

            {/* Timer Display */}
            <span className="text-white text-xs font-mono shrink-0 select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Fullscreen Button */}
            <button 
              onClick={toggleFullscreen}
              className="text-white hover:text-emerald-400 transition-colors focus:outline-none shrink-0"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentEnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [activePaymentCourse, setActivePaymentCourse] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  
  // Lesson Progression states
  const [currentPart, setCurrentPart] = useState(1); // currently active lesson/part index
  const [maxUnlockedPart, setMaxUnlockedPart] = useState(1); // maximum unlocked lesson/part index
  const [activeSubLessonIndex, setActiveSubLessonIndex] = useState(-1); // -1 = main video, otherwise sub-lesson index
  const [viewMode, setViewMode] = useState('video'); // 'video' or 'notes'
  const [expandedLessons, setExpandedLessons] = useState({ 1: true });
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  
  // Quiz data & user answers
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionText }
  const [quizResult, setQuizResult] = useState(null); // { score, passed }
  
  // Student Profile for Certificate
  const [studentName, setStudentName] = useState('Sundram Shukla');
  const [showCertificate, setShowCertificate] = useState(false);

  const handlePrintCertificate = () => {
    const dept = (activeCourse.department || 'training').toLowerCase();
    const customTemplateStr = localStorage.getItem(`certificate_template_${dept}`);
    let template = {
      title: 'THE BHARAT SCOUTS & GUIDES',
      subHeader: 'Uttar Pradesh State Headquarters',
      certificationText: 'This is to certify that',
      descriptionText: 'has successfully completed the online training syllabus and passed the qualified examinations of the',
      sigLeftTitle: 'State Commissioner',
      sigLeftSub: 'BSGUP Head Office',
      sigRightTitle: 'State Secretary',
      sigRightSub: 'BSGUP Lucknow',
      textColor: '#1e293b',
      bgImageBase64: ''
    };
    if (customTemplateStr) {
      try {
        const parsed = JSON.parse(customTemplateStr);
        template = { ...template, ...parsed };
      } catch (err) {
        console.error(err);
      }
    }

    const newWindow = window.open("", "_blank");
    newWindow.document.write(`
      <html>
        <head>
          <title>BSGUP Course Certificate - ${studentName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Inter:wght@400;600;800&family=Pinyon+Script&display=swap');
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 90vh;
              background-color: #fff;
              font-family: 'Inter', sans-serif;
            }
            .certificate-container {
              border: ${template.bgImageBase64 ? 'none' : '8px solid #fbbf24'};
              padding: 10px;
              width: 100%;
              max-width: 700px;
              box-sizing: border-box;
              background-image: ${template.bgImageBase64 ? `url(${template.bgImageBase64})` : 'none'};
              background-size: cover;
              background-position: center;
            }
            .certificate-content {
              border: ${template.bgImageBase64 ? 'none' : '4px dashed #0f172a'};
              border-radius: 8px;
              padding: 40px 30px;
              text-align: center;
              box-sizing: border-box;
              color: ${template.textColor};
            }
            .gold-star {
              font-size: 48px;
              margin-bottom: 10px;
              display: ${template.bgImageBase64 ? 'none' : 'block'};
            }
            .title {
              font-family: 'Cinzel', serif;
              font-size: 26px;
              font-weight: 900;
              color: ${template.textColor};
              letter-spacing: 2px;
              margin: 0 0 5px 0;
            }
            .subtitle {
              font-size: 12px;
              font-weight: 800;
              color: ${template.textColor === '#1e293b' || template.textColor === '#000000' ? '#d97706' : 'inherit'};
              opacity: 0.9;
              letter-spacing: 3px;
              text-transform: uppercase;
              margin-bottom: 25px;
            }
            .italic-text {
              font-size: 12px;
              font-style: italic;
              font-weight: 600;
              color: ${template.textColor};
              opacity: 0.8;
            }
            .student-name {
              font-family: 'Pinyon Script', cursive;
              font-size: 48px;
              font-weight: bold;
              color: ${template.textColor};
              margin: 20px 0;
              text-decoration: underline;
              text-decoration-style: double;
              text-decoration-color: ${template.textColor === '#1e293b' || template.textColor === '#000000' ? '#fbbf24' : 'currentColor'};
            }
            .desc {
              font-size: 13px;
              color: ${template.textColor};
              opacity: 0.9;
              max-width: 480px;
              margin: 0 auto 25px auto;
              line-height: 1.6;
            }
            .course-title {
              font-size: 18px;
              font-weight: 800;
              color: #047857;
              background-color: #ecfdf5;
              padding: 10px 28px;
              border-radius: 9999px;
              display: inline-block;
              margin-bottom: 35px;
            }
            .signatures {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 40px;
              max-width: 450px;
              margin: 0 auto;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .signature-title {
              font-size: 13px;
              font-style: italic;
              font-weight: 600;
              color: ${template.textColor};
              margin-bottom: 5px;
            }
            .signature-line {
              width: 120px;
              border-bottom: 1px solid #94a3b8;
              margin: 0 auto;
            }
            .signature-subtitle {
              font-size: 10px;
              color: #94a3b8;
              margin-top: 5px;
              font-weight: 800;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="certificate-content">
              <div class="gold-star">⚜️</div>
              <div class="title">${template.title}</div>
              <div class="subtitle">${template.subHeader}</div>
              <div class="italic-text">${template.certificationText}</div>
              <div class="student-name">${studentName}</div>
              <div class="desc">${template.descriptionText}</div>
              <div class="course-title">${activeCourse.title}</div>
              <div class="signatures">
                <div>
                  <div class="signature-title">${template.sigLeftTitle}</div>
                  <div class="signature-line"></div>
                  <div class="signature-subtitle">${template.sigLeftSub}</div>
                </div>
                <div>
                  <div class="signature-title">${template.sigRightTitle}</div>
                  <div class="signature-line"></div>
                  <div class="signature-subtitle">${template.sigRightSub}</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  useEffect(() => {
    // Fetch profile to get true student name for certificate
    const fetchProfileName = async () => {
      try {
        const userId = localStorage.getItem('userId') || 1;
        const res = await fetch(`${BASE_URL}/bsgupadmin/profile/?user_id=${userId}`);
        const data = await res.json();
        let profile = null;
        if (Array.isArray(data) && data.length > 0) profile = data[0];
        else if (data && data.full_name) profile = data;
        else if (data && data.data) profile = data.data;

        if (profile && profile.full_name) {
          setStudentName(profile.full_name);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId') || 'guest';
        const [coursesRes, enrolledIds] = await Promise.all([
          fetch(`${BASE_URL}/bsgupadmin/createcourse/`),
          userId !== 'guest' ? getEnrolledCourseIds(userId) : Promise.resolve([])
        ]);
        const data = await coursesRes.json();
        if (data.success && data.data) {
          setAllCourses(data.data);
          const enrolled = enrolledIds.length
            ? enrolledIds
            : JSON.parse(localStorage.getItem(`enrolledCourses_${userId}`) || '[]');
          
          setEnrolledCourseIds(enrolled.map(id => id.toString()));
          
          const filtered = data.data.filter((course) =>
            enrolled.some((id) => id.toString() === course.id.toString())
          );
          setCourses(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileName();
    fetchCourses();

    const handleEnrollmentChange = () => fetchCourses();
    window.addEventListener('enrollmentChange', handleEnrollmentChange);
    return () => window.removeEventListener('enrollmentChange', handleEnrollmentChange);
  }, [activeCourse]);

  useEffect(() => {
    const refreshEnrollments = async () => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      setEnrolledCourseIds([]);
      return;
    }
    const ids = await getEnrolledCourseIds(userId);
    setEnrolledCourseIds(ids.map(id => id.toString()));
    
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
      const data = await res.json();
      if (data.success && data.data) {
        setAllCourses(data.data);
        const filtered = data.data.filter((course) =>
          ids.some((id) => id.toString() === course.id.toString())
        );
        setCourses(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runEnrollment = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    setIsPaying(true);
    const finalCourseId = course.id;
    try {
      if (!finalCourseId) throw new Error('finalCourseId is null or undefined');
      if (!userId || userId === 'guest') throw new Error('Please log in to enroll');
      
      const result = await processCourseEnrollment({
        userId,
        courseId: finalCourseId,
        courseTitle: course.title,
        coursePrice: course.price
      });

      if (result.status === 'already_enrolled') {
        alert(result.message || 'You are already enrolled in this course!');
        await refreshEnrollments();
        return;
      }

      if (result.type === 'paid') {
        appendLocalPaymentHistory(userId, {
          courseTitle: course.title,
          amount: result.amount,
          status: 'Paid'
        });
      }

      await refreshEnrollments();
      window.dispatchEvent(new Event('enrollmentChange'));

      navigateToPaymentResult('success', {
        message: result.message,
        courseTitle: course.title,
        amount: result.amount,
        orderId: result.orderId
      });
    } catch (err) {
      console.error(err);
      alert(`Payment error: ${err.message || 'Unknown error'}`);
      navigateToPaymentResult('failed', {
        message: err.message || 'Payment failed. Please try again.',
        courseTitle: course.title,
        amount: course.price
      });
    } finally {
      setIsPaying(false);
      setActivePaymentCourse(null);
    }
  };

  const handleEnroll = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      alert('Please log in to enroll in this course.');
      return;
    }

    if (enrolledCourseIds.some((id) => id.toString() === course.id.toString())) {
      alert('You are already enrolled in this course!');
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      await runEnrollment(course);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = async () => {
    if (!activePaymentCourse) return;
    try {
      await runEnrollment(activePaymentCourse);
    } catch (err) {
      console.error('executePayment error:', err);
      alert('Payment flow error: ' + (err.message || 'See console'));
    }
  };

  if (activeCourse) {
      const fetchCourseLessons = async () => {
        setLessonsLoading(true);
        try {
          const userId = localStorage.getItem('userId') || 'guest';
          const res = await fetch(`${BASE_URL}/user/course-lesson?user_id=${userId}&course_id=${activeCourse.id}`);
          const data = await res.json();
          const lessonList = data.data || (Array.isArray(data) ? data : []);
          setLessons(lessonList);
        } catch (err) {
          console.error("Error loading lessons:", err);
          setLessons([]);
        } finally {
          setLessonsLoading(false);
        }
      };
      fetchCourseLessons();
    }
  }, [activeCourse]);

  useEffect(() => {
    const refreshEnrollments = async () => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      setEnrolledCourseIds([]);
      return;
    }
    const ids = await getEnrolledCourseIds(userId);
    setEnrolledCourseIds(ids.map(id => id.toString()));
    
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
      const data = await res.json();
      if (data.success && data.data) {
        setAllCourses(data.data);
        const filtered = data.data.filter((course) =>
          ids.some((id) => id.toString() === course.id.toString())
        );
        setCourses(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runEnrollment = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    setIsPaying(true);
    const finalCourseId = course.id;
    try {
      if (!finalCourseId) throw new Error('finalCourseId is null or undefined');
      if (!userId || userId === 'guest') throw new Error('Please log in to enroll');
      
      const result = await processCourseEnrollment({
        userId,
        courseId: finalCourseId,
        courseTitle: course.title,
        coursePrice: course.price
      });

      if (result.status === 'already_enrolled') {
        alert(result.message || 'You are already enrolled in this course!');
        await refreshEnrollments();
        return;
      }

      if (result.type === 'paid') {
        appendLocalPaymentHistory(userId, {
          courseTitle: course.title,
          amount: result.amount,
          status: 'Paid'
        });
      }

      await refreshEnrollments();
      window.dispatchEvent(new Event('enrollmentChange'));

      navigateToPaymentResult('success', {
        message: result.message,
        courseTitle: course.title,
        amount: result.amount,
        orderId: result.orderId
      });
    } catch (err) {
      console.error(err);
      alert(`Payment error: ${err.message || 'Unknown error'}`);
      navigateToPaymentResult('failed', {
        message: err.message || 'Payment failed. Please try again.',
        courseTitle: course.title,
        amount: course.price
      });
    } finally {
      setIsPaying(false);
      setActivePaymentCourse(null);
    }
  };

  const handleEnroll = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      alert('Please log in to enroll in this course.');
      return;
    }

    if (enrolledCourseIds.some((id) => id.toString() === course.id.toString())) {
      alert('You are already enrolled in this course!');
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      await runEnrollment(course);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = async () => {
    if (!activePaymentCourse) return;
    try {
      await runEnrollment(activePaymentCourse);
    } catch (err) {
      console.error('executePayment error:', err);
      alert('Payment flow error: ' + (err.message || 'See console'));
    }
  };

  if (activeCourse) {
      const userId = localStorage.getItem('userId') || 'guest';
      
      const fetchProgress = async () => {
        try {
          const res = await fetch(`${BASE_URL}/user/course-progress?user_id=${userId}&course_id=${activeCourse.id}`);
          const data = await res.json();
          let unlocked = 1;
          if (data.success && data.data) {
            const completedCount = data.data.completed_lessons_count ?? data.data.completed_count ?? data.data.progress ?? 0;
            unlocked = completedCount + 1;
          } else if (data.progress !== undefined) {
            unlocked = data.progress + 1;
          } else if (data.completed_lessons_count !== undefined) {
            unlocked = data.completed_lessons_count + 1;
          }
          
          setMaxUnlockedPart(unlocked);
          setCurrentPart(unlocked);
          setExpandedLessons({ [unlocked]: true });
        } catch (err) {
          console.error("Error loading progress:", err);
          const key = `unlockedPart_${userId}_${activeCourse.id}`;
          const savedProgress = parseInt(localStorage.getItem(key) || '1', 10);
          setMaxUnlockedPart(savedProgress);
          setCurrentPart(savedProgress);
          setExpandedLessons({ [savedProgress]: true });
        }
      };

      fetchProgress();
      setActiveSubLessonIndex(-1);
      setViewMode('video');
      setQuizStarted(false);
      setQuizData(null);
      setQuizResult(null);
      setSelectedAnswers({});
    }
  }, [activeCourse]);

  const updateUnlockedProgress = (newVal) => {
    const refreshEnrollments = async () => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      setEnrolledCourseIds([]);
      return;
    }
    const ids = await getEnrolledCourseIds(userId);
    setEnrolledCourseIds(ids.map(id => id.toString()));
    
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
      const data = await res.json();
      if (data.success && data.data) {
        setAllCourses(data.data);
        const filtered = data.data.filter((course) =>
          ids.some((id) => id.toString() === course.id.toString())
        );
        setCourses(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runEnrollment = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    setIsPaying(true);
    const finalCourseId = course.id;
    try {
      if (!finalCourseId) throw new Error('finalCourseId is null or undefined');
      if (!userId || userId === 'guest') throw new Error('Please log in to enroll');
      
      const result = await processCourseEnrollment({
        userId,
        courseId: finalCourseId,
        courseTitle: course.title,
        coursePrice: course.price
      });

      if (result.status === 'already_enrolled') {
        alert(result.message || 'You are already enrolled in this course!');
        await refreshEnrollments();
        return;
      }

      if (result.type === 'paid') {
        appendLocalPaymentHistory(userId, {
          courseTitle: course.title,
          amount: result.amount,
          status: 'Paid'
        });
      }

      await refreshEnrollments();
      window.dispatchEvent(new Event('enrollmentChange'));

      navigateToPaymentResult('success', {
        message: result.message,
        courseTitle: course.title,
        amount: result.amount,
        orderId: result.orderId
      });
    } catch (err) {
      console.error(err);
      alert(`Payment error: ${err.message || 'Unknown error'}`);
      navigateToPaymentResult('failed', {
        message: err.message || 'Payment failed. Please try again.',
        courseTitle: course.title,
        amount: course.price
      });
    } finally {
      setIsPaying(false);
      setActivePaymentCourse(null);
    }
  };

  const handleEnroll = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      alert('Please log in to enroll in this course.');
      return;
    }

    if (enrolledCourseIds.some((id) => id.toString() === course.id.toString())) {
      alert('You are already enrolled in this course!');
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      await runEnrollment(course);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = async () => {
    if (!activePaymentCourse) return;
    try {
      await runEnrollment(activePaymentCourse);
    } catch (err) {
      console.error('executePayment error:', err);
      alert('Payment flow error: ' + (err.message || 'See console'));
    }
  };

  if (activeCourse) {
      const userId = localStorage.getItem('userId') || 'guest';
      const key = `unlockedPart_${userId}_${activeCourse.id}`;
      localStorage.setItem(key, newVal.toString());
      setMaxUnlockedPart(newVal);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    try {
      const quizObj = await fetchQuizForCourse(activeCourse.id, activeCourse.title);

      if (!quizObj || !quizObj.questions?.length) {
        alert('No quiz questions found for this course. Please ask your admin to add questions first.');
        setQuizStarted(false);
        return;
      }

      const userId = localStorage.getItem('userId') || 3;
      const quizId = quizObj.quizId || getCourseQuizId(activeCourse.id);
      if (!quizId) {
        alert('Quiz not configured for this course. Please ask admin to open Quiz Management once.');
        setQuizStarted(false);
        return;
      }

      try {
        await fetch(`${BASE_URL}/bsgupadmin/start-quiz/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: parseInt(userId, 10),
            quiz_id: parseInt(quizId, 10)
          })
        });
      } catch (startErr) {
        console.error('Start quiz API failed, proceeding anyway', startErr);
      }

      setQuizData(quizObj);
      setQuizStarted(true);
    } catch (err) {
      console.error('Quiz fetch failed:', err);
      alert('Failed to load quiz. Please try again later.');
      setQuizStarted(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: option
    });
  };

  const submitQuiz = async () => {
    // Validate all answered
    const questionsList = quizData.questions || [];
    if (Object.keys(selectedAnswers).length < questionsList.length) {
      alert("Please answer all questions before submitting!");
      return;
    }

    setQuizLoading(true);
    try {
      const userId = localStorage.getItem('userId') || 3;
      const formattedAnswers = Object.keys(selectedAnswers).map(idxKey => {
        const questionIndex = parseInt(idxKey, 10);
        const questionObj = questionsList[questionIndex] || {};
        return {
          question_id: parseInt(questionObj.id || questionObj.question_id || questionIndex, 10),
          answer: selectedAnswers[idxKey]
        };
      });
      const cachedQuizId = getCourseQuizId(activeCourse.id);
      if (!cachedQuizId) {
        alert('Quiz not configured for this course.');
        setQuizLoading(false);
        return;
      }

      // 1. Submit to API
      const res = await fetch(`${BASE_URL}/bsgupadmin/submit-quiz/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          quiz_id: parseInt(cachedQuizId, 10),
          answers: formattedAnswers
        })
      });

      let finalScorePercentage = 0;
      let passed = false;
      let backendMessage = "";

      if (res.ok) {
        const resultData = await res.json();
        backendMessage = resultData.message || (resultData.data && resultData.data.message) || "";
        if (resultData && resultData.success && resultData.data) {
          finalScorePercentage = Math.round(resultData.data.percentage);
          passed = resultData.data.passed === true || resultData.data.passed === "true";
        } else {
          // Local fallback in case API succeeded but data was malformed
          let score = 0;
          questionsList.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_answer) {
              score += 1;
            }
          });
          finalScorePercentage = Math.round((score / questionsList.length) * 100);
          passed = finalScorePercentage >= (quizData.passing_marks || 60);
        }
      } else {
        // Local fallback in case submission failed
        let score = 0;
        questionsList.forEach((q, idx) => {
          if (selectedAnswers[idx] === q.correct_answer) {
            score += 1;
          }
        });
        finalScorePercentage = Math.round((score / questionsList.length) * 100);
        passed = finalScorePercentage >= (quizData.passing_marks || 60);
      }

      setQuizResult({
        score: finalScorePercentage,
        passed: passed,
        message: backendMessage
      });

      if (passed) {
        const completedKey = `completedCourses_${userId}`;
        const completedList = JSON.parse(localStorage.getItem(completedKey) || '[]');
        if (!completedList.includes(activeCourse.id)) {
          completedList.push(activeCourse.id);
          localStorage.setItem(completedKey, JSON.stringify(completedList));
        }

        const certKey = `earnedCertificates_${userId}`;
        const certList = JSON.parse(localStorage.getItem(certKey) || '[]');
        if (!certList.includes(activeCourse.id)) {
          certList.push(activeCourse.id);
          localStorage.setItem(certKey, JSON.stringify(certList));
        }
      }

    } catch (err) {
      console.error(err);
      alert("Error submitting quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !lessonId) return;

    try {
      await fetch(`${BASE_URL}/user/mark-lesson-complete/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId, 10),
          lesson_id: parseInt(lessonId, 10)
        })
      });
    } catch (err) {
      console.error("Failed to mark lesson complete on server:", err);
    }
  };

  const handleNextPart = () => {
    const activeParts = lessons;
    
    // If viewing a sub-lesson and there are more sub-lessons left:
    if (activeSubLessonIndex !== null && activeSubLessonIndex >= 0) {
      const lesson = activeParts[currentPart - 1];
      if (lesson.sub_lessons && activeSubLessonIndex < lesson.sub_lessons.length - 1) {
        // Go to next sub-lesson
        setActiveSubLessonIndex(activeSubLessonIndex + 1);
        setViewMode('video');
        return;
      }
    }
    
    // Otherwise, advance to the next main lesson
    if (currentPart < activeParts.length) {
      const finishedLesson = activeParts[currentPart - 1];
      if (finishedLesson && finishedLesson.id) {
        markLessonComplete(finishedLesson.id);
      }

      const nextPartNum = currentPart + 1;
      if (nextPartNum > maxUnlockedPart) {
        updateUnlockedProgress(nextPartNum);
      }
      setCurrentPart(nextPartNum);
      setActiveSubLessonIndex(-1); // Reset to main lesson video
      setViewMode('video');
      
      // Auto-expand the newly unlocked lesson dropdown
      setExpandedLessons(prev => ({
        ...prev,
        [nextPartNum]: true
      }));
    } else {
      const finishedLesson = activeParts[currentPart - 1];
      if (finishedLesson && finishedLesson.id) {
        markLessonComplete(finishedLesson.id);
      }

      // Unlock quiz!
      const quizPartNum = activeParts.length + 1;
      if (quizPartNum > maxUnlockedPart) {
        updateUnlockedProgress(quizPartNum);
      }
      setCurrentPart(quizPartNum);
    }
  };

  const resetStudyPanel = () => {
    setActiveCourse(null);
    setCurrentPart(1);
    setMaxUnlockedPart(1);
    setActiveSubLessonIndex(-1);
    setViewMode('video');
    setExpandedLessons({ 1: true });
    setQuizStarted(false);
    setQuizResult(null);
    setSelectedAnswers({});
    setShowCertificate(false);
  };

  // If in Course Viewer/Study mode
  const refreshEnrollments = async () => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      setEnrolledCourseIds([]);
      return;
    }
    const ids = await getEnrolledCourseIds(userId);
    setEnrolledCourseIds(ids.map(id => id.toString()));
    
    try {
      const res = await fetch(`${BASE_URL}/bsgupadmin/createcourse/`);
      const data = await res.json();
      if (data.success && data.data) {
        setAllCourses(data.data);
        const filtered = data.data.filter((course) =>
          ids.some((id) => id.toString() === course.id.toString())
        );
        setCourses(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runEnrollment = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    setIsPaying(true);
    const finalCourseId = course.id;
    try {
      if (!finalCourseId) throw new Error('finalCourseId is null or undefined');
      if (!userId || userId === 'guest') throw new Error('Please log in to enroll');
      
      const result = await processCourseEnrollment({
        userId,
        courseId: finalCourseId,
        courseTitle: course.title,
        coursePrice: course.price
      });

      if (result.status === 'already_enrolled') {
        alert(result.message || 'You are already enrolled in this course!');
        await refreshEnrollments();
        return;
      }

      if (result.type === 'paid') {
        appendLocalPaymentHistory(userId, {
          courseTitle: course.title,
          amount: result.amount,
          status: 'Paid'
        });
      }

      await refreshEnrollments();
      window.dispatchEvent(new Event('enrollmentChange'));

      navigateToPaymentResult('success', {
        message: result.message,
        courseTitle: course.title,
        amount: result.amount,
        orderId: result.orderId
      });
    } catch (err) {
      console.error(err);
      alert(`Payment error: ${err.message || 'Unknown error'}`);
      navigateToPaymentResult('failed', {
        message: err.message || 'Payment failed. Please try again.',
        courseTitle: course.title,
        amount: course.price
      });
    } finally {
      setIsPaying(false);
      setActivePaymentCourse(null);
    }
  };

  const handleEnroll = async (course) => {
    const userId = localStorage.getItem('userId') || 'guest';
    if (!userId || userId === 'guest') {
      alert('Please log in to enroll in this course.');
      return;
    }

    if (enrolledCourseIds.some((id) => id.toString() === course.id.toString())) {
      alert('You are already enrolled in this course!');
      return;
    }

    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
    if (isFree) {
      await runEnrollment(course);
    } else {
      setActivePaymentCourse(course);
    }
  };

  const executePayment = async () => {
    if (!activePaymentCourse) return;
    try {
      await runEnrollment(activePaymentCourse);
    } catch (err) {
      console.error('executePayment error:', err);
      alert('Payment flow error: ' + (err.message || 'See console'));
    }
  };

  if (activeCourse) {
    if (lessonsLoading) {
      return (
        <div className="p-6 text-center max-w-xl mx-auto min-h-[50vh] flex items-center justify-center">
          <Loader message="Loading course lessons..." />
        </div>
      );
    }

    if (lessons.length === 0) {
      return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto text-left">
          <button 
            onClick={resetStudyPanel} 
            className="mb-6 flex items-center gap-2 text-[#7c3aed] hover:text-[#6d28d9] font-bold transition-colors"
          >
            <span>🔙</span> Back to Enrolled Courses
          </button>

          <h2 className="text-3xl font-extrabold text-slate-800 mb-6 font-sans">{activeCourse.title}</h2>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-sans">No Lessons Available</h3>
            <p className="text-slate-500 mb-6 font-sans">
              The administrator has not added any lessons or syllabus material to this course yet. Please check back later.
            </p>
            <button 
              onClick={resetStudyPanel} 
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    const activeParts = lessons;
    const currentLesson = activeParts[currentPart - 1];
    
    // Get active content information
    let activeTitle = "";
    let activeDescription = "";
    let activeVideoUrl = "";
    let activePartId = "";

    if (currentLesson) {
      if (activeSubLessonIndex !== null && activeSubLessonIndex >= 0 && currentLesson.sub_lessons && currentLesson.sub_lessons[activeSubLessonIndex]) {
        const subLesson = currentLesson.sub_lessons[activeSubLessonIndex];
        activeTitle = subLesson.title || `Sub-lesson ${activeSubLessonIndex + 1}`;
        activeDescription = subLesson.description || "No description provided.";
        activeVideoUrl = subLesson.youtube_url || subLesson.videoUrl || "";
        activePartId = `${currentPart}_sub_${activeSubLessonIndex}`;
      } else {
        activeTitle = currentLesson.title;
        activeDescription = currentLesson.description || "No description provided.";
        activeVideoUrl = currentLesson.youtube_url || currentLesson.videoUrl || "";
        activePartId = `${currentPart}`;
      }
    }

    return (
      <div className="p-2 sm:p-6 max-w-6xl mx-auto text-left relative">
        <button 
          onClick={resetStudyPanel} 
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
        >
          <span>🔙</span> Back to Enrolled Courses
        </button>

        <h2 className="text-3xl font-extrabold text-slate-800 mb-6">{activeCourse.title}</h2>

        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

            {/* Lessons Dropdowns List */}
            <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
              {activeParts.map((part, index) => {
                const num = index + 1;
                const isUnlocked = maxUnlockedPart >= num;
                const isExpanded = !!expandedLessons[num];
                const isActiveLesson = currentPart === num;
                const subLessonsList = part.sub_lessons || [];

                return (
                  <div key={num} className="border border-slate-100 rounded-xl overflow-hidden">
                    {/* Accordion Header */}
                    <button
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (!isExpanded) {
                          setCurrentPart(num);
                          setActiveSubLessonIndex(-1);
                          setViewMode('video');
                        }
                        setExpandedLessons(prev => ({
                          ...prev,
                          [num]: !prev[num]
                        }));
                      }}
                      className={`w-full text-left px-4 py-3 font-semibold flex items-center justify-between transition-all ${
                        !isUnlocked 
                          ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' 
                          : isActiveLesson
                            ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500'
                            : 'text-slate-700 bg-slate-50 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs transition-transform duration-200 shrink-0">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                        <span className="truncate text-sm font-bold">{part.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {maxUnlockedPart > num ? (
                          <span className="text-emerald-500 text-xs">✅</span>
                        ) : !isUnlocked ? (
                          <span className="text-slate-400 text-xs">🔒</span>
                        ) : (
                          <span className="text-amber-500 text-xs">📖</span>
                        )}
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isExpanded && isUnlocked && (
                      <div className="bg-slate-50/50 border-t border-slate-100 p-2 sm:p-4 md:p-6 space-y-4">
                        {/* Sub-lessons */}
                        {subLessonsList.length > 0 && (
                          <div className="flex gap-2 flex-wrap mb-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <button 
                               onClick={() => { setCurrentPart(num); setActiveSubLessonIndex(-1); }}
                               className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubLessonIndex === -1 && currentPart === num ? 'bg-emerald-500 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
                            >Main Lesson</button>
                            {subLessonsList.map((sub, sIdx) => (
                              <button 
                                 key={sIdx}
                                 onClick={() => { setCurrentPart(num); setActiveSubLessonIndex(sIdx); }}
                                 className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSubLessonIndex === sIdx && currentPart === num ? 'bg-emerald-500 text-white shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
                              >{sub.title || `Part ${sIdx + 1}`}</button>
                            ))}
                          </div>
                        )}

                        {currentPart === num && (
                          <div className="space-y-4">
                            {/* Mode Toggles */}
                            <div className="flex bg-slate-200/60 p-1 rounded-xl w-fit">
                              <button
                                onClick={() => setViewMode('video')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                  viewMode === 'video'
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>🎥</span> Video
                              </button>
                              <button
                                onClick={() => setViewMode('notes')}
                                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                  viewMode === 'notes'
                                    ? 'bg-white text-emerald-700 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <span>📄</span> Study Notes
                              </button>
                            </div>

                            {/* Content */}
                            {viewMode === 'video' ? (
                              <div className="space-y-4 animate-fadeIn">
                                <YouTubePlayer 
                                  url={activeVideoUrl} 
                                  title={activeTitle}
                                  courseId={activeCourse.id}
                                  partNum={activePartId}
                                  onVideoEnd={handleNextPart}
                                />
                                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                  <h4 className="text-sm font-bold text-slate-800 mb-2">About this video</h4>
                                  <p className="text-slate-600 text-sm leading-relaxed">{activeDescription}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-fadeIn">
                                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                                  <span>📚</span> Syllabus Material & Reference Notes
                                </h4>
                                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-serif">
                                  {activeDescription}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Final Quiz Section */}
              <div className="border border-slate-100 rounded-xl overflow-hidden mt-6">
                <button
                  disabled={maxUnlockedPart < activeParts.length + 1}
                  onClick={() => setCurrentPart(activeParts.length + 1)}
                  className={`w-full text-left px-5 py-4 font-bold flex items-center justify-between transition-all ${
                    currentPart === activeParts.length + 1
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                      : maxUnlockedPart >= activeParts.length + 1
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-300 cursor-not-allowed bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎓</span>
                    <span className="text-base">Final Quiz</span>
                  </div>
                  <span>{maxUnlockedPart >= activeParts.length + 1 ? '📝' : '🔒'}</span>
                </button>

              {currentPart === activeParts.length + 1 && (() => {
                const userId = localStorage.getItem('userId') || 'guest';
                const certKey = `earnedCertificates_${userId}`;
                const certList = JSON.parse(localStorage.getItem(certKey) || '[]');
                const isCertEarned = certList.some(id => id.toString() === activeCourse.id.toString());
                
                return (
                  <div className="p-6 bg-white border-t border-slate-100">
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-slate-800">Final Course Examination</h3>
                      
                      {isCertEarned ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="text-6xl">🏆</div>
                          <h4 className="text-xl font-bold text-slate-800">Certificate Already Generated!</h4>
                          <p className="text-slate-500 max-w-md mx-auto">You have successfully completed this course and earned your official Scout & Guide certificate.</p>
                          <button 
                            onClick={() => setShowCertificate(true)}
                            className="bg-[#10b981] hover:bg-[#059669] text-white font-extrabold px-10 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mx-auto text-sm"
                          >
                            <span>🏆</span> View / Download Certificate
                          </button>
                        </div>
                      ) : !quizStarted ? (
                        <div className="py-8 text-center space-y-4">
                          <div className="text-6xl">📝</div>
                          <h4 className="text-xl font-bold text-slate-800">Are you ready to start the quiz?</h4>
                          <p className="text-slate-500 max-w-md mx-auto">This examination evaluates your knowledge. Pass mark is 60%.</p>
                          <button 
                            onClick={loadQuiz}
                            disabled={quizLoading}
                            className="bg-emerald-500 text-white font-bold px-10 py-3.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {quizLoading ? 'Initializing Quiz...' : 'Start Quiz Now'}
                          </button>
                        </div>
                      ) : quizResult ? (
                        <div className="py-8 text-center space-y-6">
                          <div className="text-7xl">{quizResult.passed ? '🎉' : '❌'}</div>
                          <h4 className="text-2xl font-extrabold text-slate-800">
                            {quizResult.passed ? 'Quiz Completed Successfully' : 'Quiz Failed'}
                          </h4>
                          
                          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-lg mx-auto space-y-4 text-left">
                            <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Performance</span>
                              <p className="text-2xl font-black text-slate-800 mt-1">
                                Score Secured: <span className="text-emerald-500">{quizResult.score}%</span>
                              </p>
                              <p className="text-xs font-bold text-slate-500 mt-1">Passing requirement is {quizData.passing_marks || 60}%</p>
                            </div>
                            
                            {quizResult.message && (
                              <div className="border-t border-slate-200 pt-4">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Response</span>
                                <p className="text-sm font-semibold text-slate-700 mt-1">
                                  {quizResult.message}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 flex justify-center gap-3">
                            {!quizResult.passed && (
                              <button 
                                onClick={() => { setQuizResult(null); setSelectedAnswers({}); }}
                                className="bg-emerald-500 text-white font-extrabold px-8 py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm shadow-md shadow-emerald-500/10"
                              >
                                Try Again
                              </button>
                            )}
                            {quizResult.passed && (
                              <button 
                                onClick={() => setShowCertificate(true)}
                                className="bg-[#10b981] hover:bg-[#059669] text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                              >
                                <span>🏆</span> View Certificate
                              </button>
                            )}
                            <button 
                              onClick={resetStudyPanel}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-3 rounded-xl transition-all text-sm"
                            >
                              Back to Courses
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8 pt-4">
                          {(quizData.questions || []).map((q, idx) => (
                            <div key={q.id || idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                              <h4 className="font-bold text-slate-800 mb-4 text-lg">Question {idx + 1}: {q.question}</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[q.option1, q.option2, q.option3, q.option4].map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleOptionSelect(idx, opt)}
                                    className={`w-full text-left p-3 rounded-xl border font-semibold transition-all ${
                                      selectedAnswers[idx] === opt 
                                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20' 
                                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}

                          <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button 
                              onClick={submitQuiz}
                              disabled={quizLoading}
                              className="bg-emerald-500 text-white font-extrabold px-10 py-3.5 rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 disabled:opacity-50"
                            >
                              {quizLoading ? 'Evaluating...' : 'Submit Answers'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Modal */}
        {showCertificate && (() => {
          const dept = (activeCourse.department || 'training').toLowerCase();
          const customTemplateStr = localStorage.getItem(`certificate_template_${dept}`);
          let template = {
            title: 'THE BHARAT SCOUTS & GUIDES',
            subHeader: 'Uttar Pradesh State Headquarters',
            certificationText: 'This is to certify that',
            descriptionText: 'has successfully completed the online training syllabus and passed the qualified examinations of the',
            sigLeftTitle: 'State Commissioner',
            sigLeftSub: 'BSGUP Head Office',
            sigRightTitle: 'State Secretary',
            sigRightSub: 'BSGUP Lucknow',
            textColor: '#1e293b',
            bgImageBase64: ''
          };
          if (customTemplateStr) {
            try {
              template = { ...template, ...JSON.parse(customTemplateStr) };
            } catch (err) {
              console.error(err);
            }
          }

          return (
            <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white p-4 md:p-8 rounded-2xl max-w-2xl w-full shadow-2xl relative border-4 md:border-8 border-amber-400 my-auto">
                <button 
                  onClick={() => setShowCertificate(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 text-xl font-bold bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
                
                {/* Golden Certificate Layout / Dynamic custom template background */}
                <div 
                  style={{
                    backgroundImage: template.bgImageBase64 ? `url(${template.bgImageBase64})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: template.textColor,
                    borderColor: template.bgImageBase64 ? 'transparent' : '#fbbf24'
                  }}
                  className="text-center py-4 md:py-6 border-2 md:border-4 border-slate-900 border-dashed rounded-lg p-3 md:p-6"
                >
                  {!template.bgImageBase64 && (
                    <div className="text-3xl md:text-5xl mb-2">⚜️</div>
                  )}
                  <h2 className="text-base md:text-2xl font-black tracking-wider" style={{ color: template.textColor }}>
                    {template.title}
                  </h2>
                  <h4 className="text-[10px] md:text-xs font-bold text-amber-600 tracking-widest uppercase mb-4 md:mb-6">
                    {template.subHeader}
                  </h4>
                  
                  <p className="text-[10px] md:text-xs italic font-semibold text-slate-500">
                    {template.certificationText}
                  </p>
                  <h1 className="text-xl md:text-4xl font-serif font-black my-2 md:my-4 underline decoration-double decoration-amber-400 truncate px-2" style={{ color: template.textColor }} title={studentName}>
                    {studentName}
                  </h1>
                  
                  <p className="text-[10px] md:text-sm max-w-md mx-auto leading-relaxed mb-4 md:mb-6" style={{ color: template.textColor }}>
                    {template.descriptionText}
                  </p>
                  
                  <h3 className="text-sm md:text-xl font-bold text-emerald-700 bg-emerald-50 py-1.5 md:py-2 px-4 md:px-6 rounded-full w-fit mx-auto mb-6 md:mb-8 border border-emerald-100">
                    {activeCourse.title}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 md:pt-6 max-w-md mx-auto">
                    <div className="text-center">
                      <div className="font-serif italic font-semibold text-[10px] md:text-xs mb-1" style={{ color: template.textColor }}>
                        {template.sigLeftTitle}
                      </div>
                      <div className="w-16 md:w-24 h-0.5 bg-slate-300 mx-auto"></div>
                      <div className="text-[8px] md:text-[10px] text-slate-400 mt-1 font-bold">
                        {template.sigLeftSub}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-serif italic font-semibold text-[10px] md:text-xs mb-1" style={{ color: template.textColor }}>
                        {template.sigRightTitle}
                      </div>
                      <div className="w-16 md:w-24 h-0.5 bg-slate-300 mx-auto"></div>
                      <div className="text-[8px] md:text-[10px] text-slate-400 mt-1 font-bold">
                        {template.sigRightSub}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button 
                    onClick={handlePrintCertificate}
                    className="w-full sm:w-auto bg-[#10b981] hover:bg-[#059669] text-white font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <span>⬇️</span> Download PDF Certificate
                  </button>
                  <button 
                    onClick={() => setShowCertificate(false)}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="p-6 text-left">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">My Enrolled Courses</h2>
        <p className="text-slate-500 mt-2">Continue learning from where you left off.</p>
      </div>

      {loading ? (
        <Loader message="Loading your courses..." />
      ) : (
        <div>
          {courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200">
                  {course.course_profile_pic ? (
                    <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-slate-200 flex items-center justify-center text-slate-400">No Image provided</div>
                  )}
                  <div className="p-5 flex-grow flex flex-col text-left">
                    <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100">
                       <button 
                         onClick={() => setActiveCourse(course)}
                         className="w-full bg-[#7c3aed] text-white font-bold py-2.5 rounded-lg hover:bg-[#6d28d9] transition-colors"
                       >
                         Continue Learning
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {courses.length === 0 && (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-slate-200 text-center mb-10">
              <div className="text-5xl mb-4">😢</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">You haven't enrolled in any courses yet!</h3>
              <p className="text-slate-500 mb-6">Explore our catalog below and find the perfect course for you.</p>
            </div>
          )}

          {/* Available Courses Section */}
          {allCourses.length > 0 && (
            <div className="mt-12 border-t border-slate-200 pt-10">
              <div className="mb-6 text-left">
                <h3 className="text-2xl font-bold text-slate-800">Available Courses to Enroll</h3>
                <p className="text-slate-500 mt-1">Select from our list of courses and enroll to start learning.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses
                  .filter(course => !enrolledCourseIds.includes(course.id.toString()))
                  .map(course => {
                    const isFree = course.price == 0 || course.price == '0' || course.price == '0.00';
                    return (
                      <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col border border-slate-200">
                        {course.course_profile_pic ? (
                          <img src={`${BASE_URL}${course.course_profile_pic}`} alt={course.title} className="w-full h-44 object-cover" />
                        ) : (
                          <div className="w-full h-44 bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                        )}
                        <div className="p-5 flex-grow flex flex-col text-left">
                          <h4 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{course.title}</h4>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{course.description}</p>
                          <div className="flex justify-between items-center text-sm font-semibold bg-slate-50 p-2 rounded border border-slate-100 mb-4 mt-auto">
                            <span className="text-emerald-500">
                              {isFree ? 'Free' : `₹${course.price}`}
                            </span>
                            <span className="text-slate-500">{course.duration || '4 Weeks'}</span>
                          </div>
                          <button 
                            onClick={() => handleEnroll(course)}
                            className="w-full font-semibold py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors"
                          >
                             {isFree ? 'Start Free Course' : 'Enroll & Pay'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                {allCourses.filter(course => !enrolledCourseIds.includes(course.id.toString())).length === 0 && (
                  <p className="text-slate-500 text-base col-span-full text-center py-6">You are enrolled in all available courses!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {activePaymentCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-slate-100 relative">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Buy Course</h3>
            <p className="text-slate-500 mb-6">You will be redirected to Razorpay to complete your secure payment.</p>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Course Title</p>
              <h4 className="text-lg font-bold text-slate-800 mb-3">{activePaymentCourse.title}</h4>
              
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-slate-600">Total Price</span>
                <span className="font-bold text-xl text-emerald-600">₹{activePaymentCourse.price}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={executePayment}
                disabled={isPaying}
                className="w-full bg-emerald-500 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPaying ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${activePaymentCourse.price} with Razorpay`
                )}
              </button>
              <button 
                onClick={() => setActivePaymentCourse(null)}
                disabled={isPaying}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentEnrolledCourses;
