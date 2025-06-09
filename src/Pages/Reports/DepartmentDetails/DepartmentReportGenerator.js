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
 * وظيفة مساعدة لتحويل عنصر HTML إلى صورة بدقة عالية مع معالجة الأخطاء
 */
const elementToImage = async (element, scale = 2) => {
  try {
    // التحقق من وجود العنصر
    if (!element) {
      console.error('العنصر غير موجود');
      return null;
    }

    // إضافة العنصر إلى الصفحة مؤقتًا
    const isElementInDOM = document.body.contains(element);
    if (!isElementInDOM) {
      document.body.appendChild(element);
    }

    // انتظار قصير للتأكد من رسم العنصر
    await new Promise(resolve => setTimeout(resolve, 100));

    // تحويل العنصر إلى صورة
    const canvas = await html2canvas(element, {
      scale: scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      textRendering: true,
      backgroundColor: '#ffffff',
      width: element.offsetWidth,
      height: element.offsetHeight
    });

    // إزالة العنصر من الصفحة إذا تم إضافته
    if (!isElementInDOM && document.body.contains(element)) {
      document.body.removeChild(element);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('خطأ في تحويل العنصر إلى صورة:', error);
    return null;
  }
};

/**
 * وظيفة لإنشاء عنصر نصي بدقة عالية
 */
const createTextElement = (text, fontSize = 24, isBold = true, align = 'center') => {
  const element = document.createElement('div');
  element.style.cssText = `
      direction: rtl;
      text-align: ${align};
      padding: 10px;
      width: 600px;
      background-color: #ffffff;
      font-family: 'Arial', 'Tahoma', sans-serif;
      font-size: ${fontSize}px;
      font-weight: ${isBold ? 'bold' : 'normal'};
      color: #2c3e50;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
    `;
  element.textContent = text;
  return element;
};

/**
 * وظيفة مساعدة لإنشاء جدول بيانات بتنسيق موحد
 */
const createSingleTable = (headers, rows, title = '', pageNum = 1, totalPages = 1, fontSize = 14) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    direction: rtl;
    font-family: 'Arial', 'Tahoma', sans-serif;
    width: 500px;
    background-color: #ffffff;
    padding: 10px;
    box-sizing: border-box;
    margin: 5px auto;
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
    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;
  `;

  // إضافة رؤوس الأعمدة
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  headers.forEach(header => {
    const th = document.createElement('th');
    th.style.cssText = `
      padding: 8px 6px;
      border: 1px solid #3498db;
      font-weight: bold;
      color: #ffffff;
      text-align: center;
      font-size: ${fontSize}px;
      background-color: #3498db;
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
    tr.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

    row.forEach(cell => {
      const td = document.createElement('td');
      td.style.cssText = `
        padding: 6px 4px;
        border: 1px solid #dee2e6;
        text-align: center;
        color: #2c3e50;
        font-size: ${fontSize - 2}px;
      `;
      td.textContent = typeof cell === 'number' ? cell.toString() : String(cell || '');
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
};

/**
 * وظيفة مساعدة لتحميل الصور مع معالجة الأخطاء
 */
const loadImage = (src) => {
  return new Promise((resolve) => {
    console.log('محاولة تحميل الصورة:', src);
    const img = new Image();
    img.crossOrigin = "Anonymous";  // للسماح بتحميل الصور من مصادر مختلفة
    img.onload = () => {
      console.log('تم تحميل الصورة بنجاح:', src);
      resolve(img);
    };
    img.onerror = () => {
      console.warn(`فشل في تحميل الصورة: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * وظيفة مساعدة لتحويل مخطط إلى صورة بدقة عالية
 */
const chartToCanvas = async (chartRef, width = 600, height = 400) => {
  try {
    console.log('بدء تحويل المخطط', { hasRef: !!chartRef?.current });

    if (!chartRef?.current) {
      console.warn('المخطط غير موجود');
      return null;
    }

    const chartElement = chartRef.current;
    console.log('تم العثور على عنصر المخطط', {
      width: chartElement.offsetWidth,
      height: chartElement.offsetHeight
    });

    // حفظ الخصائص الأصلية
    const originalStyles = {
      display: chartElement.style.display,
      visibility: chartElement.style.visibility,
      position: chartElement.style.position,
      width: chartElement.style.width,
      height: chartElement.style.height,
      top: chartElement.style.top,
      left: chartElement.style.left,
      backgroundColor: chartElement.style.backgroundColor
    };

    // تعيين الخصائص المطلوبة للتصوير
    chartElement.style.display = 'block';
    chartElement.style.visibility = 'visible';
    chartElement.style.position = 'fixed';
    chartElement.style.width = `${width}px`;
    chartElement.style.height = `${height}px`;
    chartElement.style.top = '-9999px';
    chartElement.style.left = '-9999px';
    chartElement.style.backgroundColor = '#ffffff';

    // إضافة العنصر للصفحة مؤقتاً إذا لم يكن موجوداً
    const isInDocument = document.body.contains(chartElement);
    if (!isInDocument) {
      document.body.appendChild(chartElement);
    }

    // انتظار لحظة للتأكد من تحديث DOM
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('بدء تحويل المخطط إلى canvas');
    const canvas = await html2canvas(chartElement, {
      scale: 3,
      logging: true,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: width,
      height: height,
      onclone: (clonedDoc, element) => {
        console.log('تم استنساخ المخطط', {
          hasClonedElement: !!element,
          dimensions: {
            width: element?.offsetWidth,
            height: element?.offsetHeight
          }
        });
      }
    });

    // إعادة الخصائص الأصلية
    Object.keys(originalStyles).forEach(key => {
      chartElement.style[key] = originalStyles[key];
    });

    // إزالة العنصر من الصفحة إذا تمت إضافته مؤقتاً
    if (!isInDocument && document.body.contains(chartElement)) {
      document.body.removeChild(chartElement);
    }

    console.log('تم تحويل المخطط بنجاح');
    return canvas;
  } catch (error) {
    console.error('خطأ في تحويل المخطط إلى canvas:', error);
    return null;
  }
};

/**
 * وظيفة لإضافة مخطط وجدوله إلى PDF
 */
const addChartAndTable = async (pdf, chartRef, title, data, tableHeaders, tableRows, yPos) => {
  try {
    console.log(`بدء إضافة ${title}`, {
      hasChartRef: !!chartRef?.current,
      dataLength: data?.length,
      yPos,
      tableHeaders,
      rowsCount: tableRows?.length
    });

    // إضافة العنوان
    const titleElement = createTextElement(title, 24, true);
    const titleImage = await elementToImage(titleElement, 2);

    if (titleImage) {
      pdf.addImage(titleImage, 'JPEG', 15, yPos, 180, 12);
      yPos += 20;
    }

    // إضافة المخطط
    if (chartRef?.current) {
      console.log('تحويل المخطط إلى صورة:', title);
      const chartCanvas = await chartToCanvas(chartRef);

      if (chartCanvas) {
        console.log('تم تحويل المخطط بنجاح:', title);
        const imgWidth = 160;
        const imgHeight = 100;  // ثابت لجميع المخططات
        pdf.addImage(chartCanvas.toDataURL('image/jpeg', 1.0), 'JPEG', 25, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 15;
      } else {
        console.error('فشل في تحويل المخطط:', title);
      }
    }

    // إضافة الجدول
    if (tableRows?.length > 0) {
      console.log('إضافة الجدول:', title, { rowsCount: tableRows.length });
      const tableElement = createSingleTable(tableHeaders, tableRows, '', 1, 1, 12);
      const tableImage = await elementToImage(tableElement, 2);

      if (tableImage) {
        pdf.addImage(tableImage, 'JPEG', 15, yPos, 180, 40);
        yPos += 50;
      }
    }

    return { success: true, newYPos: yPos };
  } catch (error) {
    console.error(`خطأ في إضافة ${title}:`, error);
    return { success: false, newYPos: yPos };
  }
};

export const generateDepartmentReport = async (
  department,
  stats,
  chartRefs,
  dateRange,
  chartData
) => {
  try {
    console.log('بدء إنشاء التقرير...', {
      hasStats: !!stats,
      hasChartRefs: !!chartRefs,
      availableCharts: Object.keys(chartRefs || {}),
      hasChartData: !!chartData,
      availableData: Object.keys(chartData || {})
    });

    // إنشاء وثيقة PDF جديدة
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = 20;

    // إضافة الشعارات
    try {
      console.log('محاولة إضافة الشعارات');
      const logoCollage = '/logoCollage.jpg';  // تأكد من المسار الصحيح
      const logoUniversity = '/logoUnivercity.png';  // تأكد من المسار الصحيح

      const [collageImg, universityImg] = await Promise.all([
        loadImage(logoCollage),
        loadImage(logoUniversity)
      ]);

      if (collageImg) {
        pdf.addImage(collageImg, 'JPEG', 20, 10, 25, 25);
      }
      if (universityImg) {
        pdf.addImage(universityImg, 'PNG', 165, 10, 25, 25);
      }

      yPos = 45;
    } catch (logoError) {
      console.error('خطأ في تحميل الشعارات:', logoError);
    }

    // إضافة عنوان التقرير
    const titleElement = createTextElement(`تقرير أداء ${department.name}`, 32, true);
    const titleImage = await elementToImage(titleElement, 2);
    if (titleImage) {
      pdf.addImage(titleImage, 'JPEG', 15, yPos, 180, 15);
      yPos += 25;
    }

    // إضافة تاريخ التقرير
    const currentDate = new Date().toLocaleDateString('ar-EG');
    const dateElement = createTextElement(`تاريخ التقرير: ${currentDate}`, 20, false);
    const dateImage = await elementToImage(dateElement, 2);
    if (dateImage) {
      pdf.addImage(dateImage, 'JPEG', 15, yPos, 180, 10);
      yPos += 20;
    }

    // إضافة نطاق التاريخ
    if (dateRange?.[0] && dateRange?.[1]) {
      const startDateStr = dateRange[0].toLocaleDateString('ar-EG');
      const endDateStr = dateRange[1].toLocaleDateString('ar-EG');
      const rangeElement = createTextElement(`الفترة: من ${startDateStr} إلى ${endDateStr}`, 18, false);
      const rangeImage = await elementToImage(rangeElement, 2);
      if (rangeImage) {
        pdf.addImage(rangeImage, 'JPEG', 15, yPos, 180, 10);
        yPos += 20;
      }
    }

    // توزيع حالات الطلبات (Pie Chart)
    if (chartRefs?.pieChartRef?.current) {
      console.log('إضافة مخطط توزيع حالات الطلبات');
      pdf.addPage();
      yPos = 20;

      const totalRequests = stats.totalRequests || 1;
      const statusHeaders = ['حالة الطلب', 'العدد', 'النسبة المئوية'];
      const statusRows = [
        ['قيد التنفيذ', stats.pendingRequests || 0, `${Math.round(((stats.pendingRequests || 0) / totalRequests) * 100)}%`],
        ['متأخرة', stats.delayedRequests || 0, `${Math.round(((stats.delayedRequests || 0) / totalRequests) * 100)}%`],
        ['مقبولة', stats.approvedRequests || 0, `${Math.round(((stats.approvedRequests || 0) / totalRequests) * 100)}%`],
        ['مرفوضة', stats.rejectedRequests || 0, `${Math.round(((stats.rejectedRequests || 0) / totalRequests) * 100)}%`]
      ];

      await addChartAndTable(
        pdf,
        chartRefs.pieChartRef,
        'توزيع حالات الطلبات',
        [stats],
        statusHeaders,
        statusRows,
        yPos
      );
    }

    // خط فاصل
    pdf.setDrawColor(52, 58, 64);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos, 195, yPos);
    yPos += 10;

    // إضافة الإحصائيات الرئيسية
    console.log('إضافة الإحصائيات الرئيسية...');

    const statsHeaderElement = createTextElement('الإحصائيات الرئيسية', 24, true, 'center');
    const statsHeaderImage = await elementToImage(statsHeaderElement, 2);

    if (statsHeaderImage) {
      pdf.addImage(statsHeaderImage, 'JPEG', 15, yPos, 180, 12);
      yPos += 20;
    }

    // جدول الإحصائيات
    const statsHeaders = ['المؤشر', 'القيمة'];
    const statsRows = [
      ['إجمالي عدد الطلبات', stats.totalRequests || 0],
      ['الطلبات قيد التنفيذ', stats.pendingRequests || 0],
      ['الطلبات المتأخرة', stats.delayedRequests || 0],
      ['الطلبات المقبولة', stats.approvedRequests || 0],
      ['الطلبات المرفوضة', stats.rejectedRequests || 0],
      ['متوسط وقت المعالجة', `${stats.averageProcessingTime || 0} يوم`]
    ];

    const statsTableElement = createSingleTable(statsHeaders, statsRows, '', 1, 1, 16);
    document.body.appendChild(statsTableElement);
    await new Promise(resolve => setTimeout(resolve, 200));
    const statsTableImage = await elementToImage(statsTableElement, 2);
    document.body.removeChild(statsTableElement);

    if (statsTableImage) {
      pdf.addImage(statsTableImage, 'JPEG', 15, yPos, 180, 50);
      yPos += 60;
    }

    // 1. متوسط وقت المعالجة
    if (chartRefs?.processingTimeChartRef?.current) {
      console.log('معالجة مخطط متوسط وقت المعالجة');
      pdf.addPage();
      yPos = 20;

      const processingTimeData = Array.isArray(chartData?.processingTimes) ? chartData.processingTimes : [];
      const requestTypes = Array.isArray(chartData?.requestTypes) ? chartData.requestTypes : [];

      console.log('بيانات وقت المعالجة:', { processingTimeData, requestTypes });

      const processingTimeHeaders = ['نوع الطلب', 'متوسط وقت المعالجة (يوم)'];
      const processingTimeRows = processingTimeData.map((time, index) => [
        requestTypes[index] || `نوع ${index + 1}`,
        typeof time === 'number' ? time.toFixed(1) : '0'
      ]);

      await addChartAndTable(
        pdf,
        chartRefs.processingTimeChartRef,
        'متوسط وقت المعالجة حسب نوع الطلب',
        processingTimeData,
        processingTimeHeaders,
        processingTimeRows,
        yPos
      );
    }

    // 2. عدد الطلبات التي وصلت للإدارة
    if (chartRefs?.requestsCountChartRef?.current) {
      console.log('معالجة مخطط عدد الطلبات');
      pdf.addPage();
      yPos = 20;

      const requestsCountData = Array.isArray(chartData?.requestsCount) ? chartData.requestsCount : [];
      console.log('بيانات عدد الطلبات:', { requestsCountData });

      const requestTypes = [
        'طلب التحاق',
        'ايقاف قيد',
        'الغاء تسجيل',
        'طلب مد',
        'طلب منح'
      ];

      const total = requestsCountData.reduce((sum, count) => sum + (Number(count) || 0), 0);
      const countHeaders = ['نوع الطلب', 'العدد', 'النسبة المئوية'];
      const countRows = requestsCountData.map((count, index) => {
        const percentage = total > 0 ? Math.round((Number(count) / total) * 100) : 0;
        return [
          requestTypes[index] || `نوع ${index + 1}`,
          Number(count) || 0,
          `${percentage}%`
        ];
      });

      await addChartAndTable(
        pdf,
        chartRefs.requestsCountChartRef,
        'توزيع الطلبات حسب النوع',
        requestsCountData,
        countHeaders,
        countRows,
        yPos
      );
    }

    // 3. نسب أسباب الرفض
    if (chartRefs?.rejectionChartRef?.current) {
      console.log('معالجة مخطط أسباب الرفض');
      pdf.addPage();
      yPos = 20;

      // التأكد من أن البيانات موجودة وبالشكل الصحيح
      let rejectionData = [];
      if (Array.isArray(chartData?.rejectionReasons)) {
        rejectionData = chartData.rejectionReasons;
      } else if (typeof chartData?.rejectionReasons === 'object') {
        // إذا كانت البيانات في شكل كائن، نحولها إلى مصفوفة
        rejectionData = Object.entries(chartData.rejectionReasons).map(([reason, count]) => ({
          reason,
          count: Number(count) || 0
        }));
      }

      console.log('بيانات أسباب الرفض:', { rejectionData });

      const total = rejectionData.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
      const rejectionHeaders = ['سبب الرفض', 'عدد الطلبات', 'النسبة المئوية'];
      const rejectionRows = rejectionData.map(item => {
        const count = Number(item.count) || 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return [
          item.reason || 'غير محدد',
          count,
          `${percentage}%`
        ];
      });

      await addChartAndTable(
        pdf,
        chartRefs.rejectionChartRef,
        'نسب أسباب رفض الطلبات',
        rejectionData,
        rejectionHeaders,
        rejectionRows,
        yPos
      );
    }

    // 4. تطور أعداد الطلبات خلال السنة
    if (chartRefs?.yearlyProgressChartRef?.current) {
      console.log('إضافة مخطط تطور الطلبات السنوي');
      pdf.addPage();
      yPos = 20;

      const yearlyData = Array.isArray(chartData?.yearlyProgress) ?
        chartData.yearlyProgress :
        new Array(12).fill(0);

      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      const total = yearlyData.reduce((sum, count) => sum + (Number(count) || 0), 0);
      const yearlyHeaders = ['الشهر', 'عدد الطلبات', 'النسبة من الإجمالي'];
      const yearlyRows = yearlyData.map((count, index) => {
        const percentage = total > 0 ? Math.round((Number(count) / total) * 100) : 0;
        return [
          monthNames[index],
          Number(count) || 0,
          `${percentage}%`
        ];
      });

      await addChartAndTable(
        pdf,
        chartRefs.yearlyProgressChartRef,
        'تطور أعداد الطلبات خلال السنة',
        yearlyData,
        yearlyHeaders,
        yearlyRows,
        yPos
      );
    }

    // إضافة أرقام الصفحات
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`الصفحة ${i} من ${pageCount}`, 105, 285, { align: 'center' });
    }

    // حفظ الملف
    const fileName = `تقرير_${department.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    console.log('تم إنشاء التقرير بنجاح');
    return true;

  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء التقرير:', error);
    throw new Error(`فشل في إنشاء التقرير: ${error.message}`);
  }
};