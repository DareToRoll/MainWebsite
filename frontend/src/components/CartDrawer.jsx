import { useMemo } from 'react'
import catalog from '../content/catalog.json'
import { useCart } from '../context/CartContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './CartDrawer.css'

const formatPrice = (amount) =>
	`${amount.toFixed(2).replace('.', ',')} €`

const MAX_QUANTITY = 99
const MIN_QUANTITY = 1

const CartDrawer = () => {
	const {
		items,
		isCartOpen,
		closeCart,
		setItemQuantity,
		clearCart,
		totalItems,
		removeItem,
	} = useCart()

	const entries = Object.entries(items)
	const gamesById = useMemo(
		() => new Map(catalog.games.map((g) => [g.id, g])),
		[],
	)

	const hasItems = entries.length > 0

	const totalPrice = useMemo(
		() =>
			entries.reduce((sum, [gameId, quantity]) => {
				const game = gamesById.get(gameId)
				if (!game || typeof game.priceValue !== 'number') return sum
				return sum + game.priceValue * quantity
			}, 0),
		[entries, gamesById],
	)

	const handleQuantityChange = (gameId, value) => {
		const quantity = Number.parseInt(value, 10)
		
		if (Number.isNaN(quantity) || quantity < MIN_QUANTITY) {
			// If invalid or less than min, remove item
			removeItem(gameId)
			return
		}

		if (quantity > MAX_QUANTITY) {
			// Cap at max quantity
			setItemQuantity(gameId, MAX_QUANTITY)
			return
		}

		setItemQuantity(gameId, quantity)
	}

	const handleDecrement = (gameId, currentQuantity) => {
		if (currentQuantity > MIN_QUANTITY) {
			setItemQuantity(gameId, currentQuantity - 1)
		} else {
			// Remove if quantity would be 0
			removeItem(gameId)
		}
	}

	const handleIncrement = (gameId, currentQuantity) => {
		if (currentQuantity < MAX_QUANTITY) {
			setItemQuantity(gameId, currentQuantity + 1)
		}
		// If at max, do nothing (could show a message, but keeping it simple)
	}

	const handleRemove = (gameId) => {
		removeItem(gameId)
	}

	const handleCheckout = () => {
		// TODO: intégrer un vrai flux de paiement plus tard
		console.log('Confirmer l’achat avec', totalItems, 'article(s)')
	}

	return (
		<>
			<div
				className={
					isCartOpen
						? 'cart-backdrop cart-backdrop-visible'
						: 'cart-backdrop'
				}
				onClick={closeCart}
			/>

			<aside
				className={
					isCartOpen ? 'cart-drawer cart-drawer-open' : 'cart-drawer'
				}
				aria-hidden={!isCartOpen}
			>
				<header className="cart-drawer-header">
					<h2>Panier</h2>
					<button
						type="button"
						className="cart-drawer-close"
						onClick={closeCart}
						aria-label="Fermer le panier"
					>
						×
					</button>
				</header>

				<div className="cart-drawer-body">
					{!hasItems ? (
						<p className="cart-drawer-empty">
							Votre panier est vide pour le moment.
						</p>
					) : (
						<ul className="cart-drawer-list">
							{entries.map(([gameId, quantity]) => {
								const game = gamesById.get(gameId)
								if (!game) return null

								return (
									<li key={gameId} className="cart-drawer-item">
										<div className="cart-drawer-item-main">
											<p className="cart-drawer-item-title">
												{game.title}
											</p>
											<p className="cart-drawer-item-price">
												{game.price}
												<span className="cart-drawer-item-ttc">
													TTC
												</span>
											</p>
										</div>

										<div className="cart-drawer-item-right">
											<div className="cart-drawer-item-qty">
												<label htmlFor={`qty-${gameId}`}>Quantité</label>
												<div className="cart-qty-stepper">
													<button
														type="button"
														onClick={() => handleDecrement(gameId, quantity)}
														aria-label="Diminuer la quantité"
													>
														−
													</button>
													<input
														id={`qty-${gameId}`}
														type="number"
														className="cart-qty-input"
														min={MIN_QUANTITY}
														max={MAX_QUANTITY}
														value={quantity}
														onChange={(e) => handleQuantityChange(gameId, e.target.value)}
														aria-label="Quantité souhaitée"
													/>
													<button
														type="button"
														onClick={() => handleIncrement(gameId, quantity)}
														disabled={quantity >= MAX_QUANTITY}
														aria-label="Augmenter la quantité"
													>
														+
													</button>
												</div>
											</div>

											<button
												type="button"
												className="cart-item-remove-icon"
												onClick={() => handleRemove(gameId)}
												aria-label="Retirer ce jeu du panier"
											>
												<FontAwesomeIcon icon={faTrash} />
											</button>
										</div>
									</li>
								)
							})}
						</ul>
					)}
				</div>

				<footer className="cart-drawer-footer">
					<div className="cart-drawer-footer-row">
						<p className="cart-drawer-total">
							Total&nbsp;: {formatPrice(totalPrice)} ·{' '}
							{totalItems}{' '}
							{totalItems <= 1 ? 'article' : 'articles'}
						</p>
						<button
							type="button"
							className="btn btn-primary cart-checkout-btn"
							onClick={handleCheckout}
							disabled={!hasItems}
						>
							Confirmer l&apos;achat
						</button>
					</div>

					{hasItems && (
						<button
							type="button"
							className="cart-drawer-clear"
							onClick={clearCart}
						>
							Vider le panier
						</button>
					)}
				</footer>
			</aside>
		</>
	)
}

export default CartDrawer
