# Product Requirements

## Product Vision
Membangun web app keluarga besar yang memudahkan keluarga melihat silsilah, mengelola profil anggota, dan menyimpan cerita keluarga dengan cara yang mudah dipahami oleh semua generasi, termasuk orang tua / lansia.

## Product Goals
- menjadi pusat data keluarga yang rapi
- mempermudah pencarian dan pemahaman hubungan keluarga
- mempermudah penambahan dan pengurangan anggota keluarga
- menyediakan foto profil untuk tiap anggota
- menampung cerita / memori keluarga di luar relasi formal
- tetap ringan, cepat, dan mudah dirawat

## Scope Summary
### Included in MVP
- authentication
- roles and permissions
- family member directory
- member profile page
- create / edit / archive family members
- relationship management
- profile photo upload
- search
- family branch view
- simple family tree view
- change history / audit basic

### Included after MVP
- stories / memories
- timeline keluarga
- event reminders
- printable family book
- QR code profile
- richer graph navigation
- contributor suggestions workflow

## Core User Problems
### For elderly family members
- susah mengingat hubungan keluarga yang makin besar
- susah menggunakan aplikasi yang terlalu kompleks
- butuh tampilan sederhana dan jelas

### For family admins
- sulit merapikan data anggota keluarga yang tersebar di chat atau dokumen
- sulit memperbarui data saat ada kelahiran, pernikahan, wafat, atau koreksi informasi
- butuh proses tambah / edit yang cepat dan tidak ribet

### For younger family contributors
- ingin membantu menambahkan data dan foto
- ingin menyimpan cerita keluarga, bukan hanya nama dan hubungan

## Core User Stories
- Sebagai viewer, saya ingin mencari nama anggota keluarga agar saya bisa cepat menemukan profilnya.
- Sebagai viewer, saya ingin melihat siapa orang tua, pasangan, anak, dan saudara dari seseorang agar saya bisa memahami relasinya.
- Sebagai editor, saya ingin menambah anggota keluarga baru secara cepat dari profil orang lain agar proses input terasa natural.
- Sebagai editor, saya ingin mengunggah foto profil anggota keluarga agar data terasa lebih hidup dan mudah dikenali.
- Sebagai admin, saya ingin menghapus anggota secara aman tanpa kehilangan histori agar kesalahan bisa dibatalkan.
- Sebagai keluarga, saya ingin melihat cerita dan kenangan keluarga agar aplikasi tidak terasa sekadar database.

## Core Functional Requirements
1. The system must support creating a family member with minimal required information.
2. The system must support linking members as parent, spouse/partner, and child.
3. The system must support editing member data without navigating through complex forms.
4. The system must support uploading and replacing profile photos.
5. The system must support searching by full name, nickname, and branch/family line.
6. The system must support soft deletion / archival instead of destructive deletion by default.
7. The system must support role-based access.
8. The system must support mobile-friendly viewing and editing.
9. The system must support future extension for stories, memories, and timeline.

