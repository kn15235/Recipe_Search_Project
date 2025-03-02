import './App.css';
import React, { useEffect, useRef, useState } from "react";

const RecipeCard = ({onSubmit}) => {
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const handleSubmit = () => {
    const recipeData = {
      ingredients,
      cuisine,
      difficulty,
    };
    onSubmit(recipeData);
  };

  return (
    <div className='w-[400px] border rounded-lg overflow-hidden shadow-lg'>
      <div className="px-6 py-4">
        <label
          className="block text-gray-700 text-sm front-bold mb-2"
          htmlFor="ingredients"
        >
          Ingredients
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
          id="ingredients"
          type="text"
          placeholder="Enter ingredients"
          value={ingredents}
          onChange={(e) => setIngredients(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="cuisine"

        >
          Cuisine
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading"
          id="cuisine"
          type="text"
          placeholder="e.g., Italian, Mexican"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="difficulty"
        >
          difficulty
        </label>
        <select
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500"
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>

        </select>
      </div>
      <div className="px-6 py-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline"
          type="button"
          onClick={handleSubmit}
        >
          Generate Recipe
        </button>
      </div>
    </div>
  )
}

function App() {
  const [recipeData, setRecipeData] = useState(null);
  const [recipeText, setRecipeText] = useState("");

  let eventSourceRef = useRef(null)

useEffect(()=>{
  if(recipeData) {
    closeEventStream();
    initializeEventStream()
  }
}, [recipeData])

  const initializeEventStream = () => {
    const recipeInputs = {... recipeData };

    const queryParams = new URLSearchParams(recipeInputs).toString();
    const url = `http://localhost:3001/recipeStream?${queryParams}`;
    eventSourceRef.current = new EventSource(url);
    eventSourceFef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "close"){
        closeEventStream()
      } else if(data.action === 'chunk') {
        setRecipeText((prev) => prev + data.chunk)
      }
    }

    eventSourceRef.current.onerror = () => {
      eventSourceRef.current.close();
    };
  }

  const closeEventStream = () => {
    if(eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  async function onSubmit(data) {
    setRecipeText('')
    setRecipeData(data);
  }
  return (
    <div className="App">
      <div className="flex flex-row h-full my-4 gap-2 justify-center">
        <RecipeCard onSubmit={onSubmit}/>
        <div className="w-[400px] h-[565px] text-xs text-gray-600 p-4 border rounded-lg shadow-xl whitespace-pre-line overflow-y-auto"></div>
        {recipeText}
        </div>
      </div>
    </div>
  );
}

export default App;
