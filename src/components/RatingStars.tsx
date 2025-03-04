import { useState } from "react";
import { Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { Movie } from "@/context/MovieProvider";

interface RatingStarsProps {
  className?: string;
}

export function RatingStars({
  className = "",
  movie,
}: RatingStarsProps & { movie: Movie }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const db = getFirestore();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Fetch existing rating
  const { data: currentRating, isLoading } = useQuery({
    queryKey: ["rating", user?.uid, movie.id],
    queryFn: async () => {
      if (!user) return null;
      const docRef = doc(db, "ratings", user.uid, "movies", movie.id.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().rating as number;
      }
      return null;
    },
    enabled: !!user,
  });

  // Mutation to add/update rating
  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) throw new Error("User not authenticated");
      const ratingRef = doc(
        db,
        "ratings",
        user.uid,
        "movies",
        movie.id.toString()
      );
      if (rating === 0) {
        // If rating is 0, remove the rating
        await deleteDoc(ratingRef);
        return null;
      } else {
        // Add or update the rating with movie details
        await setDoc(ratingRef, {
          movie: movie.id,
          rating,
          updatedAt: new Date(),
          // Store movie details
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
        });
        return rating;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["rating", user?.uid, movie.id],
      });
      queryClient.invalidateQueries({ queryKey: ["ratings", user?.uid] });
    },
  });

  // Handle setting rating
  const handleRating = (rating: number) => {
    // If clicking the same rating, remove it (toggle)
    const newRating = currentRating === rating ? 0 : rating;
    ratingMutation.mutate(newRating);
  };

  // Generate stars
  const renderStars = () => {
    const stars = [];
    const displayRating =
      hoverRating !== null ? hoverRating : currentRating || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            i <= displayRating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-transparent text-gray-400 hover:text-yellow-300"
          }`}
          onClick={(e) => {
            e.preventDefault();
            handleRating(i);
          }}
          onMouseEnter={() => setHoverRating(i)}
        />
      );
    }

    return stars;
  };

  if (!user) return null;

  return (
    <div
      className={`absolute top-2 left-2 z-10 bg-black/50 rounded-full p-1 flex ${className} ${
        isLoading ? "opacity-50" : ""
      }`}
      onMouseLeave={() => setHoverRating(null)}
    >
      {renderStars()}
    </div>
  );
}
