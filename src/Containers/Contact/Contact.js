import styles from './Contact.module.css';
import React, { useState } from 'react';
import NavBar from '../../Components/NavBar/NavBar';
import AnimatedGamePage from '../AnimatedPage/AnimatedGamePage';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import langue from './language/langue';

const Contact = props => {
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

  const [type, settype] = useState(true);

  const chooseType = (e) => {
    if (e.target.id === '1') {
      settype(true);
    } else {
      settype(false);
    }
  }

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
      <div>
      <AnimatedGamePage>
        <div className={styles.right}>
          <div className={styles.homeRight}>
            <div className={styles.head}>
              <div style={{ justifyContent: "center", display: 'flex', gap: '20px' }} >
                <Button id={1} variant={type ? "contained" : "outlined" } onClick={chooseType}>{langue[lang].player}</Button>
                <Button id={2} variant={type ? "outlined" : "contained" } onClick={chooseType}>{langue[lang].professional}</Button>
              </div>
              {type ? 
                <h1>{langue[lang].textplayer}</h1> : 
                <h1>{langue[lang].textprofessional}</h1>
                }
              
            </div>
            <Box
              component="form"
              sx={{ '& .MuiTextField-root': { m: 1 }, display: 'contents' }}
              noValidate
              autoComplete="off"
            >
                <TextField
                  id="outlined-multiline-flexible"
                  label={langue[lang].mail}
                  multiline
                  maxRows={4}
                />
                <TextField
                  id="outlined-textarea"
                  label={langue[lang].subject}
                  multiline
                />
                <TextField
                  id="outlined-multiline-static"
                  label={langue[lang].message}
                  multiline
                  rows={10}
                />
            </Box>
            <Button endIcon={<SendIcon />}>
              {langue[lang].send}
            </Button>
          </div>
          
        </div>
        
      </AnimatedGamePage>
      </div>
    </>
  );
}

export default Contact;