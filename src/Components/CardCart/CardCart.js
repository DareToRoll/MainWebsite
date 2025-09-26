import styles from './CardCart.module.css';
import React from 'react';
import { motion } from "framer-motion";
import cross from "../../Resources/image/cross.png";
import langue from './language/langue';

const CardCart = props => {
    const { 
        game,
        handleSelectGame,
        lang,
        index,
        removeFromCart
      } = props;

    const variants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    }

    return (
          <motion.div
            className={styles.card}
            id={game.id}
            style={{ padding: 0 }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div style={{ height: '105px', overflow: 'hidden' }}>
              <img onClick={() => {removeFromCart(index)}} className={styles.cross} src={cross} alt="Remove product"/>
              <img onClick={() => {handleSelectGame(game.game.id)}} src={game.game.cover} className={styles.img} alt="Game Cover Image" />
            </div>
    
            <div onClick={() => {handleSelectGame(game.game.id)}} className={styles.price}>
                <h2 className={styles.name}>{game.game.name}</h2>
                <div className={styles.details}>
                  <div>{langue[lang].quantity}: {game.quantity}</div>
                  <div style={{ color: 'yellow'}}>{game.totalPrice} €</div>
                </div>
            </div>
          </motion.div>
    );
  }
  
  export default CardCart;