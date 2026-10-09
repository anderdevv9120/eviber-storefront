import type { IStoreSettings, PolicySlug } from "@/@types/StoreContent.type";
import { PATH } from "@/constants/paths";
import { POLICY_TITLES } from "@/constants/storeContent";

export const policyLinks = (slugs: PolicySlug[]) =>
  slugs.map((slug) => ({
    name: POLICY_TITLES[slug],
    link: `${PATH.POLICY}/${slug}`,
  }));

export type SocialKey = keyof IStoreSettings["socials"];

export const socialLinks = (socials: IStoreSettings["socials"]) =>
  (["facebook", "instagram", "twitter"] as SocialKey[])
    .filter((key) => socials[key])
    .map((key) => ({ key, href: socials[key] }));
