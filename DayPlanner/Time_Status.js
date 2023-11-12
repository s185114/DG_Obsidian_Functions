sumTable(input);


function sumTable(input) {
  const isSimple = Array.isArray(input);
	const tasks = isSimple ? mapTasks(input) : mapTasks(input.data);
  const unwantedTasks = isSimple ? [] : input.ignore ?? [];
  const simplify = isSimple ? false : input.simplify ?? false;
  
  if (simplify) tasks.forEach(e=>e.name = e.name.split('-')[0].trim())
	let summary = prepData(tasks);
  const validTaskNames = Object.keys(summary).filter(taskName => 
    !unwantedTasks.contains(taskName) && !Number.isNaN(summary[taskName][0])
  );

	return constructDvTable(validTaskNames, summary);
}

function prepData(tasks) {
    let summary = {};
    tasks.forEach(task => {
        const dur = calculateDuration(task.startTime, task.endTime);
        if (!summary[task.name]) summary[task.name] = [0, false];
        summary[task.name][0] += dur;
        summary[task.name][1] = summary[task.name][1] || task.isTime;
    });
    return summary;
}

function constructDvTable(validTaskNames, summary) {
  let header = ["Task", "Duration", "Time"];
  let body = validTaskNames.map(taskName => {
    const [dur, clock] = summary[taskName];
    const duration = formatDuration(dur);
    const checkbox = `<input type="checkbox" ${clock 
    ? 'checked' : ''}>`;
    return [taskName, duration, checkbox];
  });
  body.push(["Total", formatDuration(findTotal(validTaskNames, summary)), formatDuration(findTotal(validTaskNames, summary, true))]);
  return dv.table(header, body);
}

function mapTasks(taskArray) {
    return taskArray.map((taskString, index) => {
        const [time, ...taskNameParts] = taskString.split(' ');
        const name = taskNameParts.join(' ').replace('⏰','').trim();
        const isTime = taskString.includes('⏰');
        const endTime = index < taskArray.length - 1 
        ? taskArray[index + 1].split(' ')[0] : time;
        return {
            name,
            startTime: time,
            endTime,
            isTime,
        };
    });
}

function calculateDuration(startTime, endTime) {
  var startDate = new Date('1970-01-01T' + startTime + 'Z');
  var endDate = new Date('1970-01-01T' + endTime + 'Z');
  if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);
  return (endDate - startDate) / (60 * 1000); // Convert milliseconds to minutes
}

function formatDuration(durationMinutes) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
}

function findTotal(validKeys, dict, time = false) {
  const f = e => !time ? e[0] : e[1] ? e[0] : 0
	return validKeys.map(key => f(dict[key])).reduce(((a,b)=>a+b), 0);
}