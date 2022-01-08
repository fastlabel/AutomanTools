import { ApplicationConst } from '@fl-three-editor/application/const';
import { createStyles, makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

import hero from '../../../images/hero.png';
import sideLeftImage from '../../../images/side-left.png';
import sideRightImage from '../../../images/side-right.png';
import copyImage from '../../../images/copy.png';
import pcdImage from '../../../images/pcd.png';
import pcdWithImage from '../../../images/pcd_image.png';
import pcdFramesImage from '../../../images/pcd_frames.png';

const firebaseConfig = {
  apiKey: 'AIzaSyC_1egYju9A0EpuJjKFzJ1trqzlmeoccEI',
  storageBucket: 'fastlabel-3d-annotation-3b7ec2.appspot.com',
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

async function getDownloadItem(url: string) {
  return await getDownloadURL(ref(storage, url));
}

const useStyles = makeStyles(() =>
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
      position: 'relative',
      background:
        'linear-gradient(301.64deg, #40A9F5 19.83%, #5288FC 40.74%, #377AFC 60.52%, #515DFF 79.3%)',
      display: 'flex',
      justifyContent: 'center',
      height: 620,
    },
    heroSideLeftImage: {
      position: 'absolute',
      top: 0,
      left: '-20%',
      margin: 0,
      width: '50%',
    },
    heroSideRightImage: {
      position: 'absolute',
      top: 0,
      right: '-20%',
      margin: 0,
      width: '50%',
    },
    heroImage: {
      position: 'absolute',
      right: 0,
      top: '-24px',
      zIndex: 20,
    },
    heroTitle: {
      color: '#FFF',
      fontSize: 48,
      fontWeight: 'bold',
      letterSpacing: '0.06em',
    },
    heroCaption: {
      color: '#FFF',
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
      padding: 24,
    },
    dataTypeImage: {
      width: 240,
      height: 148,
      marginBottom: 8,
    },
    dataTypeItemTitle: {
      color: '#212121',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    dataTypeSampleLink: {
      marginTop: 24,
      display: 'flex',
      justifyContent: 'center',
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
    usageSideLeftImage: {
      position: 'absolute',
      top: 110,
      left: '-26%',
      margin: 0,
      width: '60%',
    },
    usageSideRightImage: {
      position: 'absolute',
      top: 20,
      right: '-40%',
      margin: 0,
      width: '72%',
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
  const [samplePcd, setSamplePcd] = useState<string>('');
  const [samplePcdImage, setSamplePcdImage] = useState<string>('');
  const [samplePcdFrames, setSamplePcdFrames] = useState<string>('');
  const [m1MacAppLink, setM1MacAppLink] = useState<string>('');

  useEffect(() => {
    const getSamples = async () => {
      setSamplePcd(await getDownloadItem('automan_sample_pcd.zip'));
      setSamplePcdImage(await getDownloadItem('automan_sample_pcd&image.zip'));
      setSamplePcdFrames(
        await getDownloadItem('automan_sample_pcd_frames.zip')
      );
      setM1MacAppLink(
        await getDownloadItem('apps/Automan-0.0.1-arm64-mac.zip')
      );
    };
    getSamples();
  }, []);

  const onClickStartButton = () => {
    history.push('/new');
  };

  const onClickEditButton = () => {
    history.push('/edit');
  };

  return (
    <Box overflow="hidden">
      {/* Hero Section */}
      <Box className={classes.heroSection}>
        <img src={sideLeftImage} className={classes.heroSideLeftImage} />
        <img src={sideRightImage} className={classes.heroSideRightImage} />
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
                  className={classes.webDownloadButton}
                  onClick={onClickStartButton}>
                  {t('web_hero_start_button')}
                </Button>
                <Button
                  variant="outlined"
                  className={classes.appDownloadButton}
                  download
                  href={m1MacAppLink}>
                  {t('web_hero_download_button')}
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
            {t('web_copy_title')}
          </Typography>
          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" className={classes.copyCaption}>
              {t('web_copy_caption_1')}
            </Typography>
            <Typography variant="subtitle1" className={classes.copyCaption}>
              {t('web_copy_caption_2')}
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
              {t('web_data_type_title')}
            </Typography>
          </Box>
          <Box mt={4} textAlign="center">
            <Typography variant="subtitle1" className={classes.copyCaption}>
              {t('web_data_type_caption_1')}
            </Typography>
            <Typography variant="subtitle1" className={classes.copyCaption}>
              {t('web_data_type_caption_2')}
            </Typography>
          </Box>
          <Box mt={7}>
            <Grid container className={classes.dataTypeBox}>
              <Grid item className={classes.dataTypeItem}>
                <img className={classes.dataTypeImage} src={pcdImage} />
                <Typography className={classes.dataTypeItemTitle}>
                  {t('web_data_type_pcd')}
                </Typography>
                <Link
                  className={classes.dataTypeSampleLink}
                  download
                  href={samplePcd}>
                  {t('web_sample_download')}
                </Link>
              </Grid>
              <Grid item className={classes.dataTypeItem}>
                <img className={classes.dataTypeImage} src={pcdWithImage} />
                <Typography className={classes.dataTypeItemTitle}>
                  {t('web_data_type_pcd_image')}
                </Typography>
                <Link
                  className={classes.dataTypeSampleLink}
                  download
                  href={samplePcdImage}>
                  {t('web_sample_download')}
                </Link>
              </Grid>
              <Grid item className={classes.dataTypeItem}>
                <img className={classes.dataTypeImage} src={pcdFramesImage} />
                <Typography className={classes.dataTypeItemTitle}>
                  {t('web_data_type_pcd_frames')}
                </Typography>
                <Link
                  className={classes.dataTypeSampleLink}
                  download
                  target="_self"
                  href={samplePcdFrames}>
                  {t('web_sample_download')}
                </Link>
              </Grid>
            </Grid>
          </Box>
          <Box mt={7} display="flex" justifyContent="center">
            <Button
              variant="contained"
              className={classes.dataTypeButton}
              onClick={onClickStartButton}>
              {t('web_data_type_button')}
            </Button>
          </Box>
        </Box>
      </Box>
      {/* Usage Section */}
      <Box className={classes.usageSection}>
        <img src={sideLeftImage} className={classes.usageSideLeftImage} />
        <img src={sideRightImage} className={classes.usageSideRightImage} />
        <Box className={classes.container}>
          <Typography variant="h3" className={classes.usageTitle}>
            {t('web_usage_title')}
          </Typography>
          <Box mt={7} className={classes.usageBox}>
            <Box className={classes.usageItem}>
              <Typography className={classes.usageItemTitle}>
                {t('web_usage_new_title')}
              </Typography>
              <Box className={classes.usageBar} height={210} />
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>1</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    {t('web_usage_new_step_1')}
                  </Typography>
                  <a className={classes.usageLink} href="/">
                    {t('web_sample_download')}
                  </a>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>2</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    {t('web_usage_new_step_2')}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>3</Box>
                <Box ml={2}>
                  <Box fontWeight="bold" className={classes.usageContentText}>
                    {t('web_usage_new_step_3')}
                  </Box>
                </Box>
              </Box>
              <Box display="flex">
                <Box className={classes.usageNum}>4</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    {t('web_usage_new_step_4')}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                className={classes.usageButton}
                onClick={onClickStartButton}>
                {t('web_usage_new_button')}
              </Button>
            </Box>

            <Box className={classes.usageItem}>
              <Typography className={classes.usageItemTitle}>
                {t('web_usage_edit_title')}
              </Typography>
              <Box className={classes.usageBar} height={140} />
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>1</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    {t('web_usage_edit_step_1')}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" mb={5}>
                <Box className={classes.usageNum}>2</Box>
                <Box ml={2}>
                  <Box fontWeight="bold" className={classes.usageContentText}>
                    {t('web_usage_edit_step_2')}
                  </Box>
                </Box>
              </Box>
              <Box display="flex">
                <Box className={classes.usageNum}>3</Box>
                <Box ml={2}>
                  <Typography className={classes.usageContentText}>
                    {t('web_usage_edit_step_3')}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                className={classes.usageButton}
                onClick={onClickEditButton}>
                {t('web_usage_edit_button')}
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
    </Box>
  );
};

export default StartPage;
