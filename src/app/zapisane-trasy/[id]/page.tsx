import TrackDetailsClient from "@/app/zapisane-trasy/[id]/TrackDetailsClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>> | undefined;
};


export default async function SavedTrackDetailsPage(props: Props) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  console.log("Search Params:", searchParams);

  return <TrackDetailsClient id={params.id} />;
}


