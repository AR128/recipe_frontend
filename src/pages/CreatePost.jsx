import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/useAuth";
import { createRecipePost, uploadImage } from "../api/recipeApi";
import ImageUploadModal from "../components/ImageUploadModal";
import defaultPlaceholder from "../assets/chef-placeholder.jpg";

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

function CreatePost() {
  const { accessToken, token } = useAuth();
  const authToken = accessToken || token;
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState(4);
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

  const [ingredients, setIngredients] = useState([{ amount: "", item: "" }]);
  const [steps, setSteps] = useState([""]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoChoiceOpen, setIsPhotoChoiceOpen] = useState(false);

  const handleUseImageUrl = () => {
    if (!imageUrl.trim()) return;

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      setError("Enter a valid image URL beginning with http:// or https://.");
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Enter a valid image URL beginning with http:// or https://.");
      return;
    }

    const validImageUrl = parsedUrl.href;
    setImageUrl(validImageUrl);
    setError("");
    if (uploadedImage) {
      setIsPhotoChoiceOpen(true);
    } else {
      setImage(validImageUrl);
    }
  };

  const handleUploadedImage = (imageData) => {
    setUploadedImage(imageData);

    let parsedUrl;
    try {
      parsedUrl = new URL(imageUrl.trim());
    } catch {
      setImage(imageData);
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setImage(imageData);
      return;
    }

    const validImageUrl = parsedUrl.href;
    setImageUrl(validImageUrl);
    setIsPhotoChoiceOpen(true);
  };

  const handleChooseCover = (selectedImage) => {
    setImage(selectedImage);
    setIsPhotoChoiceOpen(false);
  };

  const handleIngredientChange = (index, field, value) => {
    const next = [...ingredients];
    next[index][field] = value;
    setIngredients(next);
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { amount: "", item: "" }]);

  const removeIngredient = (index) => {
    if (ingredients.length > 1)
      setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, value) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const addStep = () => setSteps((prev) => [...prev, ""]);

  const removeStep = (index) => {
    if (steps.length > 1)
      setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Title and Summary are required.");
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.item.trim() !== ""
    );
    const validSteps = steps.map((s) => s.trim()).filter(Boolean);

    setSubmitting(true);

    try {
      let finalImageUrl = image.trim();

      if (finalImageUrl.startsWith("data:image/")) {
        try {
          const uploadRes = await uploadImage(finalImageUrl, authToken);
          if (uploadRes && uploadRes.url) finalImageUrl = uploadRes.url;
        } catch (uploadErr) {
          console.error("Cloudinary upload failed:", uploadErr);
          setError(
            uploadErr.response?.data?.message ||
              "Failed to upload image. Please try again."
          );
          setSubmitting(false);
          return;
        }
      }

      const data = await createRecipePost(
        {
          title: title.trim(),
          category,
          description: description.trim(),
          image: finalImageUrl,
          prepTime: prepTime.trim(),
          cookTime: cookTime.trim(),
          servings: Number(servings) || 4,
          tags,
          content: content.trim(),
          ingredients: validIngredients,
          steps: validSteps,
        },
        authToken
      );

      navigate(data.recipe?.slug ? `/recipe/${data.recipe.slug}` : "/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to publish recipe. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses =
    "w-full bg-white dark:bg-[#121212] border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-[14px] sm:text-[15px] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/30 focus:border-[#C9A96E] dark:focus:border-[#C9A96E] transition-all placeholder-neutral-400 dark:placeholder-neutral-500";
  const labelClasses =
    "block text-[12px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2";
  const sectionCard =
    "bg-white dark:bg-[#141412] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] transition-colors font-sans">
      {/* ══════════════════════════════════════
                TOP HEADER — full width
            ══════════════════════════════════════ */}
      <div className="w-full bg-white dark:bg-[#141412] border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 hidden sm:block" />
            <div className="min-w-0">
              <h1 className="font-serif text-lg sm:text-xl font-bold text-neutral-900 dark:text-white leading-tight truncate">
                Create a Recipe
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Share your dish with the Poodiest community
              </p>
            </div>
          </div>

          {/* Error inline */}
          {error && (
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs font-semibold max-w-xs">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="truncate">{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="hidden sm:block px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              form="create-recipe-form"
              type="submit"
              disabled={submitting}
              className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-[#C9A96E] text-[#121210] text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#b8944f] transition-all flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#121210]/30 border-t-[#121210] rounded-full animate-spin" />
                  <span className="hidden sm:inline">Publishing...</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Publish Recipe</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile error banner */}
      {error && (
        <div className="lg:hidden mx-4 sm:mx-8 mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════
                MAIN FORM — two-column desktop grid
            ══════════════════════════════════════ */}
      <form id="create-recipe-form" onSubmit={handleSubmit}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10 items-start">
            {/* ─────────────────────────────────
                            LEFT COLUMN (2/5)
                            Cover photo + Basic info + Details
                        ───────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover Photo */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8">
                  <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    Cover Photo
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    High-resolution recommended
                  </p>
                </div>
                <div className="p-5 sm:p-6">
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden cursor-pointer group border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-[#C9A96E] dark:hover:border-[#C9A96E] transition-colors"
                  >
                    {image ? (
                      <>
                        <img
                          src={image}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <span className="bg-white text-neutral-900 px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Change Photo
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
                        <img
                          src={defaultPlaceholder}
                          alt="Placeholder"
                          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-5 grayscale"
                        />
                        <div className="z-10 flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shadow-sm">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-neutral-500"
                            >
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <polyline points="21 15 16 10 5 21" />
                            </svg>
                          </div>
                          <span className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                            Click to upload
                          </span>
                          <span className="text-xs text-neutral-400">
                            JPG, PNG, WEBP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-5 space-y-4">
                    {uploadedImage && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        Photo uploaded and ready to use.
                      </p>
                    )}
                    <div>
                      <label htmlFor="cover-photo-url" className={labelClasses}>
                        Or use an image link
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          id="cover-photo-url"
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onBlur={(e) => {
                            if (
                              e.relatedTarget?.dataset.photoSourceAction !==
                              "true"
                            ) {
                              handleUseImageUrl();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleUseImageUrl();
                            }
                          }}
                          placeholder="https://example.com/recipe-photo.jpg"
                          className={`${inputClasses} min-w-0`}
                        />
                        <button
                          type="button"
                          onClick={handleUseImageUrl}
                          data-photo-source-action="true"
                          className="shrink-0 rounded-lg bg-neutral-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-neutral-900 hover:opacity-85 transition-opacity"
                        >
                          Use link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8">
                  <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    Basic Information
                  </h2>
                </div>
                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <label htmlFor="recipe-title" className={labelClasses}>
                      Recipe Title{" "}
                      <span className="text-red-500 normal-case tracking-normal">
                        *
                      </span>
                    </label>
                    <input
                      id="recipe-title"
                      type="text"
                      required
                      placeholder="e.g. Creamy Garlic Butter Tuscan Salmon"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={inputClasses}
                    />
                  </div>

                  <div>
                    <label htmlFor="recipe-desc" className={labelClasses}>
                      Short Summary{" "}
                      <span className="text-red-500 normal-case tracking-normal">
                        *
                      </span>
                    </label>
                    <textarea
                      id="recipe-desc"
                      required
                      rows={3}
                      placeholder="Briefly describe your dish and why it's delicious..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`${inputClasses} resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8">
                  <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    Recipe Details
                  </h2>
                </div>
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`${inputClasses} cursor-pointer`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClasses}>Servings</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="4"
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClasses}>Prep Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 15 mins"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label className={labelClasses}>Cook Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 30 mins"
                        value={cookTime}
                        onChange={(e) => setCookTime(e.target.value)}
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Tags{" "}
                      <span className="normal-case tracking-normal font-normal text-neutral-400">
                        (comma separated)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Keto, Quick, Dinner"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────
                            RIGHT COLUMN (3/5)
                            Ingredients + Steps + Story
                        ───────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">
              {/* Ingredients */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                      Ingredients
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {ingredients.length} item
                      {ingredients.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Row
                  </button>
                </div>
                <div className="p-5 sm:p-6">
                  {/* Column headers */}
                  <div className="flex gap-3 mb-3 px-1">
                    <span className="w-28 sm:w-36 shrink-0 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Amount
                    </span>
                    <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Ingredient
                    </span>
                    <span className="w-9 shrink-0" />
                  </div>
                  <div className="space-y-2.5">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="w-28 sm:w-36 shrink-0">
                          <input
                            type="text"
                            placeholder="2 cups"
                            value={ing.amount}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Ingredient name"
                            value={ing.item}
                            onChange={(e) =>
                              handleIngredientChange(
                                index,
                                "item",
                                e.target.value
                              )
                            }
                            className={inputClasses}
                          />
                        </div>
                        <div className="w-9 shrink-0 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeIngredient(index)}
                            disabled={ingredients.length === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                            title="Remove"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                      Instructions
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {steps.length} step{steps.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Step
                  </button>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="w-8 h-8 mt-2.5 rounded-full bg-[#C9A96E]/15 text-[#C9A96E] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          placeholder={`Describe step ${index + 1}...`}
                          value={step}
                          onChange={(e) =>
                            handleStepChange(index, e.target.value)
                          }
                          className={`${inputClasses} resize-y leading-relaxed`}
                        />
                      </div>
                      <div className="w-9 shrink-0 flex justify-center pt-2.5">
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          disabled={steps.length === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-300 dark:text-neutral-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                          title="Remove"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Story */}
              <div className={sectionCard}>
                <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3 border-b border-neutral-100 dark:border-white/8">
                  <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                    The Story{" "}
                    <span className="font-normal text-neutral-400 text-sm font-sans normal-case tracking-normal">
                      — Optional
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Share the inspiration behind this recipe or tips for perfect
                    execution.
                  </p>
                </div>
                <div className="p-5 sm:p-6">
                  <textarea
                    rows={7}
                    placeholder="Start writing your story or chef's notes..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`${inputClasses} resize-y leading-relaxed`}
                  />
                </div>
              </div>

              {/* Mobile submit */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2 lg:hidden">
                <Link
                  to="/"
                  className="w-full sm:w-auto text-center px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#C9A96E] text-[#121210] text-sm font-bold disabled:opacity-50 hover:bg-[#b8944f] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#121210]/30 border-t-[#121210] rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Recipe"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={handleUploadedImage}
      />

      {isPhotoChoiceOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsPhotoChoiceOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cover-choice-title"
            className="w-full max-w-2xl rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#141412] p-5 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="cover-choice-title"
                  className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white"
                >
                  Choose your cover photo
                </h2>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Select which image to use for this recipe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoChoiceOpen(false)}
                aria-label="Close photo choice"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChooseCover(imageUrl)}
                className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 text-left hover:border-[#C9A96E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
              >
                <img
                  src={imageUrl}
                  alt="Photo from the provided link"
                  className="aspect-video w-full object-cover bg-neutral-100 dark:bg-neutral-800"
                />
                <span className="block px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Use linked photo
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleChooseCover(uploadedImage)}
                className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 text-left hover:border-[#C9A96E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded photo"
                  className="aspect-video w-full object-cover bg-neutral-100 dark:bg-neutral-800"
                />
                <span className="block px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  Use uploaded photo
                </span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CreatePost;
