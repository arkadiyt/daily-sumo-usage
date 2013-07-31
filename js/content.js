(function() {
  "use strict";

  var displayUsages = function(usages) {
    var graph_url = 'http://chart.googleapis.com/chart?cht=lc&chxt=x,y&chs=700x300&chd=t:'
    
    for (var i = 0; i < usages.length; ++i) {
      usages[i] = (usages[i] / 1024.0).toFixed(2);
    }
    graph_url += usages.join(',');
    
    var interval = setInterval(function() {
      var $container = $('.account-section-container');
      if (!$container.length) {
        return;
      }

      clearInterval(interval);

      var billing_regex = /Your current billing period is: (.+) - (.+)/
      var billing_period_text = $('#subscription-details-container ul').last().text();
      var billing_start = billing_regex.exec(billing_period_text)[1];
      var date = new Date(billing_start);

      graph_url += '&chxl=0:'
      var table = ['<div class="account-section-header">Daily Usage</div><div class="account-section-container"><table>'];
      for (var i = 0; i < usages.length; ++i) {
        var date_string = (date.getMonth() + 1) + '/' + date.getDate();
        graph_url += '|' + date.getDate();
        table.push('<tr><td>', date_string, '</td><td>', usages[i], ' GB</td></tr>');
        date.setDate(date.getDate() + 1);
      }
      var max = Math.max.apply(Math, usages);      
      graph_url += '|1:|0|' + (max / 2).toFixed(0) + '|' + max.toFixed(0)

      console.log(graph_url);

      table.push('</table></div>');
      table = ['<div class="account-section-header">Daily Usage Graph</div><div class="account-section-container">',
        '<img src="',
        graph_url,
        '"></img></div></div>'
      ].join('') + table.join('');

      $container.after(table);
    }, 250);
  }

  chrome.runtime.onMessage.addListener(function(api_session, sender, sendResponse) {
    $.ajax('/json/v1/account/subscriptionAndBillingUsages?periods=0', {
      complete: function(jqXHR, textStatus) {
        var usages = jqXHR.responseJSON.billingUsages.usages[0].usages;
        displayUsages(usages);
      },
      headers: {
        'ApiSession': api_session
      }
    });
  });
})();
