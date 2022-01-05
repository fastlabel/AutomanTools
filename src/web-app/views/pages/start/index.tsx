import { ApplicationConst } from '@fl-three-editor/application/const';
import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@material-ui/core';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import logo from '../../../images/logo.png';
import hero from '../../../images/hero.png';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: '100%',
      width: '100vw',
    },
    main: {
      minHeight: 380,
    },
    container: {
      maxWidth: 960,
      width: '100%',
    },
    hero: {
      background:
        'linear-gradient(303.2deg, #40A9F5 47.59%, #4986FA 65.64%, #4A82FA 72.78%, #515DFF 89.17%)',
      display: 'flex',
      justifyContent: 'center',
      height: 560,
    },
    heroImage: {
      position: 'absolute',
      right: 0,
      top: '-24px',
      zIndex: 20,
    },
    description: {
      position: 'relative',
      backgroundColor: '#FFF',
      color: 'black',
      '&::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: '-360px',
        borderTop: '180px solid transparent',
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid #FFF',
        borderBottom: '180px solid #FFF',
      },
    },
  })
);

const StartPage: FC = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  const history = useHistory();

  const onClickStartButton = useCallback(() => {
    history.push('/new');
  }, []);

  const onClickEditButton = useCallback(() => {
    history.push('/edit');
  }, []);

  return (
    <Box>
      <Box className={classes.hero}>
        <Box className={classes.container}>
          <Box py={2}>
            <img src={logo} width={160} />
          </Box>
          <Box position="relative" mt={10}>
            <Box position="absolute" top={0} left={0} zIndex={20}>
              <Typography variant="h3">{ApplicationConst.name}</Typography>
              <Typography variant="h6">{ApplicationConst.name}</Typography>
              <Button>Webで試す</Button>
              <Button>アプリをダウンロード</Button>
            </Box>
            <img className={classes.heroImage} src={hero} width={560} />
          </Box>
        </Box>
      </Box>
      <Box className={classes.description}>
        <Box className={classes.container}>
          <Typography variant="h3">Automan is ...</Typography>
        </Box>
      </Box>
      <Box className={classes.container}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          className={classes.root}
          spacing={2}>
          <Grid item className={classes.main}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography
                  color="textSecondary"
                  variant="h3"
                  style={{ minWidth: 572 }}>
                  {ApplicationConst.name}
                </Typography>
                <Typography color="textSecondary" variant="h4"></Typography>
              </Grid>
              <Grid item>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Typography color="textSecondary" variant="h6">
                          {t('web_start-header_label')}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Button
                          color="primary"
                          onClick={onClickStartButton}
                          style={{ minWidth: 140 }}>
                          {t('web_start-action_label__new')}
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlinedIcon />}
                          onClick={onClickEditButton}
                          style={{ minWidth: 140 }}>
                          {t('web_start-action_label__edit')}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StartPage;
