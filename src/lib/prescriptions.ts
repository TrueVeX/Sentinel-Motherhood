// Prescriptions for mother and baby, saved only in this browser.
import { load, save } from "./browser-storage";

export type Who = "mother" | "baby";
export type Prescription = {
  id: string;
  who: Who;
  name: string;
  dose: string;
  frequency: string;
  time: string;
  start: string;
  end: string;
  prescribedBy: string;
  reason: string;
  notes: string;
  hasPhoto: boolean;
};

export const loadPrescriptions = () => load<Prescription[]>("sm-prescriptions", []);
export const savePrescriptions = (p: Prescription[]) => save("sm-prescriptions", p);

/** Active = started (or no start date) and not yet past its end date. */
export function isActive(p: Prescription, today: string) {
  return (!p.start || p.start <= today) && (!p.end || p.end >= today);
}
