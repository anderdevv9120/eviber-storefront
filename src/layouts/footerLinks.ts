import type {
  IPublishedPolicyLink,
  IStoreSettings,
} from "@/@types/StoreContent.type";
import { PATH } from "@/constants/paths";

export const policyLinks = (policies: IPublishedPolicyLink[]) =>
  policies.map(({ slug, title }) => ({
    name: title,
    link: `${PATH.POLICY}/${slug}`,
  }));

export type SocialKey = keyof IStoreSettings["socials"];

export const socialLinks = (socials: IStoreSettings["socials"]) =>
  (["facebook", "instagram", "twitter"] as SocialKey[])
    .filter((key) => socials[key])
    .map((key) => ({ key, href: socials[key] }));
