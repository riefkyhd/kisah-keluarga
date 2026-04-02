"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

type RelationshipActionsMenuProps = {
  currentPersonId: string;
  relatedPersonId: string;
  relatedPersonName: string;
  relationshipId: string;
  relationshipTypeLabel: string;
  archiveAction: (formData: FormData) => Promise<void>;
};

export function RelationshipActionsMenu({
  currentPersonId,
  relatedPersonId,
  relatedPersonName,
  relationshipId,
  relationshipTypeLabel,
  archiveAction
}: RelationshipActionsMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="border border-[color:rgba(212,184,150,0.4)] bg-[color:var(--kk-surface)] hover:bg-[color:var(--color-warm)]"
            aria-label="Buka menu aksi relasi"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/keluarga/${relatedPersonId}`}>Lihat profil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            destructive
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            Arsipkan relasi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arsipkan relasi ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Hapus relasi {relationshipTypeLabel.toLowerCase()} dengan {relatedPersonName}? Relasi dapat ditambahkan
              kembali kapan saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form action={archiveAction} className="space-y-4">
            <input type="hidden" name="person_id" value={currentPersonId} />
            <input type="hidden" name="relationship_id" value={relationshipId} />
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
    </>
  );
}
