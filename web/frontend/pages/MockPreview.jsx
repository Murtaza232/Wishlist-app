import React, { useState } from "react";
import { Icon, Divider, Box,Card, Checkbox } from "@shopify/polaris";
import { HeartIcon, StarIcon, BillFilledIcon, ShareIcon, CartIcon } from "@shopify/polaris-icons";
import imagemodal from '../assets/modalimage.svg';

const ICONS = {
    Heart: HeartIcon,
    Star: StarIcon,
    Bookmark: BillFilledIcon,
};

// Utility to clone and override fill/color on SVG icon
function withFill(Component, fill, size, thickness) {
  const resolvedStrokeWidth = (typeof thickness === 'number') ? thickness : 2;
  return (
    <Component
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      fill={fill}
      color={fill}
      stroke={fill}
      strokeWidth={resolvedStrokeWidth}
    />
  );
}

function WishlistButton({
    primaryColor,
    secondaryColor,
    selectedIcon,
    buttonType = "icon-text",
    buttonStyle = "solid",
    buttonLabel = "Add To Wishlist",
    borderRadius = 8,
    width = '100%',
    buttonTextTab = 'before',
    isFullWidthIcon = false,
    buttonSize = 40,
    renderRawIcon = false,
    iconThickness = 1,
}) {
    const isIconOnly = buttonType === 'icon' || buttonType === 'only-icon';
    const isIconTextOrText = buttonType === 'icon-text' || buttonType === 'text';
    const isAdded = buttonLabel.trim().toLowerCase() === 'added to wishlist' && buttonTextTab === 'after';
    // Icon and text size logic
    let iconSize = buttonSize || 24;
    let textSize = buttonSize ? Math.max(12, Math.round(buttonSize * 0.35)) : (isAdded ? 12 : (isIconTextOrText ? 14 : 16));
    // When thickness is 1 (minimum), ensure icon size is appropriate
    if (typeof iconThickness === 'number' && iconThickness === 1) {
      iconSize = Math.max(textSize, 16); // Ensure minimum icon size
    }
    let style = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isIconTextOrText ? 8 : (buttonType === 'icon-text' ? 6 : 0),
        fontWeight: 600,
        fontSize: isIconOnly ? undefined : textSize,
        borderRadius: isFullWidthIcon ? 0 : (isIconTextOrText ? 0 : borderRadius),
        height: buttonSize || (isFullWidthIcon ? 48 : (isIconTextOrText ? 40 : 48)),
        minHeight: buttonSize || 40,
        padding: isFullWidthIcon ? 0 : (isIconOnly ? 0 : '0 18px'),
        border: buttonStyle === 'outline' ? `2px solid ${primaryColor}` : 'none',
        background: buttonStyle === 'solid' ? primaryColor : buttonStyle === 'plain' ? 'transparent' : '#fff',
        color: buttonStyle === 'solid' ? secondaryColor : primaryColor,
        minWidth: isFullWidthIcon ? 0 : (isIconOnly ? 48 : 100),
        boxShadow: 'none',
        width: isFullWidthIcon ? '100%' : (isIconOnly ? 48 : (isIconTextOrText ? 170 : width)),
    };
    const IconComponent = ICONS[selectedIcon] || HeartIcon;
    return (
        <div style={style}>
            {(buttonType === 'icon-text' || isIconOnly) && (
                renderRawIcon
                  ? withFill(IconComponent, buttonStyle === 'solid' ? secondaryColor : primaryColor, iconSize, iconThickness)
                  : <Icon source={ICONS[selectedIcon] || HeartIcon} color={buttonStyle === 'solid' ? 'critical' : 'base'} style={{ width: iconSize, height: iconSize, minWidth: iconSize, minHeight: iconSize, strokeWidth: iconThickness }} />
            )}
            {(buttonType === 'icon-text' || buttonType === 'text') && (
                <span style={{ fontWeight: 600, fontSize: isIconOnly ? undefined : textSize }}>{buttonLabel}</span>
            )}
        </div>
    );
}

export default function MockPreview({
    primaryColor = "#000000",
    secondaryColor = "#ffffff",
    selectedIcon = "Heart",
    buttonPosition = "below",
    buttonPositionTab = "near",
    buttonType = "icon-text",
    buttonStyle = "solid",
    buttonLabel = "Add To Wishlist",
    buttonTextTab = "before",
    activeTab = "basics",
    gridPreview = false,
    collectionsEnabled = true,
    collectionsButtonPosition = 'top-right',
    wishlistType = 'page',
    wishlistPageTitle = 'My Wishlist',
    wishlistShareEnabled = true,
    wishlistLaunchFrom = 'header',
    saveForLaterEnabled,
    saveForLaterTitle,
    saveForLaterPrimary,
    saveForLaterSecondary,
    floatingButtonPosition,
    showCount,
    saveForLaterPermission = undefined,
    previewWidth,
    buttonSize,
    iconThickness = 1,
    drawerAlignment = 'left', // Added for drawer alignment
    floatingButtonCornerRadius = 10, // Add this prop
    textColor = '#222222',
}) {
    // Fix: define these for use in overlay logic
    const isIconOnly = buttonType === 'icon' || buttonType === 'only-icon';
    const isIconTextOrText = buttonType === 'icon-text' || buttonType === 'text';
    const borderRadius = 8; // Default for icon-only

    // Add this at the top of the component function
    const badgeStyle = {
        position: 'absolute',
        top: -12,
        left: -12,
        background: 'red',
        color: '#fff',
        width: 22,
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 13,
        border: '2px solid #fff',
        borderRadius: '50%',
    };

    // Collections grid preview
    if (gridPreview) {
        // Map position to style
        const posStyle = {
            'top-left': { top: 0, left: 0, right: 'auto', bottom: 'auto' },
            'top-right': { top: 0, right: 0, left: 'auto', bottom: 'auto' },
            'bottom-left': { bottom: 0, left: 0, right: 'auto', top: 'auto' },
            'bottom-right': { bottom: 0, right: 0, left: 'auto', top: 'auto' },
        };
        const iconPos = posStyle[collectionsButtonPosition] || posStyle['top-right'];

        // Responsive styles for collections grid
        const gridResponsiveStyle = `
          @media (max-width: 900px) {
            .collections-mock-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .collections-mock-card, .collections-mock-img {
              width: 100% !important;
              max-width: 340px !important;
            }
          }
          @media (max-width: 600px) {
            .collections-mock-grid {
              grid-template-columns: 1fr !important;
            }
            .collections-mock-card, .collections-mock-img {
              width: 100% !important;
              max-width: 100vw !important;
            }
          }
        `;

        return (
            <div style={{ padding: 0, width: '100%' }}>
                <div
                    style={{
                        background: '#fff',
                        border: '1px solid #e3e3e3',
                        borderRadius: 12,
                        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                        padding: 0,
                        minHeight: 400,
                        maxWidth: '700px',
                        margin: '0 auto',
                    }}
                >
                    <div style={{ marginBottom: 12, padding: '18px 0 0 18px' }}>
                        <span
                            style={{
                                background: '#f7f7f7',
                                borderRadius: 8,
                                fontWeight: 500,
                                color: '#888',
                                fontSize: 15,
                                padding: '4px 16px',
                            }}
                        >
                            Mock Preview
                        </span>
                    </div>
                    <Divider style={{ margin: 0 }} />
                    <div
                        className="collections-mock-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 12,
                            marginTop: 10,
                            padding: 20,
                            overflowX: 'hidden',
                        }}
                    >
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="collections-mock-card"
                                style={{
                                    background: '#fff',
                                    border: '1px solid #e3e3e3',
                                    borderRadius: 12,
                                    padding: 12,
                                    position: 'relative',
                                    minHeight: 240,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    maxWidth: '100%',
                                }}
                            >
                                <div
                                    className="collections-mock-img"
                                    style={{
                                        width: '100%',
                                        height: 140,
                                        background: '#e5e5e5',
                                        borderRadius: 10,
                                        marginBottom: 12,
                                        position: 'relative',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {collectionsEnabled && (
                                        <div style={{ position: 'absolute', ...iconPos }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType="icon"
                                                buttonStyle="plain"
                                                buttonLabel={buttonLabel}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={false}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* Title skeleton */}
                                <div
                                    style={{
                                        width: '90%',
                                        height: 22,
                                        background: '#e5e5e5',
                                        borderRadius: 6,
                                        marginBottom: 12,
                                    }}
                                />
                                {/* Line skeleton (absolute at bottom) */}
                                <div
                                    style={{
                                        width: '95%',
                                        height: 8,
                                        background: '#e5e5e5',
                                        borderRadius: 4,
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        bottom: 16,
                                        margin: '0 auto',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <style>{gridResponsiveStyle}</style>
            </div>
        );
    }

    // Card wrapper style
    const cardStyle = {
        background: '#fff',
        border: '1px solid #e3e3e3',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        minHeight: 400,
        maxHeight: 540,
        height: 500,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        padding: 0,
        margin: 0,
        width: previewWidth || 'calc(100% - 10px)',
        maxWidth: previewWidth || '100%',
    };

    // For product tab, show button in correct position
    if (activeTab === "product") {
        // Near cart button positions
        if (buttonPositionTab === "near") {
            return (
                <div style={{ padding: '0 0 0 0', width: '100%' }}>

                    <div style={cardStyle}>
                        <div style={{ marginBottom: 12, marginTop: 15, marginLeft: 20 }}>
                            <span style={{ background: '#f7f7f7', borderRadius: 8, fontWeight: 500, color: '#888', fontSize: 15, padding: '4px 16px' }}>
                                Mock Preview
                            </span>
                        </div>
                        <Divider />
                        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
                            {/* Product Image Skeleton */}
                            <div style={{ width: 350, height: 350, background: '#e5e5e5', borderRadius: 10, margin: 32 }} />
                            {/* Product Info and Button */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 16, margin: '32px 32px 32px 0' }}>
                                <div style={{ width: '80%', height: 28, background: '#e5e5e5', borderRadius: 6, marginBottom: 8 }} />
                                <div style={{ width: '60%', height: 22, background: '#e5e5e5', borderRadius: 6, marginBottom: 10 }} />
                                <div style={{ width: '90%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                                <div style={{ width: '70%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                                <div style={{ width: '60%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 10 }} />
                                {/* Cart and Wishlist Button Row */}
                                {(buttonPosition === 'left' || buttonPosition === 'right') ? (
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 16 }}>
                                        {buttonPosition === 'left' &&
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={false}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        }
                                        <div style={{ width: 120, height: 40, background: '#e5e5e5', borderRadius: 8 }} />
                                        {buttonPosition === 'right' &&
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={false}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        }
                                    </div>
                                ) : (
                                    <>
                                        {buttonPosition === 'above' &&
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly && (buttonPosition === 'above' || buttonPosition === 'below')}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        }
                                        <div style={{ height: 40, background: '#e5e5e5', borderRadius: 8, margin: buttonPosition === 'above' ? '12px 0 0 0' : '0 0 12px 0' }} />
                                        {buttonPosition === 'below' &&
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly && (buttonPosition === 'above' || buttonPosition === 'below')}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        }
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        // On product image positions
        if (buttonPositionTab === "image") {
            return (
                <div style={{ padding: '0 0 0 0', width: '100%' }}>
                   
                    <div style={cardStyle}>
                    <div style={{ marginBottom: 12,marginTop:10,marginLeft:12}}>
                        <span style={{ background: '#f7f7f7', borderRadius: 8, fontWeight: 500, color: '#888', fontSize: 15, padding: '4px 16px' }}>
                            Mock Preview
                        </span>
                    </div>
                    <Divider />
                        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
                            {/* Product Image with Button Overlay */}
                            <div style={{ position: 'relative', width: 350, height: 350, background: '#e5e5e5', borderRadius: 10, margin: 32, overflow: 'hidden' }}>
                                {/* Button overlayed in correct corner, flush with edge */}
                                {buttonPosition === 'top-left' && (
                                    buttonType === 'icon' || buttonType === 'only-icon' ? (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: 48, height: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, left: 0, height: 56, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    )
                                )}
                                {buttonPosition === 'top-right' && (
                                    buttonType === 'icon' || buttonType === 'only-icon' ? (
                                        <div style={{ position: 'absolute', top: 0, right: 0, width: 48, height: 48, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', top: 0, right: 0, height: 56, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    )
                                )}
                                {buttonPosition === 'bottom-left' && (
                                    buttonType === 'icon' || buttonType === 'only-icon' ? (
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 48, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    )
                                )}
                                {buttonPosition === 'bottom-right' && (
                                    buttonType === 'icon' || buttonType === 'only-icon' ? (
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 48, height: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    ) : (
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, height: 56, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                            <WishlistButton
                                                primaryColor={primaryColor}
                                                secondaryColor={secondaryColor}
                                                selectedIcon={selectedIcon}
                                                buttonType={buttonType}
                                                buttonStyle={buttonStyle}
                                                buttonLabel={buttonLabel}
                                                borderRadius={isIconOnly ? borderRadius : 0}
                                                width={isIconOnly ? 48 : 170}
                                                buttonTextTab={buttonTextTab}
                                                isFullWidthIcon={isIconOnly}
                                                buttonSize={buttonSize}
                                                renderRawIcon={true}
                                                iconThickness={iconThickness}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                            {/* Product Info Skeleton */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                                <div style={{ width: '80%', height: 28, background: '#e5e5e5', borderRadius: 6, marginBottom: 8 }} />
                                <div style={{ width: '60%', height: 22, background: '#e5e5e5', borderRadius: 6, marginBottom: 10 }} />
                                <div style={{ width: '90%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                                <div style={{ width: '70%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                                <div style={{ width: '60%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 10 }} />
                                <div style={{ width: '100%', height: 18, background: '#e5e5e5', borderRadius: 8, marginBottom: 8 }} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
    // Helper: should use primary color for title/share/add to cart/nav
    const usePrimaryColorForHeaderFields = activeTab === 'wishlist' && wishlistLaunchFrom === 'header';
    const usePrimaryColorForFloatingFields = activeTab === 'wishlist' && wishlistLaunchFrom === 'floating';
    const usePrimaryColorForMenuFields = activeTab === 'wishlist' && wishlistLaunchFrom === 'menu';

    // Helper for navigation items
    const navItems = [
        <span key="home" style={{ fontWeight: 500, fontSize: 16, color: '#888', letterSpacing: 0.2 }}>HOME</span>,
        <span key="categories" style={{ fontWeight: 500, fontSize: 16, color: '#888', letterSpacing: 0.2 }}>CATEGORIES</span>,
    ];
    if (wishlistLaunchFrom === 'menu') {
        navItems.push(
            <span
                key="wishlist"
                style={{
                    fontWeight: 500,
                    fontSize: 16,
                    color: '#888',
                    letterSpacing: 0.2,
                }}
            >
                WISHLIST
            </span>
        );
    }

    // Header row (always shown)
    const headerRow = (
        <>
            <div style={{ marginBottom: 12, padding: '18px 0 0 18px' }}>
                <span style={{ background: '#f7f7f7', borderRadius: 8, fontWeight: 500, color: '#888', fontSize: 15, padding: '4px 16px' }}>
                    Mock Preview
                </span>
            </div>
            
            <Divider style={{ margin: 0 }} />
            {/* Wishlist header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px 0 32px', gap: 24 }}>
                <div style={{ display: 'flex', gap: 36 }}>
                    {...navItems}
                </div>
                <div style={{ display: 'flex', gap: 18 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f3f3' }} />
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f3f3' }} />
                    {wishlistLaunchFrom === 'header' && (
                        <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#f3f3f3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                         
                        }}>
                            <Icon source={HeartIcon} color="base" />
                        </div>
                    )}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon source={CartIcon} tone="base" />
                    </div>
                </div>
            </div>
            <Divider style={{ margin: '25px 0 0 0' }} />
        </>
    );
    // Wishlist content (below header)
    const wishlistContent = (
        <>
            {/* Wishlist title and share */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: wishlistType === 'modal' ? '28px 24px 0 24px' : '28px 32px 0 32px',
                gap: 24
            }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: textColor, textAlign: 'left' }}>{wishlistPageTitle || 'My Wishlist'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, visibility: wishlistShareEnabled ? 'visible' : 'hidden' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f3f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon source={ShareIcon} tone="base" />
                    </div>
                    <span style={{ color: textColor, fontWeight: 500, fontSize: 15 }}>Share</span>
                </div>
            </div>
            <Divider style={{ margin: '24px 0 0 0' }} />
            {/* Wishlist grid */}
            <div style={{ padding: 0, margin: '0 0 0 0', width: '100%' }}>
                <div style={{ display: 'grid', gridTemplateColumns: wishlistType === 'drawer' ? '1fr 1fr' : 'repeat(4, 1fr)', gap: wishlistType === 'drawer' ? 24 : wishlistType === 'modal' ? 10 : 20, padding: wishlistType === 'drawer' ? 24 : 32 }}>
                    {[...Array(wishlistType === 'drawer' ? 4 : 8)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: wishlistType === 'drawer' ? 90 : wishlistType === 'modal' ? 100 : 120, height: wishlistType === 'drawer' ? 120 : wishlistType === 'modal' ? 130 : 160, background: '#e5e5e5', borderRadius: 10, marginBottom: wishlistType === 'drawer' ? 10 : 12 }} />
                            <span style={{ color: textColor, fontWeight: 500, fontSize: wishlistType === 'drawer' ? 13 : 14, marginTop: 2 }}>+ Add to Cart</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
    // Floating button for wishlistLaunchFrom === 'floating'
    const floatingBtnPos = (typeof floatingButtonPosition !== 'undefined' ? floatingButtonPosition : 'bottom-right') || 'bottom-right';
    const floatingButton = wishlistLaunchFrom === 'floating' ? (
        floatingBtnPos === 'left' ? (
            <div style={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
            }}>
                <div style={{
                    width: 180,
                    height: 48,
                    background: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    paddingLeft: 16,
                    color: secondaryColor,
                    fontWeight: 600,
                    fontSize: 18,
                    borderRadius: floatingButtonCornerRadius,
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={secondaryColor} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span style={{ marginLeft: 10, color: secondaryColor }}>My Wishlist</span>
                    {showCount && <div style={badgeStyle}>4</div>}
                </div>
            </div>
        ) : floatingBtnPos === 'right' ? (
            <div style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
            }}>
                <div style={{
                    width: 180,
                    height: 48,
                    background: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    paddingRight: 16,
                    color: secondaryColor,
                    fontWeight: 600,
                    fontSize: 18,
                    borderRadius: floatingButtonCornerRadius,
                }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={secondaryColor} xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span style={{ marginRight: 10, color: secondaryColor }}>My Wishlist</span>
                    {showCount && <div style={badgeStyle}>4</div>}
                </div>
            </div>
        ) : floatingBtnPos === 'bottom-right' ? (
            <div style={{
                position: 'absolute',
                right: 32,
                bottom: 10,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    background: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: floatingButtonCornerRadius,
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={secondaryColor} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {showCount && <div style={badgeStyle}>4</div>}
                </div>
            </div>
        ) : floatingBtnPos === 'bottom-left' ? (
            <div style={{
                position: 'absolute',
                left: 32,
                bottom: 10,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
            }}>
                <div style={{
                    width: 48,
                    height: 48,
                    background: primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: floatingButtonCornerRadius,
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill={secondaryColor} xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {showCount && <div style={badgeStyle}>4</div>}
                </div>
            </div>
        ) : null
    ) : null;
    if (activeTab === 'wishlist' && (wishlistType === 'page' || wishlistType === 'drawer')) {
        if (wishlistType === 'drawer') {
            return (
                <div style={{
                    padding: 0,
                    width: previewWidth || '100%',
                    border: '1px solid #e3e3e3',
                    borderRadius: 12,
                    boxSizing: 'border-box',
                    background: '#fff',
                    position: 'relative',
                    minHeight: 550,
                    height: 550,
                    overflow: 'hidden',
                }}>
                    {headerRow}
                    {/* Drawer panel absolutely positioned left or right */}
                    <div style={{
                        position: 'absolute',
                        marginTop:30,
                        top: 80, // adjust as needed for header height
                        bottom: 0,
                        left: drawerAlignment === 'left' ? 0 : 'auto',
                        right: drawerAlignment === 'right' ? 0 : 'auto',
                        width: 380,
                        background: '#fff',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                        border: '1px solid #e3e3e3',
                        borderRadius: 12,
                        zIndex: 2,
                        overflow: 'hidden',
                        height: 'calc(100% - 110px)',
                    }}>
                        {wishlistContent}
                    </div>
                    {/* Floating button remains unchanged */}
                    {floatingButton}
                </div>
            );
        }
        // Separate page
        return (
            <div style={{
                background: '#fff',
                border: '1px solid #e3e3e3',
                borderRadius: 12,
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                padding: 0,
                minHeight: 400,
                position: 'relative',
                width: previewWidth || '100%',
            }}>
                {headerRow}
                {wishlistContent}
                {floatingButton}
            </div>
        );
    }
    if (activeTab === 'wishlist' && wishlistType === 'modal') {
        return (
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 500,
                padding: 0,
                border: '1px solid #e3e3e3',
                borderRadius: 12,
                boxSizing: 'border-box',
                background: '#fff',
                position: 'relative',
            }}>
                <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
                    {headerRow}
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 25 }}>
                        <div style={{
                            position: 'relative',
                            background: '#fff',
                            border: '1px solid #e3e3e3',
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            width: 600,
                            minHeight: 400,
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}>
                            {/* Close icon */}
                            <div style={{
                                position: 'absolute',
                                top: 18,
                                right: 18,
                                cursor: 'pointer',
                                zIndex: 2,
                            }}>
                                <span style={{ fontSize: 24, color: '#888' }}>×</span>
                            </div>
                            {/* Wishlist content (centered fields) */}
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {wishlistContent}
                            </div>
                        </div>
                    </div>
                    {floatingButton}
                </div>
            </div>
        );
    }
    if (activeTab === 'cart') {
        const [dontAskAgainChecked, setDontAskAgainChecked] = useState(false);
        return (
            <div style={{
                width: '100%',
                minHeight: 500,
                background: '#fff',
                border: '1px solid #e3e3e3',
                borderRadius: 16,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 0,
                position: 'relative',
            }}>
                <div style={{ marginBottom: 12, padding: '18px 0 0 18px' }}>
                    <span style={{ background: '#f7f7f7', borderRadius: 8, fontWeight: 500, color: '#888', fontSize: 15, padding: '4px 16px' }}>
                        Mock Preview
                    </span>
                </div>
                
                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}>
                    <div style={{
                        width: 220,
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                        border: '1px solid #e3e3e3',
                        padding: '24px 16px 20px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 18,
                        alignItems: 'flex-start',
                        marginRight: 32,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 22, color: '#3a4a7c', marginBottom: 18 }}>Cart</div>
                        {[...Array(2)].map((_, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
                                <div style={{ width: 80, height: 110, background: '#e5e5e5', borderRadius: 8 }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ width: '150%', height: 10, background: '#ededed', borderRadius: 4 }} />
                                    <div style={{ width: '100%', height: 10, background: '#ededed', borderRadius: 4 }} />
                                    <a href="#" style={{ color: '#3a4a7c', fontSize: 14, marginTop: 8, textDecoration: 'underline', cursor: 'pointer' }}>Remove</a>
                                </div>
                            </div>
                        ))}
                        <div style={{ height: 38 }} />
                        <div style={{ width: '100%', height: 38, background: '#bdbdbd', borderRadius: 6, marginTop: 'auto' }} />
                    </div>
                </div>
                {/* Divider after mock preview card */}
                <Divider style={{ margin: '24px 0 0 0', width: '100%' }} />
                {/* Modal overlay: only show if saveForLaterEnabled is true */}
                {typeof saveForLaterEnabled === 'undefined' || saveForLaterEnabled ? (
                  <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '80%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                  }}>
                      <div style={{
                          display: 'flex',
                          flexDirection: 'row',
                          background: '#fff',
                          borderRadius: 10,
                          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                          border: '1px solid #e3e3e3',
                          minWidth: 480,
                          maxWidth: 500,
                          minHeight: 180,
                          overflow: 'hidden',
                      }}>
                          {/* Left: product image */}
                          <div style={{
                              width: 120,
                              background: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 24,
                          }}>
                            <img src={imagemodal}/>
                          </div>
                          {/* Right: text and buttons */}
                          <div style={{ flex: 1, padding: '28px 32px 28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ fontSize: 13, color: '#222', marginBottom: 2 }}>Sample Product Title | Permission 1 Qty</div>
                              <div style={{ fontWeight: 700, fontSize: 16, color: '#222', marginBottom: 18 }}>{saveForLaterTitle || 'Do you want to save this product for later?'}</div>
                              {saveForLaterEnabled && saveForLaterPermission === 'ask' && (
                                <div style={{ margin: '12px 0 18px 0', display: 'flex', alignItems: 'center' }}>
                                  <Checkbox label="Don't ask me again" checked={dontAskAgainChecked} onChange={setDontAskAgainChecked} />
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 16 }}>
                                  <button style={{ padding: '10px 24px', border: '1.5px solid #d3d3d3', borderRadius: 6, background: '#fff', color: primaryColor, fontWeight: 500, fontSize: 16, cursor: 'pointer' }}>{saveForLaterSecondary || 'No, thanks!'}</button>
                                  <button style={{ padding: '10px 24px', border: 'none', borderRadius: 6, background: primaryColor, color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{saveForLaterPrimary || 'Save For later'}</button>
                              </div>
                          </div>
                          
                          
                        
                      </div>
                  </div>
                ) : null}
            </div>
        );
    }
    // Fallback: basics tab or others
    return (
        <div style={{ padding: '0 0 0 0', width: '100%' }}>

            <div style={cardStyle}>
                <div style={{ marginBottom: 12, marginTop: 15, marginLeft: 20 }}>
                    <span style={{ background: '#f7f7f7', borderRadius: 8, fontWeight: 500, color: '#888', fontSize: 15, padding: '4px 16px' }}>
                        Mock Preview
                    </span>
                </div>
                <Divider />
                <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>

                    {/* Product Image Skeleton */}
                    <div style={{ width: 350, height: 350, background: '#e5e5e5', borderRadius: 10, margin: 32 }} />
                    {/* Product Info and Button */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 16, margin: '32px 32px 32px 0' }}>
                        <div style={{ width: '80%', height: 28, background: '#e5e5e5', borderRadius: 6, marginBottom: 8 }} />
                        <div style={{ width: '60%', height: 22, background: '#e5e5e5', borderRadius: 6, marginBottom: 10 }} />
                        <div style={{ width: '90%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                        <div style={{ width: '70%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 4 }} />
                        <div style={{ width: '60%', height: 10, background: '#e5e5e5', borderRadius: 4, marginBottom: 10 }} />
                        {/* Wishlist Button Skeleton */}
                        <WishlistButton primaryColor={primaryColor} secondaryColor={secondaryColor} selectedIcon={selectedIcon} buttonType={buttonType} buttonStyle={buttonStyle} buttonLabel={buttonLabel} buttonTextTab={buttonTextTab} isFullWidthIcon={isIconOnly} buttonSize={buttonSize} renderRawIcon={true} iconThickness={iconThickness} />
                    </div>
                </div>
            </div>
        </div>
    );
} 