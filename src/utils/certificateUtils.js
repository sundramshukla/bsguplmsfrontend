import { jsPDF } from 'jspdf';
import { BASE_URL } from '../config';

/**
 * Generate a high-resolution PDF certificate Blob/File from template configuration & student data
 */
export const generateCertificatePdf = async ({
  studentName = 'Student Name',
  district = '',
  certificateNumber = '',
  courseTitle = '',
  templateConfig = {}
}) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // High-resolution certificate dimensions (A4 Landscape 300 DPI approx)
      const WIDTH = 2000;
      const HEIGHT = 1414;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const renderTextOverlay = () => {
        // 1. Render Student Name
        const nameX = (templateConfig.namePositionX ?? 50) / 100 * WIDTH;
        const nameY = (templateConfig.namePositionY ?? 50) / 100 * HEIGHT;
        const rawFontSize = templateConfig.nameFontSize ?? 40;
        const scaledFontSize = Math.round(rawFontSize * 2.8); // scale for 2000px canvas

        const fontFamily = templateConfig.nameFontFamily || 'Pinyon Script';
        const fontWeight = templateConfig.nameFontWeight || 'bold';
        ctx.font = `${fontWeight} ${scaledFontSize}px '${fontFamily}', 'Cinzel', 'Playfair Display', serif`;
        ctx.fillStyle = templateConfig.nameColor || '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(studentName, nameX, nameY);

        if (templateConfig.nameUnderline) {
          const textMetrics = ctx.measureText(studentName);
          const underlineY = nameY + (scaledFontSize / 2) + 6;
          ctx.beginPath();
          ctx.strokeStyle = templateConfig.nameColor || '#1e293b';
          ctx.lineWidth = 3;
          ctx.moveTo(nameX - textMetrics.width / 2, underlineY);
          ctx.lineTo(nameX + textMetrics.width / 2, underlineY);
          ctx.stroke();
        }

        // 2. Render District if available / configured
        if (district || templateConfig.showDistrict) {
          const distText = district ? `District: ${district}` : '';
          const distX = (templateConfig.districtPositionX ?? 50) / 100 * WIDTH;
          const distY = (templateConfig.districtPositionY ?? 58) / 100 * HEIGHT;
          const distFontSize = Math.round((templateConfig.districtFontSize ?? 14) * 2.5);
          ctx.font = `600 ${distFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.districtColor || '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (distText) {
            ctx.fillText(distText, distX, distY);
          }
        }

        // 3. Render Certificate Number
        if (certificateNumber || templateConfig.showCertId) {
          const certText = certificateNumber ? `Certificate No: ${certificateNumber}` : '';
          const certX = (templateConfig.certIdPositionX ?? 75) / 100 * WIDTH;
          const certY = (templateConfig.certIdPositionY ?? 80) / 100 * HEIGHT;
          const certFontSize = Math.round((templateConfig.certIdFontSize ?? 13) * 2.5);
          ctx.font = `600 ${certFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.certIdColor || '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (certText) {
            ctx.fillText(certText, certX, certY);
          }
        }

        // 4. Render Date
        if (templateConfig.showDate) {
          const dateText = `Date: ${new Date().toLocaleDateString('en-GB')}`;
          const dateX = (templateConfig.datePositionX ?? 25) / 100 * WIDTH;
          const dateY = (templateConfig.datePositionY ?? 80) / 100 * HEIGHT;
          const dateFontSize = Math.round((templateConfig.dateFontSize ?? 13) * 2.5);
          ctx.font = `600 ${dateFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.dateColor || '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(dateText, dateX, dateY);
        }

        // 5. Render Course Title if enabled
        if (templateConfig.showCourseTitle && courseTitle) {
          const cX = (templateConfig.courseTitlePositionX ?? 50) / 100 * WIDTH;
          const cY = (templateConfig.courseTitlePositionY ?? 62) / 100 * HEIGHT;
          const cFontSize = Math.round((templateConfig.courseTitleFontSize ?? 18) * 2.5);
          ctx.font = `700 ${cFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.courseTitleColor || '#047857';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(courseTitle, cX, cY);
        }

        // Generate PDF using jsPDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [WIDTH, HEIGHT]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, WIDTH, HEIGHT);
        const pdfBlob = pdf.output('blob');
        const fileName = `${certificateNumber || 'Certificate'}.pdf`;
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

        resolve({
          pdf,
          blob: pdfBlob,
          file: pdfFile,
          dataUrl: canvas.toDataURL('image/png')
        });
      };

      if (templateConfig.bgImageBase64) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.onload = () => {
          ctx.drawImage(bgImg, 0, 0, WIDTH, HEIGHT);
          renderTextOverlay();
        };
        bgImg.onerror = () => {
          // Fallback if image fails to load
          drawClassicFallback(ctx, WIDTH, HEIGHT, templateConfig, courseTitle);
          renderTextOverlay();
        };
        bgImg.src = templateConfig.bgImageBase64;
      } else {
        drawClassicFallback(ctx, WIDTH, HEIGHT, templateConfig, courseTitle);
        renderTextOverlay();
      }
    } catch (err) {
      reject(err);
    }
  });
};

const drawClassicFallback = (ctx, WIDTH, HEIGHT, templateConfig, courseTitle) => {
  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Gold border
  ctx.lineWidth = 30;
  ctx.strokeStyle = '#fbbf24';
  ctx.strokeRect(30, 30, WIDTH - 60, HEIGHT - 60);

  // Inner dashed border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0f172a';
  ctx.setLineDash([20, 15]);
  ctx.strokeRect(70, 70, WIDTH - 140, HEIGHT - 140);
  ctx.setLineDash([]);

  // Emblems and static titles
  ctx.font = '80px serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚜️', WIDTH / 2, 220);

  ctx.font = "900 65px 'Cinzel', serif";
  ctx.fillStyle = templateConfig.textColor || '#1e293b';
  ctx.fillText(templateConfig.title || 'THE BHARAT SCOUTS & GUIDES', WIDTH / 2, 330);

  ctx.font = "800 30px 'Inter', sans-serif";
  ctx.fillStyle = '#d97706';
  ctx.fillText((templateConfig.subHeader || 'UTTAR PRADESH STATE HEADQUARTERS').toUpperCase(), WIDTH / 2, 390);

  ctx.font = "italic 600 32px 'Inter', sans-serif";
  ctx.fillStyle = '#64748b';
  ctx.fillText(templateConfig.certificationText || 'This is to certify that', WIDTH / 2, 490);

  ctx.font = "500 30px 'Inter', sans-serif";
  ctx.fillStyle = '#334155';
  ctx.fillText(templateConfig.descriptionText || 'has successfully completed the online training syllabus and passed the qualified examinations of the', WIDTH / 2, 850);

  if (courseTitle) {
    ctx.font = "800 40px 'Inter', sans-serif";
    ctx.fillStyle = '#047857';
    ctx.fillText(courseTitle, WIDTH / 2, 930);
  }
};

/**
 * Save generated Certificate PDF to backend: POST /user/save-certificate/
 */
export const saveCertificateToBackend = async ({
  userId,
  certificateNumber,
  pdfFile
}) => {
  if (!userId || !certificateNumber || !pdfFile) {
    console.warn("saveCertificateToBackend missing required fields:", { userId, certificateNumber, hasFile: Boolean(pdfFile) });
    return null;
  }

  try {
    const fd = new FormData();
    fd.append('user_id', userId.toString());
    fd.append('certificate_number', certificateNumber);
    fd.append('certificate_file', pdfFile);

    const res = await fetch(`${BASE_URL}/user/save-certificate/`, {
      method: 'POST',
      body: fd
    });

    const data = await res.json().catch(() => ({}));
    console.log("saveCertificateToBackend response:", data);
    return data;
  } catch (err) {
    console.error("Error saving certificate to backend:", err);
    return null;
  }
};
