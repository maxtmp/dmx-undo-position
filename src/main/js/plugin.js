export default ({store, dmx, axios, Vue}) => {
  // Intercept all XHR requests
  (function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
      this.addEventListener('readystatechange', function() {
        if (this.readyState === 4) { // 4 means the request is done
          console.log(`XHR finished loading: ${method} "${url}"`);
          handleApiRequest(method, url, this.responseText);
        }
      }, false);
      open.call(this, method, url, async, user, pass);
    };
  })(XMLHttpRequest.prototype.open);

  /**
   * Function to handle API requests.
   * Logs the API response and dispatches actions to track initial and new positions of topics.
   */
  function handleApiRequest(method, url, response) {
    console.log('API response:', response);

    // Handle GET requests to /topicmaps/ to track initial positions of topics
    if (method === 'GET' && url.includes('/topicmaps/')) {
      const jsonResponse = JSON.parse(response);
      if (jsonResponse.topics) {
        const topicMapId = jsonResponse.topic.id;
        store.dispatch('trackInitialPositions', { topicMapId, topics: jsonResponse.topics });
      }
    }

    // Handle PUT requests to /topicmaps/ to track new positions of topics
    if (method === 'PUT' && url.includes('/topicmaps/')) {
      const matches = url.match(/\/topicmaps\/(\d+)\/topic\/(\d+)\/x\/(\d+)\/y\/(\d+)/);
      if (matches) {
        const topicId = parseInt(matches[2]);
        const newX = parseInt(matches[3]);
        const newY = parseInt(matches[4]);
        store.dispatch('trackNewPosition', { topicId, newX, newY });
      }
    }
  }

  return {
    storeModule: {
      name: 'undo',
      module: require('./undo').default
    },
    components: [{
      comp: require('./components/Undo').default,
      mount: 'toolbar-left'
    }]
  };
};