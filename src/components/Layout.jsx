import Header from './Header'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import '../styles/layout.css'

const Layout = ({ children }) => {
	return (
		<div className="layout">
			<Header />
			<CartDrawer />
			<main className="main-content">
				<div className="main-inner">
					{children}
				</div>
			</main>
			<Footer />
		</div>
	)
}

export default Layout;