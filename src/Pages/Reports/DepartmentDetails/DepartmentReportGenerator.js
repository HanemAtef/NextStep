import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * وظيفة مساعدة لتحويل عنصر HTML إلى صورة بدقة عالية
 */
const elementToImage = async (element, scale = 4) => {
  try {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      background-color: #ffffff;
      direction: rtl;
      font-family: 'Cairo', sans-serif;
    `;

    container.appendChild(element);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: scale,
        logging: false,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        textRendering: true,
        backgroundColor: '#ffffff'
      });

      return canvas.toDataURL('image/jpeg', 0.9);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    console.error('خطأ في تحويل العنصر إلى صورة:', error);
    return null;
  }
};

/**
 * وظيفة مساعدة لإضافة جدول إلى PDF
 */
const addTableToPDF = async (pdf, table, yPos, isNewPage = false) => {
  try {
    if (isNewPage) {
      pdf.addPage();
    }

    const image = await elementToImage(table);
    if (image) {
      // تحويل أبعاد الجدول من البكسل إلى المليمتر (A4 = 210mm × 297mm)
      const pdfWidth = 210;  // عرض A4
      const pdfHeight = 297; // ارتفاع A4
      const margin = 15;     // الهامش

      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = 110; // ارتفاع أقصى للجدول

      // حساب النسبة بين العرض والارتفاع
      const aspectRatio = table.offsetWidth / table.offsetHeight || 1;

      // حساب الأبعاد النهائية
      let finalWidth = maxWidth;
      let finalHeight = finalWidth / aspectRatio;

      // التأكد من عدم تجاوز الارتفاع الأقصى
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = finalHeight * aspectRatio;
      }

      // حساب موضع X لتوسيط الجدول
      const xPos = (pdfWidth - finalWidth) / 2;

      // إضافة الصورة إلى PDF
      pdf.addImage(image, 'PNG', xPos, yPos, finalWidth, finalHeight);
      return true;
    }
    return false;
  } catch (error) {
    console.error('خطأ في إضافة الجدول:', error);
    return false;
  }
};

/**
 * وظيفة لإنشاء جدول بيانات بتنسيق موحد
 */
const createSingleTable = (headers, rows, title = '', pageNum = 1, totalPages = 1, fontSize = 16) => {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    width: 800px;
    background-color: #ffffff;
    padding: 10px;
    box-sizing: border-box;
  `;

  if (title) {
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `
      margin-bottom: 15px;
      font-weight: bold;
      font-size: ${fontSize + 2}px;
      color: #2c3e50;
      text-align: center;
      font-family: 'Cairo', sans-serif;
    `;
    titleDiv.textContent = title + (totalPages > 1 ? ` (${pageNum}/${totalPages})` : '');
    wrapper.appendChild(titleDiv);
  }

  const table = document.createElement('table');
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    direction: rtl;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 7px;
  `;

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
      font-family: 'Cairo', sans-serif;
    `;
    th.textContent = String(header || '');
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.style.backgroundColor = index % 2 === 0 ? '#f8fcff' : '#ffffff';

    row.forEach(cell => {
      const td = document.createElement('td');
      td.style.cssText = `
        padding: 10px;
        border: 1px solid #b6e3ff;
        text-align: center;
        color: #2c3e50;
        font-size: ${fontSize - 2}px;
        font-family: 'Cairo', sans-serif;
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

/**
 * وظيفة مساعدة لتقسيم الجدول إلى صفحات
 */
const splitTableIntoPages = (rows, itemsPerPage = 12) => {
  const pages = [];

  // إذا كان عدد الصفوف أقل من الحد الأقصى، نضعها كلها في صفحة واحدة
  if (rows.length <= itemsPerPage) {
    pages.push(rows);
    return pages;
  }

  // تقسيم الصفوف إلى صفحات
  for (let i = 0; i < rows.length; i += itemsPerPage) {
    pages.push(rows.slice(i, i + itemsPerPage));
  }

  // معالجة الصفحة الأخيرة إذا كانت تحتوي على عدد قليل جداً من الصفوف
  const lastPageIndex = pages.length - 1;
  if (lastPageIndex > 0 && pages[lastPageIndex].length <= 3) {
    // إذا كانت الصفحة الأخيرة تحتوي على 3 صفوف أو أقل، ندمجها مع الصفحة السابقة
    const lastPage = pages.pop(); // إزالة الصفحة الأخيرة
    const previousPage = pages[pages.length - 1]; // الصفحة قبل الأخيرة

    // إذا كان مجموع الصفوف في الصفحتين أقل من أو يساوي 15 صف، ندمجهما
    if (previousPage.length + lastPage.length <= 15) {
      pages[pages.length - 1] = [...previousPage, ...lastPage];
    } else {
      // وإلا نعيد الصفحة الأخيرة كما هي
      pages.push(lastPage);
    }
  }

  return pages;
};

/**
 * وظيفة لإنشاء جدول بيانات بتنسيق موحد
 */
const createDataTable = async (pdf, headers, rows, title = '', startY = 40, fontSize = 20) => {
  try {
    // التحقق من صحة المدخلات
    if (!Array.isArray(headers) || !Array.isArray(rows) || rows.length === 0) {
      console.error('المدخلات غير صالحة');
      return false;
    }

    // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة
    const itemsPerPage = 12;
    const pages = splitTableIntoPages(rows, itemsPerPage);

    // إضافة كل صفحة على حدة
    for (let i = 0; i < pages.length; i++) {
      // بدء صفحة جديدة لكل جدول
      if (i > 0) {
        pdf.addPage();
      }

      const table = createSingleTable(headers, pages[i], title, i + 1, pages.length, fontSize);

      // إضافة الجدول إلى المستند مؤقتاً
      document.body.appendChild(table);

      // إضافة تأخير صغير للتأكد من اكتمال رسم العنصر
      await new Promise(resolve => setTimeout(resolve, 100));

      // تحويل الجدول إلى صورة وإضافته للـ PDF
      const success = await addTableToPDF(pdf, table, i === 0 ? startY : 20, false);

      // إزالة الجدول من المستند
      document.body.removeChild(table);

      if (!success) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('خطأ في إنشاء الجدول:', error);
    return false;
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
    padding: 15px;
    width: 800px;
    background-color: #ffffff;
    font-family: 'Cairo', sans-serif;
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
 * وظيفة مساعدة لتحويل مخطط Chart.js إلى صورة مع خلفية بيضاء
 */
const convertChartToImage = async (chartRef, scale = 2) => {
  if (!chartRef?.current) {
    console.warn('المخطط البياني غير متاح');
    return null;
  }

  try {
    // محاولة الوصول إلى canvas بطرق مختلفة
    let canvas;

    // الطريقة 1: الوصول المباشر إلى canvas
    if (chartRef.current.canvas) {
      canvas = chartRef.current.canvas;
    }
    // الطريقة 2: البحث عن canvas داخل العنصر
    else if (chartRef.current.querySelector && chartRef.current.querySelector('canvas')) {
      canvas = chartRef.current.querySelector('canvas');
    }
    // الطريقة 3: استخدام html2canvas للتحويل
    else {
      console.log('استخدام html2canvas لالتقاط المخطط البياني');
      try {
        const capturedCanvas = await html2canvas(chartRef.current, {
          scale: scale,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        return capturedCanvas.toDataURL('image/jpeg', 0.95);
      } catch (html2canvasError) {
        console.error('فشل في التقاط المخطط باستخدام html2canvas:', html2canvasError);
        return null;
      }
    }

    if (!canvas) {
      console.warn('لم يتم العثور على عنصر canvas');
      return null;
    }

    // إنشاء canvas جديد مع خلفية بيضاء
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');

    // تعيين نفس الأبعاد مع مضاعف الدقة
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    // رسم خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // رسم المخطط الأصلي فوق الخلفية البيضاء
    ctx.drawImage(canvas, 0, 0);

    return newCanvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('خطأ في تحويل المخطط البياني:', error);

    // محاولة أخيرة باستخدام html2canvas
    try {
      console.log('محاولة أخيرة باستخدام html2canvas');
      const capturedCanvas = await html2canvas(chartRef.current, {
        scale: scale,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      return capturedCanvas.toDataURL('image/jpeg', 0.95);
    } catch (finalError) {
      console.error('فشل نهائي في التقاط المخطط:', finalError);
      return null;
    }
  }
};

/**
 * وظيفة مساعدة لتحميل صورة مع معالجة الأخطاء
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn(`فشل في تحميل الصورة: ${src}`);
      resolve(null); // إرجاع null بدلاً من رفض الوعد
    };
    img.src = src;
  });
};

/**
 * وظيفة مساعدة للحصول على التاريخ منسق
 */
const formatDate = (date) => {
  if (!date) return 'غير محدد';

  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return 'تاريخ غير صحيح';
  }
};

/**
 * وظيفة متخصصة لالتقاط مخطط تطور أعداد الطلبات خلال السنة
 */
const captureTimeAnalysisChart = async (chartRef) => {
  if (!chartRef?.current) {
    console.error('مخطط التحليل الزمني غير متاح');
    return null;
  }

  console.log('بدء التقاط مخطط التحليل الزمني بطرق متعددة');

  // طريقة 1: محاولة الوصول المباشر إلى canvas
  try {
    const chartElement = chartRef.current;

    // البحث عن canvas داخل العنصر
    const canvas = chartElement.querySelector('canvas');

    if (canvas) {
      console.log('تم العثور على canvas مباشرة');

      // إنشاء canvas جديد مع خلفية بيضاء
      const newCanvas = document.createElement('canvas');
      const ctx = newCanvas.getContext('2d');

      // تعيين نفس الأبعاد مع مضاعف الدقة
      newCanvas.width = canvas.width * 2;
      newCanvas.height = canvas.height * 2;

      // رسم خلفية بيضاء
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

      // رسم المخطط الأصلي فوق الخلفية البيضاء بمقياس أكبر
      ctx.scale(2, 2);
      ctx.drawImage(canvas, 0, 0);

      return newCanvas.toDataURL('image/png', 3.0);
    }
  } catch (error) {
    console.warn('فشل في الوصول المباشر إلى canvas:', error);
  }

  // طريقة 2: استخدام html2canvas مع إعدادات محسنة
  try {
    console.log('استخدام html2canvas مع إعدادات محسنة');

    // إنشاء نسخة من العنصر في موضع خارج الشاشة
    const chartClone = chartRef.current.cloneNode(true);
    chartClone.style.position = 'fixed';
    chartClone.style.top = '-9999px';
    chartClone.style.left = '-9999px';
    chartClone.style.width = '800px';
    chartClone.style.height = '400px';
    chartClone.style.backgroundColor = '#ffffff';
    chartClone.style.padding = '20px';

    document.body.appendChild(chartClone);

    try {
      // إعطاء وقت للعنصر ليتم رسمه
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(chartClone, {
        scale: 3,
        backgroundColor: '#ffffff',
        logging: true,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        foreignObjectRendering: false,
        removeContainer: true
      });

      document.body.removeChild(chartClone);
      return canvas.toDataURL('image/png', 3.0);
    } catch (e) {
      if (document.body.contains(chartClone)) {
        document.body.removeChild(chartClone);
      }
      throw e;
    }
  } catch (error) {
    console.warn('فشل في استخدام html2canvas المحسن:', error);
  }

  // طريقة 3: التقاط العنصر مباشرة بإعدادات أساسية
  try {
    console.log('محاولة التقاط العنصر مباشرة');

    const canvas = await html2canvas(chartRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: true,
      useCORS: true,
      allowTaint: true
    });

    return canvas.toDataURL('image/png', 3.0);
  } catch (error) {
    console.error('فشل جميع محاولات التقاط المخطط:', error);
    return null;
  }
};

/**
 * دالة رئيسية لإنشاء التقرير
 */
export const generateDepartmentReport = async (
  department,
  stats,
  chartRefs,
  dateRange,
  reportData
) => {
  try {
    console.log('بدء إنشاء تقرير الإدارة:', department?.name);
    console.log('المخططات المتاحة:', Object.keys(chartRefs || {}).filter(key => chartRefs[key]?.current));

    // إنشاء مستند PDF جديد
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const [startDate, endDate] = dateRange || [];

    // إضافة الشعارات مع معالجة الأخطاء
    try {
      const logoCollage = await loadImage('/logoCollage.jpg');
      if (logoCollage) {
        pdf.addImage(logoCollage, 'JPEG', 20, 10, 30, 30);
      }

      const logoUniversity = await loadImage('/logoUnivercity.png');
      if (logoUniversity) {
        pdf.addImage(logoUniversity, 'PNG', 160, 10, 30, 30);
      }
    } catch (logoError) {
      console.warn('تعذر تحميل الشعارات:', logoError);
    }

    // إضافة عنوان التقرير
    const title = createTextElement(`تقرير إدارة ${department?.name || 'الإدارة'}`, 28, true);
    const titleImage = await elementToImage(title);
    if (titleImage) {
      pdf.addImage(titleImage, 'JPEG', 20, 45, 170, 20);
    }

    // إضافة معلومات التاريخ بالتقليم الميلادي
    let dateText = 'جميع الفترات';
    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      dateText = `الفترة من ${formattedStartDate} إلى ${formattedEndDate}`;
    }
    const dateElement = createTextElement(dateText, 16, false);
    const dateImage = await elementToImage(dateElement);
    if (dateImage) {
      pdf.addImage(dateImage, 'PNG', 20, 70, 170, 10);
    }

    // إضافة تاريخ إنشاء التقرير بالتقويم الميلادي
    const reportDate = createTextElement(
      `تاريخ إنشاء التقرير: ${new Date().toLocaleDateString('en-GB')}`,
      14,
      false
    );
    const reportDateImage = await elementToImage(reportDate);
    if (reportDateImage) {
      pdf.addImage(reportDateImage, 'JPEG', 20, 85, 170, 10);
    }

    pdf.setDrawColor(52, 58, 64);
    pdf.setLineWidth(0.5);
    pdf.line(15, 95, 195, 95);

    // إضافة الإحصائيات العامة
    const statsHeaders = ['المؤشر', 'القيمة', 'النسبة المئوية'];
    const totalRequests = stats?.totalRequests || 0;

    const statsRows = [
      ['إجمالي عدد الطلبات', totalRequests, '100%'],
      ['الطلبات المنشأة من الإدارة (الإجمالي)', stats?.createdByDepartment?.total || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.total || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المنشأة قيد التنفيذ', stats?.createdByDepartment?.inProgress || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.inProgress || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المنشأة المتأخرة', stats?.createdByDepartment?.delayed || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.delayed || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المنشأة المقبولة من الآخرين', stats?.createdByDepartment?.acceptedByOthers || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.acceptedByOthers || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المنشأة المرفوضة من الآخرين', stats?.createdByDepartment?.rejectedByOthers || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.rejectedByOthers || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المستلمة قيد التنفيذ', stats?.receivedFromOthers?.inProgress || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.inProgress || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المستلمة المتأخرة', stats?.receivedFromOthers?.delayed || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.delayed || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المستلمة المقبولة من الإدارة', stats?.receivedFromOthers?.acceptedByDepartment || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.acceptedByDepartment || 0) / totalRequests) * 100) + '%' : '0%'],
      ['الطلبات المستلمة المرفوضة من الإدارة', stats?.receivedFromOthers?.rejectedByDepartment || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.rejectedByDepartment || 0) / totalRequests) * 100) + '%' : '0%'],
    ];

    const statsTable = createSingleTable(statsHeaders, statsRows, 'الإحصائيات العامة');
    await addTableToPDF(pdf, statsTable, 100);

    // إضافة مخطط حالات الطلبات (1)
    console.log('إضافة مخطط حالات الطلبات');
    if (chartRefs?.pieChartRef?.current) {
      pdf.addPage();
      const pieChartImage = await convertChartToImage(chartRefs.pieChartRef);
      if (pieChartImage) {
        const pieTitle = createTextElement('توزيع حالات الطلبات', 24);
        const pieTitleImage = await elementToImage(pieTitle);
        if (pieTitleImage) {
          pdf.addImage(pieTitleImage, 'PNG', 20, 10, 170, 15);
        }
        pdf.addImage(pieChartImage, 'PNG', 35, 30, 140, 80);

        // إضافة جدول تفصيلي للبيانات
        const pieDataHeaders = ['الحالة', 'عدد الطلبات', 'النسبة المئوية'];
        const pieDataRows = [
          ['منشأة قيد التنفيذ', stats?.createdByDepartment?.inProgress || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.inProgress || 0) / totalRequests) * 100) + '%' : '0%'],
          ['منشأة متأخرة', stats?.createdByDepartment?.delayed || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.delayed || 0) / totalRequests) * 100) + '%' : '0%'],
          ['منشأة مقبولة', stats?.createdByDepartment?.acceptedByOthers || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.acceptedByOthers || 0) / totalRequests) * 100) + '%' : '0%'],
          ['منشأة مرفوضة', stats?.createdByDepartment?.rejectedByOthers || 0, totalRequests > 0 ? Math.round(((stats?.createdByDepartment?.rejectedByOthers || 0) / totalRequests) * 100) + '%' : '0%'],
          ['مستلمة قيد التنفيذ', stats?.receivedFromOthers?.inProgress || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.inProgress || 0) / totalRequests) * 100) + '%' : '0%'],
          ['مستلمة متأخرة', stats?.receivedFromOthers?.delayed || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.delayed || 0) / totalRequests) * 100) + '%' : '0%'],
          ['مستلمة مقبولة', stats?.receivedFromOthers?.acceptedByDepartment || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.acceptedByDepartment || 0) / totalRequests) * 100) + '%' : '0%'],
          ['مستلمة مرفوضة', stats?.receivedFromOthers?.rejectedByDepartment || 0, totalRequests > 0 ? Math.round(((stats?.receivedFromOthers?.rejectedByDepartment || 0) / totalRequests) * 100) + '%' : '0%']
        ];

        const pieDataTable = createSingleTable(
          pieDataHeaders,
          pieDataRows,
          'تفاصيل توزيع حالات الطلبات'
        );
        await addTableToPDF(pdf, pieDataTable, 120);
      } else {
        console.warn('فشل في تحويل مخطط حالات الطلبات إلى صورة');
      }
    } else {
      console.warn('مخطط حالات الطلبات غير متاح');
    }

    // إضافة مخطط متوسط وقت المعالجة (2)
    console.log('إضافة مخطط متوسط وقت المعالجة');
    if (chartRefs?.processingTimeChartRef?.current) {
      pdf.addPage();
      const processingTimeImage = await convertChartToImage(chartRefs.processingTimeChartRef);
      if (processingTimeImage) {
        const barTitle = createTextElement('متوسط وقت المعالجة حسب نوع الطلب', 24);
        const barTitleImage = await elementToImage(barTitle);
        if (barTitleImage) {
          pdf.addImage(barTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(processingTimeImage, 'JPEG', 35, 30, 140, 80);

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.processingTimeStats?.labels) {
          const timeHeaders = ['نوع الطلب', 'متوسط وقت المعالجة (ساعة)', 'عدد الطلبات المعالجة'];

          // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة
          const itemsPerPage = 12;
          const rows = reportData.processingTimeStats.labels.map((label, index) => [
            label,
            (reportData.processingTimeStats.data[index] || 0).toFixed(1),
            reportData.processingTimeStats.requestCounts ? reportData.processingTimeStats.requestCounts[index] || 0 : 0
          ]);

          const pages = splitTableIntoPages(rows, itemsPerPage);

          // إضافة الصفحة الأولى من الجدول
          const timeTable = createSingleTable(
            timeHeaders,
            pages[0],
            'تفاصيل متوسط وقت المعالجة',
            1,
            pages.length
          );
          await addTableToPDF(pdf, timeTable, 120);

          // إضافة باقي الصفحات إن وجدت
          for (let i = 1; i < pages.length; i++) {
            pdf.addPage();
            const nextPageTable = createSingleTable(
              timeHeaders,
              pages[i],
              'تفاصيل متوسط وقت المعالجة',
              i + 1,
              pages.length
            );
            await addTableToPDF(pdf, nextPageTable, 20);
          }
        }
      } else {
        console.warn('فشل في تحويل مخطط متوسط وقت المعالجة إلى صورة');
      }
    } else {
      console.warn('مخطط متوسط وقت المعالجة غير متاح');
    }

    // إضافة مخطط عدد الطلبات حسب النوع (3)
    console.log('إضافة مخطط عدد الطلبات حسب النوع');
    if (chartRefs?.requestsCountChartRef?.current) {
      pdf.addPage();
      const requestsCountImage = await convertChartToImage(chartRefs.requestsCountChartRef);
      if (requestsCountImage) {
        const lineTitle = createTextElement('عدد الطلبات التي وصلت للإدارة حسب النوع', 24);
        const lineTitleImage = await elementToImage(lineTitle);
        if (lineTitleImage) {
          pdf.addImage(lineTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(requestsCountImage, 'JPEG', 35, 30, 140, 80);

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.requestsCountByType?.labels) {
          const createdHeaders = ['نوع الطلب', 'عدد الطلبات', 'النسبة المئوية'];
          const total = reportData.requestsCountByType.data.reduce((sum, val) => sum + (val || 0), 0);

          // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة
          const itemsPerPage = 12;
          const rows = reportData.requestsCountByType.labels.map((label, index) => {
            const value = reportData.requestsCountByType.data[index] || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return [label, value, percentage];
          });

          const pages = splitTableIntoPages(rows, itemsPerPage);

          // إضافة الصفحة الأولى من الجدول
          const createdTable = createSingleTable(
            createdHeaders,
            pages[0],
            'تفاصيل عدد الطلبات حسب النوع',
            1,
            pages.length
          );
          await addTableToPDF(pdf, createdTable, 120);

          // إضافة باقي الصفحات إن وجدت
          for (let i = 1; i < pages.length; i++) {
            pdf.addPage();
            const nextPageTable = createSingleTable(
              createdHeaders,
              pages[i],
              'تفاصيل عدد الطلبات حسب النوع',
              i + 1,
              pages.length
            );
            await addTableToPDF(pdf, nextPageTable, 20);
          }
        }
      } else {
        console.warn('فشل في تحويل مخطط عدد الطلبات حسب النوع إلى صورة');
      }
    } else {
      console.warn('مخطط عدد الطلبات حسب النوع غير متاح');
    }

    // إضافة مخطط أسباب الرفض (4)
    console.log('إضافة مخطط أسباب الرفض');
    if (chartRefs?.rejectionChartRef?.current) {
      pdf.addPage();
      const rejectionImage = await convertChartToImage(chartRefs.rejectionChartRef);
      if (rejectionImage) {
        const deptTitle = createTextElement('نسب أسباب رفض الطلبات', 24);
        const deptTitleImage = await elementToImage(deptTitle);
        if (deptTitleImage) {
          pdf.addImage(deptTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(rejectionImage, 'JPEG', 35, 30, 140, 80);

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.rejectionReasons?.labels) {
          const deptHeaders = ['سبب الرفض', 'عدد الطلبات', 'النسبة المئوية'];
          const total = reportData.rejectionReasons.data.reduce((sum, val) => sum + (val || 0), 0);

          // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة
          const itemsPerPage = 12;
          const rows = reportData.rejectionReasons.labels.map((label, index) => {
            const value = reportData.rejectionReasons.data[index] || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return [label, value, percentage];
          });

          const pages = splitTableIntoPages(rows, itemsPerPage);

          // إضافة الصفحة الأولى من الجدول
          const deptTable = createSingleTable(
            deptHeaders,
            pages[0],
            'تفاصيل أسباب رفض الطلبات',
            1,
            pages.length
          );
          await addTableToPDF(pdf, deptTable, 120);

          // إضافة باقي الصفحات إن وجدت
          for (let i = 1; i < pages.length; i++) {
            pdf.addPage();
            const nextPageTable = createSingleTable(
              deptHeaders,
              pages[i],
              'تفاصيل أسباب رفض الطلبات',
              i + 1,
              pages.length
            );
            await addTableToPDF(pdf, nextPageTable, 20);
          }
        }
      } else {
        console.warn('فشل في تحويل مخطط أسباب الرفض إلى صورة');
      }
    } else {
      console.warn('مخطط أسباب الرفض غير متاح');
    }

    // إضافة مخطط تطور أعداد الطلبات خلال السنة (5)
    console.log('إضافة مخطط تطور أعداد الطلبات خلال السنة');
    if (chartRefs?.timeAnalysisChartRef?.current) {
      pdf.addPage();

      // استخدام نفس وظيفة تحويل المخططات الأخرى
      console.log('محاولة التقاط مخطط التحليل الزمني باستخدام نفس طريقة المخططات الأخرى');

      try {
        // إضافة تأخير قبل التقاط المخطط للتأكد من اكتمال رسمه
        await new Promise(resolve => setTimeout(resolve, 1000));

        const timeAnalysisImage = await convertChartToImage(chartRefs.timeAnalysisChartRef, 2);

        if (timeAnalysisImage) {
          console.log('تم التقاط مخطط تطور أعداد الطلبات بنجاح');

          // إضافة العنوان
          const timeAnalysisTitle = createTextElement('تطور أعداد الطلبات خلال السنة', 24);
          const timeAnalysisTitleImage = await elementToImage(timeAnalysisTitle);
          if (timeAnalysisTitleImage) {
            pdf.addImage(timeAnalysisTitleImage, 'PNG', 20, 10, 170, 15);
          }

          // إضافة المخطط بمعالجة استثناءات
          try {
            // استخدام حجم أصغر للمخطط لتجنب التمدد
            pdf.addImage(timeAnalysisImage, 'JPEG', 35, 30, 140, 80);
            console.log('تمت إضافة مخطط التحليل الزمني بنجاح');
          } catch (imgError) {
            console.error('خطأ في إضافة مخطط التحليل الزمني:', imgError);

            // محاولة بحجم أصغر
            try {
              pdf.addImage(timeAnalysisImage, 'JPEG', 50, 30, 110, 70);
              console.log('تمت إضافة مخطط التحليل الزمني بحجم أصغر');
            } catch (smallerError) {
              console.error('فشل في إضافة مخطط التحليل الزمني حتى بحجم أصغر:', smallerError);
            }
          }
        } else {
          console.warn('فشل في تحويل مخطط التحليل الزمني إلى صورة');

          // محاولة بديلة باستخدام html2canvas مباشرة
          try {
            console.log('محاولة بديلة لالتقاط مخطط التحليل الزمني');
            const chartElement = chartRefs.timeAnalysisChartRef.current;

            // التقاط المخطط باستخدام html2canvas
            const canvas = await html2canvas(chartElement, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
              allowTaint: true
            });

            const altImage = canvas.toDataURL('image/jpeg', 0.95);

            // إضافة العنوان
            const timeAnalysisTitle = createTextElement('تطور أعداد الطلبات خلال السنة', 24);
            const timeAnalysisTitleImage = await elementToImage(timeAnalysisTitle);
            if (timeAnalysisTitleImage) {
              pdf.addImage(timeAnalysisTitleImage, 'PNG', 20, 10, 170, 15);
            }

            // إضافة المخطط البديل بحجم أصغر
            pdf.addImage(altImage, 'JPEG', 35, 30, 140, 80);
            console.log('تمت إضافة مخطط التحليل الزمني بالطريقة البديلة');
          } catch (altError) {
            console.error('فشل في التقاط مخطط التحليل الزمني بالطريقة البديلة:', altError);
          }
        }

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.timeAnalysis?.labels) {
          const timeAnalysisHeaders = ['الفترة', 'الطلبات المستلمة', 'الطلبات المعالجة', 'نسبة المعالجة'];

          // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة مع معالجة الصفحة الأخيرة
          const itemsPerPage = 12;
          const rows = reportData.timeAnalysis.labels.map((label, index) => {
            const received = reportData.timeAnalysis.receivedData?.[index] || 0;
            const processed = reportData.timeAnalysis.processedData?.[index] || 0;
            const percentage = received > 0 ? Math.round((processed / received) * 100) + '%' : '0%';
            return [label, received, processed, percentage];
          });

          const pages = splitTableIntoPages(rows, itemsPerPage);

          // إضافة الصفحة الأولى من الجدول
          const timeAnalysisTable = createSingleTable(
            timeAnalysisHeaders,
            pages[0],
            'تفاصيل تطور أعداد الطلبات خلال السنة',
            1,
            pages.length
          );

          await addTableToPDF(pdf, timeAnalysisTable, 120);

          // إضافة باقي الصفحات إن وجدت
          for (let i = 1; i < pages.length; i++) {
            pdf.addPage();
            const nextPageTable = createSingleTable(
              timeAnalysisHeaders,
              pages[i],
              'تفاصيل تطور أعداد الطلبات خلال السنة',
              i + 1,
              pages.length
            );
            await addTableToPDF(pdf, nextPageTable, 20);
          }
        } else {
          console.warn('بيانات مخطط تطور أعداد الطلبات غير متاحة');
        }
      } catch (error) {
        console.error('خطأ في معالجة مخطط التحليل الزمني:', error);

        // إضافة رسالة بديلة في حالة فشل التقاط المخطط
        const errorMessage = createTextElement('تعذر عرض مخطط تطور أعداد الطلبات خلال السنة', 18, true);
        const errorMessageImage = await elementToImage(errorMessage);
        if (errorMessageImage) {
          pdf.addImage(errorMessageImage, 'JPEG', 20, 50, 170, 20);
        }

        // إضافة جدول بديل إذا كانت البيانات متاحة
        if (reportData?.timeAnalysis?.labels) {
          const timeAnalysisHeaders = ['الفترة', 'الطلبات المستلمة', 'الطلبات المعالجة', 'نسبة المعالجة'];

          // تقسيم البيانات إلى صفحات - 12 صف في كل صفحة مع معالجة الصفحة الأخيرة
          const itemsPerPage = 12;
          const rows = reportData.timeAnalysis.labels.map((label, index) => {
            const received = reportData.timeAnalysis.receivedData?.[index] || 0;
            const processed = reportData.timeAnalysis.processedData?.[index] || 0;
            const percentage = received > 0 ? Math.round((processed / received) * 100) + '%' : '0%';
            return [label, received, processed, percentage];
          });

          const pages = splitTableIntoPages(rows, itemsPerPage);

          // إضافة الصفحة الأولى من الجدول
          const timeAnalysisTable = createSingleTable(
            timeAnalysisHeaders,
            pages[0],
            'تفاصيل تطور أعداد الطلبات خلال السنة',
            1,
            pages.length
          );

          await addTableToPDF(pdf, timeAnalysisTable, 80);

          // إضافة باقي الصفحات إن وجدت
          for (let i = 1; i < pages.length; i++) {
            pdf.addPage();
            const nextPageTable = createSingleTable(
              timeAnalysisHeaders,
              pages[i],
              'تفاصيل تطور أعداد الطلبات خلال السنة',
              i + 1,
              pages.length
            );
            await addTableToPDF(pdf, nextPageTable, 20);
          }
        }
      }
    } else {
      console.warn('مخطط تطور أعداد الطلبات خلال السنة غير متاح');

      // إضافة صفحة بديلة عند عدم وجود المخطط
      pdf.addPage();
      const missingMessage = createTextElement('مخطط تطور أعداد الطلبات خلال السنة غير متاح', 20, true);
      const missingMessageImage = await elementToImage(missingMessage);
      if (missingMessageImage) {
        pdf.addImage(missingMessageImage, 'JPEG', 20, 50, 170, 20);
      }
    }

    // إضافة مخطط مقارنة الأداء
    if (chartRefs?.performanceChartRef?.current) {
      pdf.addPage();
      const perfImage = await convertChartToImage(chartRefs.performanceChartRef);
      if (perfImage) {
        const perfTitle = createTextElement('مقارنة أداء معالجة الطلبات', 24);
        const perfTitleImage = await elementToImage(perfTitle);
        if (perfTitleImage) {
          pdf.addImage(perfTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(perfImage, 'JPEG', 20, 30, 170, 100);

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.performanceComparison?.labels) {
          const perfHeaders = ['الفترة', 'متوسط وقت المعالجة (ساعة)', 'عدد الطلبات المعالجة', 'معدل الكفاءة'];
          const perfRows = reportData.performanceComparison.labels.map((label, index) => {
            const avgTime = (reportData.performanceComparison.avgTimes[index] || 0).toFixed(1);
            const count = reportData.performanceComparison.counts[index] || 0;
            const efficiency = reportData.performanceComparison.efficiency ?
              (reportData.performanceComparison.efficiency[index] || 0).toFixed(1) + '%' : '-';
            return [label, avgTime, count, efficiency];
          });
          const perfTable = createSingleTable(perfHeaders, perfRows, 'تفاصيل مقارنة أداء معالجة الطلبات');
          await addTableToPDF(pdf, perfTable, 140);
        }
      }
    }

    // إضافة مخطط توزيع الطلبات حسب الأولوية
    if (chartRefs?.priorityChartRef?.current) {
      pdf.addPage();
      const priorityImage = await convertChartToImage(chartRefs.priorityChartRef);
      if (priorityImage) {
        const priorityTitle = createTextElement('توزيع الطلبات حسب الأولوية', 24);
        const priorityTitleImage = await elementToImage(priorityTitle);
        if (priorityTitleImage) {
          pdf.addImage(priorityTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(priorityImage, 'JPEG', 20, 30, 170, 100);

        // إضافة جدول تفصيلي للبيانات
        if (reportData?.priorityDistribution?.labels) {
          const priorityHeaders = ['الأولوية', 'عدد الطلبات', 'النسبة المئوية', 'متوسط وقت المعالجة (ساعة)'];
          const total = reportData.priorityDistribution.data.reduce((sum, val) => sum + (val || 0), 0);
          const priorityRows = reportData.priorityDistribution.labels.map((label, index) => {
            const value = reportData.priorityDistribution.data[index] || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            const avgTime = reportData.priorityDistribution.avgTimes ?
              (reportData.priorityDistribution.avgTimes[index] || 0).toFixed(1) : '-';
            return [label, value, percentage, avgTime];
          });
          const priorityTable = createSingleTable(priorityHeaders, priorityRows, 'تفاصيل توزيع الطلبات حسب الأولوية');
          await addTableToPDF(pdf, priorityTable, 140);
        }
      }
    }

    // إضافة أرقام الصفحات
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const pageNumberElement = createTextElement(`الصفحة ${i} من ${pageCount}`, 14, false);
      const pageNumberImage = await elementToImage(pageNumberElement);
      if (pageNumberImage) {
        pdf.addImage(pageNumberImage, 'JPEG', 70, 280, 70, 10);
      }
    }

    // حفظ الملف
    const fileName = `تقرير_${department?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'الادارة'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    console.log('تم إنشاء التقرير بنجاح:', fileName);

    return true;
  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    return false;
  }
};