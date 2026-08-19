# CJ PDF to Word Converter — Professional Edition

A professional desktop application that converts PDF documents into editable
Microsoft Word (`.docx`) files. Built by **Juil Gitom** with Electron.

## Features
- 🔒 **100% local processing** — your files never leave your device
- ⚡ **Batch conversion** — convert up to 10 PDFs in one go
- 🔍 **Scanned-page OCR** — recognises text on scanned/image PDFs
  (English, Bahasa Malaysia, 简体中文)
- 📝 **Editable DOCX** — clean Word documents via the `docx` library
- 📄 **Page selection** — convert all pages or ranges like `1-3, 5`
- 🗂️ **Recent history** — last 20 conversions saved on your device
- 💻 **Native save dialog** — pick exactly where your DOCX is saved

## Quick start
```bash
npm install
npm start        # run in development
npm run dist:win # build the Windows NSIS installer
```

## How it works
The app runs the conversion entirely in the renderer using
[PDF.js](https://mozilla.github.io/pdf.js/) (text extraction),
[Tesseract.js](https://tesseract.projectnaptha.com/) (OCR) and
[docx](https://docx.js.org/) (Word generation). The first OCR conversion
downloads recognition data for the selected language (one-time).
