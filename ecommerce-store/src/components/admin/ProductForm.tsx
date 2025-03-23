import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ProductFormProps {
    initialData?: {
        id?: number;
        name: string;
        brand: string;
        category: string;
        price: number;
        images: string[];
        url: string;
        description?: {
            title: string;
            overview: string;
            details: string[];
            specifications: Record<string, string>;
        };
    };
    isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
                                                     initialData,
                                                     isEditing = false
                                                 }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(initialData?.name || "");
    const [brand, setBrand] = useState(initialData?.brand || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [url, setUrl] = useState(initialData?.url || "");

    // Description state
    const [title, setTitle] = useState(initialData?.description?.title || "");
    const [overview, setOverview] = useState(initialData?.description?.overview || "");
    const [details, setDetails] = useState<string[]>(initialData?.description?.details || [""]);
    const [specifications, setSpecifications] = useState<Record<string, string>>(
        initialData?.description?.specifications || { "": "" }
    );

    // Image handling
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages] = useState<string[]>(initialData?.images || []);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Common categories for dropdown
    const commonCategories = [
        "Electronics",
        "Clothing",
        "Home & Kitchen",
        "Sports & Outdoors",
        "Books",
        "Toys & Games",
        "Beauty & Personal Care",
        "Health & Household",
        "Automotive",
        "Office Products"
    ];

    // Generate URL slug from name
    useEffect(() => {
        if (!isEditing && name && !url) {
            setUrl(name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    }, [name, url, isEditing]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);
            setImages(prevImages => [...prevImages, ...selectedFiles]);

            // Generate previews
            selectedFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        setImagePreviews(prev => [...prev, event.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove a selected image (not yet uploaded)
    const removeSelectedImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    // Mark an existing image for deletion
    const toggleExistingImageDeletion = (imageUrl: string) => {
        if (imagesToDelete.includes(imageUrl)) {
            setImagesToDelete(imagesToDelete.filter(img => img !== imageUrl));
        } else {
            setImagesToDelete([...imagesToDelete, imageUrl]);
        }
    };

    // Add a new detail bullet point
    const addDetail = () => {
        setDetails([...details, ""]);
    };

    // Update a detail at a specific index
    const updateDetail = (index: number, value: string) => {
        const newDetails = [...details];
        newDetails[index] = value;
        setDetails(newDetails);
    };

    // Remove a detail at a specific index
    const removeDetail = (index: number) => {
        if (details.length > 1) {
            setDetails(details.filter((_, i) => i !== index));
        }
    };

    // Add a new specification key-value pair
    const addSpecification = () => {
        setSpecifications({ ...specifications, "": "" });
    };

    // Update a specification key
    const updateSpecificationKey = (oldKey: string, newKey: string) => {
        const newSpecifications = { ...specifications };
        const value = newSpecifications[oldKey];
        delete newSpecifications[oldKey];
        newSpecifications[newKey] = value;
        setSpecifications(newSpecifications);
    };

    // Update a specification value
    const updateSpecificationValue = (key: string, value: string) => {
        setSpecifications({ ...specifications, [key]: value });
    };

    // Remove a specification
    const removeSpecification = (key: string) => {
        if (Object.keys(specifications).length > 1) {
            const newSpecifications = { ...specifications };
            delete newSpecifications[key];
            setSpecifications(newSpecifications);
        }
    };

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!name || !brand || !price) {
            setError("Name, brand, and price are required fields");
            setLoading(false);
            return;
        }

        try {
            // Check if we have at least one image
            if (!isEditing && images.length === 0) {
                setError("At least one product image is required");
                setLoading(false);
                return;
            }

            if (isEditing && existingImages.length === 0 && images.length === 0) {
                setError("At least one product image is required");
                setLoading(false);
                return;
            }

            // Prepare form data
            const formData = new FormData();
            formData.append('name', name);
            formData.append('brand', brand);
            formData.append('category', category);
            formData.append('price', price);
            formData.append('url', url);
            formData.append('title', title || name);
            formData.append('overview', overview);

            // Add details as JSON
            formData.append('details', JSON.stringify(details.filter(detail => detail.trim() !== '')));

            // Clean up specifications (remove empty keys)
            const cleanedSpecifications: Record<string, string> = {};
            Object.entries(specifications).forEach(([key, value]) => {
                if (key.trim() !== '') {
                    cleanedSpecifications[key] = value;
                }
            });
            formData.append('specifications', JSON.stringify(cleanedSpecifications));

            // Add images
            images.forEach(image => {
                formData.append('images', image);
            });

            // If editing, add list of images to delete
            if (isEditing) {
                formData.append('deleteImages', JSON.stringify(imagesToDelete));
                formData.append('keepOldImages', (existingImages.length > imagesToDelete.length).toString());
            }

            // Determine endpoint and method
            const endpoint = isEditing
                ? `/api/admin/products/${initialData?.id}`
                : '/api/admin/products';

            const method = isEditing ? 'PUT' : 'POST';

            // Submit the form
            const response = await fetch(endpoint, {
                method,
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to save product');
                // Scroll to top to show error
                window.scrollTo(0, 0);
                setLoading(false);
                return;
            }

            // Show success toast
            toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');

            // Redirect back to products list
            router.push('/admin/products');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while saving the product');
            console.error('Error saving product:', err);

            // Scroll to top to show error
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-800 text-white p-4 rounded-md">
                    {error}
                </div>
            )}

            {/* Basic Information */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                            Brand <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="brand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                            Category
                        </label>
                        <input
                            type="text"
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            {commonCategories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">
                            Price ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
                            URL Path (auto-generated)
                        </label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 bg-gray-600 text-gray-300 border border-r-0 border-gray-600 rounded-l-md">
                                /products/
                            </span>
                            <input
                                type="text"
                                id="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md text-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Images */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Product Images</h2>

                <div className="mb-4">
                    <label htmlFor="images" className="block text-sm font-medium text-gray-300 mb-2">
                        Upload Images <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        id="images"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        multiple
                        ref={fileInputRef}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Select Images
                    </button>
                    <p className="text-xs text-gray-400 mt-1">
                        Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB per image.
                    </p>
                </div>

                {/* Image previews */}
                {(imagePreviews.length > 0 || existingImages.length > 0) && (
                    <div>
                        <h3 className="text-lg font-medium text-white mb-2">Image Preview</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {/* Existing images */}
                            {isEditing && existingImages.map((imageUrl, index) => (
                                <div
                                    key={`existing-${index}`}
                                    className={`relative rounded-md overflow-hidden border-2 ${
                                        imagesToDelete.includes(imageUrl)
                                            ? 'border-red-500 opacity-50'
                                            : 'border-gray-600'
                                    }`}
                                >
                                    <div className="relative h-32 w-full">
                                        <Image
                                            src={imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}
                                            alt={`Product Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleExistingImageDeletion(imageUrl)}
                                        className={`absolute top-2 right-2 rounded-full p-1 ${
                                            imagesToDelete.includes(imageUrl)
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                        title={imagesToDelete.includes(imageUrl) ? "Keep Image" : "Remove Image"}
                                    >
                                        {imagesToDelete.includes(imageUrl) ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ))}

                            {/* New image previews */}
                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={`preview-${index}`}
                                    className="relative rounded-md overflow-hidden border-2 border-blue-500"
                                >
                                    <div className="relative h-32 w-full">
                                        <Image
                                            src={preview}
                                            alt={`New Image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedImage(index)}
                                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-1"
                                        title="Remove Image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 px-2">
                                        New
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Description */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Product Description</h2>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                            Title (defaults to product name if left empty)
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="overview" className="block text-sm font-medium text-gray-300 mb-1">
                            Overview
                        </label>
                        <textarea
                            id="overview"
                            value={overview}
                            onChange={(e) => setOverview(e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        />
                    </div>

                    {/* Details (bullet points) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Key Details (bullet points)
                            </label>
                            <button
                                type="button"
                                onClick={addDetail}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                + Add Detail
                            </button>
                        </div>

                        <div className="space-y-2">
                            {details.map((detail, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <span className="text-gray-400">•</span>
                                    <input
                                        type="text"
                                        value={detail}
                                        onChange={(e) => updateDetail(index, e.target.value)}
                                        className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        placeholder="Enter a key product detail"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeDetail(index)}
                                        className="text-red-400 hover:text-red-300"
                                        disabled={details.length <= 1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Specifications (key-value pairs) */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                Specifications
                            </label>
                            <button
                                type="button"
                                onClick={addSpecification}
                                className="text-sm text-blue-400 hover:text-blue-300"
                            >
                                + Add Specification
                            </button>
                        </div>

                        <div className="space-y-2">
                            {Object.entries(specifications).map(([key, value], index) => (
                                <div key={index} className="grid grid-cols-5 gap-2">
                                    <input
                                        type="text"
                                        value={key}
                                        onChange={(e) => updateSpecificationKey(key, e.target.value)}
                                        className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        placeholder="Specification name"
                                    />
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => updateSpecificationValue(key, e.target.value)}
                                        className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        placeholder="Specification value"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpecification(key)}
                                        className="text-red-400 hover:text-red-300 flex items-center justify-center"
                                        disabled={Object.keys(specifications).length <= 1}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={loading}
                >
                    {loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isEditing ? 'Update Product' : 'Create Product'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;