export interface Branch {
  id: string;
  label: string;
  addr: string;
}

export const BRANCHES: Branch[] = [
  { id: "remera", label: "Simba Supermarket Remera", addr: "Remera, Gasabo, Kigali" },
  { id: "kimironko", label: "Simba Supermarket Kimironko", addr: "Kimironko, Gasabo, Kigali" },
  { id: "kacyiru", label: "Simba Supermarket Kacyiru", addr: "Kacyiru, Gasabo, Kigali" },
  { id: "nyamirambo", label: "Simba Supermarket Nyamirambo", addr: "Nyamirambo, Nyarugenge, Kigali" },
  { id: "gikondo", label: "Simba Supermarket Gikondo", addr: "Gikondo, Kicukiro, Kigali" },
  { id: "kanombe", label: "Simba Supermarket Kanombe", addr: "Kanombe, Kicukiro, Kigali" },
  { id: "kinyinya", label: "Simba Supermarket Kinyinya", addr: "Kinyinya, Gasabo, Kigali" },
  { id: "kibagabaga", label: "Simba Supermarket Kibagabaga", addr: "Kibagabaga, Gasabo, Kigali" },
  { id: "nyanza", label: "Simba Supermarket Nyanza", addr: "Nyanza, Southern Province" },
];

export const DEFAULT_BRANCH_ID = "remera";

export function getBranch(id: string | null | undefined): Branch {
  return BRANCHES.find(b => b.id === id) ?? BRANCHES[0];
}
