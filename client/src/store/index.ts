import create from 'zustand';

interface PetitionState {
    petitions: PetitionFull[];
    setPetitions: (petitions: Array<PetitionFull>) => void;
    editPetition: (petition: PetitionFull,
                   newTitle: string,
                   newDescription: string,
                   newCategoryId: number) => void;
    removePetition: (petition: PetitionFull) => void;
}

const getLocalStorage = (key: string): Array<PetitionFull> => JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value: Array<PetitionFull>) => window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<PetitionState>((set) => ({
    petitions: getLocalStorage('petitions') || [],
    setPetitions: (petitions: Array<PetitionFull>) => set(() => {
        setLocalStorage('petitions', petitions);
        return { petitions: petitions };
    }),
    editPetition: (petition: PetitionFull,
                   newTitle,
                   newDescription,
                   newCategoryId
                   ) => set((state) => {
        const temp = state.petitions.map(
            u => u.petitionId === petition.petitionId ?
            ({ ...u, title: newTitle,
                description: newDescription ,
                categoryId: newCategoryId} as PetitionFull) : u);
        setLocalStorage('petitions', temp);
        return { petitions: temp };
    }),
    removePetition: (petition: PetitionFull) => set((state) => {
        const updatedPetitions = state.petitions.filter(u => u.petitionId !== petition.petitionId);
        setLocalStorage('petitions', updatedPetitions);
        return { petitions: updatedPetitions };
    })
}));

export const usePetitionStore = useStore;
