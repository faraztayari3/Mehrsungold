import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import MUISelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import CancelIcon from '@mui/icons-material/CancelOutlined'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import moment from 'jalali-moment'
import DatePicker from "react-datepicker2"

import { NumericFormat } from 'react-number-format';
import Select from 'react-dropdown-select'

// Validation
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

// Translations
import { useTranslations } from 'next-intl'

// Context
import { useAppContext } from "../../context/AppContext";

// Service
import ApiCall from "../../services/api_call"
import FilterEmptyFields from "../../services/filterEmptyFields"
import FilterObjectFields from "../../services/filterObjectFields"

// Components
import TabPanel from "../shared/TabPanel"
import CustomSwitch from "../shared/CustomSwitch"
import ConfirmDialog from '../shared/ConfirmDialog';

/**
 * ProductsPageCompo component that displays the Products Page Component of the website.
 * @returns The rendered Products Page component.
 */
const ProductsPageCompo = (props) => {

    const { state, dispatch } = useAppContext();
    const { darkModeToggle, userInfo, priceInfo, siteInfo } = state;

    const langText = useTranslations('');
    const router = useRouter();
    const { locale } = useRouter();

    const [tabValue, setTabValue] = useState(0);
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
        setPageItem(1);
        if (newValue == 0) {
            getProducts(1);
        } else if (newValue == 1) {
            getProductsList(true, '');
            getDiscounts(1);
        } else {
            getGroups(1);
        }
    }

    useEffect(() => {
        getLevels(1);
        getTradeables();
    }, []);

    /**
         * Retrieves Levels list.
         * @returns None
        */
    const [levels, setLevels] = useState([]);
    const [loadingLevels, setLoadingLevels] = useState(true);
    const [levelsLimit, setLevelsLimit] = useState(50);
    const [levelsTotal, setLevelsTotal] = useState(0);
    const getLevels = (page) => {
        setLoadingLevels(true);
        ApiCall('/level', 'GET', locale, {}, `sortOrder=0&sortBy=createdAt&limit=${levelsLimit}&skip=${(page * levelsLimit) - levelsLimit}`, 'admin', router).then(async (result) => {
            setLevelsTotal(result.count);
            setLevels(result.data);
            setLoadingLevels(false);
        }).catch((error) => {
            setLoadingLevels(false);
            console.log(error);
        });
    }

    const [productLevels, setProductLevels] = useState([]);
    const handleChangeAddLevel = (event) => {
        const {
            target: { value },
        } = event;
        setProductLevels(typeof value === 'string' ? value.split(',') : value);
    }

    const [editproductLevels, setEditProductLevels] = useState([]);
    const handleEditChangeAddLevel = (event) => {
        const {
            target: { value },
        } = event;

        const newValues = typeof value === 'string' ? value.split(',') : value;

        const updatedLevels = [...editproductLevels, ...newValues].reduce((data, item) => {
            if (!data.some(existingItem => existingItem._id === item._id)) {
                data.push(item);
            }
            return data;
        }, []);

        setEditProductLevels(updatedLevels);
    }

    /**
         * Retrieves Tradeables list.
         * @returns None
        */
    const [tradeables, setTradeables] = useState([]);
    const [loadingTradeables, setLoadingTradeables] = useState(true);
    const getTradeables = () => {
        setLoadingTradeables(true);
        ApiCall('/tradeable', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setTradeables(result.data);
            setLoadingTradeables(false);
        }).catch((error) => {
            setLoadingTradeables(false);
            console.log(error);
        });
    }

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(true);
    const [openBottomFilterDrawer, setOpenBottomFilterDrawer] = useState(false);

    const PRODUCTS_TABLE_HEAD = [
        {
            label: 'نام محصول',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'جزئیات',
            classes: ""
        },
        {
            label: 'دسته بندی محصول',
            classes: ""
        },
        {
            label: '',
            classes: ""
        },
    ]

    const [pageItem, setPageItem] = useState(1);
    useEffect(() => {
        getProducts(1);
    }, [pageItem]);

    /**
         * Retrieves Products list.
         * @returns None
        */
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [productsLimit, setProductsLimit] = useState(10);
    const [productsTotal, setProductsTotal] = useState(0);
    const getProducts = (page, search) => {
        setLoadingProducts(true);
        ApiCall('/product/admin', 'GET', locale, {}, `${search ? `search=${search}&` : ''}limit=${productsLimit}&skip=${(page * productsLimit) - productsLimit}&sortBy=createdAt&sortOrder=0`, 'admin', router).then(async (result) => {
            setProductsTotal(result.count);
            setProducts(result.data);
            getProductsGroups(result.data);
        }).catch((error) => {
            console.log(error);
        });
    }
    /**
         * Retrieves Product Group list.
         * @returns None
        */
    const [productGroups, setProductGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loadingProductGroups, setLoadingProductGroups] = useState(true);
    const getProductsGroups = (products) => {
        ApiCall('/product-group', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            const groups = result.data;

            const productIdToCategory = {};
            groups.forEach(group => {
                group.products?.forEach(productId => {
                    productIdToCategory[productId] = {
                        _id: group._id,
                        title: group.title
                    };
                });
            });

            const updatedProducts = products.map(product => ({
                ...product,
                category: productIdToCategory[product._id] || null
            }));

            setProducts(updatedProducts);
            setProductGroups(groups);
            setLoadingProducts(false);
            setLoadingProductGroups(false);
        }).catch((error) => {
            setLoadingProducts(false);
            setLoadingProductGroups(false);
            console.log(error);
        });
    }

    const handleProductsPageChange = (event, value) => {
        setPageItem(value);
        getProducts(value);
    }

    /**
     * Search for a Products based on the input value and filter the displayed Products accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchProducts, setSearchProducts] = useState('');
    var typingTimerProducts;
    const doneTypingIntervalProducts = 300;
    const searchProductsItems = (event) => {
        clearTimeout(typingTimerProducts);

        typingTimerProducts = setTimeout(() => {
            if (event.target.value == '') {
                setSearchProducts('');
                setPageItem(1);
                getProducts(1, '');
            } else {
                setSearchProducts(event.target.value);
                setPageItem(1);
                getProducts(1, event.target.value);
            }
        }, doneTypingIntervalProducts);

    }
    const searchProductsItemsHandler = () => {
        clearTimeout(typingTimerProducts)
    }

    const [showAddProduct, setShowAddProduct] = useState(false);
    const [openBottomAddProductDrawer, setOpenBottomAddProductDrawer] = useState(false);
    const handleShowAddProduct = () => {
        if (window.innerWidth >= 1024) {
            setShowAddProduct(true);
            setOpenBottomAddProductDrawer(false);
        } else {
            setShowAddProduct(false);
            setOpenBottomAddProductDrawer(true);
        }
    }

    const [productData, setProductData] = useState();
    const [showEditProduct, setShowEditProduct] = useState(false);
    const [openBottomEditProductDrawer, setOpenBottomEditProductDrawer] = useState(false);
    const handleShowEditProduct = (data) => () => {
        setProductData(data);
        setProductEditPrice(data.price || 0);
        setHasEditPrice(data.price > 0);
        setEditProductLevels(data.forLevels || []);
        if (window.innerWidth >= 1024) {
            setShowEditProduct(true);
            setOpenBottomEditProductDrawer(false);
        } else {
            setShowEditProduct(false);
            setOpenBottomEditProductDrawer(true);
        }
    }

    /**
     * Handles the change event for Adding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [addProduct, setAddProduct] = useState(
        {
            name: '',
            weight: '',
            tradeableId: '',
            wage: '',
            carat: '',
            image: '',
            isQuantitative: false,
            stock: 0,
            isActive: true,
            description: '',
            minDeliverableAmount: '',
            priceApi: '',
            pricePathInApi: '',
            priceApiMethod: 'GET',
            priceApiHeaders: [],
            isToman: true,
            shouldUpdatePriceWithApi: true,
            ignoreApiError: true,
            wageType: 'Fixed',
            isPriceBasedOnWeight: false,
            wallgoldIntegrationIsActive: false,
            enableZarbahaApi: false
        }
    )
    const priceMethods = [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' }
    ]
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('این فیلد الزامی است'),
        weight: Yup.string().when(["hasPrice", "isQuantitative"], {
            is: (hasPrice, isQuantitative) => !hasPrice && !isQuantitative,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('این فیلد الزامی است'),
        }),
        tradeableId: Yup.string().required('این فیلد الزامی است'),
        isQuantitative: Yup.boolean(),
        minDeliverableAmount: Yup.string().when("isQuantitative", {
            is: false,
            then: schema => schema.required('این فیلد الزامی است'),
            otherwise: schema => schema.optional(),
        }),
        maxDecimals: Yup.string().when("isQuantitative", {
            is: false,
            then: schema => schema.required('این فیلد الزامی است'),
            otherwise: schema => schema.optional(),
        }),
        stock: Yup.string().required('این فیلد الزامی است'),
        wage: Yup.string().required('این فیلد الزامی است'),
        carat: Yup.string().required('این فیلد الزامی است'),
        image: Yup.string().required('این فیلد الزامی است'),
        hasPrice: Yup.boolean(),
        price: Yup.string().when(["hasPrice", "shouldUpdatePriceWithApi"], {
            is: (hasPrice, shouldUpdatePriceWithApi) => hasPrice && !shouldUpdatePriceWithApi,
            then: schema => schema.required('این فیلد الزامی است'),
            otherwise: schema => schema.optional(),
        }),
        shouldUpdatePriceWithApi: Yup.boolean(),
        priceApi: Yup.string().when(["hasPrice", "shouldUpdatePriceWithApi"], {
            is: (hasPrice, shouldUpdatePriceWithApi) => hasPrice && shouldUpdatePriceWithApi,
            then: (schema) => schema.required('این فیلد الزامی است').url('این فیلد باید یک لینک معتبر باشد'),
            otherwise: (schema) => schema.optional(),
        }),
        pricePathInApi: Yup.string().when(["hasPrice", "shouldUpdatePriceWithApi"], {
            is: (hasPrice, shouldUpdatePriceWithApi) => hasPrice && shouldUpdatePriceWithApi,
            then: (schema) => schema.required('این فیلد الزامی است'),
            otherwise: (schema) => schema.optional(),
        }),
        priceApiMethod: Yup.string().required('این فیلد الزامی است'),
        priceApiHeaders: Yup.array().of(
            Yup.object().shape({
                key: Yup.string()
                    .required('این فیلد الزامی است'),
                value: Yup.string()
                    .required('این فیلد الزامی است')
            })
        )
    });

    const { control, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            isQuantitative: false,
            hasPrice: false,
            shouldUpdatePriceWithApi: true,
            priceApiMethod: 'GET'
        }
    });

    const clearForm = () => {
        setValue('name', '');
        setValue('weight', '');
        setValue('tradeableId', '');
        setValue('stock', '');
        setValue('wage', '');
        setValue('carat', '');
        setValue('image', '');
        setValue('price', '');
        setValue('isQuantitative', false);
        setValue('hasPrice', false);
        setValue('minDeliverableAmount', '');
        setValue('priceApi', '');
        setValue('pricePathInApi', '');
        setValue('priceApiMethod', 'GET');
        setValue('shouldUpdatePriceWithApi', true);
    }

    const [hasPrice, setHasPrice] = useState(false);
    const [productPrice, setProductPrice] = useState(0);
    const handleChangeAddData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddProduct((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    /**
     * Handles the change event for Eding products inputs.
     * @param {string} input - The name of the input field being changed.
     * @param {string} type - The type of the input field.
     * @param {Event} event - The change event object.
     * @returns None
     */
    const [hasEditPrice, setHasEditPrice] = useState(false);
    const [productEditPrice, setProductEditPrice] = useState(0);
    const handleChangeEditData = (input, type) => (event) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            case "priceApi":
                value = event.target.value;
                if (/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(event.target.value)) {
                    setPriceApiError(false);
                } else {
                    setPriceApiError(true);
                }
                break;
            default:
                value = event.target.value;
                break;
        }
        setProductData((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    const [isDisabled, setIsDisabled] = useState(false);
    const openItemImageFile = (event) => {
        if (!isDisabled) {
            document.querySelector('input#ItemPic').click();
        }
    }

    /**
     * Uploads an Item Image asynchronously.
     * @param {{File}} file - The Image file to upload.
     * @returns None
     * @throws Any error that occurs during the upload process.
     */
    const [imageLoading, setImageLoading] = useState(false);
    const uploadItemImage = (type) => (event) => {
        try {
            if (event.target.files && event.target.files[0]) {
                setImageLoading(true);
                setIsDisabled(true);
                let file = new FormData();
                file.append("file", event.target.files[0]);
                ApiCall('/upload', 'POST', locale, file, '', 'admin', router, true).then(async (result) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    if (type == 'add') {
                        setAddProduct({ ...addProduct, image: result.fileUrl });
                        setValue('image', result.fileUrl)
                    } else {
                        setProductData({ ...productData, image: result.fileUrl });
                    }
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.Success'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    setImageLoading(false);
                    setIsDisabled(false);
                    let list = '';
                    error.message && typeof error.message == 'object' ? error.message.map(item => {
                        list += `${item}<br />`
                    }) : list = error.message;
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: list,
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                });
            }

        } catch (error) {
            setImageLoading(false);
            setIsDisabled(false);
            console.log(error);
        }
    }

    /**
     * Add A Product.
     * @returns None
    */
    const saveProduct = () => {
        setLoading(true);
        let newData = FilterEmptyFields(addProduct);
        const forLevels = productLevels?.map(item => item._id);
        const { isToman, priceApi, pricePathInApi, priceApiMethod, priceApiHeaders, shouldUpdatePriceWithApi, ignoreApiError, wageType, isPriceBasedOnWeight, isQuantitative, enableZarbahaApi, ...restAddProduct } = newData;

        let body;
        if (hasPrice) {
            if (addProduct?.shouldUpdatePriceWithApi) {
                body = {
                    ...restAddProduct,
                    forLevels,
                    price: shouldUpdatePriceWithApi ? 1 : productPrice,
                    enableZarbahaApi: addProduct?.enableZarbahaApi,
                    wageType: addProduct?.wageType,
                    priceApiFields: {
                        shouldUpdatePriceWithApi: addProduct?.shouldUpdatePriceWithApi,
                        isToman: addProduct?.isToman,
                        priceApi: addProduct?.priceApi,
                        pricePathInApi: addProduct?.pricePathInApi,
                        priceApiMethod: addProduct?.priceApiMethod,
                        priceApiHeaders: addProduct?.priceApiHeaders,
                        ignoreApiError: addProduct?.ignoreApiError,
                        isPriceBasedOnWeight: addProduct?.isPriceBasedOnWeight
                    }
                }
            } else if (addProduct?.enableZarbahaApi) {
                body = {
                    ...restAddProduct,
                    forLevels,
                    price: shouldUpdatePriceWithApi ? 1 : productPrice,
                    enableZarbahaApi: addProduct?.enableZarbahaApi,
                    wageType: addProduct?.wageType,
                    priceApiFields: {
                        pricePathInApi: addProduct?.pricePathInApi
                    }
                }
            } else {
                body = {
                    ...restAddProduct,
                    forLevels,
                    price: shouldUpdatePriceWithApi ? 1 : productPrice,
                    enableZarbahaApi: addProduct?.enableZarbahaApi,
                    wageType: addProduct?.wageType
                }
            }
        } else {
            body = {
                ...restAddProduct,
                isQuantitative: addProduct?.isQuantitative,
                forLevels,
            }
        }
        let url = hasPrice ? '/product/with-price' : '/product/without-price';

        ApiCall(url, 'POST', locale, body, '', 'admin', router).then(async (result) => {
            setLoading(false);
            setShowAddProduct(false);
            setOpenBottomAddProductDrawer(false);
            setAddProduct({
                name: '',
                tradeableId: '',
                weight: '',
                wage: '',
                carat: '',
                image: '',
                isQuantitative: false,
                stock: 0,
                isActive: true,
                description: '',
                minDeliverableAmount: '',
                priceApi: '',
                pricePathInApi: '',
                priceApiMethod: 'GET',
                priceApiHeaders: [],
                isToman: true,
                shouldUpdatePriceWithApi: true,
                ignoreApiError: true,
                wageType: 'Fixed',
                isPriceBasedOnWeight: false,
                wallgoldIntegrationIsActive: false,
                enableZarbahaApi: false
            });
            clearForm();
            setValue('priceApiHeaders', []);
            setProductLevels([]);
            setHasPrice(false);
            setProductPrice(0);
            getProducts(1);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.SuccessRequest'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const validatePriceApiHeaders = (headers) => {
        const errors = [];

        headers?.forEach((header, index) => {
            const headerErrors = {};

            if (!header?.key) {
                headerErrors.key = 'این فیلد الزامی است';
            }

            if (!header?.value) {
                headerErrors.value = 'این فیلد الزامی است';
            }

            if (Object.keys(headerErrors)?.length > 0) {
                errors[index] = headerErrors;
            }
        });

        return errors.length > 0 ? errors : null;
    }

    /**
     * Edit A Product.
     * @returns None
    */
    const [priceApiError, setPriceApiError] = useState(false);
    const [pricePathInApiError, setPricePathInApiError] = useState(false);
    const [priceHeadersErrors, setPriceHeadersErrors] = useState([]);
    const editProduct = (productId) => (event) => {
        event.preventDefault();
        const headerErrors = validatePriceApiHeaders(productData.priceApiHeaders || []);

        if (headerErrors && productData?.shouldUpdatePriceWithApi) {
            setPriceHeadersErrors((prevErrors) => ({
                ...prevErrors,
                priceApiHeaders: headerErrors,
            }));
            return;
        } else {
            setPriceHeadersErrors((prevErrors) => ({
                ...prevErrors,
                priceApiHeaders: null,
            }));
        }

        if (!hasEditPrice || (!productData?.shouldUpdatePriceWithApi || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(productData?.priceApi))) {
            if (!hasEditPrice || (!productData?.shouldUpdatePriceWithApi || (productData?.pricePathInApi && !['', undefined, null].includes(productData?.pricePathInApi)))) {
                setLoading(true);
                setPriceApiError(false);
                setPricePathInApiError(false);
                const { priceApiHeaders, ...productDataWithoutHeaders } = productData;
                let newData = FilterEmptyFields(productDataWithoutHeaders);
                const forLevels = editproductLevels?.map(item => item._id);
                const { isToman, priceApi, pricePathInApi, priceApiMethod, shouldUpdatePriceWithApi, ignoreApiError, wageType, isPriceBasedOnWeight, ...restNewData } = newData;
                const filteredPriceData = FilterObjectFields(restNewData, [
                    "name",
                    "tradeableId",
                    "weight",
                    "wage",
                    "carat",
                    "image",
                    "stock",
                    "isActive",
                    "description",
                    "wallgoldIntegrationIsActive",
                    "enableZarbahaApi"
                ]);
                const filteredNotPriceData = FilterObjectFields(restNewData, [
                    "name",
                    "tradeableId",
                    "wage",
                    "carat",
                    "image",
                    "stock",
                    "isActive",
                    "description",
                    "minDeliverableAmount",
                    "maxDecimals",
                    "wallgoldIntegrationIsActive"
                ]);
                let body;
                if (hasEditPrice) {
                    body = {
                        ...filteredPriceData,
                        forLevels,
                        price: shouldUpdatePriceWithApi ? 1 : productEditPrice,
                        wageType: productData?.wageType,
                        priceApiFields: {
                            shouldUpdatePriceWithApi: productData?.shouldUpdatePriceWithApi,
                            isToman: productData?.isToman || false,
                            priceApi: productData?.priceApi || 'https://goldika.ir/api/public/price',
                            pricePathInApi: productData?.pricePathInApi || 'data.price.buy',
                            priceApiMethod: productData?.priceApiMethod || 'GET',
                            priceApiHeaders: productData?.priceApiHeaders,
                            ignoreApiError: productData?.ignoreApiError || false,
                            isPriceBasedOnWeight: productData?.isPriceBasedOnWeight || false
                        }
                    }
                } else {
                    body = {
                        ...filteredNotPriceData,
                        forLevels,
                    }
                }

                let url = hasEditPrice ? `/product/with-price/${productId}` : `/product/without-price/${productId}`;

                ApiCall(url, 'PATCH', locale, body, '', 'admin', router).then(async (result) => {
                    event.target.disabled = false;
                    setLoading(false);
                    setShowEditProduct(false);
                    setOpenBottomEditProductDrawer(false);
                    setProductData();
                    setEditProductLevels([]);
                    setHasEditPrice(false);
                    setProductEditPrice(0);
                    getProducts(1);
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: langText('Global.SuccessRequest'),
                            type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                }).catch((error) => {
                    setLoading(false);
                    console.log(error);
                    event.target.disabled = false;
                    let list = '';
                    error.message && typeof error.message == 'object' ? error.message.map(item => {
                        list += `${item}<br />`
                    }) : list = error.message;
                    dispatch({
                        type: 'setSnackbarProps', value: {
                            open: true, content: list,
                            type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                        }
                    });
                });
            } else {
                setPricePathInApiError(true);
            }
        } else {
            setPriceApiError(true);
        }
    }

    /**
    * change Status for a Product.
    * @returns None
   */
    const [changeStatusProductLoading, setChangeStatusProductLoading] = useState(false);
    const changeStatusProduct = (productId, isActive, withPrice) => (event) => {
        event.preventDefault();
        setChangeStatusProductLoading(true);
        event.target.disabled = true;
        let url = withPrice ? `/product/with-price/${productId}` : `/product/without-price/${productId}`;
        ApiCall(url, 'PATCH', locale, { isActive }, '', 'admin', router).then(async (result) => {
            event.target.disabled = false;
            setChangeStatusProductLoading(false);
            getProducts(1);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setChangeStatusProductLoading(false);
            console.log(error);
            event.target.disabled = false;
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const [openDialog, setOpenDialog] = useState(false);
    const [deleteId, setDeleteId] = useState('');

    const handleOpenDialog = (deleteId) => (event) => {
        setDeleteId(deleteId);
        setOpenDialog(true);
    }
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    /**
    * Delete a Product.
    * @returns None
   */
    const deleteProduct = () => {
        setDeleteLoading(true);
        ApiCall(`/product/${deleteId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getProducts(1);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setDeleteLoading(false);
            console.log(error);
            handleCloseDialog();
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const [showProductGroup, setShowProductGroup] = useState(false);
    const [openBottomProductGroupDrawer, setOpenBottomProductGroupDrawer] = useState(false);
    const handleEditProductGroup = (product) => (event) => {
        event.preventDefault();
        setAddProductGroup((prevState) => ({
            ...prevState,
            productId: product?._id
        }));
        setGroups(product?.category);
        if (window.innerWidth >= 1024) {
            setShowProductGroup(true);
            setOpenBottomProductGroupDrawer(false);
        } else {
            setShowProductGroup(false);
            setOpenBottomProductGroupDrawer(true);
        }
    }

    const [addProductGroup, setAddProductGroup] = useState({
        productId: '',
        productGroupId: ''
    });

    /**
    * Save Product Group.
    * @returns None
   */
    const saveProductGroup = () => {
        setLoading(true);
        ApiCall('/product-group/add-product', 'POST', locale, { ...addProductGroup }, '', 'admin', router).then(async (result) => {
            setLoading(false);

            const group = productGroups?.find(g => g._id == addProductGroup?.productGroupId);
            const category = {
                _id: group._id,
                title: group.title
            };

            const updatedProducts = products.map(product => {
                if (product._id === addProductGroup?.productId) {
                    return {
                        ...product,
                        category: category
                    };
                }
                return product;
            });

            setProducts(updatedProducts);

            setShowProductGroup(false);
            setOpenBottomProductGroupDrawer(false);
            setAddProductGroup({
                productId: '',
                productGroupId: ''
            });
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    /**
    * Remove Product Group.
    * @returns None
   */
    const [loadingRemoveProductGroup, setLoadingRemoveProductGroup] = useState(false);
    const removeProductGroup = (id, index) => (event) => {
        setLoadingRemoveProductGroup(true);
        ApiCall(`/product-group/${id}/remove-from-group`, 'PATCH', locale, {}, '', 'admin', router).then(async (result) => {
            setGroups(null);
            setProducts((prevProducts) =>
                prevProducts.map(product =>
                    product._id == id
                        ? { ...product, category: null }
                        : product
                )
            );
            setLoadingRemoveProductGroup(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoadingRemoveProductGroup(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const GROUPS_TABLE_HEAD = [
        {
            label: 'نام دسته بندی',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: 'جزئیات',
            classes: ""
        },
        {
            label: '',
            classes: ""
        }
    ]

    const validationGroupSchema = Yup.object({
        title: Yup.string().required('این فیلد الزامی است')
    });

    const { control: controlGroup, setValue: setGroupValue, handleSubmit: handleGroupSubmit, formState: { errors: errorsGroup } } = useForm({
        resolver: yupResolver(validationGroupSchema),
    });

    const clearGroupForm = () => {
        setGroupValue('title', '');
    }

    /**
         * Retrieves Product Group list.
         * @returns None
        */
    const [groupsList, setGroupsList] = useState([]);
    const [groupTitle, setGroupTitle] = useState('');
    const getGroups = (page) => {
        setLoadingProductGroups(true);
        ApiCall('/product-group', 'GET', locale, {}, ``, 'admin', router).then(async (result) => {
            setGroupsList(result.data);
            setLoadingProductGroups(false);
        }).catch((error) => {
            setLoadingProductGroups(false);
            console.log(error);
        });
    }

    const [showAddGroup, setShowAddGroup] = useState(false);
    const [openBottomAddGroupDrawer, setOpenBottomAddGroupDrawer] = useState(false);
    const handleShowAddGroup = () => {
        if (window.innerWidth >= 1024) {
            setShowAddGroup(true);
            setOpenBottomAddGroupDrawer(false);
        } else {
            setShowAddGroup(false);
            setOpenBottomAddGroupDrawer(true);
        }
    }

    const [groupData, setGroupData] = useState();
    const [showEditGroup, setShowEditGroup] = useState(false);
    const [openBottomEditGroupDrawer, setOpenBottomEditGroupDrawer] = useState(false);
    const handleShowEditGroup = (data) => () => {
        setGroupData(data);
        if (window.innerWidth >= 1024) {
            setShowEditGroup(true);
            setOpenBottomEditGroupDrawer(false);
        } else {
            setShowEditGroup(false);
            setOpenBottomEditGroupDrawer(true);
        }
    }

    /**
    * Save a Group.
    * @returns None
   */
    const saveGroup = () => {
        setLoading(true);
        ApiCall(`/product-group`, 'POST', locale, { title: groupTitle }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getGroups(1);
            setShowAddGroup(false);
            setOpenBottomAddGroupDrawer(false);
            setGroupTitle('');
            clearGroupForm();
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    /**
    * Edit a Group.
    * @returns None
   */
    const editGroup = () => {
        setLoading(true);
        ApiCall(`/product-group/${groupData?._id}`, 'PATCH', locale, { title: groupData?.title }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getGroups(1);
            setGroupData('');
            setShowEditGroup(false);
            setOpenBottomEditGroupDrawer(false);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    /**
    * Delete a Group.
    * @returns None
   */
    const deleteGroup = () => {
        setDeleteLoading(true);
        ApiCall(`/product-group/${deleteId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getGroups(1);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setDeleteLoading(false);
            console.log(error);
            handleCloseDialog();
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    // Discounts
    const DISCOUNTS_TABLE_HEAD = [
        {
            label: 'کد تخفیف',
            classes: ""
        },
        {
            label: 'مقدار تخفیف',
            classes: ""
        },
        {
            label: 'تاریخ انقضا',
            classes: ""
        },
        {
            label: 'تاریخ ثبت',
            classes: ""
        },
        {
            label: '',
            classes: ""
        }
    ]

    /**
         * Retrieves Discounts list.
         * @returns None
        */
    const [discounts, setDiscounts] = useState({});
    const [loadingDiscounts, setLoadingDiscounts] = useState(true);
    const [discountsLimit, setDiscountsLimit] = useState(10);
    const [discountsTotal, setDiscountsTotal] = useState(0);
    const getDiscounts = (page, search) => {
        setLoadingDiscounts(true);
        ApiCall('/discount', 'GET', locale, {}, `${search ? `search=${search}&` : ''}sortOrder=0&sortBy=createdAt&limit=${discountsLimit}&skip=${(page * discountsLimit) - discountsLimit}`, 'admin', router).then(async (result) => {
            setDiscountsTotal(result.count);
            setDiscounts(result.data);
            setLoadingDiscounts(false);
        }).catch((error) => {
            setLoadingDiscounts(false);
            console.log(error);
        });
    }

    const handlePageChange = (event, value) => {
        setPageItem(value);
        getDiscounts(value);
    }

    /**
     * Search for a Discounts based on the input value and filter the displayed Discounts accordingly.
     * @param {{Event}} event - The event object triggered by the search input.
     * @returns None
     */
    const [searchDiscounts, setSearchDiscounts] = useState('');
    var typingTimerDiscounts;
    const doneTypingIntervalDiscounts = 300;
    const searchDiscountsItems = (event) => {
        clearTimeout(typingTimerDiscounts);

        typingTimerDiscounts = setTimeout(() => {
            if (event.target.value == '') {
                setSearchDiscounts('');
                setPageItem(1);
                getDiscounts(1, '');
            } else {
                setSearchDiscounts(event.target.value);
                setPageItem(1);
                getDiscounts(1, event.target.value);
            }
        }, doneTypingIntervalDiscounts);

    }
    const searchDiscountsItemsHandler = () => {
        clearTimeout(typingTimerDiscounts)
    }

    const [showAddDiscount, setShowAddDiscount] = useState(false);
    const [openBottomAddDiscountDrawer, setOpenBottomAddDiscountDrawer] = useState(false);
    const handleShowDiscount = () => {
        if (window.innerWidth >= 1024) {
            setShowAddDiscount(true);
            setOpenBottomAddDiscountDrawer(false);
        } else {
            setShowAddDiscount(false);
            setOpenBottomAddDiscountDrawer(true);
        }
    }

    const [totalProduct, setTotalProduct] = useState(true);
    const [addDiscount, setAddDiscount] = useState({
        code: '',
        amount: '',
        expiry: '',
        type: 'Fixed',
        forProducts: []
    });

    /**
  * save discount expire date with the selected date from the datepicker.
  * @param {Event} event - The event object containing the selected date.
  * @returns None
  */
    const [expireDate, setExpireDate] = useState('');
    const [isGregorian, setIsGregorian] = useState(locale == "fa" ? false : true);
    const expireDatepicker = (event) => {
        setAddDiscount({ ...addDiscount, expiry: event.locale(locale).format("YYYY-MM-DDT12:00:00.000Z") });
        if (locale == 'fa') {
            setExpireDate(event.locale(locale).format("jYYYY-jMM-jDD"));
        } else {
            setExpireDate(event.locale(locale).format("YYYY-MM-DD"));
        }
    }

    /**
         * Handles the change event for saving discounts data.
         * @param {string} input - The name of the input field being changed.
         * @param {string} type - The type of the input field.
         * @param {Event} event - The change event object.
         * @returns None
         */
    const handleChangeAddDiscountData = (event, input, type) => {
        let value;
        switch (type) {
            case "checkbox":
                value = event.target.checked;
                break;
            case "numberFormat":
                value = Number(event.target.value.replace(/,/g, ''));
                break;
            default:
                value = event.target.value;
                break;
        }
        setAddDiscount((prevState) => ({
            ...prevState,
            [input]: value,
        }));
    }

    const validationDiscountSchema = Yup.object({
        code: Yup.string().required('این فیلد الزامی است'),
        amount: Yup.string().required('این فیلد الزامی است').transform(value => value?.replace(/,/g, '')),
        expiry: Yup.string().required('این فیلد الزامی است'),
        totalProduct: Yup.boolean(),
        forProducts: Yup.string().when("totalProduct", {
            is: true,
            then: schema => schema.optional(),
            otherwise: schema => schema.required('محصولی را انتخاب نمائید'),
        })
    });

    const { control: controlDiscount, setValue: setDiscountValue, handleSubmit: handleDiscountSubmit, formState: { errors: errorsDiscount } } = useForm({
        resolver: yupResolver(validationDiscountSchema),
        defaultValues: { totalProduct: true }
    });

    const clearDiscountForm = () => {
        setDiscountValue('code', '');
        setDiscountValue('amount', '');
        setDiscountValue('expiry', '');
        setDiscountValue('forProducts', []);
    }

    /**
    * Save new Discount.
    * @returns None
   */
    const saveDiscount = () => {
        setLoading(true);
        const products = addDiscount?.forProducts.map(item => item.value);
        const { forProducts, ...restAddDiscount } = addDiscount;

        ApiCall('/discount', 'POST', locale, { ...restAddDiscount, forProducts: products }, '', 'admin', router).then(async (result) => {
            setLoading(false);
            getDiscounts(pageItem);
            setShowAddDiscount(false);
            setOpenBottomAddDiscountDrawer(false);
            setAddDiscount({
                code: '',
                amount: '',
                expiry: '',
                type: 'Fixed',
                forProducts: []
            });
            clearDiscountForm();
            setExpireDate('');
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        }).catch((error) => {
            setLoading(false);
            console.log(error);
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    /**
    * Delete a Discount.
    * @returns None
    */
    const [deleteLoading, setDeleteLoading] = useState(false);
    const deleteDiscount = () => {
        setDeleteLoading(true);
        ApiCall(`/discount/${deleteId}`, 'DELETE', locale, {}, '', 'admin', router).then(async (result) => {
            setDeleteLoading(false);
            getDiscounts(pageItem);
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: langText('Global.Success'),
                    type: 'success', duration: 1000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
            handleCloseDialog();
        }).catch((error) => {
            setDeleteLoading(false);
            console.log(error);
            handleCloseDialog();
            let list = '';
            error.message && typeof error.message == 'object' ? error.message.map(item => {
                list += `${item}<br />`
            }) : list = error.message;
            dispatch({
                type: 'setSnackbarProps', value: {
                    open: true, content: list,
                    type: 'error', duration: 3000, refresh: parseInt(Math.floor(Math.random() * 100) + 1)
                }
            });
        });
    }

    const [productsDiscount, setProductsDiscount] = useState([]);
    const [productsDiscountSelectLoading, setProductsDiscountselectLoading] = useState(true);
    const [pageProducts, setPageProducts] = useState(1);
    const [showMoreProducts, setShowMoreProducts] = useState(false);
    const [productsDiscountLimit, setProductsDiscountLimit] = useState(20);
    const getProductsList = (type, search) => {
        if (search) {
            setShowMoreProducts(false);
            ApiCall('/product/admin', 'GET', locale, {}, `limit=${productsDiscountLimit}${search ? `&search=${search}` : ''}`, 'admin', router).then(async (result) => {
                const products = result.data.map(item => {
                    return {
                        value: item._id,
                        label: item
                    }
                });
                setProductsDiscount(products);
                setProductsDiscountselectLoading(false);
            }).catch((error) => {
                setProductsDiscountselectLoading(false);
                setProductsDiscount([]);
            });
        } else {
            ApiCall('/product/admin', 'GET', locale, {}, `limit=${productsDiscountLimit}&skip=${type ? 0 : (pageItem * productsDiscountLimit) - productsDiscountLimit}`, 'admin', router).then(async (result) => {
                if (type) {
                    Math.ceil(result.count / productsDiscountLimit) == 1 ? setShowMoreProducts(false) : setShowMoreProducts(true);
                    const products = result.data.map(item => {
                        return {
                            value: item._id,
                            label: item
                        }
                    });
                    setProductsDiscount(products);
                    setPageProducts(2);
                } else {
                    pageProducts == Math.ceil(result.count / productsDiscountLimit) ? setShowMoreProducts(false) : setShowMoreProducts(true);
                    const products = result.data.map(item => {
                        return {
                            value: item._id,
                            label: item
                        }
                    });
                    setProductsDiscount([...productsDiscount, ...products]);
                    setPageProducts((prevPage) => prevPage + 1);
                }
                setProductsDiscountselectLoading(false);
            }).catch((error) => {
                setProductsDiscountselectLoading(false);
                setProductsDiscount([]);
            });
        }
    }

    /**
         * Search for a coin based on the input value and filter the displayed coin pairs accordingly.
         * @param {{Event}} event - The event object triggered by the search input.
         * @returns None
         */
    const [searchProductsList, setSearchProductsList] = useState('');
    var typingTimerUsers;
    const doneTypingIntervalUsers = 300;
    const searchProductsListItems = (event) => {
        clearTimeout(typingTimerUsers);

        typingTimerUsers = setTimeout(() => {
            if (event.target.value == '') {
                setSearchProductsList('');
                getProductsList(true, '');
            } else {
                setPageProducts(1);
                setSearchProductsList(event.target.value);
                getProductsList(false, event.target.value);
            }
        }, doneTypingIntervalUsers);

    }
    const searchProductsListItemsHandler = () => {
        clearTimeout(typingTimerUsers)
    }

    /**
     * Renders custom content for the users component.
     * @param {object} props - The props passed to the component.
     * @param {object} state - The state of the component.
     * @param {object} methods - The methods available to the component.
     * @returns {JSX.Element} - The JSX element to render.
     */
    const productsCustomContentRenderer = ({ props, state, methods }) => {
        if (state.values.length > 0) {
            return (
                state.values.map(option => (
                    <div key={option.label?._id} onClick={() => methods.addItem(option)} className="badge badge-success border-solid rounded-full flex items-center justify-start gap-2 p-1 m-1">
                        <img src={`${process.env.NEXT_PUBLIC_BASEURL}${option.label?.image}`} alt={option.label?.slug} className="rounded-[50%]" width={25} height={25} />
                        <label style={{ cursor: "pointer" }}>{option.label?.name}</label>
                    </div>
                ))
            )
        } else {
            return <span>انتخاب محصول</span>
        }

    }
    /**
     * Custom renderer function for rendering a dropdown component with users options.
     * @param {object} options - The options object containing props, state, and methods.
     * @returns {JSX.Element} - The rendered dropdown component.
     */
    const productsCustomDropdownRenderer = ({ props, state, methods }) => {
        const regexp = new RegExp(methods.safeString(state.search), "i");

        return (
            <div onScroll={handleScrollProducts} style={{ height: '300px', overflow: 'auto' }}>
                <div className="select-user-dropdown">
                    <div className="px-4">
                        <input
                            type="text"
                            value={searchProductsList}
                            onChange={(event) => setSearchProductsList(event.target.value)}
                            onKeyDown={searchProductsListItemsHandler}
                            onKeyUp={searchProductsListItems}
                            placeholder="جستجو محصول"
                            className="w-full form-input border rounded-lg p-3 my-3 mx-auto"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-y-4">
                    {props.options
                        .filter((item) => { let search = props.searchBy.split(','); return regexp.test(item[search[0]]) || regexp.test(item[search[1]]) || regexp.test(item[search[2]]) || regexp.test(item[search[3]]) })
                        .map(option => {
                            return (
                                <div key={option.label?._id} onClick={() => methods.addItem(option)} className="flex items-center justify-start gap-2 px-4">
                                    <img src={`${process.env.NEXT_PUBLIC_BASEURL}${option.label?.image}`} alt={option.label?.slug} className="rounded-[50%]" width={25} height={25} />
                                    <label style={{ cursor: "pointer" }}>{option.label?.name}</label>
                                </div>
                            );
                        })}
                </div>
                {productsDiscountSelectLoading ? <div className="flex justify-center items-center mt-4"><CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} /></div> : null}
            </div>
        );
    }

    const handleScrollProducts = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;

        // Check if the user has scrolled to the bottom
        if ((scrollHeight - scrollTop === clientHeight) && productsDiscountSelectLoading == false) {
            // Call the fetchData function to load more data
            if (showMoreProducts) {
                setProductsDiscountselectLoading(true);
                getProductsList(false, '');
            }
        }
    }

    return (
        <div className="flex flex-col gap-y-8">
            <Tabs
                orientation="horizontal"
                value={tabValue}
                onChange={handleChange}
                sx={{ borderRight: 1, borderColor: 'divider' }}
            >
                <Tab label="محصولات" className="w-1/3 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
                <Tab label="کدهای تخفیف" className="w-1/3 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
                <Tab label="دسته بندی محصولات" className="w-1/3 lg:w-auto whitespace-nowrap dark:text-white" classes={{ selected: 'text-primary' }} />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">محصولات</h1>
                        <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddProduct}>
                                <text className="text-black font-semibold">افزودن محصول</text>
                            </Button >
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between gap-x-4">
                            <form autoComplete="off">
                                <FormControl className="w-full md:w-auto">
                                    <TextField
                                        size="small"
                                        type="text"
                                        label="جستجو محصول"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                        }}
                                        onChange={(event) => setSearchProducts(event.target.value)}
                                        onKeyDown={searchProductsItemsHandler}
                                        onKeyUp={searchProductsItems} />
                                </FormControl>
                            </form>
                            <span className="dark:text-white">تعداد کل: {loadingProducts ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (productsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {loadingProducts ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : products.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {PRODUCTS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {products.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <div className="flex items-center gap-x-4">
                                                            <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${data.image}`} alt={data.slug}
                                                                className="w-10 h-10 rounded-[50%]" />
                                                            <span>{data.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>

                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                            onClick={handleShowEditProduct(data)}>
                                                            <text className=" font-semibold">ویرایش</text>
                                                        </Button >
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <div className="flex items-center">
                                                            <span>{data.category?.title || '----'}</span>
                                                            <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={handleEditProductGroup(data)}>
                                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                                                                    <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H11C11.41 1.25 11.75 1.59 11.75 2C11.75 2.41 11.41 2.75 11 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V13C21.25 12.59 21.59 12.25 22 12.25C22.41 12.25 22.75 12.59 22.75 13V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="currentColor" />
                                                                    <path d="M8.50008 17.6901C7.89008 17.6901 7.33008 17.4701 6.92008 17.0701C6.43008 16.5801 6.22008 15.8701 6.33008 15.1201L6.76008 12.1101C6.84008 11.5301 7.22008 10.7801 7.63008 10.3701L15.5101 2.49006C17.5001 0.500059 19.5201 0.500059 21.5101 2.49006C22.6001 3.58006 23.0901 4.69006 22.9901 5.80006C22.9001 6.70006 22.4201 7.58006 21.5101 8.48006L13.6301 16.3601C13.2201 16.7701 12.4701 17.1501 11.8901 17.2301L8.88008 17.6601C8.75008 17.6901 8.62008 17.6901 8.50008 17.6901ZM16.5701 3.55006L8.69008 11.4301C8.50008 11.6201 8.28008 12.0601 8.24008 12.3201L7.81008 15.3301C7.77008 15.6201 7.83008 15.8601 7.98008 16.0101C8.13008 16.1601 8.37008 16.2201 8.66008 16.1801L11.6701 15.7501C11.9301 15.7101 12.3801 15.4901 12.5601 15.3001L20.4401 7.42006C21.0901 6.77006 21.4301 6.19006 21.4801 5.65006C21.5401 5.00006 21.2001 4.31006 20.4401 3.54006C18.8401 1.94006 17.7401 2.39006 16.5701 3.55006Z" fill="currentColor" />
                                                                    <path d="M19.8501 9.83003C19.7801 9.83003 19.7101 9.82003 19.6501 9.80003C17.0201 9.06003 14.9301 6.97003 14.1901 4.34003C14.0801 3.94003 14.3101 3.53003 14.7101 3.41003C15.1101 3.30003 15.5201 3.53003 15.6301 3.93003C16.2301 6.06003 17.9201 7.75003 20.0501 8.35003C20.4501 8.46003 20.6801 8.88003 20.5701 9.28003C20.4801 9.62003 20.1801 9.83003 19.8501 9.83003Z" fill="currentColor" />
                                                                </svg>
                                                            </IconButton>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        {data?.isActive ?
                                                            <>
                                                                <Tooltip title="غیرفعالسازی محصول">
                                                                    <IconButton
                                                                        color={`error`}
                                                                        onClick={changeStatusProduct(data?._id, false, data.price ? true : false)}>
                                                                        <CancelIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="حذف محصول">
                                                                    <IconButton
                                                                        color={`error`}
                                                                        onClick={handleOpenDialog(data._id)}>
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                            : <Tooltip title="فعالسازی محصول">
                                                                <IconButton
                                                                    color={`success`}
                                                                    onClick={changeStatusProduct(data?._id, true, data.price ? true : false)}>
                                                                    <CheckCircleIcon />
                                                                </IconButton>
                                                            </Tooltip>}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                {Math.ceil(productsTotal / productsLimit) > 1 ?
                                    <div className="text-center mt-4">
                                        <Pagination siblingCount={0} count={Math.ceil(productsTotal / productsLimit)} variant="outlined" color="primary" className="justify-center"
                                            page={pageItem} onChange={handleProductsPageChange} />
                                    </div>
                                    : ''}

                                <ConfirmDialog
                                    open={openDialog}
                                    onClose={handleCloseDialog}
                                    onConfirm={deleteProduct}
                                    title="آیا مطمئن هستید؟"
                                    loading={deleteLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">محصولی تعریف نشده است.</span>
                            </div>}

                    </section>


                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">کد های تخفیف</h1>
                        <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation
                                onClick={handleShowDiscount}>
                                <text className="text-black font-semibold">افزودن کد تخفیف</text>
                            </Button >
                        </div>
                    </section>
                    <section className="overflow-x-auto overflow-y-hidden">
                        <div className="flex items-center justify-between gap-x-4">
                            <form autoComplete="off">
                                <FormControl className="w-full md:w-auto">
                                    <TextField
                                        size="small"
                                        type="text"
                                        label="جستجو کد تخفیف"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl' : 'text-black rtl', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                        }}
                                        onChange={(event) => setSearchDiscounts(event.target.value)}
                                        onKeyDown={searchDiscountsItemsHandler}
                                        onKeyUp={searchDiscountsItems} />
                                </FormControl>
                            </form>
                            <span className="dark:text-white">تعداد کل: {loadingDiscounts ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={15} /> : (discountsTotal || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                        </div>
                        {loadingDiscounts ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : discounts.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {DISCOUNTS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {discounts.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{data.code}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        {(data.amount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} {data.type == 'Fixed' ? 'تومان' : 'درصد'}
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.expiry).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        <Tooltip title="حذف کد تخفیف">
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleOpenDialog(data._id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <ConfirmDialog
                                    open={openDialog}
                                    onClose={handleCloseDialog}
                                    onConfirm={deleteDiscount}
                                    title="آیا مطمئن هستید؟"
                                    loading={deleteLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">کد تخفیفی یافت نشد</span>
                            </div>}

                    </section>
                    {Math.ceil(discountsTotal / discountsLimit) > 1 ?
                        <div className="text-center mt-4">
                            <Pagination siblingCount={0} count={Math.ceil(discountsTotal / discountsLimit)} variant="outlined" color="primary" className="justify-center"
                                page={pageItem} onChange={handlePageChange} />
                        </div>
                        : ''}
                </div>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <div className=" flex flex-col gap-y-8">
                    <section className="flex items-center justify-between">
                        <h1 className="text-large-2">دسته بندی های محصولات</h1>
                        <div className="flex items-center gap-x-4">
                            <Button type="button" variant="contained" size="medium" className="rounded-lg" disableElevation onClick={handleShowAddGroup}>
                                <text className="text-black font-semibold">افزودن دسته بندی</text>
                            </Button >
                        </div>
                    </section>

                    <section>
                        {loadingProductGroups ? <div className="flex justify-center items-center mt-16"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div> : groupsList.length > 0 ?
                            <>
                                <TableContainer component={Paper} className="rounded-xl shadow-none dark:bg-dark">
                                    <Table sx={{ minWidth: 650 }} aria-label="simple table" className="rounded-xl border-separate border-spacing-y-2">
                                        <TableHead className="dark:bg-dark">
                                            <TableRow>
                                                {GROUPS_TABLE_HEAD.map((data, index) => (
                                                    <TableCell className={`${data.classes} border-b-0 px-8 text-start last:text-end pb-4`} key={index}>
                                                        <div className="text-base font-medium whitespace-nowrap dark:text-white">{data.label}</div>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {groupsList.map((data, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td': { border: 0 } }}
                                                    className="custom-card whitespace-nowrap text-xs font-medium shadow-none">
                                                    <TableCell className="rtl:rounded-r-2xl ltr:rounded-l-2xl border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{data.title}</span>
                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white" scope="row">
                                                        <span>{moment(moment(data.createdAt).format("YYYY-MM-DD HH:mm"), 'YYYY-MM-DD HH:mm')
                                                            .locale('fa')
                                                            .format('jYYYY/jMM/jDD | HH:mm')}</span>

                                                    </TableCell>
                                                    <TableCell className="border-none px-8 py-4 text-sm dark:text-white">
                                                        <Button variant="text" size="medium" color="primary" className="rounded-lg" disableElevation
                                                            onClick={handleShowEditGroup(data)}>
                                                            <text className=" font-semibold">ویرایش</text>
                                                        </Button >
                                                    </TableCell>
                                                    <TableCell className="text-end rtl:rounded-l-2xl ltr:rounded-r-2xl border-none px-8 py-4 text-sm dark:text-white">
                                                        <Tooltip title="حذف دسته بندی">
                                                            <IconButton
                                                                color={`error`}
                                                                onClick={handleOpenDialog(data._id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <ConfirmDialog
                                    open={openDialog}
                                    onClose={handleCloseDialog}
                                    onConfirm={deleteGroup}
                                    title="آیا مطمئن هستید؟"
                                    loading={deleteLoading}
                                    darkModeToggle={darkModeToggle}
                                />
                            </>
                            : <div className="py-16">
                                <span className="block text-center text-large-1 text-primary-gray">دسته بندی تعریف نشده است.</span>
                            </div>}

                    </section>
                </div>
            </TabPanel>

            {/* AddProduct */}
            <>
                <Dialog onClose={() => setShowAddProduct(false)} open={showAddProduct} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن محصول
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddProduct(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveProduct)}>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="isQuantitative"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={hasPrice ? true : addProduct?.isQuantitative}
                                                onChange={hasPrice ? () => false : (event) => {
                                                    field.onChange(event);
                                                    setAddProduct({ ...addProduct, isQuantitative: event.target.checked, weight: '' });
                                                }}
                                            />}
                                            label="محصول تعدادی می باشد ؟"
                                        />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="hasPrice"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setHasPrice(event.target.checked);
                                                    if (event.target.checked) {
                                                        setAddProduct({ ...addProduct, isQuantitative: true });
                                                        setValue('isQuantitative', true);
                                                    } else {
                                                        setAddProduct({ ...addProduct, isQuantitative: false, weight: '' });
                                                        setValue('isQuantitative', false);
                                                    }
                                                }}
                                            />}
                                            label="محصول قیمتی می باشد ؟"
                                        />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {hasPrice || addProduct?.isQuantitative ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="weight"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            customInput={TextField}
                                            type="tel"
                                            label="وزن محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.weight}
                                            helperText={errors.weight ? errors.weight.message : ''}
                                            value={addProduct?.weight}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'weight', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد. لطفا وزن را با دقت وارد نمائید.</FormHelperText>
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <div className={`col-span-12 ${hasPrice ? addProduct?.enableZarbahaApi ? 'md:col-span-4' : 'md:col-span-6' : 'md:col-span-4'}`}>
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        {hasPrice ? <>
                            <div className={`col-span-12 ${addProduct?.enableZarbahaApi ? 'md:col-span-4' : 'md:col-span-6'} w-full flex items-center`}>
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addProduct?.enableZarbahaApi}
                                            onChange={(event) => {
                                                setAddProduct((prevState) => ({
                                                    ...prevState,
                                                    enableZarbahaApi: event.target.checked, shouldUpdatePriceWithApi: false
                                                }));
                                                setValue('shouldUpdatePriceWithApi', false);
                                                setValue('priceApiHeaders', []);
                                            }}
                                        />}
                                        label="گرفتن قیمت از زربها ؟"
                                    />
                                </FormGroup>
                            </div>
                            {addProduct?.enableZarbahaApi ? <div className={`col-span-12 md:col-span-4`}>
                                <FormControl className="w-full">
                                    <Controller
                                        name="pricePathInApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="فیلد قیمت درون Api قیمت"
                                                placeholder="فروش هر گرم طلای 18 عیار"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.pricePathInApi}
                                                helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'pricePathInApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div> : ''}
                        </> : ''}
                        {addProduct?.isQuantitative ? '' :
                            <>
                                <div className="col-span-12 md:col-span-4">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="minDeliverableAmount"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={3}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل مقدار سفارش (به گرم)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.minDeliverableAmount}
                                                    helperText={errors.minDeliverableAmount ? errors.minDeliverableAmount.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'minDeliverableAmount', 'numberFormat');
                                                    }} />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="maxDecimals"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={0}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداکثر تعداد اعشار"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.maxDecimals}
                                                    helperText={errors.maxDecimals ? errors.maxDecimals.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'maxDecimals', 'numberFormat');
                                                    }} />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </>}
                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب سطح</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={productLevels}
                                    onChange={handleChangeAddLevel}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب سطوح"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value?.name} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}
                                >
                                    {levels?.map((data, index) => (
                                        <MenuItem
                                            key={index}
                                            value={data}>
                                            {data.name}
                                        </MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={`موجودی محصول ${addProduct?.isQuantitative ? '(تعداد)' : '(به گرم)'}`}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stock}
                                            helperText={errors.stock ? errors.stock.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stock', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addProduct?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            handleChangeAddData(event, 'wallgoldIntegrationIsActive', 'checkbox');
                                        }}
                                    />}
                                    label="گرفتن کارمزد محصول از وال گلد ؟"
                                />
                            </FormGroup>
                        </div>
                        {hasPrice ? '' : <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="wage"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="اجرت محصول (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.wage}
                                            helperText={errors.wage ? errors.wage.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'wage', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>}
                        <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="carat"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="عیار محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.carat}
                                            helperText={errors.carat ? errors.carat.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'carat', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('add')} />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            className="form-input cursor-default"
                                            disabled
                                            label="انتخاب تصویر محصول"
                                            InputLabelProps={{
                                                classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                readOnly: true,
                                                endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                                    {addProduct?.image ?
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${addProduct?.image}`} alt={addProduct?.slug}
                                                            className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                            <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                            <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                        </svg>}
                                                </IconButton>
                                            }}
                                            value={''}
                                            error={!!errors.image}
                                            helperText={errors.image ? errors.image.message : ''}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {hasPrice && (
                            <>
                                <div className="col-span-12 xl:col-span-3">
                                    <MUISelect
                                        type="text"
                                        variant="filled"
                                        color="black"
                                        label="نوع اجرت"
                                        className="form-select w-full"
                                        value={addProduct?.wageType}
                                        onChange={(event) => handleChangeAddData(event, 'wageType', 'text')}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        <MenuItem value="Fixed" >ثابت</MenuItem>
                                        <MenuItem value="Percent" >درصدی</MenuItem>
                                    </MUISelect>
                                </div>
                                <div className={`col-span-12 md:col-span-6 xl:col-span-3`}>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="wage"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={addProduct?.wageType == 'Fixed' ? 0 : 3}
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label={addProduct?.wageType == 'Fixed' ? "اجرت محصول (به تومان)" : "اجرت محصول (به درصد)"}
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.wage}
                                                    helperText={errors.wage ? errors.wage.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'wage', 'numberFormat');
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>

                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                checked={addProduct?.shouldUpdatePriceWithApi}
                                                onChange={(event) => {
                                                    setAddProduct((prevState) => ({
                                                        ...prevState,
                                                        price: '',
                                                        shouldUpdatePriceWithApi: event.target.checked,
                                                        priceApiHeaders: [],
                                                        enableZarbahaApi: false
                                                    }));
                                                    setValue('shouldUpdatePriceWithApi', event.target.checked);
                                                    setValue('priceApiHeaders', []);
                                                }}
                                            />}
                                            label="قیمت از وبسرویس گرفته شود ؟" />
                                    </FormGroup>
                                </div>
                                {addProduct?.shouldUpdatePriceWithApi ? '' : <div className={`col-span-12 md:col-span-6`}>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="price"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="قیمت محصول"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.price}
                                                    helperText={errors.price ? errors.price.message : ''}
                                                    onValueChange={(event) => setProductPrice(Number(event.value))}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>}
                                {addProduct?.shouldUpdatePriceWithApi ?
                                    <>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={addProduct?.ignoreApiError}
                                                        onChange={(event) => {
                                                            setAddProduct({ ...addProduct, ignoreApiError: event.target.checked });
                                                        }}
                                                    />}
                                                    label={<span className="block text-end">عدم توقف تحویل محصول در صورت خطا دادن وبسرویس قیمت ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        onChange={(event) => handleChangeAddData(event, 'isPriceBasedOnWeight', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end whitespace-nowrap">آیا قیمت دریافتی از وبسرویس در وزن محصول ضرب شود ؟</span>} />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        onChange={(event) => handleChangeAddData(event, 'isToman', 'checkbox')}
                                                    />}
                                                    label="قیمت وبسرویس به تومان می باشد ؟" />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <Controller
                                                    name="priceApi"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            type="text"
                                                            label="لینک Api قیمت گرفتن محصول"
                                                            placeholder="https://goldika.ir/api/public/price"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!errors.priceApi}
                                                            helperText={errors.priceApi ? errors.priceApi.message : ''}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                                handleChangeAddData(event, 'priceApi', 'text');
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <Controller
                                                    name="pricePathInApi"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            type="text"
                                                            label="فیلد قیمت درون Api قیمت"
                                                            placeholder="data.price.buy"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!errors.pricePathInApi}
                                                            helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                                handleChangeAddData(event, 'pricePathInApi', 'text');
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <Controller
                                                name="priceApiMethod"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl className="w-full">
                                                        <InputLabel id="demo-simple-select-label" error={!!errors.priceApiMethod}
                                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                                        <MUISelect
                                                            {...field}
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'priceApiMethod', 'text') }}
                                                            input={<OutlinedInput
                                                                id="select-multiple-chip"
                                                                label="انتخاب متد وبسرویس"
                                                                className="dark:bg-dark *:dark:text-white"
                                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                            />}
                                                            error={!!errors.priceApiMethod}
                                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                            {priceMethods?.map((data, index) => (
                                                                <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                            ))}
                                                        </MUISelect>
                                                        {errors.priceApiMethod && <FormHelperText className="text-red-500 !mx-4">{errors.priceApiMethod.message}</FormHelperText>}
                                                    </FormControl>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-12 flex items-center gap-x-4">
                                            <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                            <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                                            <IconButton onClick={() => {
                                                setAddProduct(prevState => {
                                                    const updatedHeaders = [
                                                        ...(prevState.priceApiHeaders || []),
                                                        { key: '', value: '' }
                                                    ];
                                                    setValue('priceApiHeaders', updatedHeaders);
                                                    return {
                                                        ...prevState,
                                                        priceApiHeaders: updatedHeaders
                                                    };
                                                });
                                            }}>
                                                <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                            </IconButton>
                                        </div>
                                        {addProduct?.priceApiHeaders?.map((data, index) => (
                                            <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                                <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                                    onClick={() => {
                                                        setAddProduct(prevState => {
                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                            updatedHeaders.splice(index, 1);
                                                            setValue('priceApiHeaders', updatedHeaders);
                                                            return {
                                                                ...prevState,
                                                                priceApiHeaders: updatedHeaders
                                                            };
                                                        });
                                                    }}>
                                                    <span className="mx-2">حذف</span>
                                                </Button>
                                                <div className="col-span-12 lg:col-span-4">
                                                    <Controller
                                                        name={`priceApiHeaders[${index}].key`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    {...field}
                                                                    type="tel"
                                                                    label="کلید"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                    }}
                                                                    error={!!errors.priceApiHeaders?.[index]?.key}
                                                                    helperText={errors.priceApiHeaders?.[index]?.key?.message || ''}
                                                                    value={data.key}
                                                                    onChange={(event) => {
                                                                        field.onChange(event);
                                                                        const value = event.target.value;
                                                                        setAddProduct(prevState => {
                                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                                            updatedHeaders[index] = {
                                                                                ...updatedHeaders[index],
                                                                                key: value
                                                                            };
                                                                            return {
                                                                                ...prevState,
                                                                                priceApiHeaders: updatedHeaders
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-12 lg:col-span-8">
                                                    <Controller
                                                        name={`priceApiHeaders[${index}].value`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    {...field}
                                                                    type="tel"
                                                                    label="مقدار"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                        inputProps: {
                                                                            inputMode: 'decimal'
                                                                        }
                                                                    }}
                                                                    error={!!errors.priceApiHeaders?.[index]?.value}
                                                                    helperText={errors.priceApiHeaders?.[index]?.value?.message || ''}
                                                                    value={data.value}
                                                                    onChange={(event) => {
                                                                        field.onChange(event);
                                                                        const value = event.target.value;
                                                                        setAddProduct(prevState => {
                                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                                            updatedHeaders[index] = {
                                                                                ...updatedHeaders[index],
                                                                                value: value
                                                                            };
                                                                            return {
                                                                                ...prevState,
                                                                                priceApiHeaders: updatedHeaders
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </div>
                                                <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                            </div>
                                        ))}
                                    </> : ''}
                            </>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={addProduct?.description}
                                    onChange={(event) => handleChangeAddData(event, 'description', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن محصول</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddProductDrawer}
                    onClose={() => setOpenBottomAddProductDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '90%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن محصول
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddProductDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleSubmit(saveProduct)}>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="isQuantitative"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={hasPrice ? true : addProduct?.isQuantitative}
                                                onChange={hasPrice ? () => false : (event) => {
                                                    field.onChange(event);
                                                    setAddProduct({ ...addProduct, isQuantitative: event.target.checked, weight: '' });
                                                }}
                                            />}
                                            label="محصول تعدادی می باشد ؟"
                                        />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد</FormHelperText>
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="hasPrice"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setHasPrice(event.target.checked);
                                                    if (event.target.checked) {
                                                        setAddProduct({ ...addProduct, isQuantitative: true });
                                                        setValue('isQuantitative', true);
                                                    } else {
                                                        setAddProduct({ ...addProduct, isQuantitative: false, weight: '' });
                                                        setValue('isQuantitative', false);
                                                    }
                                                }}
                                            />}
                                            label="محصول قیمتی می باشد ؟"
                                        />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="نام محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errors.name}
                                            helperText={errors.name ? errors.name.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'name', 'text');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {hasPrice || addProduct?.isQuantitative ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="weight"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            customInput={TextField}
                                            type="tel"
                                            label="وزن محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.weight}
                                            helperText={errors.weight ? errors.weight.message : ''}
                                            value={addProduct?.weight}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'weight', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد پس از ثبت قابل تغییر نمی باشد. لطفا وزن را با دقت وارد نمائید.</FormHelperText>
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}
                        <div className={`col-span-12`}>
                            <Controller
                                name="tradeableId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label" error={!!errors.tradeableId}
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                        <MUISelect
                                            {...field}
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'tradeableId', 'text') }}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب واحد قابل معامله"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            error={!!errors.tradeableId}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {tradeables?.map((data, index) => (
                                                <MenuItem key={index} value={data._id}>{data.nameFa}</MenuItem>
                                            ))}
                                        </MUISelect>
                                        {errors.tradeableId && <FormHelperText className="text-red-500 !mx-4">{errors.tradeableId.message}</FormHelperText>}
                                    </FormControl>
                                )}
                            />
                        </div>
                        {hasPrice ? <>
                            <div className={`col-span-12 ${addProduct?.enableZarbahaApi ? 'md:col-span-6' : ''} w-full flex items-center`}>
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={addProduct?.enableZarbahaApi}
                                            onChange={(event) => {
                                                setAddProduct((prevState) => ({
                                                    ...prevState,
                                                    enableZarbahaApi: event.target.checked, shouldUpdatePriceWithApi: false
                                                }));
                                                setValue('shouldUpdatePriceWithApi', false);
                                                setValue('priceApiHeaders', []);
                                            }}
                                        />}
                                        label="گرفتن قیمت از زربها ؟"
                                    />
                                </FormGroup>
                            </div>
                            {addProduct?.enableZarbahaApi ? <div className={`col-span-12 md:col-span-6`}>
                                <FormControl className="w-full">
                                    <Controller
                                        name="pricePathInApi"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                type="text"
                                                label="فیلد قیمت درون Api قیمت"
                                                placeholder="فروش هر گرم طلای 18 عیار"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                }}
                                                error={!!errors.pricePathInApi}
                                                helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    handleChangeAddData(event, 'pricePathInApi', 'text');
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </div> : ''}
                        </> : ''}
                        {addProduct?.isQuantitative ? '' :
                            <>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="minDeliverableAmount"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={3}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداقل مقدار سفارش (به گرم)"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.minDeliverableAmount}
                                                    helperText={errors.minDeliverableAmount ? errors.minDeliverableAmount.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'minDeliverableAmount', 'numberFormat');
                                                    }} />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <Controller
                                            name="maxDecimals"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={0}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="حداکثر تعداد اعشار"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.maxDecimals}
                                                    helperText={errors.maxDecimals ? errors.maxDecimals.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'maxDecimals', 'numberFormat');
                                                    }} />
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </>}
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب سطح</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={productLevels}
                                    onChange={handleChangeAddLevel}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب سطوح"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value?.name} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}
                                >
                                    {levels?.map((data, index) => (
                                        <MenuItem
                                            key={index}
                                            value={data}>
                                            {data.name}
                                        </MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="stock"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={`موجودی محصول ${addProduct?.isQuantitative ? '(تعداد)' : '(به گرم)'}`}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.stock}
                                            helperText={errors.stock ? errors.stock.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'stock', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={addProduct?.wallgoldIntegrationIsActive}
                                        onChange={(event) => {
                                            handleChangeAddData(event, 'wallgoldIntegrationIsActive', 'checkbox');
                                        }}
                                    />}
                                    label="گرفتن کارمزد محصول از وال گلد ؟"
                                />
                            </FormGroup>
                        </div>
                        {hasPrice ? '' : <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="wage"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={0}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="اجرت محصول (به تومان)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.wage}
                                            helperText={errors.wage ? errors.wage.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'wage', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>}
                        <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <Controller
                                    name="carat"
                                    control={control}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label="عیار محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            error={!!errors.carat}
                                            helperText={errors.carat ? errors.carat.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddData(event, 'carat', 'numberFormat');
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-6 ${hasPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('add')} />
                                <Controller
                                    name="image"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            className="form-input cursor-default"
                                            disabled
                                            label="انتخاب تصویر محصول"
                                            InputLabelProps={{
                                                classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                readOnly: true,
                                                endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                                    {addProduct?.image ?
                                                        <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${addProduct?.image}`} alt={addProduct?.slug}
                                                            className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" className={darkModeToggle ? 'text-white' : 'text-black'}>
                                                            <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="currentColor" />
                                                            <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="currentColor" />
                                                        </svg>}
                                                </IconButton>
                                            }}
                                            value={''}
                                            error={!!errors.image}
                                            helperText={errors.image ? errors.image.message : ''}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        {hasPrice && (
                            <>
                                <div className="col-span-12">
                                    <MUISelect
                                        type="text"
                                        variant="filled"
                                        color="black"
                                        label="نوع اجرت"
                                        className="form-select w-full"
                                        value={addProduct?.wageType}
                                        onChange={(event) => handleChangeAddData(event, 'wageType', 'text')}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        <MenuItem value="Fixed" >ثابت</MenuItem>
                                        <MenuItem value="Percent" >درصدی</MenuItem>
                                    </MUISelect>
                                </div>
                                <div className={`col-span-12`}>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="wage"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    decimalScale={addProduct?.wageType == 'Fixed' ? 0 : 3}
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label={addProduct?.wageType == 'Fixed' ? "اجرت محصول (به تومان)" : "اجرت محصول (به درصد)"}
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.wage}
                                                    helperText={errors.wage ? errors.wage.message : ''}
                                                    onChange={(event) => {
                                                        field.onChange(event);
                                                        handleChangeAddData(event, 'wage', 'numberFormat');
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>

                                <div className="col-span-12 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                checked={addProduct?.shouldUpdatePriceWithApi}
                                                onChange={(event) => {
                                                    setAddProduct((prevState) => ({
                                                        ...prevState,
                                                        price: '',
                                                        shouldUpdatePriceWithApi: event.target.checked,
                                                        priceApiHeaders: [],
                                                        enableZarbahaApi: false
                                                    }));
                                                    setValue('shouldUpdatePriceWithApi', event.target.checked);
                                                    setValue('priceApiHeaders', []);
                                                }}
                                            />}
                                            label="قیمت از وبسرویس گرفته شود ؟" />
                                    </FormGroup>
                                </div>
                                {addProduct?.shouldUpdatePriceWithApi ? '' : <div className={`col-span-12`}>
                                    <FormControl className="w-full">
                                        <Controller
                                            name="price"
                                            control={control}
                                            render={({ field }) => (
                                                <NumericFormat
                                                    {...field}
                                                    thousandSeparator
                                                    allowNegative={false}
                                                    customInput={TextField}
                                                    type="tel"
                                                    label="قیمت محصول"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                        inputProps: {
                                                            inputMode: 'decimal'
                                                        }
                                                    }}
                                                    error={!!errors.price}
                                                    helperText={errors.price ? errors.price.message : ''}
                                                    onValueChange={(event) => setProductPrice(Number(event.value))}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </div>}
                                {addProduct?.shouldUpdatePriceWithApi ?
                                    <>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={addProduct?.ignoreApiError}
                                                        onChange={(event) => {
                                                            setAddProduct({ ...addProduct, ignoreApiError: event.target.checked });
                                                        }}
                                                    />}
                                                    label={<span className="block text-end">عدم توقف تحویل محصول در صورت خطا دادن وبسرویس قیمت ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        onChange={(event) => handleChangeAddData(event, 'isPriceBasedOnWeight', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end">آیا قیمت دریافتی از وبسرویس در وزن محصول ضرب شود ؟</span>} />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        onChange={(event) => handleChangeAddData(event, 'isToman', 'checkbox')}
                                                    />}
                                                    label="قیمت وبسرویس به تومان می باشد ؟" />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <Controller
                                                    name="priceApi"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            type="text"
                                                            label="لینک Api قیمت گرفتن محصول"
                                                            placeholder="https://goldika.ir/api/public/price"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!errors.priceApi}
                                                            helperText={errors.priceApi ? errors.priceApi.message : ''}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                                handleChangeAddData(event, 'priceApi', 'text');
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <Controller
                                                    name="pricePathInApi"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <TextField
                                                            {...field}
                                                            type="text"
                                                            label="فیلد قیمت درون Api قیمت"
                                                            placeholder="data.price.buy"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!errors.pricePathInApi}
                                                            helperText={errors.pricePathInApi ? errors.pricePathInApi.message : ''}
                                                            onChange={(event) => {
                                                                field.onChange(event);
                                                                handleChangeAddData(event, 'pricePathInApi', 'text');
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <Controller
                                                name="priceApiMethod"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControl className="w-full">
                                                        <InputLabel id="demo-simple-select-label" error={!!errors.priceApiMethod}
                                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                                        <MUISelect
                                                            {...field}
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            onChange={(event) => { field.onChange(event); handleChangeAddData(event, 'priceApiMethod', 'text') }}
                                                            input={<OutlinedInput
                                                                id="select-multiple-chip"
                                                                label="انتخاب متد وبسرویس"
                                                                className="dark:bg-dark *:dark:text-white"
                                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                            />}
                                                            error={!!errors.priceApiMethod}
                                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                            {priceMethods?.map((data, index) => (
                                                                <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                            ))}
                                                        </MUISelect>
                                                        {errors.priceApiMethod && <FormHelperText className="text-red-500 !mx-4">{errors.priceApiMethod.message}</FormHelperText>}
                                                    </FormControl>
                                                )}
                                            />
                                        </div>

                                        <div className="col-span-12 flex items-center gap-x-4">
                                            <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                            <Divider component="div" className="w-[55%] md:w-[74%] dark:bg-primary dark:bg-opacity-50" />
                                            <IconButton onClick={() => {
                                                setAddProduct(prevState => {
                                                    const updatedHeaders = [
                                                        ...(prevState.priceApiHeaders || []),
                                                        { key: '', value: '' }
                                                    ];
                                                    setValue('priceApiHeaders', updatedHeaders);
                                                    return {
                                                        ...prevState,
                                                        priceApiHeaders: updatedHeaders
                                                    };
                                                });
                                            }}>
                                                <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                            </IconButton>
                                        </div>
                                        {addProduct?.priceApiHeaders?.map((data, index) => (
                                            <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                                <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                                    onClick={() => {
                                                        setAddProduct(prevState => {
                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                            updatedHeaders.splice(index, 1);
                                                            setValue('priceApiHeaders', updatedHeaders);
                                                            return {
                                                                ...prevState,
                                                                priceApiHeaders: updatedHeaders
                                                            };
                                                        });
                                                    }}>
                                                    <span className="mx-2">حذف</span>
                                                </Button>
                                                <div className="col-span-12">
                                                    <Controller
                                                        name={`priceApiHeaders[${index}].key`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    {...field}
                                                                    type="tel"
                                                                    label="کلید"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                    }}
                                                                    error={!!errors.priceApiHeaders?.[index]?.key}
                                                                    helperText={errors.priceApiHeaders?.[index]?.key?.message || ''}
                                                                    value={data.key}
                                                                    onChange={(event) => {
                                                                        field.onChange(event);
                                                                        const value = event.target.value;
                                                                        setAddProduct(prevState => {
                                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                                            updatedHeaders[index] = {
                                                                                ...updatedHeaders[index],
                                                                                key: value
                                                                            };
                                                                            return {
                                                                                ...prevState,
                                                                                priceApiHeaders: updatedHeaders
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </div>
                                                <div className="col-span-12">
                                                    <Controller
                                                        name={`priceApiHeaders[${index}].value`}
                                                        control={control}
                                                        render={({ field }) => (
                                                            <FormControl className="w-full">
                                                                <TextField
                                                                    {...field}
                                                                    type="tel"
                                                                    label="مقدار"
                                                                    variant="outlined"
                                                                    InputLabelProps={{
                                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                                    }}
                                                                    InputProps={{
                                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                        inputProps: {
                                                                            inputMode: 'decimal'
                                                                        }
                                                                    }}
                                                                    error={!!errors.priceApiHeaders?.[index]?.value}
                                                                    helperText={errors.priceApiHeaders?.[index]?.value?.message || ''}
                                                                    value={data.value}
                                                                    onChange={(event) => {
                                                                        field.onChange(event);
                                                                        const value = event.target.value;
                                                                        setAddProduct(prevState => {
                                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                                            updatedHeaders[index] = {
                                                                                ...updatedHeaders[index],
                                                                                value: value
                                                                            };
                                                                            return {
                                                                                ...prevState,
                                                                                priceApiHeaders: updatedHeaders
                                                                            };
                                                                        });
                                                                    }}
                                                                />
                                                            </FormControl>
                                                        )}
                                                    />
                                                </div>
                                                <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                            </div>
                                        ))}
                                    </> : ''}
                            </>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={addProduct?.description}
                                    onChange={(event) => handleChangeAddData(event, 'description', 'text')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن محصول</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditProduct */}
            <>
                <Dialog onClose={() => setShowEditProduct(false)} open={showEditProduct} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش محصول {productData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowEditProduct(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={hasEditPrice ? true : productData?.isQuantitative}
                                    />}
                                    label="محصول تعدادی می باشد ؟" />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormGroup>
                        </div>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={hasEditPrice}
                                        onChange={(event) => {
                                            setHasEditPrice(event.target.checked);
                                            if (event.target.checked) {
                                                setProductData({ ...productData, isQuantitative: true });
                                            } else {
                                                setProductData({ ...productData, isQuantitative: false });
                                            }
                                        }}
                                    />}
                                    label="محصول قیمتی می باشد ؟" />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={productData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        {hasEditPrice || productData?.isQuantitative ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="وزن محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.weight}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div> : <div className="col-span-12 md:col-span-6"></div>}

                        <div className={`col-span-12 ${hasEditPrice ? productData?.enableZarbahaApi ? 'md:col-span-4' : 'md:col-span-6' : 'md:col-span-4'}`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={productData?.tradeable}
                                    onChange={(event) => setProductData((prevState) => ({
                                        ...prevState,
                                        'tradeableId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        {hasEditPrice ? <>
                            <div className={`col-span-12 ${productData?.enableZarbahaApi ? 'md:col-span-4' : 'md:col-span-6'} w-full flex items-center`}>
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={productData?.enableZarbahaApi || false}
                                            onChange={(event) => {
                                                setProductData((prevState) => ({
                                                    ...prevState,
                                                    enableZarbahaApi: event.target.checked, shouldUpdatePriceWithApi: false
                                                }));
                                            }}
                                        />}
                                        label="گرفتن قیمت از زربها ؟"
                                    />
                                </FormGroup>
                            </div>
                            {productData?.enableZarbahaApi ? <div className="col-span-12 md:col-span-4">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="فیلد قیمت درون Api قیمت"
                                        placeholder="فروش هر گرم طلای 18 عیار"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!pricePathInApiError}
                                        value={productData?.pricePathInApi}
                                        onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                    {pricePathInApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد الزامی می باشد</FormHelperText> : ''}
                                </FormControl>
                            </div> : ''}
                        </> : ''}
                        {productData?.isQuantitative ? <div className="col-span-12"></div> :
                            <>
                                <div className="col-span-12 md:col-span-4">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار سفارش (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productData?.minDeliverableAmount}
                                            onChange={handleChangeEditData('minDeliverableAmount', 'numberFormat')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 md:col-span-4">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productData?.maxDecimals}
                                            onChange={handleChangeEditData('maxDecimals', 'numberFormat')} />
                                    </FormControl>
                                </div>
                            </>}
                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب سطح</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={editproductLevels}
                                    onChange={handleEditChangeAddLevel}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب سطوح"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value?.name} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}
                                >
                                    {levels?.map((data, index) => (
                                        <MenuItem
                                            key={index}
                                            value={data}>
                                            {data.name}
                                        </MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-4`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label={`موجودی محصول ${productData?.isQuantitative ? '(تعداد)' : '(به گرم)'}`}
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.stock}
                                    onChange={handleChangeEditData('stock', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-4 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={productData?.wallgoldIntegrationIsActive}
                                        onChange={handleChangeEditData('wallgoldIntegrationIsActive', 'checkbox')}
                                    />}
                                    label="گرفتن کارمزد محصول از وال گلد ؟"
                                />
                            </FormGroup>
                        </div>
                        {hasEditPrice ? '' : <div className={`col-span-12 md:col-span-6 ${hasEditPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="اجرت محصول (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.wage}
                                    onChange={handleChangeEditData('wage', 'numberFormat')} />
                            </FormControl>
                        </div>}
                        <div className={`col-span-12 md:col-span-6 ${hasEditPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="عیار محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.carat}
                                    onChange={handleChangeEditData('carat', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className={`col-span-12 md:col-span-6 ${hasEditPrice ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('edit')} />
                                <TextField type="text" id="account" className="form-input cursor-default"
                                    disabled
                                    label="انتخاب تصویر محصول"
                                    InputLabelProps={{
                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                            {productData?.image ?
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${productData?.image}`} alt={productData?.slug}
                                                    className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                                    <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="white" />
                                                    <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="white" />
                                                </svg>}
                                        </IconButton>
                                    }}
                                    value={''} />
                            </FormControl>
                        </div>
                        {hasEditPrice ?
                            <>
                                <div className="col-span-12 md:col-span-6 xl:col-span-3">
                                    <MUISelect
                                        type="text"
                                        variant="filled"
                                        color="black"
                                        label="نوع اجرت"
                                        className="form-select w-full"
                                        value={productData?.wageType}
                                        onChange={handleChangeEditData('wageType', 'text')}
                                        MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                        <MenuItem value="Fixed" >ثابت</MenuItem>
                                        <MenuItem value="Percent" >درصدی</MenuItem>
                                    </MUISelect>
                                </div>
                                <div className={`col-span-12 md:col-span-6 xl:col-span-3`}>
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={productData?.wageType == 'Fixed' ? 0 : 3}
                                            customInput={TextField}
                                            type="tel"
                                            label={productData?.wageType == 'Fixed' ? "اجرت محصول (به تومان)" : "اجرت محصول (به درصد)"}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputProps: {
                                                        inputMode: 'decimal'
                                                    }
                                                }
                                            }}
                                            value={productData?.wage}
                                            onChange={handleChangeEditData('wage', 'numberFormat')} />
                                    </FormControl>
                                </div>

                                <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                checked={productData?.shouldUpdatePriceWithApi}
                                                onChange={(event) => {
                                                    setProductData((prevState) => ({
                                                        ...prevState,
                                                        shouldUpdatePriceWithApi: event.target.checked,
                                                        enableZarbahaApi: false
                                                    }));
                                                }}
                                            />}
                                            label="قیمت از وبسرویس گرفته شود ؟" />
                                    </FormGroup>
                                </div>
                                <div className={`col-span-12 md:col-span-6`}>
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            customInput={TextField}
                                            type="tel"
                                            label="قیمت محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productEditPrice}
                                            onValueChange={(event) => setProductEditPrice(Number(event.value))} />
                                    </FormControl>
                                </div>
                                {productData?.shouldUpdatePriceWithApi ?
                                    <>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.ignoreApiError}
                                                        onChange={handleChangeEditData('ignoreApiError', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end">عدم توقف تحویل محصول در صورت خطا دادن وبسرویس قیمت ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.isPriceBasedOnWeight}
                                                        onChange={handleChangeEditData('isPriceBasedOnWeight', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end whitespace-nowrap">آیا قیمت دریافتی از وبسرویس در وزن محصول ضرب شود ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.isToman}
                                                        onChange={handleChangeEditData('isToman', 'checkbox')}
                                                    />}
                                                    label="قیمت وبسرویس به تومان می باشد ؟" />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    label="لینک Api قیمت گرفتن محصول"
                                                    placeholder="https://goldika.ir/api/public/price"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!priceApiError}
                                                    value={productData?.priceApi}
                                                    onChange={handleChangeEditData('priceApi', 'priceApi')} />
                                            </FormControl>
                                            {priceApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد باید یک لینک معتبر باشد</FormHelperText> : ''}
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    label="فیلد قیمت درون Api قیمت"
                                                    placeholder="data.price.buy"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!pricePathInApiError}
                                                    value={productData?.pricePathInApi}
                                                    onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                                {pricePathInApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد الزامی می باشد</FormHelperText> : ''}
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <InputLabel id="demo-simple-select-label"
                                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                                <MUISelect
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    defaultValue={productData?.priceApiMethod}
                                                    onChange={handleChangeEditData('priceApiMethod', 'text')}
                                                    input={<OutlinedInput
                                                        id="select-multiple-chip"
                                                        label="انتخاب متد وبسرویس"
                                                        className="dark:bg-dark *:dark:text-white"
                                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                    />}
                                                    renderValue={(selected) => {
                                                        return (
                                                            <div className="flex flex-wrap gap-0.5">
                                                                <span>{selected}</span>
                                                            </div>
                                                        )
                                                    }}
                                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                    {priceMethods?.map((data, index) => (
                                                        <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                    ))}
                                                </MUISelect>
                                            </FormControl>
                                        </div>

                                        <div className="col-span-12 flex items-center gap-x-4">
                                            <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                            <Divider component="div" className="w-[78%] dark:bg-primary dark:bg-opacity-50" />
                                            <IconButton onClick={() => {
                                                setProductData(prevState => {
                                                    const updatedHeaders = [
                                                        ...(prevState.priceApiHeaders || []),
                                                        { key: '', value: '' }
                                                    ];
                                                    return {
                                                        ...prevState,
                                                        priceApiHeaders: updatedHeaders
                                                    };
                                                });
                                            }}>
                                                <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                            </IconButton>
                                        </div>
                                        {productData?.priceApiHeaders?.map((data, index) => (
                                            <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                                <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                                    onClick={() => {
                                                        setProductData(prevState => {
                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                            updatedHeaders.splice(index, 1);
                                                            return {
                                                                ...prevState,
                                                                priceApiHeaders: updatedHeaders
                                                            };
                                                        });
                                                    }}>
                                                    <span className="mx-2">حذف</span>
                                                </Button>
                                                <div className="col-span-12 lg:col-span-4">
                                                    <FormControl className="w-full">
                                                        <TextField
                                                            type="tel"
                                                            label="کلید"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.key}
                                                            helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.key || ''}
                                                            value={data.key}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setProductData(prevState => {
                                                                    const updatedHeaders = [...prevState.priceApiHeaders];
                                                                    updatedHeaders[index] = {
                                                                        ...updatedHeaders[index],
                                                                        key: value
                                                                    };
                                                                    return {
                                                                        ...prevState,
                                                                        priceApiHeaders: updatedHeaders
                                                                    };
                                                                });
                                                                setPriceHeadersErrors(prevErrors => ({
                                                                    ...prevErrors,
                                                                    priceApiHeaders: {
                                                                        ...prevErrors.priceApiHeaders,
                                                                        [index]: {
                                                                            ...prevErrors.priceApiHeaders?.[index],
                                                                            key: null
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <div className="col-span-12 lg:col-span-8">
                                                    <FormControl className="w-full">
                                                        <TextField
                                                            type="tel"
                                                            label="مقدار"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                inputProps: {
                                                                    inputMode: 'decimal'
                                                                }
                                                            }}
                                                            error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.value}
                                                            helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.value || ''}
                                                            value={data.value}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setProductData(prevState => {
                                                                    const updatedHeaders = [...prevState.priceApiHeaders];
                                                                    updatedHeaders[index] = {
                                                                        ...updatedHeaders[index],
                                                                        value: value
                                                                    };
                                                                    return {
                                                                        ...prevState,
                                                                        priceApiHeaders: updatedHeaders
                                                                    };
                                                                });
                                                                setPriceHeadersErrors(prevErrors => ({
                                                                    ...prevErrors,
                                                                    priceApiHeaders: {
                                                                        ...prevErrors.priceApiHeaders,
                                                                        [index]: {
                                                                            ...prevErrors.priceApiHeaders?.[index],
                                                                            value: null
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                            </div>
                                        ))}
                                        {productData?.apiError ? <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    multiline
                                                    rows={8}
                                                    error={true}
                                                    label="دلیل قطع وبسرویس قیمت گیری"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                                    }}
                                                    value={productData?.apiError} />
                                            </FormControl>
                                        </div> : ''}
                                    </>
                                    : ''}
                            </>
                            : ''}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={productData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </form>
                    <div className="text-end">
                        <LoadingButton type="button" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                            onClick={editProduct(productData?._id)}>
                            <text className="text-black font-semibold">ویرایش محصول</text>
                        </LoadingButton>
                    </div>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditProductDrawer}
                    onClose={() => setOpenBottomEditProductDrawer(false)}
                    PaperProps={{ className: 'drawers', sx: { height: '90%' } }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="block mb-6"><div className="puller"></div></div>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">ویرایش محصول {productData?.name}
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomEditProductDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <section className="grid grid-cols-12 gap-x-4 gap-y-8 py-8">
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={hasEditPrice ? true : productData?.isQuantitative}
                                    />}
                                    label="محصول تعدادی می باشد ؟" />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormGroup>
                        </div>
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={hasEditPrice}
                                        onChange={(event) => {
                                            setHasEditPrice(event.target.checked);
                                            if (event.target.checked) {
                                                setProductData({ ...productData, isQuantitative: true });
                                            } else {
                                                setProductData({ ...productData, isQuantitative: false });
                                            }
                                        }}
                                    />}
                                    label="محصول قیمتی می باشد ؟" />
                            </FormGroup>
                        </div>
                        <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="نام محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={productData?.name}
                                    onChange={handleChangeEditData('name', 'text')} />
                            </FormControl>
                        </div>
                        {hasEditPrice || productData?.isQuantitative ? <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="وزن محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.weight}
                                />
                                <FormHelperText className="text-sell text-xs -mb-6">این فیلد قابل تغییر نمی باشد</FormHelperText>
                            </FormControl>
                        </div> : ''}
                        <div className={`col-span-12 mt-3 md:mt-0`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-simple-select-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب واحد قابل معامله</InputLabel>
                                <MUISelect
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    defaultValue={productData?.tradeable}
                                    onChange={(event) => setProductData((prevState) => ({
                                        ...prevState,
                                        'tradeableId': event.target?.value?._id,
                                    }))}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب واحد قابل معامله"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            <span>{selected?.nameFa}</span>
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                    {tradeables?.map((data, index) => (
                                        <MenuItem key={index} value={data}>{data.nameFa}</MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        {hasEditPrice ? <>
                            <div className={`col-span-12 ${productData?.enableZarbahaApi ? 'md:col-span-6' : ''} w-full flex items-center`}>
                                <FormGroup className="w-full ltr">
                                    <FormControlLabel
                                        className="justify-between m-0"
                                        control={<CustomSwitch
                                            checked={productData?.enableZarbahaApi || false}
                                            onChange={(event) => {
                                                setProductData((prevState) => ({
                                                    ...prevState,
                                                    enableZarbahaApi: event.target.checked, shouldUpdatePriceWithApi: false
                                                }));
                                            }}
                                        />}
                                        label="گرفتن قیمت از زربها ؟"
                                    />
                                </FormGroup>
                            </div>
                            {productData?.enableZarbahaApi ? <div className="col-span-12 md:col-span-6">
                                <FormControl className="w-full">
                                    <TextField
                                        type="text"
                                        label="فیلد قیمت درون Api قیمت"
                                        placeholder="فروش هر گرم طلای 18 عیار"
                                        variant="outlined"
                                        InputLabelProps={{
                                            sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                        }}
                                        InputProps={{
                                            classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                            sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        }}
                                        error={!!pricePathInApiError}
                                        value={productData?.pricePathInApi}
                                        onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                    {pricePathInApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد الزامی می باشد</FormHelperText> : ''}
                                </FormControl>
                            </div> : ''}
                        </> : ''}
                        {productData?.isQuantitative ? '' :
                            <>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={3}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداقل مقدار سفارش (به گرم)"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productData?.minDeliverableAmount}
                                            onChange={handleChangeEditData('minDeliverableAmount', 'numberFormat')} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12">
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            decimalScale={0}
                                            customInput={TextField}
                                            type="tel"
                                            label="حداکثر تعداد اعشار"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productData?.maxDecimals}
                                            onChange={handleChangeEditData('maxDecimals', 'numberFormat')} />
                                    </FormControl>
                                </div>
                            </>}
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <InputLabel id="demo-multiple-chip-label"
                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب سطح</InputLabel>
                                <MUISelect
                                    labelId="demo-multiple-chip-label"
                                    id="demo-multiple-chip"
                                    multiple
                                    value={editproductLevels}
                                    onChange={handleEditChangeAddLevel}
                                    input={<OutlinedInput
                                        id="select-multiple-chip"
                                        label="انتخاب سطوح"
                                        className="dark:bg-dark *:dark:text-white"
                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }} />}
                                    renderValue={(selected) => (
                                        <div className="flex flex-wrap gap-0.5">
                                            {selected.map((value, index) => (
                                                <Chip key={index} label={value?.name} variant="outlined" size="small" className="badge badge-success" />
                                            ))}
                                        </div>
                                    )}
                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}
                                >
                                    {levels?.map((data, index) => (
                                        <MenuItem
                                            key={index}
                                            value={data}>
                                            {data.name}
                                        </MenuItem>
                                    ))}
                                </MUISelect>
                            </FormControl>
                        </div>
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={3}
                                    customInput={TextField}
                                    type="tel"
                                    label={`موجودی محصول ${productData?.isQuantitative ? '(تعداد)' : '(به گرم)'}`}
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.stock}
                                    onChange={handleChangeEditData('stock', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <FormControlLabel
                                    className="justify-between m-0"
                                    control={<CustomSwitch
                                        checked={productData?.wallgoldIntegrationIsActive}
                                        onChange={handleChangeEditData('wallgoldIntegrationIsActive', 'checkbox')}
                                    />}
                                    label="گرفتن کارمزد محصول از وال گلد ؟"
                                />
                            </FormGroup>
                        </div>
                        {hasEditPrice ? '' : <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    decimalScale={0}
                                    customInput={TextField}
                                    type="tel"
                                    label="اجرت محصول (به تومان)"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.wage}
                                    onChange={handleChangeEditData('wage', 'numberFormat')} />
                            </FormControl>
                        </div>}
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <NumericFormat
                                    thousandSeparator
                                    customInput={TextField}
                                    type="tel"
                                    label="عیار محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        inputProps: {
                                            inputMode: 'decimal'
                                        }
                                    }}
                                    value={productData?.carat}
                                    onChange={handleChangeEditData('carat', 'numberFormat')} />
                            </FormControl>
                        </div>
                        <div className={`col-span-12`}>
                            <FormControl className="w-full">
                                <input type="file" id="ItemPic" className="hidden" onChange={uploadItemImage('edit')} />
                                <TextField type="text" id="account" className="form-input cursor-default"
                                    disabled
                                    label="انتخاب تصویر محصول"
                                    InputLabelProps={{
                                        classes: { disabled: darkModeToggle ? '!text-white !text-opacity-70' : '!text-black !text-opacity-70' },
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                        readOnly: true,
                                        endAdornment: <IconButton color={darkModeToggle ? 'white' : 'black'} onClick={openItemImageFile}>
                                            {productData?.image ?
                                                <img crossOrigin="anonymous" src={`${process.env.NEXT_PUBLIC_BASEURL}${productData?.image}`} alt={productData?.slug}
                                                    className="w-6 h-6" /> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                                    <path opacity="0.4" d="M16.19 2.5H7.82001C4.18001 2.5 2.01001 4.67 2.01001 8.31V16.68C2.01001 20.32 4.18001 22.49 7.82001 22.49H16.19C19.83 22.49 22 20.32 22 16.68V8.31C22 4.67 19.83 2.5 16.19 2.5Z" fill="white" />
                                                    <path d="M12.2 17.8799C11.5 17.8799 10.79 17.6099 10.26 17.0799C9.74001 16.5599 9.45001 15.8699 9.45001 15.1399C9.45001 14.4099 9.74001 13.7099 10.26 13.1999L11.67 11.7899C11.96 11.4999 12.44 11.4999 12.73 11.7899C13.02 12.0799 13.02 12.5599 12.73 12.8499L11.32 14.2599C11.08 14.4999 10.95 14.8099 10.95 15.1399C10.95 15.4699 11.08 15.7899 11.32 16.0199C11.81 16.5099 12.6 16.5099 13.09 16.0199L15.31 13.7999C16.58 12.5299 16.58 10.4699 15.31 9.19994C14.04 7.92994 11.98 7.92994 10.71 9.19994L8.28998 11.6199C7.77998 12.1299 7.5 12.7999 7.5 13.5099C7.5 14.2199 7.77998 14.8999 8.28998 15.3999C8.57998 15.6899 8.57998 16.1699 8.28998 16.4599C7.99998 16.7499 7.51998 16.7499 7.22998 16.4599C6.43998 15.6699 6.01001 14.6199 6.01001 13.4999C6.01001 12.3799 6.43998 11.3299 7.22998 10.5399L9.65002 8.11992C11.5 6.26992 14.52 6.26992 16.37 8.11992C18.22 9.96992 18.22 12.9899 16.37 14.8399L14.15 17.0599C13.61 17.6099 12.91 17.8799 12.2 17.8799Z" fill="white" />
                                                </svg>}
                                        </IconButton>
                                    }}
                                    value={''} />
                            </FormControl>
                        </div>
                        {hasEditPrice ?
                            <>
                                <div className={`col-span-12`}>
                                    <FormControl className="w-full">
                                        <NumericFormat
                                            thousandSeparator
                                            customInput={TextField}
                                            type="tel"
                                            label="قیمت محصول"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={productEditPrice}
                                            onValueChange={(event) => setProductEditPrice(Number(event.value))} />
                                    </FormControl>
                                </div>
                                <div className="col-span-12 w-full flex items-center">
                                    <FormGroup className="w-full ltr">
                                        <FormControlLabel
                                            className="justify-between m-0"
                                            control={<CustomSwitch
                                                checked={productData?.shouldUpdatePriceWithApi}
                                                onChange={(event) => {
                                                    setProductData((prevState) => ({
                                                        ...prevState,
                                                        shouldUpdatePriceWithApi: event.target.checked,
                                                        enableZarbahaApi: false
                                                    }));
                                                }}
                                            />}
                                            label="قیمت از وبسرویس گرفته شود ؟" />
                                    </FormGroup>
                                </div>
                                {productData?.shouldUpdatePriceWithApi ?
                                    <>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.ignoreApiError}
                                                        onChange={handleChangeEditData('ignoreApiError', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end">عدم توقف تحویل محصول در صورت خطا دادن وبسرویس قیمت ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.isPriceBasedOnWeight}
                                                        onChange={handleChangeEditData('isPriceBasedOnWeight', 'checkbox')}
                                                    />}
                                                    label={<span className="block text-end">آیا قیمت دریافتی از وبسرویس در وزن محصول ضرب شود ؟</span>}
                                                />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12 w-full flex items-center">
                                            <FormGroup className="w-full ltr">
                                                <FormControlLabel
                                                    className="justify-between m-0"
                                                    control={<CustomSwitch
                                                        checked={productData?.isToman}
                                                        onChange={handleChangeEditData('isToman', 'checkbox')}
                                                    />}
                                                    label="قیمت وبسرویس به تومان می باشد ؟" />
                                            </FormGroup>
                                        </div>
                                        <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    label="لینک Api قیمت گرفتن محصول"
                                                    placeholder="https://goldika.ir/api/public/price"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!priceApiError}
                                                    value={productData?.priceApi}
                                                    onChange={handleChangeEditData('priceApi', 'priceApi')} />
                                                {priceApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد باید یک لینک معتبر باشد</FormHelperText> : ''}
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    label="فیلد قیمت درون Api قیمت"
                                                    placeholder="data.price.buy"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'ltr text-white' : 'ltr text-black', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    }}
                                                    error={!!pricePathInApiError}
                                                    value={productData?.pricePathInApi}
                                                    onChange={handleChangeEditData('pricePathInApi', 'text')} />
                                                {pricePathInApiError ? <FormHelperText className="text-red-500 text-xs mx-4">این فیلد الزامی می باشد</FormHelperText> : ''}
                                            </FormControl>
                                        </div>
                                        <div className="col-span-12 md:col-span-6">
                                            <FormControl className="w-full">
                                                <InputLabel id="demo-simple-select-label"
                                                    sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب متد وبسرویس</InputLabel>
                                                <MUISelect
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    defaultValue={productData?.priceApiMethod}
                                                    onChange={handleChangeEditData('priceApiMethod', 'text')}
                                                    input={<OutlinedInput
                                                        id="select-multiple-chip"
                                                        label="انتخاب متد وبسرویس"
                                                        className="dark:bg-dark *:dark:text-white"
                                                        sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                                    />}
                                                    renderValue={(selected) => {
                                                        return (
                                                            <div className="flex flex-wrap gap-0.5">
                                                                <span>{selected}</span>
                                                            </div>
                                                        )
                                                    }}
                                                    MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                                    {priceMethods?.map((data, index) => (
                                                        <MenuItem key={index} value={data.value}>{data.label}</MenuItem>
                                                    ))}
                                                </MUISelect>
                                            </FormControl>
                                        </div>

                                        <div className="col-span-12 flex items-center gap-x-4">
                                            <span className="whitespace-nowrap">هدرهای وبسرویس</span>
                                            <Divider component="div" className="w-[55%] md:w-[74%] dark:bg-primary dark:bg-opacity-50" />
                                            <IconButton onClick={() => {
                                                setProductData(prevState => {
                                                    const updatedHeaders = [
                                                        ...(prevState.priceApiHeaders || []),
                                                        { key: '', value: '' }
                                                    ];
                                                    return {
                                                        ...prevState,
                                                        priceApiHeaders: updatedHeaders
                                                    };
                                                });
                                            }}>
                                                <AddCircleIcon color={darkModeToggle ? 'white' : 'black'} />
                                            </IconButton>
                                        </div>
                                        {productData?.priceApiHeaders?.map((data, index) => (
                                            <div key={index} className="col-span-12 grid grid-cols-12 gap-4 relative">
                                                <Button variant="text" color="error" size="small" className="custom-btn rounded-lg absolute -top-8 rtl:left-0 ltr:right-0"
                                                    onClick={() => {
                                                        setProductData(prevState => {
                                                            const updatedHeaders = [...prevState.priceApiHeaders];
                                                            updatedHeaders.splice(index, 1);
                                                            return {
                                                                ...prevState,
                                                                priceApiHeaders: updatedHeaders
                                                            };
                                                        });
                                                    }}>
                                                    <span className="mx-2">حذف</span>
                                                </Button>
                                                <div className="col-span-12">
                                                    <FormControl className="w-full">
                                                        <TextField
                                                            type="tel"
                                                            label="کلید"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                            }}
                                                            error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.key}
                                                            helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.key || ''}
                                                            value={data.key}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setProductData(prevState => {
                                                                    const updatedHeaders = [...prevState.priceApiHeaders];
                                                                    updatedHeaders[index] = {
                                                                        ...updatedHeaders[index],
                                                                        key: value
                                                                    };
                                                                    return {
                                                                        ...prevState,
                                                                        priceApiHeaders: updatedHeaders
                                                                    };
                                                                });
                                                                setPriceHeadersErrors(prevErrors => ({
                                                                    ...prevErrors,
                                                                    priceApiHeaders: {
                                                                        ...prevErrors.priceApiHeaders,
                                                                        [index]: {
                                                                            ...prevErrors.priceApiHeaders?.[index],
                                                                            key: null
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <div className="col-span-12">
                                                    <FormControl className="w-full">
                                                        <TextField
                                                            type="tel"
                                                            label="مقدار"
                                                            variant="outlined"
                                                            InputLabelProps={{
                                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                            }}
                                                            InputProps={{
                                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                                inputProps: {
                                                                    inputMode: 'decimal'
                                                                }
                                                            }}
                                                            error={!!priceHeadersErrors?.priceApiHeaders?.[index]?.value}
                                                            helperText={priceHeadersErrors?.priceApiHeaders?.[index]?.value || ''}
                                                            value={data.value}
                                                            onChange={(event) => {
                                                                const value = event.target.value;
                                                                setProductData(prevState => {
                                                                    const updatedHeaders = [...prevState.priceApiHeaders];
                                                                    updatedHeaders[index] = {
                                                                        ...updatedHeaders[index],
                                                                        value: value
                                                                    };
                                                                    return {
                                                                        ...prevState,
                                                                        priceApiHeaders: updatedHeaders
                                                                    };
                                                                });
                                                                setPriceHeadersErrors(prevErrors => ({
                                                                    ...prevErrors,
                                                                    priceApiHeaders: {
                                                                        ...prevErrors.priceApiHeaders,
                                                                        [index]: {
                                                                            ...prevErrors.priceApiHeaders?.[index],
                                                                            value: null
                                                                        }
                                                                    }
                                                                }));
                                                            }}
                                                        />
                                                    </FormControl>
                                                </div>
                                                <Divider component="div" className="col-span-12 dark:bg-primary dark:bg-opacity-50" />
                                            </div>
                                        ))}
                                        {productData?.apiError ? <div className="col-span-12">
                                            <FormControl className="w-full">
                                                <TextField
                                                    type="text"
                                                    multiline
                                                    rows={8}
                                                    error={true}
                                                    label="دلیل قطع وبسرویس قیمت گیری"
                                                    InputLabelProps={{
                                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                    }}
                                                    InputProps={{
                                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white rtl cursor-default' : 'text-black rtl cursor-default', focused: 'border-none' },
                                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }
                                                    }}
                                                    value={productData?.apiError} />
                                            </FormControl>
                                        </div> : ''}
                                    </>
                                    : ''}
                            </>
                            : ''}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    multiline
                                    rows={4}
                                    label="توضیحات محصول"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={productData?.description}
                                    onChange={handleChangeEditData('description', 'text')} />
                            </FormControl>
                        </div>
                    </section>
                    <div className="w-full">
                        <LoadingButton type="button" variant="contained" size="medium" fullWidth className="rounded-lg" disableElevation loading={loading}
                            onClick={editProduct(productData?._id)}>
                            <text className="text-black font-semibold">ویرایش محصول</text>
                        </LoadingButton>
                    </div>
                </SwipeableDrawer>
            </>

            {/* AddDiscount */}
            <>
                <Dialog onClose={() => setShowAddDiscount(false)} open={showAddDiscount} maxWidth={'md'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کد تخفیف
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setShowAddDiscount(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleDiscountSubmit(saveDiscount)}>
                        <div className="col-span-12 md:col-span-6 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalProduct"
                                    control={controlDiscount}
                                    defaultValue={totalProduct}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalProduct(event.target.checked);
                                                    setDiscountValue('forProducts', '');
                                                    setAddDiscount({ ...addDiscount, forProducts: [] });
                                                }}
                                            />}
                                            label="تمام محصولات ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalProduct ? (
                            <div className="col-span-12 md:col-span-6 invisible">
                                <Select
                                    options={[]}
                                    values={[]}
                                    dropdownGap={0}
                                    direction={'ltr'}
                                />
                            </div>
                        ) : (
                            <div className="col-span-12 md:col-span-6">
                                <Controller
                                    name="forProducts"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <Select
                                            options={productsDiscount}
                                            loading={productsDiscountSelectLoading}
                                            contentRenderer={productsCustomContentRenderer}
                                            dropdownRenderer={productsCustomDropdownRenderer}
                                            multi
                                            onChange={(values) => {
                                                field.onChange(values?.length > 0 ? values[0]?.value : '');
                                                setAddDiscount(prev => ({ ...prev, forProducts: values }));
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'name,slug'}
                                        />
                                    )}
                                />
                                {errorsDiscount.forProducts && <FormHelperText className="text-red-500 !mx-4">{errorsDiscount.forProducts.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="code"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="کد تخفیف"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={addDiscount?.code}
                                            error={!!errorsDiscount.code}
                                            helperText={errorsDiscount.code ? errorsDiscount.code.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddDiscountData(event, 'code', 'text')
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع کارمزد"
                                className="form-select w-full"
                                value={addDiscount?.type}
                                onChange={(event) => handleChangeAddDiscountData(event, 'type', 'select')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <FormControl className="w-full">
                                <Controller
                                    name="amount"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addDiscount?.type == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addDiscount?.type == 'Fixed' ? "مقدار تخفیف (به تومان)" : "مقدار تخفیف (به درصد)"}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={addDiscount?.amount}
                                            error={!!errorsDiscount.amount}
                                            helperText={errorsDiscount.amount ? errorsDiscount.amount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddDiscountData(event, 'amount', 'numberFormat')
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="expiry"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <>
                                            <DatePicker
                                                name="datePicker"
                                                timePicker={false}
                                                isGregorian={isGregorian}
                                                className="form-input hidden"
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                    expireDatepicker(date);
                                                }}
                                            />
                                            <TextField
                                                type="text"
                                                color={'primary'}
                                                label="تاریخ انقضا کد تخفیف"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr'
                                                    },
                                                    readOnly: true
                                                }}
                                                error={!!errorsDiscount.expiry}
                                                helperText={errorsDiscount.expiry ? errorsDiscount.expiry.message : ''}
                                                value={expireDate}
                                                onClick={() => document.querySelector('input[name="datePicker"]').click()}
                                            />
                                        </>
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن کد تخفیف</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog>

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddDiscountDrawer}
                    onClose={() => setOpenBottomAddDiscountDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'} className="flex items-center justify-between gap-x-2">افزودن کد تخفیف
                            <IconButton
                                color={darkModeToggle ? 'white' : 'black'}
                                className="bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5"
                                onClick={() => setOpenBottomAddDiscountDrawer(false)}>
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 6l-6 6m0 0l-6 6m6-6l6 6m-6-6L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path></svg>
                            </IconButton>
                        </Typography>
                        <Divider component="div" className="w-full dark:bg-primary dark:bg-opacity-50" />
                    </div>
                    <form className="grid grid-cols-12 gap-x-4 gap-y-8 py-8" noValidate autoComplete="off" onSubmit={handleDiscountSubmit(saveDiscount)}>
                        <div className="col-span-12 w-full flex items-center">
                            <FormGroup className="w-full ltr">
                                <Controller
                                    name="totalProduct"
                                    control={controlDiscount}
                                    defaultValue={totalProduct}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            className="justify-between text-end m-0"
                                            control={<CustomSwitch
                                                {...field}
                                                checked={field.value}
                                                onChange={(event) => {
                                                    field.onChange(event);
                                                    setTotalProduct(event.target.checked);
                                                    setDiscountValue('forProducts', '');
                                                    setAddDiscount({ ...addDiscount, forProducts: [] });
                                                }}
                                            />}
                                            label="تمام محصولات ؟" />
                                    )}
                                />
                            </FormGroup>
                        </div>
                        {totalProduct ? (
                            ''
                        ) : (
                            <div className="col-span-12">
                                <Controller
                                    name="forProducts"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <Select
                                            options={productsDiscount}
                                            loading={productsDiscountSelectLoading}
                                            contentRenderer={productsCustomContentRenderer}
                                            dropdownRenderer={productsCustomDropdownRenderer}
                                            multi
                                            onChange={(values) => {
                                                field.onChange(values?.length > 0 ? values[0]?.value : '');
                                                setAddDiscount(prev => ({ ...prev, forProducts: values }));
                                            }}
                                            values={[]}
                                            dropdownGap={0}
                                            direction={'ltr'}
                                            searchBy={'name,slug'}
                                        />
                                    )}
                                />
                                {errorsDiscount.forProducts && <FormHelperText className="text-red-500 !mx-4">{errorsDiscount.forProducts.message}</FormHelperText>}
                            </div>
                        )}
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="code"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="کد تخفیف"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            value={addDiscount?.code}
                                            error={!!errorsDiscount.code}
                                            helperText={errorsDiscount.code ? errorsDiscount.code.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddDiscountData(event, 'code', 'text')
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <MUISelect
                                type="text"
                                variant="filled"
                                color="black"
                                label="نوع کارمزد"
                                className="form-select w-full"
                                value={addDiscount?.type}
                                onChange={(event) => handleChangeAddDiscountData(event, 'type', 'select')}
                                MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                <MenuItem value="Fixed" >ثابت</MenuItem>
                                <MenuItem value="Percent" >درصدی</MenuItem>
                            </MUISelect>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="amount"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <NumericFormat
                                            {...field}
                                            thousandSeparator
                                            decimalScale={addDiscount?.type == 'Fixed' ? 0 : 3}
                                            allowNegative={false}
                                            customInput={TextField}
                                            type="tel"
                                            label={addDiscount?.type == 'Fixed' ? "مقدار تخفیف (به تومان)" : "مقدار تخفیف (به درصد)"}
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-end text-white' : 'text-end text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                inputProps: {
                                                    inputMode: 'decimal'
                                                }
                                            }}
                                            value={addDiscount?.amount}
                                            error={!!errorsDiscount.amount}
                                            helperText={errorsDiscount.amount ? errorsDiscount.amount.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                handleChangeAddDiscountData(event, 'amount', 'numberFormat')
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12">
                            <FormControl className="w-full">
                                <Controller
                                    name="expiry"
                                    control={controlDiscount}
                                    render={({ field }) => (
                                        <>
                                            <DatePicker
                                                name="datePicker"
                                                timePicker={false}
                                                isGregorian={isGregorian}
                                                className="form-input hidden"
                                                onChange={(date) => {
                                                    field.onChange(date);
                                                    expireDatepicker(date);
                                                }}
                                            />
                                            <TextField
                                                type="text"
                                                color={'primary'}
                                                label="تاریخ انقضا کد تخفیف"
                                                variant="outlined"
                                                InputLabelProps={{
                                                    sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                                }}
                                                InputProps={{
                                                    classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white text-center' : 'text-black text-center', focused: 'border-none' },
                                                    sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                                    inputProps: {
                                                        className: 'ltr'
                                                    },
                                                    readOnly: true
                                                }}
                                                error={!!errorsDiscount.expiry}
                                                helperText={errorsDiscount.expiry ? errorsDiscount.expiry.message : ''}
                                                value={expireDate}
                                                onClick={() => document.querySelector('input[name="datePicker"]').click()}
                                            />
                                        </>
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="col-span-12 text-end">
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن کد تخفیف</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* ProductGroup */}
            <>
                <Dialog onClose={() => setShowProductGroup(false)} open={showProductGroup} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>تغییر یا ثبت دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4" noValidate autoComplete="off">
                        {loadingProductGroups ? <div className="w-full h-32 flex items-center justify-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                            :
                            <>
                                {groups ? <Alert
                                    severity="error"
                                    variant="filled"
                                    color="error"
                                    className="custom-alert auth error mt-4"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <p className="text-justify m-0">
                                            برای تغییر دسته بندی ابتدا دسته بندی قدیمی را حذف نمائید.
                                        </p>
                                    </div>

                                </Alert> : ''}
                                {!groups ? <div className="col-span-12 md:col-span-6 mt-4">
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label"
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب دسته بندی</InputLabel>
                                        {loadingProductGroups ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                                        <MUISelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => setAddProductGroup((prevState) => ({
                                                ...prevState,
                                                productGroupId: event.target.value?._id,
                                            }))}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب دسته بندی"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            renderValue={(selected) => (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected?.title}</span>
                                                </div>
                                            )}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {productGroups?.map((data, index) => (
                                                <MenuItem key={index} value={data}>{data.title}</MenuItem>
                                            ))}
                                        </MUISelect>
                                    </FormControl>
                                </div> : <ul className="flex flex-col gap-y-4 list-none px-0">
                                    <li className="px-3 py-1 rounded-lg bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5">
                                        <div className="w-full flex items-center justify-between gap-x-2">
                                            <span>{groups?.title}</span>
                                            <Tooltip title="حذف دسته بندی">
                                                <IconButton
                                                    color={`error`}
                                                    onClick={removeProductGroup(addProductGroup?.productId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </li>
                                </ul>}
                                <div className="flex items-center justify-end gap-x-2 mt-2">
                                    <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                        onClick={() => setShowProductGroup(false)}>
                                        <span className="mx-2">بستن</span>
                                    </Button>
                                    {!groups ? <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                        disabled={addProductGroup?.productGroupId ? false : true}
                                        onClick={addProductGroup?.productGroupId ? saveProductGroup : () => false}>
                                        <text className={`font-semibold ${addProductGroup?.productGroupId ? 'text-white' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                    </LoadingButton > : ''}
                                </div>
                            </>}
                    </form>
                </Dialog >

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomProductGroupDrawer}
                    onClose={() => setOpenBottomProductGroupDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>تغییر یا ثبت دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        {loadingProductGroups ? <div className="w-full h-32 flex items-center justify-center"><CircularProgress color={darkModeToggle ? 'white' : 'black'} /></div>
                            :
                            <>
                                {groups ? <Alert
                                    severity="error"
                                    variant="filled"
                                    color="error"
                                    className="custom-alert auth error mt-4"
                                >
                                    <div className="flex flex-col items-baseline md:items-center gap-y-2 md:flex-row md:justify-between w-full">
                                        <p className="text-justify m-0">
                                            برای تغییر دسته بندی ابتدا دسته بندی قدیمی را حذف نمائید.
                                        </p>
                                    </div>

                                </Alert> : ''}

                                {!groups ? <div className="col-span-12 md:col-span-6 mt-4">
                                    <FormControl className="w-full">
                                        <InputLabel id="demo-simple-select-label"
                                            sx={{ color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }}>انتخاب دسته بندی</InputLabel>
                                        {loadingProductGroups ? <CircularProgress color={darkModeToggle ? 'white' : 'black'} size={20} className="absolute top-[33%] rtl:left-[10px] ltr:right-[10px] z-10 translate-y-1/2" /> : ''}
                                        <MUISelect
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            onChange={(event) => setAddProductGroup((prevState) => ({
                                                ...prevState,
                                                productGroupId: event.target.value?._id,
                                            }))}
                                            input={<OutlinedInput
                                                id="select-multiple-chip"
                                                label="انتخاب دسته بندی"
                                                className="dark:bg-dark *:dark:text-white"
                                                sx={{ border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' }}
                                            />}
                                            renderValue={(selected) => (
                                                <div className="flex flex-wrap gap-0.5">
                                                    <span>{selected?.title}</span>
                                                </div>
                                            )}
                                            MenuProps={{ classes: { paper: 'dark:bg-dark dark:text-white rounded-2xl border border-solid border-black border-opacity-20 dark:border-white dark:border-opacity-20' } }}>
                                            {productGroups?.map((data, index) => (
                                                <MenuItem key={index} value={data}>{data.title}</MenuItem>
                                            ))}
                                        </MUISelect>
                                    </FormControl>
                                </div> : <ul className="flex flex-col gap-y-4 list-none px-0">
                                    <li className="px-3 py-1 rounded-lg bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-5">
                                        <div className="w-full flex items-center justify-between gap-x-2">
                                            <span>{groups?.title}</span>
                                            <Tooltip title="حذف دسته بندی">
                                                <IconButton
                                                    color={`error`}
                                                    onClick={removeProductGroup(addProductGroup?.productId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </li>
                                </ul>}
                                <div className="flex items-center justify-end gap-x-2 mt-2">
                                    <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                        onClick={() => setOpenBottomProductGroupDrawer(false)}>
                                        <span className="mx-2">بستن</span>
                                    </Button>
                                    {!groups ? <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                        disabled={addProductGroup?.productGroupId ? false : true}
                                        onClick={addProductGroup?.productGroupId ? saveProductGroup : () => false}>
                                        <text className={`font-semibold ${addProductGroup?.productGroupId ? 'text-white' : 'text-white text-opacity-50 !visible'}`}>ثبت</text>
                                    </LoadingButton > : ''}
                                </div>
                            </>}
                    </form>
                </SwipeableDrawer>
            </>

            {/* AddGroup */}
            <>
                <Dialog onClose={() => setShowAddGroup(false)} open={showAddGroup} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>افزودن ثبت دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleGroupSubmit(saveGroup)}>
                        <div>
                            <FormControl className="w-full">
                                <Controller
                                    name="title"
                                    control={controlGroup}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان دسته بندی"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errorsGroup.title}
                                            helperText={errorsGroup.title ? errorsGroup.title.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                setGroupTitle(event.target.value);
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowAddGroup(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن دسته بندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog >

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomAddGroupDrawer}
                    onClose={() => setOpenBottomAddGroupDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>افزودن دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off" onSubmit={handleGroupSubmit(saveGroup)}>
                        <div>
                            <FormControl className="w-full">
                                <Controller
                                    name="title"
                                    control={controlGroup}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            type="text"
                                            label="عنوان دسته بندی"
                                            variant="outlined"
                                            InputLabelProps={{
                                                sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                            }}
                                            InputProps={{
                                                classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                                sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                            }}
                                            error={!!errorsGroup.title}
                                            helperText={errorsGroup.title ? errorsGroup.title.message : ''}
                                            onChange={(event) => {
                                                field.onChange(event);
                                                setGroupTitle(event.target.value);
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomAddGroupDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}>
                                <text className="text-black font-semibold">افزودن دسته بندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

            {/* EditGroup */}
            <>
                <Dialog onClose={() => setShowEditGroup(false)} open={showEditGroup} maxWidth={'xs'} fullWidth PaperProps={{ className: 'modals' }}>
                    <div className="flex flex-col gap-y-6">
                        <Typography component={'h2'}>ویرایش ثبت دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div>
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="عنوان دسته بندی"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={groupData?.title}
                                    onChange={(event) => setGroupData({ ...groupData, title: event.target.value })}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setShowEditGroup(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editGroup}>
                                <text className="text-black font-semibold">ویرایش دسته بندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </Dialog >

                <SwipeableDrawer
                    disableBackdropTransition={true}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    anchor={'bottom'}
                    open={openBottomEditGroupDrawer}
                    onClose={() => setOpenBottomEditGroupDrawer(false)}
                    PaperProps={{ className: 'drawers' }}
                    ModalProps={{
                        keepMounted: false
                    }}>
                    <div className="flex flex-col gap-y-6">
                        <div className="block"><div className="puller"></div></div>
                        <Typography component={'h2'}>ویرایش دسته بندی</Typography>
                    </div>
                    <form className="flex flex-col gap-y-4 mt-6" noValidate autoComplete="off">
                        <div>
                            <FormControl className="w-full">
                                <TextField
                                    type="text"
                                    label="عنوان دسته بندی"
                                    variant="outlined"
                                    InputLabelProps={{
                                        sx: { color: darkModeToggle ? 'rgb(255, 255, 255,0.7)' : 'rgb(0, 0, 0,0.7)' }
                                    }}
                                    InputProps={{
                                        classes: { root: 'dark:bg-dark', input: darkModeToggle ? 'text-white' : 'text-black', focused: 'border-none' },
                                        sx: { border: '1px solid rgb(255, 255, 255,0.2)', borderRadius: '16px' },
                                    }}
                                    value={groupData?.title}
                                    onChange={(event) => setGroupData({ ...groupData, title: event.target.value })}
                                />
                            </FormControl>
                        </div>
                        <div className="flex items-center justify-end gap-x-2 mt-2">
                            <Button variant="text" color="primary" size="medium" className="custom-btn text-black dark:text-white rounded-lg"
                                onClick={() => setOpenBottomEditGroupDrawer(false)}>
                                <span className="mx-2">انصراف</span>
                            </Button>
                            <LoadingButton type="submit" variant="contained" size="medium" className="rounded-lg" disableElevation loading={loading}
                                onClick={editGroup}>
                                <text className="text-black font-semibold">ویرایش دسته بندی</text>
                            </LoadingButton>
                        </div>
                    </form>
                </SwipeableDrawer>
            </>

        </div >
    )
}

export default ProductsPageCompo;