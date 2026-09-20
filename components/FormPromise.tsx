import Link from "next/link";

/* One line under every booking button, answering the two worries people
   have right before they hit send: "am I paying now?" and "where do my
   details go?". Both answers are true (pay after the job; privacy policy). */
export default function FormPromise() {
  return (
    <p className="form-promise">
      Nothing to pay now. Your details only go to us, to quote and book the
      job, and we never sell or share them.{" "}
      <Link href="/privacy">Privacy</Link>
    </p>
  );
}
