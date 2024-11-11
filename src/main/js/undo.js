// This is the Vuex store module provided by your plugin.
// This file exports a Vuex store module object or a function which returns such an object.
// The function receives a "dependencies" object with 3 properties: 'dmx', 'axios', and 'Vue'.
export default ({dmx, axios, Vue}) => ({

  state: {
    topicPositions: JSON.parse(localStorage.getItem('topicPositions')) || {},
    topicMapId: localStorage.getItem('topicMapId') || null,
    moveHistory: JSON.parse(localStorage.getItem('moveHistory')) || []
  },

  actions: {
    /**
     * Tracks the initial positions of topics in a topic map.
     *
     * @param {Object} state - The Vuex state object.
     * @param {Object} params - The parameters containing the topic map ID and topics.
     * @param {number} params.topicMapId - The ID of the topic map.
     * @param {Array} params.topics - The array of topics with their initial positions.
     */
    trackInitialPositions ({state}, {topicMapId, topics}) {
      state.topicMapId = topicMapId;
      localStorage.setItem('topicMapId', topicMapId);
      topics.forEach(topic => {
        state.topicPositions[topic.id] = {
          x: topic.viewProps['dmx.topicmaps.x'],
          y: topic.viewProps['dmx.topicmaps.y']
        };
      });
      localStorage.setItem('topicPositions', JSON.stringify(state.topicPositions));
      console.log('Initial topic positions:', state.topicPositions);
    },

    /**
     * Tracks the new position of a moved topic.
     *
     * @param {Object} state - The Vuex state object.
     * @param {Object} params - The parameters containing the topic ID and new position.
     * @param {number} params.topicId - The ID of the moved topic.
     * @param {number} params.newX - The new X position of the topic.
     * @param {number} params.newY - The new Y position of the topic.
     */
    trackNewPosition ({state}, {topicId, newX, newY}) {
      if (state.topicPositions[topicId]) {
        state.topicPositions[topicId].newX = newX;
        state.topicPositions[topicId].newY = newY;
      } else {
        state.topicPositions[topicId] = { newX, newY };
      }
      state.moveHistory.push({ topicId, newX, newY });
      localStorage.setItem('moveHistory', JSON.stringify(state.moveHistory));
      localStorage.setItem('topicPositions', JSON.stringify(state.topicPositions));
      console.log('Updated topic positions:', state.topicPositions);
      console.log('Move history:', state.moveHistory);
    },

    /**
     * Undoes the last move by reverting the topic to its previous position.
     *
     * @param {Object} state - The Vuex state object.
     */
    undoLastMove ({state}) {
      if (state.moveHistory.length === 0) {
        console.log('No moves to undo.');
        return;
      }

      const lastMove = state.moveHistory.pop();
      localStorage.setItem('moveHistory', JSON.stringify(state.moveHistory));
      const { topicId, newX, newY } = lastMove;
      const pos = state.topicPositions[topicId];
      const topicMapId = state.topicMapId;

      if (pos && pos.x !== undefined && pos.y !== undefined) {
        const url = `/topicmaps/${topicMapId}/topic/${topicId}/x/${pos.x}/y/${pos.y}`;
        axios.put(url).then(response => {
          console.log(`Undo move for topic ${topicId}:`, response.data);
          // Update the state to reflect the undo operation
          state.topicPositions[topicId].newX = pos.x;
          state.topicPositions[topicId].newY = pos.y;
          localStorage.setItem('topicPositions', JSON.stringify(state.topicPositions));
          console.log('Updated topic positions after undo:', state.topicPositions);
        }).catch(error => {
          console.error(`Error undoing move for topic ${topicId}:`, error);
        });
      }
    }
  }
});