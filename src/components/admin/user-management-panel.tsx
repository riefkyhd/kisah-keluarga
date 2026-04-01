import { APP_ROLES } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ManagedUserItem } from "@/server/queries/admin-users";
import {
  createManagedUserAction,
  resetManagedUserPasswordAction,
  updateManagedUserRoleAction,
  updateManagedUserStateAction
} from "@/server/actions/admin-users";

type UserManagementPanelProps = {
  users: ManagedUserItem[];
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function roleLabel(role: string) {
  return role === "admin"
    ? "Admin"
    : role === "editor"
      ? "Editor"
      : role === "contributor"
        ? "Kontributor"
        : "Viewer";
}

export function UserManagementPanel({ users }: UserManagementPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-stone-900">Buat Akun Keluarga</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Admin dapat membuat akun baru, mengatur peran, dan memberikan kata sandi awal.
        </p>
        <form action={createManagedUserAction} className="space-y-4">
          <label className="block space-y-2 text-sm font-semibold text-stone-800">
            Email akun baru
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nama@keluarga.com"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-stone-800">
            Kata sandi awal
            <input
              required
              minLength={8}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
            />
          </label>

          <label className="block space-y-2 text-sm font-semibold text-stone-800">
            Role akun baru
            <select
              required
              name="role"
              defaultValue="viewer"
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
            >
              {APP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <Button type="submit" className="w-full">
            Buat Akun
          </Button>
        </form>
      </Card>

      <Card className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <h3 className="text-lg font-semibold text-stone-900">Daftar Akun Terkelola</h3>
        <p className="text-sm leading-relaxed text-stone-600">
          Kelola role, kata sandi, dan status akses akun keluarga di satu tempat.
        </p>

        {users.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-600">
            Belum ada akun yang bisa dikelola.
          </p>
        ) : (
          <ul className="space-y-3">
            {users.map((managedUser) => (
              <li key={managedUser.id} data-testid="managed-user-item">
                <Card className="space-y-4 rounded-2xl border-stone-200 p-4 shadow-none">
                  <div className="space-y-1">
                    <p className="font-semibold text-stone-900">{managedUser.email}</p>
                    <p className="text-sm text-stone-600">
                      Role saat ini: <span className="font-medium">{roleLabel(managedUser.role)}</span>
                    </p>
                    <p className="text-xs text-stone-500">
                      Dibuat: {formatDate(managedUser.created_at)} • Login terakhir: {formatDate(managedUser.last_sign_in_at)}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Status: {managedUser.is_deactivated ? "Nonaktif" : "Aktif"}
                    </p>
                  </div>

                  <form action={updateManagedUserRoleAction} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <input type="hidden" name="user_id" value={managedUser.id} />
                    <label className="block space-y-2 text-sm font-semibold text-stone-800">
                      Role akses
                      <select
                        name="role"
                        defaultValue={managedUser.role}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-amber-200 focus:border-amber-400 focus:ring-2"
                      >
                        {APP_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button type="submit" variant="outline" className="w-full">
                      Simpan Role
                    </Button>
                  </form>

                  <form action={resetManagedUserPasswordAction} className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <input type="hidden" name="user_id" value={managedUser.id} />
                    <label className="block space-y-2 text-sm font-semibold text-stone-800">
                      Kata sandi baru
                      <input
                        required
                        minLength={8}
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-amber-200 placeholder:text-stone-400 focus:border-amber-400 focus:ring-2"
                      />
                    </label>
                    <Button type="submit" variant="outline" className="w-full">
                      Simpan Kata Sandi
                    </Button>
                  </form>

                  <form action={updateManagedUserStateAction}>
                    <input type="hidden" name="user_id" value={managedUser.id} />
                    <input type="hidden" name="state" value={managedUser.is_deactivated ? "reactivate" : "deactivate"} />
                    <Button
                      type="submit"
                      variant={managedUser.is_deactivated ? "secondary" : "danger"}
                      className="w-full"
                    >
                      {managedUser.is_deactivated ? "Aktifkan Kembali" : "Nonaktifkan Akun"}
                    </Button>
                  </form>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
