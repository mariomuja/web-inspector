import { Injectable } from '@angular/core';
import { WebAnalysisResult } from '../models/website.model';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  
  async exportToPdf(result: WebAnalysisResult): Promise<void> {
    // Dynamic import of jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    // Helper function to add text with page break
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight;
    };

    // Helper function to add wrapped text
    const addWrappedText = (text: string, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
      for (const line of splitText) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      }
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Website Analysis Report', margin, yPosition);
    yPosition += lineHeight * 2;

    // Site Information
    addText('Site Information', 16, true);
    yPosition += 3;
    addText(`Website: ${result.siteName}`, 12);
    addText(`URL: ${result.siteUrl}`, 12);
    addText(`Analyzed: ${new Date(result.analyzedAt).toLocaleString()}`, 12);
    addText(`Overall Score: ${result.overallScore}/100`, 12);
    yPosition += lineHeight;

    // Summary
    addText('Summary', 16, true);
    yPosition += 3;
    addText(`Total Rules Checked: ${result.summary.totalRules}`, 12);
    addText(`Passed: ${result.summary.passedRules}`, 12);
    addText(`Failed: ${result.summary.failedRules}`, 12);
    addText(`Warnings: ${result.summary.warningRules}`, 12);
    yPosition += lineHeight;

    // Violations
    if (result.violations && result.violations.length > 0) {
      addText('Violations and Issues', 16, true);
      yPosition += 3;

      result.violations.forEach((violation, index) => {
        if (yPosition > pageHeight - margin - 50) {
          doc.addPage();
          yPosition = margin;
        }

        addText(`${index + 1}. ${violation.ruleName}`, 12, true);
        addText(`   Category: ${violation.category}`, 10);
        addText(`   Severity: ${violation.severity.toUpperCase()}`, 10);
        
        if (violation.page) {
          addText(`   Page: ${violation.page}`, 10);
        }
        
        doc.setFontSize(10);
        doc.text('   Description:', margin, yPosition);
        yPosition += lineHeight;
        addWrappedText(`   ${violation.description}`, 10);
        
        doc.text('   Recommendation:', margin, yPosition);
        yPosition += lineHeight;
        addWrappedText(`   ${violation.recommendation}`, 10);
        
        if (violation.impact) {
          doc.text('   Impact:', margin, yPosition);
          yPosition += lineHeight;
          addWrappedText(`   ${violation.impact}`, 10);
        }
        
        if (violation.source) {
          addText(`   Source: ${violation.source}`, 10);
        }
        
        yPosition += lineHeight;
      });
    }

    // Save the PDF
    doc.save(`web-analysis-${result.siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
  }
}

