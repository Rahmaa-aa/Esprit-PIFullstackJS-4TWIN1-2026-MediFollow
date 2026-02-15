import { SettingState, SettingDefaultState } from "./interface";

// Initial Setting State
export const initialState: SettingState = {
  saveLocal: "sessionStorage",
  storeKey: "xraysetting-react",
  setting: {
    app_name: {
      value: "XRay",
    },
    theme_scheme_direction: {
      value: "ltr",
    },
    theme_scheme: {
      value: "light",
    },
    theme_style_appearance: {
      value: ["theme-default"],
    },

    theme_color: {
      colors: {},
      value: "default",
    },
    theme_transition: {
      value: null,
    },
    theme_font_size: {
      value: "theme-fs-sm",
    },
    page_layout: {
      value: "container-fluid",
    },
    header_navbar: {
      value: "default",
    },
    header_banner: {
      value: "default",
    },
    sidebar_color: {
      value: "sidebar-color",
    },
    sidebar_type: {
      value: ["sidebar-hover", "sidebar-mini"],
    },
    sidebar_menu_style: {
      value: "navs-pill-all",
    },
    footer: {
      value: "default",
    },
  },
};

// Default Setting State
export const defaultState: SettingDefaultState = {
  saveLocal: "sessionStorage",
  storeKey: "xraysetting-react",
  setting: {
    app_name: {
      target: '[data-setting="app_name"]',
      choices: [],
      type: "text",
      value: "XRay",
    },
    theme_scheme_direction: {
      target: "html",
      choices: ["ltr", "rtl"],
      type: "layout_design",
      value: "ltr",
    },
    theme_scheme: {
      target: "body",
      choices: ["light", "dark", "auto"],
      type: "layout_design",
      value: "light",
    },
    theme_style_appearance: {
      target: "body",
      choices: ["theme-default", "theme-flat", "theme-bordered", "theme-sharp"],
      type: "layout_design",
      value: ["theme-default"],
    },

    theme_color: {
      target: "html",
      choices: [
        "default",
        "color-1",
        "color-2",
        "color-3",
        "color-4",
        "color-5",
      ],
      type: "default",
      colors: {},
      value: "default",
    },
    theme_transition: {
      target: "body",
      choices: ["theme-without-animation", "theme-with-animation"],
      type: "layout_design",
      value: null,
    },
    theme_font_size: {
      target: "html",
      choices: ["theme-fs-sm", "theme-fs-md", "theme-fs-lg"],
      type: "layout_design",
      value: "theme-fs-sm",
    },
    page_layout: {
      target: "#page_layout",
      choices: ["container", "container-fluid"],
      type: "layout_design",
      value: "container-fluid",
    },
    header_navbar: {
      target: ".iq-navbar",
      choices: [
        "default",
        "fixed",
        "navs-sticky",
        "nav-glass",
        "navs-transparent",
        "boxed",
        "hidden",
      ],
      type: "layout_design",
      value: "default",
    },
    // card_style: {
    //   target: "body",
    //   choices: ["card-default", "card-glass", "card-transparent"],
    //   type: "layout_design",
    //   value: "card-default",
    // },
    header_banner: {
      target: ".iq-banner",
      choices: ["default", "navs-bg-color", "hide"],
      type: "layout_design",
      value: "default",
    },
    sidebar_color: {
      target: '[data-toggle="main-sidebar"]',
      choices: [
        "sidebar-white",
        "sidebar-dark",
        "sidebar-color",
        "sidebar-color",
      ],
      type: "layout_design",
      value: "sidebar-default",
    },
    sidebar_type: {
      target: '[data-toggle="main-sidebar"]',
      choices: ["sidebar-hover", "sidebar-mini", "sidebar-soft"],
      type: "layout_design",
      value: ["sidebar-hover", "sidebar-mini"],
    },
    // sidebar_show: {
    //   target: '[data-toggle="main-sidebar"]',
    //   choices: ["sidebar-none"],
    //   type: "defaultChecked",
    //   value: [],
    // },
    // navbar_show: {
    //   target: '[data-toggle="main-navbar"]',
    //   choices: ["iq-navbar-none"],
    //   type: "defaultChecked",
    //   value: [],
    // },
    sidebar_menu_style: {
      target: '[data-toggle="main-sidebar"]',
      choices: [
        "navs-rounded",
        "navs-rounded-all",
        "navs-pill",
        "navs-pill-all",
      ],
      type: "layout_design",
      value: "navs-rounded-all",
    },
    footer: {
      target: ".footer",
      choices: ["sticky", "default"],
      type: "layout_design",
      value: "default",
    },
  },
};
