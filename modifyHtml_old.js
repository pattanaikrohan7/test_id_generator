const fs = require('fs'); // Import the 'fs' module for file operations
const path = require('path'); // Import the 'path' module to handle file paths

// Function to add test data attributes to HTML elements in a file
function addTestDataAttributes(filePath) {
  // Check if the provided HTML file exists
  if (!fs.existsSync(filePath)) {
    console.error('Error: File not found:', filePath);
    return;
  }

  // Read the contents of the HTML file safely
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('Error reading file:', error.message);
    return;
  }

  // Resolve the path for the configuration file '.testidrc.json'
  const configPath = path.resolve('.testidrc.json');

  // Check if the configuration file exists
  if (!fs.existsSync(configPath)) {
    console.error('Error: Configuration file ".testidrc.json" not found.');
    return;
  }

  // Read and parse the configuration file safely
  let config;
  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configData);
  } catch (error) {
    console.error('Error reading configuration file:', error.message);
    return;
  }

  const attributeKeyword = config.attributeKeyword || 'data-testid'; // Default to 'data-testid' if not specified
  const classCount = {}; // Track occurrences of class names for uniqueness

  // Enhanced regex to handle both self-closing and normal HTML tags
  let modifiedText = text.replace(
    /<([-\w]+)([^>]*?)\/?>/g,
    (match, tagName, attributes) => {
      tagName = tagName.toLowerCase(); // Normalize tag names

      // Skip elements in the ignore list
      if (config.ignoreElements && config.ignoreElements.includes(tagName)) {
        return match;
      }

      // Check if the element already has the test attribute
      if (attributes.includes(`${attributeKeyword}=`)) {
        return match;
      }

      // Clean up attributes and generate a test ID
      const existingAttributes = attributes.trim();
      let testId = getIdFromElement(existingAttributes, config.defaultTestId || 'generic', tagName);

      // Handle elements with class attributes to generate unique IDs
      const classMatch = existingAttributes.match(/\bclass=["'](.*?)["']/);
      if (classMatch) {
        const classNames = classMatch[1].split(/\s+/);
        classNames.forEach(className => {
          if (classCount[className]) {
            classCount[className]++;
            testId = `${testId}_${classCount[className]}`;
          } else {
            classCount[className] = 1;
          }
        });
      }

      // Construct the new element with the test ID
      return existingAttributes
        ? `<${tagName} ${attributeKeyword}="${testId}" ${existingAttributes}>`
        : `<${tagName} ${attributeKeyword}="${testId}">`;
    }
  );

  // Write the modified HTML text back to the file
  try {
    fs.writeFileSync(filePath, modifiedText, 'utf8');
    console.log('File successfully modified:', filePath);
  } catch (error) {
    console.error('Error writing file:', error.message);
  }
}

// Function to generate a test ID for an element based on its attributes
function getIdFromElement(attributes, defaultTestId, tagName) {
  const idMatch = attributes.match(/\bid=["'](.*?)["']/);
  if (idMatch) return idMatch[1];

  const nameMatch = attributes.match(/\bname=["'](.*?)["']/);
  if (nameMatch) return nameMatch[1];

  const classMatch = attributes.match(/\bclass=["'](.*?)["']/);
  if (classMatch) {
    const classNames = classMatch[1].split(/\s+/).join('_');
    return classNames;
  }

  return `${tagName}_${defaultTestId}`;
}

// Run the script to add test data attributes to 'example.html'
addTestDataAttributes('example.html');
