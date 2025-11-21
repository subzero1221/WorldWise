import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const initialState = {
  isLoading: false,
  cities: [],
  error: "",
  curCity: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return { ...state, isLoading: false, curCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        curCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        curCity: {},
      };

    case "rejected":
      return { ...state, isLoading: false, error: "Unknown" };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, error, curCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(function () {
    dispatch({ type: "loading" });
    async function fetchCities() {
      try {
        const res = await fetch(`https://world-wise-26ci-q9wahi520-subzero1221s-projects.vercel.app/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
        console.log(data);
      } catch {
        dispatch({ type: "rejected" });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(
    async function getCity(id) {
      if (+id === curCity.id) return;
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`https://world-wise-26ci-q9wahi520-subzero1221s-projects.vercel.app/cities/${id}`);
        const data = await res.json();
        dispatch({ type: "city/loaded", payload: data });
        console.log(data);
      } catch {
        dispatch({ type: "rejected" });
      }
    },
    [curCity.id]
  );

  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`https://world-wise-26ci-q9wahi520-subzero1221s-projects.vercel.app/cities/`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
      console.log(data);
    } catch {
      dispatch({ type: "rejected" });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`https://world-wise-26ci-q9wahi520-subzero1221s-projects.vercel.app/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({ type: "rejected" });
    }
  }
  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        curCity,
        getCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (!context) throw new Error("Use Context only in child components");
  return context;
}

export { CitiesProvider, useCities };
