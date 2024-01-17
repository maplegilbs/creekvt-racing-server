//formattingTime for display with Current Conditions section

function formatDateTime(inputTime) {
    inputTime = new Date(inputTime)
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];
    let dow = weekdays[inputTime.getDay()];
    let monthString = months[inputTime.getMonth()]
    let day = inputTime.getDate();
    if (day < 10) { day = "0" + day.toString() }
    let month = inputTime.getMonth();
    month++
    if (month < 10) { month = "0" + month.toString() }
    let year = inputTime.getFullYear();
    let hour24 = inputTime.getHours() > 9 ? inputTime.getHours() : inputTime.getHours().toString().padStart(2 ,'0');
    let hour = inputTime.getHours();
    let amPM = "am";
    if (hour24 == 12) { amPM = "pm" }
    if (hour24 > 12) { hour = hour24 - 12; amPM = "pm" }
    let minute = inputTime.getMinutes();
    if (minute < 10) { minute = "0" + minute.toString() }
    return (
        {
            dow: dow,
            month: month,
            monthString: monthString,
            day: day,
            year: year,
            date: `${month}/${day}`,
            time: `${hour}:${minute}`,
            time24Hr: `${hour24}:${minute}`,
            amPm: amPM,
            fullDate: `${monthString} ${day}, ${year}`,
            htmlDateTime: `${year}-${month}-${day}T${hour24}:${minute}`,
            htmlDate: `${year}-${month}-${day}`,
            inputTime: inputTime
        }
    )
}

function convertTime (inputTime) {
    let date = new Date();
    date.setHours(inputTime.slice(0,2))
    date.setMinutes(inputTime.slice(3,5))
    let outputTime = `${formatDateTime(date).time} ${formatDateTime(date).amPm}`
    return outputTime;
}

function convertTimeToCompare (inputTime) {
    let date = new Date();
    date.setHours(inputTime.slice(0,2))
    date.setMinutes(inputTime.slice(3,5))
    return date;
}

function stringTimeToSeconds (timeString) {
    let timeArray = timeString.split(":").reverse()
    let timeInSeconds = timeArray.reduce((accum, value, index) => {
        let curValInSeconds = Number(value) * 60 ** index
        accum += curValInSeconds
        return accum
    }, 0)
    return timeInSeconds
}

module.exports = {formatDateTime, convertTime, convertTimeToCompare, stringTimeToSeconds}