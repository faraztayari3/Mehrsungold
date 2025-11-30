import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

/**
 * A functional component that renders a Snackbar.
 * @param {{Object}} props - The props object containing the following properties:
 * @returns The JSX element representing the Snackbar.
 */
const CustomSnackbar = ({ open, content, type, duration, refresh }) => {

    const { locale } = useRouter();
    const [showSnackbar, setShowSnackbar] = useState(open);
    useEffect(() => {
        handleShowSnackbar();
        return () => {
            setShowSnackbar(false);
        }
    }, [refresh]);
    const handleShowSnackbar = () => {
        setShowSnackbar(open);
    }
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSnackbar(false);
    }

    return (
        <Snackbar
            open={showSnackbar}
            autoHideDuration={duration}
            anchorOrigin={{ vertical: 'top', horizontal: locale == 'fa' ? 'left' : 'right' }}
            onClose={handleClose}>
            <Alert onClose={handleClose} variant="filled" severity={type} sx={{ width: '100%' }} className="!text-white">
                <span className="text-white" dangerouslySetInnerHTML={{ __html: content }} />
            </Alert>
        </Snackbar>
    )
}

export default CustomSnackbar;