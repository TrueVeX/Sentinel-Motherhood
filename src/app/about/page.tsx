import Fair from "../Fair";
import PageHead from "../PageHead";

export default function AboutPage() {
  return (
    <>
      <PageHead eyebrow="ABOUT US" title={<>Guiding motherhood, <em>nurturing generations.</em></>} />
      <div className="section-wrap page-body narrow about-copy">
        <p>
          Sentinel Motherhood is a science fair project by <strong>Revoori Krithika Reddy</strong>. It brings helpful
          information, practical tools and a friendly AI assistant together in one place for mothers and the people
          who support them.
        </p>
        <h2>How it’s built</h2>
        <ul>
          <li><strong>Next.js and React</strong> for the website and its pages.</li>
          <li>A small <strong>server</strong> built into the app that stores accounts, journals, community posts and votes in files on this laptop.</li>
          <li>An <strong>AI model</strong> (through OpenRouter or NVIDIA) that answers questions in the AI assistant.</li>
          <li><strong>OpenStreetMap</strong> for the nearby hospitals map.</li>
        </ul>
        <p className="about-note">Sentinel gives general information only and isn’t a substitute for a doctor or midwife.</p>
      </div>
      <Fair />
    </>
  );
}
