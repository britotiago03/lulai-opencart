// lib/storage.ts
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Base directory for product images
const IMAGES_DIR = path.join(process.cwd(), 'public', 'product-images');

// Create the directory if it doesn't exist
async function ensureDirectoryExists(directory: string): Promise<void> {
    try {
        await fs.mkdir(directory, { recursive: true });
    } catch (err) {
        console.error(`Error creating directory ${directory}:`, err);
        throw err;
    }
}

// Process and save image files
export async function saveImageFiles(files: File[]): Promise<string[]> {
    await ensureDirectoryExists(IMAGES_DIR);

    const savedImagePaths: string[] = [];

    for (const file of files) {
        if (!file.size) continue; // Skip empty files

        // Generate a unique filename
        const fileExtension = path.extname(file.name).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        if (!validExtensions.includes(fileExtension)) {
            throw new Error(`Invalid file type. Supported types: ${validExtensions.join(', ')}`);
        }

        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = path.join(IMAGES_DIR, fileName);

        // Get the file buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        try {
            // Process the image with sharp
            await sharp(buffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .toFile(filePath);

            // Generate a thumbnail
            const thumbDir = path.join(IMAGES_DIR, 'thumbnails');
            await ensureDirectoryExists(thumbDir);

            const thumbPath = path.join(thumbDir, fileName);
            await sharp(buffer)
                .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
                .toFile(thumbPath);

            // Return the paths relative to the public directory
            const relativePath = `/product-images/${fileName}`;
            savedImagePaths.push(relativePath);
        } catch (err) {
            console.error(`Error processing image ${fileName}:`, err);
            throw err;
        }
    }

    return savedImagePaths;
}

// Delete an image
export async function deleteImage(imageUrl: string): Promise<void> {
    try {
        // Extract the filename from the URL
        const fileName = path.basename(imageUrl);

        // Delete the main image
        const mainImagePath = path.join(IMAGES_DIR, fileName);
        await fs.unlink(mainImagePath);

        // Delete the thumbnail if it exists
        const thumbnailPath = path.join(IMAGES_DIR, 'thumbnails', fileName);
        try {
            await fs.unlink(thumbnailPath);
        } catch {
            // Ignore if thumbnail doesn't exist
            console.warn(`Thumbnail for ${fileName} not found or could not be deleted.`);
        }
    } catch (err) {
        console.error(`Error deleting image ${imageUrl}:`, err);
        throw err;
    }
}