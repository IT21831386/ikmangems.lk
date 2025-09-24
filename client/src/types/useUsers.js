import { useQuery } from "@tanstack/react-query";

const fetchUsers = async () => {
  const res = await fetch("http://localhost:4000/api/auth/login"); // your backend endpoint
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json(); // assuming backend returns array of users
};

export const useUsers = () => {
  return useQuery(["users"], fetchUsers);
};
