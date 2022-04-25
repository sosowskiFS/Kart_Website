//Autocomplete stuff
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        let createdDivs = 0
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (createdDivs < 4 && arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                createdDivs += 1
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    //Run the player lookup
                    lookupPlayer();
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

//Fun fact this won't run on local files because CORS can go blow me
let rawPlayerData = ""
let rawMapData = ""
let rawSkinData = ""
let rawTimeData = ""
let playerData = []
let mapData = []
let skinData = []
let timeData = []

async function getPlayerData() {
    return fetch("https://onyomanya.github.io/data/Playerdata.txt").then(res => res.text()).then(text => { return text })
}
async function getMapData() {
    return fetch("https://onyomanya.github.io/data/Mapdata.txt").then(res => res.text()).then(text => { return text })
}
async function getSkinData() {
    return fetch("https://onyomanya.github.io/data/Skincounter.txt").then(res => res.text()).then(text => { return text })
}
async function getTimeData() {
    return fetch("https://onyomanya.github.io/data/Timerecords.txt").then(res => res.text()).then(text => { return text })
}
async function callPlayerData() {
    rawPlayerData = await this.getPlayerData();
    rawMapData = await this.getMapData();
    rawSkinData = await this.getSkinData();
    rawTimeData = await this.getTimeData();
    let autocompleteArray = [];

    //Initial data organization needs to happen in this function as this is the only place JS will wait for the above
    let playerDataStep1 = rawPlayerData.split(/\r?\n/);
    for (const t of playerDataStep1) {
        if (t.length > 0) {
            let pHolder = t.split(";")
            playerData.push(pHolder)
            autocompleteArray.push(pHolder[0])
        }
    }

    let mapDataStep1 = rawMapData.split(/\r?\n/);
    for (const t of mapDataStep1) {
        if (t.length > 0) {
            mapData.push(t.split(";"))
        }
    }

    let skinDataStep1 = rawSkinData.split(/\r?\n/);
    for (const t of skinDataStep1) {
        if (t.length > 0) {
            skinData.push(t.split(";"))
        }
    }

    let timeDataStep1 = rawTimeData.split(/\r?\n/);
    for (const t of timeDataStep1) {
        if (t.length > 0) {
            timeData.push(t.split(";"))
        }
    }

    applyPlayerData("Onyo");
    autocomplete(document.getElementById("playerSearch"), autocompleteArray);
}

function findKSRank(pName, type) {
    let cloneList = playerData
    let tIndex = -1
    switch (type.toLowerCase()) {
        case 'vanilla':
            tIndex = 10
            break;
        case 'juice':
            tIndex = 11
            break;
        case 'nitro':
            tIndex = 12
            break;
    }
    cloneList.sort(function (a, b) {
        return b[tIndex] - a[tIndex];
    });
    let posCounter = 1
    for (const p of cloneList) {
        if (pName.toLowerCase() == p[0].toLowerCase()) {
            return posCounter;
            break;
        }
        posCounter += 1;
    }

    return "N/A";
}

//https://www.w3schools.com/howto/howto_js_autocomplete.asp

function applyPlayerData(pName) {
    //Fill the example table here
    //For loop, check first element until desired key matches, copy data to everything.
    let found = false;
    for (const d of playerData) {
        if (d[0].toLowerCase() == pName.toLowerCase()) {
            $("#errMessage").css("display", "none");
            $("#playerSearch").val("")
            found = true;
            //Overview screen
            $("#pName").text(d[0]);
            $('#raceTotal').text(parseInt(d[1]).toLocaleString("en-US") + " Races")

            //Calculate percentage of gold/silver/bronze, round to nearest full percent, and fill the remainder to 100%
            let raceTotal = parseInt(d[1])
            let gold = parseInt(d[2])
            let silver = parseInt(d[8])
            let bronze = parseInt(d[9])
            let goldPer = Math.round((gold / raceTotal) * 100)
            let silverPer = Math.round((silver / raceTotal) * 100)
            let bronzePer = Math.round((bronze / raceTotal) * 100)
            let totalPer = Math.abs((goldPer + silverPer + bronzePer) - 100)

            $("#goldStat").text(gold.toLocaleString("en-US"))
            $("#silverStat").text(silver.toLocaleString("en-US"))
            $("#bronzeStat").text(bronze.toLocaleString("en-US"))

            $("#barGold").css("width", goldPer.toString() + "%")
            $("#barSilver").css("width", silverPer.toString() + "%")
            $("#barBronze").css("width", bronzePer.toString() + "%")
            $("#barTotal").css("width", totalPer.toString() + "%")

            $("#perGold").text(goldPer.toString() + "%")
            $("#perSilver").text(silverPer.toString() + "%")
            $("#perBronze").text(bronzePer.toString() + "%")

            $("#ksVanilla").text(d[10])
            $("#ksJuice").text(d[11])
            $("#ksNitro").text(d[12])

            $("#ksVanillaRank").text("Rank " + findKSRank(d[0], "vanilla"))
            $("#ksJuiceRank").text("Rank " + findKSRank(d[0], "juice"))
            $("#ksNitroRank").text("Rank " + findKSRank(d[0], "nitro"))

            //Detail screen
            $('#dRaces').text(parseInt(d[1]).toLocaleString("en-US"))
            $('#dRaces2').text(parseInt(d[1]).toLocaleString("en-US"))
            $("#dWins").text(gold.toLocaleString("en-US"))
            $("#dWins2").text(gold.toLocaleString("en-US"))
            let fullWinPer = ((gold / raceTotal) * 100).toFixed(2)
            $("#dWinPercent").text(fullWinPer.toString() + "%")
            $("#dWinPercent2").text(fullWinPer.toString() + "%")
            $("#dSecond").text(silver.toLocaleString("en-US"))
            $("#dSecond2").text(silver.toLocaleString("en-US"))
            $("#dThird").text(bronze.toLocaleString("en-US"))
            $("#dThird2").text(bronze.toLocaleString("en-US"))
            let podiumPer = (((gold / raceTotal) * 100) + ((silver / raceTotal) * 100) + ((bronze / raceTotal) * 100)).toFixed(2)
            $("#dPodium").text(podiumPer.toString() + "%")
            $("#dPodium2").text(podiumPer.toString() + "%")

            $("#dHits").text(d[3].toLocaleString("en-US"))
            $("#dHits2").text(d[3].toLocaleString("en-US"))
            $("#dSelf").text(d[4].toLocaleString("en-US"))
            $("#dSelf2").text(d[4].toLocaleString("en-US"))
            $("#dSpin").text(d[5].toLocaleString("en-US"))
            $("#dSpin2").text(d[5].toLocaleString("en-US"))
            $("#dExploded").text(d[6].toLocaleString("en-US"))
            $("#dExploded2").text(d[6].toLocaleString("en-US"))
            $("#dSquish").text(d[7].toLocaleString("en-US"))
            $("#dSquish2").text(d[7].toLocaleString("en-US"))

            break;
        }
    }

    if (!found) {
        $("#errMessage").css("display", "inline");
    }
}

function lookupPlayer() {
    let pName = $("#playerSearch").val()
    if (pName.length > 0) {
        applyPlayerData(pName);
    } else {
        $("#errMessage").css("display", "inline");
    }
}

$(document).ready(function () {
    callPlayerData()
})