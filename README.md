# DG_Obsidian_Functions


Functions can be run using the Dataview community plugin:
```dataviewjs
const a = dv.current().file.tasks;
await dv.view("_Functions/Time_Status", {data: a, ignore: ["taskname1","taskname2"], simplify: false, subtasks: true});
```

### Input
```
data:     taskObj[]  #mandatory
ignore:   string[]   #default []
simplify: bool       #default false
subtasks: int        #default all
```

### Features
- Ignore list
    - List of tasks to exclude.
- Simple name
    - Simplyfy the view by splitting all names on '-'.
    - F.x. "Task1" & "Task1 - meeting" would both show up as "Task1".
- Subtasks toggle
    - Give it a positive number depicting how many levels of subtasks it should show.
    - If 0 show only root-tasks, if no value all sub tasks will be includeded.


### Legacy mode:
The function also still supports simply giving it an array of tasknames.
```dataviewjs
const a = dv.current().file.tasks.map(e=>e.text);
const b = dv.current().file.tasks.filter(e=>e.parent == null).map(e=>e.text);

await dv.view("_Functions/Time_Status", a);
```
