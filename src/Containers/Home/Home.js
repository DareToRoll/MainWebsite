import React from 'react';
import styles from './Home.module.css';
import NavBar from '../../Components/NavBar/NavBar';
import games from '../../utils/games';
import events from '../../utils/events';
import Card from '../../Components/Card/Card';
import EventsCard from '../../Components/EventsCard/EventsCard';
import monaco from "../../Resources/image/monaco.png";
import europe from "../../Resources/image/european-union.png";
import Tooltip from '@mui/material/Tooltip';
import langue from './language/langue';

const Home = props => {
  const {
    seed,
    lang,
    updateLang,
    cart,
    removeFromCart,
    clearCart,
    handleHome,
    handleGame,
    handleMap,
    handleCalendar,
    handleContact,
    handleSelectGame,
    openGamePage
  } = props;

  return (
    <div className={styles.main}>
        <div className={styles.home}>
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
                <div className={styles.container}>
                    <div className={styles.left}>
                        <div className={styles.splash}>
                          <h1>Dare to Roll</h1>
                          <p className={styles.intro}>{langue[lang].title}<span onClick={handleGame} className={styles.careers}>{langue[lang].catalogue}</span>{langue[lang].or}<span onClick={handleContact} className={styles.careers}>{langue[lang].contact}</span>{langue[lang].with}</p>
                          <div className={styles.flags}>
                            <div className={styles.flag} >
                              <p className={styles.textFlag}>{langue[lang].origin}</p>
                              <Tooltip title={langue[lang].origin} id="0">
                                <img  src={monaco} style={{ width: "35px" }} alt="MonacoFlag"/>
                              </Tooltip>
                            </div>
                            <div className={styles.flag}>
                              <p className={styles.textFlag}>{langue[lang].available}</p>
                              <Tooltip title={langue[lang].available} id="0">
                                <img  src={europe} style={{ width: "35px" }} alt="EuroFlag"/>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                        <div style={{marginTop: "10px", marginBottom: "10px", padding: "10px", backdropFilter: "blur(8px)", borderRadius: "20px", background: "rgba(19, 18, 18, 0.5)"}}>
                          <h2 style={{ textAlign: "center" }}>{langue[lang].findUs}</h2>
                        </div>
                        <EventsCard
                            lang={lang}
                            event={events[0]}
                            key={events[0].title}
                          />
                        <div>

                        </div>
                    </div>
    
                    <div className={styles.right}>
                      <div className={styles.homeRight}>
                        <h2>{langue[lang].lastgame}</h2>
                        <Card
                          lang={lang}
                          game={games[games.length - 1]} 
                          key={games[games.length - 1].name}
                          handleSelectGame={handleSelectGame}
                        />
                      </div>
                    </div>
                </div>
        </div>
    </div>
  );
}

export default Home;