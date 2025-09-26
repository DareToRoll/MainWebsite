import styles from './Map.module.css';
import React from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import langue from './language/langue';

const Map = props => {
  const {
    seed,
    lang,
    updateLang,
    cart,
    removeFromCart,
    clearCart,
    handleSelectGame,
    handleHome,
    handleGame,
    handleMap,
    handleCalendar,
    handleContact,
  } = props;
  
  return (
    <>
      <NavBar
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
        />
    </>
  );
}

export default Map;