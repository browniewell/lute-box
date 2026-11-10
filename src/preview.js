// Builds the dev-only art preview (preview.html): a table with one row per
// base type and one column per modifier, plus some stacks.
import { CONFIG } from './config.js';
import { lootName } from './names.js';
import { renderLute } from './render-lute.js';

const plainGroups = Object.fromEntries(
  CONFIG.groups.map((group) => [group.id, group.options.find((o) => o.isDefault).id]),
);

// Each column is a set of changes from a plain lute.
const columns = [{ label: 'Plain', groups: {}, modifiers: [] }];
for (const group of CONFIG.groups) {
  for (const option of group.options.filter((o) => !o.isDefault)) {
    columns.push({ label: option.name, groups: { [group.id]: option.id }, modifiers: [] });
  }
}
for (const modifier of CONFIG.independentModifiers) {
  columns.push({ label: modifier.name, groups: {}, modifiers: [modifier.id] });
}
columns.push(
  { label: 'Stack', groups: { size: 'jumbo' }, modifiers: ['upside-down', 'negative'] },
  { label: 'Stack', groups: { color: 'azure' }, modifiers: ['holographic', 'gilded'] },
  { label: 'Everything', groups: { color: 'violet', size: 'tiny' }, modifiers: CONFIG.independentModifiers.map((m) => m.id) },
);

const table = document.createElement('table');
const header = table.createTHead().insertRow();
header.append(cell('th', 'Base type'), ...columns.map((column) => cell('th', column.label)));

const body = table.createTBody();
for (const baseType of CONFIG.baseTypes) {
  const row = body.insertRow();
  row.append(cell('th', baseType.name));
  for (const column of columns) {
    const roll = { baseType: baseType.id, groups: { ...plainGroups, ...column.groups }, modifiers: column.modifiers };
    const td = document.createElement('td');
    const art = document.createElement('div');
    td.append(art);
    // A stack naming an option the config no longer has shows a dash
    // instead of breaking the whole page.
    try {
      renderLute(art, roll);
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = lootName(roll);
      td.append(name);
    } catch {
      td.textContent = '—';
    }
    row.append(td);
  }
}
document.getElementById('preview').append(table);

function cell(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}
