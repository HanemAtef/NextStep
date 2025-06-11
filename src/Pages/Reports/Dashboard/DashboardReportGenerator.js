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
      const margin = 20;     // الهامش

      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = 100; // ارتفاع أقصى للجدول

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
    width: 700px;
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
 * وظيفة مساعدة لتحويل مخطط Chart.js إلى صورة مع خلفية بيضاء
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

    // إنشاء canvas جديد مع خلفية بيضاء
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');

    // تعيين نفس الأبعاد
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    // رسم خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // رسم المخطط الأصلي فوق الخلفية البيضاء
    ctx.drawImage(canvas, 0, 0);

    return newCanvas.toDataURL('image/jpeg', 0.9);
  } catch (error) {
    console.error('خطأ في تحويل المخطط:', error);
    return null;
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
 * وظيفة مساعدة للتحقق من وجود العنصر في المستند وتحويله إلى صورة مع خلفية بيضاء
 */
export const convertChartToImage = async (chartRef, scale = 4) => {
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

    // إنشاء canvas جديد مع خلفية بيضاء
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');

    // تعيين نفس الأبعاد مع مضaعف الدقة
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    // رسم خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    // رسم المخطط الأصلي فوق الخلفية البيضاء
    ctx.drawImage(canvas, 0, 0);

    return newCanvas.toDataURL('image/jpeg', 0.9);
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
      return 'متاخر';
    case 'rejected':
      return 'مرفوض';
    case 'approved':
      return 'مقبول';
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
  chartsData,
  onStatusChange
) => {
  try {
    // التحقق من وجود البيانات المطلوبة
    if (!chartRefs || !chartsData) {
      console.error('البيانات المطلوبة غير متوفرة');
      return false;
    }

    // إنشاء مستند PDF جديد - إزالة إعدادات الخطوط المشكلة
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

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
    const title = createTextElement('تقرير لوحة المعلومات', 28, true);
    const titleImage = await elementToImage(title);
    if (titleImage) {
      pdf.addImage(titleImage, 'JPEG', 20, 45, 170, 20);
    }

    // إضافة معلومات التاريخ بالتقليم الميلادي
    let dateText = 'جميع الفترات';
    if (dateRange.startDate && dateRange.endDate) {
      const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', { // استخدام التنسيق الميلادي
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      };
      const startDate = formatDate(dateRange.startDate);
      const endDate = formatDate(dateRange.endDate);
      dateText = `الفترة من ${startDate} إلى ${endDate}`;
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
    const statsHeaders = ['المؤشر', 'القيمة'];
    const statsRows = [
      ['إجمالي عدد الطلبات', chartsData.stats.totalRequests || 0],
      ['الطلبات قيد التنفيذ', chartsData.stats.pendingRequests || 0],
      ['الطلبات المتأخرة', chartsData.stats.delayedRequests || 0],
      ['الطلبات المقبولة', chartsData.stats.approvedRequests || 0],
      ['الطلبات المرفوضة', chartsData.stats.rejectedRequests || 0],
    ];
    const statsTable = createSingleTable(statsHeaders, statsRows, 'الإحصائيات العامة');
    await addTableToPDF(pdf, statsTable, 100);

    // إضافة مخططات توزيع الطلبات لكل حالة
    const statuses = ['pending', 'delayed', 'approved', 'rejected'];
    const statusTitles = {
      pending: 'قيد التنفيذ',
      delayed: 'متأخره',
      approved: 'مقبول',
      rejected: 'مرفوض'
    };

    // إضافة المخططات للتقرير
    for (const status of statuses) {
      if (chartRefs.pieChartRef?.current) {
        try {
          console.log(`معالجة الحالة: ${status}`);

          // تحديث الحالة
          if (onStatusChange) {
            await onStatusChange(status);
            // انتظار أطول لضمان تحديث البيانات
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // الحصول على البيانات المحدثة مباشرة من المخطط
          const chartInstance = chartRefs.pieChartRef.current.chartInstance || chartRefs.pieChartRef.current;

          if (!chartInstance || !chartInstance.data) {
            console.warn(`المخطط غير متاح للحالة: ${status}`);
            continue;
          }

          // استخراج البيانات الحالية من المخطط
          const currentLabels = chartInstance.data.labels || [];
          const currentData = chartInstance.data.datasets?.[0]?.data || [];

          console.log(`البيانات للحالة ${status}:`, { currentLabels, currentData });

          // التحقق من أن البيانات غير فارغة وتحتوي على قيم فعلية
          const hasValidData = currentData.some(value => value > 0);

          if (!hasValidData || currentLabels.length === 0) {
            console.warn(`لا توجد بيانات صالحة للحالة: ${status}`);
            continue;
          }

          // تنقية البيانات من إدارة التقارير
          const filteredData = {
            labels: [],
            data: []
          };

          currentLabels.forEach((label, index) => {
            const value = currentData[index] || 0;
            // فقط إضافة البيانات التي تحتوي على قيم أكبر من صفر وليست إدارة التقارير
            if (value > 0 &&
              !label.includes('إدارة التقارير') &&
              !label.includes('اداره التقارير')) {
              filteredData.labels.push(label);
              filteredData.data.push(value);
            }
          });

          // التحقق من وجود بيانات صالحة بعد التصفية
          if (filteredData.labels.length === 0 || filteredData.data.every(val => val === 0)) {
            console.warn(`لا توجد بيانات صالحة بعد التصفية للحالة: ${status}`);
            continue;
          }

          // تحويل المخطط الحالي إلى صورة مباشرة
          const pieChartImage = await convertChartToImage(chartRefs.pieChartRef);

          if (pieChartImage) {
            pdf.addPage();
            const pieTitle = createTextElement(`توزيع الطلبات ${statusTitles[status]} حسب الإدارة`, 24);
            const pieTitleImage = await elementToImage(pieTitle);
            if (pieTitleImage) {
              pdf.addImage(pieTitleImage, 'PNG', 20, 10, 170, 15);
            }
            pdf.addImage(pieChartImage, 'PNG', 20, 30, 170, 100);

            // إضافة جدول تفصيلي للبيانات
            const pieDataHeaders = ['الإدارة', 'عدد الطلبات', 'النسبة المئوية'];
            const total = filteredData.data.reduce((sum, val) => sum + (val || 0), 0);
            const pieDataRows = filteredData.labels.map((label, index) => {
              const value = filteredData.data[index] || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              return [label, value, percentage];
            });

            if (pieDataRows.length > 0) {
              const pieDataTable = createSingleTable(
                pieDataHeaders,
                pieDataRows,
                `تفاصيل توزيع الطلبات ${statusTitles[status]} حسب الإدارة`
              );
              await addTableToPDF(pdf, pieDataTable, 140);
            }
          }
        } catch (error) {
          console.error(`خطأ في معالجة الحالة ${status}:`, error);
          continue;
        }
      }
    }

    // إضافة مخطط متوسط وقت المعالجة
    if (chartRefs.barChartRef && chartRefs.barChartRef.current) {
      const barChartImage = await convertChartToImage(chartRefs.barChartRef);
      if (barChartImage) {
        pdf.addPage();
        const barTitle = createTextElement('متوسط وقت المعالجة حسب الإدارة', 24);
        const barTitleImage = await elementToImage(barTitle);
        if (barTitleImage) {
          pdf.addImage(barTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(barChartImage, 'JPEG', 20, 30, 170, 100);

        // إضافة جدول تفصيلي للبيانات
        if (chartsData.timeAnalysis && chartsData.timeAnalysis.labels) {
          const timeHeaders = ['الإدارة', 'متوسط وقت المعالجة (ساعة)', 'عدد الطلبات المعالجة'];
          const timeRows = chartsData.timeAnalysis.labels
            .filter(label => !label.includes('إدارة التقارير') && !label.includes('اداره التقارير'))
            .map((label, index) => [
              label,
              (chartsData.timeAnalysis.data[index] || 0).toFixed(1),
              chartsData.timeAnalysis.requestCounts ? chartsData.timeAnalysis.requestCounts[index] || 0 : 0
            ]);
          const timeTable = createSingleTable(timeHeaders, timeRows, 'تفاصيل متوسط وقت المعالجة');
          await addTableToPDF(pdf, timeTable, 140);
        }
      }
    }

    // إضافة مخطط عدد الطلبات المنشأة
    if (chartRefs.lineChartRef && chartRefs.lineChartRef.current) {
      const lineChartImage = await convertChartToImage(chartRefs.lineChartRef);
      if (lineChartImage) {
        pdf.addPage();
        const lineTitle = createTextElement('تحليل الطلبات المنشأة خلال الفترة', 24);
        const lineTitleImage = await elementToImage(lineTitle);
        if (lineTitleImage) {
          pdf.addImage(lineTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(lineChartImage, 'JPEG', 20, 30, 170, 100);

        // إضافة جدول تفصيلي للبيانات
        if (chartsData.createdRequests && chartsData.createdRequests.labels) {
          const createdHeaders = ['التاريخ', 'عدد الطلبات', 'نسبة التغيير'];
          const createdRows = chartsData.createdRequests.labels.map((label, index) => {
            const currentValue = chartsData.createdRequests.data[index] || 0;
            const prevValue = index > 0 ? chartsData.createdRequests.data[index - 1] || 0 : 0;
            const change = prevValue === 0 ? '-' :
              ((currentValue - prevValue) / prevValue * 100).toFixed(1) + '%';
            return [label, currentValue, change];
          });
          const createdTable = createSingleTable(createdHeaders, createdRows, 'تفاصيل الطلبات المنشأة');
          await addTableToPDF(pdf, createdTable, 140);
        }
      }
    }

    // إضافة مخطط عدد الطلبات لكل إدارة
    if (chartRefs.timeLineChartRef && chartRefs.timeLineChartRef.current) {
      const timeLineChartImage = await convertChartToImage(chartRefs.timeLineChartRef);
      if (timeLineChartImage) {
        pdf.addPage();
        const deptTitle = createTextElement('توزيع الطلبات على الإدارات', 24);
        const deptTitleImage = await elementToImage(deptTitle);
        if (deptTitleImage) {
          pdf.addImage(deptTitleImage, 'JPEG', 20, 10, 170, 15);
        }
        pdf.addImage(timeLineChartImage, 'JPEG', 20, 30, 170, 100);

        // إضافة جدول تفصيلي للبيانات
        if (chartsData.requestsCount && chartsData.requestsCount.labels) {
          const deptHeaders = ['الإدارة', 'عدد الطلبات', 'النسبة المئوية'];
          const total = chartsData.requestsCount.data.reduce((sum, val) => sum + (val || 0), 0);
          const deptRows = chartsData.requestsCount.labels
            .filter(label => !label.includes('إدارة التقارير') && !label.includes('اداره التقارير'))
            .map((label, index) => {
              const value = chartsData.requestsCount.data[index] || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
              return [label, value, percentage];
            });
          const deptTable = createSingleTable(deptHeaders, deptRows, 'تفاصيل توزيع الطلبات على الإدارات');
          await addTableToPDF(pdf, deptTable, 140);
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
    const fileName = `تقرير_لوحة_المعلومات_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    return false;
  }
};