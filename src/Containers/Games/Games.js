import styles from './Games.module.css';
import React from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import AnimatedGamePage from '../AnimatedPage/AnimatedGamePage';
import games from '../../utils/games';
import CardCatalogue from '../../Components/CardCatalogue/CardCatalogue';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { ReactComponent as Arrow } from "../../Resources/image/arrow.svg";
import { useNavigate } from 'react-router-dom';
import langue from './language/langue';

const Games = props => {
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

  const navigate = useNavigate();
  
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
      <AnimatedGamePage>
        <div className={styles.catalogue}>
          <div className={styles.game}>
          <header>
            <button 
              style={{ color: "#cccccc" }} 
              className={styles.goBack}
              onClick={() => navigate(-1)}
              id="19"
              aria-label='Back'
            >
                <Arrow style={{ fill: "#cccccc" }} className={styles.arrow} />
            </button>
            <h1>{langue[lang].title}</h1>
          </header>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2} sx={{ justifyContent: "space-around" }}>
                {games.map((game, index) => (
                  <Grid>
                    <CardCatalogue
                      lang={lang}
                      game={game}
                      key={"game_" + index} 
                      handleSelectGame={handleSelectGame}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </div>
        </div>
      </AnimatedGamePage>
    </>
  );
}

export default Games;