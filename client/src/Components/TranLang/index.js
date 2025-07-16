import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import i18n from '../../i18n';

const TranLang = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (lang) => {
    if (lang) i18n.changeLanguage(lang);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        style={{
          position: "fixed",
          bottom: "400px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "#fff",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          zIndex: 10000,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <TranslateIcon />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleClose(null)}
      >
        <MenuItem onClick={() => handleClose('en')}>English</MenuItem>
        <MenuItem onClick={() => handleClose('vi')}>Tiếng Việt</MenuItem>
      </Menu>
    </>
  );
};

export default TranLang;
