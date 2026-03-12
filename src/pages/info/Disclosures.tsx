import InfoPageLayout from '@/components/landing/InfoPageLayout';
import { Link } from 'react-router-dom';

const Disclosures = () => (
  <InfoPageLayout title="Disclosures">
    <h2 className="text-2xl font-semibold mb-4">Status Disclosure</h2>

    <h3 className="text-xl font-semibold mb-3 mt-6">Barclays Bank PLC</h3>
    <p className="mb-4 text-muted-foreground">
      Barclays Bank PLC is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority (Financial Services Register No. 122702).
    </p>
    <p className="mb-4 text-muted-foreground">
      Registered in England. Registered No. 1026167. Registered Office: 1 Churchill Place, London E14 5HP.
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-8">Barclays Capital Inc.</h3>
    <p className="mb-4 text-muted-foreground">
      Barclays Capital Inc. is a member of{' '}
      <a href="https://www.sipc.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">SIPC</a>,{' '}
      <a href="https://www.finra.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">FINRA</a> and{' '}
      <a href="https://www.nfa.futures.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">NFA</a>.
    </p>
    <p className="mb-4 text-muted-foreground">
      745 Seventh Avenue, New York, NY 10019, U.S.A.
    </p>

    <h3 className="text-xl font-semibold mb-3 mt-8">Barclays Bank Ireland PLC</h3>
    <p className="mb-4 text-muted-foreground">
      Barclays Bank Ireland PLC is regulated by the Central Bank of Ireland. Registered in Ireland. Registered Office: One Molesworth Street, Dublin 2, Ireland, D02 RF29. Registered No. 396330.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-10">Financial Information by Type</h2>
    <p className="mb-4 text-muted-foreground">
      For specific financial disclosures relating to any companies mentioned in research reports, please refer to the research report itself or contact your Barclays representative. Required regulatory disclosures are made available in accordance with applicable laws and regulations.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-10">Conflicts of Interest</h2>
    <p className="mb-4 text-muted-foreground">
      Barclays may act as market maker, may have assumed an underwriting commitment, may have a position in, or may trade for its own account in, instruments of any issuer mentioned in this publication. Barclays or its affiliates may also have a banking or financial advisory relationship with the issuers of such securities.
    </p>

    <h2 className="text-2xl font-semibold mb-4 mt-10">Research Disclosures</h2>
    <p className="text-muted-foreground">
      Barclays Research is produced by the Investment Bank of Barclays Bank PLC and its affiliates. All research reports are disseminated and available to all clients simultaneously through electronic publication. For current important disclosures regarding companies that are the subject of this research report, please send a written request to: Barclays Research Compliance, 745 Seventh Avenue, 14th Floor, New York, NY 10019.
    </p>
  </InfoPageLayout>
);

export default Disclosures;
