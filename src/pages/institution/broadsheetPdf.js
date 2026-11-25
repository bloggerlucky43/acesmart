import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export async function downloadBroadsheetPdf(report, isCurrent, { Pdf = jsPDF, table = autoTable } = {}) {
  if (!report?.body.length || !isCurrent()) return false;
  // Let pending selector/auth changes commit before generating and before saving.
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (!isCurrent()) return false;
  const doc = new Pdf({ orientation: "landscape", unit: "mm", format: "a4" });
  const margin = 10;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const sections = [
    { text: report.schoolName, size: 12, style: "bold" },
    { text: report.title, size: 11, style: "bold" },
    { text: report.scopeLine, size: 9, style: "normal" },
    ...report.notes.map((text) => ({ text, size: 8, style: "normal" })),
  ].map((section) => {
    doc.setFont("helvetica", section.style);
    doc.setFontSize(section.size);
    return { ...section, lines: doc.splitTextToSize(section.text, width) };
  });
  const headerHeight = sections.reduce((height, section) => height + section.lines.length * section.size * 0.4 + 2, margin);
  table(doc, {
    head: [report.columns.map((column) => column.label)],
    body: report.body,
    theme: "grid",
    startY: headerHeight + 2,
    margin: { top: headerHeight + 2, right: margin, bottom: 14, left: margin },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2, overflow: "linebreak", halign: "center", valign: "middle", lineColor: [203, 213, 225], lineWidth: 0.2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: Object.fromEntries(report.columns.map((column, index) => [index, { cellWidth: column.width, halign: column.align || "center" }])),
    showHead: "everyPage",
    rowPageBreak: "avoid",
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: [0, 1, 2, 3],
    horizontalPageBreakBehaviour: "afterAllRows",
    willDrawPage: () => {
      let y = margin;
      doc.setTextColor(15, 23, 42);
      for (const section of sections) {
        doc.setFont("helvetica", section.style);
        doc.setFontSize(section.size);
        doc.text(section.lines, margin, y);
        y += section.lines.length * section.size * 0.4 + 2;
      }
    },
  });
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Page ${page} of ${pageCount}`, margin, doc.internal.pageSize.getHeight() - 6);
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (!isCurrent()) return false;
  doc.save(`${report.filename}.pdf`);
  return true;
}
