// chatbot-platform/src/lib/widget-builder.ts
import fs from 'fs';
import path from 'path';

interface WidgetConfig {
  primaryColor: string;
  secondaryColor: string;
  buttonSize: string;
  windowWidth: string;
  windowHeight: string;
  headerText: string;
  fontFamily: string;
}

export async function buildWidget(config: WidgetConfig) {
  try {
    // Path to the template file
    const templatePath = path.join(process.cwd(), 'src', 'widget', 'src', 'template.js');
    
    // Read the template file
    let templateContent = fs.readFileSync(templatePath, 'utf8');

    // Replace placeholders with actual config values
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      templateContent = templateContent.replace(new RegExp(placeholder, 'g'), value);
    });

    // Create a unique filename for the widget
    const timestamp = Date.now();
    const outputFilename = `lulai-widget-${timestamp}.js`;
    const outputPath = path.join(process.cwd(), 'public', 'widgets', outputFilename);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    // Write the customized widget file
    fs.writeFileSync(outputPath, templateContent);

    // Return the public URL of the widget
    return `/widgets/${outputFilename}`;
  } catch (error) {
    console.error('Widget build error:', error);
    throw new Error('Failed to build widget');
  }
}