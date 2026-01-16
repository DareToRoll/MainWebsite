import { NavLink } from 'react-router-dom'
import './Header.css'
import cartIcon from '../assets/image/shoppingcart.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { useCart } from '../context/CartContext'
import DtrLogo from '../assets/image/LogoDtrWhite.png';

const Header = () => {
	const { totalItems, toggleCart, hintVisible, hideHint } = useCart();

	return (
		<header className="header">
			<div className="header-inner">
				<div className="header-left">
					<NavLink to="/" end className="logo">
						<img src={DtrLogo} alt="DTR Logo" />
					</NavLink>
				</div>

				<nav className="nav header-nav">
					<NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
						Accueil
					</NavLink>
					<NavLink to="/shop" className={({ isActive }) => (isActive ? 'active' : '')}>
						Nos jeux
					</NavLink>
					<NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
						À propos
					</NavLink>
					<NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
						Contact
					</NavLink>
				</nav>

				<div className="header-right">
					{/* <NavLink
						to="/login"
						className="header-icon-button account-button"
						aria-label="Connexion"
					>
						<FontAwesomeIcon icon={faRightToBracket} />
					</NavLink> */}

					<div className="cart-wrapper">
						<button
							type="button"
							className="header-icon-button cart-button"
							aria-label="Voir le panier"
							onClick={toggleCart}
						>
							<img src={cartIcon} alt="" />
						</button>

						{totalItems > 0 && (
							<span className="cart-badge">{totalItems}</span>
						)}

						{hintVisible && totalItems > 0 && (
							<div className="cart-hint cart-hint-visible">
								<p>La quantité est modifiable directement dans le panier.</p>
								<button
									type="button"
									onClick={hideHint}
									className="cart-hint-close"
								>
									×
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}

export default Header;