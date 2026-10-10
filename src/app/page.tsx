import { Desk } from "@/components/desk";

export default function Home() {
  return (
    <div className="halcyon-stage">
      <div className="halcyon-phone">
        <div className="halcyon-island" aria-hidden />
        <Desk />
      </div>
    </div>
  );
}
