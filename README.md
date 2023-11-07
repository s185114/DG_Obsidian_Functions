# DG_Obsidian_Functions


Functions can be run using the Dataview community plugin:

```dataviewjs
const a = dv.current().file.tasks.map(e=>e.text);
const b = dv.current().file.tasks.filter(e=>e.parent == null).map(e=>e.text);

await dv.view("_Functions/Time_Status", a);
```
