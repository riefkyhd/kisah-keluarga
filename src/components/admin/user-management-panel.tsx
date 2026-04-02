import { APP_ROLES } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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
      <Card className="space-y-4 border-[color:rgba(212,184,150,0.4)]">
        <h3 className="text-lg text-[color:var(--color-bark)]">Buat Akun Keluarga</h3>
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Admin dapat membuat akun baru, mengatur peran, dan memberikan kata sandi awal.
        </p>
        <form action={createManagedUserAction} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
            Email akun baru
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nama@keluarga.com"
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
            Kata sandi awal
            <input
              required
              minLength={8}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
            Role akun baru
            <select
              required
              name="role"
              defaultValue="viewer"
              className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-base text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
            >
              {APP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <FormSubmitButton type="submit" className="w-full" pendingLabel="Membuat akun...">
            Buat Akun
          </FormSubmitButton>
        </form>
      </Card>

      <Card className="space-y-4 border-[color:rgba(212,184,150,0.4)]">
        <h3 className="text-lg text-[color:var(--color-bark)]">Daftar Akun Terkelola</h3>
        <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
          Kelola role, kata sandi, dan status akses akun keluarga di satu tempat.
        </p>

        {users.length === 0 ? (
          <p className="rounded-[var(--kk-radius-md)] border border-dashed border-[color:var(--color-sand)] bg-[color:var(--color-warm)] px-4 py-3 text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
            Belum ada akun yang bisa dikelola.
          </p>
        ) : (
          <ul className="space-y-3">
            {users.map((managedUser) => (
              <li key={managedUser.id} data-testid="managed-user-item">
                <Card className="space-y-4 rounded-[var(--kk-radius-md)] border-[color:rgba(212,184,150,0.4)] p-4 shadow-none">
                  <div className="space-y-1">
                    <p className="font-medium text-[color:var(--color-bark)]">{managedUser.email}</p>
                    <p className="text-sm font-normal text-[color:var(--kk-muted)]">
                      Role saat ini: <span className="font-medium text-[color:var(--color-bark)]">{roleLabel(managedUser.role)}</span>
                    </p>
                    <p className="text-xs font-normal text-[color:var(--kk-muted)]">
                      Dibuat: {formatDate(managedUser.created_at)} • Login terakhir: {formatDate(managedUser.last_sign_in_at)}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--color-clay)]">
                      Status: {managedUser.is_deactivated ? "Nonaktif" : "Aktif"}
                    </p>
                  </div>

                  <form action={updateManagedUserRoleAction} className="space-y-2 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-3">
                    <input type="hidden" name="user_id" value={managedUser.id} />
                    <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
                      Role akses
                      <select
                        name="role"
                        defaultValue={managedUser.role}
                        className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-3 py-2 text-sm text-[color:var(--color-bark)] outline-none focus:ring-2 focus:ring-[color:var(--kk-focus)]"
                      >
                        {APP_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {roleLabel(role)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <FormSubmitButton
                      type="submit"
                      variant="outline"
                      className="w-full"
                      pendingLabel="Menyimpan role..."
                    >
                      Simpan Role
                    </FormSubmitButton>
                  </form>

                  <form action={resetManagedUserPasswordAction} className="space-y-2 rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-3">
                    <input type="hidden" name="user_id" value={managedUser.id} />
                    <label className="block space-y-2 text-sm font-medium text-[color:var(--color-bark)]">
                      Kata sandi baru
                      <input
                        required
                        minLength={8}
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        className="w-full rounded-[var(--kk-radius-sm)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-3 py-2 text-sm text-[color:var(--color-bark)] outline-none placeholder:text-[color:var(--kk-muted)] focus:ring-2 focus:ring-[color:var(--kk-focus)]"
                      />
                    </label>
                    <FormSubmitButton
                      type="submit"
                      variant="outline"
                      className="w-full"
                      pendingLabel="Menyimpan kata sandi..."
                    >
                      Simpan Kata Sandi
                    </FormSubmitButton>
                  </form>

                  {managedUser.is_deactivated ? (
                    <form action={updateManagedUserStateAction}>
                      <input type="hidden" name="user_id" value={managedUser.id} />
                      <input type="hidden" name="state" value="reactivate" />
                      <FormSubmitButton
                        type="submit"
                        variant="secondary"
                        className="w-full"
                        pendingLabel="Mengaktifkan akun..."
                      >
                        Aktifkan Kembali
                      </FormSubmitButton>
                    </form>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="danger" className="w-full">
                          Nonaktifkan Akun
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Nonaktifkan akun ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Nonaktifkan akun {managedUser.email}? Pengguna tidak dapat login sampai akun diaktifkan
                            kembali oleh admin.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form action={updateManagedUserStateAction}>
                          <input type="hidden" name="user_id" value={managedUser.id} />
                          <input type="hidden" name="state" value="deactivate" />
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                              <Button type="button" variant="outline">
                                Batalkan
                              </Button>
                            </AlertDialogCancel>
                            <FormSubmitButton type="submit" variant="danger" pendingLabel="Menonaktifkan...">
                              Ya, Nonaktifkan
                            </FormSubmitButton>
                          </AlertDialogFooter>
                        </form>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
