import React, { useEffect, useState } from 'react';
import styles from './NavBar.module.css';
import { ReactComponent as Logo } from "../../Resources/image/logo.svg";
import invitation from "../../Resources/image/invitation.png";
import map from "../../Resources/image/map.png";
import schedule from "../../Resources/image/schedule.png";
import catalogue from "../../Resources/image/catalogue.png";
import { motion } from "framer-motion";
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import france from "../../Resources/image/france.png";
import britain from "../../Resources/image/britain.png";
import italy from "../../Resources/image/italy.png";
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import shoppingcart from "../../Resources/image/shoppingcart.png";
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import menuIcon from "../../Resources/image/menu.png";
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import CardCart from '../../Components/CardCart/CardCart';
import Divider from '@mui/material/Divider';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import langue from './language/langue';

const NavBar = props => { 
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

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMobile = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

    const StyledBadge = styled(Badge)(({ theme }) => ({
      '& .MuiBadge-badge': {
        top: 10,
        border: `2px solid ${theme.palette.background.paper}`,
        padding: '0 4px',
      },
    }));

    const [flag, setFlag] = useState('fr');

    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
      setOpen(newOpen);
    };

    useEffect(() => {
      var userLang = navigator.language || navigator.userLanguage; 
      setFlag(userLang.substring(0, 2))
      updateLang(userLang.substring(0, 2))
    }, [])

    const handleChange = (event) => {
      setFlag(event.target.value);
      updateLang(event.target.value);
    };

    function CartComponent() {
      return (
        <div key={seed} className={styles.cart}>
          <div className={styles.cartTitle}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img style={{ width: '35px', height: '35px', marginTop: '10px', marginRight: '10px'}} src={shoppingcart} alt="BritainFlag"/>
              <h2 style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px', fontSize: '25px'}}>{langue[lang].cart}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#ed6c02', marginTop: '15.5px', marginBottom: '15.5px', fontSize: '18px'}}>
              {cart.quantity.toString() + langue[lang].product}
            </div>
          </div>
          <Divider style={{marginBottom: '7.5px'}} />
          <div style={{ padding: '10px'}}>
            <Button
              component="label"
              role={undefined}
              variant="contained"
              style={{fontFamily: "GT Medium", width: "100%", fontSize: "17px", marginBottom: '10px'}}
              tabIndex={-1}
              endIcon={<ShoppingCartIcon />}
            >
              <div style={{ marginRight: '20px'}}>
                {langue[lang].command}
              </div>
              <div style={{ minWidth: 'fit-content'}}>
                {cart.totalPrice} €
              </div>
            </Button>
            {cart.games.map((game, index) => (
              <CardCart key={"game_" + index} game={game} index={index} lang={lang} handleSelectGame={handleSelectGame} removeFromCart={removeFromCart} />
            ))}
          </div>
        </div>
      );
    }
  
    const variants = {
        hidden: { opacity: 1, y: 15 },
        visible: { opacity: 1, y: 0 },
    }

  return (
    <>
      <motion.div 
        className={styles.navbar}
        animate="visible"
        variants={variants}
        transition={{ y: { type: "spring" }, duration: 0.01 }}
      >
        <div className={styles.navbar_left}>
            <div className={styles.logodiv} id="0"
              onClick={handleHome}
            >
              <Logo className={styles.svg} style={{ fill: "#fff" }}/>
              <h3>Dare to Roll</h3>
            </div>
  
        </div>

       
        <div className={styles.navbar_right}>
          {/*Mobile menu*/}
          <IconButton
            className={styles.MobileMenu}
            aria-label="more"
            id="long-button"
            aria-controls={openMobile ? 'long-menu' : undefined}
            aria-expanded={openMobile ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            <img src={menuIcon} className={styles.iconMobile} alt="Menue"/>
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={openMobile}
            onClose={handleClose}
          >
            <MenuItem style={{ marginTop: "-8px", background: 'rgba(0, 0, 0, 0.85)', color: 'white'}}>
              <Tooltip title={langue[lang].games} className={styles.tabsmenu} id="0"
                onClick={handleGame}
              >
                <img src={catalogue} className={styles.logomenu} alt="fireSpot"/>
                <h4 className={styles.textmenu}>{langue[lang].games}</h4>
              </Tooltip>
            </MenuItem>
              {/*<Tooltip title={langue[lang].map} className={styles.tabsmenu} id="0"
                onClick={handleMap}
              >
                <img  src={map} className={styles.logomenu} alt="fireSpot"/>
                <h4 className={styles.textmenu}>{langue[lang].map}<</h4>
              </Tooltip>
              */}
            <MenuItem style={{ background: 'rgba(0, 0, 0, 0.85)', color: 'white'}}>
              <Tooltip title={langue[lang].events} className={styles.tabsmenu} id="0"
                onClick={handleCalendar}
              >
                <img src={schedule} className={styles.logomenu} alt="fireSpot"/>
                <h4 className={styles.textmenu}>{langue[lang].events}</h4>
              </Tooltip>
            </MenuItem>
            <MenuItem style={{ background: 'rgba(0, 0, 0, 0.85)', color: 'white'}}>
              <Tooltip title={langue[lang].contact} className={styles.tabsmenu} id="0"
                onClick={handleContact}
              >
                <img  src={invitation} className={styles.logomenu} alt="fireSpot"/>
                <h4 className={styles.textmenu}>{langue[lang].contact}</h4>
              </Tooltip>
            </MenuItem>
            <MenuItem style={{ justifyContent: "space-around", background: 'rgba(0, 0, 0, 0.85)', color: 'white', marginBottom: '-8px'}}>
              <FormControl sx={{ justifyContent: 'center' }} variant="standard">
                <Button onClick={toggleDrawer(true)}><StyledBadge badgeContent={cart.quantity} color="warning"><img className={styles.langimg} src={shoppingcart} alt="BritainFlag"/> </StyledBadge></Button>
                <Drawer anchor={'right'} open={open} onClose={toggleDrawer(false)}>
                  <CartComponent />
                </Drawer>
              </FormControl>
              <FormControl sx={{ justifyContent: 'center' }} variant="standard">
                <Select
                  className={styles.margimg}
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={flag}
                  onChange={handleChange}
                  label="Langue"
                >
                  <MenuItem value={'fr'}>
                    <Tooltip title="Français" id="0">
                      <img className={styles.langimg} src={france} alt="FranceFlag"/>
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={'en'}>
                    <Tooltip title="English" id="1">
                      <img className={styles.langimg} src={britain} alt="BritainFlag"/>
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={'it'}>
                    <Tooltip title="Italiano" id="2">
                      <img className={styles.langimg} src={italy} alt="ItalyFlag"/>
                    </Tooltip>
                  </MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          </Menu>

          {/*Desktop menu*/}
          <div className={styles.DesktopMenu}>
            <Tooltip title={langue[lang].games} className={styles.tabsmenu} id="0"
              onClick={handleGame}
            >
              <img  src={catalogue} className={styles.logomenu} alt="fireSpot"/>
              <h4 className={styles.textmenu}>{langue[lang].games}</h4>
            </Tooltip>
            {/*<Tooltip title={langue[lang].map} className={styles.tabsmenu} id="0"
              onClick={handleMap}
            >
              <img  src={map} className={styles.logomenu} alt="fireSpot"/>
              <h4 className={styles.textmenu}>{langue[lang].map}</h4>
            </Tooltip>
            */}
            <Tooltip title={langue[lang].events} className={styles.tabsmenu} id="0"
              onClick={handleCalendar}
            >
              <img  src={schedule} className={styles.logomenu} alt="fireSpot"/>
              <h4 className={styles.textmenu}>{langue[lang].events}</h4>
            </Tooltip>
            <Tooltip title={langue[lang].contact} className={styles.tabsmenu} id="0"
              onClick={handleContact}
            >
              <img  src={invitation} className={styles.logomenu} alt="fireSpot"/>
              <h4 className={styles.textmenu}>{langue[lang].contact}</h4>
            </Tooltip>
            <FormControl sx={{ justifyContent: 'center' }} variant="standard">
              <Button onClick={toggleDrawer(true)}><StyledBadge badgeContent={cart.quantity} color="warning"><img className={styles.langimg} src={shoppingcart} alt="BritainFlag"/> </StyledBadge></Button>
              <Drawer anchor={'right'} open={open} onClose={toggleDrawer(false)}>
                <CartComponent />
              </Drawer>
            </FormControl>
            <FormControl sx={{ justifyContent: 'center' }} variant="standard">
              <Select
                className={styles.margimg}
                labelId="demo-simple-select-standard-label"
                id="demo-simple-select-standard"
                value={flag}
                onChange={handleChange}
                label="Langue"
              >
                <MenuItem value={'fr'}>
                  <Tooltip title="Français" id="0">
                    <img className={styles.langimg} src={france} alt="FranceFlag"/>
                  </Tooltip>
                </MenuItem>
                <MenuItem value={'en'}>
                  <Tooltip title="English" id="1">
                    <img className={styles.langimg} src={britain} alt="BritainFlag"/>
                  </Tooltip>
                </MenuItem>
                <MenuItem value={'it'}>
                  <Tooltip title="Italiano" id="2">
                    <img className={styles.langimg} src={italy} alt="ItalyFlag"/>
                  </Tooltip>
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default NavBar;