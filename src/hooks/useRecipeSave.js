import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";
import { toggleSaveRecipeInDb } from "../api/recipeApi";

export default function useRecipeSave(recipe) {
  const { accessToken, token } = useAuth();
  const authToken = accessToken || token;
  const navigate = useNavigate();
  const location = useLocation();
  const [saveOverride, setSaveOverride] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const requestPending = useRef(false);
  const slug = recipe?.slug;
  const isBookmarked =
    slug && saveOverride?.slug === slug
      ? saveOverride.saved
      : Boolean(recipe?.isBookmarked);

  const toggleSave = async () => {
    if (!slug) return null;
    if (!authToken) {
      navigate("/get-started", { state: { from: location } });
      return null;
    }
    if (requestPending.current) return null;

    requestPending.current = true;
    setSaveLoading(true);
    setSaveError("");

    try {
      const result = await toggleSaveRecipeInDb(slug, authToken);
      setSaveOverride({ slug, saved: result.saved });
      return result;
    } catch (error) {
      console.error("Failed to update saved recipe:", error);
      setSaveError("Could not update saved recipes. Please try again.");
      return null;
    } finally {
      requestPending.current = false;
      setSaveLoading(false);
    }
  };

  return { isBookmarked, saveLoading, saveError, toggleSave };
}
