import React from 'react'
import {CalloutCard,Button,SkeletonBodyText} from '@shopify/polaris';
import {
    Page,
    Layout,
    Card,
    LegacyCard,
    Text,
    Badge,
    Box,
    Select,
    Divider,
    BlockStack
} from "@shopify/polaris";
const Skelton = () => {
  return (
    <>
      <div className="skeleton-no-padding">
        <LegacyCard sectioned style={{ width: '100%', marginBottom: 18 }}>
          <SkeletonBodyText lines={3}/>
        </LegacyCard>
        <style>{`
          .skeleton-no-padding {
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          .skeleton-no-padding .Polaris-LegacyCard {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          .skeleton-no-padding .Polaris-LegacyCard__Section {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `}</style>
      </div>
    </>
  )
}

export default Skelton
