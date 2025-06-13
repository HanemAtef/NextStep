import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";

const elementToImage = async (element, scale = 3) => {
  try {
    const container = document.createElement("div");
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
        backgroundColor: "#ffffff",
      });

      return canvas.toDataURL("image/jpeg", 0.9);
    } finally {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }
  } catch (error) {
    console.error("خطأ في تحويل العنصر إلى صورة:", error);
    return null;
  }
};

/**
 * وظيفة مساعدة لإضافة جدول إلى PDF
 */
const addTableToPDF = async (pdf, table, yPos, isNewPage = false) => {
  try {
    if (isNewPage) pdf.addPage();
    const image = await elementToImage(table);
    if (image) {
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const maxWidth = pdfWidth - 2 * margin;
      const maxHeight = 110; // ارتفاع أقصى للجدول

      let tableWidth = table.offsetWidth || 100;
      let tableHeight = table.offsetHeight || 100;
      if (tableWidth <= 0 || tableHeight <= 0) {
        console.warn("أبعاد الجدول غير صالحة، استخدام قيم افتراضية:", {
          tableWidth,
          tableHeight,
        });
        tableWidth = 100;
        tableHeight = 100;
      }

      // حساب النسبة بين العرض والارتفاع
      const aspectRatio = table.offsetWidth / table.offsetHeight || 1;

      // حساب الأبعاد النهائية
      let finalWidth = maxWidth;
      let finalHeight = finalWidth / aspectRatio;

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = finalHeight * aspectRatio;
      }

      const xPos = (pdfWidth - finalWidth) / 2;

      pdf.addImage(image, "PNG", xPos, yPos, finalWidth, finalHeight);
      return true;
    }
    return false;
  } catch (error) {
    console.error("خطأ في إضافة الجدول:", error);
    return false;
  }
};

/**
 * وظيفة لإنشاء جدول بيانات بتنسيق موحد
 */
const createSingleTable = (
  headers,
  rows,
  title = "",
  pageNum = 1,
  totalPages = 1,
  fontSize = 16
) => {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    direction: rtl;
    font-family: 'Cairo', sans-serif;
    width: 800px;
    background-color: #ffffff;
    padding: 10px;
    box-sizing: border-box;
  `;

  if (title) {
    const titleDiv = document.createElement("div");
    titleDiv.style.cssText = `
      margin-bottom: 15px;
      font-weight: bold;
      font-size: ${fontSize + 2}px;
      color: #2c3e50;
      text-align: center;
      font-family: 'Cairo', sans-serif;
    `;
    titleDiv.textContent =
      title + (totalPages > 1 ? ` (${pageNum}/${totalPages})` : "");
    wrapper.appendChild(titleDiv);
  }

  const table = document.createElement("table");
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

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach((header) => {
    const th = document.createElement("th");
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
    th.textContent = String(header || "");
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.style.backgroundColor = index % 2 === 0 ? "#f8fcff" : "#ffffff";

    row.forEach((cell) => {
      const td = document.createElement("td");
      td.style.cssText = `
        padding: 10px;
        border: 1px solid #b6e3ff;
        text-align: center;
        color: #2c3e50;
        font-size: ${fontSize - 2}px;
        font-family: 'Cairo', sans-serif;
      `;
      td.textContent = String(cell || "");
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
};

/**
 * وظيفة محسنة لتقسيم الجدول إلى صفحات
 */
const splitTableIntoPages = (rows, itemsPerPage = 12) => {
  const pages = [];

  if (rows.length <= itemsPerPage) {
    pages.push(rows);
    return pages;
  }

  for (let i = 0; i < rows.length; i += itemsPerPage) {
    const pageRows = rows.slice(i, i + itemsPerPage);
    pages.push(pageRows);
  }

  if (pages.length > 1) {
    const lastPageIndex = pages.length - 1;
    const lastPage = pages[lastPageIndex];

    if (lastPage.length <= 3) {
      const previousPage = pages[lastPageIndex - 1];

      if (previousPage.length + lastPage.length <= 15) {
        pages[lastPageIndex - 1] = [...previousPage, ...lastPage];
        pages.pop();
      }
    }
  }

  return pages;
};

/**
 * دالة محسنة لإنشاء جدول البيانات مع إصلاح مشكلة التقسيم
 */
const createDataTable = async (
  pdf,
  headers,
  rows,
  title = "",
  startY = 40,
  fontSize = 20
) => {
  try {
    // console.log(`بدء إنشاء جدول: ${title}`);
    // console.log(`عدد الصفوف الإجمالي: ${rows.length}`);

    // التحقق من صحة المدخلات
    if (!Array.isArray(headers) || !Array.isArray(rows) || rows.length === 0) {
      console.error("المدخلات غير صالحة");
      return false;
    }

    const itemsPerPage = 12;
    const pages = splitTableIntoPages(rows, itemsPerPage);

    // console.log(`تم تقسيم الجدول إلى ${pages.length} صفحة`);
    pages.forEach((page, index) => {
      // console.log(`الصفحة ${index + 1}: ${page.length} صف`);
    });

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      // console.log(`معالجة الصفحة ${pageIndex + 1} من ${pages.length}`);

      if (pageIndex > 0) {
        pdf.addPage();
        // console.log("تمت إضافة صفحة جديدة");
      }

      const table = createSingleTable(
        headers,
        pages[pageIndex],
        title,
        pageIndex + 1,
        pages.length,
        fontSize
      );

      document.body.appendChild(table);

      await new Promise((resolve) => setTimeout(resolve, 200));

      const yPosition = pageIndex === 0 ? startY : 20;
      const success = await addTableToPDF(pdf, table, yPosition, false);

      if (document.body.contains(table)) {
        document.body.removeChild(table);
      }

      if (!success) {
        console.error(`فشل في إضافة الصفحة ${pageIndex + 1}`);
        return false;
      }

      // console.log(`تمت معالجة الصفحة ${pageIndex + 1} بنجاح`);
    }

    // console.log(`تم إنشاء جدول ${title} بنجاح`);
    return true;
  } catch (error) {
    console.error("خطأ في إنشاء الجدول:", error);
    return false;
  }
};

/**
 * وظيفة لإنشاء عنصر نصي بدقة عالية
 */
const createTextElement = (
  text,
  fontSize = 24,
  isBold = true,
  align = "center"
) => {
  const element = document.createElement("div");
  element.style.cssText = `
    direction: rtl;
    text-align: ${align};
    padding: 15px;
    width: 800px;
    background-color: #ffffff;
    font-family: 'Cairo', sans-serif;
    font-size: ${fontSize}px;
    font-weight: ${isBold ? "bold" : "normal"};
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
const chartToImage = async (chartRef, scale = 2) => {
  try {
    if (!chartRef?.current) {
      console.error("المخطط غير متوفر");
      return null;
    }

    const canvas = chartRef.current.canvas;
    if (!canvas) {
      console.error("عنصر canvas غير متوفر");
      return null;
    }

    const newCanvas = document.createElement("canvas");
    const ctx = newCanvas.getContext("2d");

    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    ctx.drawImage(canvas, 0, 0);

    return newCanvas.toDataURL("image/jpeg", 0.9);
  } catch (error) {
    console.error("خطأ في تحويل المخطط:", error);
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
      resolve(null);
    };
    img.src = src;
  });
};

/**
 * وظيفة مساعدة لتحويل العنصر إلى صورة
 */
export const convertChartToImage = async (chartRef, scale = 2) => {
  if (!chartRef?.current) {
    console.warn("المخطط البياني غير متاح");
    return null;
  }

  try {
    let canvas;

    if (chartRef.current.canvas) {
      canvas = chartRef.current.canvas;
    } else if (
      chartRef.current.querySelector &&
      chartRef.current.querySelector("canvas")
    ) {
      canvas = chartRef.current.querySelector("canvas");
    } else {
      try {
        const capturedCanvas = await html2canvas(chartRef.current, {
          scale: scale,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        return capturedCanvas.toDataURL("image/jpeg", 0.95);
      } catch (html2canvasError) {
        console.error(
          "فشل في التقاط المخطط باستخدام html2canvas:",
          html2canvasError
        );
        return null;
      }
    }

    if (!canvas) {
      console.warn("لم يتم العثور على عنصر canvas");
      return null;
    }

    const newCanvas = document.createElement("canvas");
    const ctx = newCanvas.getContext("2d");

    newCanvas.width = canvas.width * scale;
    newCanvas.height = canvas.height * scale;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

    ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);

    return newCanvas.toDataURL("image/jpeg", 0.95);
  } catch (error) {
    console.error("خطأ في تحويل المخطط البياني:", error);

    try {
      const capturedCanvas = await html2canvas(chartRef.current, {
        scale: scale,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      return capturedCanvas.toDataURL("image/jpeg", 0.95);
    } catch (finalError) {
      console.error("فشل نهائي في التقاط المخطط:", finalError);
      return null;
    }
  }
};

/**
 * وظيفة مساعدة للحصول على عنوان الحالة
 */
const getStatusTitle = (status) => {
  switch (status) {
    case "delayed":
      return "متاخر";
    case "rejected":
      return "مرفوض";
    case "approved":
      return "مقبول";
    case "pending":
      return "قيد التنفيذ";
    default:
      return "";
  }
};

/**
 * وظيفة توليد تقرير PDF للوحة التحكم محسنة مع معالجة أفضل للجداول
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
    if (!chartRefs || !chartsData) {
      console.error("البيانات المطلوبة غير متوفرة");
      return false;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    try {
      const logoCollage = await loadImage("/logoCollage.jpg");
      if (logoCollage) {
        pdf.addImage(logoCollage, "JPEG", 20, 10, 30, 30);
      }

      const logoUniversity = await loadImage("/logoUnivercity.png");
      if (logoUniversity) {
        pdf.addImage(logoUniversity, "PNG", 160, 10, 30, 30);
      }
    } catch (logoError) {
      console.warn("تعذر تحميل الشعارات:", logoError);
    }

    const title = createTextElement("تقرير لوحة المعلومات", 28, true);
    const titleImage = await elementToImage(title);
    if (titleImage) {
      pdf.addImage(titleImage, "JPEG", 20, 45, 170, 20);
    }

    let dateText = "جميع الفترات";
    if (dateRange.startDate && dateRange.endDate) {
      const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      };
      const startDate = formatDate(dateRange.startDate);
      const endDate = formatDate(dateRange.endDate);
      dateText = `الفترة من ${startDate} إلى ${endDate}`;
    }
    const dateElement = createTextElement(dateText, 16, false);
    const dateImage = await elementToImage(dateElement);
    if (dateImage) {
      pdf.addImage(dateImage, "PNG", 20, 70, 170, 10);
    }

    const reportDate = createTextElement(
      `تاريخ إنشاء التقرير: ${new Date().toLocaleDateString("en-GB")}`,
      14,
      false
    );
    const reportDateImage = await elementToImage(reportDate);
    if (reportDateImage) {
      pdf.addImage(reportDateImage, "JPEG", 20, 85, 170, 10);
    }

    pdf.setDrawColor(52, 58, 64);
    pdf.setLineWidth(0.5);
    pdf.line(15, 95, 195, 95);

    const statsHeaders = ["المؤشر", "القيمة"];
    const statsRows = [
      ["إجمالي عدد الطلبات", chartsData.stats.totalRequests || 0],
      ["الطلبات قيد التنفيذ", chartsData.stats.pendingRequests || 0],
      ["الطلبات المتأخرة", chartsData.stats.delayedRequests || 0],
      ["الطلبات المقبولة", chartsData.stats.approvedRequests || 0],
      ["الطلبات المرفوضة", chartsData.stats.rejectedRequests || 0],
    ];

    console.log("بدء إنشاء جدول الإحصائيات العامة");
    await createDataTable(
      pdf,
      statsHeaders,
      statsRows,
      "الإحصائيات العامة",
      100,
      22
    );

    const statuses = ["pending", "delayed", "approved", "rejected"];
    const statusTitles = {
      pending: "قيد التنفيذ",
      delayed: "متأخره",
      approved: "مقبول",
      rejected: "مرفوض",
    };

    for (const status of statuses) {
      if (chartRefs.pieChartRef?.current) {
        try {
          // console.log(`معالجة الحالة: ${status}`);

          if (onStatusChange) {
            await onStatusChange(status);
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }

          const chartInstance =
            chartRefs.pieChartRef.current.chartInstance ||
            chartRefs.pieChartRef.current;

          if (!chartInstance || !chartInstance.data) {
            console.warn(`المخطط غير متاح للحالة: ${status}`);
            continue;
          }

          const currentLabels = chartInstance.data.labels || [];
          const currentData = chartInstance.data.datasets?.[0]?.data || [];

          const hasValidData = currentData.some((value) => value > 0);

          if (!hasValidData || currentLabels.length === 0) {
            console.warn(`لا توجد بيانات صالحة للحالة: ${status}`);
            continue;
          }

          const filteredData = {
            labels: [],
            data: [],
          };

          currentLabels.forEach((label, index) => {
            const value = currentData[index] || 0;
            if (
              value > 0 &&
              !label.includes("إدارة التقارير") &&
              !label.includes("اداره التقارير")
            ) {
              filteredData.labels.push(label);
              filteredData.data.push(value);
            }
          });

          if (
            filteredData.labels.length === 0 ||
            filteredData.data.every((val) => val === 0)
          ) {
            console.warn(`لا توجد بيانات صالحة بعد التصفية للحالة: ${status}`);
            continue;
          }

          const pieChartImage = await convertChartToImage(
            chartRefs.pieChartRef
          );

          if (pieChartImage) {
            pdf.addPage();
            const pieTitle = createTextElement(
              `توزيع الطلبات ${statusTitles[status]} حسب الإدارة`,
              24
            );
            const pieTitleImage = await elementToImage(pieTitle);
            if (pieTitleImage) {
              pdf.addImage(pieTitleImage, "PNG", 20, 10, 170, 15);
            }
            pdf.addImage(pieChartImage, "PNG", 20, 30, 170, 80);

            const pieDataHeaders = ["الإدارة", "عدد الطلبات"];
            const pieDataRows = filteredData.labels.map((label, index) => {
              const value = filteredData.data[index] || 0;
              return [label, value];
            });

            // console.log(`بدء إنشاء جدول بيانات للحالة: ${status}`);
            // console.log(`عدد الصفوف: ${pieDataRows.length}`);

            await createDataTable(
              pdf,
              pieDataHeaders,
              pieDataRows,
              `تفاصيل توزيع الطلبات ${statusTitles[status]} حسب الإدارة`,
              120,
              20
            );
          }
        } catch (error) {
          console.error(`خطأ في معالجة الحالة ${status}:`, error);
          continue;
        }
      }
    }

    if (chartRefs.barChartRef && chartRefs.barChartRef.current) {
      const barChartImage = await convertChartToImage(chartRefs.barChartRef);
      if (barChartImage) {
        pdf.addPage();
        const barTitle = createTextElement(
          "متوسط وقت المعالجة حسب الإدارة",
          24
        );
        const barTitleImage = await elementToImage(barTitle);
        if (barTitleImage) {
          pdf.addImage(barTitleImage, "JPEG", 20, 10, 170, 15);
        }
        pdf.addImage(barChartImage, "JPEG", 20, 30, 170, 80);

        if (chartsData.timeAnalysis && chartsData.timeAnalysis.labels) {
          const timeHeaders = ["الإدارة", "متوسط وقت المعالجة "];
          const timeRows = chartsData.timeAnalysis.labels
            .filter(
              (label) =>
                !label.includes("إدارة التقارير") &&
                !label.includes("اداره التقارير")
            )
            .map((label, index) => [
              label,
              (chartsData.timeAnalysis.data[index] || 0).toFixed(1),
            ]);

          // console.log("بدء إنشاء جدول تحليل الوقت");
          await createDataTable(
            pdf,
            timeHeaders,
            timeRows,
            "تفاصيل متوسط وقت المعالجة",
            120,
            20
          );
        }
      }
    }

    if (chartRefs.lineChartRef && chartRefs.lineChartRef.current) {
      const lineChartImage = await convertChartToImage(chartRefs.lineChartRef);
      if (lineChartImage) {
        pdf.addPage();
        const lineTitle = createTextElement(
          "تحليل الطلبات المنشأة خلال الفترة",
          24
        );
        const lineTitleImage = await elementToImage(lineTitle);
        if (lineTitleImage) {
          pdf.addImage(lineTitleImage, "JPEG", 20, 10, 170, 15);
        }
        // تقليل حجم الرسم البياني لإفساح المجال للجدول
        pdf.addImage(lineChartImage, "JPEG", 20, 30, 170, 80);

        if (chartsData.createdRequests && chartsData.createdRequests.labels) {
          // إزالة عمود نسبة التغيير
          const createdHeaders = ["التاريخ", "عدد الطلبات"];
          const createdRows = chartsData.createdRequests.labels.map(
            (label, index) => {
              const currentValue = chartsData.createdRequests.data[index] || 0;
              return [label, currentValue];
            }
          );

          // console.log("بدء إنشاء جدول الطلبات المنشأة");
          await createDataTable(
            pdf,
            createdHeaders,
            createdRows,
            "تفاصيل الطلبات المنشأة",
            120,
            20
          );
        }
      }
    }

    if (chartRefs.timeLineChartRef && chartRefs.timeLineChartRef.current) {
      const timeLineChartImage = await convertChartToImage(
        chartRefs.timeLineChartRef
      );
      if (timeLineChartImage) {
        pdf.addPage();
        const deptTitle = createTextElement("توزيع الطلبات على الإدارات", 24);
        const deptTitleImage = await elementToImage(deptTitle);
        if (deptTitleImage) {
          pdf.addImage(deptTitleImage, "JPEG", 20, 10, 170, 15);
        }
        pdf.addImage(timeLineChartImage, "JPEG", 20, 30, 170, 80);

        if (chartsData.requestsCount && chartsData.requestsCount.labels) {
          // إزالة عمود النسبة المئوية
          const deptHeaders = ["الإدارة", "عدد الطلبات"];
          const deptRows = chartsData.requestsCount.labels
            .filter(
              (label) =>
                !label.includes("إدارة التقارير") &&
                !label.includes("اداره التقارير")
            )
            .map((label, index) => {
              const value = chartsData.requestsCount.data[index] || 0;
              return [label, value];
            });

          await createDataTable(
            pdf,
            deptHeaders,
            deptRows,
            "تفاصيل توزيع الطلبات على الإدارات",
            120,
            20
          );
        }
      }
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const pageNumberElement = createTextElement(
        `الصفحة ${i} من ${pageCount}`,
        14,
        false
      );
      const pageNumberImage = await elementToImage(pageNumberElement);
      if (pageNumberImage) {
        pdf.addImage(pageNumberImage, "JPEG", 70, 280, 70, 10);
      }
    }

    const fileName = `تقرير_لوحة_المعلومات_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);

    return true;
  } catch (error) {
    console.error("خطأ في إنشاء التقرير:", error);
    return false;
  }
};
