import { NextResponse } from "next/server";
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { saveImageFiles, deleteImage } from "@/lib/storage";

// Define a type for product data
export interface ProductData {
    name: string;
    brand: string;
    category: string;
    price: number;
    urlPath: string;
}

// Define a result type for data extraction
export interface DataExtractionResult {
    isValid: boolean;
    error: NextResponse | null;
    data: ProductData | null;
}

// Define a type for description data
export interface DescriptionData {
    title: string;
    overview: string;
    details: string[];
    specifications: Record<string, string>;
}

// Define a result type for image processing
export interface ImageProcessingResult {
    isValid: boolean;
    error: NextResponse | null;
    imageUrls: string[];
}

/**
 * Extract and validate basic product information from form data
 */
export async function extractProductData(formData: FormData): Promise<DataExtractionResult> {
    // Extract basic product information
    const name = formData.get('name') as string;
    const brand = formData.get('brand') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const urlPath = formData.get('url') as string || name.toLowerCase().replace(/\s+/g, '-');

    // Validate required fields
    if (!name || !brand || !price) {
        return {
            isValid: false,
            error: NextResponse.json(
                { error: "Name, brand, and price are required fields" },
                { status: 400 }
            ),
            data: null
        };
    }

    return {
        isValid: true,
        error: null,
        data: {
            name,
            brand,
            category,
            price,
            urlPath
        }
    };
}

/**
 * Extract and parse product description data from form data
 */
export function extractDescriptionData(formData: FormData, productName: string): DescriptionData {
    const overview = formData.get('overview') as string;
    const title = formData.get('title') as string || productName;
    const detailsJson = formData.get('details') as string;
    const specificationsJson = formData.get('specifications') as string;

    const details = detailsJson ? JSON.parse(detailsJson) : [];
    const specifications = specificationsJson ? JSON.parse(specificationsJson) : {};

    return {
        title,
        overview,
        details,
        specifications
    };
}

// Define a return type for description file creation
export interface DescriptionFileResult {
    absolutePath: string;
    relativePath: string;
}

/**
 * Create a description file for a product and return the file path
 */
export async function createDescriptionFile(descriptionData: DescriptionData): Promise<DescriptionFileResult> {
    // Generate a unique filename for the description file
    const descriptionFileName = `${uuidv4()}.json`;
    const descriptionDir = path.join(process.cwd(), 'public', 'descriptions');
    const descriptionPath = path.join(descriptionDir, descriptionFileName);
    const relativeFilePath = `/descriptions/${descriptionFileName}`;

    // Ensure the directory exists
    await fs.mkdir(descriptionDir, { recursive: true });

    // Write the description file
    await fs.writeFile(
        descriptionPath,
        JSON.stringify(descriptionData, null, 2)
    );

    return {
        absolutePath: descriptionPath,
        relativePath: relativeFilePath
    };
}

/**
 * Process and validate product images
 */
export async function processProductImages(formData: FormData, isEditing = false): Promise<ImageProcessingResult> {
    // Handle image uploads
    const imageFiles = formData.getAll('images') as File[];

    // Only validate "at least one image" for new products
    if (!isEditing && (!imageFiles || imageFiles.length === 0 || imageFiles[0].size === 0)) {
        return {
            isValid: false,
            error: NextResponse.json(
                { error: "At least one image is required" },
                { status: 400 }
            ),
            imageUrls: []
        };
    }

    // Process images only if there are valid files
    const hasValidImages = imageFiles && imageFiles.length > 0 && imageFiles[0].size > 0;
    const imageUrls = hasValidImages ? await saveImageFiles(imageFiles) : [];

    return {
        isValid: true,
        error: null,
        imageUrls
    };
}

/**
 * Process image deletions for product updates
 */
export function processImageDeletions(formData: FormData): string[] {
    const imageIdsToDelete = formData.get('deleteImages') as string;

    let imagesToDelete: string[] = [];
    if (imageIdsToDelete) {
        try {
            imagesToDelete = JSON.parse(imageIdsToDelete);
        } catch (err) {
            console.error("Error parsing imageIdsToDelete:", err);
        }
    }

    return imagesToDelete;
}

/**
 * Clean up resources after a failed operation
 */
export async function cleanupResources(descriptionPath: string | null, imageUrls: string[]): Promise<void> {
    // Delete the description file if provided
    if (descriptionPath) {
        try {
            await fs.unlink(descriptionPath);
        } catch (unlinkErr) {
            console.error("Error deleting description file during cleanup:", unlinkErr);
        }
    }

    // Delete image files
    for (const imageUrl of imageUrls) {
        try {
            await deleteImage(imageUrl);
        } catch (imageErr) {
            console.error(`Error deleting image ${imageUrl} during cleanup:`, imageErr);
        }
    }
}