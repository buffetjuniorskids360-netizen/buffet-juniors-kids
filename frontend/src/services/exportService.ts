// Export service for generating PDF and Excel reports
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/reportUtils';

export interface ExportOptions {
  type: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeFiltered?: boolean;
  fileName?: string;
  title?: string;
  dateRange?: string;
}

export interface ChartData {
  chartElement: HTMLElement;
  title: string;
  width?: number;
  height?: number;
}

export interface ExportData {
  kpis: {
    totalRevenue: number;
    confirmedEvents: number;
    activeClients: number;
    conversionRate: number;
    growthRate: number;
    averageTicket: number;
    paymentRate: number;
    pendingPayments: number;
  };
  chartData?: ChartData[];
  tableData: {
    headers: string[];
    rows: string[][];
  };
  filters?: Record<string, any>;
  dateRange?: string;
}

class ExportService {
  private async captureChartAsImage(chartElement: HTMLElement): Promise<string> {
    try {
      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: chartElement.offsetWidth,
        height: chartElement.offsetHeight,
      });
      return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
      console.error('Error capturing chart:', error);
      return '';
    }
  }

  async generatePDF(data: ExportData, options: ExportOptions = { type: 'pdf' }): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (height: number) => {
      if (yPosition + height > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Add company header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Executivo', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${currentDate}`, margin, yPosition);
    yPosition += 5;

    if (data.dateRange) {
      doc.text(`Período: ${data.dateRange}`, margin, yPosition);
      yPosition += 10;
    }

    // Add KPIs section
    yPosition += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores Chave de Performance', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const kpiData = [
      ['Receita Total', formatCurrency(data.kpis.totalRevenue)],
      ['Eventos Confirmados', data.kpis.confirmedEvents.toString()],
      ['Clientes Ativos', data.kpis.activeClients.toString()],
      ['Taxa de Conversão', formatPercentage(data.kpis.conversionRate)],
      ['Crescimento', formatPercentage(data.kpis.growthRate)],
      ['Ticket Médio', formatCurrency(data.kpis.averageTicket)],
      ['Taxa de Pagamento', formatPercentage(data.kpis.paymentRate)],
      ['Pagamentos Pendentes', formatCurrency(data.kpis.pendingPayments)],
    ];

    // Create KPI table
    const tableStartY = yPosition;
    const cellHeight = 6;
    const cellWidth = (pageWidth - 2 * margin) / 2;

    kpiData.forEach((row, index) => {
      const currentY = tableStartY + (index * cellHeight);
      checkPageBreak(cellHeight + 5);
      
      // Draw cell borders
      doc.rect(margin, currentY, cellWidth, cellHeight);
      doc.rect(margin + cellWidth, currentY, cellWidth, cellHeight);
      
      // Add text
      doc.text(row[0], margin + 2, currentY + 4);
      doc.setFont('helvetica', 'bold');
      doc.text(row[1], margin + cellWidth + 2, currentY + 4);
      doc.setFont('helvetica', 'normal');
    });

    yPosition = tableStartY + (kpiData.length * cellHeight) + 10;

    // Add charts if requested
    if (options.includeCharts && data.chartData && data.chartData.length > 0) {
      checkPageBreak(20);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Gráficos e Análises', margin, yPosition);
      yPosition += 15;

      for (const chart of data.chartData) {
        const imageData = await this.captureChartAsImage(chart.chartElement);
        if (imageData) {
          checkPageBreak(80);
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(chart.title, margin, yPosition);
          yPosition += 10;

          // Add chart image
          const imgWidth = chart.width || 160;
          const imgHeight = chart.height || 60;
          doc.addImage(imageData, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
        }
      }
    }

    // Add data table section
    if (data.tableData.rows.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Dados Detalhados', margin, yPosition);
      yPosition += 15;

      // Table headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const colWidth = (pageWidth - 2 * margin) / data.tableData.headers.length;
      
      data.tableData.headers.forEach((header, index) => {
        const x = margin + (index * colWidth);
        doc.rect(x, yPosition, colWidth, 6);
        doc.text(header, x + 1, yPosition + 4);
      });
      yPosition += 6;

      // Table rows (limit to prevent overflow)
      doc.setFont('helvetica', 'normal');
      const maxRows = Math.min(data.tableData.rows.length, 20);
      
      for (let i = 0; i < maxRows; i++) {
        checkPageBreak(6);
        const row = data.tableData.rows[i];
        
        row.forEach((cell, index) => {
          const x = margin + (index * colWidth);
          doc.rect(x, yPosition, colWidth, 6);
          const cellText = cell.length > 15 ? cell.substring(0, 15) + '...' : cell;
          doc.text(cellText, x + 1, yPosition + 4);
        });
        yPosition += 6;
      }

      if (data.tableData.rows.length > maxRows) {
        yPosition += 5;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(`... e mais ${data.tableData.rows.length - maxRows} registros`, margin, yPosition);
      }
    }

    // Add footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${totalPages} - Gerado pelo Sistema Financeiro`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = options.fileName || `relatorio_executivo_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }

  async generateExcel(data: ExportData, options: ExportOptions = { type: 'excel' }): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Create KPIs worksheet
    const kpisData = [
      ['Indicador', 'Valor'],
      ['Receita Total', formatCurrency(data.kpis.totalRevenue)],
      ['Eventos Confirmados', data.kpis.confirmedEvents.toString()],
      ['Clientes Ativos', data.kpis.activeClients.toString()],
      ['Taxa de Conversão', formatPercentage(data.kpis.conversionRate)],
      ['Crescimento', formatPercentage(data.kpis.growthRate)],
      ['Ticket Médio', formatCurrency(data.kpis.averageTicket)],
      ['Taxa de Pagamento', formatPercentage(data.kpis.paymentRate)],
      ['Pagamentos Pendentes', formatCurrency(data.kpis.pendingPayments)],
    ];

    const kpisWorksheet = XLSX.utils.aoa_to_sheet(kpisData);
    
    // Style the headers
    const kpisRange = XLSX.utils.decode_range(kpisWorksheet['!ref']!);
    for (let col = kpisRange.s.c; col <= kpisRange.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!kpisWorksheet[headerCell]) continue;
      kpisWorksheet[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '4F46E5' } },
        color: { rgb: 'FFFFFF' },
      };
    }

    XLSX.utils.book_append_sheet(workbook, kpisWorksheet, 'KPIs');

    // Create detailed data worksheet if available
    if (data.tableData.rows.length > 0) {
      const detailedData = [data.tableData.headers, ...data.tableData.rows];
      const detailedWorksheet = XLSX.utils.aoa_to_sheet(detailedData);
      
      // Style the headers
      const detailedRange = XLSX.utils.decode_range(detailedWorksheet['!ref']!);
      for (let col = detailedRange.s.c; col <= detailedRange.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!detailedWorksheet[headerCell]) continue;
        detailedWorksheet[headerCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '059669' } },
          color: { rgb: 'FFFFFF' },
        };
      }

      XLSX.utils.book_append_sheet(workbook, detailedWorksheet, 'Dados Detalhados');
    }

    // Create summary worksheet with filters and metadata
    const summaryData = [
      ['Relatório Executivo - Resumo'],
      [''],
      ['Data de Geração', formatDate(new Date())],
      ['Período', data.dateRange || 'Não especificado'],
      [''],
      ['Filtros Aplicados:'],
    ];

    if (data.filters) {
      Object.entries(data.filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          summaryData.push([key, value.toString()]);
        }
      });
    }

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo', 0);

    // Save the Excel file
    const fileName = options.fileName || `relatorio_executivo_${formatDate(new Date()).replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  async generateCSV(data: ExportData, options: ExportOptions = { type: 'csv' }): Promise<void> {
    const { downloadCSV, generateCSVContent } = await import('@/utils/reportUtils');
    
    const exportData = {
      headers: data.tableData.headers,
      rows: data.tableData.rows,
      filename: options.fileName || `relatorio_${formatDate(new Date()).replace(/\//g, '-')}.csv`
    };

    const csvContent = generateCSVContent(exportData);
    downloadCSV(csvContent, exportData.filename);
  }

  async exportDashboard(element: HTMLElement, options: ExportOptions): Promise<void> {
    if (options.type === 'pdf') {
      // Capture the entire dashboard
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png', 0.8);
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Calculate dimensions to fit page
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Dashboard Executivo', 10, 15);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 10, 25);

      // Add dashboard image
      if (imgHeight <= pageHeight - 40) {
        doc.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
      } else {
        // Split into multiple pages if needed
        const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 40));
        const pageImgHeight = (pageHeight - 40);
        
        for (let i = 0; i < pagesNeeded; i++) {
          if (i > 0) doc.addPage();
          
          const srcY = (i * pageImgHeight * canvas.height) / imgHeight;
          const srcHeight = Math.min(pageImgHeight * canvas.height / imgHeight, canvas.height - srcY);
          
          // Create a temporary canvas for this page
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = srcHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);
            const tempImgData = tempCanvas.toDataURL('image/png', 0.8);
            doc.addImage(tempImgData, 'PNG', 10, 30, imgWidth, pageImgHeight);
          }
        }
      }

      const fileName = options.fileName || `dashboard_${formatDate(new Date()).replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
    }
  }

  // Utility method to prepare export data from dashboard/reports
  prepareExportData(
    kpis: any,
    tableData: { headers: string[], rows: string[][] },
    chartElements?: HTMLElement[],
    filters?: Record<string, any>,
    dateRange?: string
  ): ExportData {
    const chartData: ChartData[] = chartElements?.map((element, index) => ({
      chartElement: element,
      title: `Gráfico ${index + 1}`,
      width: 160,
      height: 80,
    })) || [];

    return {
      kpis: {
        totalRevenue: kpis.monthlyRevenue || 0,
        confirmedEvents: kpis.confirmedEvents || 0,
        activeClients: kpis.activeClients || 0,
        conversionRate: kpis.conversionRate || 0,
        growthRate: kpis.growthRate || 0,
        averageTicket: kpis.averageEventValue || 0,
        paymentRate: kpis.paymentRate || 0,
        pendingPayments: kpis.pendingPayments || 0,
      },
      chartData,
      tableData,
      filters,
      dateRange,
    };
  }
}

export const exportService = new ExportService();