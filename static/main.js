/**
 * Created by lander on 06/04/16.
 * PS: I know nothing about JS; this is mainly copy-pasted code.
 */
var fuzzy = false;
var proxy = Cookies.get("proxy") == 'true' || Cookies.get("proxy") == null;
var StartedSearch = new Date();
var MinLoadTime = 1500;
var PROXY_ADDRESS = "http://proxy.zeroexpose.com/";

!function (e) {
    e.fn.extend({
        iosCheckbox: function () {
            "true" !== e(this).attr("data-ios-checkbox") && (e(this).attr("data-ios-checkbox", "true"), e(this).each(function () {
                var c = e(this), s = jQuery("<div>", {"class": "ios-ui-select"}).append(jQuery("<div>", {"class": "inner"}));
                c.is(":checked") && s.addClass("checked"), c.hide().after(s), s.click(function () {
                    s.toggleClass("checked"), s.hasClass("checked") ? c.prop("checked", !0) : c.prop("checked", !1);
                    var source = s.prev().attr("id");
                    if (source == "proxy-checkbox"){
                        proxy = s.hasClass("checked");
                        Cookies.set("proxy", proxy);
                        UpdateProxy();
                    }else if (source == "fuzzy-checkbox"){
                        fuzzy = s.hasClass("checked");
                        UpdateFuzzy();
                    }
                })
            }))
        }
    })
}(jQuery);

$("#fuzzy-checkbox").iosCheckbox();
$("#proxy-checkbox").iosCheckbox();

var query = "";
$(document).ready(function() {

    UpdateTimes();
    $("#search-form").on('submit', TriggerSearch);
    $("#search-button").on('click', TriggerSearch);
    
    //Check to see if the window is top if not then display button
	$(window).scroll(function(){
		if ($(this).scrollTop() > 100) {
			$('.scrollToTop').fadeIn();
		} else {
			$('.scrollToTop').fadeOut();
		}
	});
	
	//Click event to scroll to top
	$('.scrollToTop').click(function(){
		$('html, body').animate({scrollTop : 0},500);
		return false;
	});
});

function StartSearch() {
    StartedSearch = new Date();
    $("#search-form").addClass("loading");
    $("#search-button").text("Searching...");
}

function EndSearch() {
    UpdateProxy();
    var Now = new Date();
    var TimeDiff = Now.getTime()-StartedSearch.getTime();
    console.log(TimeDiff, Now, StartedSearch);
    if (TimeDiff > MinLoadTime){
        $("#search-form").removeClass("loading");
        $("#search-button").text("Search");
    }
    else
    {
        setTimeout(EndSearch, MinLoadTime-TimeDiff);
    }
    /*$("html, body").delay(200).animate({ scrollTop: $('#results').offset().top-26 }, 500);*/
}

function TriggerSearch(e) {
    StartSearch();
    Search();
    return false;
}
function SetUrl(url) {
    ga('send', 'pageview', url);
    history.replaceState({}, "", url);
}
function Search() {
    query = $("#search-input").val();
    ga('send', 'event', 'Search', query);
    if (fuzzy) var url = "/f/"; else var url = "/s/"; 
        url = url+encodeURIComponent(query).replace('%20', '+');
    Load(url);

}
function Load(url){
    SetUrl(url);
    $.ajax({url: host+url, success: function(result){
        $("#results").html($('<div></div>').append(result).find('#results').html());
        EndSearch();
        UpdateTimes();
    },
        error:EndSearch
    
    });
}
function UpdateTimes() {
    $( ".timestamp" ).each(function(  ) {
        $(this).text(FormatTime(parseFloat($(this).text())));
});
}

function DateA(timestamp, format) {
  var display, parts;
  if (format == null) {
    format = "short";
  }
  if (timestamp > 1000000000000) {
    timestamp = timestamp / 1000;
  }
  parts = (new Date(timestamp * 1000)).toString().split(" ");
  if (format === "short") {
    display = parts.slice(1, 4);
  } else {
    display = parts.slice(1, 5);
  }
  return display.join(" ").replace(/( [0-9]{4})/, ",$1");
}

function FormatTime(timestamp) {
  var back, now, secs;
  now = +(new Date) / 1000;
  if (timestamp > 1000000000000) {
    timestamp = timestamp / 1000;
  }
  secs = now - timestamp;
  if (secs < 60) {
    back = "Just now";
  } else if (secs < 60 * 60) {
    back = (Math.round(secs / 60)) + " minutes ago";
  } else if (secs < 60 * 60 * 24) {
    back = (Math.round(secs / 60 / 60)) + " hours ago";
  } else if (secs < 60 * 60 * 24 * 3) {
    back = (Math.round(secs / 60 / 60 / 24)) + " days ago";
  } else {
    back = "on " + DateA(timestamp);
  }
  back = back.replace(/1 ([a-z]+)s/, "1 $1");
  return back;
}

function UpdateFuzzy() {
    var loc = window.location.pathname;
    if (fuzzy) loc = loc.replace("/s/", "/f/"); else loc = loc.replace("/f/", "/s/");
    StartSearch();
    Load(loc);
}
function UpdateProxy() {
    $( ".link" ).each(function() {
        if (proxy){
            $(this).attr("href",
                $(this).attr("href").replace("http://127.0.0.1:43110/", PROXY_ADDRESS)
            );
        } else {
            $(this).attr("href",
                $(this).attr("href").replace(PROXY_ADDRESS, "http://127.0.0.1:43110/")
            );
        }
    });
}
UpdateProxy();

