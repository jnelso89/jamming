import React from "react";
import SearchBar from "./../SearchBar/SearchBar.js";
import SearchResults from "./../SearchResults/SearchResults.js";
import Playlist from "./../Playlist/Playlist.js";
import Spotify from "./../../util/Spotify.js";
import "./App.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: null,
      playlistTracks: []
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
  }

  addTrack(track) {
    var shouldIAddThisTrack = true;
    this.state.playlistTracks.forEach(function(song) {
      if (track.id === song.id) {
        shouldIAddThisTrack = false;
      }
    });
    if (shouldIAddThisTrack){
      this.state.playlistTracks.push(track);
      this.setState({playlistTracks: this.state.playlistTracks});
    }
  }

  removeTrack(track) {
    let newName = this.state.playlistTracks.filter((song,i) => track.id !== song.id);
    this.setState({playlistTracks: newName});
  }

  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }


  savePlaylist(track) {
    let trackURIs = [];
    this.state.playlistTracks.forEach(function(song) {
        trackURIs.push(song.uri);
      }
    );
    Spotify.savePlaylist(this.state.playlistName, trackURIs);
    this.updatePlaylistName(null);
    this.setState({searchResults: []});
  }

  search(searchTerm) {
    console.log({searchTerm});

    let resultPromise = Spotify.search(searchTerm);
    resultPromise.then(value => {
      console.log(value);
      if (value !== undefined) {
        this.setState({searchResults: value});
      }
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist playlistName={this.state.playlistName} playlistTracks={this.state.playlistTracks} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
