import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { supabase } from "../supabase";

const CitiesContext = createContext();

const initialState = {
  isLoading: false,
  cities: [],
  error: "",
  curCity: {},
};

function normalizeCity(city) {
  let position = city.position;
  if (typeof position === "string") {
    try {
      position = JSON.parse(position);
    } catch {
      position = { lat: 0, lng: 0 };
    }
  }
  return {
    ...city,
    position: {
      lat: Number(position?.lat || 0),
      lng: Number(position?.lng || 0),
    },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return { ...state, isLoading: false, curCity: action.payload };

    case "city/created": {
      const newCity = normalizeCity(action.payload);
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, newCity],
        curCity: newCity, 
      };
    }

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        curCity:
          state.curCity.id === action.payload ? {} : state.curCity, 
      };

    case "rejected":
      return { ...state, isLoading: false, error: "Unknown error" };

    default:
      throw new Error("Unknown action type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, error, curCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Fetch all cities
  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        const normalized = data.map(normalizeCity);
        dispatch({ type: "cities/loaded", payload: normalized });
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
        const { data, error } = await supabase
          .from("cities")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        dispatch({ type: "city/loaded", payload: normalizeCity(data) });
      } catch {
        dispatch({ type: "rejected" });
      }
    },
    [curCity.id]
  );

  const createCity = useCallback(async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const { data, error } = await supabase.from("cities").insert([newCity]).select().single();
      if (error) throw error;
      dispatch({ type: "city/created", payload: data });
    } catch {
      dispatch({ type: "rejected" });
    }
  }, []);

  const deleteCity = useCallback(async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      const { error } = await supabase.from("cities").delete().eq("id", id);
      if (error) throw error;
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({ type: "rejected" });
    }
  }, []);

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
  if (!context) throw new Error("useCities must be used within CitiesProvider");
  return context;
}

export { CitiesProvider, useCities };
