import * as fs from 'fs';
import * as path from 'path';

export function getWcagCriteria(requirements: string): Array<{ [publicName: string]: { criterias: any[]; value: number } }> {
  // Parse the requirements string into an object
  let requirementsObj: { [publicName: string]: number };
  try {
    requirementsObj = JSON.parse(requirements);
  } catch (error) {
    throw new Error('Invalid requirements JSON string.');
  }

  // Load the wcag-criteria.json file
  const wcagCriteriaPath = path.resolve(__dirname, '../constants/wcag-criteria.json');
  let wcagData: { [publicName: string]: any[] };
  try {
    const data = fs.readFileSync(wcagCriteriaPath, 'utf8');
    wcagData = JSON.parse(data);
  } catch (error) {
    throw new Error('Error reading wcag-criteria.json file.');
  }

  // Build the result array
  const result: Array<{ [publicName: string]: { criterias: any[]; value: number } }> = [];

  for (const publicName of Object.keys(requirementsObj)) {
    const value = requirementsObj[publicName];
    const criterias = wcagData[publicName] || [];
    const publicObj = {
      [publicName]: {
        criterias: criterias,
        value: value
      }
    };
    result.push(publicObj);
  }

  return result;
}
