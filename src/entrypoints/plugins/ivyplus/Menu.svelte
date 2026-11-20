<script lang="ts">
  import Toggle from "@/entrypoints/popup/components/inputs/Toggle.svelte";
  import type { Settings } from ".";
  import { DEFAULT_SUBJECTS, type Subject } from "./classColours";

  let { settings }: { settings: Settings } = $props();

  let newName = $state("");
  let newCode = $state("");
  let newColour = $state("#6283c2");

  let subjects = $derived(settings.classColours.state.subjects);

  function save(updated: Subject[]) {
    settings.classColours.state.subjects = updated;
  }

  // hex colours
  const isHex = (text: string) => /^#[0-9a-f]{6}$/i.test(text.trim());

  function addSubject() {
    const name = newName.trim();
    const code = newCode.trim().toUpperCase();
    if (!name || !code || !isHex(newColour)) return;
    save([...subjects, { name, code, colour: newColour.trim() }]);
    newName = "";
    newCode = "";
  }

  function setColour(index: number, colour: string) {
    save(subjects.map((s, i) => (i === index ? { ...s, colour } : s)));
  }

  function removeSubject(index: number) {
    save(subjects.filter((_, i) => i !== index));
  }
</script>
<Toggle
  text="Better Hidden Profile picture"
  size="small"
  id="ivyplusCustomProfile"
  bind:checked={settings.customProfile.state.toggle} />
<!-- Class colours-->
<Toggle
  text="Subject colours"
  description="Colours your timetable and calendar by subject. (subject box is the name e.g. HPE, code is the code e.g.HP for 10HP6)"
  size="small"
  id="ivyplusClassColours"
  bind:checked={settings.customClassColours.state.toggle} />

<ul class="my-2 flex flex-col gap-1">
  {#each subjects as subject, i (subject.code + i)}
    <li class="flex items-center gap-2">
            <span class="h-5 w-5 shrink-0 rounded-full" style="background-color: {subject.colour}"></span>
      <input
        class="w-24 rounded-lg bg-ctp-surface0 p-1 text-sm text-ctp-text"
        value={subject.colour}
        oninput={(e) => {
          if (isHex(e.currentTarget.value)) setColour(i, e.currentTarget.value.trim());
        }} />
      <span class="flex-1">{subject.name}</span>
      <span class="text-sm text-ctp-subtext0">{subject.code}</span>
      <button class="text-ctp-red" onclick={() => removeSubject(i)}>Remove</button>
    </li>
  {/each}
</ul>

<form
  class="flex items-center gap-2"
  onsubmit={(e) => {
    e.preventDefault();
    addSubject();
  }}>
  <input class="min-w-0 flex-1 rounded-lg bg-ctp-surface0 p-2 text-ctp-text" placeholder="Subject" bind:value={newName} />
  <input class="w-16 rounded-lg bg-ctp-surface0 p-2 text-ctp-text" placeholder="Code" bind:value={newCode} />
  <input class="w-24 rounded-lg bg-ctp-surface0 p-2 text-ctp-text" placeholder="#89b4fa" bind:value={newColour} />
  <button type="submit" class="rounded-lg bg-(--ctp-accent) px-3 py-2 text-ctp-crust">Add</button>
</form>

<button class="mt-2 text-sm text-ctp-subtext0 underline" onclick={() => save(DEFAULT_SUBJECTS)}>Reset to defaults</button>
