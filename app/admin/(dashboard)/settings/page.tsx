import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { getRawContacts } from "@/lib/data/settings";

export const metadata = { title: "Cài đặt" };

export default async function SettingsPage() {
  const raw = await getRawContacts();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Cài đặt</h1>
        <p className="text-muted-foreground">Thông tin liên hệ hiển thị trên website.</p>
      </div>
      <div className="max-w-2xl">
        <ContactSettingsForm defaults={{ zalo: raw.zalo, instagram: raw.instagram, messenger: raw.messenger }} />
      </div>
    </div>
  );
}
