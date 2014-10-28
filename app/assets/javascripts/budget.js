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

/*var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function(d) {
        return "<strong>Name:</strong> <span style='color:red'>" + d.name + "</span><br>" +
            "<strong>Value:</strong> <span style='color:red'>" + d.value+" millions</span>";
    })

svg.call(tip);*/

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

    var transfer_amount = 0.000;
    var added_amount = 0.000;
    var origin_id = "";
    var target_id = "";


    $('.nav-tabs').on('click', '.tab-label', function (e) {
        $('.popover-link').each(function () {
            //the 'is' for buttons that trigger popups
            //the 'has' for icons within a button that triggers a popup
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
            }
        });
    });

    $('.popover-markup>.popover-link').popover({
        html: true,
        container: 'body',
        placement: function (context, source) {
            var position = $(source).position();

            if (position.top < 320){
                return "bottom";
            }else{
                return "top";
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

        var isRightColumn = (input_id.indexOf("right") > -1);

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
            $('#'+old_id).popover('hide');
        }

        if (old_id != current_id){
            $(this).popover('show');
        }

    }).on("show.bs.popover", function(){ $(this).data("bs.popover").tip().css("max-width", "540px"); });

    $('body').on('focusout', '.amount-left', function() {
        var edited_val = $(this).val()
        var this_id = $(this).attr('id');
        $('.popover-markup').find('#'+this_id).attr('value', edited_val);

        // If we focus out of a left sub-program, we first need to disable all other left-hand side inputs.

        // First, we define the id of the input where the change was operated. We also get its new amount.
        Object.keys(amounts_hash).forEach(function (amount_key) {
            var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
            if (!is_a_main_program && amounts_hash[amount_key] != $("#"+amount_key).val()){
                transfer_amount = parseFloat(amounts_hash[amount_key]) - parseFloat($("#"+amount_key).val());
                origin_id = amount_key;
            }
        })

        if (transfer_amount != 0.000){
            // Amount is being transferred from a field, we need to deactivate the other fields.
            Object.keys(amounts_hash).forEach(function (amount_key) {
                var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
                if (amount_key != origin_id && !is_a_main_program && !$("#"+amount_key).disabled){
                    $("#"+amount_key).prop('disabled', true);
                }
            })

            var program_title = $("#"+origin_id).siblings("span").html();

            $(".alert_amount_message").each(function() {
                $(this).html((transfer_amount).toString() + " million(s) have been taken from '"+program_title+"'. Distribute it to a right-hand side program.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-info");
            });
        }

        // In order to see the disabled fields which are in the same popover as the modified text field,
        // we need to close and re-open this popover.
        var popover_index = origin_id.split('_')[1].split('-')[0];
        $("#link-popover-"+popover_index).popover('hide');
    });

    $('body').on('focusout', '.amount-right', function() {
        var edited_val = $(this).val()
        var this_id = $(this).attr('id');
        $('.popover-markup').find('#'+this_id).attr('value', edited_val);

        // At this point, the amount has been assigned to a field on the right column.
        // If the correct amount has been transferred, we need to re-enable text fields.
        Object.keys(amounts_hash).forEach(function (amount_key) {
            var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
            if (is_a_main_program && amounts_hash[amount_key] != $("#"+amount_key).val()){
                added_amount = parseFloat($("#"+amount_key).val()) - parseFloat(amounts_hash[amount_key]);
                target_id = amount_key;
            }
        })

        if ((added_amount > 0.0 && transfer_amount <= added_amount)|| added_amount < 0.0){
            if (added_amount > 0.0){
                if (transfer_amount == added_amount){
                    // The amount was added correctly. We record the change in the hash object, and re-enable the fields.
                    amounts_hash[origin_id] = amounts_hash[origin_id] - transfer_amount;
                    amounts_hash[target_id] = amounts_hash[target_id] + added_amount;
                }else if (transfer_amount < added_amount){
                    // Too much was added in the right-hand side column.
                    // We need to reset the amounts on both side.
                    $("#"+origin_id).val(amounts_hash[origin_id]);
                    $("#"+target_id).val(amounts_hash[target_id]);
                    $('.popover-markup').find('#'+origin_id).attr('value', amounts_hash[origin_id]);
                    $('.popover-markup').find('#'+target_id).attr('value', amounts_hash[target_id]);

                    var popover_index = origin_id.split('_')[1].split('-')[0];
                    $("#link-popover-"+popover_index).popover('hide');
                    popover_index = target_id.split('_')[1].split('-')[0];
                    $("#link-popover-"+popover_index).popover('hide');
                    alert("test");

                    $(".alert_amount_message").each(function() {
                        $(this).html("Too much was allocated on this main program. The 2 lastly modified amounts were reset.");
                    });

                    $(".alert").each(function() {
                        $(this).removeClass().addClass("alert alert-danger");
                    });

                }
            }else if (added_amount < 0.0){
                // Funds were taken out from a right-hand column field, instead of being added. We raise an error, and reset the fields with the initial amounts.
                $("#"+origin_id).val(amounts_hash[origin_id]);
                $("#"+target_id).val(amounts_hash[target_id]);
                $('.popover-markup').find('#'+origin_id).attr('value', amounts_hash[origin_id]);
                $('.popover-markup').find('#'+target_id).attr('value', amounts_hash[target_id]);

                var popover_index = origin_id.split('_')[1].split('-')[0];
                $("#link-popover-"+popover_index).popover('hide');
                popover_index = target_id.split('_')[1].split('-')[0];
                $("#link-popover-"+popover_index).popover('hide');
            }
            // We re-enable the fields.
            Object.keys(amounts_hash).forEach(function (amount_key) {
                var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
                if (!is_a_main_program){
                    $("#"+amount_key).removeAttr('disabled');
                }
            })
        }

    });

    // When we focus out of a field, what notification message to display?
    $('body').on('focusout', function() {
        var total_left = 0.000;
        var total_right = 0.000;

        $('.amount-left', '#agriculture').each(function() {
            if ($(this).parents('.popover').length == 0) {
                total_left += parseFloat(this.value);
            }
        });

        $('.amount-right').each(function() {
            if ($(this).parents('.popover').length == 0) {
                total_right += parseFloat(this.value);
            }
        });

        var diff_left = (init_programs - total_left).toFixed(3);
        var diff_right = (total_right - init_main).toFixed(3);

        if (diff_left > 0){
            $('#alert_section_id').removeClass('hide');
            // Funds are being transferred from the left column. But how much in relation to the numbers in right column?
            if (diff_right < diff_left){
                // There is still some funds to transfer from the left column
                /*$(".alert_amount_message").each(function() {
                    $(this).html((diff_left - diff_right).toString() + " million(s) need to be distributed.");
                });

                $(".alert").each(function() {
                    $(this).removeClass().addClass("alert alert-info");
                });*/

            }else if (diff_right == diff_left){
                // We're all good
                /*$(".alert_amount_message").each(function() {
                    $(this).html("The funds have been distributed correctly.");
                });*/

                /*$(".alert").each(function() {
                    $(this).removeClass().addClass("alert alert-success");
                });*/
            }else{
                // Too much has been allocated to the right column. More needs to be taken out of the left column.
                $(".alert_amount_message").each(function() {
                    $(this).html("Too much was allocated on the 3 main programs. Please take " + (diff_right - diff_left).toString() + " million(s) from the left programs.");
                });

                $(".alert").each(function() {
                    $(this).removeClass().addClass("alert alert-danger");
                });
            }
        }else if (diff_left < 0){
            $('#alert_section_id').removeClass('hide');
            // Funds are being moved around on the left column.
            $(".alert_amount_message").each(function() {
                $(this).html("Please re-allocate " + (Math.abs(diff_left)).toString() + " million(s) to the left programs.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-warning");
            });
        }else if (diff_right > diff_left){
            // Too much has been allocated to the right column. More needs to be taken out of the left column.
            $(".alert_amount_message").each(function() {
                $(this).html("Too much was allocated on the 3 main programs. Please take " + (diff_right - diff_left).toString() + " million(s) from the other programs.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-danger");
            });
        }else{
            /*$('#alert_section_id').removeClass('hide');
            // We're all good
            $(".alert_amount_message").each(function() {
                $(this).html("The funds have been distributed correctly.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-dismissable alert-success");
            });*/
        }

        //calculateAndShowData();
    });

});

