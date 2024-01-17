let imgPath     = 'assets/images/',
    diceConCls  = '.dice-container',
    diceRollArr = [],
    dices       = [
        { 'id': 1, 'count': 1, 'image': 'dice-01.svg' },
        { 'id': 2, 'count': 2, 'image': 'dice-02.svg' },
        { 'id': 3, 'count': 3, 'image': 'dice-03.svg' },
        { 'id': 4, 'count': 4, 'image': 'dice-04.svg' },
        { 'id': 5, 'count': 5, 'image': 'dice-05.svg' },
        { 'id': 6, 'count': 6, 'image': 'dice-06.svg' }
    ],
    rollResultsCounter = 0



$('.roll-dice').click(function() {
    let count = $(this).closest('.input-group').find('input').val()
    resetTotalCount();
    generateDiceContainers(count)
    setTimeout(function() {
        initRoll()
    }, 50)
});

$(document).on('click', '.reroll', function() {
    let key = $(this).data('id')
    initRoll(key)
    $('.reroll').remove(); // remove all reroll buttons
});

function resetTotalCount() {
    let totalContainer = $('.total-count')
    totalContainer.html('')
    totalContainer.removeClass('fill')
}

function generateDiceContainers(count) {
    let container = $('.main-container')
    container.html('')
    for (let i = 1; i <= count; i ++) {
        let html =  '<div class="dice-container position-relative">';
            html +=     '<div class="dice-img text-center"></div>';
            html +=     '<div class="dice-number text-center"></div>';
            html +=     '<div class="dice-action text-center"></div>';
            html += '</div>';
        container.append(html)
    }
}

function initRoll(key=false) {
    // Roll all dice.
    if (!key) {
        rollResultsCounter++; // update the results list counter
        let diceContainers = $(diceConCls)
        diceContainers.each(function(i, obj) {
            rollDiceAnimation($(obj))
        });
        // roll the dice after dice animation
        setTimeout(function() {
            diceContainers.each(function(i, obj) {
                rollDice($(obj))
            }).promise().done(function() {
                calculateTotal() // calculate total
                rerollSecondLowestDice()
            })
        }, 1000)
    } else {
        // reroll specific dice key
        let rerollBtn     = $('.reroll[data-id="' + key + '"]'),
            diceContainer = rerollBtn.closest('.dice-container')
        rollDiceAnimation(diceContainer)
        setTimeout(function() {
            rollDice(diceContainer)
            setTimeout(function() {
                calculateTotal() // calculate total
            }, 50)
        }, 1000)
    }
}

function rollDiceAnimation(container) {
    // add a rolling animation
    let imageContainer = container.find('.dice-img'),
        diceNumber = container.find('.dice-number')
    diceNumber.text('')
    imageContainer.addClass('rolling')
    imageContainer.html('')
}

function rollDice(container) {
    let minDiceKey    = 0,
        maxDiceKey    = dices.length - 1,
        diceImg       = container.find('.dice-img'),
        diceNumCon    = container.find('.dice-number'),
        randomKey     = Math.floor(Math.random() * (maxDiceKey - minDiceKey + 1) + minDiceKey),
        rolledDice    = dices[randomKey]
    // populate image
    diceImg.removeClass('rolling')
    diceImg.html('<img src="' + imgPath + rolledDice.image + '" />')
    diceNumCon.html(rolledDice.count)
}

function rerollBtn(key) {
    return '<button class="cbtn reroll" data-id="' + key + '">Reroll</button>'
}

function calculateTotal() {
    let diceContainers = $(diceConCls),
        totalArr       = [];
    diceContainers.each(function(i, obj) {
        let num = $(this).find('.dice-number').text()
        totalArr.push(parseInt(num))
    }).promise().done(
        function() {
            // remove the lowest number from the array
            totalSum = totalArr.slice(); // copy the array
            totalSum.splice(totalSum.indexOf(Math.min.apply(null, totalSum)), 1)
            let total = sumArr(totalSum),
                totalContainer = $('.total-count')
            totalContainer.addClass('fill')
            totalContainer.text(total)
            // update the results list
            // check if the specific result div exists for the rolled result
            console.log($(`#rolledResult${rollResultsCounter}`).length);
            if($(`#rolledResult${rollResultsCounter}`).length == 0) {
                // append the number to the results list
                let content = `<div id="rolledResult${rollResultsCounter}" class="result d-flex justify-content-center align-items-center">${total}</div>`
                $('.display-results').append(content);
            } else {
                // update the result
                $(`#rolledResult${rollResultsCounter}`).text(total);
            }
        }
    )
}

function rerollSecondLowestDice() {
    let diceContainers = $(diceConCls),
        totalArr       = [];
    diceContainers.each(function(i, obj) {
        let num = $(obj).find('.dice-number').text()
        totalArr.push(parseInt(num))
    }).promise().done(
        function() {
            // Sort the unique array in ascending order
            totalArr.sort(function(a, b) {
                return a - b
            })
            // The second lowest value will be at index 1
            let secondLowest = (totalArr[1]) ? totalArr[1] : totalArr[0] // else = rolled all the same numbers
            // add a reroll button to the second lowest value
            diceContainers.each(function(i, obj) {
                var num = $(obj).find('.dice-number').text();
                if (num == secondLowest) {
                    // add a reroll button
                    var diceActionCon = $(obj).find('.dice-action');
                    diceActionCon.html(rerollBtn(i+1))
                }
            })
        }
    )
}

function sumArr(arr) {
    var total = 0
    $.each(arr, function(i, num) {
        total += num
    })
    return total
}