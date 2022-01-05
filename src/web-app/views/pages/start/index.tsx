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
import copyImage from '../../../images/copy.png';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      // height: '100%',
      width: '100vw',
    },
    main: {
      minHeight: 380,
    },
    container: {
      maxWidth: 960,
      width: '100%',
    },
    heroSection: {
      background:
        'linear-gradient(303.23deg, #40A9F5 32.92%, #4986FA 53.59%, #4A82FA 61.76%, #515DFF 80.51%)',
      display: 'flex',
      justifyContent: 'center',
      height: 620,
    },
    heroImage: {
      position: 'absolute',
      right: 0,
      top: '-24px',
      zIndex: 20,
    },
    heroTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      letterSpacing: '0.06em',
    },
    heroCaption: {
      fontSize: 16,
      fontWeight: 'normal',
      letterSpacing: '0.04em',
      marginTop: 24,
    },
    webDownloadButton: {
      borderRadius: '100vh',
      backgroundColor: '#FFF',
      color: '#1565C0',
      fontWeight: 'bold',
      height: 48,
      width: 240,
      fontSize: 16,
      letterSpacing: '0.02em',
    },
    appDownloadButton: {
      borderRadius: '100vh',
      backgroundColor: 'transparent',
      border: '2px solid #FFF',
      color: '#FFF',
      fontWeight: 'bold',
      height: 48,
      width: 240,
      fontSize: 16,
      letterSpacing: '0.02em',
      marginTop: 16,
    },
    copySection: {
      position: 'relative',
      backgroundColor: '#F5F5F5',
      display: 'flex',
      justifyContent: 'center',
      '&::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: '-260px',
        borderTop: '130px solid transparent',
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid #F5F5F5',
        borderBottom: '130px solid #F5F5F5',
      },
    },
    copyTitle: {
      fontSize: 32,
      color: '#212121',
      marginTop: 32,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    copyCaption: {
      color: '#757575',
      fontSize: 16,
      lineHeight: '200%',
      letterSpacing: '0.02em',
    },
    copyImageContainer: {
      position: 'relative',
      marginTop: 40,
      paddingBottom: 480,
    },
    copyImage: {
      width: '90%',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.12)',
      borderRadius: 6,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      margin: '0 auto',
      zIndex: 20,
    },
    dataTypeSection: {
      position: 'relative',
      backgroundColor: '#FFF',
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: 180,
      '&::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: '-160px',
        borderTop: '80px solid transparent',
        borderLeft: '50vw solid #FFF',
        borderRight: '50vw solid transparent',
        borderBottom: '80px solid #FFF',
      },
    },
    dataTypeBox: {
      gridTemplateRows: '1fr 1fr 1fr',
      gap: 60,
    },
    dataTypeItem: {
      backgroundColor: '#FFF',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.10)',
      borderRadius: 8,
      height: 280,
      width: 280,
    },
    dataTypeButton: {
      borderRadius: '100vh',
      backgroundColor: '#1E88E5',
      height: 48,
      fontSize: 16,
      fontWeight: 'bold',
      padding: '0 48px',
      color: '#FFF',
    },
    usageSection: {
      position: 'relative',
      backgroundColor: '#1E88E5',
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: 180,
      '&::after': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: '-100px',
        borderTop: '50px solid transparent',
        borderLeft: '50vw solid transparent',
        borderRight: '50vw solid #1E88E5',
        borderBottom: '50px solid #1E88E5',
      },
    },
    usageTitle: {
      fontSize: 32,
      color: '#FFF',
      marginTop: 80,
      fontWeight: 'bold',
      textAlign: 'center',
      letterSpacing: '0.04em',
    },
    usageBox: {
      display: 'flex',
      justifyContent: 'center',
    },
    usageItem: {
      backgroundColor: '#FFF',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.10)',
      borderRadius: 8,
      height: 500,
      width: 360,
      margin: '0 20px',
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
      {/* Hero Section */}
      <Box className={classes.heroSection}>
        <Box className={classes.container}>
          <Box position="relative" mt={16}>
            <Box position="absolute" top={0} left={0} zIndex={20}>
              <Typography variant="h3" className={classes.heroTitle}>
                {ApplicationConst.name}
              </Typography>
              <Typography variant="h6" className={classes.heroCaption}>
                Open source 3D Annotation Tools
              </Typography>
              <Box display="flex" flexDirection="column" mt={8}>
                <Button
                  variant="contained"
                  className={classes.webDownloadButton}>
                  Webで試す
                </Button>
                <Button
                  variant="outlined"
                  className={classes.appDownloadButton}>
                  アプリをダウンロード
                </Button>
              </Box>
            </Box>
            <img className={classes.heroImage} src={hero} width={560} />
          </Box>
        </Box>
      </Box>
      {/* Copy Section */}
      <Box className={classes.copySection}>
        <Box className={classes.container}>
          <Typography variant="h3" className={classes.copyTitle}>
            3D アノテーションを手元で、簡単に。
          </Typography>
          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" className={classes.copyCaption}>
              Automan はウェブ上、またはアプリをインストールして、
            </Typography>
            <Typography variant="subtitle1" className={classes.copyCaption}>
              手元の端末で3Dデータのアノテーションを行うことができます。
            </Typography>
          </Box>
          <Box className={classes.copyImageContainer}>
            <img src={copyImage} className={classes.copyImage} />
          </Box>
        </Box>
      </Box>
      {/* Data type Section */}
      <Box className={classes.dataTypeSection}>
        <Box className={classes.container}>
          <Box mt={12}>
            <Typography variant="h3" className={classes.copyTitle}>
              3つの方法で3Dデータをアノテーション
            </Typography>
          </Box>
          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" className={classes.copyCaption}>
              pcdデータのアノテーションだけでなく、画像と比較したアノテーションや、
            </Typography>
            <Typography variant="subtitle1" className={classes.copyCaption}>
              連続した3Dデータのアノテーションにも対応しています。
            </Typography>
          </Box>
          <Box mt={7}>
            <Grid container className={classes.dataTypeBox}>
              <Grid item className={classes.dataTypeItem}>
                a
              </Grid>
              <Grid item className={classes.dataTypeItem}>
                b
              </Grid>
              <Grid item className={classes.dataTypeItem}>
                c
              </Grid>
            </Grid>
          </Box>
          <Box mt={7} display="flex" justifyContent="center">
            <Button variant="contained" className={classes.dataTypeButton}>
              今すぐWebで始める
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Usage Section */}
      <Box className={classes.usageSection}>
        <Box className={classes.container}>
          <Typography variant="h3" className={classes.usageTitle}>
            Automan の使い方
          </Typography>
          <Box mt={7} className={classes.usageBox}>
            <Box className={classes.usageItem}>a</Box>
            <Box className={classes.usageItem}>b</Box>
          </Box>
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

      {/* Footer Section */}
    </Box>
  );
};

export default StartPage;
