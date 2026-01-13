import { useState } from 'react'
import catalog from '../content/catalog.json'
import GameCard from '../components/GameCard'
import { useCart } from '../context/CartContext'
import './Shop.css'

const games = catalog.games

export default function Shop() {
	const [searchTerm, setSearchTerm] = useState('')
	const { totalItems, addItem } = useCart()

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value)
	}

	const handleAddToCart = (gameId) => {
		addItem(gameId, 1)
	}

	const normalizedSearch = searchTerm.trim().toLowerCase()

	const filteredGames = games.filter((game) => {
		if (!normalizedSearch) return true

		const haystack = (
			game.title +
			' ' +
			game.shortDescription +
			' ' +
			game.longDescription
		).toLowerCase()

		return haystack.includes(normalizedSearch)
	})

	return (
		<section className="page shop-page">
			<header className="page-header shop-header">
				<div>
					<h1 className="page-title">Nos jeux de société</h1>
					<p className="page-subtitle">
						Voici nos créations, toutes nées à Monaco dans notre petit studio. Le catalogue
						grandit au gré de nos découvertes et des idées qui nous trottent dans la tête.
					</p>
				</div>
			</header>

			{filteredGames.length === 0 ? (
				<div className="shop-empty">
					<p>
						Oups, aucun jeu ne correspond à votre recherche. Essayez d&apos;autres mots-clés
						ou réinitialisez le champ de recherche — nos jeux ne demandent qu&apos;à être découverts !
					</p>
				</div>
			) : (
				<div className="grid grid-3 shop-grid">
					{filteredGames.map((game) => (
						<GameCard
							key={game.id}
							game={game}
							onAddToCart={handleAddToCart}
						/>
					))}
				</div>
			)}
		</section>
	)
}