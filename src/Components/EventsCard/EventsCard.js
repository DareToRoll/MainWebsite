import styles from './EventsCard.module.css';
import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import location from "../../Resources/image/location.png";

const EventsCard = props => {
  const {
    lang,
    event
  } = props;
  
  return (
    <>
        <Card sx={{ maxWidth: 550, borderRadius: '15px' }} onClick={() => window.location.replace(event.link)}>
            <CardActionArea>
              <Stack direction="row" spacing={1}>
                <Chip className={styles.date} style={{ backgroundColor: '#dc361f', marginTop: '3px', marginRight: '3px', fontFamily: "GT Regular" }} label={event.text[lang].date} variant="outlined" />
              </Stack>
                <CardMedia
                component="img"
                height="140"
                image={event.img}
                alt={event.title}
                />
            </CardActionArea>
            <CardActions sx={{ backgroundColor: '#202020' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' , color: 'white', fontFamily: "GT Regular"}}>
                <img src={location} style={{ width: "20px", marginRight: '3px' }} alt="EventsAdress"/>
                {event.place}
              </Typography>
            </CardActions>
        </Card>
    </>
  );
}

export default EventsCard;