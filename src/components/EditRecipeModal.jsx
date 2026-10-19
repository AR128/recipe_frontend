import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { updateRecipePost, uploadImage } from "../api/recipeApi";
import ImageUploadModal from "./ImageUploadModal";

const CATEGORIES = [
  "General",
  "Italian",
  "Seafood",
  "Mexican",
  "Beverages",
  "Desserts",
  "Breakfast",
  "Asian",
  "Vegetarian",
  "Quick & Easy",
];

const fieldClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 dark:border-white/10 dark:bg-[#10100f] dark:text-white dark:placeholder:text-neutral-600";
const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400";

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
            {eyebrow}
          </p>
        )}
        <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function EditRecipeDialog({ recipe, onClose, onRecipeUpdated }) {
  const { accessToken, token } = useAuth();
  const authToken = accessToken || token;
  const [title, setTitle] = useState(recipe.title || "");
  const [category, setCategory] = useState(recipe.category || "General");
  const [description, setDescription] = useState(recipe.description || "");
  const [image, setImage] = useState(recipe.image || "");
  const [prepTime, setPrepTime] = useState(recipe.prepTime || "");
  const [cookTime, setCookTime] = useState(recipe.cookTime || "");
  const [servings, setServings] = useState(recipe.servings || 4);
  const [tags, setTags] = useState(
    Array.isArray(recipe.tags) ? recipe.tags.join(", ") : recipe.tags || ""
  );
  const [content, setContent] = useState(recipe.content || "");
  const [ingredients, setIngredients] = useState(
    Array.isArray(recipe.ingredients) && recipe.ingredients.length
      ? recipe.ingredients.map((ingredient) => ({
          amount: ingredient.amount || "",
          item: ingredient.item || "",
        }))
      : [{ amount: "", item: "" }]
  );
  const [steps, setSteps] = useState(
    Array.isArray(recipe.steps) && recipe.steps.length
      ? recipe.steps.map((step) =>
          typeof step === "string" ? step : step.text || ""
        )
      : [""]
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting && !isImageModalOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen, onClose, submitting]);

  const handleIngredientChange = (index, field, value) => {
    setIngredients((previous) =>
      previous.map((ingredient, currentIndex) =>
        currentIndex === index ? { ...ingredient, [field]: value } : ingredient
      )
    );
  };

  const handleStepChange = (index, value) => {
    setSteps((previous) =>
      previous.map((step, currentIndex) =>
        currentIndex === index ? value : step
      )
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Add a recipe title and short description before saving.");
      return;
    }

    const validIngredients = ingredients
      .filter((ingredient) => ingredient.item.trim())
      .map((ingredient) => ({
        item: ingredient.item.trim(),
        amount: ingredient.amount.trim(),
      }));
    const validSteps = steps.map((step) => step.trim()).filter(Boolean);

    if (!validIngredients.length || !validSteps.length) {
      setError("Add at least one ingredient and one preparation step.");
      return;
    }

    setSubmitting(true);

    try {
      let finalImageUrl = image.trim();
      if (finalImageUrl.startsWith("data:image/")) {
        const uploadedImage = await uploadImage(finalImageUrl, authToken);
        if (!uploadedImage?.url) {
          throw new Error("The image upload did not return an image URL.");
        }
        finalImageUrl = uploadedImage.url;
      }

      if (finalImageUrl) {
        const parsedImageUrl = new URL(finalImageUrl);
        if (
          parsedImageUrl.protocol !== "https:" ||
          parsedImageUrl.username ||
          parsedImageUrl.password
        ) {
          throw new Error("Recipe image URLs must use HTTPS.");
        }
      }

      const updatedData = await updateRecipePost(
        recipe._id,
        {
          title: title.trim(),
          category,
          description: description.trim(),
          image: finalImageUrl,
          prepTime: prepTime.trim(),
          cookTime: cookTime.trim(),
          servings: Number(servings),
          tags,
          content: content.trim(),
          ingredients: validIngredients,
          steps: validSteps,
        },
        authToken
      );

      onRecipeUpdated?.(updatedData.recipe || updatedData);
      onClose();
    } catch (submitError) {
      console.error("Update recipe error:", submitError);
      setError(
        submitError.response?.data?.message ||
          submitError.message ||
          "Failed to update recipe. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeDialog = () => {
    if (!submitting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-recipe-title"
        className="flex h-full max-h-[min(940px,96vh)] w-full max-w-6xl flex-col overflow-hidden bg-neutral-50 text-neutral-900 shadow-2xl dark:bg-[#0d0d0c] dark:text-white sm:rounded-3xl sm:border sm:border-white/10"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#141412] sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C9A96E]/15 text-[#C9A96E] sm:flex">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                Your kitchen
              </p>
              <h2
                id="edit-recipe-title"
                className="truncate font-serif text-lg font-bold sm:text-xl"
              >
                Edit recipe
              </h2>
              <p className="hidden truncate text-xs text-neutral-500 dark:text-neutral-400 sm:block">
                Make your changes to “{recipe.title}”
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDialog}
            disabled={submitting}
            aria-label="Close recipe editor"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </header>

        <form
          id="edit-recipe-form"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-7 sm:py-7">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              >
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="01 · Overview"
                    title="The essentials"
                    description="Give your dish a clear name and a tempting introduction."
                  />

                  <div className="space-y-4">
                    <div>
                      <label className={labelClass} htmlFor="edit-title">
                        Recipe title <span className="text-[#C9A96E]">*</span>
                      </label>
                      <input
                        id="edit-title"
                        className={fieldClass}
                        type="text"
                        maxLength={200}
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                      <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                        {title.length}/200
                      </p>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="edit-description">
                        Short description{" "}
                        <span className="text-[#C9A96E]">*</span>
                      </label>
                      <textarea
                        id="edit-description"
                        className={`${fieldClass} resize-y`}
                        rows={3}
                        maxLength={500}
                        required
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                      <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                        {description.length}/500
                      </p>
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="edit-category">
                        Category
                      </label>
                      <select
                        id="edit-category"
                        className={fieldClass}
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                      >
                        {!CATEGORIES.includes(category) && (
                          <option value={category}>{category}</option>
                        )}
                        {CATEGORIES.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="02 · Cover"
                    title="Make it appetizing"
                    description="Choose the image readers will see first."
                  />

                  <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-white/10 dark:bg-neutral-900">
                    <div className="aspect-[16/9]">
                      {image ? (
                        <img
                          src={image}
                          alt={`${title || "Recipe"} cover preview`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                          <span className="text-3xl" aria-hidden="true">
                            🍽️
                          </span>
                          <span className="text-xs">
                            No cover photo selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className="rounded-xl bg-[#C9A96E] px-4 py-2.5 text-xs font-bold text-[#17140e] transition hover:bg-[#d8b879]"
                    >
                      {image ? "Change photo" : "Add a photo"}
                    </button>
                    {image && (
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="rounded-xl border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-600 transition hover:border-red-300 hover:text-red-600 dark:border-white/10 dark:text-neutral-300 dark:hover:border-red-900 dark:hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="03 · Details"
                    title="Timing & tags"
                    description="Help cooks plan and discover your recipe."
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="edit-prep">
                        Prep
                      </label>
                      <input
                        id="edit-prep"
                        className={fieldClass}
                        type="text"
                        maxLength={40}
                        placeholder="15 min"
                        value={prepTime}
                        onChange={(event) => setPrepTime(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="edit-cook">
                        Cook
                      </label>
                      <input
                        id="edit-cook"
                        className={fieldClass}
                        type="text"
                        maxLength={40}
                        placeholder="30 min"
                        value={cookTime}
                        onChange={(event) => setCookTime(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="edit-servings">
                        Serves
                      </label>
                      <input
                        id="edit-servings"
                        className={fieldClass}
                        type="number"
                        min={1}
                        max={100}
                        required
                        value={servings}
                        onChange={(event) => setServings(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelClass} htmlFor="edit-tags">
                      Tags
                    </label>
                    <input
                      id="edit-tags"
                      className={fieldClass}
                      type="text"
                      maxLength={800}
                      placeholder="quick, vegetarian, family favourite"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                    />
                    <p className="mt-1.5 text-[11px] text-neutral-400">
                      Separate tags with commas. Add up to 20.
                    </p>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="04 · Ingredients"
                    title="What you’ll need"
                    description={`${ingredients.length} ingredient line${ingredients.length === 1 ? "" : "s"}`}
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          setIngredients((previous) => [
                            ...previous,
                            { amount: "", item: "" },
                          ])
                        }
                        disabled={ingredients.length >= 100}
                        className="shrink-0 rounded-lg border border-[#C9A96E]/40 px-3 py-2 text-xs font-bold text-[#a77e37] transition hover:bg-[#C9A96E]/10 disabled:opacity-40 dark:text-[#E7CA8D]"
                      >
                        + Add
                      </button>
                    }
                  />

                  <div className="space-y-2.5">
                    {ingredients.map((ingredient, index) => (
                      <div
                        key={`ingredient-${index}`}
                        className="grid min-w-0 grid-cols-[1.5rem_minmax(4.5rem,0.8fr)_minmax(0,1.5fr)_2.25rem] items-center gap-2"
                      >
                        <span className="w-6 shrink-0 text-center text-[11px] font-bold text-neutral-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <input
                          className={`${fieldClass} min-w-0 px-3`}
                          type="text"
                          maxLength={40}
                          aria-label={`Ingredient ${index + 1} amount`}
                          placeholder="Amount"
                          value={ingredient.amount}
                          onChange={(event) =>
                            handleIngredientChange(
                              index,
                              "amount",
                              event.target.value
                            )
                          }
                        />
                        <input
                          className={`${fieldClass} min-w-0 px-3`}
                          type="text"
                          maxLength={120}
                          aria-label={`Ingredient ${index + 1} name`}
                          placeholder="Ingredient"
                          value={ingredient.item}
                          onChange={(event) =>
                            handleIngredientChange(
                              index,
                              "item",
                              event.target.value
                            )
                          }
                        />
                        {ingredients.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setIngredients((previous) =>
                                previous.filter(
                                  (_, currentIndex) => currentIndex !== index
                                )
                              )
                            }
                            aria-label={`Remove ingredient ${index + 1}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="05 · Method"
                    title="How to make it"
                    description={`${steps.filter((step) => step.trim()).length} completed step${steps.filter((step) => step.trim()).length === 1 ? "" : "s"}`}
                    action={
                      <button
                        type="button"
                        onClick={() =>
                          setSteps((previous) => [...previous, ""])
                        }
                        disabled={steps.length >= 50}
                        className="shrink-0 rounded-lg border border-[#C9A96E]/40 px-3 py-2 text-xs font-bold text-[#a77e37] transition hover:bg-[#C9A96E]/10 disabled:opacity-40 dark:text-[#E7CA8D]"
                      >
                        + Step
                      </button>
                    }
                  />

                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div
                        key={`step-${index}`}
                        className="grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)_2rem] items-start gap-3"
                      >
                        <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C9A96E]/15 text-xs font-bold text-[#a77e37] dark:text-[#E7CA8D]">
                          {index + 1}
                        </span>
                        <textarea
                          className={`${fieldClass} min-h-16 min-w-0 resize-y`}
                          rows={2}
                          maxLength={2000}
                          aria-label={`Preparation step ${index + 1}`}
                          placeholder={`Describe step ${index + 1}`}
                          value={step}
                          onChange={(event) =>
                            handleStepChange(index, event.target.value)
                          }
                        />
                        {steps.length > 1 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSteps((previous) =>
                                previous.filter(
                                  (_, currentIndex) => currentIndex !== index
                                )
                              )
                            }
                            aria-label={`Remove step ${index + 1}`}
                            className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                          >
                            ×
                          </button>
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-white/10 dark:bg-[#141412] sm:p-6">
                  <SectionHeading
                    eyebrow="06 · Your notes"
                    title="Recipe story"
                    description="Add context, inspiration, or helpful serving notes."
                  />
                  <label className="sr-only" htmlFor="edit-content">
                    Recipe story and notes
                  </label>
                  <textarea
                    id="edit-content"
                    className={`${fieldClass} resize-y`}
                    rows={5}
                    maxLength={20000}
                    placeholder="What makes this dish special?"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                  <p className="mt-1.5 text-right text-[11px] text-neutral-400">
                    {content.length}/20,000
                  </p>
                </section>
              </div>
            </div>
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-neutral-200 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#141412] sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">
              Your original recipe stays unchanged until you save.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5 sm:py-2.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-recipe-form"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A96E] px-6 py-3 text-sm font-bold text-[#17140e] shadow-sm transition hover:bg-[#d8b879] disabled:cursor-wait disabled:opacity-60 sm:py-2.5"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17140e]/30 border-t-[#17140e]" />
                    Saving changes…
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </footer>
        </form>

        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onSelectImage={setImage}
        />
      </section>
    </div>
  );
}

export default function EditRecipeModal({
  isOpen,
  onClose,
  recipe,
  onRecipeUpdated,
}) {
  if (!isOpen || !recipe) return null;

  return (
    <EditRecipeDialog
      key={recipe._id}
      recipe={recipe}
      onClose={onClose}
      onRecipeUpdated={onRecipeUpdated}
    />
  );
}
