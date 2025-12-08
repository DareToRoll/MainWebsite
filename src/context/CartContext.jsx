import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
	const [items, setItems] = useState({}) // { [gameId]: quantity }
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [hintVisible, setHintVisible] = useState(false)

	const addItem = (gameId, quantity = 1) => {
		setItems((prev) => ({
			...prev,
			[gameId]: (prev[gameId] || 0) + quantity,
		}))
		setHintVisible(true)
	}

	const setItemQuantity = (gameId, quantity) => {
		setItems((prev) => {
			if (!quantity || quantity <= 0) {
				const { [gameId]: _, ...rest } = prev
				return rest
			}
			return { ...prev, [gameId]: quantity }
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