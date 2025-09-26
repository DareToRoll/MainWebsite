import styles from './NotFound.module.css';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import { motion } from "framer-motion";
import langue from './language/langue';

const NotFound = props => {
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
    landingPage,
    openGamePage
  } = props;
  const location = useLocation();

  const animations = {
    initial: { opacity: 0, y: -225 },
    animate: { opacity: 1, y: 0, transition: { y: { type: "spring", duration: 1.5, bounce: 0.5 }} },
    exit: { opacity: 0, y: -175, transition: { y: { type: "tween", duration: 0.675, bounce: 0.5 }, opacity: { type: "tween", duration: 0.675 }} },
  }

  const progress = {
    initial: { width: 0 },
    animate: { width: 700, transition: { width: { type: "tween", duration: 7 }} },
  }

  useEffect(() => {
    setTimeout(handleHome, 6800);
  }, [handleHome])

  return (
    <div className={styles.notFound}>
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
        landingPage={landingPage}
        />

        <motion.div className={styles.container} variants={animations} initial="initial" animate="animate" exit="exit">
            <div className={styles.notFoundContent}>
              <img className={styles.notFoundImg} src={require("../../Resources/image/404.png")} alt="Not Found Warning" />
              <div className={styles.notFoundText}>
                  <h2>{langue[lang].title}</h2>
                  <p>{langue[lang].desc}</p>
              </div>
            </div>
            <motion.div className={styles.progressBar} variants={progress} initial="initial" animate="animate"></motion.div>
        </motion.div>
    </div>
  );
}
  
  export default NotFound;