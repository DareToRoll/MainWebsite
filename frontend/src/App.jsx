import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Shop from './pages/Shop'
import About from './pages/About'
import Contact from './pages/Contact'
import GameDetails from './pages/GameDetails'
import Auth from './pages/Auth'
import ConfirmPurchase from './pages/ConfirmPurchase'
import PaymentResult from './pages/PaymentResult'
import ConditionsGeneralesDeVente from './pages/ConditionsGeneralesDeVente'

function App() {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/shop" element={<Shop />} />
				<Route path="/shop/:slug" element={<GameDetails />} />
				<Route path="/about" element={<About />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/login" element={<Auth />} />
				<Route path="/auth" element={<Auth />} />
				<Route path="/confirm-purchase" element={<ConfirmPurchase />} />
				<Route path="/payment-result" element={<PaymentResult />} />
				<Route
					path="/conditions-generales-de-vente"
					element={<ConditionsGeneralesDeVente />}
				/>
			</Routes>
		</Layout>
	)
}

export default App;