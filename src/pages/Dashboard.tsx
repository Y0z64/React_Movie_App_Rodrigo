import Favorites from "@/components/Favorites";
import Ratings from "@/components/Ratings";

type Props = {};

export default function Dashboard({}: Props) {
  return (
    <div className="container w-full mx-auto px-4 space-y-5">
      <Favorites />
      <Ratings />
    </div>
  );
}
