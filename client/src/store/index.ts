import create from 'zustand';

interface UserState {
    users: User[];
    setUsers: (users: Array<User>) => void;
    editUser: (user: User, newEmail: string) => void;
    removeUser: (user: User) => void;
}

const getLocalStorage = (key: string): Array<User> => JSON.parse(window.localStorage.getItem(key) as string);
const setLocalStorage = (key: string, value: Array<User>) => window.localStorage.setItem(key, JSON.stringify(value));

const useStore = create<UserState>((set) => ({
    users: getLocalStorage('users') || [],
    setUsers: (users: Array<User>) => set(() => {
        setLocalStorage('users', users);
        return { users: users };
    }),
    editUser: (user: User, newEmail) => set((state) => {
        const temp = state.users.map(u => u.userId === user.userId ?
            ({ ...u, email: newEmail } as User) : u);
        setLocalStorage('users', temp);
        return { users: temp };
    }),
    removeUser: (user: User) => set((state) => {
        const updatedUsers = state.users.filter(u => u.userId !== user.userId);
        setLocalStorage('users', updatedUsers);
        return { users: updatedUsers };
    })
}));

export const useUserStore = useStore;
