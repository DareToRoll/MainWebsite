import styles from './Calendar.module.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import AnimatedGamePage from '../AnimatedPage/AnimatedGamePage';
import EventsCard from '../../Components/EventsCard/EventsCard';
import events from '../../utils/events';
import { ReactComponent as Arrow } from "../../Resources/image/arrow.svg";
import langue from './language/langue';

const Calendar = props => {
  const {
    seed,
    lang,
    updateLang,
    cart,
    handleSelectGame,
    removeFromCart,
    clearCart,
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
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        handleHome={handleHome}
        handleGame={handleGame}
        handleMap={handleMap}
        handleCalendar={handleCalendar}
        handleContact={handleContact}
      />
      <div>
      <AnimatedGamePage>
        <div className={styles.right}>
          <div className={styles.homeRight}>
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
            <div style={{ justifyContent: "center", display: 'grid', gap: '15px' }} >
              {events.map((event, index) => (
                <EventsCard
                  lang={lang}
                  event={event}
                  key={"event_" + index}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedGamePage>
      </div>
    </>
  );
}

export default Calendar;