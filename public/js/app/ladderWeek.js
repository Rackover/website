/*
 https://api.faforever.com/leaderboards/ladder1v1?page[size]=50&page[number]=1
 */
 
const categories = JSON.parse(rankingCategories);

var getPage = function(category, pageSize, id) {
  $("#navigation-first-"+category).addClass("disabled");
  $("#navigation-previous-"+category).addClass("disabled");
  $("#navigation-next-"+category).addClass("disabled");
  $("#navigation-last-"+category).addClass("disabled");
  if (currentPage[category] < lastPage[category]){
      $("#navigation-next-"+category).removeClass("disabled");
      $("#navigation-last-"+category).removeClass("disabled");
  }
  if (currentPage[category] > 1){
      $("#navigation-first-"+category).removeClass("disabled");
      $("#navigation-previous-"+category).removeClass("disabled");
  }
  const elementId = "players"+category;
  renderPage(category, document.getElementById(elementId), id); 
};

var renderPage = function (category, element, playerId) {
    
  const list = categories[category].data;

  removeAllChildElements(element);
  
  for(var i = (currentPage[category]-1)*pageSize; i < Math.min(pageSize*currentPage[category], list.length); i++) {
    var player = list[i];
    var tr = document.createElement("tr");

    /*
    // Only show player with matching id when player_id is given.
    if (playerId && playerId != player.id) {
        tr.className = 'hidden';
    }
    */
    
    tr.setAttribute("id", "tr" + i);
    element.appendChild(tr);
    
    // #
    var rank = document.createElement("td");
    tr.appendChild(rank);
    rank.innerHTML = (i+1);
    
    // Player
    var name = document.createElement("td");
    tr.appendChild(name);
    name.innerHTML = player.name;
    
    // Rating
    var rating = document.createElement("td");
    tr.appendChild(rating);
    rating.innerHTML = player.rating;
    
    // Score
    var points = document.createElement("td");
    tr.appendChild(points);
    points.innerHTML = player.points;
    
    // W/L/D
    var wld = document.createElement("td");
    tr.appendChild(wld);
    wld.innerHTML = player.wld.w+"/"+player.wld.l+"/"+player.wld.d;
    
    
    // Time played
    var timeplayed = document.createElement("td");
    tr.appendChild(timeplayed);
    timeplayed.innerHTML = (moment(player.secondsPlayed*1000).hours()-1)+"h "+moment(player.secondsPlayed*1000).minutes()+"m "+moment(player.secondsPlayed*1000).seconds()+"s";
  }
};

/* Utilities */

var removeAllChildElements = function (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};

/* Page Onclick */

for (let catName in categories){
     $("#navigation-previous-"+catName).click( function() {
      if (currentPage[catName] === 1) {
        return;
      }

      currentPage[catName]--;
      getPage(catName, currentPage[catName], pageSize);
    });

     $("#navigation-next-"+catName).click( function() {
      if (currentPage[catName] === lastPage[catName]) {
        return;
      }

      currentPage[catName]++;
      getPage(catName, currentPage[catName], pageSize);
    });
    
    $("#navigation-first-"+catName).click( function() {
      currentPage[catName] = 1;
      getPage(catName, currentPage[catName], pageSize);
    });

    $("#navigation-last-"+catName).click( function() {
      currentPage[catName] = lastPage[catName];
      getPage(catName, currentPage[catName], pageSize);
    });
}
/*
$("#forget-search").click( function() {
  init();

  if (chart.getInstance()) {
    chart.getInstance().destroy();
    $(".stats").width(0);
  }
});

var searchbar = document.getElementById("searchbar");

// Show label but insert value into the input:
new Awesomplete(searchbar, {
  list: JSON.parse(members)
});

searchbar.addEventListener('awesomplete-select', function(e){
  var text = e.text;
  currentPage = text.value.page;
  getPage(text.value.page, 100, text.value.id);
});

searchbar.addEventListener('awesomplete-selectcomplete', function(e){
  var text = e.text;
  $("#searchbar").val(text.label);
});
*/

$(document).on('click', '.player', (function(){
  var labels = [], dataset = [];
  var id = $(this).data('id');
  var name = $(this).data('name');
  var pastYear = moment().subtract(1, 'years').unix();

  let featuredMod = ratingType === 'ladder1v1' ? 'ladder1v1' : 'faf';
  $.ajax({
		url: apiURL + '/data/gamePlayerStats?filter=player.id==' + id + ';game.featuredMod.technicalName==' + featuredMod + '&fields[gamePlayerStats]=afterMean,afterDeviation,scoreTime',
    success: function(result) {
      $.each(result.data, function(stats){
        // Only get information for past year for chart...
				
        if (unixTime > pastYear) {
          var date = moment(stats.attributes.scoreTime).format('MMM D, YYYY');
          var mean = stats.attributes.afterMean;
          var deviation = stats.attributes.afterDeviation;
          labels.push(date);
          dataset.push(Math.round(mean - 3 * deviation));
        }
      });

      var data = {
        title: {
          text: name + ' Rating over the Past Year',
          x: -20 //center
        },
        xAxis: {
          categories: labels
        },
        yAxis: {
          title: {
            text: 'Rating'
          },
          plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
          }]
        },
        series: [{
          name: name + '\'s Rating',
          data: dataset
        }]
      };

      chart.createChart(data);
      $("#stats").animatedScroll();
    }
  });
}));

var chart = {
  chart: '',
  getInstance: function() {
    return this.chart;
  },
  createChart: function(data) {
    this.chart = Highcharts.chart("stats", data);
  }
};

/* Init */
let currentPage = [];
let lastPage = [];
const pageSize = 10;

const init = function() {
    for (const category in categories){
        const catName = categories[category].categoryName;
        currentPage[category] = 1;
        lastPage[category] = Math.ceil(categories[category].data.length/pageSize);
        getPage(category, pageSize);
    }
};

init();
