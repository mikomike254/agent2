/**
 * CREATIVE.KE UNIVERSAL EXPORTER
 * Handles CSV generation for platform datasets
 */

export const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    // 1. Extract Headers
    const headers = Object.keys(data[0]);

    // 2. Map Rows
    const rows = data.map(obj =>
        headers.map(header => {
            const val = obj[header];
            // Escape commas and wrap in quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
    );

    // 3. Combine
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
