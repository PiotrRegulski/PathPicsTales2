import TrackDetailsClient from  "@/app/zapisane-trasy/[id]/TrackDetailsClient";

type Props = {
  params: {
    id: string;
  };
};

export default function SavedTrackDetailsPage({ params }: Props) {
  return <TrackDetailsClient id={params.id} />;
}
