import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'ZWX小站',
  subtitle: '随便写写',
  lang: 'zh_CN',
  themeHue: 250,
  banner: {
    enable: true,
    src: 'assets/images/demo-banner.png',
  },
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: 'GitHub',
      url: 'https://github.com/zwxzxz/zwxzxz.github.io',
      external: true,
    },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/demo-avatar.png',
  name: 'zwx',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  links: [
    {
      name: 'Twitter',
      icon: 'fa6-brands:twitter',
      url: 'https://twitter.com',
    },
    {
      name: 'Steam',
      icon: 'fa6-brands:steam',
      url: 'https://store.steampowered.com',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/zwxzxz',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: false,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
