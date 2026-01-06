
const xlsx = require('xlsx');

class ExcelExportService {
    /**
     * Convert staff data to Excel buffer
     * @param {Array} staffList 
     * @returns {Buffer}
     */
    generateExcel(staffList) {
        try {
            // Transform data for better readability
            const dataToExport = staffList.map(item => ({
                'Full Name': item.full_name,
                'Designation': item.designation,
                'Location': item.location,
                'Resumption Date': item.resumption_date,
                'Status': item.exit_date ? 'Exited' : 'Active',
                'Exit Date': item.exit_date || '',
                'Hiring Officer': item.hiring_officer,
                'Photo URL': item.picture_url,
                'Created At': new Date(item.created_at).toLocaleString()
            }));

            // Create a new workbook
            const workbook = xlsx.utils.book_new();

            // Create a worksheet
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);

            // Add worksheet to workbook
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Staff Records');

            // Generate buffer
            const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            return buffer;
        } catch (error) {
            console.error('Excel generation error:', error);
            throw new Error('Failed to generate Excel file');
        }
    }
}

module.exports = new ExcelExportService();
