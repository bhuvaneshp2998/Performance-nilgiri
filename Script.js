const { runK6Test } = require('./perfromacnemodule');

runK6Test({
    url: 'https://example.com',
    options: {
        vus: 10,
        duration: '5s'
    },
    aireport: {
        apikey: '', 
        reportPath: 'custom-report.html'  
    },
    // detailedReportjson: 'report.json',  // Path to save the detailed JSON report
});
