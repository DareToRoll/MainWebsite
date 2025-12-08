import { useState, useMemo } from 'react'
import catalog from '../content/catalog.json'
import { useCart } from '../context/CartContext'

const formatPrice = (amount) =>
	`${amount.toFixed(2).replace('.', ',')} €`

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

	const [pendingRemoveId, setPendingRemoveId] = useState(null)

	const entries = Object.entries(items) // [ [gameId, quantity], ... ]
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

	const handleDecrement = (gameId, currentQuantity) => {
		if (currentQuantity > 1) {
			setItemQuantity(gameId, currentQuantity - 1)
		} else if (currentQuantity === 1) {
			setPendingRemoveId(gameId)
		}
	}

	const handleIncrement = (gameId, currentQuantity) => {
		setItemQuantity(gameId, currentQuantity + 1)
	}

	const handleConfirmRemove = () => {
		if (pendingRemoveId) {
			removeItem(pendingRemoveId)
			setPendingRemoveId(null)
		}
	}

	const handleCancelRemove = () => {
		setPendingRemoveId(null)
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

								const isPendingRemoval = pendingRemoveId === gameId

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

										<div className="cart-drawer-item-qty">
											{!isPendingRemoval ? (
												<>
													<label>Quantité</label>
													<div className="cart-qty-stepper">
														<button
															type="button"
															onClick={() =>
																handleDecrement(
																	gameId,
																	quantity,
																)
															}
															aria-label="Diminuer la quantité"
														>
															−
														</button>
														<span>{quantity}</span>
														<button
															type="button"
															onClick={() =>
																handleIncrement(
																	gameId,
																	quantity,
																)
															}
															aria-label="Augmenter la quantité"
														>
															+
														</button>
													</div>
												</>
											) : (
												<div className="cart-remove-confirm">
													<p>Retirer ce jeu du panier&nbsp;?</p>
													<div className="cart-remove-actions">
														<button
															type="button"
															onClick={handleCancelRemove}
														>
															Annuler
														</button>
														<button
															type="button"
															onClick={handleConfirmRemove}
														>
															Retirer
														</button>
													</div>
												</div>
											)}
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

export default CartDrawer;