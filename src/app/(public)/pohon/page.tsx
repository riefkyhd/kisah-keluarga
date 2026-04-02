import { redirect } from "next/navigation";

type TreeViewPageProps = {
  searchParams: Promise<{
    personId?: string;
  }>;
};

export default async function TreeViewPage({ searchParams }: TreeViewPageProps) {
  const query = await searchParams;
  const personId = query.personId?.trim();
  const params = new URLSearchParams();

  if (personId) {
    params.set("personId", personId);
  }

  const queryString = params.toString();
  redirect(queryString ? `/?${queryString}` : "/");
}
