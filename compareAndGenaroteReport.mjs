// const fs = require('fs');
// const path = require('path');

import fs from 'fs';
import path from 'path';

const urls={
  "Case" : "https://qaapp8.clarizen.com/develop_20240809_4055_Application/Case",
  // "Project": "https://qaapp8.clarizen.com/develop_20240809_4055_Application/Project",
  // "Task": "https://qaapp8.clarizen.com/develop_20240809_4055_Application/GenericTask"
};

const runNumber = process.argv[2];

const baselineRunNumber = runNumber-1; 

for (let page in urls) {

    const json1 = JSON.parse(fs.readFileSync(`./result/`+`${baselineRunNumber}/`+`${page}`+`.json`, 'utf8'));
    const json2 = JSON.parse(fs.readFileSync(`./result/`+`${runNumber}/`+`${page}`+`.json`, 'utf8'));


    const jsonData = [
        {
            "MetricName": "firstContentfulPaint",
            "BaselineResults": json1['audits']['metrics']['details']['items'][0]['firstContentfulPaint']/1000,
            "RegressionResults": json2['audits']['metrics']['details']['items'][0]['firstContentfulPaint']/1000,
        },
        {
            "MetricName": "largestContentfulPaint",
            "BaselineResults": json1['audits']['metrics']['details']['items'][0]['largestContentfulPaint']/1000,
            "RegressionResults": json2['audits']['metrics']['details']['items'][0]['largestContentfulPaint']/1000,
        },
        {
            "MetricName": "observedDomContentLoaded",
            "BaselineResults": json1['audits']['metrics']['details']['items'][0]['observedDomContentLoaded']/1000,
            "RegressionResults": json2['audits']['metrics']['details']['items'][0]['observedDomContentLoaded']/1000,
        }
    ]
    
    
    function generateHtmlTable(jsonData) {
        let tableHtml = "<table>";
    
        const headers = Object.keys(jsonData[0]);
        tableHtml += "<tr>";
        headers.forEach(header => {
            tableHtml += `<th>${header}</th>`;
        });
        tableHtml += "</tr>";
    
        jsonData.forEach(row => {
            tableHtml += "<tr>";
            headers.forEach(header => {
                const cellValue = Array.isArray(row[header]) ? row[header].join(", ") : row[header];
                 let val = `<td>${cellValue}</td>`;
                if (header === "RegressionResults") {
    
                    if (cellValue < row['BaselineResults']) {
                         val =`<td style='background-color: #d4edda'>${cellValue}</td>`;
    
                    }
                   else if(cellValue > row['BaselineResults']) {
                         val = `<td style='background-color: #f8d7da'>${cellValue}</td>`;
    
                    }
                }
                tableHtml += val;
               
             
            });
            tableHtml += "</tr>";
        });
    
        tableHtml += "</table>";
        return tableHtml;
    }
    
     // Generate the HTML for the table and inject it into the div
     const tableHtml = generateHtmlTable(jsonData);
    
    // Create an HTML template
    const template = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JSON to HTML Table</title>
        <style>
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-family: Arial, sans-serif;
            }
            table, th, td {
                border: 1px solid black;
            }
            th, td {
                padding: 10px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
            }
        </style>
    </head>
    <body>
        <h1 style="color:red" align="center">Core Web Vitals Camparision Report</h1>
        <div id="tableContainer"></div>
        ${tableHtml}
        <script>
            ${tableHtml}
        </script>
    </body>
    </html>
    `;
    
    
    
    // Write the HTML content to a file
    fs.writeFileSync(path.join(__dirname, `${page}`+`_Comparison.html`), template, 'utf8');
}

console.log('Comparison report generated as comparison_report.html');
