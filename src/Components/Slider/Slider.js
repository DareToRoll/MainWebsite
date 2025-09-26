import styles from './Slider.module.css';
import React, { useEffect } from 'react';
import { ReactComponent as Left } from "../../Resources/image/left.svg";
import { ReactComponent as Right } from "../../Resources/image/right.svg";
import { useLocation } from 'react-router-dom';
import "react-slideshow-image/dist/styles.css";
import { Slide } from "react-slideshow-image";

const Slider = props => {
  const {
    selectedGame,
    setSelectedGame,
    allGames,
    carouselState,
    setCarouselState,
  } = props;

  const slideRef = React.createRef();
  const location = useLocation();

  useEffect(() => {
    const selectedGameIndex = allGames.findIndex(game => "/games/" + game.surname === location.pathname);
    setSelectedGame(allGames[selectedGameIndex]);
  }, [allGames, location.pathname, setSelectedGame]);

  const properties = {
    duration: 6000,
    autoplay: false,
    transitionDuration: 800,
    arrows: false,
    infinite: true,
    easing: "ease"
  };

  const back = () => {
    if (carouselState > 0) {
      setCarouselState(carouselState - 1);
    } else {
      setCarouselState(selectedGame.footage.length - 1);
    }
    slideRef.current.goBack();
  }

  const next = () => {
    if (carouselState < selectedGame.footage.length - 1) {
      setCarouselState(carouselState + 1);
    } else {
      setCarouselState(0);
    }
    slideRef.current.goNext();
  }

  const jumpToIndex = (e) => {
    let index = parseInt(e.target.id);
    setCarouselState(index);
    slideRef.current.goTo(index);
  }

  return (
        <div className={styles.slider}>
          <Slide ref={slideRef} {...properties}>
            {selectedGame ? selectedGame.footage.map((each, index) => (
              <div 
                key={"img_" +index} 
                className={styles.slide}
              >
                <img 
                  className={styles.currentImg} 
                  src={each} 
                  alt="sample" 
                />
              </div>
            )) : <></>}
          </Slide>
    
            <button 
              className={styles.backwards} 
              onClick={back} 
              id="22" 
              aria-label="Previous Picture"
            >
                <Left 
                  className={styles.left} 
                  style={{ fill: "#ccc" }}
                />
            </button>
    
            <button 
              className={styles.forward} 
              onClick={next} id="23" 
              aria-label="Next Picture"
            >
                <Right
                  className={styles.right} 
                  style={{ fill: "#ccc" }}
                />
            </button>
            <div className={styles.selectorContainer}>
              {selectedGame ? selectedGame.footage.map((each, index) => (
                <button 
                  key={"img2_" + index}
                  id={index}
                  onClick={jumpToIndex} 
                  className={carouselState === index ? styles.buttonSelected : styles.button} 
                  aria-label="Jump to picture"
                >
                </button>
              )) : <></>}
            </div>
        </div>
  );
}

export default Slider;