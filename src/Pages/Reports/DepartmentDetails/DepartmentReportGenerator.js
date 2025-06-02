import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * وظيفة لتوليد تقرير PDF للإدارة يدعم اللغة العربية ويتضمن جميع الرسوم البيانية والإحصائيات
 * @param {Object} department - معلومات الإدارة
 * @param {Object} stats - الإحصائيات السريعة
 * @param {Object} chartRefs - مراجع الرسوم البيانية (React refs)
 * @param {Array} dateRange - نطاق التاريخ [تاريخ البداية، تاريخ النهاية]
 * @param {Object} chartData - بيانات الرسوم البيانية
 * @returns {Promise<boolean>} - وعد يتم حله عند اكتمال إنشاء التقرير
 */
/**
 * وظيفة مساعدة لتحويل عنصر HTML إلى صورة بدقة عالية
 */
const elementToImage = async (element, scale = 3) => {
  // إضافة العنصر إلى الصفحة مؤقتًا
  document.body.appendChild(element);

  // تحويل العنصر إلى صورة بدقة عالية
  const canvas = await html2canvas(element, {
    scale: scale, // دقة عالية جدًا
    logging: false,
    useCORS: true,
    allowTaint: true,
    letterRendering: true,
    textRendering: true,
    backgroundColor: '#ffffff' // خلفية بيضاء
  });

  // إزالة العنصر من الصفحة
  document.body.removeChild(element);

  return canvas.toDataURL('image/jpeg', 6.0);
};

/**
 * وظيفة لإنشاء عنصر نصي بدقة عالية
 */
const createTextElement = (text, fontSize = 24, isBold = true, align = 'center') => {
  const element = document.createElement('div');
  element.style.cssText = `
    direction: rtl;
    text-align: ${align};
    padding: 15px;
    width: 800px;
    background-color: #ffffff;
    font-family: Arial, sans-serif;
    font-size: ${fontSize}px;
    font-weight: ${isBold ? 'bold' : 'normal'};
    color: #2c3e50;
    margin-bottom: 10px;
    line-height: 1.4;
  `;
  element.innerHTML = text;
  return element;
};

/**
 * وظيفة لإنشاء جدول بيانات بتنسيق موحد
 */
const createSingleTable = (headers, rows, title = '', pageNum = 1, totalPages = 1, fontSize = 20) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    direction: rtl;
    font-family: Arial, sans-serif;
    width: 700px;
    background-color: #ffffff;
    padding: 10px;
    box-sizing: border-box;
  `;

  // إضافة العنوان
  if (title) {
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      margin-bottom: 10px;
      font-weight: bold;
      font-size: ${fontSize + 2}px;
      color: #2c3e50;
      text-align: center;
    `;
    titleDiv.textContent = title + (totalPages > 1 ? ` (${pageNum}/${totalPages})` : '');
    wrapper.appendChild(titleDiv);
  }

  // إنشاء الجدول
  const table = document.createElement('table');
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    direction: rtl;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
  `;

  // إضافة رؤوس الأعمدة
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  headers.forEach(header => {
    const th = document.createElement('th');
    th.style.cssText = `
      padding: 12px;
      border: 1px solid #b6e3ff;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      font-size: ${fontSize}px;
      background-color: #5bbefa;
      position: relative;
    `;
    th.textContent = String(header || '');
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // إضافة البيانات
  const tbody = document.createElement('tbody');
  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.style.backgroundColor = index % 2 === 0 ? '#f8fcff' : '#ffffff';
    tr.style.transition = 'background-color 0.3s';

    row.forEach(cell => {
      const td = document.createElement('td');
      td.style.cssText = `
        padding: 10px;
        border: 1px solid #b6e3ff;
        text-align: center;
        color: #2c3e50;
        font-size: ${fontSize - 2}px;
      `;
      td.textContent = String(cell || '');
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
};

export const generateDepartmentReport = async (
  department,
  stats,
  chartRefs,
  dateRange,
  chartData
) => {
  try {
    // إنشاء وثيقة PDF جديدة بحجم A4 واتجاه عمودي
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // تعيين اتجاه النص من اليمين إلى اليسار
    pdf.setR2L(true);

    // إضافة خلفية بيضاء للصفحة
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 210, 297, 'F');

    // إضافة شعار الكلية والجامعة
    try {
      // شعار الكلية (يسار)
      const logoCollageImg = new Image();
      logoCollageImg.src = '/logoCollage.jpg';
      await new Promise((resolve) => {
        logoCollageImg.onload = resolve;
        logoCollageImg.onerror = resolve; // في حالة فشل تحميل الصورة
      });

      // شعار الجامعة (يمين)
      const logoUniversityImg = new Image();
      logoUniversityImg.src = '/logoUnivercity.png';
      await new Promise((resolve) => {
        logoUniversityImg.onload = resolve;
        logoUniversityImg.onerror = resolve; // في حالة فشل تحميل الصورة
      });

      // تحويل الشعارات إلى صور باستخدام canvas
      const logoCollageCanvas = document.createElement('canvas');
      const logoUniversityCanvas = document.createElement('canvas');

      // رسم شعار الكلية
      if (logoCollageImg.complete && logoCollageImg.naturalWidth !== 0) {
        logoCollageCanvas.width = logoCollageImg.width;
        logoCollageCanvas.height = logoCollageImg.height;
        const ctxCollage = logoCollageCanvas.getContext('2d');
        ctxCollage.drawImage(logoCollageImg, 0, 0);

        // إضافة شعار الكلية إلى PDF (يسار)
        pdf.addImage(logoCollageCanvas.toDataURL('image/png'), 'PNG', 20, 5, 30, 30);
      }

      // رسم شعار الجامعة
      if (logoUniversityImg.complete && logoUniversityImg.naturalWidth !== 0) {
        logoUniversityCanvas.width = logoUniversityImg.width;
        logoUniversityCanvas.height = logoUniversityImg.height;
        const ctxUniversity = logoUniversityCanvas.getContext('2d');
        ctxUniversity.drawImage(logoUniversityImg, 0, 0);

        // إضافة شعار الجامعة إلى PDF (يمين)
        pdf.addImage(logoUniversityCanvas.toDataURL('image/png'), 'PNG', 160, 5, 30, 30);
      }
    } catch (logoError) {
      console.error('خطأ في تحميل الشعارات:', logoError);
      // استمرار إنشاء التقرير حتى في حالة فشل تحميل الشعارات
    }

    // إنشاء عنوان التقرير بدقة عالية
    const titleElement = createTextElement(`تقرير أداء ${department.name}`, 36, true);
    const titleImage = await elementToImage(titleElement, 4);
    pdf.addImage(titleImage, 'jpeg', 10, 40, 190, 20);

    // إنشاء نص التاريخ بدقة عالية
    const currentDate = new Date().toLocaleDateString('ar-EG');
    const dateElement = createTextElement(`تاريخ التقرير: ${currentDate}`, 24, false);
    const dateImage = await elementToImage(dateElement, 4);
    pdf.addImage(dateImage, 'jpeg', 10, 65, 190, 10);

    // إضافة نطاق التاريخ إذا كان متوفرًا
    if (dateRange[0] && dateRange[1]) {
      const startDateStr = dateRange[0].toLocaleDateString('ar-EG');
      const endDateStr = dateRange[1].toLocaleDateString('ar-EG');
      const rangeElement = createTextElement(`الفترة: من ${startDateStr} إلى ${endDateStr}`, 20, false);
      const rangeImage = await elementToImage(rangeElement, 4);
      pdf.addImage(rangeImage, 'PNG', 10, 80, 190, 10);
    }

    // إضافة خط فاصل
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(10, 95, 200, 95);

    // إضافة عنوان قسم الإحصائيات بدقة عالية
    const statsHeaderElement = createTextElement('الإحصائيات الرئيسية', 28, true, 'right');
    const statsHeaderImage = await elementToImage(statsHeaderElement, 4);
    pdf.addImage(statsHeaderImage, 'PNG', 10, 100, 190, 15);

    // إنشاء جدول الإحصائيات بدقة عالية
    const statsHeaders = ['المؤشر', 'القيمة'];
    const statsRows = [
      ['إجمالي عدد الطلبات', stats.totalRequests || 0],
      ['الطلبات قيد التنفيذ', stats.pendingRequests || 0],
      ['الطلبات المتأخرة', stats.delayedRequests || 0],
      ['الطلبات المقبولة', stats.approvedRequests || 0],
      ['الطلبات المرفوضة', stats.rejectedRequests || 0],
      ['متوسط وقت المعالجة', `${stats.averageProcessingTime || 0} يوم`]
    ];

    const statsTableElement = createSingleTable(
      statsHeaders,
      statsRows,
      'الإحصائيات الرئيسية',
      1,
      1,
      20
    );

    const statsTableImage = await elementToImage(statsTableElement, 4);
    pdf.addImage(statsTableImage, 'jpeg', 10, 120, 190, 60);

    let yPos = 200; // زيادة المسافة قليلًا لتجنب التداخل

    // إضافة الرسوم البيانية إلى PDF
    if (chartRefs.pieChartRef && chartRefs.pieChartRef.current) {
      // بدء صفحة جديدة للمخطط الدائري
      pdf.addPage();
      yPos = 20;

      const chartTitleElement = createTextElement('حالات الطلبات', 26, true, 'right');
      const chartTitleImage = await elementToImage(chartTitleElement, 4);

      pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
      yPos += 25;

      // إضافة مخطط دائري بجودة عالية
      const pieChartCanvas = await html2canvas(chartRefs.pieChartRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // إضافة الرسم البياني بحجم مناسب
      const imgWidth = 140;
      const imgHeight = Math.min((pieChartCanvas.height * imgWidth) / pieChartCanvas.width, 120);
      pdf.addImage(pieChartCanvas.toDataURL('image/jpeg', 6.0), 'jpeg', 35, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;

      // إنشاء جدول النسب
      const statusHeaders = ['حالة الطلب', 'العدد', 'النسبة'];
      const statusRows = [
        ['قيد التنفيذ', stats.pendingRequests, `${Math.round(stats.pendingRequests / stats.totalRequests * 100)}%`],
        ['متأخرة', stats.delayedRequests, `${Math.round(stats.delayedRequests / stats.totalRequests * 100)}%`],
        ['مقبولة', stats.approvedRequests, `${Math.round(stats.approvedRequests / stats.totalRequests * 100)}%`],
        ['مرفوضة', stats.rejectedRequests, `${Math.round(stats.rejectedRequests / stats.totalRequests * 100)}%`]
      ];

      const statusTableElement = createSingleTable(
        statusHeaders,
        statusRows,
        'تفاصيل حالات الطلبات',
        1,
        1,
        16
      );

      const statusTableImage = await elementToImage(statusTableElement, 4);
      pdf.addImage(statusTableImage, 'jpeg', 15, yPos, 180, 45);
    }

    // إضافة مخطط متوسط وقت المعالجة
    if (chartRefs.processingTimeChartRef && chartRefs.processingTimeChartRef.current) {
      // بدء صفحة جديدة لمخطط وقت المعالجة
      pdf.addPage();
      yPos = 20;

      const chartTitleElement = createTextElement('متوسط وقت المعالجة', 26, true, 'right');
      const chartTitleImage = await elementToImage(chartTitleElement, 4);

      pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
      yPos += 25;

      const chartCanvas = await html2canvas(chartRefs.processingTimeChartRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 160;
      const imgHeight = Math.min((chartCanvas.height * imgWidth) / chartCanvas.width, 100);
      pdf.addImage(chartCanvas.toDataURL('image/jpeg', 6.0), 'jpeg', 25, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;

      const processingHeaders = ['نوع الطلب', 'متوسط الوقت (يوم)'];
      const processingRows = chartData.processingTimes.map((time, index) => {
        const requestTypes = ['طلب التحاق', 'ايقاف قيد', 'الغاء تسجيل', 'طلب مد', 'طلب منح'];
        return [requestTypes[index] || `نوع ${index + 1}`, time];
      });

      const processingTableElement = createSingleTable(
        processingHeaders,
        processingRows,
        'تفاصيل متوسط وقت المعالجة',
        1,
        1,
        16
      );

      const processingTableImage = await elementToImage(processingTableElement, 4);
      pdf.addImage(processingTableImage, 'jpeg', 15, yPos, 180, 45);
    }

    // إضافة مخطط عدد الطلبات
    if (chartRefs.requestsCountChartRef && chartRefs.requestsCountChartRef.current) {
      // بدء صفحة جديدة لمخطط عدد الطلبات
      pdf.addPage();
      yPos = 20;

      const chartTitleElement = createTextElement('عدد الطلبات التي وصلت للإدارة', 26, true, 'right');
      const chartTitleImage = await elementToImage(chartTitleElement, 4);

      pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
      yPos += 25;

      const chartCanvas = await html2canvas(chartRefs.requestsCountChartRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 160;
      const imgHeight = Math.min((chartCanvas.height * imgWidth) / chartCanvas.width, 100);
      pdf.addImage(chartCanvas.toDataURL('image/jpeg', 6.0), 'jpeg', 25, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;

      const requestsHeaders = ['نوع الطلب', 'عدد الطلبات', 'النسبة'];
      const total = chartData.requestsCount.reduce((sum, current) => sum + current, 0);
      const requestsRows = chartData.requestsCount.map((count, index) => {
        const requestTypes = ['طلب التحاق', 'ايقاف قيد', 'الغاء تسجيل', 'طلب مد', 'طلب منح'];
        const percentage = Math.round((count / total) * 100);
        return [requestTypes[index] || `نوع ${index + 1}`, count, `${percentage}%`];
      });

      const requestsTableElement = createSingleTable(
        requestsHeaders,
        requestsRows,
        'تفاصيل عدد الطلبات',
        1,
        1,
        16
      );

      const requestsTableImage = await elementToImage(requestsTableElement, 4);
      pdf.addImage(requestsTableImage, 'jpeg', 15, yPos, 180, 45);
    }

    // إضافة مخطط التحليل الزمني
    if (chartRefs.timeAnalysisChartRef && chartRefs.timeAnalysisChartRef.current) {
      // بدء صفحة جديدة لمخطط التحليل الزمني
      pdf.addPage();
      yPos = 20;

      const chartTitleElement = createTextElement('التحليل الزمني للطلبات', 26, true, 'right');
      const chartTitleImage = await elementToImage(chartTitleElement, 4);

      pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
      yPos += 25;

      const chartCanvas = await html2canvas(chartRefs.timeAnalysisChartRef.current, {
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 160;
      const imgHeight = Math.min((chartCanvas.height * imgWidth) / chartCanvas.width, 100);
      pdf.addImage(chartCanvas.toDataURL('image/jpeg', 6.0), 'jpeg', 25, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;

      // إنشاء جدول التحليل الزمني
      const timeHeaders = ['التاريخ', 'الطلبات المستلمة', 'الطلبات المعالجة'];

      // حساب الفترة الزمنية
      const diffTime = Math.abs(dateRange[1] - dateRange[0]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const timeRows = chartData.timeLabels.map((label, index) => {
        let dateStr;
        if (diffDays <= 31) {
          // عرض يومي
          const date = new Date(dateRange[0]);
          date.setDate(date.getDate() + index);
          dateStr = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } else if (diffDays <= 365) {
          // عرض شهري
          const date = new Date(dateRange[0]);
          date.setMonth(date.getMonth() + index);
          dateStr = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long'
          });
        } else {
          // عرض سنوي
          const date = new Date(dateRange[0]);
          date.setFullYear(date.getFullYear() + index);
          dateStr = date.toLocaleDateString('ar-EG', {
            year: 'numeric'
          });
        }

        return [
          dateStr,
          chartData.receivedData[index] || 0,
          chartData.processedData[index] || 0
        ];
      });

      // حساب عدد الصفوف التي يمكن عرضها في المساحة المتبقية من الصفحة الحالية
      const remainingSpace = 277 - yPos; // 277 هو الارتفاع الكلي للصفحة A4
      const rowHeight = 4; // ارتفاع الصف الواحد
      const headerHeight = 45; // ارتفاع رأس الجدول والعنوان
      const maxRowsFirstPage = Math.floor((remainingSpace - headerHeight) / rowHeight);

      // تقسيم الصفوف بين الصفحات
      let currentPage = 0;
      let rowsProcessed = 0;

      while (rowsProcessed < timeRows.length) {
        const isFirstPage = currentPage === 0;
        const maxRowsCurrentPage = isFirstPage ? maxRowsFirstPage : 20;

        // تحديد الصفوف للصفحة الحالية
        const startIdx = rowsProcessed;
        const endIdx = Math.min(startIdx + maxRowsCurrentPage, timeRows.length);
        const currentPageRows = timeRows.slice(startIdx, endIdx);

        if (!isFirstPage) {
          pdf.addPage();
          yPos = 20;
        }

        const timeTableElement = createSingleTable(
          timeHeaders,
          currentPageRows,
          'تفاصيل التحليل الزمني',
          currentPage + 1,
          Math.ceil((timeRows.length - maxRowsFirstPage) / 20) + 1,
          13
        );

        timeTableElement.style.cssText = `
          direction: rtl;
          font-family: Arial, sans-serif;
          width: 750px;
          background-color: #ffffff;
          padding: 10px;
          box-sizing: border-box;
        `;

        const timeTableImage = await elementToImage(timeTableElement, 6);
        const tableHeight = Math.min(45 + (currentPageRows.length * 4), isFirstPage ? remainingSpace : 220);
        pdf.addImage(timeTableImage, 'jpeg', 10, yPos, 190, tableHeight);

        rowsProcessed += currentPageRows.length;
        currentPage++;
      }
    }

    // إضافة مخطط أسباب الرفض
    if (chartRefs.rejectionChartRef && chartRefs.rejectionChartRef.current) {
      try {
        pdf.addPage();
        yPos = 20;

        const chartCanvas = await html2canvas(chartRefs.rejectionChartRef.current, {
          scale: 3,
          logging: false,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        // إضافة عنوان القسم
        const rejectionTitleElement = createTextElement('نسب أسباب الرفض', 26, true, 'right');
        const rejectionTitleImage = await elementToImage(rejectionTitleElement);
        pdf.addImage(rejectionTitleImage, 'jpeg', 10, yPos, 190, 15);
        yPos += 25;

        // الحصول على canvas المخطط من خلال Chart.js
        const chart = chartRefs.rejectionChartRef.current;

        // التحقق من وجود المخطط وcanvas الخاص به
        if (!chart || !chart.chartCanvas) {
          throw new Error('لم يتم العثور على canvas المخطط');
        }

        // تحويل المخطط إلى صورة مباشرة
        const chartImage = chart.chartCanvas.toDataURL('image/jpeg', 6.0);

        // إضافة المخطط مباشرة إلى PDF
        const imgWidth = 140;
        const imgHeight = Math.min((chart.chartCanvas.height * imgWidth) / chart.chartCanvas.width, 120);
        pdf.addImage(chartImage, 'jpeg', 35, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 20;

        // إضافة جدول البيانات
        const rejectionHeaders = ['سبب الرفض', 'النسبة المئوية'];
        const rejectionRows = [
          ['نقص في الأوراق', '40%'],
          ['انتهاء معاد القيد', '25%'],
          ['لم يجتاز', '20%'],
          ['أسباب أخرى', '15%']
        ];

        const rejectionTableElement = createSingleTable(
          rejectionHeaders,
          rejectionRows,
          'تفاصيل أسباب الرفض',
          1,
          1,
          16
        );

        const rejectionTableImage = await elementToImage(rejectionTableElement, 4);
        pdf.addImage(rejectionTableImage, 'jpeg', 15, yPos, 180, 45);
      } catch (error) {
        console.error('خطأ في معالجة مخطط أسباب الرفض:', error);
      }
    }

    // إضافة أرقام الصفحات بدقة عالية
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);

      // إنشاء رقم الصفحة بدقة عالية
      const pageNumberElement = createTextElement(`الصفحة ${i} من ${pageCount}`, 16, false, 'center');
      const pageNumberImage = await elementToImage(pageNumberElement, 4);

      pdf.addImage(pageNumberImage, 'jpeg', 70, 280, 70, 10);
    }

    // حفظ الملف
    pdf.save(`تقرير_${department.name}_${new Date().toISOString().split('T')[0]}.pdf`);

    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء التقرير:', error);
    return false;
  }
};
/**
 * وظيفة مساعدة لتحويل مخطط إلى صورة
 */
const convertChartToImage = async (chartRef) => {
  if (!chartRef?.current) return null;
  try {
    const canvas = await html2canvas(chartRef.current, {
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    return canvas.toDataURL('image/jpeg', 6.0);
  } catch (error) {
    console.error('خطأ في تحويل المخطط إلى صورة:', error);
    return null;
  }
};

/**
 * وظيفة مساعدة لإنشاء جدول بيانات
 */
const createDataTable = async (pdf, headers, rows, title, yPosition) => {
  const tableElement = createSingleTable(
    headers,
    rows,
    title,
    1,
    1,
    16
  );

  const tableImage = await elementToImage(tableElement, 4);
  if (tableImage) {
    pdf.addImage(tableImage, 'jpeg', 15, yPosition, 180, 45);
  }
};

/**
 * وظيفة مساعدة لتحويل مخطط إلى صورة
 * @param {React.RefObject} ref - مرجع المكون
 * @returns {Promise<string>} - وعد يحتوي على صورة بتنسيق data URL
 */
export const chartToImage = async (ref) => {
  if (!ref || !ref.current) return null;

  try {
    const canvas = await html2canvas(ref.current);
    return canvas.toDataURL('image/jpeg');
  } catch (error) {
    console.error('حدث خطأ أثناء تحويل المخطط إلى صورة:', error);
    return null;
  }
};

