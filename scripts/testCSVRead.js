// scripts/testCSVRead.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const results = [];

console.log('Testing CSV reading...');

fs.createReadStream(path.resolve(__dirname, '../protesto2.csv'))
  .pipe(csv({
    separator: ';'
  }))
  .on('data', (data) => {
    results.push(data);
    if (results.length <= 5) {
      console.log(`Row ${results.length}:`, data);
    }
  })
  .on('end', () => {
    console.log(`Total rows processed: ${results.length}`);
    console.log('First row (header):', results[0]);
    console.log('Second row (first data):', results[1]);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });