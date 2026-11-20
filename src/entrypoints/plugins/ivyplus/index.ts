import { browser } from "#imports";
import { injectInlineStyles, uninjectInlineStyles } from "@/utils";
import { Plugin } from "@/utils/plugin";
import type { Toggle } from "@/utils/storage";
import type { StorageState } from "@/utils/storage/state.svelte";
import { applyClassColours, DEFAULT_SUBJECTS, removeClassColours, type Subject } from "./classColours";

const ID = "ivyplus";
const PROFILE_STYLE_ID = `plugin-${ID}-profile`;


export type Settings = {
  customProfile: StorageState<Toggle>;
  customClassColours: StorageState<Toggle>;
  classColours: StorageState<{ subjects: Subject[] }>;
};

export default new Plugin<Settings>(
  {
    id: ID,
    name: "Ivy+",
    description: "Adds things Ivy needed.",
  },
  true,
  {
    // default values for each setting
    customProfile: { toggle: true },
    customClassColours: { toggle: true },
    classColours: { subjects: DEFAULT_SUBJECTS },
  },
  // inject
  async (settings) => {
        if ((await settings.customProfile.get()).toggle) {
      injectProfilePicture();
    }

    if ((await settings.customClassColours.get()).toggle) {
      const { subjects } = await settings.classColours.get();
      applyClassColours(subjects);
    }
  },
  // stop inject thing
  () => {
    removeClassColours();
    uninjectInlineStyles(PROFILE_STYLE_ID);
  },
);

function injectProfilePicture() {
  // @ts-expect-error
  const url = browser.runtime.getURL("profile.png");

  injectInlineStyles(
    `img[alt="View Profile"], .account-menu {
      padding: 12px 17px !important;
      content: url("${url}");
      border-radius: 30px !important;
    }`,
    PROFILE_STYLE_ID,
  );
}

