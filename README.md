# Butterfly Talent Agency

## Local Assets Structure

The project now uses local assets instead of fetching images from external URLs. Here's the structure:

- `/src/assets/talents/` - Contains all talent profile images
- `/src/assets/clients/` - Contains all client logos
- `/src/assets/logos/` - Contains app logos and branding images

## Image Naming Convention

- Talent images: Use the talent's identifier (e.g., `shibolet.png`, `omer_yaron.png`)
- Client logos: Use the client's identifier (e.g., `samsung.svg`, `google.svg`)

## Adding New Images

1. Place the image file in the appropriate folder
2. Update the corresponding JSON file in `/src/data/` to reference the local path
3. The image utility will handle the proper loading and display of the image

## Image Formats

- SVG is preferred for logos and vector graphics
- PNG is preferred for photos with transparency
- JPEG is acceptable for photos without transparency
- WebP can be used for optimized images

## Image Optimization

Consider optimizing images before adding them to the project:
- Compress JPEGs and PNGs
- Use appropriate dimensions (don't use 4000px images for thumbnails)
- Consider using WebP format for better compression