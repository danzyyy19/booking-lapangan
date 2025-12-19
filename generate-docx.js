const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\danic\\.gemini\\antigravity\\brain\\2f794696-5646-47f6-8dcc-14b290fc782f';
const IMAGES = {
    admin: 'admin_dashboard_1766078190293.png',
    staff: 'staff_dashboard_1766077731284.png',
    customer: 'customer_dashboard_1766077837295.png'
};

function getImageParams(filename) {
    const fullPath = path.join(ARTIFACT_DIR, filename);
    console.log(`Checking image: ${fullPath}`);

    if (fs.existsSync(fullPath)) {
        try {
            const buffer = fs.readFileSync(fullPath);
            return new ImageRun({
                data: buffer,
                transformation: { width: 500, height: 280 }, // Slightly smaller to ensure fit
                type: 'png'
            });
        } catch (e) {
            console.error(`Error reading image ${filename}:`, e);
            return new TextRun({ text: `[Error loading image: ${filename}]`, color: "red", italics: true });
        }
    } else {
        console.warn(`Image not found: ${fullPath}`);
        return new TextRun({ text: `[Image not found: ${filename}]`, color: "red", italics: true });
    }
}

async function createDocx() {
    console.log('Starting documentation generation...');

    // Validate images before document creation
    const adminImageRun = getImageParams(IMAGES.admin);
    const staffImageRun = getImageParams(IMAGES.staff);
    const customerImageRun = getImageParams(IMAGES.customer);

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                new Paragraph({
                    children: [new TextRun({ text: "DOKUMENTASI SISTEM DANZYY FIELD", bold: true, size: 32 })],
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun({ text: "Laporan Verifikasi & Implementasi", bold: true, size: 24 })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                // Metadata
                new Paragraph({ children: [new TextRun({ text: "URL Aplikasi: https://booking-lapangan.vercel.app", user: true })] }),
                new Paragraph({ children: [new TextRun({ text: `Tanggal Generate: ${new Date().toLocaleDateString('id-ID')}` })] }),
                new Paragraph({ text: "", spacing: { after: 300 } }),

                // 1. Deskripsi
                new Paragraph({
                    children: [new TextRun({ text: "1. DESKRIPSI SISTEM", bold: true, size: 28 })],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [new TextRun("Danzyy Field adalah aplikasi web booking lapangan olahraga. Sistem ini mempermudah pelanggan dalam mencari dan membooking lapangan, serta membantu admin/staf dalam mengelola jadwal dan pembayaran.")]
                }),
                new Paragraph({ text: "" }),

                // 2. Database
                new Paragraph({
                    children: [new TextRun({ text: "2. STRUKTUR DATABASE", bold: true, size: 28 })],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 }
                }),
                new Paragraph({ children: [new TextRun({ text: "A. Tabel Users", bold: true })] }),
                new Paragraph({ children: [new TextRun("Menyimpan identitas pengguna dengan role: ADMIN, STAFF, CUSTOMER.")] }),
                new Paragraph({ children: [new TextRun({ text: "B. Tabel Fields", bold: true })] }),
                new Paragraph({ children: [new TextRun("Data master lapangan (Futsal, Badminton, Basket) beserta harga dan fasilitas.")] }),
                new Paragraph({ children: [new TextRun({ text: "C. Tabel Bookings", bold: true })] }),
                new Paragraph({ children: [new TextRun("Mencatat jadwal sewa lapangan, durasi, dan total biaya. Relasi ke User dan Field.")] }),
                new Paragraph({ children: [new TextRun({ text: "D. Tabel Payments", bold: true })] }),
                new Paragraph({ children: [new TextRun("Menyimpan bukti transfer dan status verifikasi pembayaran.")] }),
                new Paragraph({ text: "" }),

                // 3. Screenshots
                new Paragraph({
                    children: [new TextRun({ text: "3. BUKTI VERIFIKASI (SCREENSHOTS)", bold: true, size: 28 })],
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 }
                }),

                // Admin
                new Paragraph({
                    children: [new TextRun({ text: "A. Admin Dashboard", bold: true, size: 24 })],
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ children: [new TextRun("Halaman utama Admin untuk memantau statistik.")] }),
                new Paragraph({
                    children: [adminImageRun],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 }
                }),

                // Staff
                new Paragraph({
                    children: [new TextRun({ text: "B. Staff Dashboard", bold: true, size: 24 })],
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ children: [new TextRun("Halaman Staff untuk verifikasi booking.")] }),
                new Paragraph({
                    children: [staffImageRun],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 }
                }),

                // Customer
                new Paragraph({
                    children: [new TextRun({ text: "C. Customer Dashboard", bold: true, size: 24 })],
                    heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({ children: [new TextRun("Halaman Customer untuk booking dan riwayat.")] }),
                new Paragraph({
                    children: [customerImageRun],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100, after: 300 }
                }),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = path.join(__dirname, 'docs', 'Dokumentasi-Danzyy-Field-REV1.docx');

    if (!fs.existsSync(path.join(__dirname, 'docs'))) {
        fs.mkdirSync(path.join(__dirname, 'docs'));
    }

    fs.writeFileSync(outputPath, buffer);
    console.log('✅ Documentation created successfully!');
    console.log(`📄 File Table: ${outputPath}`);
}

createDocx().catch(console.error);
