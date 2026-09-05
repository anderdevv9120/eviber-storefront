export interface IAddress {
  name: string;
  country: string;
  city: string;
  district?: string;
  ward: string;
  specificAddress: string;
  phoneNumber: string;
  zip: string;
  primary: boolean;
  _id: string | undefined;
}
