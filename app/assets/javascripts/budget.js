var margin;
var x;
var y;
var xAxis;

margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("#chart_canvas").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



var init = function init() {

    x = d3.scale.linear()
        .range([0, width])

    y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .2);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

}

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
        return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span><br>" +
            "<strong>Value:</strong> <span style='color:red'>" + d.value+" millions</span>";
    })

svg.call(tip);

function displayBars(svg, dataset){

    xScale = x.domain(d3.extent(dataset, function(d) { return d.value; })).nice();
    yScale = y.domain(dataset.map(function(d) { return d.name; }));

    var svg_bar = svg.selectAll(".bar")
        .data(dataset).enter();


    var rect = svg_bar.append("rect")
        .classed('data', true)
        .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { return x(Math.min(0, d.value)); })
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
        .attr("height", y.rangeBand())
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);


    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height);

    var text = svg_bar.append("text")
        .classed('data', true)
        .attr("x", function(d) { return x(Math.min(0, d.value) + 0.5); })
        .attr("y", function(d) { return y(d.name)+ 18; })
        .style("stroke-width", 1)
        .style({"font-size":"12px","z-index":"999999999"})
        .style("text-anchor", "left")
        .text(function(d) { return d.name; });

    svg.selectAll(".bar")
        .data(dataset).transition()
        .attr("class", function(d) { return d.value < 0 ? "bar negative" : "bar positive"; })
        .attr("x", function(d) { return x(Math.min(0, d.value)); })
        .attr("y", function(d) { return y(d.name); })
        .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); });

    svg.selectAll(".data")
        .data(dataset).transition()
        .attr("x", function(d) { return x(Math.min(0, d.value) + 0.5); });


    svg.selectAll(".x").transition().call(xAxis);

    svg.selectAll(".y").selectAll("line").transition().attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height);


}


function type(d) {
    d.value = +d.value;
    return d;
}

function calculateAndShowData(){
    var data = [];
    for (var i=0;i < category_names_array.length;i++){
        graph_bar = {};
        var cat_name = category_names_array[i];
        var input_name = input_names_array[i];
        graph_bar['name'] = cat_name;
        amount = 0.0
        var class_to_target = "input."+input_name.split(' ').join('_')+"[type=text]"
        $(class_to_target).each(function () {
            amount = amount + parseInt(this.value / 1000000);
        });
        graph_bar['value'] = amount;
        data[i] = graph_bar;
    }

    init();
    displayBars(svg,data);
}

$(document).ready(function(){

    calculateAndShowData();

    $('.amount').on('focusout', function() {
        calculateAndShowData();
    });

});
