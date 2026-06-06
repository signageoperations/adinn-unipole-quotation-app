import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Quotation } from '../types/quotation';

function safeFilePart(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'quotation';
}

function waitForFrame(): Promise<void> {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}

export async function downloadQuotationPdf(element: HTMLElement, quote: Quotation): Promise<void> {
  const sourcePage = (element.querySelector('.a4-page') as HTMLElement | null) ?? element;

  // Capture the full quotation height, not only a single A4 viewport.
  // Long item tables are allowed to continue into additional PDF pages.
  const holder = document.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.style.position = 'fixed';
  holder.style.left = '-10000px';
  holder.style.top = '0';
  holder.style.width = '210mm';
  holder.style.height = 'auto';
  holder.style.minHeight = '297mm';
  holder.style.overflow = 'visible';
  holder.style.background = '#ffffff';
  holder.style.zIndex = '-1';

  const clonedPage = sourcePage.cloneNode(true) as HTMLElement;
  clonedPage.style.width = '210mm';
  clonedPage.style.maxWidth = 'none';
  clonedPage.style.height = 'auto';
  clonedPage.style.minHeight = '297mm';
  clonedPage.style.aspectRatio = 'auto';
  clonedPage.style.overflow = 'visible';
  clonedPage.style.boxShadow = 'none';
  clonedPage.style.transform = 'none';
  clonedPage.style.breakInside = 'auto';
  clonedPage.style.pageBreakInside = 'auto';

  const clonedHeader = clonedPage.querySelector('.quote-header') as HTMLElement | null;
  if (clonedHeader) {
    clonedHeader.style.display = 'grid';
    clonedHeader.style.gridTemplateColumns = 'minmax(0, 1fr) 152px';
    clonedHeader.style.alignItems = 'start';
    clonedHeader.style.columnGap = '10px';
  }

  const clonedMeta = clonedPage.querySelector('.quote-meta-card') as HTMLElement | null;
  if (clonedMeta) {
    clonedMeta.style.justifySelf = 'end';
    clonedMeta.style.alignSelf = 'start';
    clonedMeta.style.marginLeft = '0';
  }

  holder.appendChild(clonedPage);
  document.body.appendChild(holder);

  try {
    await waitForFrame();

    const canvas = await html2canvas(clonedPage, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 1400,
      windowHeight: Math.max(1980, clonedPage.scrollHeight + 80),
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let remainingHeight = imgHeight;
    let yPosition = 0;

    pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight, undefined, 'FAST');
    remainingHeight -= pageHeight;

    while (remainingHeight > 0.5) {
      pdf.addPage();
      yPosition = remainingHeight - imgHeight;
      pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight, undefined, 'FAST');
      remainingHeight -= pageHeight;
    }

    const client = safeFilePart(quote.client.companyName);
    const number = safeFilePart(quote.quotationNo);
    pdf.save(`${client}-${number}.pdf`);
  } finally {
    holder.remove();
  }
}
