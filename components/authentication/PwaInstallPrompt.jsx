import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Image from 'next/image';

const PwaInstallPrompt = () => {
  const [open, setOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // بررسی موبایل بودن
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // بررسی iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // بررسی اینکه قبلاً نصب شده یا نه
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // بررسی اینکه قبلاً این راهنما رو ندیده
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');

    // فقط برای موبایل و اگه نصب نشده و اولین باره
    if (isMobile && !standalone && !hasSeenPrompt) {
      // نمایش بعد از 2 ثانیه
      setTimeout(() => {
        setOpen(true);
      }, 2000);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  const handleUnderstood = () => {
    handleClose();
  };

  // اگه قبلاً نصب شده، نمایش نده
  if (isStandalone) {
    return null;
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90vh',
          pb: 2,
        },
      }}
    >
      <Box sx={{ position: 'relative', px: 3, pt: 2, pb: 3 }}>
        {/* دکمه بستن */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* لوگو */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, mt: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Image
              src="/assets/images/logo.png"
              alt="Mehrsun Gold"
              width={80}
              height={80}
              style={{ objectFit: 'cover' }}
            />
          </Box>
        </Box>

        {/* عنوان اصلی */}
        <Typography
          variant="h6"
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            mb: 1,
            fontSize: '1.1rem',
          }}
        >
          وب‌اپلیکیشن مهرسان گلد را به صفحه اصلی موبایل خود اضافه کنید.
        </Typography>

        {/* راهنمای iOS */}
        {isIOS ? (
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                1
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    در نوار پایین روی دکمه
                  </Typography>
                  <ShareIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2">بزنید.</Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                2
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  در منوی باز‌شده، در قسمت پایین، گزینه
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddBoxIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Add to Home Screen
                  </Typography>
                </Box>
                <Typography variant="body2">را انتخاب کنید.</Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                3
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  در مرحله بعد در قسمت بالا روی{' '}
                  <span style={{ fontWeight: 600 }}>Add</span> بزنید.
                </Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          // راهنمای Android
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                1
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  روی منوی سه نقطه (⋮) در گوشه بالا بزنید.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                2
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  گزینه{' '}
                  <span style={{ fontWeight: 600 }}>
                    افزودن به صفحه اصلی
                  </span>{' '}
                  یا{' '}
                  <span style={{ fontWeight: 600 }}>
                    Install app
                  </span>{' '}
                  را انتخاب کنید.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                3
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  روی دکمه{' '}
                  <span style={{ fontWeight: 600 }}>افزودن</span> یا{' '}
                  <span style={{ fontWeight: 600 }}>Install</span> کلیک کنید.
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* دکمه متوجه شدم */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleUnderstood}
          sx={{
            mt: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 600,
            backgroundColor: '#16a596',
            '&:hover': {
              backgroundColor: '#138c7f',
            },
          }}
        >
          متوجه شدم
        </Button>
      </Box>
    </Drawer>
  );
};

export default PwaInstallPrompt;
