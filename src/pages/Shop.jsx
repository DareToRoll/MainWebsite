import { useState } from 'react'
import catalog from '../content/catalog.json'
import GameCard from '../components/GameCard'
import { useCart } from '../context/CartContext'

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
						Retrouvez ici les créations Dare to Roll, imaginées et développées à
						Monaco. Notre catalogue s&apos;enrichira au fil de nos nouvelles
						aventures ludiques.
					</p>
				</div>
			</header>

			{filteredGames.length === 0 ? (
				<div className="shop-empty">
					<p>
						Aucun jeu ne correspond à votre recherche pour le moment. Essayez un
						autre mot-clé ou réinitialisez le champ de recherche.
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