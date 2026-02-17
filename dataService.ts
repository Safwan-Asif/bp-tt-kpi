
import { ProductivityData, PerformanceData, CategoryBilledData } from '../types';

const BASE_URL = 'https://docs.google.com/spreadsheets/d/1CoP63WfylZnQesUKZqbd21zGXlYQBzwl3aemE3AwESs/gviz/tq?tqx=out:csv&sheet=';

function parseCSV(text: string): any[] {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    // Basic CSV parser that handles quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const obj: any = {};
    headers.forEach((header, index) => {
      let val = values[index] ? values[index].replace(/"/g, '') : '';
      // Simple numeric parsing
      const num = parseFloat(val.replace(/,/g, ''));
      obj[header.replace(/\s+/g, '')] = isNaN(num) || val === '' ? val : num;
    });
    return obj;
  });
}

export async function fetchDashboardData() {
  try {
    const [prodRes, perfRes, catRes] = await Promise.all([
      fetch(`${BASE_URL}Productivity_Data`),
      fetch(`${BASE_URL}Performance_Data`),
      fetch(`${BASE_URL}Category_Billed_Outlets`)
    ]);

    if (!prodRes.ok || !perfRes.ok || !catRes.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const prodText = await prodRes.text();
    const perfText = await perfRes.text();
    const catText = await catRes.text();

    const productivity = parseCSV(prodText) as ProductivityData[];
    const performance = parseCSV(perfText) as PerformanceData[];
    const categoryBilled = parseCSV(catText) as CategoryBilledData[];

    return { productivity, performance, categoryBilled };
  } catch (error) {
    console.error('Data Fetch Error:', error);
    throw error;
  }
}
