import { useState, useMemo } from 'react'
import catalog from '../content/catalog.json'
import { useCart } from '../context/CartContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import './CartDrawer.css'

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
	const [draftQuantities, setDraftQuantities] = useState({})

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

	const syncDraftWithQuantity = (gameId, quantity) => {
		setDraftQuantities((prev) => ({
			...prev,
			[gameId]: String(quantity),
		}))
	}

	const handleDecrement = (gameId, currentQuantity) => {
		if (currentQuantity > 1) {
			const next = currentQuantity - 1
			setItemQuantity(gameId, next)
			syncDraftWithQuantity(gameId, next)
		} else if (currentQuantity === 1) {
			setPendingRemoveId(gameId)
		}
	}

	const handleIncrement = (gameId, currentQuantity) => {
		const next = currentQuantity + 1
		setItemQuantity(gameId, next)
		syncDraftWithQuantity(gameId, next)
	}

	const handleDraftChange = (gameId, event) => {
		const value = event.target.value
		setDraftQuantities((prev) => ({
			...prev,
			[gameId]: value,
		}))
	}

	const commitDraft = (gameId, currentQuantity) => {
		const raw = draftQuantities[gameId]
		if (raw == null) return

		const trimmed = raw.trim()
		const parsed = Number.parseInt(trimmed, 10)

		if (Number.isNaN(parsed)) {
			// revient à la quantité actuelle
			syncDraftWithQuantity(gameId, currentQuantity)
			return
		}

		if (parsed >= 1) {
			setItemQuantity(gameId, parsed)
			syncDraftWithQuantity(gameId, parsed)
		} else if (parsed === 0) {
			// on ne supprime pas brutalement : on passe par la confirmation
			setPendingRemoveId(gameId)
			syncDraftWithQuantity(gameId, currentQuantity)
		} else {
			// valeurs négatives : ignore et revient à l'état courant
			syncDraftWithQuantity(gameId, currentQuantity)
		}
	}

	const handleDraftKeyDown = (gameId, currentQuantity, event) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			commitDraft(gameId, currentQuantity)
		}
	}

	const handleTrashClick = (gameId) => {
		setPendingRemoveId(gameId)
	}

	const handleConfirmRemove = () => {
		if (pendingRemoveId) {
			removeItem(pendingRemoveId)
			setDraftQuantities((prev) => {
				// suppression du draft associé
				const { [pendingRemoveId]: _, ...rest } = prev
				return rest
			})
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
								const draftValue =
									draftQuantities[gameId] ?? String(quantity)

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
															<input
																type="text"
																className="cart-qty-input"
																value={draftValue}
																onChange={(e) =>
																	handleDraftChange(
																		gameId,
																		e,
																	)
																}
																onBlur={() =>
																	commitDraft(
																		gameId,
																		quantity,
																	)
																}
																onKeyDown={(e) =>
																	handleDraftKeyDown(
																		gameId,
																		quantity,
																		e,
																	)
																}
																inputMode="numeric"
																aria-label="Quantité souhaitée"
															/>
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
														<p>
															Retirer ce jeu du panier&nbsp;?
														</p>
														<div className="cart-remove-actions">
															<button
																type="button"
																onClick={
																	handleCancelRemove
																}
															>
																Annuler
															</button>
															<button
																type="button"
																onClick={
																	handleConfirmRemove
																}
															>
																Retirer
															</button>
														</div>
													</div>
												)}
											</div>

											<button
												type="button"
												className="cart-item-remove-icon"
												onClick={() =>
													handleTrashClick(gameId)
												}
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

export default CartDrawer;