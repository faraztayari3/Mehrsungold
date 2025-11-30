import { useEffect, useState } from "react";
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Divider from '@mui/material/Divider'
import moment from 'jalali-moment'
import html2pdf from "html2pdf.js";

import CustomSwitch from "../../shared/CustomSwitch"

const InvoiceGenerator = ({ factorData, darkModeToggle, siteInfo }) => {

    const [showInvoice, setShowInvoice] = useState(false);
    const [openBottomInvoiceDrawer, setOpenBottomInvoiceDrawer] = useState(false);
    const [showInvoiceData, setShowInvoiceData] = useState(null);
    const [invoiceData, setInvoiceData] = useState({
        description: '',
        hasFatorSignature: true,
        carat: factorData?.product?.carat
    });

    const handleShowInvoice = (data) => (event) => {
        setShowInvoiceData(data);
        setInvoiceData({ ...invoiceData, carat: data?.product?.carat })
        if (window.innerWidth >= 1024) {
            setShowInvoice(true);
            setOpenBottomInvoiceDrawer(false);
        } else {
            setShowInvoice(false);
            setOpenBottomInvoiceDrawer(true);
        }
    }

    const getBase64Image = (imgUrl) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            };
            img.onerror = reject;
            img.src = imgUrl;
        });
    };

    const [exportPDFLoading, setExportPDFLoading] = useState(false);
    const generatePDF = async () => {
        setExportPDFLoading(true);

        let pdfContainer = null;
        const wrapNumericRunsInSpans = (root) => {
            const numRe = /([0-9\u06F0-\u06F9\u0660-\u0669]+(?:[./][0-9\u06F0-\u06F9\u0660-\u0669]+)*)/g;
            const persianLetterRe = /[\u0600-\u06FF]/;

            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
            const toProcess = [];
            let n;
            while ((n = walker.nextNode())) {

                if (!n.nodeValue || !n.nodeValue.trim()) continue;

                if (/[0-9\u06F0-\u06F9\u0660-\u0669]/.test(n.nodeValue)) {
                    toProcess.push(n);
                }
            }

            toProcess.forEach(textNode => {
                const text = textNode.nodeValue;
                let lastIndex = 0;
                const frag = document.createDocumentFragment();

                text.replace(numRe, (match, g1, idx) => {

                    if (idx > lastIndex) {
                        frag.appendChild(document.createTextNode(text.slice(lastIndex, idx)));
                    }

                    const span = document.createElement('span');
                    span.className = 'ltr-num';
                    span.textContent = g1;
                    frag.appendChild(span);

                    const nextChar = text[idx + g1.length] || '';
                    if (persianLetterRe.test(nextChar)) {
                        frag.appendChild(document.createTextNode('\u200E'));
                    }

                    lastIndex = idx + g1.length;
                    return match;
                });


                if (lastIndex < text.length) {
                    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
                }


                if (frag.childNodes.length) {
                    textNode.parentNode.replaceChild(frag, textNode);
                }
            });
        };

        const convertImagesToBase64 = async (root) => {
            const images = root.querySelectorAll("img");
            for (const img of images) {
                if (img.src) {
                    try {
                        const base64 = await getBase64Image(img.src);
                        img.src = base64;
                    } catch (e) {
                        console.error("Failed to convert image to Base64", e);
                    }
                }
            }
        };

        try {
            const sourceEl = document.getElementById("invoiceDialog");
            if (!sourceEl) {
                console.error("invoiceDialog element not found");
                return;
            }

            const cloned = sourceEl.cloneNode(true);

            wrapNumericRunsInSpans(cloned);

            await convertImagesToBase64(cloned);

            pdfContainer = document.createElement("div");
            pdfContainer.style.padding = "1rem";
            pdfContainer.style.backgroundColor = "white";

            const style = document.createElement('style');
            style.textContent = `
                .ltr-num {
                    direction: ltr !important;
                    unicode-bidi: isolate !important;
                    display: inline-block !important; /* ensures proper box for html2canvas */
                }
                [dir="rtl"], .rtl { direction: rtl; unicode-bidi: isolate; }
                * { font-family: Arial, "DejaVu Sans", Tahoma, sans-serif; }
            `;
            pdfContainer.appendChild(style);

            pdfContainer.appendChild(cloned);
            document.body.appendChild(pdfContainer);

            const opt = {
                margin: [0, 0],
                filename: `invoice-${moment(moment(new Date()).format("YYYY-MM-DD"), 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD')}.pdf`,
                image: { type: "jpeg", quality: 1 },
                html2canvas: { scale: 2 },
            };

            await html2pdf().set(opt).from(pdfContainer).save();
        } catch (err) {
            console.error("Error while generating PDF:", err);
        } finally {
            if (pdfContainer && document.body.contains(pdfContainer)) {
                document.body.removeChild(pdfContainer);
            }
            setExportPDFLoading(false);
        }
    }

    return (
        <>
            <Button
                type="button"
                color={`info`}
                onClick={handleShowInvoice(factorData)}>
                ایجاد فاکتور
            </Button>
            <>
                <Dialog onClose={() => { setShowInvoice(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}
                    open={showInvoice} maxWidth={'lg'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ایجاد فاکتور
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => { setShowInvoice(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormGroup className="w-full ltr">
                            <FormControlLabel
                                className="justify-between text-end m-0"
                                control={<CustomSwitch
                                    checked={invoiceData?.hasFatorSignature}
                                    onChange={(event) => setInvoiceData({ ...invoiceData, hasFatorSignature: event.target.checked })}
                                />}
                                label={`افزودن تصویر مهر و امضا دیجیتالی به فاکتور ؟`} />
                        </FormGroup>
                        <FormControl>
                            <TextField
                                type="text"
                                label="عیار مورد نظر"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={invoiceData?.carat}
                                onChange={(event) => setInvoiceData({ ...invoiceData, carat: event.target.value })} />
                        </FormControl>
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات فاکتور "
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={invoiceData?.description}
                                onChange={(event) => setInvoiceData({ ...invoiceData, description: event.target.value })} />
                        </FormControl>
                        <div id="invoiceDialog" className="bg-light-secondary-foreground dark:bg-white" style={{
                            borderRadius: '0.5rem',
                            padding: '1rem 2rem',
                            color: 'black',
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <img
                                        id="invoice-logo-headerDialog"
                                        crossOrigin="anonymous"
                                        src={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}`}
                                        alt="Logo"
                                        style={{
                                            height: '6rem',
                                            width: '6rem',
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: 'black',
                                    }}>{siteInfo?.title}</span>
                                </div>
                                <h1 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'black',
                                }}>فاکتور فروش</h1>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    color: 'black',
                                }}>
                                    <span>
                                        تاریخ فاکتور: <span style={{ fontWeight: 'bold' }}>{moment(moment(new Date()).format("YYYY-MM-DD"), 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD')}</span>
                                    </span>
                                    <span>شماره فاکتور : </span>
                                </div>
                            </div>
                            <div style={{
                                height: '1px',
                                backgroundColor: '#d1d5db',
                                marginBottom: '1rem',
                                marginInline: '-2rem',
                            }} />
                            {/* Seller Information */}
                            <div style={{ marginBottom: showInvoiceData?.branchTime && Object.keys(showInvoiceData?.branchTime).length > 0 ? '1.5rem' : '3rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات شعبه</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '30%',
                                                color: 'black',
                                            }}>
                                                نام شعبه
                                            </th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '70%',
                                                color: 'black',
                                            }}>
                                                نشانی شعبه
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.branchTime?.branch?.nameFa || <span className="block h-6"></span>}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.branchTime?.branch?.address || <span className="block h-6"></span>}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Buyer Information */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات خریدار</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>نام خریدار</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>کدملی</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>موبایل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.firstName || ''} {showInvoiceData?.user?.lastName || ''}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.nationalCode}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.mobileNumber}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Product Information */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات محصولات</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '20%',
                                                color: 'black',
                                            }}>نام محصول</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>مقدار</th>
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>عیار</th> : ''}
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>{!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? 'شماره انگ' : 'مبلغ'}</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                                borderTopLeftRadius: '0.5rem',
                                                borderBottomLeftRadius: '0.5rem',
                                            }}>{!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? 'نام آزمایشگاه' : 'عیار'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.product?.name}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>
                                                    {((showInvoiceData?.amount || showInvoiceData?.amountOrCount || 0) + (showInvoiceData?.product?.isQuantitative ? 0 : (showInvoiceData?.differenceAmount || 0))).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;
                                                    {showInvoiceData?.product?.isQuantitative ? 'عدد' : 'گرم'}
                                                </span>
                                            </td>
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{invoiceData?.carat}</span>
                                            </td> : ''}
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{showInvoiceData?.purity}</span>
                                            </td> : <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.product?.price ? <span>&nbsp;({(
                                                    ((showInvoiceData?.product?.price || 0) +
                                                        (showInvoiceData?.product?.wageType === 'Fixed'
                                                            ? showInvoiceData?.product?.wage
                                                            : showInvoiceData?.product?.wageType === 'Percent'
                                                                ? (showInvoiceData?.product?.price || 0) * (showInvoiceData?.product?.wage / 100)
                                                                : 0) * (showInvoiceData?.amount || showInvoiceData?.amountOrCount || 0))
                                                ).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان)</span> :
                                                    showInvoiceData?.product?.isQuantitative ?
                                                        <span>&nbsp;({(showInvoiceData?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(showInvoiceData?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان)</span> : ''}
                                            </td>}
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{showInvoiceData?.labName}</span>
                                            </td> : <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{invoiceData?.carat}</span>
                                            </td>}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes and Footer */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>توضیحات</h2>
                                <p style={{
                                    color: '#4b5563',
                                    whiteSpace: 'pre-line',
                                    minHeight: '6rem',
                                    color: 'black',
                                }}>{invoiceData?.description}</p>
                            </div>
                            <div style={{
                                height: '1px',
                                backgroundColor: '#d1d5db',
                                marginInline: '-2rem',
                            }} />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                marginTop: '1.5rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    color: 'black',
                                }}>
                                    <p>مهر و امضای فروشنده:</p>
                                    {invoiceData?.hasFatorSignature && siteInfo?.factorSignatureImage ?
                                        <img id="invoice-logo-footerDialog" crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.factorSignatureImage}`} alt="Logo" style={{
                                            height: '8rem',
                                            width: '8rem',
                                        }} />
                                        : <div style={{ width: '8rem', height: '4rem', marginTop: '0.5rem' }}></div>}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    color: 'black',
                                }}>
                                    <p>مهر و امضای خریدار:</p>
                                    <div style={{ width: '8rem', height: '4rem', marginTop: '0.5rem' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => { setShowInvoice(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={exportPDFLoading}
                                onClick={generatePDF}>
                                <text className="text-black font-semibold">دانلود فاکتور</text>
                            </LoadingButton >
                        </div>
                    </div>
                </Dialog>
                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomInvoiceDrawer}
                    onClose={() => { setOpenBottomInvoiceDrawer(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ایجاد فاکتور
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => { setOpenBottomInvoiceDrawer(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormGroup className="w-full ltr">
                            <FormControlLabel
                                className="justify-between text-end m-0"
                                control={<CustomSwitch
                                    checked={invoiceData?.hasFatorSignature}
                                    onChange={(event) => setInvoiceData({ ...invoiceData, hasFatorSignature: event.target.checked })}
                                />}
                                label={`افزودن تصویر مهر و امضا دیجیتالی به فاکتور ؟`} />
                        </FormGroup>
                        <FormControl>
                            <TextField
                                type="text"
                                label="عیار مورد نظر"
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={invoiceData?.carat}
                                onChange={(event) => setInvoiceData({ ...invoiceData, carat: event.target.value })} />
                        </FormControl>
                        <FormControl>
                            <TextField
                                type="text"
                                label="توضیحات فاکتور "
                                multiline
                                rows={4}
                                InputLabelProps={{
                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                }}
                                InputProps={{
                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                }}
                                value={invoiceData?.description}
                                onChange={(event) => setInvoiceData({ ...invoiceData, description: event.target.value })} />
                        </FormControl>
                        <div id="invoiceDialog" className="hidden" style={{
                            borderRadius: '0.5rem',
                            padding: '1rem 2rem',
                            color: 'black',
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}>
                                    <img
                                        id="invoice-logo-headerDialog"
                                        crossOrigin="anonymous"
                                        src={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.lightIconImage}`}
                                        alt="Logo"
                                        style={{
                                            height: '6rem',
                                            width: '6rem',
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: 'black',
                                    }}>{siteInfo?.title}</span>
                                </div>
                                <h1 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'black',
                                }}>فاکتور فروش</h1>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '1rem',
                                    color: 'black',
                                }}>
                                    <span>
                                        تاریخ فاکتور: <span style={{ fontWeight: 'bold' }}>{moment(moment(new Date()).format("YYYY-MM-DD"), 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD')}</span>
                                    </span>
                                    <span>شماره فاکتور : </span>
                                </div>
                            </div>
                            <div style={{
                                height: '1px',
                                backgroundColor: '#d1d5db',
                                marginBottom: '1rem',
                                marginInline: '-2rem',
                            }} />
                            {/* Seller Information */}
                            <div style={{ marginBottom: showInvoiceData?.branchTime && Object.keys(showInvoiceData?.branchTime).length > 0 ? '1.5rem' : '3rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات شعبه</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '30%',
                                                color: 'black',
                                            }}>
                                                نام شعبه
                                            </th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '70%',
                                                color: 'black',
                                            }}>
                                                نشانی شعبه
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.branchTime?.branch?.nameFa || <span className="block h-6"></span>}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.branchTime?.branch?.address || <span className="block h-6"></span>}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Buyer Information */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات خریدار</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>نام خریدار</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>کدملی</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '33%',
                                                color: 'black',
                                            }}>موبایل</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.firstName || ''} {showInvoiceData?.user?.lastName || ''}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.nationalCode}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.user?.mobileNumber}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Product Information */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>اطلاعات محصولات</h2>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    border: '1px solid #d1d5db',
                                    textAlign: 'center',
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                width: '20%',
                                                color: 'black',
                                            }}>نام محصول</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>مقدار</th>
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>عیار</th> : ''}
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>{!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? 'شماره انگ' : 'مبلغ'}</th>
                                            <th style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                                borderTopLeftRadius: '0.5rem',
                                                borderBottomLeftRadius: '0.5rem',
                                            }}>{!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? 'نام آزمایشگاه' : 'عیار'}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                wordBreak: 'break-word',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.product?.name}
                                            </td>
                                            <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>
                                                    {((showInvoiceData?.amount || showInvoiceData?.amountOrCount || 0) + (showInvoiceData?.product?.isQuantitative ? 0 : (showInvoiceData?.differenceAmount || 0))).toLocaleString('en-US', { maximumFractionDigits: 3 })}&nbsp;
                                                    {showInvoiceData?.product?.isQuantitative ? 'عدد' : 'گرم'}
                                                </span>
                                            </td>
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{invoiceData?.carat}</span>
                                            </td> : ''}
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{showInvoiceData?.purity}</span>
                                            </td> : <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                {showInvoiceData?.product?.price ? <span>&nbsp;({(
                                                    ((showInvoiceData?.product?.price || 0) +
                                                        (showInvoiceData?.product?.wageType === 'Fixed'
                                                            ? showInvoiceData?.product?.wage
                                                            : showInvoiceData?.product?.wageType === 'Percent'
                                                                ? (showInvoiceData?.product?.price || 0) * (showInvoiceData?.product?.wage / 100)
                                                                : 0) * (showInvoiceData?.amount || showInvoiceData?.amountOrCount || 0))
                                                ).toLocaleString('en-US', { maximumFractionDigits: 0 })} تومان)</span> :
                                                    showInvoiceData?.product?.isQuantitative ?
                                                        <span>&nbsp;({(showInvoiceData?.weight || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} گرم) &nbsp;(اجرت: {(showInvoiceData?.wage || 0).toLocaleString('en-US', { maximumFractionDigits: 3 })} تومان)</span> : ''}
                                            </td>}
                                            {!showInvoiceData?.product?.price && !showInvoiceData?.product?.isQuantitative ? <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{showInvoiceData?.labName}</span>
                                            </td> : <td style={{
                                                border: '1px solid #d1d5db',
                                                padding: '0.5rem',
                                                color: 'black',
                                            }}>
                                                <span>{invoiceData?.carat}</span>
                                            </td>}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Notes and Footer */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'black',
                                }}>توضیحات</h2>
                                <p style={{
                                    color: '#4b5563',
                                    whiteSpace: 'pre-line',
                                    minHeight: '6rem',
                                    color: 'black',
                                }}>{invoiceData?.description}</p>
                            </div>
                            <div style={{
                                height: '1px',
                                backgroundColor: '#d1d5db',
                                marginInline: '-2rem',
                            }} />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                marginTop: '1.5rem',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    color: 'black',
                                }}>
                                    <p>مهر و امضای فروشنده:</p>
                                    {invoiceData?.hasFatorSignature && siteInfo?.factorSignatureImage ?
                                        <img id="invoice-logo-footerDialog" crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${siteInfo?.factorSignatureImage}`} alt="Logo" style={{
                                            height: '8rem',
                                            width: '8rem',
                                        }} />
                                        : <div style={{ width: '8rem', height: '4rem', marginTop: '0.5rem' }}></div>}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    color: 'black',
                                }}>
                                    <p>مهر و امضای خریدار:</p>
                                    <div style={{ width: '8rem', height: '4rem', marginTop: '0.5rem' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-x-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => { setOpenBottomInvoiceDrawer(false); setInvoiceData({ ...invoiceData, hasFatorSignature: true, description: '' }) }}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={exportPDFLoading}
                                onClick={generatePDF}>
                                <text className="text-black font-semibold">دانلود فاکتور</text>
                            </LoadingButton >
                        </div>
                    </div>
                </SwipeableDrawer>
            </>
        </>
    );
}

export default InvoiceGenerator;
