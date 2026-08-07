import { create } from "zustand";

interface Resident {
  id: number | null;
  first_name: string;
  suffix?: string;
  middle_name?: string;
  last_name: string;
  email: string;
}

const initialResident: Resident = {
  id: null,
  first_name: "",
  suffix: "",
  middle_name: "",
  last_name: "",
  email: "",
};

interface Ordinance {
  folder_id: string;
  pdf_id: string;
  folder_name: string;
  pdf_name: string;
}

const initialOrdinance: Ordinance = {
  folder_id: "",
  pdf_id: "",
  folder_name: "",
  pdf_name: "",
};

interface Store {
  resident: Resident;
  setResident: (resident?: Partial<Resident>) => void;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  ordinance: Ordinance;
  setOrdinance: (ordinance?: Partial<Ordinance>) => void;
}

export const useStore = create<Store>((set) => ({
  resident: initialResident,
  setResident: (resident = {}) =>
    set({
      resident: {
        ...initialResident,
        ...resident,
      },
    }),
  isVisible: false,
  setIsVisible: (isVisible) => set({ isVisible }),
  ordinance: initialOrdinance,
  setOrdinance: (ordinance = {}) =>
    set({
      ordinance: {
        ...initialOrdinance,
        ...ordinance,
      },
    }),
}));
