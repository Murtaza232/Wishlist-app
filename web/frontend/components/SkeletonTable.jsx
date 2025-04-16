import {
    Layout,
    LegacyCard,
    SkeletonBodyText,
    SkeletonPage,
    TextContainer,
} from "@shopify/polaris";
import React from "react";

export default function SkeletonTable() {
    return (
        <SkeletonPage primaryAction>
            <LegacyCard sectioned>
                <Layout>
                    <Layout.Section oneThird>
                        <TextContainer>
                            <SkeletonBodyText lines={4} />
                        </TextContainer>
                    </Layout.Section>

                    <Layout.Section oneThird>
                        <TextContainer>
                            <SkeletonBodyText lines={4} />
                        </TextContainer>
                    </Layout.Section>

                    <Layout.Section oneThird>
                        <TextContainer>
                            <SkeletonBodyText lines={4} />
                        </TextContainer>
                    </Layout.Section>
                </Layout>
            </LegacyCard>
        </SkeletonPage>
    );
}
