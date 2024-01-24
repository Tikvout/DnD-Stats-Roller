let imgPath     = 'assets/images/', // path to images
    diceConCls  = '.dice-container', // dice container
    genMessage  = '.general-message', // general message container class
    diceRollArr = [],
    dices       = [
        { 'id': 1, 'count': 1, 'image': 'dice-01.svg' },
        { 'id': 2, 'count': 2, 'image': 'dice-02.svg' },
        { 'id': 3, 'count': 3, 'image': 'dice-03.svg' },
        { 'id': 4, 'count': 4, 'image': 'dice-04.svg' },
        { 'id': 5, 'count': 5, 'image': 'dice-05.svg' },
        { 'id': 6, 'count': 6, 'image': 'dice-06.svg' }
    ],
    rollResultsCounter = 0,
    lowestRoll,
    secondLowestRoll,
    totalRolled,
    preRerollTotal


$('.roll-dice').click(function() {
    let count = $(this).closest('.input-group').find('input').val()
    resetGeneralMessage() // reset general message
    resetTotalCount() // reset total count
    generateDiceContainers(count)
    setTimeout(function() {
        initRoll()
    }, 50)
})

$(document).on('click', '.reroll', function() {
    let key = $(this).data('id')
    initRoll(key)
    $('.reroll').remove() // remove all reroll buttons
})

function resetTotalCount() {
    let totalContainer = $('.total-count')
    totalContainer.html('')
    totalContainer.removeClass('fill')
}

function generateDiceContainers(count) {
    let container = $('.main-container')
    container.html('')
    for (let i = 1; i <= count; i ++) {
        let html = `<div class="dice-container position-relative">
            <div class="dice-img text-center"></div>
            <div class="dice-number text-center"></div>
            <div class="dice-action text-center"></div>
        </div>`
        container.append(html)
    }
}

function initRoll(key=false) {
    // Roll all dice.
    if (!key) {
        rollResultsCounter++; // update the results list counter
        preRerollTotal = 0; // reset pre-rerolled value
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
                generateRerollSecondLowestDice()
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
                calculateTotal(true) // calculate total
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

function calculateTotal($rerolledTotal=false) {
    let diceContainers = $(diceConCls),
        totalArr       = []
    diceContainers.each(function(i, obj) {
        let num = $(this).find('.dice-number').text()
        totalArr.push(parseInt(num))
    }).promise().done(
        function() {
            // remove the lowest number from the array
            totalSum = totalArr.slice() // copy the array
            totalSum.splice(totalSum.indexOf(Math.min.apply(null, totalSum)), 1)
            // assign the previous roll if a reroll was initiated
            if ($rerolledTotal)
                preRerollTotal = totalRolled
            // set the new total rolled value
            totalRolled = sumArr(totalSum)
            let totalContainer = $('.total-count')
            totalContainer.addClass('fill')
            totalContainer.text(totalRolled)
            // update the results list
            // check if the specific result div exists for the rolled result
            if($(`#rolledResult${rollResultsCounter}Number`).length == 0) {
                // append the number to the results list
                let content = `<div class="d-flex align-items-center mb-2">
                    <div id="rolledResult${rollResultsCounter}Number" class="result d-flex justify-content-center align-items-center">${totalRolled}</div>
                    <div id="rolledResult${rollResultsCounter}Message"></div>
                </div>`
                $('.display-results').append(content);
            } else {
                let rollDifference     = (preRerollTotal) ? totalRolled - preRerollTotal : 0,
                    rollDiffCls        = (rollDifference > 0) ? 'success' : (rollDifference < 0 ? 'danger' : 'standard'),
                    totalRolledMessage = `<span class="result-message result-message-${rollDiffCls}">${(rollDifference > 0 ? `+` : ``)}${rollDifference}</span>`
                // update the result
                $(`#rolledResult${rollResultsCounter}Number`).text(totalRolled);
                $(`#rolledResult${rollResultsCounter}Message`).html(totalRolledMessage);
            }
            displayGeneralMessage();
        }
    )
}

function generateRerollSecondLowestDice() {
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
            // lowest roll
            lowestRoll = totalArr[0];
            // The second lowest value will be at index 1
            secondLowestRoll = (totalArr[1]) ? totalArr[1] : totalArr[0] // else = rolled all the same numbers
            // add a reroll button to the second lowest value
            diceContainers.each(function(i, obj) {
                var num = $(obj).find('.dice-number').text();
                if (num == secondLowestRoll) {
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
function displayGeneralMessage() {
    let msg = ``
    // get the total rolled and base a message from that
    // 6 or less
    if (totalRolled <= 5)
        msg += `Might as well reroll from scratch eh?`
    else if (totalRolled <= 6)
        msg += `Holy cow that's a rough roll. The odds of this happening is 1 in 17,136 (0.00584%).`
    else if (totalRolled <= 8)
        msg += `Guess we found your dump stat value.`
    else if (totalRolled <= 9)
        msg += `Might as well have been an 8, Seems like you can't even minmax your bad luck.`
    else if (totalRolled <= 10)
        msg += `The most vanilla roll imaginable.`
    else if (totalRolled <= 11)
        msg += `One the border of being something and nothing, just like my life...`
    else if (totalRolled <= 12)
        msg += `IT'S SOMETHING!!!!`
    else if (totalRolled <= 13)
        msg += `Lucky number 13.`
    else if (totalRolled <= 14)
        msg += `+2 Baby! It's a good stat.`
    else if (totalRolled <= 15)
        msg += `Might want to start thinking about a +1 improvement somewhere.`
    else if (totalRolled <= 16)
        msg += `Might have to start thinking about playing a serious character.`
    else if (totalRolled <= 17)
        msg += `Goodbye feat, I'll just play around it.`
    else
        msg += `You cheated! There's no way.`
    // check if the reroll value is the same as the initial rolled value
    if (preRerollTotal && preRerollTotal == totalRolled)
        msg = `Wow! The exact same value after a reroll? It must be fate.`
    // display the message
    $(genMessage).html(`<div class="roll-msg">${msg}</div>`);
}
function resetGeneralMessage() {
    $(genMessage).html('');
}