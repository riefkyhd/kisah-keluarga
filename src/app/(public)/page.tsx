import { hasMinimumRole } from "@/lib/auth/roles";
import { isAuthBypassEnabled } from "@/lib/auth/bypass";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CanvasToolbar,
  type CanvasSearchItem
} from "@/components/layout/canvas-toolbar";
import { MemberDrawer } from "@/components/members/member-drawer";
import { TreeCanvasController } from "@/components/tree/tree-canvas-controller";
import { requireViewer } from "@/lib/permissions/guards";
import {
  addChildRelationshipAction,
  addParentRelationshipAction,
  addSpouseRelationshipAction,
  archiveRelationshipAction
} from "@/server/actions/relationships";
import {
  removeMemberPhotoAction,
  uploadOrReplaceMemberPhotoAction
} from "@/server/actions/member-photos";
import {
  archiveMemberAction,
  createMemberAction,
  restoreMemberAction,
  updateMemberAction
} from "@/server/actions/members";
import { getMemberById, listActiveMembers } from "@/server/queries/members";
import {
  getProfileRelationships,
  getTreeViewData,
  listRelationshipCandidatesByType
} from "@/server/queries/relationships";
import { listStoriesByPersonId } from "@/server/queries/stories";

type HomeTreePageProps = {
  searchParams: Promise<{
    personId?: string;
    memberId?: string;
    action?: string;
    edit?: string;
    relationship_error?: string;
    relationship_status?: string;
    photo_error?: string;
    photo_status?: string;
    error?: string;
    status?: string;
    created?: string;
    updated?: string;
  }>;
};

function normalizeFocusPersonId(personId?: string) {
  if (!personId) {
    return "";
  }

  return personId.trim();
}

const relationshipErrorMessages: Record<string, string> = {
  invalid_relationship: "Relasi tidak valid. Mohon periksa data yang dipilih.",
  self_link: "Anggota tidak bisa dihubungkan ke dirinya sendiri.",
  duplicate_relationship: "Relasi aktif yang sama sudah ada.",
  illegal_relationship: "Relasi ini tidak dapat dibuat karena bertentangan dengan aturan data keluarga.",
  archived_person: "Relasi tidak bisa dibuat karena salah satu anggota sedang diarsipkan.",
  save_failed: "Relasi belum tersimpan. Coba lagi sebentar.",
  archive_failed: "Relasi belum berhasil diarsipkan. Coba lagi."
};

const relationshipStatusMessages: Record<string, string> = {
  added_parent: "Relasi orang tua berhasil ditambahkan.",
  added_spouse: "Relasi pasangan berhasil ditambahkan.",
  added_child: "Relasi anak berhasil ditambahkan.",
  archived: "Relasi berhasil diarsipkan."
};

const photoErrorMessages: Record<string, string> = {
  invalid_member: "Anggota tidak ditemukan untuk proses foto profil.",
  missing_file: "Silakan pilih file foto terlebih dahulu.",
  invalid_file_type: "Format foto belum didukung. Gunakan JPG, PNG, atau WEBP.",
  file_too_large: "Ukuran foto terlalu besar. Maksimum 4MB.",
  optimize_failed: "Foto belum berhasil diproses. Coba gunakan foto lain atau ulangi sebentar.",
  archived_member: "Anggota yang diarsipkan tidak dapat diubah fotonya.",
  upload_failed: "Foto belum berhasil diunggah. Coba lagi.",
  save_failed: "Foto sudah terunggah tapi data belum tersimpan. Coba lagi.",
  remove_failed: "Foto belum berhasil dihapus. Coba lagi."
};

const photoStatusMessages: Record<string, string> = {
  uploaded: "Foto profil berhasil diunggah.",
  replaced: "Foto profil berhasil diperbarui.",
  removed: "Foto profil berhasil dihapus."
};

const memberErrorMessages: Record<string, string> = {
  invalid_form: "Data belum valid. Mohon periksa kembali.",
  save_failed: "Perubahan belum tersimpan. Coba lagi.",
  archive_failed: "Gagal mengarsipkan anggota. Coba lagi.",
  restore_failed: "Gagal memulihkan anggota. Coba lagi."
};

const memberStatusMessages: Record<string, string> = {
  created: "Anggota berhasil disimpan.",
  updated: "Perubahan berhasil disimpan.",
  archived: "Anggota berhasil diarsipkan.",
  restored: "Anggota berhasil dipulihkan."
};

function buildReturnToPath(focusPersonId: string, memberId: string) {
  const params = new URLSearchParams();
  params.set("personId", focusPersonId);
  params.set("memberId", memberId);
  return `/?${params.toString()}`;
}

export default async function PublicHomePage({ searchParams }: HomeTreePageProps) {
  const { role } = await requireViewer("/");
  const query = await searchParams;
  const focusPersonId = normalizeFocusPersonId(query.personId);
  const treeData = await getTreeViewData(focusPersonId);
  const activeMembers = await listActiveMembers();
  const canManageMember = hasMinimumRole(role, "editor");
  const canManageUsers = hasMinimumRole(role, "admin");
  const selectedMemberId = normalizeFocusPersonId(query.memberId);
  const showLogout = !isAuthBypassEnabled();

  const drawerMember = selectedMemberId
    ? await getMemberById(selectedMemberId, canManageMember)
    : null;

  const relationshipErrorMessage = query.relationship_error
    ? relationshipErrorMessages[query.relationship_error]
    : "";
  const relationshipStatusMessage = query.relationship_status
    ? relationshipStatusMessages[query.relationship_status]
    : "";
  const photoErrorMessage = query.photo_error ? photoErrorMessages[query.photo_error] : "";
  const photoStatusMessage = query.photo_status ? photoStatusMessages[query.photo_status] : "";
  const memberErrorMessage = query.error ? memberErrorMessages[query.error] : "";
  const memberStatusMessage = query.created
    ? memberStatusMessages.created
    : query.updated
      ? memberStatusMessages.updated
      : query.status
        ? memberStatusMessages[query.status]
        : "";

  const drawerData = drawerMember
    ? await Promise.all([
        getProfileRelationships(drawerMember.id, canManageMember),
        canManageMember
          ? listRelationshipCandidatesByType(drawerMember.id)
          : Promise.resolve({ parent: [], spouse: [], child: [] }),
        listStoriesByPersonId(drawerMember.id, false)
      ])
    : null;

  const currentFocusPersonId = treeData.focusPerson?.id ?? focusPersonId;
  const toolbarFocusPersonId = currentFocusPersonId || drawerMember?.id || "";
  const returnTo = drawerMember
    ? buildReturnToPath(currentFocusPersonId || drawerMember.id, drawerMember.id)
    : null;
  const searchMembers: CanvasSearchItem[] = activeMembers.map((member) => ({
    id: member.id,
    fullName: member.full_name,
    nickname: member.nickname,
    photoUrl: member.profile_photo_url
  }));

  return (
    <section className="relative flex min-h-[calc(100dvh-11rem)] flex-col gap-5 pt-2 sm:pt-0">
      <h1
        data-testid="tree-page-heading"
        className="text-sm font-semibold uppercase tracking-wider text-[color:var(--color-clay)]"
      >
        Pohon Keluarga
      </h1>

      {treeData.focusPerson ? (
        <TreeCanvasController
          focusPersonId={treeData.focusPerson.id}
          focusPerson={treeData.focusPerson}
          grandparents={treeData.grandparents}
          parents={treeData.parents}
          parentSpouses={treeData.parentSpouses}
          grandparentParentLinks={treeData.grandparentParentLinks}
          parentSpouseLinks={treeData.parentSpouseLinks}
          spouse={treeData.spouse}
          childMembers={treeData.children}
          canvasHeightClassName="h-[calc(100dvh-12.5rem)] min-h-[520px] sm:h-[calc(100dvh-9rem)]"
        />
      ) : (
        <EmptyState
          title="Belum ada anggota aktif"
          description="Belum ada anggota aktif untuk ditampilkan di pohon keluarga."
        />
      )}

      <CanvasToolbar
        canManageMembers={canManageMember}
        canManageUsers={canManageUsers}
        showLogout={showLogout}
        focusCandidates={treeData.focusCandidates}
        selectedFocusPersonId={treeData.focusPerson?.id ?? ""}
        focusPersonId={toolbarFocusPersonId}
        searchMembers={searchMembers}
        createAction={createMemberAction}
      />

      {drawerMember && drawerData && returnTo ? (
        <MemberDrawer
          member={drawerMember}
          canManage={canManageMember}
          focusPersonId={currentFocusPersonId || drawerMember.id}
          returnTo={returnTo}
          relationshipData={drawerData[0]}
          relationshipCandidates={drawerData[1]}
          stories={drawerData[2]}
          feedback={{
            relationshipErrorMessage,
            relationshipStatusMessage,
            photoErrorMessage,
            photoStatusMessage,
            memberErrorMessage,
            memberStatusMessage
          }}
          addParentAction={addParentRelationshipAction}
          addSpouseAction={addSpouseRelationshipAction}
          addChildAction={addChildRelationshipAction}
          archiveRelationshipAction={archiveRelationshipAction}
          uploadPhotoAction={uploadOrReplaceMemberPhotoAction}
          removePhotoAction={removeMemberPhotoAction}
          updateMemberAction={updateMemberAction}
          archiveMemberAction={archiveMemberAction}
          restoreMemberAction={restoreMemberAction}
        />
      ) : null}
    </section>
  );
}
