import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import catalog from '../content/catalog.json'
import { useCart } from '../context/CartContext'
import './GameDetails.css'

export default function GameDetails() {
	const { slug } = useParams()
	const navigate = useNavigate()
	const { addItem } = useCart()

	const game = useMemo(
		() => catalog.games.find((g) => g.slug === slug),
		[slug],
	)

	if (!game) {
		return (
			<section className="page game-page">
				<button
					type="button"
					className="link-back"
					onClick={() => navigate('/shop')}
				>
					← Revenir à la liste des jeux
				</button>
				<p>Ce jeu n&apos;existe pas ou n&apos;est plus disponible.</p>
			</section>
		)
	}

	const playersText =
		game.players.min === game.players.max
			? `${game.players.min} joueurs`
			: `${game.players.min}–${game.players.max} joueurs`

	const durationText =
		game.duration.min === game.duration.max
			? `${game.duration.min} min`
			: `${game.duration.min}–${game.duration.max} min`

	const ageText = `À partir de ${game.age} ans`
	const categoryLabel =
		game.category.charAt(0).toUpperCase() + game.category.slice(1)

	const handleAddToCart = () => {
		addItem(game.id, 1)
	}

	return (
		<section className="page game-page">
			<button
				type="button"
				className="link-back"
				onClick={() => navigate("/shop")}
			>
				← Revenir aux jeux
			</button>

			{/* GRAND CAROUSEL PLEINE LARGEUR */}
			<div className="game-detail-carousel">
				<div className="game-detail-carousel-placeholder">
					<span>Carousel d&apos;images du jeu à venir</span>
				</div>
			</div>

			{/* INFOS DÉTAILLÉES */}
			<div className="game-detail-info">
				<header className="game-detail-header">
					<div className="game-detail-title-row">
						<h1 className="page-title game-detail-title">
							{game.title}
						</h1>

						<div className="game-detail-badges">
							{game.status === 'preorder' && (
								<span className="badge game-detail-badge">
									Précommande
								</span>
							)}
							{game.isFeatured && (
								<span className="badge">
									Jeu vedette
								</span>
							)}
						</div>
					</div>

					<p className="page-subtitle game-detail-subtitle">
						{game.shortDescription}
					</p>
				</header>

				<div className="game-detail-price-meta">
					<div><span className="game-detail-price">{game.price}</span> <small>TTC</small></div>
					<div className="game-detail-meta">
						<span>{playersText}</span>
						<span>{durationText}</span>
						<span>{ageText}</span>
						<span>{categoryLabel}</span>
					</div>
				</div>

				{/* {game.tags && game.tags.length > 0 && (
					<div className="game-detail-tags">
						{game.tags.map((tag) => (
							<span key={tag} className="game-detail-tag">
								{tag}
							</span>
						))}
					</div>
				)} */}

				<div className="game-detail-actions">
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleAddToCart}
					>
						Ajouter au panier
					</button>
				</div>

				<section className="game-detail-section">
					<h2>Plongez dans l&apos;aventure</h2>
					<p>{game.longDescription}</p>
				</section>

				<section className="game-detail-section game-detail-facts">
					<h2>En résumé</h2>
					<ul>
						<li>Nombre de joueurs : {playersText}</li>
						<li>Durée d&apos;une partie : {durationText}</li>
						<li>Âge recommandé : {ageText}</li>
						<li>Type de jeu : {categoryLabel}</li>
					</ul>
				</section>
			</div>
		</section>
	)
}