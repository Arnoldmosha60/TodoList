//jshint esversion:6

module.exports = getDate;

function getDate() {
    let today = new Date();
    // var theDay = today.getDay();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    let day = today.toLocaleString("en-US", options);
    return day;
}
