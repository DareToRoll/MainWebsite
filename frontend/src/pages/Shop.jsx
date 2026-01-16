import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import catalog from '../content/catalog.json'
import GameCard from '../components/GameCard'
import { useCart } from '../context/CartContext'
import './Shop.css'

const games = catalog.games

export default function Shop() {
	const [searchParams, setSearchParams] = useSearchParams()
	const initialSearch = searchParams.get('q') || ''
	const [searchTerm, setSearchTerm] = useState(initialSearch)
	const [debouncedSearchTerm] = useDebounce(searchTerm, 300)
	const { addItem } = useCart()

	// Sync debounced search term with URL
	useEffect(() => {
		if (debouncedSearchTerm.trim()) {
			setSearchParams({ q: debouncedSearchTerm.trim() }, { replace: true })
		} else {
			setSearchParams({}, { replace: true })
		}
	}, [debouncedSearchTerm, setSearchParams])

	const handleSearchChange = (event) => {
		setSearchTerm(event.target.value)
	}

	const handleAddToCart = (gameId) => {
		addItem(gameId, 1)
	}

	const normalizedSearch = debouncedSearchTerm.trim().toLowerCase()

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

			{/* Search temporarily disabled - only one game in catalog */}
			{/* <div className="shop-toolbar">
				<div className="shop-search">
					<label htmlFor="shop-search-input">Rechercher un jeu</label>
					<input
						id="shop-search-input"
						type="text"
						value={searchTerm}
						onChange={handleSearchChange}
						placeholder="Rechercher par titre, description..."
					/>
				</div>
			</div> */}

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