// src/app/api/build-widget/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { getServerSession } from "next-auth/next";
import { userAuthOptions } from "@/lib/auth-config";

interface WidgetConfig {
    widgetConfig: {
        primaryColor: string;
        secondaryColor: string;
        buttonSize: string;
        windowWidth: string;
        windowHeight: string;
        headerText: string;
        fontFamily: string;
    };
}

export async function POST(request: NextRequest) {

    try {
        const session = await getServerSession(userAuthOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Parse the request body
        const data: WidgetConfig = await request.json();
        const { widgetConfig } = data;

        // Validate the config
        if (!widgetConfig) {
            console.error('Widget configuration is missing');
            return NextResponse.json({
                message: 'Widget configuration is required'
            }, { status: 400 });
        }

        // Detailed logging of received configuration
        console.log('Received Widget Configuration:', JSON.stringify(widgetConfig, null, 2));

        // Path to the template file
        const templatePath = path.join(process.cwd(), 'src', 'widget', 'src', 'template.js');

        // Verify template file exists
        try {
            await fs.access(templatePath);
            console.log('Template file found:', templatePath);
        } catch {
            // Error parameter intentionally omitted
            console.error('Template file not found:', templatePath);
            return NextResponse.json({
                message: 'Widget template file is missing',
                templatePath: templatePath
            }, { status: 500 });
        }

        // Read and process the template
        let templateContent = await fs.readFile(templatePath, 'utf8');

        // Replace placeholders with config values
        Object.entries(widgetConfig).forEach(([key, value]) => {
            const placeholder = `{{${key}}}`;
            templateContent = templateContent.replace(new RegExp(placeholder, 'g'), value);
        });

        // Obfuscate the generated code
        const obfuscationResult = JavaScriptObfuscator.obfuscate(templateContent, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: true
        });

        const obfuscatedCode = obfuscationResult.getObfuscatedCode();

        // Generate filename and paths
        const hash = crypto.createHash('md5')
            .update(JSON.stringify(widgetConfig))
            .digest('hex')
            .slice(0, 10);
        const outputFilename = `lulai-widget-${hash}.js`;
        const publicDir = path.join(process.cwd(), 'public');
        const widgetsDir = path.join(publicDir, 'widgets');
        const outputPath = path.join(widgetsDir, outputFilename);

        // Ensure output directory exists
        try {
            await fs.mkdir(widgetsDir, { recursive: true });
            console.log('Widgets directory created/verified:', widgetsDir);
        } catch (mkdirError) {
            console.error('Failed to create widgets directory:', mkdirError);
            return NextResponse.json({
                message: 'Failed to create widget output directory',
                error: mkdirError instanceof Error ? mkdirError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Write the obfuscated widget file
        try {
            await fs.writeFile(outputPath, obfuscatedCode);
            console.log('Obfuscated widget file written:', outputPath);
        } catch (writeError) {
            console.error('Failed to write widget file:', writeError);
            return NextResponse.json({
                message: 'Failed to write widget file',
                outputPath: outputPath,
                error: writeError instanceof Error ? writeError.message : 'Unknown error'
            }, { status: 500 });
        }

        // Verify file creation
        try {
            const stats = await fs.stat(outputPath);
            console.log('Widget file stats:', {
                path: outputPath,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            });
        } catch (statError) {
            console.error('Failed to get file stats:', statError);
        }

        // Return public URL
        const publicUrl = `/widgets/${outputFilename}`;
        return NextResponse.json({
            downloadUrl: publicUrl,
            message: 'Widget successfully built',
            outputPath: outputPath,
            filename: outputFilename
        });

    } catch (error) {
        console.error('Widget Build Error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });

        return NextResponse.json({
            message: 'Failed to build widget',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}