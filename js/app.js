var mobile = mobile || {};

mobile.panelHead = jQuery("#panel-head");
mobile.panelSub = jQuery("#panel-sub");
mobile.arrPanelData = jQuery(".panel-data");
mobile.dataCharts = jQuery(".data-charts");
mobile.dataListItems = jQuery(".data-list").find("li");
mobile.panelWrap = jQuery(".panel-wrap");
mobile.dataWrap = jQuery(".data-wrap");

mobile.currentFocus = null;

mobile.blnSmallScrn = false;

 if ($(window).width() < 800) {
    mobile.blnSmallScrn = true;
}

mobile.setPanelInfo = function(data) {
  
  
  if (data === null) {
    mobile.panelHead.empty();
    mobile.panelSub.empty();
    mobile.dataCharts.removeClass("show");
    mobile.arrPanelData.eq(0).addClass("hidden");
    mobile.dataListItems.empty();
  }
  
  else {
    mobile.panelWrap.eq(0).show();
    mobile.dataCharts.addClass("show");
   
    mobile.panelHead.text(data.full_name);
   
    
    mobile.panelSub.text(data.state);
    mobile.panelSub.show();
    

    // var otherPct = data.AmIndPct + data.AsianPct + data.NatHawPct + data.SomeOtherRacePct + data.TwoOrMorePct;
    
    mobile.dataListItems.eq(0).html("<span class='prop-label'>White: </span>" + mobile.calcPercent(data.WPct));
    mobile.dataListItems.eq(1).html("<span class='prop-label'>Black: </span>" + mobile.calcPercent(data.BPct));
    mobile.dataListItems.eq(2).html("<span class='prop-label'>Other: </span>" + mobile.calcPercent(data.OPct));
    mobile.dataListItems.eq(3).html("<span class='prop-label'>Hispanic: </span>" + mobile.calcPercent(data.HPct));
    mobile.dataListItems.eq(4).html("<span class='prop-label'>Population: </span>" + mobile.numberWithCommas(data.Pop2010));

    
      
  }
};

mobile.getSimilarCounties = function(data) {

  var keys = ["F", "S", "T", "F2", "F3"];
  var matches = [];
  for (var i = 0; i < keys.length; i++) {
    var fips = data[keys[i]];
    var match = mobile.lookup(mobile.data, "FIPS", fips);

    
    matches.push(match);
  }

  mobile.renderSimilarCounties(matches);

  
};

mobile.renderSimilarCounties = function(arrayCounties) {
  
  var $countyList = $(".county-list");

  $countyList.empty();

  for (var i = 0; i < arrayCounties.length; i++) {
    var county = arrayCounties[i];

    var itemTemplate = "<li class='county-item' data-fips='"+ county.FIPS + "'>" + county.CTY + ", " + county.ST + "</li>";

    $countyList.eq(0).append(itemTemplate);

    
  }

  $(".county-item").on("click", function() {
    Analytics.click("Related County Clicked");
    var $this = $(this);
    var fips = $this.data("fips");
    var newCounty = mobile.lookup(mobile.data, "FIPS", fips);
    // var newCounty = _.find(mobile.data, function(entry) { return entry.FIPS == fips; });
    mobile.setPanelInfo(newCounty);
    window.scrollTo(0, 0);
      
    });

  

};

mobile.calcPercent = function(num) {
  return Math.round(num * 1000) / 10 + "%";
};

mobile.numberWithCommas = function(x) {
  if (!x) {
    return "";
  }
  else {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }
};

mobile.drawChart = function(prop) {

  if (prop !== null) {
    var chartData = mobile.createChartArray(prop, "CTY"),
        chartData2 = mobile.createChartArray(prop, "STATE");
    
    
    $el = $(".data-charts");
    $el.empty();

    var width = $el.width();
    var ratio = 16/9;
    var height = width / ratio;
    var padding = width * 0.1;

    var margin = {
      top: padding,
      left: padding,
      right: padding,
      bottom: padding + 30
    };

    var legendR = 5;

    var x = d3.time.scale()
      .range([padding, width - padding]);

    var y = d3.scale.linear()
        .range([height - margin.bottom, padding]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d3.time.format('%Y'))
      .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
      .x(function(d) { return x(new Date(d.year, 0, 1)); })
      .y(function(d) { return y(d.index); });
    
    var svg = d3.select(".data-charts").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", " #E6E6E6");


    x.domain(d3.extent(chartData, function(d) { return new Date(d.year, 0, 1);  }));
    y.domain(mobile.calcExtent(chartData, chartData2, "index"));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ", 0)")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");

    svg.append("path")
        .datum(chartData)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "#1B9CFA");

    svg.append("path")
        .datum(chartData2)
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "#8D8F91");

    var indexState = chartData2[chartData2.length - 1].index;
    var indexCounty = chartData[chartData.length - 1].index;



    var tipHeight;
    var tipSize;
    var tipWidth;
    if (mobile.blnSmallScrn) {
      tipHeight = 20;
      tipWidth = 26.66667;
      tipSize = 12;
    }  

    else {
      tipHeight = 30;
      tipWidth = 40;
      tipSize = 16;
    }


    var tip = svg.append("g")
      .attr("transform", function() {
          if (indexCounty > indexState) {
           return "translate(" + (width - margin.right - 15) + ", " + (y(indexState) + tipHeight) + ")";
          }
          else {
            return "translate(" + (width - margin.right - 15) + ", " + (y(indexState)-tipHeight/2) + ")";
          }
        });
    
    

    tip.append("rect")
        .attr("width", tipWidth)
        .attr("height",  tipHeight)
        .attr("fill", "#8D8F91")
         .attr("x", (-tipWidth/4))
        .attr("y", (-tipHeight/1.5))
        .attr("rx", 8)
        .attr("ry", 8);

    tip.append("text")
        .text(indexState)
        .attr("fill", "#FFFFFF")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", tipSize);
    

    var tip2 = svg.append("g")
        
        .attr("transform", function() {
          if (indexCounty > indexState) {
            return "translate(" + (width - margin.right - 15) + ", " + (y(indexCounty)-tipHeight/2) + ")";
          }
          else {
            return "translate(" + (width - margin.right - 15) + ", " + (y(indexCounty) + tipHeight) + ")";
          }
        });

    tip2.append("rect")
        .attr("width", tipWidth)
        .attr("height",  tipHeight)
        .attr("fill", "#1B9CFA")
        .attr("x", (-tipWidth/4))
        .attr("y", (-tipHeight/1.5))
        .attr("rx", 8)
        .attr("ry", 8);

    tip2.append("text")
        .text(indexCounty)
        .attr("fill", "#FFFFFF")
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", tipSize);
        


    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + padding + "," +  (height - margin.bottom/2) + ")");

    legend.append("circle")
        .attr("r", legendR)
        .attr("cx", 0)
        .attr("cy", 10)
        .attr("fill", "#1B9CFA");

    legend.append("text")
        .attr("fill", "#1B9CFA")
        .attr("class", "key-text")
        .text("County Diversity Index")
        .attr("transform", "translate(" + (legendR*2.5 ) + ", " + (legendR*2.8) + ")" );

    legend.append("circle")
        .attr("r", legendR)
        .attr("cx", 150)
        .attr("cy", 10)
        .attr("fill", "#8D8F91");

    legend.append("text")
        .attr("fill", "#8D8F91")
        .attr("class", "key-text")
        .text("State Diversity Index")
        .attr("transform", "translate(" + (legendR*2.5 + 150) + ", " + (legendR*2.8) + ")" );
  }

  

};


mobile.calcExtent = function(array1, array2, key) {
  

  var min = d3.min([d3.min(array1, function(d) {
    return d[key];
  }), d3.min(array2, function(d) {
    return d[key];
  })]);


  var max = d3.max([d3.max(array1, function(d) {
    return d[key];
  }), d3.max(array2, function(d) {
    return d[key];
  })]);

  return [min, max];
};


mobile.lookup = function(array, key, value) {
  var result = _.find(array, function(entry) { return entry[key] == value; });
  

  return result;
};

mobile.createChartArray = function(dataEntry, strPrefix) {
  var result = [];

  for (var i = 0; i <11; i++) {
    var year = 1960 + (10 * i);
    var dataKey = strPrefix + year;
    var obj = {
      "year": year,
      "index": dataEntry[dataKey]
    };

    result.push(obj);
  }

  return result;
};

mobile.listen = function() {
  
  $(window).on("resize", function() {
    mobile.drawChart(mobile.currentFocus);
  });



};



$(document).ready(function() {

  var blnIframeEmbed = window != window.parent;

  if (blnIframeEmbed) {
    $("body").addClass("iFrame");
    $("#header").hide();
    $(".mobile-footer-link").hide();
    $(".mobile-company-info-box").hide();
  }

  // mobile.listen();
  // mobile.panelWrap.eq(0).hide();
});

// (function() {

  var searchApp = angular.module('dataSearch', [])
  .config( [
    '$compileProvider',
    function( $compileProvider )
    {   
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
    }
]);
  
  searchApp.controller('SearchController', function($http, $scope, $filter, $location) {
    
   

    $scope.companies = [];

    $http.get("js/incidents_by_airport.json").then(function(data) {
      mobile.data = data.data;
      $scope.data = data.data;
      window.setTimeout(function(){
        $(".preloader-mobile").eq(0).fadeOut(500);
      }, 1000);

      if ($location.path().length > 0) {
        var airport_code = $location.path().substr(1);

        var result = $filter("filter")($scope.data, {code: airport_code}, false);

        $scope.initial = result[0];
        $scope.setFocus(result[0]);
        $(".mobile-company-info-box").hide();
      }
    });



    this.blur = function() {
      $scope.filterTerm = "";
    };

    $scope.isDetailShow = false;

    $scope.setFocus = function(focusItem) {
      Analytics.click("Airport selected");
      // mobile.currentFocus = focusItem;
      // mobile.setPanelInfo(focusItem);
      $scope.setShare(focusItem);
      $location.path(focusItem.code);
      $scope.current = focusItem;
      $scope.chart($scope.current);
      $scope.isDetailShow = true;

      $scope.isFormOpen = false;

      
      
      //set the filter term to be the full company name of the company selected
      // $scope.filterTerm = company.name;
      $scope.filterTerm = "";



       jQuery(window).on("resetSearch", function() {
        $scope.filterTerm = "";
        
        mobile.searchCont.find("input").val("");
       });

      
    };

    $scope.showShare = function() {
      $(".panel-inner-wrap").addClass("blur");
      $(".share-page").addClass("show");  
    };

    $scope.hideShare = function() {
      $(".panel-inner-wrap").removeClass("blur");
      $(".share-page").removeClass("show");  
    };

    $scope.showInfo = function() {
      $(".panel-inner-wrap").addClass("blur");
      $(".info-page").addClass("show");  
    };

    $scope.hideInfo = function() {
      $(".panel-inner-wrap").removeClass("blur");
      $(".info-page").removeClass("show");  
    };

    this.clear = function() {
      $scope.filterTerm = "";
      mobile.setPanelInfo(null);
    };

    $scope.chart = function(current) {

      data = [current["01"], current["02"], current["03"], current["04"], current["05"], current["06"], current["07"], current["08"], current["09"], current["10"], current["11"], current["12"], current["13"], current["14"]];
        
        
      $el = $(".data-chart");
      $el.empty();

      var width = $(".mobile-wrap").width();


      var ratio = 16/9;
      var height = width / ratio;
      var padding = width * 0.1;

      var margin = {
        top: padding,
        left: padding,
        right: padding,
        bottom: padding + 30
      };

      var legendR = 5;

      var x = d3.scale.linear()
        .range([padding, width - padding]);

      var y = d3.scale.linear()
          .range([height - margin.bottom, padding]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function(d, i) {
          if (d < 10) {
            return "'0" + d;
          }
          else {
            return "'" + d;
          }
          
        })
        .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

      

      var line = d3.svg.line()
        .x(function(d, i) { return x(i + 1); })
        .y(function(d) { return y(d); });
      
      var svg = d3.select(".data-chart").append("svg")
          .attr("width", width)
          .attr("height", height);



      svg.append("rect")
          .attr("width", width)
          .attr("height", height)
          .attr("fill", " #E6E6E6");


      x.domain([1,14]);
      y.domain([0, 30]);

      // function for the x grid lines
      function make_x_axis() {
          return d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(5);
      }

      // function for the y grid lines
      function make_y_axis() {
        return d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);
      } 



     // Draw the y Grid lines
    svg.append("g")            
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(make_y_axis()
            .tickSize(-(width - (margin.left + margin.right)), 0, 0)
            .tickFormat("")
        );

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height - margin.bottom) + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + padding + ", 0)")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");

      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", "#1B9CFA");

      // svg.append("path")
      //     .datum(chartData2)
      //     .attr("class", "line")
      //     .attr("d", line)
      //     .style("stroke", "#8D8F91");

      // var indexState = chartData2[chartData2.length - 1].index;
      // var indexCounty = chartData[chartData.length - 1].index;



      // var tipHeight;
      // var tipSize;
      // var tipWidth;
      // if (mobile.blnSmallScrn) {
      //   tipHeight = 20;
      //   tipWidth = 26.66667;
      //   tipSize = 12;
      // }  

      // else {
      //   tipHeight = 30;
      //   tipWidth = 40;
      //   tipSize = 16;
      // }


      // var tip = svg.append("g")
      //   .attr("transform", function() {
      //       if (indexCounty > indexState) {
      //        return "translate(" + (width - margin.right - 15) + ", " + (y(indexState) + tipHeight) + ")";
      //       }
      //       else {
      //         return "translate(" + (width - margin.right - 15) + ", " + (y(indexState)-tipHeight/2) + ")";
      //       }
      //     });
      
      

      // tip.append("rect")
      //     .attr("width", tipWidth)
      //     .attr("height",  tipHeight)
      //     .attr("fill", "#8D8F91")
      //      .attr("x", (-tipWidth/4))
      //     .attr("y", (-tipHeight/1.5))
      //     .attr("rx", 8)
      //     .attr("ry", 8);

      // tip.append("text")
      //     .text(indexState)
      //     .attr("fill", "#FFFFFF")
      //     .attr("x", 0)
      //     .attr("y", 0)
      //     .attr("font-size", tipSize);
      

      // var tip2 = svg.append("g")
          
      //     .attr("transform", function() {
      //       if (indexCounty > indexState) {
      //         return "translate(" + (width - margin.right - 15) + ", " + (y(indexCounty)-tipHeight/2) + ")";
      //       }
      //       else {
      //         return "translate(" + (width - margin.right - 15) + ", " + (y(indexCounty) + tipHeight) + ")";
      //       }
      //     });

      // tip2.append("rect")
      //     .attr("width", tipWidth)
      //     .attr("height",  tipHeight)
      //     .attr("fill", "#1B9CFA")
      //     .attr("x", (-tipWidth/4))
      //     .attr("y", (-tipHeight/1.5))
      //     .attr("rx", 8)
      //     .attr("ry", 8);

      // tip2.append("text")
      //     .text(indexCounty)
      //     .attr("fill", "#FFFFFF")
      //     .attr("x", 0)
      //     .attr("y", 0)
      //     .attr("font-size", tipSize);
          


      // var legend = svg.append("g")
      //     .attr("class", "legend")
      //     .attr("transform", "translate(" + padding + "," +  (height - margin.bottom/2) + ")");

      // legend.append("circle")
      //     .attr("r", legendR)
      //     .attr("cx", 0)
      //     .attr("cy", 10)
      //     .attr("fill", "#1B9CFA");

      // legend.append("text")
      //     .attr("fill", "#1B9CFA")
      //     .attr("class", "key-text")
      //     .text("County Diversity Index")
      //     .attr("transform", "translate(" + (legendR*2.5 ) + ", " + (legendR*2.8) + ")" );

      // legend.append("circle")
      //     .attr("r", legendR)
      //     .attr("cx", 150)
      //     .attr("cy", 10)
      //     .attr("fill", "#8D8F91");

      // legend.append("text")
      //     .attr("fill", "#8D8F91")
      //     .attr("class", "key-text")
      //     .text("State Diversity Index")
      //     .attr("transform", "translate(" + (legendR*2.5 + 150) + ", " + (legendR*2.8) + ")" );
      };
      
    $(window).on("resize", function(e) {
      if ($scope.isDetailShow === true) {
        $scope.chart($scope.current);
      }

    });
    
    

    this.mobileSearch = function() {
      // Analytics.click("Typed in search box");
      // mobile.panelWrap.eq(0).hide();
      $scope.isDetailShow = false;

      // var numberResults = $(".list-group-item").length;

      $scope.filteredArray = $filter("filter")($scope.data, {$: $scope.filterTerm}, false);
      
      if ($scope.filteredArray.length === 0) {
        $(".mobile-company-info-box").show();
      }

      else {
        $(".mobile-company-info-box").hide();
      }

      if ($scope.filterTerm !== "") {
        mobile.currentFocus = null;
        $scope.isFormOpen = true;
      }
      else {
        $scope.isFormOpen = false;
        $(".mobile-company-info-box").show();
      }
    };

    $scope.setShare = function(airportObj) {
      var copy,
          encodedURL,
          encodedURL2,
          encodedStr;

      var encodedBaseURL = encodeURIComponent("http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/");

      if (airportObj) {
        copy = airportObj.code + " has experienced " + airportObj.tot + " collision hazard incidents on its runways over the last 12 years. Read more:";
        encodedURL = encodeURIComponent("http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/" + "#/" + airportObj.code);
        encodedURL2 = encodeURI("http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/");
        encodedStr = encodeURIComponent(copy);
      }

      else {
        encodedURL = encodeURIComponent("http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/");
        encodedURL2 = encodeURI("http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/" + "#/" + airportObj.code);
        encodedStr = encodeURIComponent(copy);
      }
           
      var encodedTitle = encodeURIComponent("Hazards on the runway");
      var fbRedirectUrl = encodeURIComponent("http://www.gannett-cdn.com/usatoday/_common/_dialogs/fb-share-done.html");

      var tweetUrl = "https://twitter.com/intent/tweet?url=" + encodedURL + "&text=" + encodedStr + ""; 

      var fbUrl = "javascript: var sTop=window.screen.height/2-(218);var sLeft=window.screen.width/2-(313);window.open('https://www.facebook.com/dialog/feed?display=popup&app_id=215046668549694&link=" + encodedURL2 + "&picture=http://www.gannett-cdn.com/experiments/usatoday/2014/11/airport-interactive/img/fb-post.jpg&name=" + encodedTitle +"&description="+ copy + "&redirect_uri=http://www.gannett-cdn.com/experiments/usatoday/_common/_dialogs/fb-share-done.html','sharer','toolbar=0,status=0,width=580,height=400,top='+sTop+',left='+sLeft);Analytics.click('Facebook share');void(0);";


      var emailURL = "mailto:?body=" + encodedStr +  "%0d%0d" + encodedURL +"&subject=" + encodedTitle;

      $scope.share = {
        copy: copy,
        tweetUrl: tweetUrl,
        fbUrl: fbUrl,
        emailURL: emailURL
      };
    };



  });


// })();

