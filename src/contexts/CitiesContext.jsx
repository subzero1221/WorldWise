import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { supabase } from "./../supabase";

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

  // Fetch all cities
  useEffect(() => {
    dispatch({ type: "loading" });
    async function fetchCities() {
      try {
        const { data, error } = await supabase
          .from("cities")
          .select("*");

        if (error) throw error;

        // Rebuild position object
        const citiesWithPosition = data.map((c) => ({
          ...c,
          position: { lat: c.lat, lng: c.lng },
        }));

        dispatch({ type: "cities/loaded", payload: citiesWithPosition });
      } catch {
        dispatch({ type: "rejected" });
      }
    }
    fetchCities();
  }, []);

  // Fetch one city
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

        const cityWithPosition = { ...data, position: { lat: data.lat, lng: data.lng } };
        dispatch({ type: "city/loaded", payload: cityWithPosition });
      } catch {
        dispatch({ type: "rejected" });
      }
    },
    [curCity.id]
  );

  // Create a new city
  const createCity = useCallback(async (newCity) => {
    dispatch({ type: "loading" });
    try {
      const { cityName, country, date, notes, position } = newCity;
      const insertData = {
        cityName,
        country,
        date,
        notes,
        lat: parseFloat(position.lat),
        lng: parseFloat(position.lng),
      };

      const { data, error } = await supabase.from("cities").insert([insertData]).select().single();
      if (error) throw error;

      const cityWithPosition = { ...data, position: { lat: data.lat, lng: data.lng } };
      dispatch({ type: "city/created", payload: cityWithPosition });
    } catch {
      dispatch({ type: "rejected" });
    }
  }, []);

  // Delete city
  const deleteCity = useCallback(async (id) => {
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
  if (!context) throw new Error("Use Context only in child components");
  return context;
}

export { CitiesProvider, useCities };
