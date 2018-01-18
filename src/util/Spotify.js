
const clientId = "c5c8408d6482408cbae15ec0ab1d42fd";
const redirectUri = "http://localhost:3000/";
let token = null;

let Spotify = {
  getAccessToken() {
    if (token !== null) {
      return token;
    } else {
      if (window.location.href.match(/access_token=([^&]*)/) && window.location.href.match(/expires_in=([^&]*)/)) {
        token = window.location.href.match(/access_token=([^&]*)/)[1];
        let expiration = window.location.href.match(/expires_in=([^&]*)/)[1];
        window.setTimeout(() => token = '', expiration * 1000);
        window.history.pushState('Access Token', null, '/');
        return token;
      } else {
        window.location = "https://accounts.spotify.com/authorize?client_id=" + clientId + "&response_type=token&scope=playlist-modify-public&redirect_uri=" + redirectUri;
      }
    }
  },

  search(searchTerm) {
    const currentToken = Spotify.getAccessToken();

    return fetch('https://api.spotify.com/v1/search?type=track&q=' + searchTerm,
    {headers: {Authorization: 'Bearer ' + currentToken}}).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error ("Request Failed");
    }, networkError => {console.log(networkError)}
    ).then(jsonResponse => {
       return jsonResponse.tracks.items.map(track => {
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0].name,
          album: track.album.name,
          uri: track.uri
        }
      });
    });
  },

  savePlaylist(playlistName, trackURIs) {
    if (playlistName == null || trackURIs === []) {
      return ;
    }

    let accessToken = Spotify.getAccessToken();
    let headers = {Authorization: 'Bearer ' + accessToken};
    let userId = null;

    fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error ("Request Failed");
    }, networkError => {console.log(networkError)}
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      return jsonResponse.display_name;
    }).then(displayName => {
      fetch('https://api.spotify.com/v1/users/' + userId + '/playlists', {
        method: 'POST',
        headers: {'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'},
        body: JSON.stringify({"name": playlistName})}).then(response => {
          if (response.ok){
            return response.json();
          }
          throw new Error ("Request Failed");
        }, networkError => {console.log(networkError)}
      ).then(jsonResponse =>{
        const playlistID = jsonResponse.id;
        return playlistID;
      }).then(pID => {
        fetch('https://api.spotify.com/v1/users/'+userId+'/playlists/'+pID+'/tracks', {
          method: 'POST',
          headers: {'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'},
          body: JSON.stringify({"uris": trackURIs})}).then(response => {
            if (response.ok){
              return response.json();
            }
            throw new Error ("Request Failed");
          }, networkError => {console.log(networkError)}
        ).then(jsonResponse =>{
          console.log(jsonResponse);
        });
      });
    });
  }
}

export default Spotify;
