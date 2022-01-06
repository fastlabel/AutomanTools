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
      '&:hover': {
        backgroundColor: '#1976D2',
      },
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
      height: 520,
      width: 360,
      margin: '0 20px',
      padding: 24,
      position: 'relative',
    },
    usageItemTitle: {
      fontSize: 20,
      letterSpacing: '0.08em',
      color: '#424242',
      textAlign: 'center',
      fontWeight: 'bold',
      paddingBottom: 24,
      borderBottom: '2px dashed #E0E0E0',
      borderRadius: 2,
      marginBottom: 40,
    },
    usageNum: {
      backgroundColor: '#1E88E5',
      width: 24,
      height: 24,
      borderRadius: 24,
      display: 'flex',
      color: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 'bold',
      flexShrink: 0,
      position: 'relative',
      zIndex: 20,
    },
    usageBar: {
      width: 2,
      position: 'absolute',
      top: 140,
      left: 35,
      backgroundColor: '#1E88E5',
      zIndex: 10,
    },
    usageContent: {
      marginLeft: 16,
    },
    usageContentText: {
      fontSize: 16,
      color: '#424242',
      lineHeight: '150%',
      letterSpacing: '0.04em',
    },
    usageLink: {
      color: '#1565C0',
      fontSize: 12,
      fontWeight: 'bold',
      letterSpacing: '0.02em',
      display: 'block',
      margin: '10px 0 -4px',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    usageButton: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF',
      color: '#1E88E5',
      borderRadius: '100vh',
      border: '2px solid #1E88E5',
      width: 240,
      height: 48,
      fontWeight: 'bold',
      fontSize: 16,
    },
    footer: {
      backgroundColor: '#FAFAFA',
      padding: '60px 0',
      display: 'flex',
      justifyContent: 'center',
    },
    footerLogo: {
      fontSize: 40,
      color: '#424242',
      fontWeight: 'bold',
      letterSpacing: '0.04em',
    },
    footerCaption: {
      fontSize: 14,
      color: '#757575',
      letterSpacing: '0.02em',
    },
    copylight: {
      fontSize: 12,
      color: '#9E9E9E',
      letterSpacing: '0.02em',
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
            <Box className={classes.usageItem}>
              <Typography className={classes.usageItemTitle}>
                新しく始める
              </Typography>
              <Box className={classes.usageBar} height={210} />
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>1</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    pcdデータをアップロード
                  </Typography>
                  <a className={classes.usageLink} href="/">
                    サンプルをダウンロード
                  </a>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>2</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    アノテーションのラベルを作成
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>3</Box>
                <Box ml={2}>
                  <Box fontWeight="bold" className={classes.usageContentText}>
                    3Dデータをアノテーション
                  </Box>
                </Box>
              </Box>
              <Box display="flex">
                <Box className={classes.usageNum}>4</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    アノテーション結果を JSON で ダウンロード
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" className={classes.usageButton}>
                アノテーションを始める
              </Button>
            </Box>

            <Box className={classes.usageItem}>
              <Typography className={classes.usageItemTitle}>
                アノテーションを編集
              </Typography>
              <Box className={classes.usageBar} height={140} />
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>1</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    出力された JSON と .pcd データを アップロード
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>2</Box>
                <Box ml={2}>
                  <Box fontWeight="bold" className={classes.usageContentText}>
                    3Dデータのアノテーションを編集
                  </Box>
                </Box>
              </Box>
              <Box display="flex">
                <Box className={classes.usageNum}>3</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    アノテーション結果を JSON で ダウンロード
                  </Typography>
                </Box>
              </Box>
              <Button variant="outlined" className={classes.usageButton}>
                アノテーションを編集する
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Footer Section */}
      <Box className={classes.footer}>
        <Box className={classes.container}>
          <Typography variant="h3" className={classes.footerLogo}>
            Automan
          </Typography>
          <Box mt={2}>
            <Typography variant="body1" className={classes.footerCaption}>
              Automan は Tier 4 と Fastlabel, Inc. による共同の OSS
              のプロジェクトです。
            </Typography>
          </Box>
          <Box mt={8}>
            <Typography variant="body1" className={classes.copylight}>
              © Fastlabel 2022
            </Typography>
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
    </Box>
  );
};

export default StartPage;
