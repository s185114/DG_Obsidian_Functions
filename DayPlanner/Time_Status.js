sumTable(input);


function sumTable(input) {
  const { data, ignore, simplify, subtasks } = processInput(input);
  const tasks = mapTasks(data.values); //.values is to remove the proxy layer around the array

  const summary = prepData(tasks, ignore, simplify);
  return constructDvTable(summary);
}

//#region main functions

function processInput(input) {
  if (Array.isArray(input)) {
    return { data: input, ignore: [], simplify: false, subtasks: Infinity };
  } else {
    const copy = { ...input, subtasks: input.subtasks ?? Infinity };
    copy.data = copy.data
      .filter(e => filterSubTasks(e, copy.data) <= copy.subtasks)
      .map(e => e.text);
    return copy;
  }
}

function mapTasks(taskArray) {
  return taskArray.map((taskString, index) => {
    const q = /(\d{2}:\d{2})(\s?-\s?(\d{2}:\d{2}))?/;
    const [_1, time, _2, time2, task] = taskString.split(q);

    const name = task?.replace('⏰', '').trim();
    const isTime = taskString.includes('⏰');
    const endTime = time2 ? time2 :
      taskArray[index + 1]?.split(q)[1] ?? time;
    return {
      name,
      startTime: time,
      endTime,
      isTime,
    };
  });
}

function prepData(tasks, ignore = [], simplify = false) {
  if (simplify) tasks.forEach(e => e.name = e.name.split('-')[0].trim());

  let summary = tasks.reduce((acc, task) => {
    const dur = calculateDuration(task.startTime, task.endTime);

    if (ignore.includes(task.name) || Number.isNaN(dur)) return acc;

    if (!acc[task.name]) acc[task.name] = { dur: 0, check: false };
    acc[task.name].dur += dur;
    acc[task.name].check = acc[task.name].check || task.isTime;

    return acc;
  }, {});

  return summary;
}

function constructDvTable(summary) {
  let header = ["Task", "Duration", "Time"];
  let body = Object.entries(summary)
    .map(([taskName, { dur, check }]) => {
      const duration = formatDuration(dur);
      const checkbox = `<input type="checkbox" ${check ? 'checked' : ''}>`;
      return [taskName, duration, checkbox];
    });
  const total = (time = false) => formatDuration(findTotal(summary, time));
  body.push(["Total", total(), total(true)]);
  return dv.table(header, body);
}

//#endregion
//#region support functions

function filterSubTasks(task, tasks, depth = 0) {
  if (task?.parent == null) return depth;
  const parentTask = tasks.find(parent => parent.line === task.parent);
  return filterSubTasks(parentTask, tasks, depth + 1);
}

function calculateDuration(startTime, endTime) {
  var startDate = new Date(`1970-01-01T${startTime}Z`);
  var endDate = new Date(`1970-01-01T${endTime}Z`);
  if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
  return (endDate - startDate) / (60 * 1000); // Convert milliseconds to minutes
}

function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function findTotal(dict, time = false) {
  const f = e => !time || e.check ? e.dur : 0
  return Object.values(dict).map(val => f(val)).reduce((a, b) => a + b, 0);
}

//#endregion