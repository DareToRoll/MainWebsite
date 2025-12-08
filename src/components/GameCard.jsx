import { Link } from 'react-router-dom'

const GameCard = ({ game, onAddToCart }) => {
	const playersText =
		game.players.min === game.players.max
			? `${game.players.min} joueurs`
			: `${game.players.min}–${game.players.max} joueurs`

	const durationText =
		game.duration.min === game.duration.max
			? `${game.duration.min} min`
			: `${game.duration.min}–${game.duration.max} min`

	const categoryLabel =
		game.category.charAt(0).toUpperCase() + game.category.slice(1)

	const handleAddClick = () => {
		onAddToCart(game.id)
	}

	return (
		<article className="card game-card">
			<Link to={`/shop/${game.slug}`} className="game-card-main">
				<div className="game-card-image-placeholder">
					<span>Visuel du jeu à venir</span>
				</div>

                {/* <header className="game-card-header">
                    {game.status === 'preorder' && (
                        <span className="badge game-card-badge">Précommande</span>
                    )}
                </header> */}

				<h3 className="game-card-title">{game.title}</h3>

				<p className="game-card-short">{game.shortDescription}</p>
			</Link>

			<p className="game-card-meta">
				<span>{playersText}</span>
				<span>{durationText}</span>
				<span>{categoryLabel}</span>
			</p>

			<footer className="game-card-footer">
				<div className="game-card-price-block">
					<div className="game-card-price">{game.price}</div>
					<div className="game-card-price-note">TTC</div>
				</div>
				<button
					type="button"
					className="btn btn-ghost game-card-btn"
					onClick={handleAddClick}
				>
					Ajouter au panier
				</button>
			</footer>
		</article>
	)
}

export default GameCard;