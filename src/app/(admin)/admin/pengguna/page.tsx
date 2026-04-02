import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBanner } from "@/components/ui/status-banner";
import { StatusToast } from "@/components/ui/status-toast";
import { UserManagementPanel } from "@/components/admin/user-management-panel";
import { requireAdmin } from "@/lib/permissions/guards";
import { listManagedUsers } from "@/server/queries/admin-users";

type AdminUsersPageProps = {
  searchParams: Promise<{
    error?: string;
    status?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  invalid_form: "Input belum valid. Mohon periksa kembali.",
  create_failed: "Akun baru belum berhasil dibuat.",
  role_sync_failed: "Akun sudah dibuat, tetapi sinkron role gagal. Periksa kembali.",
  role_update_failed: "Perubahan role belum berhasil disimpan.",
  password_update_failed: "Kata sandi baru belum berhasil disimpan.",
  state_update_failed: "Status akun belum berhasil diperbarui.",
  cannot_deactivate_self: "Akun Anda sendiri tidak bisa dinonaktifkan dari halaman ini."
};

const statusMessages: Record<string, string> = {
  user_created: "Akun baru berhasil dibuat.",
  role_updated: "Role akun berhasil diperbarui.",
  password_updated: "Kata sandi akun berhasil diperbarui.",
  user_deactivated: "Akun berhasil dinonaktifkan.",
  user_reactivated: "Akun berhasil diaktifkan kembali."
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireAdmin("/admin/pengguna");
  const query = await searchParams;
  const users = await listManagedUsers();

  const errorMessage = query.error ? errorMessages[query.error] : "";
  const statusMessage = query.status ? statusMessages[query.status] : "";

  return (
    <section className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex min-h-10 items-center rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
      >
        ← Kembali ke halaman admin
      </Link>

      <SectionHeader
        eyebrow="Kelola Akses"
        title="Manajemen Pengguna"
        description="Buat akun, atur role, ubah kata sandi, dan kelola status akses pengguna keluarga."
      />

      {errorMessage ? (
        <>
          <StatusToast variant="error" message={errorMessage} />
          <StatusBanner variant="error" message={errorMessage} />
        </>
      ) : null}
      {statusMessage ? (
        <>
          <StatusToast variant="success" message={statusMessage} />
          <StatusBanner variant="success" message={statusMessage} />
        </>
      ) : null}

      <UserManagementPanel users={users} />
    </section>
  );
}
