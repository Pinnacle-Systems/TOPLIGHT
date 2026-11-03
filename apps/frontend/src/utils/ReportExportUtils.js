import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as XLSXStyleModule from 'xlsx-js-style';
import * as XLSXFallback from 'xlsx';
const XLSX =
    XLSXStyleModule?.default?.write
        ? XLSXStyleModule.default
        : (XLSXStyleModule?.write
            ? XLSXStyleModule
            : (XLSXStyleModule?.default || XLSXStyleModule || XLSXFallback));
import * as RNHTMLtoPDF from 'react-native-html-to-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';

// ── HTML to PDF conversion wrapper ──────────────────────────────────────────
const convertHtmlToPdf = async (options) => {
    if (typeof RNHTMLtoPDF.generatePDF === 'function') {
        return await RNHTMLtoPDF.generatePDF(options);
    }
    if (RNHTMLtoPDF.default && typeof RNHTMLtoPDF.default.convert === 'function') {
        return await RNHTMLtoPDF.default.convert(options);
    }
    if (typeof RNHTMLtoPDF.convert === 'function') {
        return await RNHTMLtoPDF.convert(options);
    }
    throw new Error('PDF generator module not available on this device');
};

// ── Native Share wrapper ────────────────────────────────────────────────────
const shareFile = async (shareOptions) => {
    try {
        const result = await Share.open(shareOptions);
        return result;
    } catch (err) {
        if (
            err &&
            (err.message?.includes('User did not share') ||
                err.message?.includes('CANCELLED') ||
                err.message?.includes('dismissed') ||
                err.message?.includes('canceled'))
        ) {
            return { dismissed: true };
        }
        throw err;
    }
};

// ── Generate HTML template for PDF ──────────────────────────────────────────
export const generateReportHtml = ({ title, subtitle, columns, data }) => {
    const nowStr = moment().format('DD MMM YYYY, hh:mm A');

    let approvedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    (data || []).forEach((item) => {
        const s = String(item?.approvalStatus || item?.status || '').toLowerCase();
        if (s.includes('approv')) approvedCount++;
        else if (s.includes('reject')) rejectedCount++;
        else pendingCount++;
    });

    const headerThs = (columns || [])
        .map((c) => `<th>${c.label}</th>`)
        .join('');

    const bodyRows = (data || [])
        .map((item, index) => {
            const isEven = index % 2 === 0;
            const tds = columns
                .map((c) => {
                    let val = '';
                    if (c.key === '#') {
                        val = String(index + 1);
                    } else if (typeof c.getValue === 'function') {
                        val = c.getValue(item, index);
                    } else {
                        val = item?.[c.key] ?? '';
                    }

                    const isStatusCol = c.key === 'status' || c.key === 'approvalStatus';
                    if (isStatusCol) {
                        const s = String(val).toUpperCase();
                        let pillBg = '#FEF3C7';
                        let pillColor = '#B45309';
                        if (s.includes('APPROV')) {
                            pillBg = '#DCFCE7';
                            pillColor = '#15803D';
                        } else if (s.includes('REJECT')) {
                            pillBg = '#FEE2E2';
                            pillColor = '#B91C1C';
                        }
                        return `<td><span class="status-pill" style="background:${pillBg};color:${pillColor};">${val}</span></td>`;
                    }
                    return `<td>${val ?? ''}</td>`;
                })
                .join('');

            return `<tr class="${isEven ? 'row-even' : 'row-odd'}">${tds}</tr>`;
        })
        .join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 10mm;
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 8px;
            color: #0F172A;
            background: #FFFFFF;
            font-size: 11px;
        }
        .header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #0284C7;
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .brand-title {
            font-size: 20px;
            font-weight: 800;
            color: #0F172A;
            letter-spacing: 0.5px;
        }
        .brand-subtitle {
            font-size: 9px;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1px;
        }
        .report-title {
            font-size: 15px;
            font-weight: 700;
            color: #0284C7;
            text-align: right;
            text-transform: uppercase;
        }
        .report-meta {
            font-size: 9px;
            color: #64748B;
            text-align: right;
            margin-top: 2px;
        }
        .kpi-row {
            display: flex;
            gap: 8px;
            margin-bottom: 10px;
        }
        .kpi-card {
            flex: 1;
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #E2E8F0;
            background: #F8FAFC;
        }
        .kpi-label {
            font-size: 8px;
            text-transform: uppercase;
            color: #64748B;
            font-weight: 600;
        }
        .kpi-value {
            font-size: 14px;
            font-weight: 700;
            margin-top: 2px;
            color: #0F172A;
        }
        .kpi-approved .kpi-value { color: #16A34A; }
        .kpi-pending .kpi-value { color: #D97706; }
        .kpi-rejected .kpi-value { color: #DC2626; }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 9.5px;
        }
        th {
            background-color: #0F172A;
            color: #FFFFFF;
            font-weight: 600;
            text-align: left;
            padding: 6px 5px;
            border: 1px solid #334155;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        td {
            padding: 5px;
            border: 1px solid #E2E8F0;
            vertical-align: middle;
            word-break: break-word;
        }
        tr.row-even {
            background-color: #FFFFFF;
        }
        tr.row-odd {
            background-color: #F8FAFC;
        }
        .status-pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 8.5px;
            font-weight: 700;
            text-align: center;
        }
        .footer {
            margin-top: 12px;
            padding-top: 6px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            font-size: 8.5px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <div class="header-bar">
        <div>
            <div class="brand-title">TOP LIGHT</div>
            <div class="brand-subtitle">HR & Employee Management System</div>
        </div>
        <div>
            <div class="report-title">${title}</div>
            <div class="report-meta">Generated: ${nowStr} ${subtitle ? `&bull; ${subtitle}` : ''}</div>
        </div>
    </div>

    <div class="kpi-row">
        <div class="kpi-card">
            <div class="kpi-label">Total Records</div>
            <div class="kpi-value">${data.length}</div>
        </div>
        <div class="kpi-card kpi-approved">
            <div class="kpi-label">Approved</div>
            <div class="kpi-value">${approvedCount}</div>
        </div>
        <div class="kpi-card kpi-pending">
            <div class="kpi-label">Pending</div>
            <div class="kpi-value">${pendingCount}</div>
        </div>
        <div class="kpi-card kpi-rejected">
            <div class="kpi-label">Rejected</div>
            <div class="kpi-value">${rejectedCount}</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>${headerThs}</tr>
        </thead>
        <tbody>
            ${bodyRows}
        </tbody>
    </table>

    ${data.length === 1 ? `
    <div style="margin-top: 14px; padding: 12px 14px; border-radius: 8px; border: 1.5px solid #0284C7; background: #F8FAFC;">
        <div style="font-size: 12px; font-weight: 700; color: #0284C7; margin-bottom: 8px; text-transform: uppercase;">
            Request Summary & Overview
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${columns.filter(c => c.key !== '#').map(c => {
                let v = '';
                if (typeof c.getValue === 'function') v = c.getValue(data[0], 0);
                else v = data[0]?.[c.key] ?? '-';
                return `
                <div style="flex: 1 1 22%; min-width: 140px; padding: 6px 8px; background: #FFFFFF; border-radius: 6px; border: 1px solid #E2E8F0;">
                    <div style="font-size: 8px; text-transform: uppercase; color: #64748B; font-weight: 600;">${c.label}</div>
                    <div style="font-size: 10.5px; font-weight: 700; color: #0F172A; margin-top: 2px;">${v || '-'}</div>
                </div>`;
            }).join('')}
        </div>
    </div>
    ` : ''}

    <div class="footer">
        <div>Top Light HR Reports &bull; Confidential &bull; For Internal Use Only</div>
        <div>Total Rows: ${data.length}</div>
    </div>
</body>
</html>
    `;
};

// ── Generate Excel Base64 ───────────────────────────────────────────────────
// ── Excel Styling Definitions ───────────────────────────────────────────────
const EXCEL_BORDERS = {
    cell: {
        top: { style: 'thin', color: { rgb: 'CBD5E1' } },
        bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
        left: { style: 'thin', color: { rgb: 'CBD5E1' } },
        right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
    header: {
        top: { style: 'thin', color: { rgb: '1E3A8A' } },
        bottom: { style: 'medium', color: { rgb: '0284C7' } },
        left: { style: 'thin', color: { rgb: '2563EB' } },
        right: { style: 'thin', color: { rgb: '2563EB' } },
    },
};

// ── Generate Enhanced Styled Excel Base64 ───────────────────────────────────
export const generateExcelBase64 = ({ title, subtitle, columns, data, sheetName = 'Report' }) => {
    const XLSXLib = XLSX?.default?.write ? XLSX.default : (XLSX?.write ? XLSX : (XLSX?.default || XLSX));
    const colCount = Math.max((columns || []).length, 6);
    const nowStr = moment().format('DD MMM YYYY, hh:mm A');
    // 1. Company Banner (Row 0) - Clean text, no background color
    const titleCell = {
        v: 'TOP LIGHT - HR & EMPLOYEE MANAGEMENT SYSTEM',
        t: 's',
        s: {
            font: { name: 'Segoe UI', sz: 13, bold: true, color: { rgb: '0F172A' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        },
    };
    const row0 = Array(colCount)
        .fill(null)
        .map((_, i) => (i === 0 ? titleCell : { v: '', t: 's' }));

    // 2. Report Subtitle Banner (Row 1) - Clean blue text, no background color
    const reportTitleCell = {
        v: `${String(title || 'REPORT').toUpperCase()}`,
        t: 's',
        s: {
            font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: '0284C7' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        },
    };
    const row1 = Array(colCount)
        .fill(null)
        .map((_, i) => (i === 0 ? reportTitleCell : { v: '', t: 's' }));

    // 3. Metadata Row (Row 2) - Clean slate text, no background color
    const metaCell = {
        v: `Generated: ${nowStr}   |   ${subtitle ? `${subtitle}   |   ` : ''}Total Records: ${(data || []).length}`,
        t: 's',
        s: {
            font: { name: 'Segoe UI', sz: 9.5, italic: true, color: { rgb: '64748B' } },
            alignment: { horizontal: 'center', vertical: 'center' },
        },
    };
    const row2 = Array(colCount)
        .fill(null)
        .map((_, i) => (i === 0 ? metaCell : { v: '', t: 's' }));

    // 4. Blank gap row (Row 3)
    const row3 = Array(colCount)
        .fill(null)
        .map(() => ({ v: '', t: 's' }));

    // 5. Table Header Row (Row 4) - Corporate Royal Navy with bold white text
    const headerRow = (columns || []).map((c) => ({
        v: String(c.label || '').toUpperCase(),
        t: 's',
        s: {
            fill: { patternType: 'solid', fgColor: { rgb: '1E3A8A' } },
            font: { name: 'Segoe UI', sz: 10.5, bold: true, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            border: EXCEL_BORDERS.header,
        },
    }));

    // 6. Data Rows (Row 5 onwards)
    const dataRows = (data || []).map((item, index) => {
        const isEven = index % 2 === 0;
        const bgRgb = isEven ? 'FFFFFF' : 'F8FAFC';

        return (columns || []).map((c) => {
            let val = '';
            if (c.key === '#') {
                val = index + 1;
            } else if (typeof c.getValue === 'function') {
                val = c.getValue(item, index);
            } else {
                val = item?.[c.key] ?? '';
            }

            const keyLower = String(c.key || '').toLowerCase();
            const labelLower = String(c.label || '').toLowerCase();
            const isStatus = keyLower.includes('status') || labelLower.includes('status');

            const isCenter =
                c.key === '#' ||
                keyLower === 'sno' ||
                keyLower === 'docid' ||
                keyLower === 'doc_id' ||
                keyLower === 'userid' ||
                keyLower === 'user_id' ||
                keyLower === 'empid' ||
                keyLower === 'emp_id' ||
                keyLower === 'date' ||
                keyLower === 'docdate' ||
                keyLower === 'fromdate' ||
                keyLower === 'todate' ||
                keyLower === 'ftime' ||
                keyLower === 'ttime' ||
                keyLower === 'intime' ||
                keyLower === 'outtime' ||
                keyLower === 'duration' ||
                keyLower === 'tot_km' ||
                keyLower === 'totalkm' ||
                keyLower.includes('male') ||
                keyLower.includes('female') ||
                keyLower.includes('strength') ||
                keyLower.includes('present') ||
                keyLower.includes('absent') ||
                isStatus;

            // If empty or null or undefined, show '-' if centered column, or ''
            if (val === null || val === undefined || val === '') {
                val = isCenter && c.key !== '#' ? '-' : '';
            }

            const valStr = String(val ?? '');

            const style = {
                font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '0F172A' } },
                fill: { patternType: 'solid', fgColor: { rgb: bgRgb } },
                alignment: {
                    horizontal: isCenter ? 'center' : 'left',
                    vertical: 'center',
                    wrapText: !isCenter,
                },
                border: EXCEL_BORDERS.cell,
            };

            if (isStatus) {
                const sUpper = valStr.toUpperCase();
                if (sUpper.includes('APPROV')) {
                    style.fill = { patternType: 'solid', fgColor: { rgb: 'DCFCE7' } };
                    style.font = { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '166534' } };
                } else if (sUpper.includes('REJECT')) {
                    style.fill = { patternType: 'solid', fgColor: { rgb: 'FEE2E2' } };
                    style.font = { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '991B1B' } };
                } else {
                    style.fill = { patternType: 'solid', fgColor: { rgb: 'FEF3C7' } };
                    style.font = { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '92400E' } };
                }
            }

            if (keyLower === 'docid' || keyLower === 'doc_id') {
                style.font = { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '0284C7' } };
            }

            return {
                v: val,
                t: typeof val === 'number' ? 'n' : 's',
                s: style,
            };
        });
    });

    const aoa = [row0, row1, row2, row3, headerRow, ...dataRows];
    const ws = XLSXLib.utils.aoa_to_sheet(aoa);

    // Merge corporate banners across all columns
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
    ];

    // Column Widths - Generously expanded so NO text is truncated
    const colWidths = (columns || []).map((c, colIdx) => {
        const keyLower = String(c.key || '').toLowerCase();
        const labelLower = String(c.label || '').toLowerCase();

        let baseMin = 22;
        if (c.key === '#' || keyLower === 'sno') baseMin = 8;
        else if (keyLower === 'docid' || keyLower === 'doc_id') baseMin = 24;
        else if (keyLower.includes('name') || keyLower === 'employee' || keyLower === 'empname') baseMin = 32;
        else if (keyLower === 'userid' || keyLower === 'empid' || keyLower === 'user_id' || labelLower.includes('emp id')) baseMin = 16;
        else if (keyLower === 'category' || keyLower.includes('type')) baseMin = 28;
        else if (keyLower === 'deptname' || keyLower.includes('dept')) baseMin = 30;
        else if (keyLower.includes('date')) baseMin = 20;
        else if (keyLower.includes('time')) baseMin = 18;
        else if (keyLower === 'duration' || keyLower.includes('km')) baseMin = 18;
        else if (keyLower.includes('status') || labelLower.includes('status')) baseMin = 20;
        else if (keyLower.includes('location') || labelLower.includes('location')) baseMin = 65;
        else if (keyLower.includes('reason') || keyLower.includes('remark')) baseMin = 50;
        else if (
            keyLower.includes('male') ||
            keyLower.includes('female') ||
            keyLower.includes('strength') ||
            keyLower.includes('present') ||
            keyLower.includes('absent')
        ) baseMin = 18;

        let maxLen = Math.max(String(c.label || '').length + 4, baseMin);
        dataRows.forEach((row) => {
            const cellVal = String(row[colIdx]?.v ?? '');
            if (cellVal.length > maxLen) {
                maxLen = Math.min(cellVal.length + 3, 75);
            }
        });
        return { wch: maxLen };
    });
    ws['!cols'] = colWidths;

    // Row Heights - Spacious padding
    ws['!rows'] = [
        { hpt: 24 }, // Company Banner
        { hpt: 20 }, // Report Title Banner
        { hpt: 18 }, // Metadata Row
        { hpt: 8 },  // Visual Gap
        { hpt: 28 }, // Table Header Row
        ...dataRows.map((r) => {
            const hasLong = r.some((cell) => String(cell?.v ?? '').length > 35);
            return { hpt: hasLong ? 36 : 24 };
        }),
    ];

    const wb = XLSXLib.utils.book_new();
    const cleanSheetName = (sheetName || 'Report').replace(/[*?:/\[\]]/g, '').slice(0, 31);
    XLSXLib.utils.book_append_sheet(wb, ws, cleanSheetName);

    return XLSXLib.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
        cellStyles: true,
    });
};

// ── Generate CSV Fallback String ────────────────────────────────────────────
export const generateCsvString = ({ columns, data }) => {
    const escapeCsv = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const headerRow = columns.map((c) => escapeCsv(c.label)).join(',');
    const rows = (data || []).map((item, index) => {
        return columns
            .map((c) => {
                if (c.key === '#') return escapeCsv(index + 1);
                if (typeof c.getValue === 'function') {
                    return escapeCsv(c.getValue(item, index));
                }
                return escapeCsv(item?.[c.key] ?? '');
            })
            .join(',');
    });

    return [headerRow, ...rows].join('\r\n');
};

// ── Export PDF Action ───────────────────────────────────────────────────────
export const exportReportToPdf = async ({ title, subtitle, columns, data, fileName }) => {
    if (!data || data.length === 0) {
        Alert.alert('No Data', 'There are no records to export.');
        return;
    }

    const safeName = (
        fileName || `${title.replace(/\s+/g, '_')}_${moment().format('YYYYMMDD_HHmmss')}`
    ).replace(/[^a-zA-Z0-9_-]/g, '_');

    const html = generateReportHtml({ title, subtitle, columns, data });

    let pdfResult;
    try {
        const options = {
            html,
            fileName: safeName,
            directory: 'Documents',
            base64: true,
        };
        pdfResult = await convertHtmlToPdf(options);
    } catch (pdfErr) {
        console.error('PDF creation error:', pdfErr);
        throw new Error(`PDF generation failed: ${pdfErr?.message || 'Unknown error'}`);
    }

    if (!pdfResult) {
        throw new Error('PDF conversion returned no result.');
    }

    let cachePath = null;
    try {
        if (ReactNativeBlobUtil?.fs?.dirs?.CacheDir) {
            cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeName}.pdf`;
            if (pdfResult.base64) {
                await ReactNativeBlobUtil.fs.writeFile(cachePath, pdfResult.base64, 'base64');
            } else if (pdfResult.filePath) {
                const src = pdfResult.filePath.replace(/^file:\/\//, '');
                await ReactNativeBlobUtil.fs.cp(src, cachePath);
            }
        }
    } catch (writeErr) {
        console.warn('PDF cache write warning:', writeErr);
    }

    const shareOptions = {
        title: `Export ${title} (PDF)`,
        subject: `${title} - Top Light`,
        type: 'application/pdf',
        filename: `${safeName}.pdf`,
        failOnCancel: false,
    };

    if (cachePath) {
        shareOptions.url = Platform.OS === 'android' ? `file://${cachePath}` : cachePath;
    } else if (pdfResult.filePath) {
        const fPath = pdfResult.filePath.startsWith('file://')
            ? pdfResult.filePath
            : `file://${pdfResult.filePath}`;
        shareOptions.url = fPath;
    } else if (pdfResult.base64) {
        shareOptions.url = `data:application/pdf;base64,${pdfResult.base64}`;
    }

    return await shareFile(shareOptions);
};

// ── Export Excel Action ─────────────────────────────────────────────────────
export const exportReportToExcel = async ({
    title,
    subtitle,
    columns,
    data,
    fileName,
    sheetName,
}) => {
    if (!data || data.length === 0) {
        Alert.alert('No Data', 'There are no records to export.');
        return;
    }

    const safeName = (
        fileName || `${title.replace(/\s+/g, '_')}_${moment().format('YYYYMMDD_HHmmss')}`
    ).replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
        const base64Excel = generateExcelBase64({
            title,
            subtitle,
            columns,
            data,
            sheetName,
        });

        let cachePath = null;
        try {
            if (ReactNativeBlobUtil?.fs?.dirs?.CacheDir) {
                cachePath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeName}.xlsx`;
                await ReactNativeBlobUtil.fs.writeFile(cachePath, base64Excel, 'base64');
            }
        } catch (writeErr) {
            console.warn('Cache write warning:', writeErr);
        }

        const shareOptions = {
            title: `Export ${title} (Excel)`,
            subject: `${title} - Top Light`,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: `${safeName}.xlsx`,
            failOnCancel: false,
        };

        if (cachePath) {
            shareOptions.url = Platform.OS === 'android' ? `file://${cachePath}` : cachePath;
        } else {
            shareOptions.url = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Excel}`;
        }

        return await shareFile(shareOptions);
    } catch (xlsxErr) {
        console.warn('XLSX export error, falling back to CSV:', xlsxErr);

        const csvData = generateCsvString({ columns, data });
        let csvPath = null;
        if (ReactNativeBlobUtil?.fs?.dirs?.CacheDir) {
            csvPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeName}.csv`;
            await ReactNativeBlobUtil.fs.writeFile(csvPath, csvData, 'utf8');
        }

        const shareOptions = {
            title: `Export ${title} (CSV)`,
            subject: `${title} - Top Light`,
            type: 'text/csv',
            filename: `${safeName}.csv`,
            url: csvPath
                ? Platform.OS === 'android'
                    ? `file://${csvPath}`
                    : csvPath
                : `data:text/csv;base64,${ReactNativeBlobUtil.base64.encode(csvData)}`,
            failOnCancel: false,
        };
        return await shareFile(shareOptions);
    }
};

// ── Reusable Export Modal Component ─────────────────────────────────────────
export function ExportReportModal({
    visible,
    onClose,
    onExportPdf,
    onExportExcel,
    isExporting,
    exportingType,
    recordCount = 0,
    reportTitle = 'Report',
    theme,
}) {
    const safeCount = Number(recordCount || 0);
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                if (!isExporting) onClose();
            }}
        >
            <TouchableWithoutFeedback onPress={() => !isExporting && onClose()}>
                <View style={modalStyles.backdrop}>
                    <TouchableWithoutFeedback>
                        <View style={modalStyles.sheetCard}>
                            {/* Modal Header */}
                            <View style={modalStyles.headerRow}>
                                <View style={modalStyles.headerLeft}>
                                    <View style={modalStyles.headerIconBadge}>
                                        <MaterialCommunityIcons
                                            name="tray-arrow-down"
                                            size={20}
                                            color="#0284C7"
                                        />
                                    </View>
                                    <View>
                                        <Text style={modalStyles.modalTitle}>Export {reportTitle}</Text>
                                        <Text style={modalStyles.modalSubtitle}>
                                            {safeCount} {safeCount === 1 ? 'record' : 'records'} will be exported
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={modalStyles.closeBtn}
                                    onPress={onClose}
                                    disabled={isExporting}
                                    activeOpacity={0.7}
                                >
                                    <MaterialCommunityIcons name="close" size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            {/* Export Options */}
                            <View style={modalStyles.optionsContainer}>
                                {/* PDF Option */}
                                <TouchableOpacity
                                    style={[modalStyles.optionCard, isExporting && modalStyles.optionDisabled]}
                                    onPress={onExportPdf}
                                    disabled={isExporting}
                                    activeOpacity={0.75}
                                >
                                    <View style={[modalStyles.optionIconBadge, { backgroundColor: '#FEE2E2' }]}>
                                        <MaterialCommunityIcons
                                            name="file-pdf-box"
                                            size={26}
                                            color="#DC2626"
                                        />
                                    </View>
                                    <View style={modalStyles.optionTextWrap}>
                                        <Text style={modalStyles.optionTitle}>Export as PDF</Text>
                                        <Text style={modalStyles.optionDesc}>
                                            Printable A4 document with KPI summary & status badges
                                        </Text>
                                    </View>
                                    {isExporting && exportingType === 'pdf' ? (
                                        <ActivityIndicator size="small" color="#DC2626" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={22}
                                            color="#94A3B8"
                                        />
                                    )}
                                </TouchableOpacity>

                                {/* Excel Option */}
                                <TouchableOpacity
                                    style={[modalStyles.optionCard, isExporting && modalStyles.optionDisabled]}
                                    onPress={onExportExcel}
                                    disabled={isExporting}
                                    activeOpacity={0.75}
                                >
                                    <View style={[modalStyles.optionIconBadge, { backgroundColor: '#DCFCE7' }]}>
                                        <MaterialCommunityIcons
                                            name="file-excel-box"
                                            size={26}
                                            color="#16A34A"
                                        />
                                    </View>
                                    <View style={modalStyles.optionTextWrap}>
                                        <Text style={modalStyles.optionTitle}>Export as Excel (.xlsx)</Text>
                                        <Text style={modalStyles.optionDesc}>
                                            Formatted workbook for Microsoft Excel & Google Sheets
                                        </Text>
                                    </View>
                                    {isExporting && exportingType === 'excel' ? (
                                        <ActivityIndicator size="small" color="#16A34A" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name="chevron-right"
                                            size={22}
                                            color="#94A3B8"
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Cancel Button */}
                            <TouchableOpacity
                                style={modalStyles.cancelBtn}
                                onPress={onClose}
                                disabled={isExporting}
                                activeOpacity={0.7}
                            >
                                <Text style={modalStyles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const modalStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'flex-end',
    },
    sheetCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    closeBtn: {
        padding: 6,
    },
    optionsContainer: {
        marginTop: 16,
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 12,
    },
    optionDisabled: {
        opacity: 0.6,
    },
    optionIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextWrap: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },
    optionDesc: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
        lineHeight: 15,
    },
    cancelBtn: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
});

