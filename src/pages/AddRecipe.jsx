import { useState } from "react";
import { createRecipePost } from "../api/recipeApi";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    image: "",
    category: "General",
    tags: "",
    cookTime: "",
    prepTime: "",
    servings: 4,
    ingredients: [{ amount: "", item: "" }],
    steps: [""],
    published: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddRecipe = async () => {
        try {
            const response = await createRecipePost(
                formData,
                accessToken
            );

            console.log('Recipe created:', response);

            // After successful API call
            navigate('/recipes');

        } catch (error) {
            console.error('Failed to create recipe:', error);
        }
    };

  // -----------------------------
  // Ingredients
  // -----------------------------

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];

    updatedIngredients[index][field] = value;

    setFormData((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
    }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { amount: "", item: "" },
      ],
    }));
  };

  const removeIngredient = (index) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // -----------------------------
  // Steps
  // -----------------------------

  const handleStepChange = (index, value) => {
    const updatedSteps = [...formData.steps];

    updatedSteps[index] = value;

    setFormData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, ""],
    }));
  };

  const removeStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // -----------------------------
  // Submit
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeData = {
      ...formData,

      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      servings: Number(formData.servings),
    };

    console.log("Recipe:", recipeData);

    // Later connect your API here:
    //
    // await fetch("/api/recipes", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(recipeData),
    // });
  };

  return (
    <div className="min-h-screen bg-red-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-2xl text-white shadow-lg">
            🍴
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Add New Recipe
          </h1>

          <p className="mt-2 text-gray-600">
            Share your favorite recipe with the community.
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xl">

            {/* =========================
                Basic Information
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Give your recipe a name and description.
                </p>

              </div>

              {/* Title */}
              <div className="mb-6">

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Recipe Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Creamy Garlic Pasta"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

              </div>

              {/* Description */}
              <div className="mb-6">

                <div className="mb-2 flex items-center justify-between">

                  <label className="block text-sm font-semibold text-gray-700">
                    Description *
                  </label>

                  <span className="text-xs text-gray-400">
                    {formData.description.length}/500
                  </span>

                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell people a little about this recipe..."
                  maxLength={500}
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

              </div>

              {/* Image */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Recipe Image URL
                </label>

                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/recipe-image.jpg"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                />

              </div>

            </section>

            {/* =========================
                Category & Tags
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Category & Tags
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Help people discover your recipe.
                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {/* Category */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  >
                    <option value="General">General</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Non-Vegetarian">
                      Non-Vegetarian
                    </option>
                  </select>

                </div>

                {/* Tags */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Tags
                  </label>

                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="pasta, italian, quick"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                  <p className="mt-2 text-xs text-gray-400">
                    Separate tags with commas.
                  </p>

                </div>

              </div>

            </section>

            {/* =========================
                Recipe Details
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Recipe Details
                </h2>

              </div>

              <div className="grid gap-6 sm:grid-cols-3">

                {/* Prep */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Prep Time
                  </label>

                  <input
                    type="text"
                    name="prepTime"
                    value={formData.prepTime}
                    onChange={handleChange}
                    placeholder="15 minutes"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                </div>

                {/* Cook */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Cook Time
                  </label>

                  <input
                    type="text"
                    name="cookTime"
                    value={formData.cookTime}
                    onChange={handleChange}
                    placeholder="30 minutes"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                </div>

                {/* Servings */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Servings
                  </label>

                  <input
                    type="number"
                    name="servings"
                    value={formData.servings}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                  />

                </div>

              </div>

            </section>

            {/* =========================
                Ingredients
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Ingredients
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add all the ingredients needed.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={addIngredient}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
                >
                  + Add Ingredient
                </button>

              </div>

              <div className="space-y-3">

                {formData.ingredients.map(
                  (ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl bg-red-50 p-3"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white">
                        {index + 1}
                      </div>

                      <input
                        type="text"
                        placeholder="Amount"
                        value={ingredient.amount}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "amount",
                            e.target.value
                          )
                        }
                        className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />

                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ingredient.item}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "item",
                            e.target.value
                          )
                        }
                        required
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      />

                      {formData.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeIngredient(index)
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-bold text-red-500 transition hover:bg-red-100 hover:text-red-700"
                        >
                          ×
                        </button>
                      )}

                    </div>
                  )
                )}

              </div>

            </section>

            {/* =========================
                Cooking Steps
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Cooking Steps
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Explain the cooking process step by step.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={addStep}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
                >
                  + Add Step
                </button>

              </div>

              <div className="space-y-4">

                {formData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 font-bold text-white">
                      {index + 1}
                    </div>

                    <textarea
                      value={step}
                      onChange={(e) =>
                        handleStepChange(
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Describe step ${
                        index + 1
                      }...`}
                      rows={3}
                      required
                      className="min-w-0 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    />

                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeStep(index)
                        }
                        className="mt-1 h-9 w-9 shrink-0 rounded-lg text-xl font-bold text-red-500 hover:bg-red-100"
                      >
                        ×
                      </button>
                    )}

                  </div>
                ))}

              </div>

            </section>

            {/* =========================
                Additional Content
            ========================== */}

            <section className="border-b border-gray-100 p-6 sm:p-8">

              <h2 className="text-xl font-bold text-gray-900">
                Additional Instructions
              </h2>

              <p className="mb-5 mt-1 text-sm text-gray-500">
                Add cooking tips, serving suggestions, storage
                instructions, etc.
              </p>

              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Add any additional information about your recipe..."
                rows={6}
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              />

            </section>

            {/* =========================
                Publish
            ========================== */}

            <section className="bg-red-50 p-6 sm:p-8">

              <label className="flex cursor-pointer items-start gap-4">

                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-gray-300 accent-red-600"
                />

                <div>

                  <p className="font-semibold text-gray-900">
                    Publish recipe
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Make this recipe visible to other users.
                    Uncheck to save it as a draft.
                  </p>

                </div>

              </label>

            </section>

            {/* =========================
                Actions
            ========================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 p-6 sm:flex-row sm:justify-end sm:p-8">

              <button
                type="button"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleAddRecipe}
                type="submit"
                className="rounded-xl bg-red-600 px-8 py-3 font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-700 active:scale-95"
              >
                Add Recipe
              </button>

            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default AddRecipe;

