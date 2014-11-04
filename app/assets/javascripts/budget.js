$(document).ready(function(){

    var left_old_id = "";
    var left_current_id = "";
    var right_old_id = "";
    var right_current_id = "";

    var old_id = "";
    var current_id = "";

    var transfer_amount = 0.0;
    var added_amount = 0.0;
    var origin_id = "";
    var target_id = "";
    var priority_origin = "";
    var program_title = "";
    var popover_index = "";
    var origin_item_id = 0;
    var target_item_id = 0;

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

    // Events to trigger, after we get out of the left-hand side column
    $('body').on('focusout', '.amount-left', function() {
        var edited_val = $(this).val()
        origin_id = $(this).attr('id');
        $('.popover-markup').find('#'+origin_id).attr('value', edited_val);
        transfer_amount = parseFloat(amounts_hash[origin_id]).toFixed(3) - parseFloat(edited_val).toFixed(3);
        transfer_amount = transfer_amount.toFixed(3);
        popover_index = origin_id.split('_')[1].split('-')[0];
        origin_item_id = origin_id.split('_')[1].split('-')[2];
        priority_origin = $('#Priority-'+popover_index+'-title').text();

        if (transfer_amount > 0.000){
            // Amount is being transferred from a field, we need to deactivate the other fields.
            Object.keys(amounts_hash).forEach(function (amount_key) {
                var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
                if (amount_key != origin_id && !is_a_main_program && !$("#"+amount_key).disabled){
                    $("."+amount_key).prop('disabled', true);
                }
                if (is_a_main_program){
                    $("."+amount_key).prop('disabled', false);
                }
            })

            program_title = $("#"+origin_id).siblings("span").html();

            $(".alert_amount_message").each(function() {
                $(this).html(parseFloat(transfer_amount) + " million(s) have been taken from '"+program_title+"' ("+priority_origin+"). Distribute it to a right-hand side program.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-info");
            });
        }else if (transfer_amount < 0.000){
            $('#alert_section_id').removeClass('hide');

            $("#"+origin_id).val(amounts_hash[origin_id]);
            $('.popover-markup').find('#'+origin_id).attr('value', amounts_hash[origin_id]);

            program_title = $("#"+origin_id).siblings("span").html();
            // Funds are being moved around on the left column.
            $(".alert_amount_message").each(function() {
                $(this).html("Funds cannot be redistributed within the left column. The '"+program_title+"' program ("+priority_origin+") has been reset.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-warning");
            });

            $(".popover-link").popover('hide');

        }

    });

    // Events to trigger, after we get out of the right-hand side column
    $('body').on('focusout', '.amount-right', function() {
        var edited_val = $(this).val()
        target_id = $(this).attr('id');
        target_item_id = target_id.split('_')[1].split('-')[2];
        var target_index = target_id.split('_')[1].split('-')[0];
        $('.popover-markup').find('#'+target_id).attr('value', edited_val);
        added_amount = parseFloat(edited_val).toFixed(3) - parseFloat(amounts_hash[target_id]).toFixed(3);
        added_amount = added_amount.toFixed(3);

        if ((added_amount > 0.0 && transfer_amount <= added_amount) || added_amount < 0.0){
            if (added_amount > 0.0){
                if (transfer_amount == added_amount){
                    // The amount was added correctly. We record the change in the hash object, and re-enable the fields.
                    amounts_hash[origin_id] = amounts_hash[origin_id] - transfer_amount;
                    amounts_hash[target_id] = amounts_hash[target_id] + added_amount;

                    // We add this information to the tracked_changes hash.
                    tracked_changes[origin_item_id]['amount_taken'] = parseFloat(tracked_changes[origin_item_id]['amount_taken']) + parseFloat(added_amount);
                    if (!(target_id in tracked_changes[origin_item_id]['target'])){
                        tracked_changes[origin_item_id]['target'][target_item_id] = parseFloat(added_amount);
                    }else{
                        tracked_changes[origin_item_id]['target'][target_item_id] = parseFloat(tracked_changes[origin_item_id]['target'][target_item_id]) + parseFloat(added_amount);
                    }

                    $(".alert_amount_message").each(function() {
                        $(this).html("The funds have been distributed correctly.");
                    });

                    $(".alert").each(function() {
                     $(this).removeClass().addClass("alert alert-success");
                    });

                }else if (transfer_amount < added_amount){
                    // Too much was added in the right-hand side column.
                    // We need to reset the amounts on both side.
                    $("#"+origin_id).val(amounts_hash[origin_id]);
                    $("#"+target_id).val(amounts_hash[target_id]);
                    $('.popover-markup').find('#'+origin_id).attr('value', amounts_hash[origin_id]);
                    $('.popover-markup').find('#'+target_id).attr('value', amounts_hash[target_id]);

                    $(".alert_amount_message").each(function() {
                        $(this).html("Too much was allocated on this main program. The 2 lastly modified amounts were reset.");
                    });

                    $(".alert").each(function() {
                        $(this).removeClass().addClass("alert alert-danger");
                    });

                }

                $(".popover-link").popover('hide');

            }else if (added_amount < 0.0){
                // Funds were taken out from a right-hand column field, instead of being added. We raise an error, and reset the fields with the initial amounts.
                $("#"+origin_id).val(amounts_hash[origin_id]);
                $("#"+target_id).val(amounts_hash[target_id]);
                $('.popover-markup').find('#'+origin_id).attr('value', amounts_hash[origin_id]);
                $('.popover-markup').find('#'+target_id).attr('value', amounts_hash[target_id]);

                // There's been an error: we reset the amounts that were in transfer, and we disable fields back to their initial state (ie disable all right hand side fields)
                $(".popover-link").popover('hide');

                Object.keys(amounts_hash).forEach(function (amount_key) {
                    var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
                    if (amount_key != origin_id && !is_a_main_program && !$("#"+amount_key).disabled){
                        $("."+amount_key).prop('disabled', false);
                    }
                    if (is_a_main_program){
                        $("."+amount_key).prop('disabled', true);
                    }
                })

                // Displaying the error message
                $(".alert_amount_message").each(function() {
                    $(this).html("You can't take money out of a right-hand side column, while transferring.");
                });

                $(".alert").each(function() {
                    $(this).removeClass().addClass("alert alert-danger");
                });
            }
            // We re-enable the fields, and disable the right-hand side fields.
            Object.keys(amounts_hash).forEach(function (amount_key) {
                var is_a_main_program = (amount_key.indexOf("23") > -1) || (amount_key.indexOf("24") > -1) || (amount_key.indexOf("25") > -1);
                if (!is_a_main_program){
                    $("."+amount_key).prop("disabled", false);
                }else{
                    $("."+amount_key).prop("disabled", true);
                }
            })
        }else if (added_amount > 0.0 && added_amount <= transfer_amount){
            // Funds have been allocated to a program on the right-hand side column, but there is still some that remains to allocate.

            amounts_hash[origin_id] = amounts_hash[origin_id] - added_amount;
            amounts_hash[target_id] = amounts_hash[target_id] + added_amount;

            // We add this information to the tracked_changes hash.
            tracked_changes[origin_item_id]['amount_taken'] = parseFloat(tracked_changes[origin_item_id]['amount_taken']) + parseFloat(added_amount);
            if (!(target_id in tracked_changes[origin_item_id]['target'])){
                tracked_changes[origin_item_id]['target'][target_item_id] = parseFloat(added_amount);
            }else{
                tracked_changes[origin_item_id]['target'][target_item_id] = parseFloat(tracked_changes[origin_item_id]['target'][target_item_id]) + parseFloat(added_amount);
            }

            transfer_amount = transfer_amount - added_amount;

            $(".alert_amount_message").each(function() {
                $(this).html((transfer_amount).toString() + " million(s) from '"+program_title+"' ("+priority_origin+") are still to be allocated. Distribute it to a right-hand side program.");
            });

            $(".alert").each(function() {
                $(this).removeClass().addClass("alert alert-info");
            });
        }

    });

    // Events to fire (POST ajax call...) when clicking on 'Show conclusions'
    $('.submit_budget_form').click(function () {
        var test = {};
        test["abc"] = "1";

        var posting = $.post( "/ka/budget/process_budget", {data: tracked_changes});
        posting .done(function( statements ) {
            if (statements.length > 0){
                var html_for_popup = '<ul>';
                $.each(statements, function(index) {
                    html_for_popup = html_for_popup + '<li>'+statements[index]+'</li>'
                });
                html_for_popup = html_for_popup + '</ul>'
                $('#trigger-popup-body').html(html_for_popup);
            }

            var options = {
                "backdrop" : "static",
                "show" : true
            }

            $('#myModal').modal(options);
        });
    });

});

