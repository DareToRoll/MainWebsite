import { getShippingCost } from './shipping'

/**
 * Round to 2 decimal places (euros)
 */
function roundEuro(x) {
	return Math.round(x * 100) / 100
}

/**
 * Calculate order totals from cart items and form data
 * All prices are TTC (VAT included)
 * 
 * @param {Array<{priceValue: number, quantity: number}>} cartItems
 * @param {string} country
 * @param {number} donationAmount
 * @returns {Object} totals breakdown
 */
export function calculateOrderTotals(cartItems, country, donationAmount = 0) {
	// Products total TTC
	const productsTTC = cartItems.reduce(
		(sum, item) => sum + (item.priceValue || 0) * item.quantity,
		0
	)

	// Total items count
	const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

	// Shipping cost TTC
	const shippingTTC = getShippingCost(totalItems, country)

	// Donation TTC
	const donationTTC = Number(donationAmount) || 0

	// Total TTC (products + shipping + donation)
	const totalTTC = roundEuro(productsTTC + shippingTTC + donationTTC)

	// Calculate HT and VAT (20%)
	const totalHT = roundEuro(totalTTC / 1.20)
	const totalTVA = roundEuro(totalTTC - totalHT)
	const productsHT = roundEuro(productsTTC / 1.20)

	return {
		productsTTC,
		productsHT,
		shippingTTC,
		donationTTC,
		totalHT,
		totalTVA,
		totalTTC,
		totalItems,
		// Amount in cents for payment API
		amountInCents: Math.round(totalTTC * 100),
	}
}

/**
 * Format price for display (French locale)
 */
export function formatPrice(amount) {
	return `${amount.toFixed(2).replace('.', ',')} €`
}
