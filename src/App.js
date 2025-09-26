import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import GamePage from './Containers/GamePage/GamePage';
import Games from './Containers/Games/Games';
import Map from './Containers/Map/Map';
import Calendar from './Containers/Calendar/Calendar';
import Contact from './Containers/Contact/Contact';
import NotFound from './Containers/NotFound/NotFound';
import Home from './Containers/Home/Home';
import { AnimatePresence } from "framer-motion";
import games from './utils/games';

function App() {
  const [allGames, setAllGames] = useState(games);
  const [selectedGame, setSelectedGame] = useState(false);
  const [lang, setLang] = useState('en');
  const [cart, setCart] = useState({games: [], quantity: 0, totalPrice: 0.00});
  const [seed, resetCart] = useState(1);

const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
  if (location.pathname !== "/dare-to-roll/" && selectedGame === false) {
    let surname = location.pathname.substring(7);
    let currentGame = games.find(game => game.surname === surname);
    if (currentGame !== undefined) {
      setSelectedGame(currentGame);
    }
  }
}, [location.pathname, selectedGame]);

const addToCart = (gameToAdd) => {
  const index = cart.games.findIndex(game => game.game === gameToAdd.game);
  let newCart = { ...cart, games: [...cart.games] };
  //cas où le jeu est déjà dans le panier
  if (index !== -1) {
    newCart.quantity -= cart.games[index].quantity;
    newCart.totalPrice -= cart.games[index].totalPrice;
    newCart.games[index] = gameToAdd;
  } else {
    newCart.games.push(gameToAdd);
  }
  newCart.quantity += gameToAdd.quantity;
  newCart.totalPrice += gameToAdd.totalPrice;
  newCart.totalPrice = Math.round(newCart.totalPrice * 100) / 100;
  setCart(newCart);
  resetCart(Math.random());
}

const removeFromCart = (gameID) => {
  if (cart.games[gameID]){
    let newCart = { ...cart, games: [...cart.games] };
    if (newCart.games[gameID].quantity !== 0)
      newCart.quantity -= newCart.games[gameID].quantity;
    if (newCart.games[gameID].price !== 0) {
      newCart.totalPrice -= newCart.games[gameID].totalPrice;
      newCart.totalPrice = Math.round(newCart.totalPrice * 100) / 100;
    }
    newCart.games.splice(gameID, 1);
    setCart(newCart);
    resetCart(Math.random());
  }
}

const clearCart = () => {
  setCart({games: [], quantity: 0, totalPrice: 0});
  resetCart(Math.random());
}

const updateLang = (langue) => {
  setLang(langue);
}

const handleHome = () => {
  navigate('/dare-to-roll/');
}

const handleGame = () => {
  navigate('/games/');
}

const handleMap = () => {
  navigate('/world/');
}

const handleCalendar = () => {
  navigate('/calendar/');
}

const handleContact = () => {
  navigate('/contact/');
}

const handleSelectGame = (gameid) => {
  navigate(`/games/${games[gameid].surname}`);
  setSelectedGame(games[gameid]);
}

const openGamePage = (e) => {
  let selectedGameSurname = e.target.id;
  navigate(`/games/${selectedGameSurname}`);
}

  return (
      <>
        <video autoPlay muted loop className="globalVideo">
          <source src={require("./Resources/image/HomePageVideo.webm")} type="video/webm" />
        </video>
        <AnimatePresence mode="wait">
          <Routes key={location.pathname} location={location}>
            <Route path="/dare-to-roll/" element={<Home
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
              handleSelectGame={handleSelectGame}
              openGamePage={openGamePage}
            />} />
            <Route path="/games/:gameId" element={<GamePage
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleSelectGame={handleSelectGame} 
              selectedGame={selectedGame}
              setSelectedGame={setSelectedGame}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
              allGames={allGames}
              openGamePage={openGamePage}
          />} />
            <Route path="/games/" element={<Games
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleSelectGame={handleSelectGame} 
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
            />} />
            <Route path="/world/" element={<Map
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleSelectGame={handleSelectGame}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
            />} />
            <Route path="/calendar/" element={<Calendar
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              handleSelectGame={handleSelectGame}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
            />} />
            <Route path="/contact/" element={<Contact
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              handleSelectGame={handleSelectGame}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
            />} />
            <Route path="*" element={<NotFound
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
              openGamePage={openGamePage}
            />} />
          </Routes>
        </AnimatePresence>
      </>
  );
}

export default App;
