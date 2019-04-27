// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var color1 = ['#8C0335', '#1C4259', '#63D8F2', '#F28A2E', '#F2CCB6'];
var color3 = ['#C5C8D9', '#8090A6', '#C8D98B', '#F2C1B6', '#A68686'];
var color4 = ['#8C3041', '#BDD9F2', '#D5E5F2', '#8A8C56', '#8C7558'];
var color5 = ['#A2CDF2', '#30698C', '#B6DBF2', '#748C5D', '#98A633'];
var color6 = ['#173F5F', '#20639B', '#3CAEA3', '#F6D55C', '#ED553B'];
var color7 = ['#C06C86', '#6D5C7C', '#325D7F', '#F9B294', '#F47081'];
var color8 = ['#FFF5ED', '#EEE4DD', '#89837F', '#CEC5BE', '#EE6060'];


// append the svg object to the body of the page
var svg = d3.select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Convert CSV into an array of objects
d3.csv("./data/Swissvote.csv").then(function (data) {

    //nest data
    var nestedData = Array.from(d3.nest()
        .key(function (d) {
            return d.jahrzehnt;
        })
        .key(function (d) {
            return d.d1e1;
        })
        .rollup(function (v) {
            return v.length;
        })
        .entries(data))

    console.log("nesteddata")
    console.log(nestedData)


    //map values of nested data into a onedimensional array of objects
    var dataToBeStacked = []
    nestedData.forEach(d => {
        var temp = {}
        d.values.forEach(e => {
            temp[e.key] = e.value;
        })
        dataToBeStacked.push(temp);
    });

    console.log("dataToBestacked")
    console.log(dataToBeStacked)

    //crate default object
    var defaultObject = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, decade: ""}

    //fill missing values
    dataToBeStacked.forEach(function (a, index) {
        //add missing categories and initilize with zero
        for (prop in defaultObject) {
            if (!hasOwnProperty.call(a, prop)) {
                console.log("object " + index)
                console.log("proberty " + prop + " is missing")
                dataToBeStacked[index][prop] = 0
            }
        }
        //add decade and set value
        dataToBeStacked[index].decade = nestedData[index].key.substr(0, nestedData[index].key.length - 7)
    })

    console.log("datatobestacked after filling");
    console.log(dataToBeStacked)

    const keys = d3.set(data.map(d => d.d1e1)).values();
    const yearDomain = d3.extent(data, d => String(d.jahrzehnt).substr(0, d.jahrzehnt.length - 7));
    const countDomain = [0, 100];


// Add X axis
    var xAxis = d3.scaleLinear()
        .domain(yearDomain)
        .range([0, width])
        .nice()
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xAxis).tickPadding(5).tickFormat(d3.format("d")));

// Add Y axis
    var yAxis = d3.scaleLinear()
        .domain(countDomain)
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(yAxis).tickPadding(2));

// color palette
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(color1)

    var stackedData = d3.stack()
        .offset(d3.stackOffsetNone)
        .keys(keys)
        (dataToBeStacked)

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .enter()
        .append("path")
        .style("fill", function (d) {
            return color(d.key);
        })
        .attr("d", d3.area()
            .curve(d3.curveNatural)
            .x(function (d, i) {
                return xAxis(d.data.decade);
            })
            .y0(function (d) {
                return yAxis(d[0]);
            })
            .y1(function (d) {
                return yAxis(d[1]);
            })
        )

})