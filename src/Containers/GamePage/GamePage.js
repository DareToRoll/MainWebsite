import styles from './GamePage.module.css';
import React, { useState } from 'react';
import AnimatedGamePage from '../AnimatedPage/AnimatedGamePage';
import NavBar from '../../Components/NavBar/NavBar';
import { ReactComponent as Arrow } from "../../Resources/image/arrow.svg";
import Slider from '../../Components/Slider/Slider';
import Button from '@mui/material/Button';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LanguageIcon from '@mui/icons-material/Language';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import langue from './language/langue';

const GamePage = props => {
  const {
    seed,
    lang,
    updateLang,
    cart,
    handleSelectGame,
    addToCart,
    removeFromCart,
    clearCart,
    handleHome,
    handleGame,
    handleMap,
    handleCalendar,
    handleContact,
    landingPage,
    selectedGame,
    setSelectedGame,
    allGames,
    openGamePage
  } = props;
  const navigate = useNavigate();
  const [carouselState, setCarouselState] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const sendToCart = () => {
    if (selectedGame) {
      let price = selectedGame.price * quantity;
      price = Math.round(price * 100) / 100;
      const gameToAdd = {
        game: selectedGame,
        quantity: quantity,
        totalPrice: price
      }
      addToCart(gameToAdd);
    }
  }
  
  return (
    <>
        <div className={styles.gamepage}>
            <NavBar
              seed={seed}
              lang={lang}
              updateLang={updateLang}
              cart={cart}
              handleSelectGame={handleSelectGame}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              handleHome={handleHome}
              handleGame={handleGame}
              handleMap={handleMap}
              handleCalendar={handleCalendar}
              handleContact={handleContact}
              landingPage={landingPage}
            />

            <AnimatedGamePage>
              <div className={styles.gamepageContent}>
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
                    <h1>{selectedGame ? selectedGame.name : '?'}</h1>
                </header>

                <section className={styles.game}>
                  {<Slider 
                    selectedGame={selectedGame}
                    setSelectedGame={setSelectedGame}
                    allGames={allGames}
                    carouselState={carouselState}
                    setCarouselState={setCarouselState}
                  />}
                  <div className={styles.gameInfo}>
                    <div className={styles.about}>
                      <div className={styles.aboutTop}>
                        <h2>{langue[lang].description}</h2>
                        <p style={{marginBottom: "15px"}}>{selectedGame ? selectedGame.text[lang].desc : '?'}</p>
                        <h2>{langue[lang].howto}</h2>
                        <p>{selectedGame ? selectedGame.text[lang].howto : '?'}</p>
                        <h3>{langue[lang].tech}:</h3>
                        <div>
                          <h4>{langue[lang].date}: {selectedGame ? selectedGame.release : '?'}</h4>
                          <h4>{langue[lang].creator}: {selectedGame ? selectedGame.Createur : '?'}</h4>
                          <h4>{langue[lang].illustration}: {selectedGame ? selectedGame.Illustration : '?'}</h4>
                          <h4>{langue[lang].test}: {selectedGame ? selectedGame.Testeur : '?'}</h4>
                          <h4>{langue[lang].edit}: {selectedGame ? selectedGame.Editeur : '?'}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <div className={styles.bottomGamePage}>
                  <div className={styles.infoComp}>
                    <Tooltip title={langue[lang].nbplayer} className={styles.tooltip}>
                      <PeopleIcon className={styles.iconInfo} />
                      <h3 className={styles.textInfo}>{selectedGame ? selectedGame.text[lang].nbgamer : '?'}</h3>
                    </Tooltip >
                    <Tooltip title={langue[lang].timeplay} className={styles.tooltip}>
                      <AccessTimeIcon className={styles.iconInfo} />
                      <h3 className={styles.textInfo}>{selectedGame ? selectedGame.text[lang].timegames : '?'}</h3>
                    </Tooltip>
                    <Tooltip title={langue[lang].age} className={styles.tooltip}>
                      <EscalatorWarningIcon className={styles.iconInfo} />
                      <h3 className={styles.textInfo}>{selectedGame ? selectedGame.text[lang].age : '?'}</h3>
                    </Tooltip>
                    <Tooltip title={langue[lang].langue} className={styles.tooltip}>
                      <LanguageIcon className={styles.iconInfo} />
                      <h3 className={styles.textInfo}>{selectedGame ? selectedGame.text[lang].Language : '?'}</h3>
                    </Tooltip>
                  </div>
                  <div className={styles.buy}>
                      <div className={styles.infos}>
                          <h3>{selectedGame ? selectedGame.price : '?'} €</h3>
                      </div>
                      <Box sx={{ '& > :not(style)': { m: 1 }, display: 'flex', justifyContent: 'center' }}>
                        <Fab size="small" color="error" aria-label="less" onClick={() => {if (quantity > 1) setQuantity(quantity - 1)}}>
                          <RemoveIcon />
                        </Fab>
                        <p className={styles.quantity}>{quantity}</p>
                        <Fab size="small" color="info" aria-label="add" onClick={() => setQuantity(quantity + 1)}>
                          <AddIcon />
                        </Fab>
                      </Box>
                      <Button
                        component="label"
                        onClick={sendToCart}
                        role={undefined}
                        variant="contained"
                        style={{fontFamily: "GT Medium", fontSize: "17px"}}
                        tabIndex={-1}
                        startIcon={<ShoppingCartIcon />}
                      >
                        {langue[lang].add}
                      </Button>
                    </div>
                  </div>
              </div>
            </AnimatedGamePage>
        </div>
    </>
  );
}

export default GamePage;