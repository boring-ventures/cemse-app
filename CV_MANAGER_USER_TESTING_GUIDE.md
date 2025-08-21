# CV Manager Module - User Testing Guide

## Overview
This guide will help you test all features of the CV Manager module in the CEMSE mobile app. The CV Manager allows users to create, edit, preview, and generate professional CVs with multiple templates.

## Pre-Testing Setup

### System Requirements
- Device: iOS or Android smartphone/tablet
- App: CEMSE mobile application installed
- Internet: Stable internet connection (some features work offline)
- Account: Valid user account with login credentials

### Before You Begin
1. Close any other apps running on your device
2. Ensure you have at least 100MB of free storage space
3. Have sample data ready for testing (names, addresses, etc.)
4. Take screenshots of any issues you encounter

---

## Part 1: Initial Setup & Access

### Step 1: App Login and Navigation
1. **Open the CEMSE app** on your device
2. **Login** with your test credentials
3. **Navigate to CV Manager**:
   - Look for "CV Manager" in the main menu/navigation
   - Tap on "CV Manager"

**Expected Result**: You should see the CV Manager main screen with:
- Header: "CV Manager" title and subtitle
- Three tabs at the bottom: "Mi CV", "Plantillas", "Carta"
- Network status indicator at the top
- The "Mi CV" tab should be active by default

**What to Test**: 
- App loads without crashes
- Navigation is smooth
- All UI elements are visible and properly aligned

---

## Part 2: Feature Testing - Mi CV Tab (Edit Data)

### Step 2: Personal Information Section (Always Visible)

#### 2.1 Basic Personal Info Testing
1. **Scroll to Personal Information section** (should be at the top)
2. **Test each field** by tapping and entering data:
   - **First Name**: Enter "Juan"
   - **Last Name**: Enter "Pérez"
   - **Email**: Enter "juan.perez@email.com"
   - **Phone**: Enter "+591 70123456"
   - **Address**: Enter "Av. Siempre Viva 123"

**Expected Result**: 
- All fields accept text input
- Email field shows email keyboard
- Phone field shows numeric keyboard
- Text saves automatically after you stop typing

#### 2.2 Address Details Testing
3. **Continue with address fields**:
   - **Municipality**: Enter "La Paz"
   - **Department**: Enter "La Paz"
   - **Country**: Should show "Bolivia" (may be pre-filled)

**Expected Result**: 
- All address fields work properly
- Country field may be dropdown or pre-filled

#### 2.3 Profile Image Upload Testing
4. **Look for profile image upload section**
5. **Tap on image upload area** or camera icon
6. **Test image selection**:
   - Choose "Camera" option
   - Take a test photo
   - Confirm/accept the photo

**Expected Result**:
- Camera opens without issues
- Photo is captured and displayed as profile image
- Image appears in circular/rounded format

7. **Alternative: Test gallery upload**:
   - Tap image area again
   - Choose "Photo Library" or "Gallery"
   - Select an existing image
   - Confirm selection

**Expected Result**:
- Gallery opens showing available photos
- Selected image appears as profile image
- Image is properly cropped/resized

### Step 3: Professional Summary Section (Always Visible)

1. **Locate Professional Summary section**
2. **Tap in the text area**
3. **Enter sample text**:
   ```
   Estudiante de ingeniería con experiencia en desarrollo de software 
   y pasión por la tecnología. Busco oportunidades para aplicar mis 
   conocimientos en proyectos innovadores.
   ```

**Expected Result**:
- Text area expands as you type
- Text is saved automatically
- Multiline text is supported

---

## Part 3: Collapsible Sections Testing

### Step 4: Education Section

#### 4.1 Expand/Collapse Testing
1. **Find the Education section**
2. **Tap the header/arrow** to expand the section
3. **Tap again** to collapse it

**Expected Result**:
- Section expands smoothly showing all education fields
- Section collapses hiding content but keeping header visible
- Arrow icon rotates to indicate state

#### 4.2 Basic Education Info
1. **Expand Education section**
2. **Fill in basic education fields**:
   - **Education Level**: Select "Universidad"
   - **Current Institution**: Enter "Universidad Mayor de San Andrés"
   - **Graduation Year**: Enter "2025"
   - **Currently Studying**: Toggle switch ON

**Expected Result**:
- Dropdown/picker works for education level
- Text fields accept input
- Toggle switch changes state visually
- Data is saved automatically

#### 4.3 University Information
3. **Continue with university fields**:
   - **Current Degree**: Enter "Ingeniería de Sistemas"
   - **University Name**: Enter "UMSA"
   - **Start Date**: Select a date
   - **End Date**: Select future date or leave blank
   - **University Status**: Enter "Activo"
   - **GPA**: Enter "85"

**Expected Result**:
- Date pickers work properly
- Numeric input works for GPA
- All fields save data correctly

### Step 5: Skills Section

#### 5.1 Add New Skills
1. **Expand Skills section**
2. **Find the "Add Skill" input field**
3. **Enter a skill**: Type "JavaScript"
4. **Tap the "Add" button** or plus icon

**Expected Result**:
- Skill appears in the skills list
- Input field clears after adding
- Skill shows with default experience level "Skillful"

#### 5.2 Add Multiple Skills
5. **Repeat the process** to add more skills:
   - "Python"
   - "React Native"
   - "Node.js"

**Expected Result**:
- Multiple skills can be added
- Each skill appears in the list
- No duplicate skills allowed

#### 5.3 Remove Skills
6. **Look for delete/remove icons** next to skills
7. **Tap the delete icon** for one skill

**Expected Result**:
- Skill is removed from the list
- List updates immediately
- No errors occur

#### 5.4 Test Duplicate Prevention
8. **Try to add "JavaScript" again** (if not already removed)

**Expected Result**:
- Alert appears saying "This skill already exists"
- Duplicate skill is not added to the list

### Step 6: Languages Section

#### 6.1 Add Languages
1. **Expand Languages section**
2. **Tap "Add Language" button**
3. **Fill in language form**:
   - **Language**: Enter "English"
   - **Proficiency**: Select "Advanced"
4. **Save the language**

**Expected Result**:
- Language form appears (modal or inline)
- Proficiency dropdown has options (Beginner, Intermediate, Advanced, Native)
- Language is added to the list

#### 6.2 Edit Languages
5. **Tap on an existing language** to edit
6. **Change proficiency level**
7. **Save changes**

**Expected Result**:
- Edit form opens with current data
- Changes are saved properly
- List updates with new information

### Step 7: Social Links Section

#### 7.1 Add Social Links
1. **Expand Social Links section**
2. **Tap "Add Social Link" button**
3. **Fill in the form**:
   - **Platform**: Select "LinkedIn"
   - **URL**: Enter "https://linkedin.com/in/juanperez"
4. **Save the link**

**Expected Result**:
- Platform dropdown has options (LinkedIn, GitHub, Twitter, etc.)
- URL field validates proper format
- Link appears in the list with platform icon

#### 7.2 Test Multiple Platforms
5. **Add more social links**:
   - GitHub: "https://github.com/juanperez"
   - Twitter: "https://twitter.com/juanperez"

**Expected Result**:
- Multiple platforms can be added
- Each shows appropriate icon
- URLs are clickable for preview

### Step 8: Work Experience Section

#### 8.1 Add Work Experience
1. **Expand Work Experience section**
2. **Tap "Add Experience" button**
3. **Fill in the form**:
   - **Job Title**: Enter "Software Developer Intern"
   - **Company**: Enter "Tech Solutions SA"
   - **Start Date**: Select a past date
   - **End Date**: Select a recent date
   - **Description**: Enter "Developed mobile applications using React Native. Collaborated with team on various projects."

**Expected Result**:
- Date pickers work for start/end dates
- Description field supports multiline text
- Experience appears in chronological order

#### 8.2 Add Current Job
4. **Add another experience**:
   - Mark as "Current Position" (if option exists)
   - Leave end date empty or use toggle for "Current"

**Expected Result**:
- Current position is marked appropriately
- End date shows "Present" or similar

### Step 9: Projects Section

#### 9.1 Add Project
1. **Expand Projects section**
2. **Tap "Add Project" button**
3. **Fill in project details**:
   - **Title**: Enter "E-commerce Mobile App"
   - **Location**: Enter "University Project"
   - **Start Date**: Select date
   - **End Date**: Select date
   - **Description**: Enter "Developed a full-stack e-commerce mobile application with React Native and Node.js backend."

**Expected Result**:
- All fields accept appropriate input
- Project appears in the list
- Dates are validated (end date after start date)

### Step 10: Activities Section

#### 10.1 Add Activities
1. **Expand Activities section**
2. **Add extracurricular activities**:
   - **Title**: Enter "Student Council President"
   - **Organization**: Enter "Engineering Student Council"
   - **Start Date**: Select date
   - **End Date**: Select date
   - **Description**: Enter "Led student initiatives and organized academic events."

**Expected Result**:
- Activities section works similar to work experience
- Multiple activities can be added
- Organization field is optional

### Step 11: Interests Section

#### 11.1 Add Interests
1. **Expand Interests section**
2. **Find the "Add Interest" input**
3. **Add several interests**:
   - "Technology"
   - "Photography"
   - "Travel"
   - "Music"

**Expected Result**:
- Interests are added as tags/chips
- Multiple interests can be added quickly
- Interests can be removed individually

---

## Part 4: Template Selection and PDF Generation

### Step 12: Switch to Templates Tab

1. **Tap on the "Plantillas" tab** at the bottom
2. **Wait for the page to load**

**Expected Result**:
- Templates tab becomes active
- Page shows "CV Templates" header
- Three template options are displayed

### Step 13: Template Selection

#### 13.1 Browse Templates
1. **Review the three available templates**:
   - Modern Professional (blue accent)
   - Creative Portfolio (purple gradients)
   - Minimalist Clean (black and white)

**Expected Result**:
- Each template shows preview/description
- Templates are visually distinct
- One template is selected by default

#### 13.2 Select Different Templates
2. **Tap on each template** to select it
3. **Observe the preview changes**

**Expected Result**:
- Selected template is highlighted with border/checkmark
- Preview updates to show selected template
- Selection is immediate and smooth

### Step 14: Template Preview

#### 14.1 View Preview
1. **Scroll to the "Template Preview" section**
2. **Review the preview content**

**Expected Result**:
- Preview shows how your actual CV data will look
- Preview reflects the selected template style
- All your entered data is visible in preview

### Step 15: PDF Generation

#### 15.1 Generate PDF
1. **Scroll to Actions section**
2. **Tap "Generate PDF" button**
3. **Wait for generation to complete**

**Expected Result**:
- Button shows "Generating..." with loading icon
- Process completes within 10-30 seconds
- Success dialog appears with options

#### 15.2 PDF Actions Dialog
4. **When success dialog appears**, test each option:
   - **Tap "Share"** to test sharing functionality
   - **Tap "Save to Device"** to test local saving
   - **Tap "OK"** to dismiss dialog

**Expected Result**:
- Share opens system share sheet with PDF
- Save confirms successful save to device
- PDF is properly formatted with your data

#### 15.3 Direct Share
5. **Tap "Share CV" button** (secondary button)

**Expected Result**:
- Share functionality works without generating new PDF
- Previously generated PDF is shared if available

---

## Part 5: Cover Letter Tab Testing

### Step 16: Cover Letter Access

1. **Tap on "Carta" tab** at the bottom
2. **Wait for page to load**

**Expected Result**:
- Cover letter editor loads
- Interface shows text editor and template options
- Your CV data may be referenced for personalization

---

## Part 6: Advanced Features Testing

### Step 17: Offline Functionality

#### 17.1 Test Offline Editing
1. **Turn off WiFi and mobile data** on your device
2. **Try editing CV information**
3. **Make several changes** to different sections
4. **Turn internet back on**

**Expected Result**:
- App continues to work offline
- Changes are saved locally
- Data syncs when connection is restored
- Network status indicator shows offline/online state

### Step 18: Pull-to-Refresh

#### 18.1 Test Refresh
1. **Pull down on the main CV editing screen**
2. **Release to trigger refresh**

**Expected Result**:
- Refresh animation appears
- Data is reloaded from server
- Any conflicts between local/server data are handled

### Step 19: Data Persistence

#### 19.1 Test Data Saving
1. **Make changes to your CV**
2. **Close the app completely**
3. **Reopen the app**
4. **Navigate back to CV Manager**

**Expected Result**:
- All your changes are preserved
- Data loads properly on app restart
- No data loss occurs

---

## Part 7: Error Testing

### Step 20: Error Scenarios

#### 20.1 Invalid Data Testing
1. **Try entering invalid email** (without @ symbol)
2. **Enter very long text** in fields
3. **Try empty required fields**

**Expected Result**:
- Validation errors are shown clearly
- Invalid data is not saved
- User-friendly error messages appear

#### 20.2 Network Error Testing
1. **Disconnect internet during data saving**
2. **Try to generate PDF without internet**

**Expected Result**:
- Appropriate error messages appear
- App doesn't crash
- Retry options are provided

---

## Part 8: Performance Testing

### Step 21: Performance Checks

#### 21.1 Speed Testing
1. **Time how long it takes to**:
   - Load CV Manager initially
   - Switch between tabs
   - Generate a PDF
   - Add/edit items in lists

**Expected Result**:
- Initial load: Under 3 seconds
- Tab switching: Instant
- PDF generation: Under 30 seconds
- List operations: Under 1 second

#### 21.2 Memory Testing
2. **Use the app for extended periods** (15+ minutes)
3. **Add many items** to each section
4. **Generate PDFs multiple times**

**Expected Result**:
- App remains responsive
- No memory leaks or crashes
- Performance doesn't degrade over time

---

## Common Issues to Watch For

### UI/UX Issues
- ❌ Buttons that don't respond to taps
- ❌ Text input fields that don't accept text
- ❌ Overlapping or misaligned elements
- ❌ Text that's too small to read
- ❌ Missing icons or images

### Functional Issues
- ❌ Data not saving properly
- ❌ PDF generation failures
- ❌ Image upload not working
- ❌ App crashes or freezes
- ❌ Network connectivity problems

### Data Issues
- ❌ Information disappearing after app restart
- ❌ Incorrect data in PDF output
- ❌ Validation not working properly
- ❌ Duplicate entries being created

---

## Reporting Issues

### When You Find a Problem

1. **Take a screenshot** of the issue
2. **Note the exact steps** that caused the problem
3. **Record any error messages** that appeared
4. **Note your device details**:
   - Device model (iPhone 12, Samsung Galaxy S21, etc.)
   - Operating system version (iOS 15.2, Android 12, etc.)
   - App version

### Issue Report Template

```
ISSUE: [Brief description]

STEPS TO REPRODUCE:
1. [First step]
2. [Second step]
3. [Third step]

EXPECTED RESULT:
[What should have happened]

ACTUAL RESULT:
[What actually happened]

DEVICE INFO:
- Device: [Device model]
- OS: [Operating system and version]
- App Version: [App version]

SEVERITY:
[High/Medium/Low]

SCREENSHOT ATTACHED: [Yes/No]
```

---

## Success Criteria

### The CV Manager module passes testing if:

✅ **All basic functionality works**:
- Personal information can be entered and saved
- All collapsible sections expand/collapse properly
- Data persists between app sessions

✅ **Advanced features work**:
- Image upload functions correctly
- PDF generation succeeds
- Template selection works
- Sharing functionality operates

✅ **Performance is acceptable**:
- App responds quickly to user input
- No crashes or freezes occur
- Memory usage remains stable

✅ **Error handling is proper**:
- Validation works correctly
- Network errors are handled gracefully
- User receives helpful error messages

✅ **Offline functionality works**:
- App continues to function without internet
- Data syncs properly when connection returns

---

## Contact Information

If you encounter any issues during testing or need clarification on any steps, please contact:

**Development Team**: [Contact information]
**Test Coordinator**: [Contact information]

---

**Testing Completion**: When you finish testing, please provide a summary report indicating which features passed/failed and any recommendations for improvement.

Thank you for helping improve the CEMSE CV Manager module!