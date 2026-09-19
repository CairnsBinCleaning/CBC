/* The compliance cards a strata manager, facilities buyer or council
   procurement officer looks for: ABN, public liability, WorkCover, SWMS.

   One component so the commercial, strata and government pages can never
   disagree. Every figure below is read off the real documents in
   public/documents (checked 19 Sept 2026). When a certificate is renewed,
   replace the PDF and update the policy line and date here. */

const DOCS = [
  {
    tag: "$20,000,000 COVER",
    title: "PUBLIC LIABILITY",
    detail: "Policy EGU627053BPK · current to 12 Aug 2027",
    href: "/documents/cairns-bin-cleaning-public-liability-coc.pdf",
    link: "VIEW CERTIFICATE OF CURRENCY →",
  },
  {
    tag: "CURRENT COVER",
    title: "WORKCOVER",
    detail: "Policy WSM250967591 · current to 30 Jun 2027",
    href: "/documents/cairns-bin-cleaning-workcover-coc.pdf",
    link: "VIEW CERTIFICATE OF CURRENCY →",
  },
  {
    tag: "SAFE WORK METHOD STATEMENT",
    title: "SWMS",
    detail: "CBC-SWMS-01 · issued 16 Sept 2026, review Sept 2027",
    href: "/documents/cairns-bin-cleaning-swms.pdf",
    link: "DOWNLOAD THE SWMS →",
  },
];

export default function ComplianceDocs() {
  return (
    <>
      <article className="abn-card">
        <span>LIVE VERIFICATION</span>
        <strong>ABN 36 318 413 406</strong>
        <small>
          Active · GST registered · trading as Cairns Bin Cleaning (Siezar
          Dewaal, sole trader)
        </small>
        <a
          href="https://abr.business.gov.au/ABN/View?id=36318413406"
          target="_blank"
          rel="noopener noreferrer"
          className="abn-verify-link"
        >
          <span className="pulse" />
          CHECK IT YOURSELF ON THE ABR →
        </a>
      </article>

      {DOCS.map((d) => (
        <article key={d.title}>
          <span>{d.tag}</span>
          <strong>{d.title}</strong>
          <small>{d.detail}</small>
          <a href={d.href} target="_blank" rel="noopener noreferrer" className="abn-verify-link">
            <span className="pulse" />
            {d.link}
          </a>
        </article>
      ))}
    </>
  );
}
