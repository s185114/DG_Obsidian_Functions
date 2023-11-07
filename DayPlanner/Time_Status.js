sumTable(input);


function sumTable(data) {
	const tasks = mapTasks(data)
	let summary = {};
	tasks.forEach(task => {
	        const dur = calculateDuration(task.startTime, task.endTime);
	        if (!summary[task.name]) summary[task.name] = [0, false];
	        summary[task.name][0] += dur;
	        summary[task.name][1] = summary[task.name][1] || task.isTime;
	    });
	
	// Prepare data for dv.table
	let header = ["Task", "Duration", "Time"];
	let body = [];
	for (const taskName in summary) {
		if (taskName === "fri") continue;
		const [dur, clock] = summary[taskName];
		const duration = formatDuration(dur);
		const checkbox = `<input type="checkbox" ${clock 
		? 'checked' : ''}>`;
		body.push([taskName, duration, checkbox]);
	}
	body.push(["Total", formatDuration(findTotal(summary)), ""]);
	return dv.table(header, body);
}

function mapTasks(taskArray) {
    return taskArray.map((taskString, index) => {
        const [time, ...taskNameParts] = taskString.split(' ');
        const name = taskNameParts.join(' ').replace('⏰','');
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
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    let durationMinutes = endTotalMinutes - startTotalMinutes;
    while (durationMinutes < 0) {
        durationMinutes += 24 * 60;
    }
    return durationMinutes;
}

function formatDuration(durationMinutes) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes}m`;
}

function findTotal(dict, done = false) {
	let sum = 0;
	
	for (const key in dict) {
		sum += dict[key][0];
	}
	return sum;
}