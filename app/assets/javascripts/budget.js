var margin;
var x;
var y;
var xAxis;

margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 460 - margin.left - margin.right,
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
            if ($(this).parents('.popover').length == 0) {
                amount = amount + parseInt(this.value / 1000000);
            }
        });
        graph_bar['value'] = amount;
        data[i] = graph_bar;
    }

    init();
    displayBars(svg,data);
}

$(document).ready(function(){

    var left_old_id = "";
    var left_current_id = "";
    var right_old_id = "";
    var right_current_id = "";

    var old_id = "";
    var current_id = "";

    $('.popover-markup>.popover-link').popover({
        html: true,
        container: 'body',
        placement: function (context, source) {
            var position = $(source).position();

            if (position.top < 180){
                return "bottom";
            }else{
                return "right";
            }
        },
        title: function () {
            return $(this).parent().find('.head').html();
        },
        content: function () {
            return $(this).parent().find('.content').html();
        }
    }).on('click', function(e){

        var input_id = $(this).attr("id");


        var isRightColumn = (input_id.indexOf("right") > -1)

        if (isRightColumn == true){
            right_old_id = right_current_id
            right_current_id = input_id;

            old_id = right_old_id;
            current_id = right_current_id;
        }else{
            left_old_id = left_current_id
            left_current_id = input_id;

            old_id = left_old_id;
            current_id = left_current_id;
        }

        if(old_id != "" && old_id != current_id) {
            $('#'+old_id).popover('hide')
        }

        if (old_id != current_id){
            $(this).popover('show');
        }
    });

    $('body').on('focusout', '.amount', function() {
        var edited_val = $(this).val()
        var this_id = $(this).attr('id');
        $('.popover-markup').find('#'+this_id).attr('value', edited_val);

    });

    calculateAndShowData();

    $('body').on('focusout', function() {
        var total_left = 0;
        var total_right = 0;

        $('.amount-left').each(function() {
            if ($(this).parents('.popover').length == 0) {
                total_left += parseInt(this.value);
            }
        });

        $('.amount-right').each(function() {
            if ($(this).parents('.popover').length == 0) {
                total_right += parseInt(this.value);
            }
        });

        var diff_left = init_programs - total_left;
        var diff_right = total_right - init_main;

        if (diff_left > 0){
            // Funds are being transferred from the left column. But how much in relation to the numbers in right column?
            if (diff_right < diff_left){
                // There is still some funds to transfer from the left column
                $('#amountTransferId').html((diff_left - diff_right).toString() + " need to be distributed.");
                $('#amountTransferId').removeClass().addClass("to_allocate");
            }else if (diff_right == diff_left){
                // We're all good
                $('#amountTransferId').html("ok");
                $('#amountTransferId').removeClass().addClass("balance");
            }else{
                // Too much has been allocated to the right column. More needs to be taken out of the left column.
                $('#amountTransferId').html("Too much was allocated on the 3 main programs. Please take " + (diff_right - diff_left).toString() + " from the other programs.");
                $('#amountTransferId').removeClass().addClass("to_putback");
            }
        }else if (diff_left < 0){
            // Funds are being moved around on the left column.
            $('#amountTransferId').html("Please re-allocate " + (Math.abs(diff_left)).toString() + " to the left programs.");
            $('#amountTransferId').removeClass().addClass("to_movearound");
        }else{
            $('#amountTransferId').html("ok");
            $('#amountTransferId').removeClass().addClass("balance");
        }

        calculateAndShowData();
    });

});


/*$(window).scroll(function(){
    $('#graphId').toggleClass('scrolling', $(window).scrollTop() > $('#midColId').offset().top);

    //can be rewritten long form as:
   /* var scrollPosition, headerOffset, isScrolling;
    scrollPosition = $(window).scrollTop();
    headerOffset = $('#header').offset().top;
    isScrolling = scrollPosition > headerOffset;
    $('#header-inner').toggleClass('scrolling', isScrolling);
});*/