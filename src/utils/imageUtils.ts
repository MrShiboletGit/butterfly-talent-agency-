/**
 * Helper function to get image URLs
 * Handles both local images in public folder and external URLs
 * @param path Path to the image or external URL
 * @returns The image URL
 */
export function getImageUrl(path: string): string {
  try {
    // If it's already a full URL (http/https), return it as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove the leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // For images in the public folder, just return the path
    return `/${cleanPath}`;
  } catch (error) {
    console.error(`Failed to load image: ${path}`, error);
    return ''; // Return empty string or a placeholder image URL
  }
}