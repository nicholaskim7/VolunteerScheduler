import React, { useState } from 'react';
import axios from 'axios';
import "./Theme.css"

function ReportingModule() {
    const[reportType, setReportType] = useState('volunteer-activity')
    const[format, setFormat] = useState('csv');

    const handleGenerateReport = async () => {
        try {
            console.log('Requesting report...');
            const url = `http://localhost:8081/reports/${reportType}`;
            console.log('Fetching from URL:', url);
    
            const response = await axios.get(url, {
                params: { format },
                responseType: 'blob',
            });
    
            console.log('Report received:', response);
    
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            console.log('Blob URL created:', blobUrl);
    
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `${reportType}_report.${format}`);
            document.body.appendChild(link);
            link.click();
    
            console.log('Download link clicked');
        } catch (error) {
            console.error("Error generating report", error);
        }
    };
    

    return (
        <div className='bg-green'>
            <h1>Generate Report</h1>
            <div>
                <label>
                    Report Type:
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="volunteer-activity">Volunteer Activity</option>
                        <option value="event-management">Event management</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Format:
                    <select value={format} onChange={(e) => setFormat(e.target.value)}>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                    </select>
                </label>
            </div>
            <button onClick={handleGenerateReport}>Generate Report</button>
        </div>  
    )
}

export default ReportingModule