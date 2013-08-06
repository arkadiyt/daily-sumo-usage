(function() {
  "use strict";

  var displayUsages = function(usages) {
    for (var i = 0; i < usages.length; ++i) {
      usages[i] = (usages[i] / 1024.0).toFixed(2);
    }

    var max = Math.max.apply(Math, usages);

    var graph_data = {
      cht: 'lc',
      chxt: 'x,y',
      chs: '700x300',
      chd: 't:' + usages.join(','),
      chxl: '0:|',
      chxr: [1, 0, max].join(','),
      chds: [0, max].join(',')
    };

    // TODO find event that lets me remove setInterval
    var interval = setInterval(function() {
      var $container = $('.account-section-container');
      if ($container.length === 0) {
        return;
      }

      clearInterval(interval);

      // Get start of billing period
      var billing_regex = /Your current billing period is: (.+) - (.+)/,
          billing_period_text = $('#subscription-details-container ul').last().text(),
          billing_start = billing_regex.exec(billing_period_text)[1],
          date = new Date(billing_start);

      // Build table html
      var table = ['<div class="account-section-header">Daily Usage</div>',
        '<div class="account-section-container"><table class="usage">'];
      var axes = [];
      for (var i = 0; i < usages.length; ++i) {
        var date_string = (date.getMonth() + 1) + '/' + date.getDate();
        axes.push(date.getDate());
        date.setDate(date.getDate() + 1);
        table.push('<tr><td>', date_string, '</td><td>', usages[i], ' GB</td></tr>');
      }
      graph_data.chxl += axes.join('|');

      // Build graph url
      var graph_url = 'http://chart.googleapis.com/chart?';
      for (var key in graph_data) {
        graph_url += [key, '=', graph_data[key], '&'].join('');
      }

      // Add html to page
      table.push('</table></div>');
      table = ['<div class="account-section-header">Daily Usage Graph</div>',
        '<div class="account-section-container">',
        '<img src="', graph_url, '"></img></div>'
      ].join('') + table.join('');

      $container.after(table);
      $('.management-view').css('position', 'relative');
    }, 250);
  };

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
