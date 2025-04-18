import {
    Card,
    Page,
    Layout,
    TextContainer,
    Image,
    BlockStack,
    Frame,
    Banner,
    List,
    Modal,
    Box,
    useIndexResourceState,
    ButtonGroup,
    Icon,
    Toast,
    Tabs,
    TextField,
    EmptySearchResult,
    IndexFiltersMode,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    Pagination,
    InlineStack,
    Loading,
    Badge,
    Button,
    IndexTable,
    Link,
    Text,
} from "@shopify/polaris";

import {TitleBar, useAppBridge} from "@shopify/app-bridge-react";
import SkeletonTable from "../components/SkeletonTable.jsx";
import {
    EditIcon,
    DeleteIcon,
    ExternalSmallIcon,
    ViewIcon

} from "@shopify/polaris-icons";
import { useTranslation, Trans } from "react-i18next";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { trophyImage } from "../assets";
import  rule  from "../assets/rule.png";


import {AppContext, ProductsCard} from "../components";
import {useNavigate} from "react-router-dom";
import {getSessionToken} from "@shopify/app-bridge-utils";
import axios from "axios";

export default function HomePage() {
    const { t } = useTranslation();
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const [modalReassign, setModalReassign] = useState(false);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const queryParams = new URLSearchParams(location.search);
    const [paginationValue, setPaginationValue] = useState(1);
    const currentPage = parseInt(queryParams.get('page')) || 1;
    const search_value = (queryParams.get('search')) || "";
    const [queryValue, setQueryValue] = useState(search_value);
    const [showClearButton, setShowClearButton] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);
    const [toggleLoadData, setToggleLoadData] = useState(true);
    const [modalImage, setModalImage] = useState(null); // Store image URL

    const [appStatus, setAppStatus] = useState(false);
    const [passwordProtected, setPasswordProtected] = useState(false);
    const [linkUrl, setLinkUrl] = useState(null);
    const [builderDetails, setBuilderDetails] = useState([]);
    const {mode, setMode} = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
    const [toastMsg, setToastMsg] = useState('')

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState({
        src: '',
        alt: '',
    });

    const [ruleID, setRuleID] = useState("");
    const toggleDeleteModalClose = useCallback(() => {
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);
    const onHandleCancel = () => {};
    const navigate = useNavigate();

    // const [rules, setRules] = useState([]);
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(builderDetails);


    const allResourcesSelect = builderDetails?.every(({ id }) =>
        selectedResources.includes(id)
    );
    const toggleDeleteModal = useCallback((id) => {
        setRuleID(id);
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);



    const fetchData = async () => {
        try {
            setTableLoading(true)
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.get(
                `${apiUrl}get-images?search=${queryValue}&page=${paginationValue}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );

            if (response?.status === 200) {

                setBuilderDetails(response?.data?.data?.data);
                setLoading(false);
                setToggleLoadData(false);
                setHasNextPage(response?.data?.data?.last_page > paginationValue);
                setHasPreviousPage(paginationValue > 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    const handleImageClick = (e, src, alt) => {
        e.stopPropagation(); // Prevent row click
        setSelectedImage({ src, alt });
        setModalOpen(true);
    };



    const handlePagination = (value) => {
        if (value == "next") {
            setPaginationValue(paginationValue + 1);
        } else {
            setPaginationValue(paginationValue - 1);
        }
        setLoading(true);
        setToggleLoadData(true);
    };



    const handleButtonClick = () => {
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    };

    useEffect(() => {
        if (toggleLoadData) {
            fetchData();
        }
    }, [toggleLoadData, selected, queryValue]);




    const emptyStateMarkup = (
        // <EmptySearchResult title={"No Rule Found"} withIllustration />

        <Box padding={"600"}>
            <BlockStack inlineAlign="center">
                <Box maxWidth="100%">
                    <BlockStack inlineAlign="center">
                        <BlockStack gap={300}>
                            <div className="flex justify-center items-center">
                                <img src={rule} width={100} height={48} alt="" />
                            </div>
                            <Text as="p" variant="bodyLg" alignment="center" >
                                No Record has been found
                            </Text>
                            {/*<Text as="p" variant="bodyMd" tone="subdued">*/}
                            {/*    No Rule available. Consider creating a new one to get started!*/}
                            {/*</Text>*/}
                        </BlockStack>
                    </BlockStack>
                </Box>
            </BlockStack>
        </Box>
    );
    function handleRowClick(id) {
        const target = event.target;
        const isCheckbox = target.tagName === "INPUT" && target.type === "checkbox";

        if (!isCheckbox) {
            event.stopPropagation(); // Prevent row from being selected
        } else {
            // Toggle selection state of row
            const index = selectedResources.indexOf(id);
            if (index === -1) {
                handleSelectionChange([...selectedResources, id]);
            } else {
                handleSelectionChange(selectedResources.filter((item) => item !== id));
            }
        }
    }

    const formatDate = (created_at) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const date = new Date(created_at);

        const monthName = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        const formattedDate = `${monthName} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    };



    const resourceName = {
        singular: "Builder",
        plural: "Builders",
    };
    const [errorToast, setErrorToast] = useState(false);
    const [sucessToast, setSucessToast] = useState(false);
    const handleReassignCloseAction = () => {
        setUniqueId();
        setSellerEmail("");
        setModalReassign(false);
    };

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value);
        setToggleLoadData(true);
    }, []);


    const handleInfoModal = (image) => {
        setModalImage(image); // Set the image URL
        setActiveDeleteModal(true); // Open modal
    };

    // ------------------------Toasts Code start here------------------
    const toggleErrorMsgActive = useCallback(() => setErrorToast((errorToast) => !errorToast), []);
    const toggleSuccessMsgActive = useCallback(() => setSucessToast((sucessToast) => !sucessToast), []);


    const toastErrorMsg = errorToast ? (
        <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
    ) : null;

    const toastSuccessMsg = sucessToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;


    const handleCreateRule = async () => {

        navigate('/CreateRule')

    };

    const [itemStrings, setItemStrings] = useState([
        // "All",
        // "Active",
        // "Inactive",
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: index === 0,

    }));

    const handleOrderFilter =async (value) =>  {
        setSelected(value)
        setLoading(true)
        const sessionToken = await getSessionToken(appBridge);

    }



    const rowMarkup = builderDetails?.map(
        (
            {
                id,
                original_image,
                swapped_image_without_water_mark,
                swapped_image_with_water_mark,
                created_at
            },
            index
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
                onClick={() => handleRowClick(id)}
            >

                <IndexTable.Cell>
                    {original_image ? (
                        <img
                            src={original_image}
                            alt="Original"
                            onClick={(e) => handleImageClick(e, original_image, 'Original')}
                            style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        />
                    ) : (
                        "---"
                    )}
                </IndexTable.Cell>

                {/* Column 1: Without Watermark Image */}

                <IndexTable.Cell>
                    {swapped_image_without_water_mark ? (
                        <img
                            src={swapped_image_without_water_mark}
                            alt="Without Watermark"
                            onClick={(e) => handleImageClick(e, swapped_image_without_water_mark, 'Without Watermark')}
                            style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        />
                    ) : (
                        "---"
                    )}
                </IndexTable.Cell>

                {/* Column 2: With Watermark Image */}
                <IndexTable.Cell>
                    {swapped_image_with_water_mark ? (
                        <img
                            src={swapped_image_with_water_mark}
                            alt="With Watermark"
                            onClick={(e) => handleImageClick(e, swapped_image_with_water_mark, 'With Watermark')}
                            style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        />
                    ) : (
                        "---"
                    )}
                </IndexTable.Cell>

                {/* Column 3: Date */}
                <IndexTable.Cell>
                    {created_at != null ? formatDate(created_at) : "---"}
                </IndexTable.Cell>


            </IndexTable.Row>
        )
    );




    return (

        <>
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedImage.alt}
                sectioned

            >
                <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    style={{ width: '100%', borderRadius: '8px' }}
                />
            </Modal>
            {loading ? (
                <SkeletonTable />
            ) : (

                <>
                    <Page


                          title="Media"


                    >
                        <Layout>
                            <Layout.Section>
                                <LegacyCard>
                                    {/*<IndexFilters*/}
                                    {/*    loading={toggleLoadData}*/}
                                    {/*    queryValue={queryValue}*/}
                                    {/*    queryPlaceholder="Searching in all"*/}
                                    {/*    onQueryChange={handleFiltersQueryChange}*/}
                                    {/*    onQueryClear={() => {*/}
                                    {/*        setQueryValue("");*/}
                                    {/*        setToggleLoadData(true);*/}
                                    {/*    }}*/}
                                    {/*    cancelAction={{*/}
                                    {/*        onAction: onHandleCancel,*/}
                                    {/*        disabled: false,*/}
                                    {/*        loading: false,*/}
                                    {/*    }}*/}
                                    {/*    tabs={tabs}*/}

                                    {/*    selected={selected}*/}
                                    {/*    onSelect={(selected) => {*/}
                                    {/*        setSelected(selected);*/}
                                    {/*        setToggleLoadData(true);*/}
                                    {/*    }}*/}
                                    {/*    canCreateNewView={false}*/}
                                    {/*    hideFilters*/}
                                    {/*    mode={mode}*/}
                                    {/*    setMode={setMode}*/}
                                    {/*    filteringAccessibilityTooltip="Search"*/}
                                    {/*/>*/}
                                    <IndexTable
                                        resourceName={resourceName}
                                        itemCount={builderDetails?.length}
                                        selectable={false}
                                        emptyState={emptyStateMarkup}
                                        loading={tableLoading}
                                        pagination={{
                                            hasPrevious: hasPreviousPage
                                                ? true
                                                : false,
                                            onPrevious: () =>
                                                handlePagination("prev"),
                                            hasNext: hasNextPage ? true : false,
                                            onNext: () => handlePagination("next"),
                                        }}
                                        headings={[

                                            { title: "Orignal" },
                                            { title: "Without Watermark" },
                                            { title: "With WaterMark" },
                                            { title: "Date" },
                                        ]}
                                    >
                                        {rowMarkup}
                                    </IndexTable>
                                </LegacyCard>
                            </Layout.Section>
                            <Layout.Section></Layout.Section>
                            <Layout.Section></Layout.Section>
                        </Layout>

                        {toastErrorMsg}
                        {toastSuccessMsg}
                    </Page>
                </>

            )}
        </>
    );
}
