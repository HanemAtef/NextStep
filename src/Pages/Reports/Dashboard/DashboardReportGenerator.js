import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * وظيفة مساعدة لتحويل عنصر HTML إلى صورة بدقة عالية
 */
const elementToImage = async (element, scale = 3) => {
  try {
    // إنشاء حاوية مؤقتة
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      background-color: #ffffff;
    `;

    // إضافة العنصر إلى الحاوية
    container.appendChild(element);
    document.body.appendChild(container);

    try {
      // تحويل العنصر إلى صورة
      const canvas = await html2canvas(container, {
        scale: scale,
        logging: false,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        textRendering: true,
        backgroundColor: '#ffffff'
      });

      return canvas.toDataURL('image/jpeg', 6.0);
    } finally {
      // تنظيف - إزالة الحاوية المؤقتة
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
      const margin = 20;     // الهامش

      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = 120; // ارتفاع أقصى للجدول

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
      pdf.addImage(image, 'jpeg', xPos, yPos, finalWidth, finalHeight);
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

/**
 * وظيفة مساعدة لتقسيم الجدول إلى صفحات
 */
const splitTableIntoPages = (rows, itemsPerPage = 20) => {
  const pages = [];
  for (let i = 0; i < rows.length; i += itemsPerPage) {
    pages.push(rows.slice(i, i + itemsPerPage));
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

    // تقسيم البيانات إلى صفحات - 20 صف في كل صفحة
    const itemsPerPage = Math.min(20, rows.length);
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
 * وظيفة مساعدة لتحويل مخطط Chart.js إلى صورة
 */
const chartToImage = async (chartRef) => {
  try {
    if (!chartRef?.current) {
      console.error('المخطط غير متوفر');
      return null;
    }

    // الحصول على عنصر canvas من مخطط Chart.js
    const canvas = chartRef.current.canvas;
    if (!canvas) {
      console.error('عنصر canvas غير متوفر');
      return null;
    }

    return canvas.toDataURL('image/png', 6.0);
  } catch (error) {
    console.error('خطأ في تحويل المخطط:', error);
    return null;
  }
};

/**
 * وظيفة مساعدة لتحميل صورة
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * وظيفة مساعدة للتحقق من وجود العنصر في المستند وتحويله إلى صورة
 */
export const convertChartToImage = async (chartRef, scale = 3) => {
  if (!chartRef?.current) {
    console.warn('المخطط البياني غير متاح');
    return null;
  }

  try {
    // الحصول على عنصر canvas من مخطط Chart.js
    const canvas = chartRef.current.canvas;
    if (!canvas) {
      console.warn('عنصر canvas غير متاح');
      return null;
    }

    // نسخ بيانات الصورة مباشرة من canvas
    return canvas.toDataURL('image/jpeg', 6.0);
  } catch (error) {
    console.error('خطأ في تحويل المخطط البياني:', error);
    return null;
  }
};

/**
 * وظيفة مساعدة للحصول على عنوان الحالة
 */
const getStatusTitle = (status) => {
  switch (status) {
    case 'delayed':
      return 'المتأخرة';
    case 'rejected':
      return 'المرفوضة';
    case 'approved':
      return 'المقبولة';
    case 'pending':
      return 'قيد التنفيذ';
    default:
      return '';
  }
};

/**
 * وظيفة توليد تقرير PDF للوحة التحكم
 */
export const generateDashboardReport = async (
  dateRange,
  departments,
  chartRefs,
  pieStatus,
  chartsData
) => {
  try {
    console.log('بيانات التقرير:', {
      dateRange,
      departments,
      chartRefs,
      pieStatus,
      chartsData
    });

    // التحقق من وجود البيانات المطلوبة
    if (!chartRefs) {
      throw new Error('مراجع المخططات غير متوفرة');
    }

    if (!chartsData) {
      throw new Error('بيانات المخططات غير متوفرة');
    }

    // إنشاء وثيقة PDF جديدة بحجم A4 واتجاه عمودي
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // تعيين اتجاه النص من اليمين إلى اليسار
    pdf.setR2L(true);

    let yPos = 20;

    // إضافة الشعارات
    try {
      const logoCollage = await loadImage('/logoCollage.jpg');
      console.log('تم تحميل شعار الكلية');
      pdf.addImage(logoCollage, 'JPEG', 20, 5, 30, 30);

      const logoUniversity = await loadImage('/logoUnivercity.png');
      console.log('تم تحميل شعار الجامعة');
      pdf.addImage(logoUniversity, 'PNG', 160, 5, 30, 30);

      yPos = 40;
    } catch (logoError) {
      console.warn('تعذر تحميل الشعارات:', logoError);
      // المتابعة حتى لو فشل تحميل الشعارات
    }
    // إضافة خط فاصل
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(10, 95, 200, 95);


    // إنشاء عنوان التقرير
    const titleElement = createTextElement('تقرير لوحة المعلومات', 36, true);
    const titleImage = await elementToImage(titleElement);
    if (titleImage) {
      console.log('تم إنشاء عنوان التقرير');
      pdf.addImage(titleImage, 'PNG', 10, yPos, 190, 20);
      yPos += 25;
    }

    // إضافة نطاق التاريخ والإحصائيات العامة في الصفحة الأولى
    if (dateRange?.[0] && dateRange?.[1]) {
      const startDateStr = new Date(dateRange[0]).toLocaleDateString('ar-EG');
      const endDateStr = new Date(dateRange[1]).toLocaleDateString('ar-EG');
      const rangeElement = createTextElement(`الفترة: من ${startDateStr} إلى ${endDateStr}`, 20, false);
      const rangeImage = await elementToImage(rangeElement);
      if (rangeImage) {
        console.log('تم إضافة نطاق التاريخ');
        pdf.addImage(rangeImage, 'PNG', 10, yPos, 190, 10);
        yPos += 15;
      }

      // إضافة تاريخ إنشاء التقرير
      const reportDateElement = createTextElement(`تاريخ إنشاء التقرير: ${new Date().toLocaleDateString('ar-EG')}`, 16, false);
      const reportDateImage = await elementToImage(reportDateElement);
      if (reportDateImage) {
        console.log('تم إضافة تاريخ إنشاء التقرير');
        pdf.addImage(reportDateImage, 'PNG', 10, yPos, 190, 10);
        yPos += 20;
      }
    }

    // إضافة الإحصائيات العامة في الصفحة الأولى
    const generalStatsElement = createTextElement('الإحصائيات العامة', 26, true);
    const generalStatsImage = await elementToImage(generalStatsElement);
    if (generalStatsImage) {
      pdf.addImage(generalStatsImage, 'PNG', 10, yPos, 190, 15);
      yPos += 25;
    }

    // إنشاء جدول الإحصائيات العامة
    try {
      const statsHeaders = ['البيان', 'العدد'];
      const statsRows = [
        ['إجمالي الطلبات', chartsData.totalRequests || 0],
        ['الطلبات قيد التنفيذ', chartsData.pendingRequests || 0],
        ['الطلبات المتأخرة', chartsData.delayedRequests || 0],
        ['الطلبات المقبولة', chartsData.approvedRequests || 0],
        ['الطلبات المرفوضة', chartsData.rejectedRequests || 0]
      ];

      console.log('إحصائيات عامة:', statsRows);

      const statsTableElement = createSingleTable(
        statsHeaders,
        statsRows,
        'ملخص الإحصائيات',
        1,
        1,
        16
      );

      const statsTableImage = await elementToImage(statsTableElement);
      if (statsTableImage) {
        console.log('تم إضافة جدول الإحصائيات العامة');
        pdf.addImage(statsTableImage, 'jpeg', 15, yPos, 180, 60);
      }
    } catch (statsError) {
      console.error('خطأ في إنشاء الإحصائيات العامة:', statsError);
    }

    // إضافة مخطط حالة الطلبات في صفحة منفصلة
    if (chartRefs.pieChartRef?.current) {
      try {
        pdf.addPage();
        yPos = 20;

        const chartTitleElement = createTextElement(`توزيع الطلبات ${getStatusTitle(pieStatus)} حسب الإدارة`, 26, true);
        const chartTitleImage = await elementToImage(chartTitleElement);
        if (chartTitleImage) {
          pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 180, 15);
          yPos += 25;
        }

        console.log('جاري تحويل مخطط حالة الطلبات...');
        const chartImage = await chartToImage(chartRefs.pieChartRef);
        if (chartImage) {
          console.log('تم تحويل مخطط حالة الطلبات بنجاح');
          const imgWidth = 140;
          const imgHeight = 100;
          pdf.addImage(chartImage, 'jpeg', 25, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 20;

          // إضافة جدول تفاصيل توزيع الحالة المحددة
          const pieHeaders = ['الإدارة', `عدد الطلبات ${getStatusTitle(pieStatus)}`];
          const pieRows = departments.map(dept => {
            const stats = chartsData.departmentStats?.[dept.id] || {};
            const count = pieStatus === 'pending' ? stats.pendingCount :
              pieStatus === 'delayed' ? stats.delayedCount :
                pieStatus === 'approved' ? stats.approvedCount :
                  pieStatus === 'rejected' ? stats.rejectedCount : 0;
            return [dept.name, count || 0];
          });

          const pieTable = createSingleTable(
            pieHeaders,
            pieRows,
            `تفاصيل توزيع الطلبات ${getStatusTitle(pieStatus)} حسب الإدارة`,
            1,
            1,
            16
          );

          // إضافة الجدول تحت المخطط الدائري
          const pieTableImage = await elementToImage(pieTable);
          if (pieTableImage) {
            pdf.addImage(pieTableImage, 'jpeg', 15, yPos, 180, 60);
            yPos += 70;
          }
        }
      } catch (pieError) {
        console.error('خطأ في إضافة مخطط حالة الطلبات:', pieError);
      }
    }

    // إضافة مخطط عدد الطلبات المنشأة في صفحة منفصلة
    if (chartRefs.lineChartRef?.current) {
      try {
        pdf.addPage();
        yPos = 20;

        const chartTitleElement = createTextElement('تفاصيل الطلبات المنشأه حسب الفترة الزمنية', 26, true);
        const chartTitleImage = await elementToImage(chartTitleElement);
        if (chartTitleImage) {
          pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
          yPos += 25;
        }

        const chartImage = await chartToImage(chartRefs.lineChartRef);
        if (chartImage) {
          const imgWidth = 160;
          const imgHeight = 120;
          pdf.addImage(chartImage, 'jpeg', 25, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 20;

          // إضافة جدول تفاصيل الطلبات حسب الفترة
          if (chartsData.periods && chartsData.lineCreated?.datasets?.[0]?.data) {
            const lineHeaders = ['الفترة الزمنية', 'عدد الطلبات'];
            const lineRows = chartsData.periods.map((period, index) => [
              `${new Date(period.start).toLocaleDateString('ar-EG')} - ${new Date(period.end).toLocaleDateString('ar-EG')}`,
              chartsData.lineCreated.datasets[0].data[index] || 0
            ]);

            const lineTable = createSingleTable(
              lineHeaders,
              lineRows,
              'تفاصيل عدد الطلبات حسب الفترة الزمنية',
              1,
              1,
              16
            );

            // إضافة الجدول تحت المخطط الخطي
            const lineTableImage = await elementToImage(lineTable);
            if (lineTableImage) {
              pdf.addImage(lineTableImage, 'jpeg', 15, yPos, 180, 60);
              yPos += 70;
            }
          }
        }
      } catch (error) {
        console.error('خطأ في إضافة مخطط الخط وجدول التفاصيل:', error);
      }
    }

    // إضافة مخطط متوسط وقت المعالجة في صفحة منفصلة
    if (chartRefs.barChartRef?.current) {
      try {
        pdf.addPage();
        yPos = 20;

        const chartTitleElement = createTextElement('متوسط وقت المعالجة حسب الإدارة', 26, true);
        const chartTitleImage = await elementToImage(chartTitleElement);
        if (chartTitleImage) {
          pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
          yPos += 25;
        }

        console.log('جاري تحويل مخطط متوسط وقت المعالجة...');
        const chartImage = await chartToImage(chartRefs.barChartRef);
        if (chartImage) {
          console.log('تم تحويل مخطط متوسط وقت المعالجة بنجاح');
          const imgWidth = 160;
          const imgHeight = 120;
          pdf.addImage(chartImage, 'jpeg', 25, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 20;

          console.log('بيانات متوسط وقت المعالجة:', chartsData);
          console.log('بيانات الإدارات:', departments);

          // جدول متوسط وقت المعالجة
          if (departments?.length) {
            const timeHeaders = ['الإدارة', 'متوسط وقت المعالجة (يوم)'];
            const timeRows = departments.map(dept => {
              const stats = chartsData.departmentStats?.[dept.id] || {};
              const avgTime = stats.averageProcessingTime || chartsData.barProcessing?.datasets?.[0]?.data?.[departments.indexOf(dept)] || 0;
              return [
                dept.name,
                avgTime.toFixed(1)
              ];
            });

            const timeTableElement = createSingleTable(
              timeHeaders,
              timeRows,
              'تفاصيل متوسط وقت المعالجة حسب الإدارة',
              1,
              1,
              16
            );

            const timeTableImage = await elementToImage(timeTableElement);
            if (timeTableImage) {
              pdf.addImage(timeTableImage, 'jpeg', 15, yPos, 180, 60);
              yPos += 70;
            }
          }
        }
      } catch (timeError) {
        console.error('خطأ في إضافة مخطط متوسط وقت المعالجة:', timeError);
      }
    }

    // إضافة مخطط عدد الطلبات حسب الإدارة في صفحة منفصلة
    if (chartRefs.timeLineChartRef?.current) {
      try {
        pdf.addPage();
        yPos = 20;

        const chartTitleElement = createTextElement('عدد الطلبات حسب الإدارة', 26, true);
        const chartTitleImage = await elementToImage(chartTitleElement);
        if (chartTitleImage) {
          pdf.addImage(chartTitleImage, 'jpeg', 10, yPos, 190, 15);
          yPos += 25;
        }

        console.log('جاري تحويل مخطط عدد الطلبات حسب الإدارة...');
        const chartImage = await chartToImage(chartRefs.timeLineChartRef);
        if (chartImage) {
          console.log('تم تحويل مخطط عدد الطلبات حسب الإدارة بنجاح');
          const imgWidth = 160;
          const imgHeight = 120;
          pdf.addImage(chartImage, 'jpeg', 25, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 20;

          if (departments?.length && chartsData?.departmentCounts) {
            const countHeaders = ['الإدارة', 'عدد الطلبات'];
            const countRows = departments.map((dept, index) => [
              dept.name,
              chartsData.departmentCounts[index] || 0
            ]);

            const countTableElement = createSingleTable(
              countHeaders,
              countRows,
              'تفاصيل عدد الطلبات حسب الإدارة',
              1,
              1,
              16
            );

            const countTableImage = await elementToImage(countTableElement);
            if (countTableImage) {
              console.log('تم إضافة جدول عدد الطلبات حسب الإدارة');
              pdf.addImage(countTableImage, 'jpeg', 15, yPos, 180, 60);
            }
          }
        }
      } catch (countError) {
        console.error('خطأ في إضافة مخطط عدد الطلبات حسب الإدارة:', countError);
      }
    }

    // إضافة أرقام الصفحات
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const pageNumberElement = createTextElement(`الصفحة ${i} من ${pageCount}`, 16, false, 'center');
      const pageNumberImage = await elementToImage(pageNumberElement);
      if (pageNumberImage) {
        pdf.addImage(pageNumberImage, 'jpeg', 70, 280, 70, 10);
      }
    }

    // حفظ الملف
    pdf.save(`تقرير_لوحة_المعلومات_${new Date().toLocaleDateString('ar-EG')}.pdf`);
    console.log('تم إنشاء التقرير بنجاح');
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء التقرير:', error);
    return false;
  }
};
