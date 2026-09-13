import { JoinClient } from "@/components/JoinClient";
import { JoinCopy } from "@/components/JoinCopy";

export default function JoinPage() {
  return (
    <main className="mx-auto max-w-page px-6 pb-24 pt-14 sm:px-8">
      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <JoinCopy />
        </div>
        <div className="lg:col-span-6">
          <JoinClient />
        </div>
      </div>
    </main>
  );
}
