import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
import { CVData, CoverLetterData, MobilePDFGenerator } from '@/app/types/cv';

/**
 * Mobile PDF Generation Service
 * Uses expo-print to generate PDFs from CV and Cover Letter data
 * Supports 3 CV templates and 3 cover letter templates
 */

export class PDFGeneratorService implements MobilePDFGenerator {
  
  /**
   * Generate CV PDF with selected template
   */
  async generateCV(cvData: CVData, template: string): Promise<string> {
    try {
      const htmlContent = this.generateCVHTML(cvData, template);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('Error generating CV PDF:', error);
      throw new Error('Failed to generate CV PDF');
    }
  }

  /**
   * Generate Cover Letter PDF with selected template
   */
  async generateCoverLetter(coverLetterData: CoverLetterData, template: string): Promise<string> {
    try {
      const htmlContent = this.generateCoverLetterHTML(coverLetterData, template);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('Error generating Cover Letter PDF:', error);
      throw new Error('Failed to generate Cover Letter PDF');
    }
  }

  /**
   * Share PDF file using native sharing
   */
  async sharePDF(filePath: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share CV',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw new Error('Failed to share PDF');
    }
  }

  /**
   * Save PDF to device storage
   */
  async savePDF(filePath: string, fileName: string): Promise<string> {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Media library permission required to save PDF');
      }

      // Create asset and save to media library
      const asset = await MediaLibrary.createAssetAsync(filePath);
      const album = await MediaLibrary.getAlbumAsync('Documents');
      
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Documents', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return asset.uri;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF to device');
    }
  }

  /**
   * Generate HTML content for CV based on template
   */
  private generateCVHTML(cvData: CVData, template: string): string {
    const baseStyles = this.getBaseStyles();
    const templateStyles = this.getTemplateStyles(template);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CV - ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}</title>
          <style>
            ${baseStyles}
            ${templateStyles}
          </style>
        </head>
        <body>
          <div class="cv-container">
            ${this.generateCVContent(cvData, template)}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for cover letter based on template
   */
  private generateCoverLetterHTML(coverLetterData: CoverLetterData, template: string): string {
    const baseStyles = this.getBaseStyles();
    const templateStyles = this.getCoverLetterTemplateStyles(template);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cover Letter</title>
          <style>
            ${baseStyles}
            ${templateStyles}
          </style>
        </head>
        <body>
          <div class="cover-letter-container">
            ${this.generateCoverLetterContent(coverLetterData, template)}
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate CV content based on template
   */
  private generateCVContent(cvData: CVData, template: string): string {
    const personalInfo = cvData.personalInfo;
    
    switch (template) {
      case 'modern':
        return `
          <div class="modern-template">
            <header class="header">
              <div class="profile-section">
                ${personalInfo.profileImage ? `<img src="${personalInfo.profileImage}" alt="Profile" class="profile-image">` : ''}
                <div class="profile-info">
                  <h1 class="name">${personalInfo.firstName} ${personalInfo.lastName}</h1>
                  ${cvData.jobTitle ? `<h2 class="job-title">${cvData.jobTitle}</h2>` : ''}
                  <div class="contact-info">
                    <p><strong>Email:</strong> ${personalInfo.email}</p>
                    <p><strong>Phone:</strong> ${personalInfo.phone}</p>
                    <p><strong>Location:</strong> ${personalInfo.municipality}, ${personalInfo.department}</p>
                  </div>
                </div>
              </div>
            </header>
            
            <main class="content">
              ${cvData.professionalSummary ? `
                <section class="section">
                  <h3 class="section-title">Professional Summary</h3>
                  <p class="summary">${cvData.professionalSummary}</p>
                </section>
              ` : ''}
              
              ${this.generateEducationSection(cvData.education)}
              ${this.generateSkillsSection(cvData.skills)}
              ${this.generateWorkExperienceSection(cvData.workExperience)}
              ${this.generateProjectsSection(cvData.projects)}
              ${this.generateLanguagesSection(cvData.languages)}
            </main>
          </div>
        `;
        
      case 'creative':
        return `
          <div class="creative-template">
            <div class="sidebar">
              ${personalInfo.profileImage ? `<img src="${personalInfo.profileImage}" alt="Profile" class="profile-image">` : ''}
              <h1 class="name">${personalInfo.firstName} ${personalInfo.lastName}</h1>
              ${cvData.jobTitle ? `<h2 class="job-title">${cvData.jobTitle}</h2>` : ''}
              
              <div class="contact-section">
                <h3>Contact</h3>
                <p>${personalInfo.email}</p>
                <p>${personalInfo.phone}</p>
                <p>${personalInfo.municipality}, ${personalInfo.department}</p>
              </div>
              
              ${this.generateSkillsSection(cvData.skills, true)}
              ${this.generateLanguagesSection(cvData.languages, true)}
            </div>
            
            <div class="main-content">
              ${cvData.professionalSummary ? `
                <section class="section">
                  <h3 class="section-title">About Me</h3>
                  <p>${cvData.professionalSummary}</p>
                </section>
              ` : ''}
              
              ${this.generateEducationSection(cvData.education)}
              ${this.generateWorkExperienceSection(cvData.workExperience)}
              ${this.generateProjectsSection(cvData.projects)}
            </div>
          </div>
        `;
        
      case 'minimalist':
      default:
        return `
          <div class="minimalist-template">
            <header class="header">
              <h1 class="name">${personalInfo.firstName} ${personalInfo.lastName}</h1>
              ${cvData.jobTitle ? `<h2 class="job-title">${cvData.jobTitle}</h2>` : ''}
              <div class="contact-info">
                <span>${personalInfo.email}</span> • 
                <span>${personalInfo.phone}</span> • 
                <span>${personalInfo.municipality}, ${personalInfo.department}</span>
              </div>
            </header>
            
            ${cvData.professionalSummary ? `
              <section class="section">
                <h3 class="section-title">Summary</h3>
                <p>${cvData.professionalSummary}</p>
              </section>
            ` : ''}
            
            ${this.generateEducationSection(cvData.education)}
            ${this.generateWorkExperienceSection(cvData.workExperience)}
            ${this.generateSkillsSection(cvData.skills)}
            ${this.generateProjectsSection(cvData.projects)}
            ${this.generateLanguagesSection(cvData.languages)}
          </div>
        `;
    }
  }

  /**
   * Generate cover letter content based on template
   */
  private generateCoverLetterContent(coverLetterData: CoverLetterData, template: string): string {
    const recipient = coverLetterData.recipient;
    
    return `
      <div class="cover-letter">
        <header class="header">
          <div class="date">${new Date().toLocaleDateString()}</div>
          
          <div class="recipient">
            <p><strong>${recipient.department}</strong></p>
            <p>${recipient.companyName}</p>
            <p>${recipient.address}</p>
            <p>${recipient.city}, ${recipient.country}</p>
          </div>
        </header>
        
        <main class="content">
          <h1 class="subject">${coverLetterData.subject}</h1>
          
          <div class="letter-content">
            ${coverLetterData.content.split('\n').map(paragraph => 
              paragraph.trim() ? `<p>${paragraph}</p>` : ''
            ).join('')}
          </div>
        </main>
      </div>
    `;
  }

  /**
   * Generate education section HTML
   */
  private generateEducationSection(education: any): string {
    if (!education) return '';
    
    return `
      <section class="section">
        <h3 class="section-title">Education</h3>
        <div class="education-item">
          <h4>${education.currentDegree || education.level}</h4>
          <p class="institution">${education.universityName || education.currentInstitution}</p>
          ${education.graduationYear ? `<p class="year">${education.graduationYear}</p>` : ''}
          ${education.gpa ? `<p class="gpa">GPA: ${education.gpa}</p>` : ''}
        </div>
        
        ${education.educationHistory?.map((item: any) => `
          <div class="education-item">
            <h4>${item.degree}</h4>
            <p class="institution">${item.institution}</p>
            <p class="year">${item.startDate} - ${item.endDate || 'Present'}</p>
            ${item.gpa ? `<p class="gpa">GPA: ${item.gpa}</p>` : ''}
          </div>
        `).join('') || ''}
      </section>
    `;
  }

  /**
   * Generate skills section HTML
   */
  private generateSkillsSection(skills: any[], sidebar: boolean = false): string {
    if (!skills || skills.length === 0) return '';
    
    return `
      <section class="section ${sidebar ? 'sidebar-section' : ''}">
        <h3 class="section-title">Skills</h3>
        <div class="skills-grid">
          ${skills.map(skill => `<span class="skill-item">${skill.name}</span>`).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Generate work experience section HTML
   */
  private generateWorkExperienceSection(experience: any[]): string {
    if (!experience || experience.length === 0) return '';
    
    return `
      <section class="section">
        <h3 class="section-title">Work Experience</h3>
        ${experience.map(job => `
          <div class="experience-item">
            <h4>${job.jobTitle}</h4>
            <p class="company">${job.company}</p>
            <p class="period">${job.startDate} - ${job.endDate}</p>
            <p class="description">${job.description}</p>
          </div>
        `).join('')}
      </section>
    `;
  }

  /**
   * Generate projects section HTML
   */
  private generateProjectsSection(projects: any[]): string {
    if (!projects || projects.length === 0) return '';
    
    return `
      <section class="section">
        <h3 class="section-title">Projects</h3>
        ${projects.map(project => `
          <div class="project-item">
            <h4>${project.title}</h4>
            ${project.location ? `<p class="location">${project.location}</p>` : ''}
            <p class="period">${project.startDate} - ${project.endDate}</p>
            <p class="description">${project.description}</p>
          </div>
        `).join('')}
      </section>
    `;
  }

  /**
   * Generate languages section HTML
   */
  private generateLanguagesSection(languages: any[], sidebar: boolean = false): string {
    if (!languages || languages.length === 0) return '';
    
    return `
      <section class="section ${sidebar ? 'sidebar-section' : ''}">
        <h3 class="section-title">Languages</h3>
        <div class="languages-list">
          ${languages.map(lang => `
            <div class="language-item">
              <span class="language-name">${lang.name}</span>
              <span class="language-level">${lang.proficiency}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  /**
   * Get base CSS styles for all templates
   */
  private getBaseStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
      
      .cv-container, .cover-letter-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 20mm;
        background: white;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
      }
      
      .name {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .job-title {
        font-size: 18px;
        color: #7f8c8d;
        margin-bottom: 15px;
      }
      
      .contact-info {
        margin-bottom: 20px;
      }
      
      .contact-info p {
        margin-bottom: 5px;
      }
      
      .profile-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 20px;
      }
      
      p {
        margin-bottom: 10px;
      }
      
      h4 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .institution, .company {
        font-weight: 600;
        color: #2980b9;
      }
      
      .year, .period {
        font-style: italic;
        color: #7f8c8d;
        margin-bottom: 8px;
      }
      
      .description {
        text-align: justify;
      }
    `;
  }

  /**
   * Get template-specific CSS styles for CV
   */
  private getTemplateStyles(template: string): string {
    switch (template) {
      case 'modern':
        return `
          .modern-template .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
          }
          
          .modern-template .profile-section {
            display: flex;
            align-items: center;
          }
          
          .modern-template .profile-info {
            flex: 1;
          }
          
          .modern-template .section-title {
            color: #667eea;
            border-bottom-color: #667eea;
          }
          
          .modern-template .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .modern-template .skill-item {
            background: #ecf0f1;
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 12px;
          }
        `;
        
      case 'creative':
        return `
          .creative-template {
            display: flex;
            gap: 30px;
          }
          
          .creative-template .sidebar {
            width: 35%;
            background: linear-gradient(135deg, #8e44ad 0%, #3498db 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px;
          }
          
          .creative-template .main-content {
            flex: 1;
          }
          
          .creative-template .sidebar .profile-image {
            width: 120px;
            height: 120px;
            border: 4px solid white;
            margin: 0 auto 20px;
            display: block;
          }
          
          .creative-template .sidebar .section-title {
            color: white;
            border-bottom-color: white;
          }
          
          .creative-template .main-content .section-title {
            color: #8e44ad;
            border-bottom-color: #8e44ad;
          }
          
          .creative-template .skills-grid {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .creative-template .skill-item {
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 12px;
          }
        `;
        
      case 'minimalist':
      default:
        return `
          .minimalist-template .header {
            text-align: center;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .minimalist-template .contact-info {
            font-size: 12px;
            color: #7f8c8d;
          }
          
          .minimalist-template .section-title {
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
          }
          
          .minimalist-template .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .minimalist-template .skill-item {
            font-size: 14px;
          }
          
          .minimalist-template .education-item,
          .minimalist-template .experience-item,
          .minimalist-template .project-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #ecf0f1;
          }
        `;
    }
  }

  /**
   * Get template-specific CSS styles for cover letter
   */
  private getCoverLetterTemplateStyles(template: string): string {
    return `
      .cover-letter .header {
        margin-bottom: 40px;
      }
      
      .cover-letter .date {
        text-align: right;
        margin-bottom: 30px;
        font-style: italic;
      }
      
      .cover-letter .recipient {
        margin-bottom: 30px;
      }
      
      .cover-letter .subject {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 20px;
        color: #2c3e50;
      }
      
      .cover-letter .letter-content {
        text-align: justify;
        line-height: 1.8;
      }
      
      .cover-letter .letter-content p {
        margin-bottom: 15px;
      }
    `;
  }
}

// Export singleton instance
export const pdfGenerator = new PDFGeneratorService();