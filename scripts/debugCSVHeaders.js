// scripts/debugCSVHeaders.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

console.log('Debugging CSV headers...');

fs.createReadStream(path.resolve(__dirname, '../protesto2.csv'))
  .pipe(csv({
    separator: ';'
  }))
  .on('data', (data) => {
    // Print the actual column names
    console.log('Actual column names:');
    Object.keys(data).forEach(key => {
      console.log(`"${key}"`);
    });
    console.log('\nThe first row data:');
    console.log(data);
    // Stop after first row
    process.exit(0);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });