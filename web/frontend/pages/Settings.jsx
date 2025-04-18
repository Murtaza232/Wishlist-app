import React, { useState, useCallback, useEffect, useContext } from "react";
import {
    Card,
    Page,
    Layout,
    Tabs,
    Button,
    RangeSlider,
    FormLayout,
    Text,
    Select,
    InlineStack,
    Badge,
    Toast,
    SkeletonBodyText,
} from "@shopify/polaris";
import { InputField } from "../components/Utils/InputField"; // Adjust this path if needed
import { AppContext } from "../components/providers";
import axios from "axios";
import {getSessionToken} from "@shopify/app-bridge-utils";
import {Knob} from "../components/Knob.jsx"
import { useAppBridge } from "@shopify/app-bridge-react";
import SkeletonTable from "../components/SkeletonTable.jsx";
export default function Settings() {
    const { apiUrl } = useContext(AppContext);
    const appBridge = useAppBridge();
    const [selectedTab, setSelectedTab] = useState(0);
    const [btnLoading, setBtnLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [skeleton, setSkeleton] = useState(false);

    const tabs = [
        { id: "1", content: "API Vendor" },
        { id: "2", content: "SMTP" },
        { id: "3", content: "Upscaling" },
    ];
    const [errorToast, setErrorToast] = useState(false);
    const [sucessToast, setSucessToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");

    const handleTabChange = useCallback((selectedTabIndex) => setSelectedTab(selectedTabIndex), []);

    // API Vendor states
    const [selectedVendor, setSelectedVendor] = useState('magic_api');
    const [magicApiKey, setMagicApiKey] = useState('');
    const [deepfaceApiKey, setDeepfaceApiKey] = useState('');
    const [letsenhanceApiKey, setLetsenhanceApiKey] = useState('');

    // SMTP states
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpUsername, setSmtpUsername] = useState('');
    const [smtpPassword, setSmtpPassword] = useState('');
    const [smtpEmail, setSmtpEmail] = useState('');
    const [smtpFromName, setSmtpFromName] = useState('');
    const [smtpReplyTo, setSmtpReplyTo] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [subject, setSubject] = useState('');
    const [smtpType, setSmtpType] = useState('tls');



    const [selected, setSelected] = useState(0);


    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [fit, setFit] = useState('bounds');
    const [hdr, setHdr] = useState(50);
    const [formatType, setFormatType] = useState('jpeg');
    const [quality, setQuality] = useState(50);

    const toggleErrorMsgActive = useCallback(
        () => setErrorToast((errorToast) => !errorToast),
        []
    );
    const toggleSuccessMsgActive = useCallback(
        () => setSucessToast((sucessToast) => !sucessToast),
        []
    );

    const toastErrorMsg = errorToast ? (
        <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
    ) : null;

    const toastSuccessMsg = sucessToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;

    const smtpTypeOptions = [
        { label: "TLS", value: "tls" },
        { label: "SSL", value: "ssl" },
        { label: "STARTTLS", value: "start_tls" },
    ];

    const fitTypeOptions = [
        { label: "Bounds", value: "bounds" },
        { label: "Cover", value: "cover" },
        { label: "Canvas", value: "canvas" },
        { label: "Outpaint", value: "outpaint" },
        { label: "Crop", value: "crop" },
    ];

    const formatTypeOptions = [
        { label: "JPEG", value: "jpeg" },
        { label: "PNG", value: "png" },
        { label: "WEBP", value: "webp" },
        { label: "AVIF", value: "avif" },

    ];

    const handleSmtpType = useCallback((value) => setSmtpType(value), []);


    const handleFitType = useCallback((value) => setFit(value), []);
    const handleFormatType = useCallback((value) => setFormatType(value), []);

    useEffect(() => {
        getMailSmtpData();
    }, []);

    const getMailSmtpData = async () => {
        setSkeleton(true);
        setLoading(true)
        let sessionToken = await getSessionToken(appBridge);
        try {
            const response = await axios.get(
                `${apiUrl}setting`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            const data = response?.data?.data;
            setSmtpHost(data?.smtp_host);
            setSelectedVendor(data?.type)
            setSmtpUsername(data?.smtp_username);
            setSmtpPassword(data?.smtp_password);
            setSmtpEmail(data?.email_from);
            setSmtpFromName(data?.from_name);
            setSmtpReplyTo(data?.reply_to);
            setSmtpType(data?.smtp_type);
            setSmtpPort(data?.smtp_port);
            setSubject(data?.subject);
            setMagicApiKey(data?.magic_api_key)
            setDeepfaceApiKey(data?.deepface_api_key)
            setLetsenhanceApiKey(data?.letsenhance_api_key)
            setSelected(data?.email_notification)
            setWidth(data?.width)
            setHeight(data?.height)
            setFit(data?.fit)
            setHdr(data?.hdr)
            setFormatType(data?.format_type)
            setQuality(data?.quality)


        } catch (error) {
            console.error(error);
            setLoading(false)
            setErrorToast(false); // Assuming this controls toast type (success/error)
            setToastMsg( "Something went wrong");
        } finally {
            setLoading(false)
            setSkeleton(false);
        }
    };

    const mailSmtpDataSave = async () => {
        setBtnLoading(true);
        setSkeleton(true);


        const data = {
            smtp_host: smtpHost,
            smtp_username: smtpUsername,
            smtp_password: smtpPassword,
            email_from: smtpEmail,
            from_name: smtpFromName,
            reply_to: smtpReplyTo,
            smtp_type: smtpType,
            smtp_port: smtpPort,
            subject: subject,
            magic_api_key: magicApiKey,
            deepface_api_key: deepfaceApiKey,
            letsenhance_api_key: letsenhanceApiKey,
            type: selectedVendor,
            email_notification:selected,
            width: width,
            height: height,
            fit: fit,
            hdr: hdr,
            format_type: formatType,
            quality: quality
        };

        try {
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.post(`${apiUrl}save-setting`, data, {
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                },
            });

            // Show success message from response if available
            setSucessToast(true);
            setToastMsg(response.data?.message || "Settings saved successfully");
        } catch (error) {
            console.error(error);
            // Show error message to user
            setErrorToast(true); // Assuming this controls toast type (success/error)
            setToastMsg(error.response?.data?.message || "Failed to save settings");
        } finally {
            setBtnLoading(false);
            setSkeleton(false);
        }
    };

    return (
        <>
            {loading ? (
                <SkeletonTable />
            ) : (
                <>
                    <Page title="Settings">
                        <div className="tab-container">
                            <Tabs
                                selected={selectedTab}
                                onSelect={handleTabChange}
                                tabs={tabs}
                                fitted
                                renderActiveTabPanelOnly
                                className="custom-tabs"
                            >
                                <div className="tab-content">
                                    {/* API Vendor Tab */}
                                    {selectedTab === 0 && (
                                        <Card sectioned title="API Vendor">
                                            <FormLayout>

                                                <div className="input-field">
                                                    <label style={{display: "block", marginBottom: "0.5rem"}}>Email
                                                        Notifications</label>
                                                    <InlineStack align="start" blockAlign="center" gap="200">
                                                        <Knob
                                                            selected={selected}
                                                            ariaLabel="Toggle email notifications"
                                                            onClick={() => setSelected((prev) => (prev === 1 ? 0 : 1))}
                                                        />
                                                        <Text as="span" variant="bodyMd">
                                                            {selected === 1 ? "Enabled" : "Disabled"}
                                                        </Text>
                                                    </InlineStack>
                                                </div>

                                                <div className="input-field">
                                                    <Select
                                                        label="Select Vendor"
                                                        options={[
                                                            {label: "Magic", value: "magic_api"},
                                                            {label: "Deepfaceswap", value: "deepfaceswap"},
                                                        ]}
                                                        value={selectedVendor}
                                                        onChange={setSelectedVendor}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Magic API Key"
                                                        type="text"
                                                        value={magicApiKey}
                                                        onChange={(e) => setMagicApiKey(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Deepface API Key"
                                                        type="text"
                                                        value={deepfaceApiKey}
                                                        onChange={(e) => setDeepfaceApiKey(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Letsenhance API Key"
                                                        type="text"
                                                        value={letsenhanceApiKey}
                                                        onChange={(e) => setLetsenhanceApiKey(e.target.value)}
                                                    />
                                                </div>
                                            </FormLayout>
                                        </Card>
                                    )}

                                    {/* SMTP Tab */}
                                    {selectedTab === 1 && (
                                        <Card sectioned title="SMTP Settings">
                                            <FormLayout>
                                                <div className="input-field">
                                                    <InputField
                                                        label="SMTP Host*"
                                                        type="text"
                                                        value={smtpHost}
                                                        onChange={(e) => setSmtpHost(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="SMTP Username*"
                                                        type="text"
                                                        value={smtpUsername}
                                                        onChange={(e) => setSmtpUsername(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="SMTP Password*"
                                                        type="password"
                                                        value={smtpPassword}
                                                        onChange={(e) => setSmtpPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Email From*"
                                                        type="email"
                                                        value={smtpEmail}
                                                        onChange={(e) => setSmtpEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="From Name*"
                                                        type="text"
                                                        value={smtpFromName}
                                                        onChange={(e) => setSmtpFromName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Reply To*"
                                                        type="email"
                                                        value={smtpReplyTo}
                                                        onChange={(e) => setSmtpReplyTo(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="SMTP Port*"
                                                        type="text"
                                                        value={smtpPort}
                                                        onChange={(e) => setSmtpPort(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Subject*"
                                                        type="text"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <Select
                                                        label="SMTP Type"
                                                        options={smtpTypeOptions}
                                                        value={smtpType}
                                                        onChange={handleSmtpType}
                                                    />
                                                </div>
                                            </FormLayout>
                                        </Card>
                                    )}

                                    {selectedTab === 2 && (
                                        <Card sectioned title="Upscalling Settings">
                                            <FormLayout>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Width"
                                                        type="text"
                                                        value={width}
                                                        onChange={(e) => setWidth(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <InputField
                                                        label="Height"
                                                        type="text"
                                                        value={height}
                                                        onChange={(e) => setHeight(e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <Select
                                                        label="Fit"
                                                        options={fitTypeOptions}
                                                        value={fit}
                                                        onChange={handleFitType}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <RangeSlider
                                                        label="Hdr"
                                                        value={hdr}
                                                        onChange={(value) => setHdr(value)}
                                                        output
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <Select
                                                        label="Format Type"
                                                        options={formatTypeOptions}
                                                        value={formatType}
                                                        onChange={handleFormatType}
                                                    />
                                                </div>
                                                <div className="input-field">
                                                    <RangeSlider
                                                        label="Quality"
                                                        value={quality}
                                                        onChange={(value) => setQuality(value)}
                                                        output
                                                        min={0}
                                                        max={100}
                                                    />
                                                </div>




                                            </FormLayout>
                                        </Card>
                                    )}
                                </div>
                            </Tabs>

                            <div className="actions">
                                <Button loading={btnLoading} onClick={mailSmtpDataSave} primary>
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </Page>

                    {toastErrorMsg}
                    {toastSuccessMsg}
                </>
            )}
        </>
    );

}
