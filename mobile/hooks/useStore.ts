import { create } from "zustand";

interface Resident {
  id: number | null;
  first_name: string;
  suffix?: string;
  middle_name?: string;
  last_name: string;
  mobile_number?: string;
}

const initialResident: Resident = {
  id: null,
  first_name: "",
  suffix: "",
  middle_name: "",
  last_name: "",
  mobile_number: "",
};

interface Store {
  resident: Resident;
  setResident: (resident?: Partial<Resident>) => void;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
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
}));
