/**
 * Centralized mapping of game images
 * 
 * To add a new game image:
 * 1. Import the image at the top
 * 2. Add the mapping in GAME_IMAGES object using the game slug as key
 * 3. Use an array for multiple images: 'game-slug': [image1, image2, ...]
 * 4. Use a single image for one image: 'game-slug': image1
 */

import wendigosChaseImage from '../assets/image/games/wendigos-chase/ImgBoiteWendigo.png'

/**
 * Maps game slugs to their image imports (can be single image or array of images)
 */
export const GAME_IMAGES = {
	'wendigos-chase': [wendigosChaseImage],
	// Add more games here as they're added:
	// 'new-game-slug': [image1, image2, image3],
	// Or for single image: 'new-game-slug': singleImage,
}

/**
 * Get the image(s) for a game by its slug
 * @param {string} slug - The game slug
 * @returns {string|string[]|null} The image path(s) or null if not found
 */
export const getGameImage = (slug) => {
	const images = GAME_IMAGES[slug]
	if (!images) return null
	// Return first image for backward compatibility
	return Array.isArray(images) ? images[0] : images
}

/**
 * Get all images for a game by its slug
 * @param {string} slug - The game slug
 * @returns {string[]} Array of image paths (empty array if not found)
 */
export const getGameImages = (slug) => {
	const images = GAME_IMAGES[slug]
	if (!images) return []
	// Always return an array
	return Array.isArray(images) ? images : [images]
}

/**
 * Check if a game has an image
 * @param {string} slug - The game slug
 * @returns {boolean} True if the game has an image
 */
export const hasGameImage = (slug) => {
	return slug in GAME_IMAGES
}
