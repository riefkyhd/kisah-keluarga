"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { StatusBanner } from "@/components/ui/status-banner";
import { StatusToast } from "@/components/ui/status-toast";
import { MemberAvatar } from "@/components/members/member-avatar";
import { MemberForm } from "@/components/members/member-form";
import { MemberPhotoManager } from "@/components/members/member-photo-manager";
import { MemberStoriesSection } from "@/components/stories/member-stories-section";
import { RelationshipSection } from "@/components/relationships/relationship-section";
import { formatTanggal } from "@/lib/format-tanggal";
import {
  buildCanvasHref,
  cloneCanvasParams,
  ensureCanvasFocus
} from "@/lib/canvas/query-state";
import type { MemberMutationResult } from "@/server/actions/members";
import type { MemberProfile } from "@/server/queries/members";
import type {
  ProfileRelationships,
  RelationshipCandidatesByType
} from "@/server/queries/relationships";
import type { StoryListItem } from "@/server/queries/stories";
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

type MemberDrawerFeedback = {
  relationshipErrorMessage: string;
  relationshipStatusMessage: string;
  photoErrorMessage: string;
  photoStatusMessage: string;
  memberErrorMessage: string;
  memberStatusMessage: string;
};

type MemberDrawerProps = {
  member: MemberProfile;
  canManage: boolean;
  focusPersonId: string;
  returnTo: string;
  relationshipData: ProfileRelationships;
  relationshipCandidates: RelationshipCandidatesByType;
  stories: StoryListItem[];
  feedback: MemberDrawerFeedback;
  addParentAction: (formData: FormData) => Promise<void>;
  addSpouseAction: (formData: FormData) => Promise<void>;
  addChildAction: (formData: FormData) => Promise<void>;
  archiveRelationshipAction: (formData: FormData) => Promise<void>;
  uploadPhotoAction: (formData: FormData) => Promise<void>;
  removePhotoAction: (formData: FormData) => Promise<void>;
  updateMemberAction: (formData: FormData) => Promise<MemberMutationResult | void>;
  archiveMemberAction: (formData: FormData) => Promise<void>;
  restoreMemberAction: (formData: FormData) => Promise<void>;
};

const CLEANUP_QUERY_KEYS = [
  "memberId",
  "relationship_error",
  "relationship_status",
  "photo_error",
  "photo_status",
  "error",
  "status",
  "edit",
  "created",
  "updated"
] as const;

export function MemberDrawer({
  member,
  canManage,
  focusPersonId,
  returnTo,
  relationshipData,
  relationshipCandidates,
  stories,
  feedback,
  addParentAction,
  addSpouseAction,
  addChildAction,
  archiveRelationshipAction,
  uploadPhotoAction,
  removePhotoAction,
  updateMemberAction,
  archiveMemberAction,
  restoreMemberAction
}: MemberDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editModeFromQuery = canManage && searchParams.get("edit") === "true";
  const [mode, setMode] = useState<"view" | "edit">(editModeFromQuery ? "edit" : "view");

  useEffect(() => {
    setMode(editModeFromQuery ? "edit" : "view");
  }, [editModeFromQuery, member.id]);

  const pushCanvasState = (updates: Record<string, string | null>) => {
    const params = cloneCanvasParams(searchParams);
    ensureCanvasFocus(params, focusPersonId);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    router.push(buildCanvasHref(params), { scroll: false });
  };

  const closeDrawer = () => {
    const updates = Object.fromEntries(CLEANUP_QUERY_KEYS.map((key) => [key, null]));
    pushCanvasState(updates);
  };

  const birthDateLabel = formatTanggal(member.birth_date);
  const deathDateLabel = formatTanggal(member.death_date);

  return (
    <Drawer open onClose={closeDrawer} title="Profil Anggota" width="38rem">
      <section data-testid="member-drawer" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/keluarga/${member.id}`}
            className="inline-flex min-h-12 items-center rounded-[var(--kk-radius-md)] border border-[color:var(--color-sand)] bg-[color:var(--kk-surface)] px-4 py-2 text-base font-bold text-[color:var(--color-bark)] hover:bg-[color:var(--color-warm)] shadow-sm transition-all"
          >
            Lihat profil penuh
          </Link>
          {canManage ? (
            mode === "edit" ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-12 px-4 font-bold"
                onClick={() => {
                  setMode("view");
                  pushCanvasState({
                    edit: null,
                    error: null,
                    status: null,
                    updated: null,
                    created: null
                  });
                }}
              >
                Kembali ke Detail
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                className="min-h-12 px-4 font-bold border border-[color:var(--color-sand)]"
                onClick={() => {
                  setMode("edit");
                  pushCanvasState({
                    memberId: member.id,
                    edit: "true",
                    error: null,
                    status: null,
                    updated: null,
                    created: null
                  });
                }}
              >
                Edit Profil
              </Button>
            )
          ) : null}
        </div>

        <Card className="space-y-5 border-[color:var(--color-sand)] p-6 text-center shadow-[var(--kk-shadow-card)]">
          <div className="mx-auto">
            <MemberAvatar
              fullName={member.full_name}
              photoUrl={member.profile_photo_url}
              size="lg"
              testId="member-drawer-photo-image"
            />
          </div>
          <div className="space-y-2">
            <h2
              aria-label={member.full_name}
              className="break-words text-3xl font-bold text-[color:var(--color-bark)]"
            >
              {member.full_name}
            </h2>
            {member.nickname ? (
              <p className="text-base font-semibold text-[color:var(--kk-muted)]">Panggilan: {member.nickname}</p>
            ) : null}
          </div>

          {member.is_archived ? <StatusBanner variant="warning" message="Anggota ini sedang diarsipkan." /> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="rounded-[var(--kk-radius-md)] border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clay)]">Status</p>
              <p className="mt-1 text-lg font-bold text-[color:var(--color-bark)]">
                {member.is_living ? "Masih hidup" : "Sudah wafat"}
              </p>
            </Card>
            <Card className="rounded-[var(--kk-radius-md)] border-[color:var(--color-sand)] bg-[color:var(--color-warm)] p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-clay)]">Tanggal Lahir</p>
              <p className="mt-1 text-lg font-bold text-[color:var(--color-bark)]">
                {birthDateLabel ?? "Belum diisi"}
              </p>
            </Card>
          </div>
        </Card>

        <Card className="space-y-4 border-[color:var(--color-sand)] p-6 text-base leading-relaxed text-[color:var(--kk-muted)] shadow-[var(--kk-shadow-card)]">
          <h3 className="text-xl font-bold text-[color:var(--color-bark)]">Informasi Dasar</h3>
          <div className="space-y-2">
            {deathDateLabel ? <p className="font-medium"><span className="text-[color:var(--color-clay)]">Tanggal wafat:</span> {deathDateLabel}</p> : null}
            {member.gender ? (
              <p className="font-medium">
                <span className="text-[color:var(--color-clay)]">Jenis kelamin:</span>{" "}
                {member.gender === "male" ? "Laki-laki" : member.gender === "female" ? "Perempuan" : "Lainnya"}
              </p>
            ) : null}
            <div className="pt-2 border-t border-[color:var(--color-warm)]">
              <span className="block text-xs font-bold uppercase tracking-wider text-[color:var(--color-clay)] mb-1">Catatan Keluarga</span>
              {member.bio ? <p className="text-base text-[color:var(--color-bark)] leading-relaxed">{member.bio}</p> : <p className="italic text-sm">Belum ada catatan keluarga tambahan.</p>}
            </div>
          </div>
          
          <Link
            href={`/?personId=${member.id}&memberId=${member.id}`}
            className="mt-4 flex min-h-14 items-center justify-center rounded-[var(--kk-radius-md)] border-2 border-[color:var(--color-clay)] bg-[color:var(--color-clay)] px-6 py-3 text-lg font-bold text-white hover:bg-[color:var(--color-bark)] transition-colors shadow-md"
          >
            Fokuskan pohon ke anggota ini
          </Link>
        </Card>

        {feedback.memberStatusMessage ? (
          <>
            <StatusToast variant="success" message={feedback.memberStatusMessage} />
            <StatusBanner variant="success" message={feedback.memberStatusMessage} />
          </>
        ) : null}
        {feedback.memberErrorMessage ? (
          <>
            <StatusToast variant="error" message={feedback.memberErrorMessage} />
            <StatusBanner variant="error" message={feedback.memberErrorMessage} />
          </>
        ) : null}
        {feedback.relationshipStatusMessage ? (
          <>
            <StatusToast variant="success" message={feedback.relationshipStatusMessage} />
            <StatusBanner variant="success" message={feedback.relationshipStatusMessage} />
          </>
        ) : null}
        {feedback.relationshipErrorMessage ? (
          <>
            <StatusToast variant="error" message={feedback.relationshipErrorMessage} />
            <StatusBanner variant="error" message={feedback.relationshipErrorMessage} />
          </>
        ) : null}
        {feedback.photoStatusMessage ? (
          <>
            <StatusToast variant="success" message={feedback.photoStatusMessage} />
            <StatusBanner variant="success" message={feedback.photoStatusMessage} />
          </>
        ) : null}
        {feedback.photoErrorMessage ? (
          <>
            <StatusToast variant="error" message={feedback.photoErrorMessage} />
            <StatusBanner variant="error" message={feedback.photoErrorMessage} />
          </>
        ) : null}

        {canManage && mode === "edit" ? (
          <Card className="space-y-4 border-[color:var(--color-sand)]">
            <h3 className="text-base text-[color:var(--color-bark)]">Edit Profil Anggota</h3>
            <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
              Simpan perubahan tanpa meninggalkan pohon keluarga. Setelah tersimpan, panel akan kembali ke mode
              detail.
            </p>
            <MemberForm
              action={updateMemberAction}
              submitLabel="Simpan Perubahan"
              personId={member.id}
              initialValues={member}
              actionMode="result"
              onActionResult={(result) => {
                if (result?.ok) {
                  setMode("view");
                  pushCanvasState({
                    memberId: result.personId,
                    edit: null,
                    error: null,
                    status: "updated",
                    updated: null,
                    created: null
                  });
                  return;
                }

                pushCanvasState({
                  memberId: member.id,
                  edit: "true",
                  error: result?.error ?? "save_failed",
                  status: null,
                  updated: null,
                  created: null
                });
              }}
            />
          </Card>
        ) : (
          <>
            <MemberPhotoManager
              personId={member.id}
              canManage={canManage}
              hasPhoto={Boolean(member.profile_photo_path)}
              uploadAction={uploadPhotoAction}
              removeAction={removePhotoAction}
              returnTo={returnTo}
            />

            <RelationshipSection
              testId="drawer-parents-section"
              title="Orang Tua"
              description="Anggota yang menjadi orang tua dari profil ini."
              emptyText="Belum ada data orang tua."
              currentPersonId={member.id}
              items={relationshipData.parents}
              canManage={canManage}
              candidates={relationshipCandidates.parent}
              addLabel="Tambah orang tua"
              submitLabel="Tambah Orang Tua"
              addAction={addParentAction}
              archiveAction={archiveRelationshipAction}
              returnTo={returnTo}
              addSurface="sheet"
            />

            <RelationshipSection
              testId="drawer-spouse-section"
              title="Pasangan"
              description="Hubungan pasangan aktif pada profil ini."
              emptyText="Belum ada data pasangan."
              currentPersonId={member.id}
              items={relationshipData.spouse}
              canManage={canManage}
              candidates={relationshipCandidates.spouse}
              addLabel="Tambah pasangan"
              submitLabel="Tambah Pasangan"
              showAddForm={relationshipData.spouse.length === 0}
              addAction={addSpouseAction}
              archiveAction={archiveRelationshipAction}
              returnTo={returnTo}
              addSurface="sheet"
            />
            {canManage && relationshipData.spouse.length > 0 ? (
              <p className="rounded-[var(--kk-radius-md)] border border-[color:#f3c7c1] bg-[color:#fdf2f0] px-4 py-3 text-sm leading-relaxed text-[color:#9b3022]">
                Profil ini sudah memiliki pasangan aktif. Arsipkan relasi pasangan saat ini untuk menambah yang baru.
              </p>
            ) : null}

            <RelationshipSection
              testId="drawer-children-section"
              title="Anak"
              description="Anggota yang tercatat sebagai anak dari profil ini."
              emptyText="Belum ada data anak."
              currentPersonId={member.id}
              items={relationshipData.children}
              canManage={canManage}
              candidates={relationshipCandidates.child}
              addLabel="Tambah anak"
              submitLabel="Tambah Anak"
              addAction={addChildAction}
              archiveAction={archiveRelationshipAction}
              returnTo={returnTo}
              addSurface="sheet"
            />

            <RelationshipSection
              testId="drawer-siblings-section"
              title="Saudara (otomatis)"
              description="Diturunkan dari orang tua yang sama."
              emptyText="Belum ada data saudara."
              currentPersonId={member.id}
              items={relationshipData.siblings}
              canManage={false}
            />

            <MemberStoriesSection personId={member.id} stories={stories} canManage={canManage} />

            {canManage ? (
              <Card className="space-y-3 border-[color:var(--color-sand)]">
                <h3 className="text-base text-[color:var(--color-bark)]">Arsip / Pulihkan</h3>
                {member.is_archived ? (
                  <form action={restoreMemberAction} className="space-y-3">
                    <input type="hidden" name="person_id" value={member.id} />
                    <input type="hidden" name="return_to" value={returnTo} />
                    <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
                      Anggota ini sedang diarsipkan. Pulihkan jika ingin menampilkannya kembali di daftar aktif.
                    </p>
                    <FormSubmitButton
                      type="submit"
                      className="w-full bg-[color:#3f5c45] text-[color:var(--color-cream)] hover:bg-[color:#35503c]"
                      pendingLabel="Memulihkan..."
                    >
                      Pulihkan Anggota
                    </FormSubmitButton>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
                      Arsipkan anggota jika datanya tetap ingin disimpan tetapi tidak ditampilkan di daftar utama.
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="danger" className="w-full">
                          Arsipkan Anggota
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Arsipkan {member.full_name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Anggota akan disembunyikan dari direktori. Data tetap tersimpan dan dapat dipulihkan kapan
                            saja.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <form action={archiveMemberAction}>
                          <input type="hidden" name="person_id" value={member.id} />
                          <input type="hidden" name="return_to" value={returnTo} />
                          <AlertDialogFooter>
                            <AlertDialogCancel asChild>
                              <Button type="button" variant="outline">
                                Batalkan
                              </Button>
                            </AlertDialogCancel>
                            <FormSubmitButton type="submit" variant="danger" pendingLabel="Mengarsipkan...">
                              Ya, Arsipkan
                            </FormSubmitButton>
                          </AlertDialogFooter>
                        </form>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </Card>
            ) : null}

            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                className="min-h-14 w-full border-2 border-[color:var(--color-sand)] text-lg font-bold text-[color:var(--color-clay)] hover:bg-[color:var(--color-warm)]"
                onClick={closeDrawer}
              >
                Tutup Panel
              </Button>
            </div>
          </>
        )}
      </section>
    </Drawer>
  );
}
