/**
 * pdfGenerator.js
 * Client-side PDF export using html2pdf.js
 * - enableLinks: true  →  Wikipedia hyperlinks are clickable in PDF
 * - 2x scale            →  retina-quality images
 * - A4 strict sizing    →  210mm × 297mm
 * - .avoid-break / .day-card classes prevent page breaks mid-card
 */

const PDF_OPTIONS = (filename) => ({
  margin: [8, 8, 8, 8],
  filename,
  image: { type: "jpeg", quality: 0.95 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    letterRendering: true,
    allowTaint: true,
    logging: false,
    windowWidth: 1024, // Forces desktop layout rendering on mobile devices
    scrollX: 0,
    scrollY: 0,
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
 * Creates an off-screen desktop-width render target for html2pdf to prevent mobile screen clipping.
 * @param {HTMLElement} element
 * @returns {{ container: HTMLElement, target: HTMLElement, cleanup: () => void }}
 */
function prepareRenderClone(element) {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "820px";
  container.style.background = "#ffffff";
  container.style.zIndex = "-9999";
  container.style.opacity = "1";
  container.style.pointerEvents = "none";

  const clone = element.cloneNode(true);
  clone.style.width = "820px";
  clone.style.maxWidth = "820px";
  clone.style.minWidth = "820px";
  clone.style.margin = "0";
  clone.style.boxSizing = "border-box";
  clone.classList.add("pdf-render-target");

  // Ensure all overflow wrappers are visible and never clipped horizontally
  const overflowElements = clone.querySelectorAll(".overflow-x-auto, .overflow-y-auto, .overflow-hidden");
  overflowElements.forEach((el) => {
    el.style.overflow = "visible";
    el.style.maxWidth = "none";
  });

  // Ensure tables stretch full width with proper auto sizing
  const tables = clone.querySelectorAll("table");
  tables.forEach((tbl) => {
    tbl.style.width = "100%";
    tbl.style.tableLayout = "auto";
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  return {
    target: clone,
    cleanup: () => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    },
  };
}

/**
 * Export the main itinerary preview to PDF.
 * @param {HTMLElement} element
 * @param {string} refNumber
 */
export async function exportItineraryToPdf(element, refNumber) {
  if (!element) return;
  const html2pdf = (await import("html2pdf.js")).default;
  const filename = `Lobo-Itinerary-${refNumber || "Draft"}-${Date.now()}.pdf`;

  const { target, cleanup } = prepareRenderClone(element);
  try {
    await html2pdf().set(PDF_OPTIONS(filename)).from(target).save();
  } finally {
    cleanup();
  }
}

/**
 * Export the travel voucher to PDF.
 * @param {HTMLElement} element
 * @param {string} refNumber
 */
export async function exportVoucherToPdf(element, refNumber) {
  if (!element) return;
  const html2pdf = (await import("html2pdf.js")).default;
  const voucherRef = (refNumber || "LT-Draft").replace("LT-", "LTV-");
  const filename = `Lobo-Voucher-${voucherRef}-${Date.now()}.pdf`;

  const { target, cleanup } = prepareRenderClone(element);
  try {
    await html2pdf().set(PDF_OPTIONS(filename)).from(target).save();
  } finally {
    cleanup();
  }
}
