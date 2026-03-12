import InfoPageLayout from '@/components/landing/InfoPageLayout';

const ImportantInformation = () => (
  <InfoPageLayout title="Important Information">
    <h2 className="text-2xl font-semibold mb-4">Regulatory Status</h2>
    <p className="mb-4 text-muted-foreground">Barclays Bank PLC is authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority (Financial Services Register No. 122702).</p>
    <p className="mb-4 text-muted-foreground">Registered in England. Registered No. 1026167. Registered Office: 1 Churchill Place, London E14 5HP.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Disclaimers</h2>
    <p className="mb-4 text-muted-foreground">The information on this website is directed at persons who are investment professionals as defined in Article 19 of the Financial Services and Markets Act 2000 (Financial Promotion) Order 2005. It is not intended for distribution to, or use by, any person in any jurisdiction where such distribution or use would be contrary to local law or regulation.</p>
    <p className="mb-4 text-muted-foreground">Past performance is not necessarily indicative of future results. The value of investments and any income generated may go down as well as up and is not guaranteed. You may not get back the amount originally invested.</p>
    <h2 className="text-2xl font-semibold mb-4 mt-8">Use of This Website</h2>
    <p className="text-muted-foreground">This website and all information contained herein is provided for informational purposes only and does not constitute an offer to sell, or a solicitation of an offer to buy, any securities or other financial instruments.</p>
  </InfoPageLayout>
);

export default ImportantInformation;
