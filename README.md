This project provides a Node.js script that adds unique data-testid attributes to HTML elements based on their id, name, or class attributes. 
You can apply this script to one or more HTML files in a directory.

Features
Automatically generates data-testid attributes for elements based on their id, name, or class attributes.
Processes one or multiple HTML files at once.
Generates a modified output file with _modified appended to the original file name (e.g., example.html becomes example_modified.html).
Uses a configuration file (.testidrc.json) to customize behavior.

Prerequisites
Node.js installed on your machine (v12 or later).
The configuration file .testidrc.json should be present in your project directory. 
This file will define custom settings like the attribute keyword (data-testid) and the default test ID.

Configuration (.testidrc.json)
You must create a .testidrc.json file in your project directory with the following structure:
{
  "attributeKeyword": "data-testid", // The name of the test ID attribute (default is "data-testid")
  "defaultTestId": "generic",        // Default test ID value if no specific ID, name, or class is found
  "ignoreElements": ["form", "script"], // List of HTML elements to ignore (optional)
  "taggingRule": "tagName_class" // Defines how test IDs are generated, can be 'tagName_class' or 'id_class' (optional)
}

File Structure
├── addTestIds.js                # Node.js script to add test IDs to HTML files
├── .testidrc.json               # Configuration file
├── example1.html                # Example HTML files
├── example2.html                # Example HTML files
└── README.md                    # This README file

How to Use
1. Modify a Single HTML File
To modify a single HTML file, use the following command in your terminal:

node addTestIds.js <input-file-path>
Example:
node addTestIds.js example.html
This will generate a modified version of example.html as example_modified.html in the same directory.

2. Modify Multiple HTML Files
You can also modify multiple HTML files at once by passing an array of file paths:
node addTestIds.js ['example1.html', 'example2.html']
This will process example1.html and example2.html, creating example1_modified.html and example2_modified.html respectively.

3. Modify All HTML Files in a Directory
To modify all HTML files in a specific directory, run the following command:
node addTestIds.js
This will automatically process all .html files in the current directory, creating _modified versions for each file.

Example

Input (example.html):
html
Copy
Edit
<html>
  <body>
    <button id="submitBtn" name="submit">Submit</button>
    <input type="text" class="input-field" />
  </body>
</html>

Configuration (.testidrc.json):
{
  "attributeKeyword": "data-testid",
  "defaultTestId": "generic"
}

Output (example_modified.html):
<html>
  <body>
    <button id="submitBtn" name="submit" data-testid="generic_submitBtn">Submit</button>
    <input type="text" class="input-field" data-testid="generic_input-field" />
  </body>
</html>

Customization
Change the Attribute Name: You can change the default attribute name from data-testid to something else by modifying the attributeKeyword in the .testidrc.json configuration file.
Customize Test ID Generation: You can modify the script to generate test-id values based on other criteria (like custom tags or other attributes). Adjust the generateTestId function in the script to fit your needs.

Troubleshooting
If you see an error message like "Error: Input file not found", ensure that the file path is correct.
If the .testidrc.json file is missing or malformed, the script will provide an error message. Make sure the file exists and is in JSON format.




Add your html file
Give the path in modifyHtml.js
Run the below command to 

Check for Existing data-testid:

The script checks if the element already contains data-testid.
If present, it skips modifying that element.
If not present, it generates and adds the attribute.
Test ID Generation Order:

If an id exists, use id + defaultTestId.
If a name exists, use name + defaultTestId.
If a class exists, use class + defaultTestId.
If none are found, fall back to tagName + defaultTestId.
Ensuring Uniqueness:

If duplicate values are found (same id, name, or class), an incremented index (e.g., _2, _3) is added.

Edge Cases Handled:
Elements with existing data-testid:

They remain unchanged.
Elements without any attributes:

Fallback to tagName + defaultTestId.
Handling duplicate values:

Ensures uniqueness with index suffixes.
