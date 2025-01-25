const fs = require('fs');
const path = require('path');

function addTestDataAttributes(inputFilePaths) {
  inputFilePaths.forEach(inputFilePath => {
    if (!fs.existsSync(inputFilePath)) {
      console.error('Error: Input file not found:', inputFilePath);
      return;
    }

    let text;
    try {
      text = fs.readFileSync(inputFilePath, 'utf8');
    } catch (error) {
      console.error('Error reading input file:', error.message);
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

    // Modify elements and replace in text
    let modifiedText = text.replace(
      /<([-\w]+)([^>]*?)\/?>/g,
      (match, tagName, attributes) => {
        tagName = tagName.toLowerCase();

        // Check if 'data-testid' already exists
        if (!attributes.includes(`${attributeKeyword}=`)) {
          const testId = generateTestId(attributes, defaultTestId, tagName, idCount, nameCount, classCount);

          // Add the generated data-testid attribute
          return `<${tagName} ${attributes} ${attributeKeyword}="${testId}">`;
        }

        // Return the unchanged element if data-testid exists
        return match;
      }
    );

    // Generate the output file name by appending '_modified' before the file extension
    const outputFilePath = inputFilePath.replace(/(\.[\w\d_-]+)$/i, '_modified$1');

    // Write modified content to the generated output file
    try {
      fs.writeFileSync(outputFilePath, modifiedText, 'utf8');
      console.log('File successfully modified and saved to:', outputFilePath);
    } catch (error) {
      console.error('Error writing output file:', error.message);
    }
  });
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

// Run the script with an array of input file paths
addTestDataAttributes(['dashboard.html']);
