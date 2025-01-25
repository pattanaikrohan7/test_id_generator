const fs = require('fs');
const path = require('path');

function addTestDataAttributes(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error('Error: File not found:', filePath);
    return;
  }

  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error.message);
    return;
  }

  const configPath = path.resolve('.testidrc.json');
  if (!fs.existsSync(configPath)) {
    console.error('Error: Configuration file ".testidrc.json" not found.');
    return;
  }

  let config;
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
  } catch (error) {
    console.error('Error reading configuration file:', error.message);
    return;
  }

  const attributeKeyword = config.attributeKeyword || 'data-testid';
  const defaultTestId = config.defaultTestId || 'generic';

  const idCount = {};
  const nameCount = {};
  const classCount = {};

  let modifiedText = text.replace(
    /<([-\w]+)([^>]*?)\/?>/g,
    (match, tagName, attributes) => {
      tagName = tagName.toLowerCase();

      if (config.ignoreElements && config.ignoreElements.includes(tagName)) {
        return match;
      }

      // Skip elements that already have the test attribute
      if (attributes.includes(`${attributeKeyword}=`)) {
        return match;
      }

      // Generate the test ID based on id, name, or class attributes
      const existingAttributes = attributes.trim();
      let testId = generateTestId(existingAttributes, defaultTestId, tagName, idCount, nameCount, classCount);

      // Add the generated data-testid attribute while keeping existing attributes
      return existingAttributes
        ? `<${tagName} ${existingAttributes} ${attributeKeyword}="${testId}">`
        : `<${tagName} ${attributeKeyword}="${testId}">`;
    }
  );

  try {
    fs.writeFileSync(filePath, modifiedText, 'utf8');
    console.log('File successfully modified:', filePath);
  } catch (error) {
    console.error('Error writing file:', error.message);
  }
}

// Function to generate a unique test ID based on id, name, or class attributes
function generateTestId(attributes, defaultTestId, tagName, idCount, nameCount, classCount) {
  let testId = '';

  const idMatch = attributes.match(/\bid=["'](.*?)["']/);
  if (idMatch) {
    let idValue = idMatch[1].trim();
    testId = ensureUnique(`${defaultTestId}_${idValue}`, idCount);
    return testId; // Return if id is found
  }

  const nameMatch = attributes.match(/\bname=["'](.*?)["']/);
  if (nameMatch) {
    let nameValue = nameMatch[1].trim();
    testId = ensureUnique(`${defaultTestId}_${nameValue}`, nameCount);
    return testId; // Return if name is found
  }

  const classMatch = attributes.match(/\bclass=["'](.*?)["']/);
  if (classMatch) {
    let classNames = classMatch[1].trim().split(/\s+/).join('_');
    testId = ensureUnique(`${defaultTestId}_${classNames}`, classCount);
  }

  return testId || `${defaultTestId}_${tagName}`;
}

// Function to ensure uniqueness of test IDs by appending an index if needed
function ensureUnique(testId, countTracker) {
  if (countTracker[testId]) {
    countTracker[testId]++;
    return `${testId}_${countTracker[testId]}`;
  } else {
    countTracker[testId] = 1;
    return testId;
  }
}

// Run the script to add test data attributes to 'example.html'
addTestDataAttributes('example.html','example copy.html');
