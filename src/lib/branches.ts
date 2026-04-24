export interface Branch {
  id: string;
  label: string;
  addr: string;
  phone?: string;
}

export const BRANCHES: Branch[] = [
  {
    id: "centenary",
    label: "Simba Centenary",
    addr: "Centenary House, Ground Floor, Kiyovu, Nyarugenge, Kigali",
  },
  {
    id: "gishushu",
    label: "Simba Gishushu",
    addr: "KN 5 Rd, Gishushu, Gasabo, Kigali",
  },
  {
    id: "kimironko",
    label: "Simba Kimironko",
    addr: "Kimironko, Gasabo, Kigali",
  },
  {
    id: "kicukiro",
    label: "Simba Kicukiro",
    addr: "Kicukiro District, Kigali",
    phone: "+250 787 787 595",
  },
  {
    id: "kigaliheights",
    label: "Simba Kigali Heights",
    addr: "KG 541 St, Gasabo, Kigali",
    phone: "+250 252 570 566",
  },
  {
    id: "utc",
    label: "Simba UTC",
    addr: "UTC Building, 5th Floor, KN 34 St, Kiyovu, Nyarugenge, Kigali",
  },
  {
    id: "gacuriro",
    label: "Simba Gacuriro",
    addr: "Simba Center, KN 4 Ave / KG 14 Ave, Gacuriro, Gasabo, Kigali",
  },
  {
    id: "gikondo",
    label: "Simba Gikondo",
    addr: "Gikondo, Kicukiro, Kigali",
  },
  {
    id: "sonatube",
    label: "Simba Sonatube",
    addr: "Silverback Mall, B1 Floor, KK 15 Rd, Kigali",
  },
  {
    id: "kisimenti",
    label: "Simba Kisimenti",
    addr: "KN 4 Ave, Kisimenti, Kigali",
  },
  {
    id: "rebero",
    label: "Simba Rebero",
    addr: "Rebero, Kicukiro, Kigali",
  },
];

export const DEFAULT_BRANCH_ID = "centenary";

export function getBranch(id: string | null | undefined): Branch {
  return BRANCHES.find(b => b.id === id) ?? BRANCHES[0];
}
