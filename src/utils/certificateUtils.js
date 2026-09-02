import { jsPDF } from 'jspdf';
import { BASE_URL } from '../config';

/**
 * Generate a high-resolution PDF certificate using HTML5 Canvas & jsPDF
 */
export const generateCertificatePdf = ({
  studentName = 'Sundram Shukla',
  district = '',
  certificateNumber = '',
  courseTitle = '',
  templateConfig = {}
}) => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // High-resolution certificate dimensions (A4 Landscape approx 2000 x 1414 px)
      const WIDTH = 2000;
      const HEIGHT = 1414;
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const renderTextOverlay = () => {
        // 1. Render Student Name
        const nameX = (templateConfig.namePositionX ?? 50) / 100 * WIDTH;
        const nameY = (templateConfig.namePositionY ?? 49) / 100 * HEIGHT;
        const rawFontSize = templateConfig.nameFontSize ?? 40;
        const scaledFontSize = Math.round(rawFontSize * 2.8);

        const fontFamily = templateConfig.nameFontFamily || 'Pinyon Script';
        const fontWeight = templateConfig.nameFontWeight || 'bold';
        ctx.font = `${fontWeight} ${scaledFontSize}px '${fontFamily}', 'Cinzel', 'Playfair Display', serif`;
        ctx.fillStyle = templateConfig.nameColor || '#1e293b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(studentName, nameX, nameY);

        if (templateConfig.nameUnderline !== false) {
          const textMetrics = ctx.measureText(studentName);
          const underlineY = nameY + (scaledFontSize / 2) + 6;
          ctx.beginPath();
          ctx.strokeStyle = templateConfig.nameColor || '#fbbf24';
          ctx.lineWidth = 3;
          ctx.moveTo(nameX - textMetrics.width / 2, underlineY);
          ctx.lineTo(nameX + textMetrics.width / 2, underlineY);
          ctx.stroke();
        }

        // 2. Render District
        const formattedDistrict = district ? `District: ${district}` : '';
        if (formattedDistrict || templateConfig.showDistrict) {
          const distX = (templateConfig.districtPositionX ?? 50) / 100 * WIDTH;
          const distY = (templateConfig.districtPositionY ?? 56) / 100 * HEIGHT;
          const distFontSize = Math.round((templateConfig.districtFontSize ?? 14) * 2.5);
          ctx.font = `700 ${distFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.districtColor || '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (formattedDistrict) {
            ctx.fillText(formattedDistrict, distX, distY);
          }
        }

        // 3. Render Course Title
        if (courseTitle) {
          const cX = (templateConfig.courseTitlePositionX ?? 50) / 100 * WIDTH;
          const cY = (templateConfig.courseTitlePositionY ?? 65) / 100 * HEIGHT;
          const cFontSize = Math.round((templateConfig.courseTitleFontSize ?? 18) * 2.5);
          ctx.font = `800 ${cFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.courseTitleColor || '#047857';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(courseTitle, cX, cY);
        }

        // 4. Render Certificate Number
        const formattedCertId = certificateNumber ? `Certificate No: ${certificateNumber}` : '';
        if (formattedCertId || templateConfig.showCertId) {
          const certX = (templateConfig.certIdPositionX ?? 75) / 100 * WIDTH;
          const certY = (templateConfig.certIdPositionY ?? 82) / 100 * HEIGHT;
          const certFontSize = Math.round((templateConfig.certIdFontSize ?? 13) * 2.4);
          ctx.font = `700 ${certFontSize}px 'Inter', sans-serif`;
          ctx.fillStyle = templateConfig.certIdColor || '#475569';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (formattedCertId) {
            ctx.fillText(formattedCertId, certX, certY);
          }
        }

        // 5. Render Date
        const dateText = `Date: ${new Date().toLocaleDateString('en-GB')}`;
        const dateX = (templateConfig.datePositionX ?? 25) / 100 * WIDTH;
        const dateY = (templateConfig.datePositionY ?? 82) / 100 * HEIGHT;
        const dateFontSize = Math.round((templateConfig.dateFontSize ?? 13) * 2.4);
        ctx.font = `700 ${dateFontSize}px 'Inter', sans-serif`;
        ctx.fillStyle = templateConfig.dateColor || '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dateText, dateX, dateY);

        // Generate PDF using jsPDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [WIDTH, HEIGHT]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, WIDTH, HEIGHT);
        const pdfBlob = pdf.output('blob');
        const fileName = `${certificateNumber || 'BSGUP_Certificate'}.pdf`;
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

const drawClassicFallback = (ctx, WIDTH, HEIGHT, templateConfig) => {
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
  ctx.fillText('⚜️', WIDTH / 2, 200);

  ctx.font = "900 60px 'Cinzel', serif";
  ctx.fillStyle = templateConfig.textColor || '#1e293b';
  ctx.fillText(templateConfig.title || 'THE BHARAT SCOUTS & GUIDES', WIDTH / 2, 290);

  ctx.font = "800 28px 'Inter', sans-serif";
  ctx.fillStyle = '#d97706';
  ctx.fillText((templateConfig.subHeader || 'UTTAR PRADESH STATE HEADQUARTERS').toUpperCase(), WIDTH / 2, 345);

  ctx.font = "italic 600 30px 'Inter', sans-serif";
  ctx.fillStyle = '#64748b';
  ctx.fillText(templateConfig.certificationText || 'This is to certify that', WIDTH / 2, 420);

  ctx.font = "500 28px 'Inter', sans-serif";
  ctx.fillStyle = '#334155';
  ctx.fillText(
    templateConfig.descriptionText || 'has successfully completed the online training syllabus and passed the qualified examinations of the',
    WIDTH / 2,
    770
  );

  // Signatures
  const sigY = 1200;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#94a3b8';

  // Left signature line
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.25 - 120, sigY);
  ctx.lineTo(WIDTH * 0.25 + 120, sigY);
  ctx.stroke();

  ctx.font = "italic 600 24px 'Inter', sans-serif";
  ctx.fillStyle = templateConfig.textColor || '#1e293b';
  ctx.fillText(templateConfig.sigLeftTitle || 'State Commissioner', WIDTH * 0.25, sigY + 35);
  ctx.font = "700 18px 'Inter', sans-serif";
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(templateConfig.sigLeftSub || 'BSGUP Head Office', WIDTH * 0.25, sigY + 65);

  // Right signature line
  ctx.beginPath();
  ctx.moveTo(WIDTH * 0.75 - 120, sigY);
  ctx.lineTo(WIDTH * 0.75 + 120, sigY);
  ctx.stroke();

  ctx.font = "italic 600 24px 'Inter', sans-serif";
  ctx.fillStyle = templateConfig.textColor || '#1e293b';
  ctx.fillText(templateConfig.sigRightTitle || 'State Secretary', WIDTH * 0.75, sigY + 35);
  ctx.font = "700 18px 'Inter', sans-serif";
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(templateConfig.sigRightSub || 'BSGUP Lucknow', WIDTH * 0.75, sigY + 65);
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
