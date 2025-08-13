import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 📄 Professional PDF Generator for Medical Reports
class PDFGenerator {
  constructor() {
    this.doc = null;
    this.currentY = 20;
    this.pageHeight = 280;
    this.margin = 20;
    this.lineHeight = 6;
  }

  // Clean text to prevent encoding issues
  cleanText(text) {
    if (!text) return '';

    try {
      // Convert to string first
      let originalText = String(text);

      // Log problematic text for debugging
      if (/[^\x20-\x7E]/.test(originalText)) {
        console.log('Cleaning problematic text:', originalText, 'Char codes:', [...originalText].map(c => c.charCodeAt(0)));
      }

      // Handle encoding issues step by step
      let cleanedText = originalText
        // Handle common problematic characters first
        .replace(/Ø/g, 'O')
        .replace(/Ü/g, 'U')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ä/g, 'a')
        .replace(/ß/g, 'ss')
        .replace(/é/g, 'e')
        .replace(/è/g, 'e')
        .replace(/ê/g, 'e')
        .replace(/ë/g, 'e')
        .replace(/à/g, 'a')
        .replace(/á/g, 'a')
        .replace(/â/g, 'a')
        .replace(/ã/g, 'a')
        .replace(/ç/g, 'c')
        .replace(/ñ/g, 'n')
        // Handle Unicode characters
        .replace(/\u00A0/g, ' ') // Non-breaking space
        .replace(/\u2013/g, '-') // En-dash
        .replace(/\u2014/g, '--') // Em-dash
        .replace(/\u2018/g, "'") // Left single quote
        .replace(/\u2019/g, "'") // Right single quote
        .replace(/\u201C/g, '"') // Left double quote
        .replace(/\u201D/g, '"') // Right double quote
        .replace(/\u2026/g, '...') // Ellipsis
        .replace(/\u2022/g, '*') // Bullet point
        // Remove any remaining non-printable ASCII characters
        .replace(/[^\x20-\x7E]/g, '')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        .trim();

      return cleanedText;
    } catch (error) {
      console.warn('Text cleaning error:', error, 'Original text:', text);
      // Fallback: replace all non-ASCII with safe characters
      return String(text).replace(/[^\x20-\x7E]/g, '?').trim();
    }
  }

  // Initialize new PDF document
  initDocument() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      compress: true
    });

    // Set default font to helvetica which has better character support
    this.doc.setFont('helvetica');
    this.currentY = 20;
    return this.doc;
  }

  // Check if we need a new page
  checkPageBreak(requiredHeight = 10) {
    if (this.currentY + requiredHeight > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
      return true;
    }
    return false;
  }

  // Add header with logo and title
  addHeader(title, subtitle) {
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(88, 28, 135); // Purple color
    this.doc.text(this.cleanText('SynthesisAI'), this.margin, this.currentY);

    this.currentY += 8;
    this.doc.setFontSize(16);
    this.doc.setTextColor(107, 114, 128); // Gray color
    this.doc.text(this.cleanText('Smart Skin Analysis Platform'), this.margin, this.currentY);

    this.currentY += 15;
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.cleanText(title), this.margin, this.currentY);

    if (subtitle) {
      this.currentY += 8;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(this.cleanText(subtitle), this.margin, this.currentY);
    }

    this.currentY += 15;

    // Add horizontal line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 10;
  }

  // Add section header
  addSectionHeader(title, icon = '') {
    this.checkPageBreak(15);

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(this.cleanText(`${icon} ${title}`), this.margin, this.currentY);

    this.currentY += 8;

    // Add underline
    this.doc.setDrawColor(229, 231, 235);
    this.doc.line(this.margin, this.currentY, 190, this.currentY);
    this.currentY += 8;
  }

  // Add key-value pair
  addKeyValue(key, value, indent = 0) {
    this.checkPageBreak(8);

    const x = this.margin + indent;

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(75, 85, 99);
    this.doc.text(this.cleanText(`${key}:`), x, this.currentY);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    const valueText = this.cleanText(value || 'Not available');
    this.doc.text(valueText, x + 40, this.currentY);

    this.currentY += this.lineHeight;
  }

  // Add text paragraph
  addParagraph(text, fontSize = 10, color = [0, 0, 0]) {
    this.checkPageBreak(10);

    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(color[0], color[1], color[2]);

    const cleanedText = this.cleanText(text);
    const lines = this.doc.splitTextToSize(cleanedText, 170);
    lines.forEach(line => {
      this.checkPageBreak(6);
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });

    this.currentY += 3;
  }

  // Add list items
  addList(items, bullet = '•') {
    items.forEach(item => {
      this.checkPageBreak(8);

      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);

      const cleanedItem = this.cleanText(item);
      const text = `${bullet} ${cleanedItem}`;
      const lines = this.doc.splitTextToSize(text, 165);
      lines.forEach(line => {
        this.checkPageBreak(6);
        this.doc.text(line, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      });
    });

    this.currentY += 3;
  }

  // Add table
  addTable(headers, rows) {
    this.checkPageBreak(20);
    
    const startY = this.currentY;
    const colWidth = 160 / headers.length;
    
    // Headers
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    headers.forEach((header, index) => {
      this.doc.text(this.cleanText(header), this.margin + (index * colWidth), this.currentY);
    });

    this.currentY += 8;

    // Header line
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(this.margin, this.currentY, this.margin + 160, this.currentY);
    this.currentY += 5;

    // Rows
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    rows.forEach(row => {
      this.checkPageBreak(8);

      row.forEach((cell, index) => {
        const cleanedCell = this.cleanText(cell);
        const cellText = this.doc.splitTextToSize(cleanedCell, colWidth - 5);
        this.doc.text(cellText[0] || '', this.margin + (index * colWidth), this.currentY);
      });

      this.currentY += 6;
    });
    
    this.currentY += 5;
  }

  // Add footer with disclaimer
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Page number
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(107, 114, 128);
      this.doc.text(this.cleanText(`Page ${i} of ${pageCount}`), 170, 290);

      // Footer text
      this.doc.text(this.cleanText('Generated by SynthesisAI - Smart Skin Analysis Platform'), this.margin, 290);

      // Disclaimer on last page
      if (i === pageCount) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(220, 38, 127); // Pink color for warning
        const disclaimer = 'MEDICAL DISCLAIMER: This report is generated based on AI analysis and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.';
        const disclaimerLines = this.doc.splitTextToSize(this.cleanText(disclaimer), 170);

        let disclaimerY = 270;
        disclaimerLines.forEach(line => {
          this.doc.text(line, this.margin, disclaimerY);
          disclaimerY += 4;
        });
      }
    }
  }

  // Generate complete user report PDF
  generateUserReport(reportData) {
    this.initDocument();
    
    // Header
    this.addHeader(
      'Comprehensive Medical Report',
      `Generated on ${reportData.userInfo.reportDate}`
    );
    
    // Patient Overview
    this.addSectionHeader('👤 Patient Overview');
    this.addKeyValue('Report Date', reportData.userInfo.reportDate);
    this.addKeyValue('First Visit', reportData.userInfo.firstVisit);
    this.addKeyValue('Last Visit', reportData.userInfo.lastVisit);
    this.addKeyValue('Total Visits', reportData.userInfo.totalVisits.toString());
    this.addKeyValue('Total Interactions', reportData.userInfo.totalInteractions.toString());
    this.currentY += 5;
    
    // Medical Summary
    this.addSectionHeader('🏥 Medical Summary');
    
    // Detected Conditions
    if (reportData.medicalOverview.detectedConditions.length > 0) {
      this.addParagraph('Detected Conditions:', 11, [0, 0, 0]);
      const conditions = reportData.medicalOverview.detectedConditions.map(c => 
        c.replace('_', ' ').toUpperCase()
      );
      this.addList(conditions);
    } else {
      this.addParagraph('No conditions detected yet.', 10, [107, 114, 128]);
    }
    
    // Reported Symptoms
    if (reportData.medicalOverview.reportedSymptoms.length > 0) {
      this.addParagraph('Reported Symptoms:', 11, [0, 0, 0]);
      this.addList(reportData.medicalOverview.reportedSymptoms);
    }
    
    this.currentY += 5;
    
    // Health Metrics
    this.addSectionHeader('📊 Health Metrics');
    this.addKeyValue('Conditions Identified', reportData.healthMetrics.conditionsCount.toString());
    this.addKeyValue('Symptoms Reported', reportData.healthMetrics.symptomsCount.toString());
    this.addKeyValue('Medications Discussed', reportData.healthMetrics.medicationsCount.toString());
    if (reportData.healthMetrics.consultationFrequency > 0) {
      this.addKeyValue('Avg. Days Between Visits', reportData.healthMetrics.consultationFrequency.toString());
    }
    this.currentY += 5;
    
    // Recent Consultation History
    this.addSectionHeader('📋 Recent Consultation History');
    
    if (reportData.visitHistory.length > 0) {
      const recentVisits = reportData.visitHistory.slice(0, 5); // Last 5 visits
      
      recentVisits.forEach((visit, index) => {
        this.checkPageBreak(25);
        
        this.addParagraph(`Consultation ${index + 1} - ${visit.date} at ${visit.time}`, 10, [75, 85, 99]);
        this.addParagraph(`Query: ${visit.summary}`, 9, [0, 0, 0]);
        this.addParagraph(`Response: ${visit.aiResponse}`, 9, [0, 0, 0]);
        
        if (visit.conditions.length > 0) {
          this.addParagraph(`Conditions: ${visit.conditions.join(', ')}`, 9, [220, 38, 127]);
        }
        
        this.currentY += 3;
      });
    } else {
      this.addParagraph('No consultation history available.', 10, [107, 114, 128]);
    }
    
    // Add footer
    this.addFooter();
    
    return this.doc;
  }

  // Generate medication report PDF
  generateMedicationReport(reportData) {
    this.initDocument();

    // Header
    this.addHeader(
      'Medication Report',
      `Generated on ${new Date().toLocaleDateString()}`
    );

    // Patient Information
    this.addSectionHeader('👤 Patient Information');
    this.addKeyValue('Patient ID', reportData.patientInfo?.patientId || 'N/A');
    this.addKeyValue('Report Date', new Date().toLocaleDateString());
    this.addKeyValue('Age', reportData.patientInfo?.age || 'N/A');
    this.addKeyValue('Gender', reportData.patientInfo?.gender || 'N/A');
    this.addKeyValue('Medical History', reportData.patientInfo?.medicalHistory || 'None reported');
    this.currentY += 5;

    // Detected Conditions
    if (reportData.detectedConditions && reportData.detectedConditions.length > 0) {
      this.addSectionHeader('🔍 Detected Conditions');
      this.addList(reportData.detectedConditions.map(condition =>
        condition.replace('_', ' ').toUpperCase()
      ));
    }

    // Medication Recommendations
    if (reportData.medications && reportData.medications.length > 0) {
      this.addSectionHeader('💊 Recommended Medications');

      reportData.medications.forEach((med, index) => {
        this.checkPageBreak(20);

        this.addParagraph(`${index + 1}. ${med.name}`, 12, [0, 0, 0]);
        this.addKeyValue('Rating', `${med.rating}/10`, 10);
        this.addKeyValue('Mechanism', med.mechanism || 'Not specified', 10);
        this.addKeyValue('Uses', med.uses || 'Not specified', 10);

        if (med.sideEffects) {
          this.addParagraph('Side Effects:', 10, [220, 38, 127]);
          this.addParagraph(med.sideEffects, 9, [107, 114, 128]);
        }

        this.currentY += 5;
      });
    }

    // Medical Disclaimer
    this.addSectionHeader('⚠️ Important Medical Information');
    this.addParagraph(
      'This medication report is generated based on AI analysis of detected skin conditions. ' +
      'It is intended for informational purposes only and should not replace professional medical advice. ' +
      'Always consult with a qualified healthcare provider or dermatologist before starting any medication. ' +
      'Individual responses to medications may vary, and proper medical supervision is essential.',
      10,
      [220, 38, 127]
    );

    // Add footer
    this.addFooter();

    return this.doc;
  }

  // Test PDF generation with simple content
  generateTestPDF() {
    this.initDocument();

    this.addHeader('Test PDF', 'Testing character encoding');
    this.addSectionHeader('Test Section', '🧪');
    this.addParagraph('This is a test paragraph with normal text.');
    this.addParagraph('Testing special characters: áéíóú àèìòù âêîôû ãñõ çüß');
    this.addKeyValue('Test Key', 'Test Value with special chars: éñü');
    this.addList(['Item 1', 'Item 2 with special chars: áéí', 'Item 3']);

    this.addFooter();
    return this.doc;
  }

  // Save PDF
  savePDF(filename = 'medical-report.pdf') {
    if (this.doc) {
      this.doc.save(filename);
    }
  }
}

export default PDFGenerator;
