import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { toggleRecipeLikeInDb } from "../api/recipeApi";

export default function useRecipeLike(recipe) {
  const { accessToken, token } = useAuth();
  const authToken = accessToken || token;
  const navigate = useNavigate();
  const location = useLocation();
  const [likeOverride, setLikeOverride] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const requestPending = useRef(false);
  const slug = recipe?.slug;
  const isLiked =
    slug && likeOverride?.slug === slug
      ? likeOverride.liked
      : Boolean(recipe?.likedByMe);
  const likesCount =
    slug && likeOverride?.slug === slug
      ? likeOverride.likesCount
      : recipe?.likesCount || 0;

  const toggleLike = async () => {
    if (!slug) return;
    if (!authToken) {
      navigate("/get-started", { state: { from: location } });
      return;
    }
    if (requestPending.current) return;

    requestPending.current = true;
    setLikeLoading(true);
    const previousState = { slug, liked: isLiked, likesCount };
    const nextLiked = !isLiked;
    setLikeOverride({
      slug,
      liked: nextLiked,
      likesCount: Math.max(0, likesCount + (nextLiked ? 1 : -1)),
    });

    try {
      const result = await toggleRecipeLikeInDb(slug, authToken);
      setLikeOverride({
        slug,
        liked: result.liked,
        likesCount: result.likesCount,
      });
    } catch {
      setLikeOverride(previousState);
    } finally {
      requestPending.current = false;
      setLikeLoading(false);
    }
  };

  return { isLiked, likesCount, likeLoading, toggleLike };
}
