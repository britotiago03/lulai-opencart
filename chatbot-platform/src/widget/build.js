// widget/build.js
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { v4: uuidv4 } = require('uuid');
const webpackConfig = require('./webpack.config.js');

// Function to build a customized widget
async function buildCustomWidget(config) {
  try {
    // Read template file
    const templatePath = path.resolve(__dirname, 'src/template.js');
    let templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholders with customized values
    templateContent = templateContent
      .replace('{{primaryColor}}', config.primaryColor)
      .replace('{{secondaryColor}}', config.secondaryColor)
      .replace('{{buttonSize}}', config.buttonSize)
      .replace('{{windowWidth}}', config.windowWidth)
      .replace('{{windowHeight}}', config.windowHeight)
      .replace('{{headerText}}', config.headerText)
      .replace('{{fontFamily}}', config.fontFamily);
    
    // Create a unique filename for this build
    const uniqueId = uuidv4().slice(0, 8);
    const outputFilename = `lulai-widget-${uniqueId}.js`;
    
    // Write customized content to widget.js
    const widgetPath = path.resolve(__dirname, 'src/widget.js');
    fs.writeFileSync(widgetPath, templateContent);
    
    // Prepare webpack config for this build
    const buildConfig = { ...webpackConfig };
    buildConfig.output.filename = outputFilename;
    buildConfig.output.path = path.resolve(process.cwd(), 'public/widgets');
    
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(buildConfig.output.path)) {
      fs.mkdirSync(buildConfig.output.path, { recursive: true });
    }
    
    // Build with webpack
    return new Promise((resolve, reject) => {
      webpack(buildConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          console.error('Build failed:', err || stats.toString());
          return reject(err || new Error(stats.toString()));
        }
        
        console.log(`Widget built successfully: ${outputFilename}`);
        resolve({
          filename: outputFilename,
          path: path.join('/widgets', outputFilename) // Path for client-side use
        });
      });
    });
  } catch (error) {
    console.error('Error building widget:', error);
    throw error;
  }
}

module.exports = { buildCustomWidget };