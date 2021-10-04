import { ApplicationConst } from '@fl-three-editor/application/const';
import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

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
                      {t('page_start_subtitle')}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      color="primary"
                      onClick={onClickStartButton}
                      style={{ minWidth: 140 }}>
                      新しく始める
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<EditOutlinedIcon />}
                      onClick={onClickEditButton}
                      style={{ minWidth: 140 }}>
                      編集する
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography color="textSecondary" variant="h6">
                  最近
                </Typography>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StartPage;
