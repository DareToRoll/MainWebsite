import { createContext, useContext, useMemo, useState, useEffect } from 'react'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'dtr_cart'

// Load cart from localStorage
const loadCartFromStorage = () => {
	try {
		const stored = localStorage.getItem(CART_STORAGE_KEY)
		if (stored) {
			return JSON.parse(stored)
		}
	} catch (error) {
		console.error('Error loading cart from localStorage:', error)
	}
	return {}
}

// Save cart to localStorage
const saveCartToStorage = (items) => {
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
	} catch (error) {
		console.error('Error saving cart to localStorage:', error)
	}
}

export const CartProvider = ({ children }) => {
	const [items, setItems] = useState(() => loadCartFromStorage()) // { [gameId]: quantity }
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [hintVisible, setHintVisible] = useState(false)

	// Save cart to localStorage whenever items change
	useEffect(() => {
		saveCartToStorage(items)
	}, [items])

	// Hide hint when cart opens
	useEffect(() => {
		if (isCartOpen) {
			setHintVisible(false)
		}
	}, [isCartOpen])

	const addItem = (gameId, quantity = 1) => {
		setItems((prev) => {
			// Idempotent: if item already exists, leave quantity unchanged
			// Only add if item is not present in cart
			if (prev[gameId] !== undefined) {
				return prev // No change if already in cart
			}
			// First time adding: set quantity to specified value (default 1)
			return {
				...prev,
				[gameId]: quantity,
			}
		})
		setHintVisible(true)
	}

	const setItemQuantity = (gameId, quantity) => {
		setItems((prev) => {
			const clampedQuantity = Math.max(1, quantity || 1)
			return { ...prev, [gameId]: clampedQuantity }
		})
	}

	const removeItem = (gameId) => {
		setItems((prev) => {
			const { [gameId]: _, ...rest } = prev
			return rest
		})
	}

	const clearCart = () => setItems({})

	const openCart = () => setIsCartOpen(true)
	const closeCart = () => setIsCartOpen(false)
	const toggleCart = () => setIsCartOpen((prev) => !prev)

	const hideHint = () => setHintVisible(false)

	const totalItems = useMemo(
		() => Object.values(items).reduce((sum, q) => sum + q, 0),
		[items],
	)

	const value = {
		items,
		addItem,
		setItemQuantity,
		removeItem,
		clearCart,
		totalItems,
		isCartOpen,
		openCart,
		closeCart,
		toggleCart,
		hintVisible,
		hideHint,
	}

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
	const ctx = useContext(CartContext)
	if (!ctx) {
		throw new Error('useCart must be used within a CartProvider')
	}
	return ctx;
}