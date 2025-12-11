import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Export data to CSV format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportToCSV(data: any[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export dashboard data to CSV
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportDashboardReport(metrics: any[], loads: any[]): void {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Create metrics CSV
    const metricsData = metrics.map(m => ({
      'Metric': m.label,
      'Value': m.value,
      'Change': m.delta,
      'Trend': m.trend
    }));

    // Create loads CSV
    const loadsData = loads.map(l => ({
      'Load ID': l.id,
      'Origin': l.origin,
      'Destination': l.destination,
      'Equipment': l.equipment,
      'Rate': l.rate,
      'Pickup': l.pickup,
      'Status': l.status
    }));

    // Combine both sections
    const reportData = [
      { Section: 'DASHBOARD METRICS', Date: timestamp },
      ...metricsData.map(m => ({ Section: '', ...m })),
      { Section: '' },
      { Section: 'RECENT LOADS' },
      ...loadsData.map(l => ({ Section: '', ...l }))
    ];

    this.exportToCSV(reportData, `dashboard-report-${timestamp}.csv`);
  }

  /**
   * Export data to JSON format
   */
  exportToJSON(data: unknown[], filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  /**
   * Helper function to trigger file download
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Print current view
   */
  printReport(): void {
    window.print();
  }
}
