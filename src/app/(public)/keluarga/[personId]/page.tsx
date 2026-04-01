import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUserRole, requireViewer } from "@/lib/permissions/guards";
import { hasMinimumRole } from "@/lib/auth/roles";
import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/status-banner";
import { getMemberById } from "@/server/queries/members";
import { MemberAvatar } from "@/components/members/member-avatar";
import { MemberPhotoManager } from "@/components/members/member-photo-manager";
import { RelationshipSection } from "@/components/relationships/relationship-section";
import { MemberStoriesSection } from "@/components/stories/member-stories-section";
import {
  archiveRelationshipAction,
  addChildRelationshipAction,
  addParentRelationshipAction,
  addSpouseRelationshipAction
} from "@/server/actions/relationships";
import {
  removeMemberPhotoAction,
  uploadOrReplaceMemberPhotoAction
} from "@/server/actions/member-photos";
import { getProfileRelationships, listRelationshipCandidates } from "@/server/queries/relationships";
import { listStoriesByPersonId } from "@/server/queries/stories";

type MemberProfilePageProps = {
  params: Promise<{ personId: string }>;
  searchParams: Promise<{
    relationship_error?: string;
    relationship_status?: string;
    photo_error?: string;
    photo_status?: string;
  }>;
};

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
  file_too_large: "Ukuran foto terlalu besar. Maksimum 5MB.",
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

export default async function MemberProfilePage({ params, searchParams }: MemberProfilePageProps) {
  const { personId } = await params;

  await requireViewer(`/keluarga/${personId}`);
  const role = await getCurrentUserRole();
  const canManageMember = hasMinimumRole(role, "editor");

  const member = await getMemberById(personId, canManageMember);
  if (!member) {
    notFound();
  }

  const relationshipData = await getProfileRelationships(personId, canManageMember);
  const relationshipCandidates = canManageMember ? await listRelationshipCandidates(personId) : [];
  const relatedStories = await listStoriesByPersonId(personId, false);
  const query = await searchParams;
  const relationshipErrorMessage = query.relationship_error
    ? relationshipErrorMessages[query.relationship_error]
    : "";
  const relationshipStatusMessage = query.relationship_status
    ? relationshipStatusMessages[query.relationship_status]
    : "";
  const photoErrorMessage = query.photo_error ? photoErrorMessages[query.photo_error] : "";
  const photoStatusMessage = query.photo_status ? photoStatusMessages[query.photo_status] : "";

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2 text-sm font-medium text-amber-700">
        <Link href="/keluarga" className="rounded-xl px-3 py-2 hover:bg-amber-50">
          ← Kembali ke direktori
        </Link>
        <Link href={`/pohon?personId=${personId}`} className="rounded-xl px-3 py-2 hover:bg-amber-50">
          Lihat di mode pohon
        </Link>
        <Link href="/timeline" className="rounded-xl px-3 py-2 hover:bg-amber-50">
          Lihat timeline keluarga
        </Link>
      </div>

      <Card className="space-y-4 rounded-[2rem] border-stone-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <MemberAvatar
            fullName={member.full_name}
            photoUrl={member.profile_photo_url}
            size="lg"
            testId="member-photo-image"
          />
          <div className="min-w-0 space-y-1">
            <h2 className="break-words text-3xl font-semibold tracking-tight text-stone-900">{member.full_name}</h2>
            {member.nickname ? <p className="text-base text-stone-600">Panggilan: {member.nickname}</p> : null}
          </div>
        </div>

        {member.is_archived ? (
          <StatusBanner variant="warning" message="Anggota ini sedang diarsipkan." />
        ) : null}
      </Card>

      <Card className="space-y-2 rounded-[2rem] border-stone-100 p-5 text-base leading-relaxed text-stone-700 sm:p-6">
        <p>Status: {member.is_living ? "Masih hidup" : "Sudah wafat"}</p>
        {member.birth_date ? <p>Tanggal lahir: {member.birth_date}</p> : null}
        {member.death_date ? <p>Tanggal wafat: {member.death_date}</p> : null}
        {member.gender ? (
          <p>
            Jenis kelamin:{" "}
            {member.gender === "male"
              ? "Laki-laki"
              : member.gender === "female"
                ? "Perempuan"
                : "Lainnya"}
          </p>
        ) : null}
        {member.bio ? <p>Catatan: {member.bio}</p> : null}
      </Card>

      {relationshipErrorMessage ? (
        <StatusBanner variant="error" message={relationshipErrorMessage} />
      ) : null}

      {relationshipStatusMessage ? (
        <StatusBanner variant="success" message={relationshipStatusMessage} />
      ) : null}

      {photoErrorMessage ? (
        <StatusBanner variant="error" message={photoErrorMessage} />
      ) : null}

      {photoStatusMessage ? (
        <StatusBanner variant="success" message={photoStatusMessage} />
      ) : null}

      <MemberPhotoManager
        personId={member.id}
        canManage={canManageMember}
        hasPhoto={Boolean(member.profile_photo_path)}
        uploadAction={uploadOrReplaceMemberPhotoAction}
        removeAction={removeMemberPhotoAction}
      />

      <RelationshipSection
        testId="parents-section"
        title="Orang Tua"
        description="Anggota yang menjadi orang tua dari profil ini."
        emptyText="Belum ada data orang tua."
        currentPersonId={member.id}
        items={relationshipData.parents}
        canManage={canManageMember}
        candidates={relationshipCandidates}
        addLabel="Tambah orang tua"
        submitLabel="Tambah Orang Tua"
        addAction={addParentRelationshipAction}
        archiveAction={archiveRelationshipAction}
      />

      <RelationshipSection
        testId="spouse-section"
        title="Pasangan"
        description="Hubungan pasangan aktif pada profil ini."
        emptyText="Belum ada data pasangan."
        currentPersonId={member.id}
        items={relationshipData.spouse}
        canManage={canManageMember}
        candidates={relationshipCandidates}
        addLabel="Tambah pasangan"
        submitLabel="Tambah Pasangan"
        showAddForm={relationshipData.spouse.length === 0}
        addAction={addSpouseRelationshipAction}
        archiveAction={archiveRelationshipAction}
      />
      {canManageMember && relationshipData.spouse.length > 0 ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          Profil ini sudah memiliki pasangan aktif. Arsipkan relasi pasangan saat ini untuk menambah yang baru.
        </p>
      ) : null}

      <RelationshipSection
        testId="children-section"
        title="Anak"
        description="Anggota yang tercatat sebagai anak dari profil ini."
        emptyText="Belum ada data anak."
        currentPersonId={member.id}
        items={relationshipData.children}
        canManage={canManageMember}
        candidates={relationshipCandidates}
        addLabel="Tambah anak"
        submitLabel="Tambah Anak"
        addAction={addChildRelationshipAction}
        archiveAction={archiveRelationshipAction}
      />

      <RelationshipSection
        testId="siblings-section"
        title="Saudara (otomatis)"
        description="Diturunkan dari orang tua yang sama."
        emptyText="Belum ada data saudara."
        currentPersonId={member.id}
        items={relationshipData.siblings}
        canManage={false}
      />

      <MemberStoriesSection personId={member.id} stories={relatedStories} canManage={canManageMember} />

      {canManageMember ? (
        <div>
          <Link
            href={`/anggota/${member.id}/edit`}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-stone-200 bg-white px-5 py-3 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50 sm:w-auto"
          >
            Edit / Arsipkan Anggota
          </Link>
        </div>
      ) : null}
    </section>
  );
}
