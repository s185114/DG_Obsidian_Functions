sumTable(input);


function sumTable(input) {
  const { data, ignore, simplify, subtasks } = processInput(input);
  const tasks = mapTasks(data.values); //.values is to remove the proxy layer around the array

  let [validTaskNames, summary] = prepData(tasks, ignore, simplify);
  return constructDvTable(validTaskNames, summary);
}

//#region main functions

function processInput(input) {
  if (Array.isArray(input)) {
    return { data: input, ignore: [], simplify: false, subtasks: true };
  } else {
    const { data, ignore = [], simplify = false, subtasks = true } = input;
    const filteredData = subtasks ? data : data.filter(e => e.parent == null);
    return {
      data: filteredData.map(e => e.text),
      ignore,
      simplify,
      subtasks
    };
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

    if (!acc[task.name]) acc[task.name] = { dur: 0, check: false };
    acc[task.name].dur += dur;
    acc[task.name].check = acc[task.name].check || task.isTime;

    return acc;
  }, {});

  const validTaskNames = Object.keys(summary).filter(taskName =>
    !ignore.includes(taskName) && !Number.isNaN(summary[taskName].dur)
  );
  return [validTaskNames, summary];
}

function constructDvTable(validTaskNames, summary) {
  let header = ["Task", "Duration", "Time"];
  let body = validTaskNames.map(taskName => {
    const { dur, check } = summary[taskName];
    const duration = formatDuration(dur);
    const checkbox = `<input type="checkbox" ${check ? 'checked' : ''}>`;
    return [taskName, duration, checkbox];
  });
  const total = (time = false) => formatDuration(findTotal(validTaskNames, summary, time));
  body.push(["Total", total(), total(true)]);
  return dv.table(header, body);
}

//#endregion
//#region support functions

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

function findTotal(validKeys, dict, time = false) {
  const f = e => !time || e.check ? e.dur : 0
  return validKeys.map(key => f(dict[key])).reduce((a, b) => a + b, 0);
}

//#endregion