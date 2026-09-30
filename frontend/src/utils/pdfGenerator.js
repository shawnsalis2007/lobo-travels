/**
 * pdfGenerator.js
 * Client-side PDF export using html2pdf.js
 * - enableLinks: true  →  Wikipedia hyperlinks are clickable in PDF
 * - 2x scale            →  retina-quality images
 * - A4 strict sizing    →  210mm × 297mm
 * - .avoid-break / .day-card classes prevent page breaks mid-card
 */

const PDF_OPTIONS = (filename) => ({
  margin: [10, 10, 10, 10],
  filename,
  image: { type: "jpeg", quality: 0.95 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true,
    allowTaint: false,
    logging: false,
  },
  jsPDF: {
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  },
  pagebreak: {
    mode: ["avoid-all", "css", "legacy"],
    before: ".page-break-before",
    avoid: [".day-card", ".avoid-break", ".hotel-vehicle-card", ".terms-box", ".page-break-avoid"],
  },
  enableLinks: true, // Wikipedia URLs become clickable in PDF
});

/**
 * Export the main itinerary preview to PDF.
 * @param {HTMLElement} element
 * @param {string} refNumber
 */
export async function exportItineraryToPdf(element, refNumber) {
  const html2pdf = (await import("html2pdf.js")).default;
  const filename = `Lobo-Itinerary-${refNumber || "Draft"}-${Date.now()}.pdf`;
  await html2pdf().set(PDF_OPTIONS(filename)).from(element).save();
}

/**
 * Export the travel voucher to PDF.
 * @param {HTMLElement} element
 * @param {string} refNumber
 */
export async function exportVoucherToPdf(element, refNumber) {
  const html2pdf = (await import("html2pdf.js")).default;
  const voucherRef = (refNumber || "LT-Draft").replace("LT-", "LTV-");
  const filename = `Lobo-Voucher-${voucherRef}-${Date.now()}.pdf`;
  await html2pdf().set(PDF_OPTIONS(filename)).from(element).save();
}
