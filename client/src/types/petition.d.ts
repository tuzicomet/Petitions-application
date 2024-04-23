// type containing all fields from the server's Petition and PetitionFull types
type PetitionFull = {
    petitionId: number;
    title: string;
    categoryId: number;
    creationDate: string;
    ownerId: number;
    ownerFirstName: string;
    ownerLastName: string;
    numberOfSupporters: number;
    description: string;
    moneyRaised: number;
    supportTiers: SupportTier[];
};

// type containing all fields from the server's SupportTier and supportTierPost types
type SupportTier = {
    supportTierId: number;
    title: string;
    description: string;
    cost: number;
};