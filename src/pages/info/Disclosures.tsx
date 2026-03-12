import InfoPageLayout from '@/components/landing/InfoPageLayout';

const Disclosures = () => (
  <InfoPageLayout title="Disclosures">
    <h2 className="text-2xl font-semibold mb-4">Research Disclosures</h2>
    <p className="mb-4 text-muted-foreground">Barclays Research is produced by the Investment Bank of Barclays Bank PLC and its affiliates. All research reports are disseminated and available to all clients simultaneously through electronic publication.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Conflicts of Interest</h2>
    <p className="mb-4 text-muted-foreground">Barclays may act as market maker, may have assumed an underwriting commitment, may have a position in, or may trade for its own account in, instruments of any issuer mentioned in this publication. Barclays or its affiliates may also have a banking or financial advisory relationship with the issuers of such securities.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Regulatory Disclosures</h2>
    <p className="text-muted-foreground">Required regulatory disclosures are made available in accordance with applicable laws and regulations. For specific disclosures relating to any companies mentioned in research reports, please refer to the research report itself or contact your Barclays representative.</p>
  </InfoPageLayout>
);

export default Disclosures;
