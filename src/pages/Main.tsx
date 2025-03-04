import Navbar from "@/components/Navbar";
import { useMovies } from "@/context/MovieProvider";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {}

export default function Main({ children }: Props) {
  const { query, setQuery } = useMovies();
  return (
    <main className="min-h-screen min-w-screen pb-6 bg-background flex justify-start flex-col outline-dotted box-content">
      <Navbar query={query} setQuery={setQuery} />
      <div className="container w-full mx-auto px-4">{children}</div>
    </main>
  );
}
